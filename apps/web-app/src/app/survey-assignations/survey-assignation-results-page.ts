import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import SurveyResultsChartComponent from '../shared/survey-results-chart/survey-results-chart';
import { SURVEY_ASSIGNATION_FILL_RESULTS_QUERY } from './graphql/survey-assignations.graphql';
import {
  buildParticipantReportData,
  buildSummaryReportData,
  formatScore,
  participantLabel,
  type ResultsData,
} from './survey-results-report.utils';
import { SurveyResultsPdfService } from './survey-results-pdf.service';
import {
  categoryTotals,
  collectCategoryAxes,
  mapTotalsToAxes,
  type ResultsChartSeries,
  type ResultsChartType,
} from './survey-results-chart.utils';

type ChartTypeSelection = 'none' | ResultsChartType;

@Component({
  selector: 'app-survey-assignation-results-page',
  standalone: true,
  imports: [RouterLink, SurveyResultsChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex items-center gap-4">
          <a
            [routerLink]="[
              '/dashboard/surveys',
              surveyId(),
              'assignations',
              id(),
            ]"
            class="text-slate-500 hover:text-slate-700"
          >
            <span class="material-symbols-outlined">arrow_back</span>
          </a>
          <div>
            <h2 class="text-2xl font-bold text-slate-900">Survey Results</h2>
            <p class="mt-1 text-slate-500">
              {{ completedCount() }} submission{{
                completedCount() === 1 ? '' : 's'
              }}
            </p>
          </div>
        </div>

        @if (completedCount() > 0 && !loading() && !error()) {
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            [disabled]="exportingPdf()"
            (click)="downloadPdf()"
          >
            <span class="material-symbols-outlined text-[20px]" aria-hidden="true"
              >picture_as_pdf</span
            >
            {{
              exportingPdf()
                ? 'Generating PDF...'
                : selectedFill()
                  ? 'Download participant PDF'
                  : 'Download summary PDF'
            }}
          </button>
        }
      </div>

      @if (loading()) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
        >
          Loading results...
        </div>
      } @else if (error()) {
        <div
          class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
        >
          <p class="font-medium">Failed to load results</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (completedCount() === 0) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-12 text-center"
        >
          <span class="material-symbols-outlined text-4xl text-slate-300"
            >assignment</span
          >
          <p class="mt-4 text-slate-600">No submissions yet</p>
          <p class="mt-1 text-sm text-slate-500">
            Results will appear here once invitees complete the survey.
          </p>
        </div>
      } @else {
        <div class="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <label
              for="invitee-select"
              class="block text-sm font-medium text-slate-700 mb-2"
            >
              Select invitee
            </label>
            <select
              id="invitee-select"
              class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              [value]="selectedInviteeId() ?? ''"
              (change)="onInviteeChange($event)"
            >
              <option value="">— Choose an invitee —</option>
              @for (fill of resultsData()!.fills; track fill.inviteeId) {
                <option [value]="fill.inviteeId">
                  {{
                    fill.inviteeName
                      ? fill.inviteeName + ' (' + fill.inviteeEmail + ')'
                      : fill.inviteeEmail
                  }}
                  · {{ formatDate(fill.submittedAt) }}
                </option>
              }
            </select>
          </div>

          @if (canShowChartControls()) {
            <div>
              <label
                for="chart-type-select"
                class="block text-sm font-medium text-slate-700 mb-2"
              >
                Chart type
              </label>
              <select
                id="chart-type-select"
                class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                [value]="selectedChartType()"
                (change)="onChartTypeChange($event)"
              >
                <option value="none">None</option>
                <option value="radar" [disabled]="!canSelectRadar()">
                  Radar
                </option>
                <option value="bar" [disabled]="!canSelectBar()">Bar</option>
              </select>
            </div>
          }
        </div>

        @if (showChartPanel()) {
          <div class="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div
              class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 class="text-lg font-semibold text-slate-900">
                  Category breakdown
                </h3>
                <p class="mt-1 text-sm text-slate-500">
                  Sum of selected answer values per
                  {{ categoryLabel().toLowerCase() }}
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-4">
                <label
                  class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    [checked]="compareToAverage()"
                    (change)="onCompareToggle($event)"
                  />
                  Compare to group average
                </label>
              </div>
            </div>

            <app-survey-results-chart
              [chartType]="activeChartType()"
              [axes]="chartAxes()"
              [series]="chartSeries()"
            />
          </div>
        }

        @if (selectedFill(); as fill) {
          <div class="space-y-1 text-sm text-slate-500 px-1">
            Submitted:
            <span class="font-medium text-slate-700">{{
              formatDateTime(fill.submittedAt)
            }}</span>
          </div>

          @if (groupedResults().length === 0) {
            <div
              class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
            >
              No answers recorded for this submission.
            </div>
          } @else {
            <div class="space-y-4">
              @for (group of groupedResults(); track group.id) {
                <div
                  class="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div class="border-b border-slate-200 bg-slate-50 px-6 py-3">
                    <h3 class="font-semibold text-slate-900">
                      @if (hasCategories()) {
                        <span
                          class="mr-2 inline-flex items-center rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
                        >
                          {{ categoryLabel() }}
                        </span>
                      }
                      {{ group.title }}
                    </h3>
                    @if (group.categoryTotal !== undefined && group.categoryTotal !== null) {
                      <p class="mt-1 text-sm text-slate-600">
                        Total:
                        <span class="font-medium">{{
                          group.categoryTotal
                        }}</span>
                      </p>
                    }
                    @if (group.categoryMessage; as msg) {
                      <div
                        class="mt-2 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900"
                      >
                        @if (msg.label) {
                          <p class="font-semibold">{{ msg.label }}</p>
                        }
                        <p [class.mt-1]="!!msg.label">{{ msg.message }}</p>
                      </div>
                    }
                  </div>

                  @for (sub of group.subdimensions; track sub.dimensionId) {
                    <div
                      class="px-6 py-4 space-y-3 border-b border-slate-100 last:border-b-0"
                    >
                      @if (hasCategories()) {
                        <h4 class="text-sm font-semibold text-slate-700">
                          {{ sub.dimensionTitle }}
                        </h4>
                      }

                      @if (sub.mainAnswer) {
                        <div
                          class="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
                        >
                          <span class="text-sm text-slate-600"
                            >Main question</span
                          >
                          <span class="text-sm font-medium text-slate-900">
                            {{ sub.mainAnswer.text }}
                            <span class="ml-1 text-xs text-slate-400"
                              >({{ sub.mainAnswer.value }})</span
                            >
                          </span>
                        </div>
                      }

                      @if (sub.questions.length > 0) {
                        <div
                          class="divide-y divide-slate-100 rounded-lg border border-slate-200"
                        >
                          @for (
                            qa of sub.questions;
                            track qa.dimensionQuestionId
                          ) {
                            <div class="px-4 py-3">
                              <p class="mb-2 text-sm text-slate-700">
                                {{ qa.questionText }}
                              </p>
                              <div class="flex flex-wrap gap-1.5">
                                @for (ans of qa.answers; track ans.id) {
                                  <span
                                    class="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
                                  >
                                    {{ ans.text }}
                                    <span class="ml-1 text-indigo-400"
                                      >({{ ans.value }})</span
                                    >
                                  </span>
                                }
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        } @else {
          <div class="space-y-4">
            <div class="px-1">
              <h3 class="text-lg font-semibold text-slate-900">Summary</h3>
              <p class="mt-1 text-sm text-slate-500">
                Score totals per {{ categoryLabel().toLowerCase() }}. Click a
                row to view detailed results.
              </p>
            </div>

            @if (summaryColumns().length === 0) {
              <div
                class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
              >
                No category scores available.
              </div>
            } @else {
              <div
                class="overflow-x-auto rounded-xl border border-slate-200 bg-white"
              >
                <table class="min-w-full divide-y divide-slate-200">
                  <thead class="bg-slate-50">
                    <tr>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                      >
                        Participant
                      </th>
                      @for (col of summaryColumns(); track col.id) {
                        <th
                          class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500"
                        >
                          {{ col.title }}
                        </th>
                      }
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 bg-white">
                    @for (row of summaryRows(); track row.inviteeId) {
                      <tr
                        class="cursor-pointer hover:bg-slate-50"
                        (click)="selectInvitee(row.inviteeId)"
                      >
                        <td class="whitespace-nowrap px-6 py-4">
                          <p class="text-sm font-medium text-slate-900">
                            {{ row.displayName }}
                          </p>
                          @if (row.hasName) {
                            <p class="text-xs text-slate-500">{{ row.email }}</p>
                          }
                        </td>
                        @for (score of row.scores; track $index) {
                          <td
                            class="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-700"
                          >
                            {{ formatScore(score) }}
                          </td>
                        }
                      </tr>
                    }
                  </tbody>
                  @if (summaryAverages(); as averages) {
                    <tfoot class="bg-slate-50">
                      <tr>
                        <td
                          class="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900"
                        >
                          Group average
                        </td>
                        @for (avg of averages; track $index) {
                          <td
                            class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-900"
                          >
                            {{ formatScore(avg) }}
                          </td>
                        }
                      </tr>
                    </tfoot>
                  }
                </table>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class SurveyAssignationResultsPageComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);
  private readonly pdfService = inject(SurveyResultsPdfService);
  private readonly chartComponent = viewChild(SurveyResultsChartComponent);

  readonly surveyId = input.required<string>();
  readonly id = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly resultsData = signal<ResultsData | null>(null);
  protected readonly selectedInviteeId = signal<string | null>(null);
  protected readonly compareToAverage = signal(true);
  protected readonly selectedChartType = signal<ChartTypeSelection>('none');
  protected readonly exportingPdf = signal(false);

  protected readonly completedCount = computed(
    () => this.resultsData()?.fills.length ?? 0,
  );

  protected readonly hasCategories = computed(
    () => this.resultsData()?.hasCategories ?? false,
  );

  protected readonly categoryLabel = computed(
    () => this.resultsData()?.categoryName ?? 'Category',
  );

  protected readonly selectedFill = computed(() => {
    const inviteeId = this.selectedInviteeId();
    if (!inviteeId) return null;
    return (
      this.resultsData()?.fills.find((f) => f.inviteeId === inviteeId) ?? null
    );
  });

  protected readonly chartCategoryAxes = computed(() => {
    const data = this.resultsData();
    if (!data) return { ids: [] as string[], titles: [] as string[] };
    return collectCategoryAxes(data.fills, this.hasCategories());
  });

  protected readonly chartAxes = computed(
    () => this.chartCategoryAxes().titles,
  );

  protected readonly summaryReport = computed(() => {
    const data = this.resultsData();
    if (!data) return null;
    return buildSummaryReportData(data);
  });

  protected readonly summaryColumns = computed(
    () => this.summaryReport()?.columns ?? [],
  );

  protected readonly summaryRows = computed(
    () => this.summaryReport()?.rows ?? [],
  );

  protected readonly summaryAverages = computed(
    () => this.summaryReport()?.averages ?? null,
  );

  protected readonly averageSeries = computed((): ResultsChartSeries | null => {
    const averages = this.summaryAverages();
    if (!averages) return null;
    return {
      label: 'Group average',
      color: '#d97706',
      values: averages,
    };
  });

  protected readonly selectedSeries = computed((): ResultsChartSeries | null => {
    const fill = this.selectedFill();
    const axisIds = this.chartCategoryAxes().ids;
    if (!fill || axisIds.length === 0) return null;

    const totals = categoryTotals(fill, this.hasCategories());
    const label = participantLabel(fill);

    return {
      label,
      color: '#4f46e5',
      values: mapTotalsToAxes(totals, axisIds),
    };
  });

  protected readonly chartSeries = computed((): ResultsChartSeries[] => {
    const series: ResultsChartSeries[] = [];
    const selected = this.selectedSeries();
    const average = this.averageSeries();

    if (selected) {
      series.push(selected);
    }
    if (this.compareToAverage() && average) {
      series.push(average);
    }

    return series;
  });

  protected readonly canShowChartControls = computed(
    () => this.chartAxes().length > 0,
  );

  protected readonly canSelectRadar = computed(
    () => this.chartAxes().length >= 3,
  );

  protected readonly canSelectBar = computed(
    () => this.chartAxes().length > 0,
  );

  protected readonly showChartPanel = computed(
    () => this.selectedChartType() !== 'none',
  );

  protected readonly activeChartType = computed((): ResultsChartType => {
    const type = this.selectedChartType();
    return type === 'none' ? 'bar' : type;
  });

  protected readonly groupedResults = computed(() => {
    const data = this.resultsData();
    const fill = this.selectedFill();
    if (!data || !fill) return [];
    return buildParticipantReportData(data, fill).groups;
  });

  constructor() {
    effect(() => {
      const assignationId = this.id();
      if (assignationId) this.loadResults(assignationId);
    });
  }

  private loadResults(assignationId: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.apollo
      .query<{ surveyAssignationFillResults: ResultsData }>({
        query: SURVEY_ASSIGNATION_FILL_RESULTS_QUERY,
        variables: { id: assignationId },
        fetchPolicy: 'network-only',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          this.resultsData.set(
            result.data?.surveyAssignationFillResults ?? null,
          );
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message ?? 'Failed to load results');
        },
      });
  }

  protected selectInvitee(inviteeId: string): void {
    this.selectedInviteeId.set(inviteeId);
  }

  protected onInviteeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedInviteeId.set(value || null);
  }

  protected onCompareToggle(event: Event): void {
    this.compareToAverage.set((event.target as HTMLInputElement).checked);
  }

  protected onChartTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ChartTypeSelection;
    if (value === 'radar' && !this.canSelectRadar()) {
      this.selectedChartType.set('none');
      return;
    }
    if (value === 'bar' && !this.canSelectBar()) {
      this.selectedChartType.set('none');
      return;
    }
    this.selectedChartType.set(value);
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }

  protected formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString();
  }

  protected formatScore = formatScore;

  protected async downloadPdf(): Promise<void> {
    const data = this.resultsData();
    if (!data || this.exportingPdf()) return;

    this.exportingPdf.set(true);
    try {
      const fill = this.selectedFill();
      if (fill) {
        const chartImage =
          this.showChartPanel() && this.selectedFill()
            ? (this.chartComponent()?.exportChartImage() ?? null)
            : null;
        await this.pdfService.downloadParticipantPdf(
          data,
          fill,
          this.id(),
          chartImage,
        );
      } else {
        await this.pdfService.downloadSummaryPdf(data, this.id());
      }
    } catch (err) {
      this.error.set(
        err instanceof Error ? err.message : 'Failed to generate PDF',
      );
    } finally {
      this.exportingPdf.set(false);
    }
  }
}
