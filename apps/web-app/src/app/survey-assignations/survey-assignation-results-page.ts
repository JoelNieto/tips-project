import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import RadarChartComponent, {
  type RadarSeries,
} from '../shared/radar-chart/radar-chart';
import { SURVEY_ASSIGNATION_FILL_RESULTS_QUERY } from './graphql/survey-assignations.graphql';
import {
  categoryTotals,
  collectCategoryAxes,
  dimensionTotals,
  mapTotalsToAxes,
  matchRange,
  type MatchedScoreRange,
} from './survey-results-chart.utils';

// ─── Domain types ────────────────────────────────────────────────────────────

interface AnswerResult {
  id: string;
  text: string;
  value: number;
}

interface MainAnswerResult {
  dimensionId: string;
  dimensionTitle: string;
  categoryId?: string | null;
  categoryTitle?: string | null;
  answerText: string;
  answerValue: number;
}

interface QuestionAnswerGroup {
  dimensionQuestionId: string;
  dimensionId: string;
  dimensionTitle: string;
  categoryId?: string | null;
  categoryTitle?: string | null;
  questionText: string;
  answers: AnswerResult[];
}

interface FillResult {
  inviteeId: string;
  inviteeEmail: string;
  inviteeName?: string | null;
  submittedAt: string;
  mainAnswers: MainAnswerResult[];
  questionAnswers: QuestionAnswerGroup[];
}

interface SurveyTypeInfo {
  hasCategories: boolean;
  hasSubcategories: boolean;
  categoryName?: string | null;
  subcategoryName?: string | null;
  visibleCategories: boolean;
  visibleSubcategories: boolean;
}

interface ResultDimension {
  id: string;
  title: string;
  parentId?: string | null;
  scoreRanges: {
    label?: string | null;
    message: string;
    minValue: number;
    maxValue: number;
    order?: number | null;
  }[];
}

interface ResultsData {
  surveyType: SurveyTypeInfo;
  dimensions: ResultDimension[];
  fills: FillResult[];
}

// ─── Grouped answer types (for rendering) ────────────────────────────────────

interface ResultGroup {
  id: string;
  title: string;
  categoryTotal?: number;
  categoryMessage?: MatchedScoreRange | null;
  subdimensions: SubdimensionGroup[];
}

interface SubdimensionGroup {
  dimensionId: string;
  dimensionTitle: string;
  dimensionTotal?: number;
  dimensionMessage?: MatchedScoreRange | null;
  mainAnswer?: { text: string; value: number };
  questions: QuestionAnswerGroup[];
}

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-survey-assignation-results-page',
  standalone: true,
  imports: [RouterLink, RadarChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Header -->
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

      <!-- Loading / Error -->
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
        <!-- Invitee selector -->
        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <label
            for="invitee-select"
            class="block text-sm font-medium text-slate-700 mb-2"
          >
            Select invitee
          </label>
          <select
            id="invitee-select"
            class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
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

        <!-- Chart panel -->
        @if (showChart()) {
          <div
            class="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
          >
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
                <label class="flex items-center gap-2 text-sm text-slate-700">
                  <span class="font-medium">Chart type</span>
                  <select
                    class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    disabled
                  >
                    <option value="radar">Radar</option>
                  </select>
                </label>
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

            @if (!selectedFill() && chartSeries().length === 0) {
              <p class="text-sm text-slate-500 text-center py-4">
                Select an invitee to view their results, or enable group average
                comparison.
              </p>
            } @else {
              <app-radar-chart [axes]="chartAxes()" [series]="chartSeries()" />
            }
          </div>
        }

        <!-- Results panel -->
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
                  <!-- Group header (category or top-level dimension) -->
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
                    @if (group.categoryTotal !== null) {
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

                  <!-- Sub-dimension sections -->
                  @for (sub of group.subdimensions; track sub.dimensionId) {
                    <div
                      class="px-6 py-4 space-y-3 border-b border-slate-100 last:border-b-0"
                    >
                      @if (hasCategories()) {
                        <h4 class="text-sm font-semibold text-slate-700">
                          {{ sub.dimensionTitle }}
                        </h4>
                      }

                      <!-- Main question answer -->
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

                      <!-- Survey questions -->
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
          <div
            class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500"
          >
            Select an invitee above to view their results
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

  readonly surveyId = input.required<string>();
  readonly id = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly resultsData = signal<ResultsData | null>(null);
  protected readonly selectedInviteeId = signal<string | null>(null);
  protected readonly compareToAverage = signal(true);

  protected readonly completedCount = computed(
    () => this.resultsData()?.fills.length ?? 0,
  );

  protected readonly hasCategories = computed(
    () => this.resultsData()?.surveyType.hasCategories ?? false,
  );

  protected readonly categoryLabel = computed(
    () => this.resultsData()?.surveyType.categoryName ?? 'Category',
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

  protected readonly averageSeries = computed((): RadarSeries | null => {
    const data = this.resultsData();
    const axisIds = this.chartCategoryAxes().ids;
    if (!data || axisIds.length === 0 || data.fills.length === 0) return null;

    const hasCategories = this.hasCategories();
    const sums = axisIds.map(() => 0);

    for (const fill of data.fills) {
      const totals = categoryTotals(fill, hasCategories);
      const values = mapTotalsToAxes(totals, axisIds);
      values.forEach((value, index) => {
        sums[index] += value;
      });
    }

    const averages = sums.map((sum) => sum / data.fills.length);
    return {
      label: 'Group average',
      color: '#d97706',
      values: averages,
    };
  });

  protected readonly selectedSeries = computed((): RadarSeries | null => {
    const fill = this.selectedFill();
    const axisIds = this.chartCategoryAxes().ids;
    if (!fill || axisIds.length === 0) return null;

    const totals = categoryTotals(fill, this.hasCategories());
    const label =
      fill.inviteeName?.trim() || fill.inviteeEmail || 'Selected invitee';

    return {
      label,
      color: '#4f46e5',
      values: mapTotalsToAxes(totals, axisIds),
    };
  });

  protected readonly chartSeries = computed((): RadarSeries[] => {
    const series: RadarSeries[] = [];
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

  protected readonly showChart = computed(
    () => this.hasCategories() && this.chartAxes().length >= 3,
  );

  protected readonly groupedResults = computed((): ResultGroup[] => {
    const fill = this.selectedFill();
    if (!fill) return [];

    const hasCategories = this.hasCategories();
    const dimensions = this.resultsData()?.dimensions ?? [];
    const rangesByDimensionId = new Map(
      dimensions.map((d) => [d.id, d.scoreRanges]),
    );
    const categoryTotalsById = new Map(
      categoryTotals(fill, hasCategories).map((t) => [t.id, t.total]),
    );
    const dimensionTotalsById = new Map(
      dimensionTotals(fill).map((t) => [t.id, t.total]),
    );
    const groups = new Map<string, ResultGroup>();

    // Helper to get/create a group entry
    const getGroup = (groupId: string, groupTitle: string): ResultGroup => {
      if (!groups.has(groupId)) {
        const total = categoryTotalsById.get(groupId);
        const ranges = rangesByDimensionId.get(groupId) ?? [];
        groups.set(groupId, {
          id: groupId,
          title: groupTitle,
          categoryTotal: total,
          categoryMessage: total != null ? matchRange(total, ranges) : null,
          subdimensions: [],
        });
      }
      return groups.get(groupId)!;
    };

    // Helper to get/create a subdimension within a group
    const getSubdimension = (
      group: ResultGroup,
      dimensionId: string,
      dimensionTitle: string,
    ): SubdimensionGroup => {
      let sub = group.subdimensions.find((s) => s.dimensionId === dimensionId);
      if (!sub) {
        const total = dimensionTotalsById.get(dimensionId);
        const ranges = rangesByDimensionId.get(dimensionId) ?? [];
        sub = {
          dimensionId,
          dimensionTitle,
          dimensionTotal: total,
          dimensionMessage: total != null ? matchRange(total, ranges) : null,
          questions: [],
        };
        group.subdimensions.push(sub);
      }
      return sub;
    };

    // Index main answers
    for (const ma of fill.mainAnswers) {
      const groupId = hasCategories
        ? (ma.categoryId ?? ma.dimensionId)
        : ma.dimensionId;
      const groupTitle = hasCategories
        ? (ma.categoryTitle ?? ma.dimensionTitle)
        : ma.dimensionTitle;
      const group = getGroup(groupId, groupTitle);
      const sub = getSubdimension(group, ma.dimensionId, ma.dimensionTitle);
      sub.mainAnswer = { text: ma.answerText, value: ma.answerValue };
    }

    // Index question answers
    for (const qa of fill.questionAnswers) {
      const groupId = hasCategories
        ? (qa.categoryId ?? qa.dimensionId)
        : qa.dimensionId;
      const groupTitle = hasCategories
        ? (qa.categoryTitle ?? qa.dimensionTitle)
        : qa.dimensionTitle;
      const group = getGroup(groupId, groupTitle);
      const sub = getSubdimension(group, qa.dimensionId, qa.dimensionTitle);
      sub.questions.push(qa);
    }

    return [...groups.values()];
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
            (result.data?.surveyAssignationFillResults ??
              null) as ResultsData | null,
          );
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message ?? 'Failed to load results');
        },
      });
  }

  protected onInviteeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedInviteeId.set(value || null);
  }

  protected onCompareToggle(event: Event): void {
    this.compareToAverage.set((event.target as HTMLInputElement).checked);
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }

  protected formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString();
  }
}
