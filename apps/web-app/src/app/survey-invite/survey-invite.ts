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
import { Apollo } from 'apollo-angular';
import {
  SUBMIT_SURVEY_FILL_MUTATION,
  SURVEY_INVITE_BY_TOKEN_QUERY,
} from './graphql/survey-invite.graphql';
import SurveyFillViewComponent from '../surveys/fill/survey-fill-view';
import { toSurveyFillData } from '../surveys/fill/survey-fill.utils';
import type { SurveyFillData } from '../surveys/fill/survey-fill.types';

interface SurveyInviteContext {
  token: string;
  email: string;
  name?: string | null;
  welcomeMessage?: string | null;
  companyName?: string | null;
  startDate: string;
  expirationDate: string;
  submittedAt?: string | null;
  survey: Record<string, unknown>;
}

interface SurveyFillSubmission {
  id: string;
  surveyId: string;
  inviteeId: string;
  submittedAt: string;
}

interface SubmitSurveyFillInput {
  token: string;
  mainAnswers: {
    dimensionId: string;
    mainQuestionAnswerId: string;
  }[];
  questionAnswers: {
    dimensionQuestionId: string;
    answerIds: string[];
  }[];
}

@Component({
  selector: 'app-survey-invite',
  standalone: true,
  imports: [SurveyFillViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 py-10 px-4">
      <div class="mx-auto max-w-3xl space-y-6">
        @if (loading()) {
          <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading survey...
          </div>
        } @else if (error()) {
          <div class="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <span class="material-symbols-outlined text-4xl text-red-300">link_off</span>
            <p class="mt-4 text-lg font-medium text-red-800">{{ errorTitle() }}</p>
            <p class="mt-2 text-sm text-red-700">{{ error() }}</p>
          </div>
        } @else if (invite(); as ctx) {
          @if (submitted()) {
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
              <span class="material-symbols-outlined text-4xl text-emerald-500">check_circle</span>
              <p class="mt-4 text-lg font-medium text-emerald-900">Survey submitted</p>
              <p class="mt-2 text-sm text-emerald-800">
                Thank you for completing the survey.
              </p>
            </div>
          } @else {
            @if (ctx.welcomeMessage) {
              <div class="rounded-xl border border-indigo-200 bg-indigo-50 p-6">
                @if (ctx.name) {
                  <p class="text-sm font-medium text-indigo-900">Hello, {{ ctx.name }}</p>
                }
                <p class="mt-2 whitespace-pre-wrap text-indigo-900">{{ ctx.welcomeMessage }}</p>
                @if (ctx.companyName) {
                  <p class="mt-3 text-xs text-indigo-700">{{ ctx.companyName }}</p>
                }
              </div>
            }

            @if (surveyFillData(); as fillData) {
              <form (submit)="onSubmit($event)" class="space-y-6">
                <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
                  <app-survey-fill-view [survey]="fillData" [previewMode]="false" />
                </div>

                @if (submitError()) {
                  <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {{ submitError() }}
                  </div>
                }

                @if (fillData.presentAllQuestionsAtOnce) {
                  <div class="flex justify-end">
                    <button
                      type="submit"
                      [disabled]="submitting()"
                      class="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {{ submitting() ? 'Submitting...' : 'Submit survey' }}
                    </button>
                  </div>
                }
              </form>
            } @else {
              <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                This survey has no content yet.
              </div>
            }
          }
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class SurveyInviteComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);

  readonly token = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly errorTitle = signal('Invitation unavailable');
  protected readonly invite = signal<SurveyInviteContext | null>(null);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly surveyFillData = computed<SurveyFillData | null>(() => {
    const ctx = this.invite();
    if (!ctx) return null;
    return toSurveyFillData(ctx.survey);
  });

  constructor() {
    effect(() => {
      const inviteToken = this.token();
      if (inviteToken) {
        this.loadInvite(inviteToken);
      }
    });
  }

  private loadInvite(inviteToken: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.submitted.set(false);
    this.submitError.set(null);

    this.apollo
      .watchQuery<{ surveyInviteByToken: SurveyInviteContext | null }>({
        query: SURVEY_INVITE_BY_TOKEN_QUERY,
        variables: { token: inviteToken },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          const ctx = result.data?.surveyInviteByToken;
          if (ctx) {
            this.invite.set(ctx as SurveyInviteContext);
            this.submitted.set(!!ctx.submittedAt);
            this.error.set(null);
          } else if (!result.loading && !result.error) {
            this.setErrorFromMessage('Invitation not found');
          }
          if (result.error) {
            this.setErrorFromMessage(result.error.message);
          }
          if (!result.loading) {
            this.loading.set(false);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.setErrorFromMessage(err.message ?? 'Failed to load invitation');
        },
      });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitError.set(null);

    const formElement = event.currentTarget as HTMLFormElement | null;
    if (!formElement) {
      this.submitError.set('Unable to submit the survey. Please try again.');
      return;
    }

    const input = this.buildSubmitInput(new FormData(formElement));
    const responseCount =
      input.mainAnswers.length + input.questionAnswers.length;

    if (responseCount === 0) {
      this.submitError.set('Please answer at least one question before submitting.');
      return;
    }

    this.submitting.set(true);
    this.apollo
      .mutate<{ submitSurveyFill: SurveyFillSubmission }>({
        mutation: SUBMIT_SURVEY_FILL_MUTATION,
        variables: { input },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(err.message ?? 'Failed to submit survey');
        },
      });
  }

  private buildSubmitInput(formData: FormData): SubmitSurveyFillInput {
    const mainAnswers: SubmitSurveyFillInput['mainAnswers'] = [];
    const questionAnswersById = new Map<string, string[]>();

    formData.forEach((value, key) => {
      if (typeof value !== 'string' || !value) return;

      if (key.startsWith('main-')) {
        mainAnswers.push({
          dimensionId: key.slice('main-'.length),
          mainQuestionAnswerId: value,
        });
        return;
      }

      if (key.startsWith('dq-')) {
        const dimensionQuestionId = key.slice('dq-'.length);
        const answerIds = questionAnswersById.get(dimensionQuestionId) ?? [];
        answerIds.push(value);
        questionAnswersById.set(dimensionQuestionId, answerIds);
      }
    });

    return {
      token: this.token(),
      mainAnswers,
      questionAnswers: [...questionAnswersById.entries()].map(
        ([dimensionQuestionId, answerIds]) => ({
          dimensionQuestionId,
          answerIds,
        })
      ),
    };
  }

  private setErrorFromMessage(message: string): void {
    const lower = message.toLowerCase();
    if (lower.includes('not active yet')) {
      this.errorTitle.set('Invitation not active yet');
      this.error.set('This survey link will become available on the start date.');
    } else if (lower.includes('expired')) {
      this.errorTitle.set('Invitation expired');
      this.error.set('This survey link is no longer valid.');
    } else if (lower.includes('not found')) {
      this.errorTitle.set('Invalid invitation');
      this.error.set('This survey link does not exist or has been removed.');
    } else {
      this.errorTitle.set('Invitation unavailable');
      this.error.set(message);
    }
    this.invite.set(null);
  }
}
