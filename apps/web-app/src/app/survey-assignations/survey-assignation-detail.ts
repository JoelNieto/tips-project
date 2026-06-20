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
import {
  SURVEY_ASSIGNATION_QUERY,
  SURVEY_ASSIGNATION_FILL_RESULTS_QUERY,
} from './graphql/survey-assignations.graphql';

interface InviteeFill {
  id: string;
  submittedAt: string;
}

interface InviteeDetail {
  id: string;
  email: string;
  name?: string | null;
  token: string;
  fill?: InviteeFill | null;
}

interface AssignationDetail {
  id: string;
  surveyId: string;
  welcomeMessage?: string | null;
  startDate: string;
  expirationDate: string;
  company?: { id: string; name: string; email?: string | null } | null;
  survey?: { id: string; title: string } | null;
  invitees: InviteeDetail[];
}

interface FillAnswerResult {
  id: string;
  text: string;
  value: number;
}

interface FillMainAnswerResult {
  dimensionId: string;
  dimensionTitle: string;
  answerText: string;
  answerValue: number;
}

interface FillQuestionAnswerGroup {
  dimensionQuestionId: string;
  questionText: string;
  answers: FillAnswerResult[];
}

interface FillResult {
  inviteeId: string;
  inviteeEmail: string;
  inviteeName?: string | null;
  submittedAt: string;
  mainAnswers: FillMainAnswerResult[];
  questionAnswers: FillQuestionAnswerGroup[];
}

type ActiveTab = 'invitees' | 'results';

@Component({
  selector: 'app-survey-assignation-detail',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a
          [routerLink]="['/dashboard/surveys', surveyId(), 'assignations']"
          class="text-slate-500 hover:text-slate-700"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Assignation details</h2>
          <p class="mt-1 text-slate-500">
            @if (assignation()?.survey?.title) {
              {{ assignation()!.survey!.title }}
            }
          </p>
        </div>
      </div>

      <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Emails are not sent automatically yet — copy the invite links below to share manually.
      </div>

      @if (loading()) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading...
        </div>
      } @else if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p class="font-medium">Failed to load assignation</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (assignation(); as a) {
        <div class="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <dl class="grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-slate-500">Company</dt>
              <dd class="mt-1 text-sm text-slate-900">{{ a.company?.name ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-slate-500">Date range</dt>
              <dd class="mt-1 text-sm text-slate-900">
                {{ formatDate(a.startDate) }} – {{ formatDate(a.expirationDate) }}
              </dd>
            </div>
          </dl>
          @if (a.welcomeMessage) {
            <div>
              <dt class="text-sm font-medium text-slate-500">Welcome message</dt>
              <dd class="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{{ a.welcomeMessage }}</dd>
            </div>
          }
        </div>

        <!-- Completion summary -->
        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-slate-700">Completion</span>
            <span class="text-sm font-semibold text-slate-900">
              {{ completedCount() }} / {{ a.invitees.length }}
            </span>
          </div>
          <div class="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              class="h-2 rounded-full bg-emerald-500 transition-all"
              [style.width.%]="completionPercent()"
            ></div>
          </div>
          @if (completedCount() === a.invitees.length && a.invitees.length > 0) {
            <p class="mt-2 text-xs text-emerald-600 font-medium">All invitees have completed the survey</p>
          }
        </div>

        <!-- Tabs -->
        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div class="flex border-b border-slate-200">
            <button
              type="button"
              (click)="setTab('invitees')"
              class="px-6 py-3 text-sm font-medium transition"
              [class]="activeTab() === 'invitees'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'"
            >
              Invitees ({{ a.invitees.length }})
            </button>
            <button
              type="button"
              (click)="setTab('results')"
              class="px-6 py-3 text-sm font-medium transition"
              [class]="activeTab() === 'results'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'"
            >
              Results ({{ completedCount() }})
            </button>
          </div>

          <!-- Invitees tab -->
          @if (activeTab() === 'invitees') {
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Email
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Invite link
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 bg-white">
                @for (inv of a.invitees; track inv.id) {
                  <tr>
                    <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-900">{{ inv.email }}</td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {{ inv.name ?? '—' }}
                    </td>
                    <td class="whitespace-nowrap px-6 py-4">
                      @if (inv.fill) {
                        <span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                          <span class="material-symbols-outlined text-[14px]">check_circle</span>
                          Completed {{ formatDate(inv.fill.submittedAt) }}
                        </span>
                      } @else {
                        <span class="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          Pending
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <code class="text-xs text-slate-600 break-all">{{ inviteLink(inv.token) }}</code>
                        <button
                          type="button"
                          (click)="copyLink(inv.token)"
                          class="shrink-0 text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          {{ copiedToken() === inv.token ? 'Copied' : 'Copy' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }

          <!-- Results tab -->
          @if (activeTab() === 'results') {
            @if (resultsLoading()) {
              <div class="p-8 text-center text-slate-500">Loading results...</div>
            } @else if (resultsError()) {
              <div class="p-8 text-center">
                <span class="material-symbols-outlined text-4xl text-red-300">error</span>
                <p class="mt-4 text-red-700 font-medium">Failed to load results</p>
                <p class="mt-1 text-sm text-red-600">{{ resultsError() }}</p>
                <button
                  type="button"
                  (click)="retryResults()"
                  class="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Retry
                </button>
              </div>
            } @else if (fillResults().length === 0) {
              <div class="p-12 text-center">
                <span class="material-symbols-outlined text-4xl text-slate-300">assignment</span>
                <p class="mt-4 text-slate-600">No submissions yet</p>
                <p class="mt-1 text-sm text-slate-500">Results will appear here once invitees complete the survey</p>
              </div>
            } @else {
              <div class="divide-y divide-slate-200">
                @for (result of fillResults(); track result.inviteeId) {
                  <div class="p-6">
                    <button
                      type="button"
                      class="flex w-full items-center justify-between text-left"
                      (click)="toggleExpand(result.inviteeId)"
                    >
                      <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-emerald-500">check_circle</span>
                        <div>
                          <p class="text-sm font-medium text-slate-900">
                            {{ result.inviteeName ?? result.inviteeEmail }}
                          </p>
                          @if (result.inviteeName) {
                            <p class="text-xs text-slate-500">{{ result.inviteeEmail }}</p>
                          }
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="text-xs text-slate-500">
                          Submitted {{ formatDateTime(result.submittedAt) }}
                        </span>
                        <span class="material-symbols-outlined text-slate-400 transition-transform"
                          [class.rotate-180]="expandedInviteeId() === result.inviteeId">
                          expand_more
                        </span>
                      </div>
                    </button>

                    @if (expandedInviteeId() === result.inviteeId) {
                      <div class="mt-4 space-y-4">
                        @if (result.mainAnswers.length > 0) {
                          <div>
                            <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Main questions
                            </h4>
                            <div class="rounded-lg border border-slate-200 divide-y divide-slate-100">
                              @for (ma of result.mainAnswers; track ma.dimensionId) {
                                <div class="flex items-center justify-between px-4 py-3">
                                  <span class="text-sm text-slate-700">{{ ma.dimensionTitle }}</span>
                                  <span class="text-sm font-medium text-slate-900">
                                    {{ ma.answerText }}
                                    <span class="ml-1 text-xs text-slate-400">({{ ma.answerValue }})</span>
                                  </span>
                                </div>
                              }
                            </div>
                          </div>
                        }

                        @if (result.questionAnswers.length > 0) {
                          <div>
                            <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Survey questions
                            </h4>
                            <div class="rounded-lg border border-slate-200 divide-y divide-slate-100">
                              @for (qa of result.questionAnswers; track qa.dimensionQuestionId) {
                                <div class="px-4 py-3">
                                  <p class="text-sm text-slate-700 mb-1">{{ qa.questionText }}</p>
                                  <div class="flex flex-wrap gap-1.5">
                                    @for (ans of qa.answers; track ans.id) {
                                      <span class="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                                        {{ ans.text }}
                                        <span class="ml-1 text-indigo-400">({{ ans.value }})</span>
                                      </span>
                                    }
                                  </div>
                                </div>
                              }
                            </div>
                          </div>
                        }

                        @if (result.mainAnswers.length === 0 && result.questionAnswers.length === 0) {
                          <p class="text-sm text-slate-500 italic">No answers recorded</p>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .rotate-180 {
      transform: rotate(180deg);
    }
  `,
})
export default class SurveyAssignationDetailComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);

  readonly surveyId = input.required<string>();
  readonly id = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly assignation = signal<AssignationDetail | null>(null);
  protected readonly copiedToken = signal<string | null>(null);

  protected readonly activeTab = signal<ActiveTab>('invitees');
  protected readonly fillResults = signal<FillResult[]>([]);
  protected readonly resultsLoading = signal(false);
  protected readonly resultsError = signal<string | null>(null);
  protected readonly expandedInviteeId = signal<string | null>(null);

  protected readonly origin = computed(() =>
    typeof window !== 'undefined' ? window.location.origin : ''
  );

  protected readonly completedCount = computed(
    () => (this.assignation()?.invitees ?? []).filter((inv) => inv.fill).length
  );

  protected readonly completionPercent = computed(() => {
    const total = this.assignation()?.invitees.length ?? 0;
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  constructor() {
    effect(() => {
      const assignationId = this.id();
      if (assignationId) {
        this.loadAssignation(assignationId);
      }
    });
  }

  private loadAssignation(assignationId: string): void {
    this.loading.set(true);
    this.apollo
      .watchQuery<{ surveyAssignation: AssignationDetail | null }>({
        query: SURVEY_ASSIGNATION_QUERY,
        variables: { id: assignationId },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          if (result.data?.surveyAssignation) {
            this.assignation.set(result.data.surveyAssignation as AssignationDetail);
            this.error.set(null);
          }
          if (result.error) {
            this.error.set(result.error.message);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message ?? 'Failed to load assignation');
        },
      });
  }

  private loadFillResults(assignationId: string): void {
    this.resultsLoading.set(true);
    this.resultsError.set(null);
    this.apollo
      .query<{ surveyAssignationFillResults: FillResult[] }>({
        query: SURVEY_ASSIGNATION_FILL_RESULTS_QUERY,
        variables: { id: assignationId },
        fetchPolicy: 'network-only',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.resultsLoading.set(false);
          this.fillResults.set(
            (result.data?.surveyAssignationFillResults ?? []) as FillResult[]
          );
        },
        error: (err) => {
          this.resultsLoading.set(false);
          this.resultsError.set(err.message ?? 'Failed to load results');
        },
      });
  }

  protected setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    if (tab === 'results' && !this.resultsLoading() && this.fillResults().length === 0 && !this.resultsError()) {
      const id = this.id();
      if (id) this.loadFillResults(id);
    }
  }

  protected retryResults(): void {
    this.resultsError.set(null);
    const id = this.id();
    if (id) this.loadFillResults(id);
  }

  protected toggleExpand(inviteeId: string): void {
    this.expandedInviteeId.update((current) =>
      current === inviteeId ? null : inviteeId
    );
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }

  protected formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString();
  }

  protected inviteLink(token: string): string {
    return `${this.origin()}/survey/invite/${token}`;
  }

  protected async copyLink(token: string): Promise<void> {
    const url = this.inviteLink(token);
    try {
      await navigator.clipboard.writeText(url);
      this.copiedToken.set(token);
      setTimeout(() => this.copiedToken.set(null), 2000);
    } catch {
      this.error.set('Failed to copy link to clipboard');
    }
  }
}
