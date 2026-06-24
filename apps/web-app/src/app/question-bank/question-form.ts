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
import { form, FormField, required } from '@angular/forms/signals';
import { Dialog } from '@angular/cdk/dialog';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import {
  ANSWER_SETS_QUERY,
  QUESTIONS_QUERY,
  QUESTION_QUERY,
  SURVEYS_USING_QUESTION_QUERY,
  CREATE_QUESTION_MUTATION,
  DELETE_QUESTION_MUTATION,
  UPDATE_QUESTION_MUTATION,
} from './graphql/questions.graphql';
import ConfirmDialogComponent from '../shared/confirm-dialog/confirm-dialog';

type AnswerSetMode = 'none' | 'existing' | 'new';

interface AnswerRow {
  text: string;
  value: string;
  reverseValue: string;
}

interface AnswerSetOption {
  id: string;
  name: string;
  answers: AnswerRow[];
}

interface QuestionFormModel {
  title: string;
  text: string;
  weight: string;
  isReversed: boolean;
  isMultiAnswer: boolean;
  answerSetMode: AnswerSetMode;
  selectedAnswerSetId: string;
  newAnswerSetName: string;
  answers: AnswerRow[];
}

interface SurveyUsage {
  surveyId: string;
  surveyTitle: string;
  dimensionId: string;
  dimensionTitle: string;
}

const emptyModel: QuestionFormModel = {
  title: '',
  text: '',
  weight: '',
  isReversed: false,
  isMultiAnswer: false,
  answerSetMode: 'none',
  selectedAnswerSetId: '',
  newAnswerSetName: '',
  answers: [],
};

@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: [FormField, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a
          routerLink="/dashboard/question-bank"
          class="text-slate-500 hover:text-slate-700"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">
            {{
              isEditMode()
                ? ('questionBank.form.editTitle' | translate)
                : ('questionBank.form.createTitle' | translate)
            }}
          </h2>
          <p class="mt-1 text-slate-500">
            {{
              isEditMode()
                ? ('questionBank.form.editSubtitle' | translate)
                : ('questionBank.form.createSubtitle' | translate)
            }}
          </p>
        </div>
      </div>

      @if (loading()) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
        >
          {{ 'questionBank.form.loading' | translate }}
        </div>
      } @else {
        <form
          (submit)="onSubmit($event)"
          class="space-y-6 rounded-xl border border-slate-200 bg-white p-6"
        >
          @if (submitError()) {
            <div
              class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm"
            >
              {{ submitError() }}
            </div>
          }

          @if (isEditMode() && surveyUsages().length > 0) {
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p class="text-sm font-medium text-slate-700">
                {{ 'questionBank.form.usedIn' | translate }}
              </p>
              <ul class="mt-2 space-y-1 text-sm text-slate-600">
                @for (u of surveyUsages(); track u.surveyId + u.dimensionId) {
                  <li>{{ u.surveyTitle }} ({{ u.dimensionTitle }})</li>
                }
              </ul>
            </div>
          }

          <div>
            <label for="title" class="block text-sm font-medium text-slate-700"
              >{{ 'questionBank.form.title' | translate }} *</label
            >
            <input
              id="title"
              type="text"
              [formField]="questionForm.title"
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            />
            @if (questionForm.title().touched() && questionForm.title().invalid()) {
              <p class="mt-1 text-sm text-red-600">
                {{
                  (questionForm.title().errors()[0]?.message ??
                    'questionBank.form.titleRequired') | translate
                }}
              </p>
            }
          </div>

          <div>
            <label for="text" class="block text-sm font-medium text-slate-700"
              >{{ 'questionBank.form.questionText' | translate }} *</label
            >
            <textarea
              id="text"
              [formField]="questionForm.text"
              rows="3"
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            ></textarea>
            @if (questionForm.text().touched() && questionForm.text().invalid()) {
              <p class="mt-1 text-sm text-red-600">
                {{
                  (questionForm.text().errors()[0]?.message ??
                    'questionBank.form.questionTextRequired') | translate
                }}
              </p>
            }
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label for="weight" class="block text-sm font-medium text-slate-700"
                >{{ 'questionBank.form.weight' | translate }}</label
              >
              <input
                id="weight"
                type="number"
                step="any"
                [formField]="questionForm.weight"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div class="flex flex-wrap gap-4 pt-8">
              <div class="flex items-center gap-2">
                <input
                  id="isReversed"
                  type="checkbox"
                  [formField]="questionForm.isReversed"
                  class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label for="isReversed" class="text-sm font-medium text-slate-700"
                  >{{ 'questionBank.form.reversedScale' | translate }}</label
                >
              </div>
              <div class="flex items-center gap-2">
                <input
                  id="isMultiAnswer"
                  type="checkbox"
                  [formField]="questionForm.isMultiAnswer"
                  class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label for="isMultiAnswer" class="text-sm font-medium text-slate-700"
                  >{{ 'questionBank.form.multiAnswer' | translate }}</label
                >
              </div>
            </div>
          </div>

          <div class="border-t border-slate-200 pt-6 space-y-4">
            <h3 class="text-lg font-medium text-slate-900">
              {{ 'questionBank.form.answerSetSection' | translate }}
            </h3>
            <div class="flex flex-wrap gap-4">
              <label class="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="answerSetMode"
                  value="none"
                  [checked]="questionModel().answerSetMode === 'none'"
                  (change)="setAnswerSetMode('none')"
                  class="text-indigo-600 focus:ring-indigo-500"
                />
                {{ 'questionBank.form.modeNone' | translate }}
              </label>
              <label class="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="answerSetMode"
                  value="existing"
                  [checked]="questionModel().answerSetMode === 'existing'"
                  (change)="setAnswerSetMode('existing')"
                  class="text-indigo-600 focus:ring-indigo-500"
                />
                {{ 'questionBank.form.modeExisting' | translate }}
              </label>
              <label class="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="answerSetMode"
                  value="new"
                  [checked]="questionModel().answerSetMode === 'new'"
                  (change)="setAnswerSetMode('new')"
                  class="text-indigo-600 focus:ring-indigo-500"
                />
                {{ 'questionBank.form.modeNew' | translate }}
              </label>
            </div>

            @if (questionModel().answerSetMode === 'existing') {
              <div>
                <label
                  for="answerSetSelect"
                  class="block text-sm font-medium text-slate-700"
                  >{{ 'questionBank.form.answerSet' | translate }}</label
                >
                <select
                  id="answerSetSelect"
                  [value]="questionModel().selectedAnswerSetId"
                  (change)="onAnswerSetSelect($event)"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">
                    {{ 'questionBank.form.selectAnswerSet' | translate }}
                  </option>
                  @for (set of answerSets(); track set.id) {
                    <option [value]="set.id">
                      {{ set.name }} ({{
                        'questionBank.form.answersCount'
                          | translate: { count: set.answers.length }
                      }})
                    </option>
                  }
                </select>
              </div>
              @if (selectedAnswerSetPreview().length > 0) {
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p class="text-sm font-medium text-slate-700 mb-2">
                    {{ 'questionBank.form.preview' | translate }}
                  </p>
                  <ul class="space-y-1 text-sm text-slate-600">
                    @for (a of selectedAnswerSetPreview(); track $index) {
                      <li>
                        {{ a.text }} ({{
                          'questionBank.form.valuePreview'
                            | translate: { value: a.value }
                        }})
                      </li>
                    }
                  </ul>
                </div>
              }
            }

            @if (questionModel().answerSetMode === 'new') {
              <div>
                <label
                  for="newAnswerSetName"
                  class="block text-sm font-medium text-slate-700"
                  >{{ 'questionBank.form.answerSetName' | translate }}</label
                >
                <input
                  id="newAnswerSetName"
                  type="text"
                  [value]="questionModel().newAnswerSetName"
                  (input)="updateNewAnswerSetName($event)"
                  [placeholder]="'questionBank.form.answerSetNamePlaceholder' | translate"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div class="flex items-center justify-between">
                <p class="text-sm text-slate-600">
                  {{ 'questionBank.form.answerOptions' | translate }}
                </p>
                <button
                  type="button"
                  (click)="addAnswer()"
                  class="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  {{ 'questionBank.form.addAnswer' | translate }}
                </button>
              </div>
              @if (questionModel().answers.length === 0) {
                <p class="text-sm text-slate-500">
                  {{ 'questionBank.form.addAnswerHint' | translate }}
                </p>
              }
              <div class="space-y-4">
                @for (a of questionModel().answers; track $index; let i = $index) {
                  <div
                    class="flex gap-4 items-start rounded-lg border border-slate-200 p-4"
                  >
                    <div class="flex-1 grid gap-4 sm:grid-cols-3">
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-slate-500"
                          >{{ 'questionBank.form.text' | translate }}</label
                        >
                        <input
                          type="text"
                          [value]="a.text"
                          (input)="updateAnswer(i, 'text', $event)"
                          class="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-slate-500"
                          >{{ 'questionBank.form.value' | translate }}</label
                        >
                        <input
                          type="number"
                          step="any"
                          [value]="a.value"
                          (input)="updateAnswer(i, 'value', $event)"
                          class="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-slate-500"
                          >{{ 'questionBank.form.reverseValue' | translate }}</label
                        >
                        <input
                          type="number"
                          step="any"
                          [value]="a.reverseValue"
                          (input)="updateAnswer(i, 'reverseValue', $event)"
                          class="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      (click)="removeAnswer(i)"
                      class="text-red-600 hover:text-red-800 p-1"
                      [attr.aria-label]="'questionBank.form.removeAnswerAria' | translate"
                    >
                      <span class="material-symbols-outlined text-[20px]"
                        >delete</span
                      >
                    </button>
                  </div>
                }
              </div>
            }
          </div>

          <div class="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
            <button
              type="submit"
              [disabled]="questionForm().invalid() || submitting()"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{
                submitting()
                  ? ('questionBank.form.saving' | translate)
                  : isEditMode()
                    ? ('questionBank.form.update' | translate)
                    : ('questionBank.form.create' | translate)
              }}
            </button>
            <a
              routerLink="/dashboard/question-bank"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              {{ 'common.cancel' | translate }}
            </a>
            @if (isEditMode()) {
              <button
                type="button"
                [disabled]="submitting()"
                (click)="onDelete()"
                class="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 transition"
              >
                {{ 'questionBank.form.delete' | translate }}
              </button>
            }
          </div>
        </form>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class QuestionFormComponent {
  private readonly apollo = inject(Apollo);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly id = input<string | undefined>(undefined);

  protected readonly questionModel = signal<QuestionFormModel>({ ...emptyModel });
  protected readonly answerSets = signal<AnswerSetOption[]>([]);
  protected readonly surveyUsages = signal<SurveyUsage[]>([]);

  protected readonly selectedAnswerSetPreview = computed(() => {
    const selectedId = this.questionModel().selectedAnswerSetId;
    if (!selectedId) return [];
    return this.answerSets().find((s) => s.id === selectedId)?.answers ?? [];
  });

  protected readonly questionForm = form(this.questionModel, (schemaPath) => {
    required(schemaPath.title, { message: 'questionBank.form.titleRequired' });
    required(schemaPath.text, { message: 'questionBank.form.questionTextRequired' });
  });

  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly isEditMode = () => {
    const questionId = this.id();
    return !!questionId && questionId !== 'new';
  };

  constructor() {
    this.loadAnswerSets();

    effect(() => {
      const questionId = this.id();
      if (questionId && questionId !== 'new') {
        this.loadQuestion(questionId);
      } else {
        this.loading.set(false);
        this.questionModel.set({ ...emptyModel });
        this.surveyUsages.set([]);
      }
    });
  }

  private loadAnswerSets(): void {
    this.apollo
      .watchQuery<{ answerSets: AnswerSetOption[] }>({
        query: ANSWER_SETS_QUERY,
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.data?.answerSets) {
            this.answerSets.set(
              result.data.answerSets.map((set) => ({
                id: set.id ?? '',
                name: set.name ?? '',
                answers: (set.answers ?? []).map((a) => ({
                  text: a.text ?? '',
                  value: a.value != null ? String(a.value) : '0',
                  reverseValue:
                    a.reverseValue != null ? String(a.reverseValue) : '',
                })),
              }))
            );
          }
        },
      });
  }

  private loadQuestion(id: string): void {
    this.loading.set(true);
    this.apollo
      .watchQuery<{ question: Record<string, unknown> | null }>({
        query: QUESTION_QUERY,
        variables: { id },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          const q = result.data?.question;
          if (q && typeof q === 'object') {
            const answerSet = q['answerSet'] as {
              id: string;
              name: string;
              answers: {
                text: string;
                value: number;
                reverseValue?: number | null;
              }[];
            } | null;
            const answers = answerSet?.answers ?? [];
            this.questionModel.set({
              title: (q['title'] as string) ?? '',
              text: (q['text'] as string) ?? '',
              weight: (q['weight'] as number) != null ? String(q['weight']) : '',
              isReversed: (q['isReversed'] as boolean) ?? false,
              isMultiAnswer: (q['isMultiAnswer'] as boolean) ?? false,
              answerSetMode: answerSet ? 'existing' : 'none',
              selectedAnswerSetId: answerSet?.id ?? '',
              newAnswerSetName: answerSet?.name ?? '',
              answers: answers.map((a) => ({
                text: a.text,
                value: a.value != null ? String(a.value) : '0',
                reverseValue: a.reverseValue != null ? String(a.reverseValue) : '',
              })),
            });
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.submitError.set(
            err.message ?? this.translate.instant('questionBank.form.loadFailed'),
          );
        },
      });
    this.apollo
      .watchQuery<{ surveysUsingQuestion: SurveyUsage[] }>({
        query: SURVEYS_USING_QUESTION_QUERY,
        variables: { questionId: id },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.data?.surveysUsingQuestion) {
            this.surveyUsages.set(
              result.data.surveysUsingQuestion as SurveyUsage[]
            );
          }
        },
      });
  }

  protected setAnswerSetMode(mode: AnswerSetMode): void {
    this.questionModel.update((m) => {
      const next = { ...m, answerSetMode: mode };
      if (mode === 'new' && !next.newAnswerSetName && next.title) {
        next.newAnswerSetName = next.title;
      }
      if (mode === 'new' && next.answers.length === 0) {
        next.answers = [{ text: '', value: '0', reverseValue: '0' }];
      }
      return next;
    });
  }

  protected onAnswerSetSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.questionModel.update((m) => ({ ...m, selectedAnswerSetId: value }));
  }

  protected updateNewAnswerSetName(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.questionModel.update((m) => ({ ...m, newAnswerSetName: value }));
  }

  protected addAnswer(): void {
    this.questionModel.update((m) => ({
      ...m,
      answers: [...m.answers, { text: '', value: '0', reverseValue: '0' }],
    }));
  }

  protected removeAnswer(index: number): void {
    this.questionModel.update((m) => ({
      ...m,
      answers: m.answers.filter((_, i) => i !== index),
    }));
  }

  protected updateAnswer(
    index: number,
    field: keyof AnswerRow,
    event: Event
  ): void {
    const value = (event.target as HTMLInputElement).value;
    this.questionModel.update((m) => ({
      ...m,
      answers: m.answers.map((a, i) =>
        i === index ? { ...a, [field]: value } : a
      ),
    }));
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitError.set(null);
    if (!this.questionForm().valid()) return;

    const value = this.questionModel();
    let answerSetInput: Record<string, unknown>;
    try {
      answerSetInput = this.buildAnswerSetInput(value);
    } catch (err) {
      this.submitError.set(
        err instanceof Error
          ? err.message
          : this.translate.instant('questionBank.form.invalidAnswerSetConfig'),
      );
      return;
    }

    if (this.isEditMode()) {
      const input = {
        title: value.title,
        text: value.text,
        weight: value.weight ? parseFloat(value.weight) : undefined,
        isReversed: value.isReversed,
        isMultiAnswer: value.isMultiAnswer,
        ...answerSetInput,
      };
      this.submitting.set(true);
      this.apollo
        .mutate({
          mutation: UPDATE_QUESTION_MUTATION,
          variables: { id: this.id(), input },
          refetchQueries: [{ query: QUESTIONS_QUERY }, { query: ANSWER_SETS_QUERY }],
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/dashboard/question-bank']);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(
              err.message ?? this.translate.instant('questionBank.form.updateFailed'),
            );
          },
        });
    } else {
      const input = {
        title: value.title,
        text: value.text,
        weight: value.weight ? parseFloat(value.weight) : undefined,
        isReversed: value.isReversed,
        isMultiAnswer: value.isMultiAnswer,
        ...answerSetInput,
      };
      this.submitting.set(true);
      this.apollo
        .mutate({
          mutation: CREATE_QUESTION_MUTATION,
          variables: { input },
          refetchQueries: [{ query: QUESTIONS_QUERY }, { query: ANSWER_SETS_QUERY }],
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/dashboard/question-bank']);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(
              err.message ?? this.translate.instant('questionBank.form.createFailed'),
            );
          },
        });
    }
  }

  private buildAnswerSetInput(
    value: QuestionFormModel
  ): Record<string, unknown> {
    if (value.answerSetMode === 'none') {
      return this.isEditMode() ? { answerSetId: null } : {};
    }

    if (value.answerSetMode === 'existing') {
      if (!value.selectedAnswerSetId) {
        throw new Error(
          this.translate.instant('questionBank.form.selectAnswerSetRequired'),
        );
      }
      return { answerSetId: value.selectedAnswerSetId };
    }

    const answers = value.answers
      .filter((a) => a.text.trim())
      .map((a, i) => ({
        text: a.text.trim(),
        sortOrder: i,
        value: parseFloat(a.value) || 0,
        reverseValue: a.reverseValue ? parseFloat(a.reverseValue) : undefined,
      }));

    if (answers.length === 0) {
      throw new Error(
        this.translate.instant('questionBank.form.addAnswerRequired'),
      );
    }

    return {
      newAnswerSet: {
        name: value.newAnswerSetName.trim() || value.title.trim(),
        answers,
      },
    };
  }

  protected onDelete(): void {
    if (!this.isEditMode() || !this.id()) return;
    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('questionBank.form.deleteTitle'),
        message: this.translate.instant('questionBank.form.deleteMessage'),
        confirmLabel: this.translate.instant('questionBank.form.deleteConfirm'),
        cancelLabel: this.translate.instant('common.cancel'),
        confirmDanger: true,
      },
      role: 'alertdialog',
      ariaModal: true,
      ariaLabel: this.translate.instant('questionBank.form.deleteAriaLabel'),
      width: '400px',
    });
    dialogRef.closed.subscribe((result) => {
      if (result === true) {
        this.submitting.set(true);
        this.submitError.set(null);
        this.apollo
          .mutate({
            mutation: DELETE_QUESTION_MUTATION,
            variables: { id: this.id() },
            refetchQueries: [{ query: QUESTIONS_QUERY }],
          })
          .subscribe({
            next: () => {
              this.submitting.set(false);
              this.router.navigate(['/dashboard/question-bank']);
            },
            error: (err) => {
              this.submitting.set(false);
              this.submitError.set(
                err.message ?? this.translate.instant('questionBank.form.deleteFailed'),
              );
            },
          });
      }
    });
  }
}
