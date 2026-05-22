import {
  ChangeDetectionStrategy,
  Component,
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
import { Apollo } from 'apollo-angular';
import {
  QUESTIONS_QUERY,
  QUESTION_QUERY,
  SURVEYS_USING_QUESTION_QUERY,
  CREATE_QUESTION_MUTATION,
  DELETE_QUESTION_MUTATION,
  UPDATE_QUESTION_MUTATION,
  CREATE_ANSWER_MUTATION,
  UPDATE_ANSWER_MUTATION,
  DELETE_ANSWER_MUTATION,
} from './graphql/questions.graphql';
import ConfirmDialogComponent from '../shared/confirm-dialog/confirm-dialog';

interface AnswerRow {
  id?: string;
  text: string;
  value: string;
  reverseValue: string;
}

interface QuestionFormModel {
  title: string;
  text: string;
  weight: string;
  isReversed: boolean;
  isMultiAnswer: boolean;
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
  answers: [],
};

@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: [FormField, RouterLink],
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
            {{ isEditMode() ? 'Edit question' : 'Create question' }}
          </h2>
          <p class="mt-1 text-slate-500">
            {{ isEditMode() ? 'Update question' : 'Add to question bank' }}
          </p>
        </div>
      </div>

      @if (loading()) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
        >
          Loading...
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
                Used in:
              </p>
              <ul class="mt-2 space-y-1 text-sm text-slate-600">
                @for (u of surveyUsages(); track u.surveyId + u.dimensionId) {
                  <li>
                    {{ u.surveyTitle }} ({{ u.dimensionTitle }})
                  </li>
                }
              </ul>
            </div>
          }

          <div>
            <label for="title" class="block text-sm font-medium text-slate-700"
              >Title *</label
            >
            <input
              id="title"
              type="text"
              [formField]="questionForm.title"
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            />
            @if (questionForm.title().touched() && questionForm.title().invalid()) {
              <p class="mt-1 text-sm text-red-600">Title is required</p>
            }
          </div>

          <div>
            <label for="text" class="block text-sm font-medium text-slate-700"
              >Question text *</label
            >
            <textarea
              id="text"
              [formField]="questionForm.text"
              rows="3"
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            ></textarea>
            @if (questionForm.text().touched() && questionForm.text().invalid()) {
              <p class="mt-1 text-sm text-red-600">Question text is required</p>
            }
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label for="weight" class="block text-sm font-medium text-slate-700"
                >Weight</label
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
                  >Reversed scale</label
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
                  >Multi-answer</label
                >
              </div>
            </div>
          </div>

          <div class="border-t border-slate-200 pt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-slate-900">Answers</h3>
              <button
                type="button"
                (click)="addAnswer()"
                class="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                + Add answer
              </button>
            </div>
            @if (questionModel().answers.length === 0) {
              <p class="text-sm text-slate-500">No answer options yet. Add at least one for respondents to choose from.</p>
            }
            <div class="space-y-4">
              @for (a of questionModel().answers; track $index; let i = $index) {
                <div class="flex gap-4 items-start rounded-lg border border-slate-200 p-4">
                  <div class="flex-1 grid gap-4 sm:grid-cols-3">
                    <div class="sm:col-span-2">
                      <label class="block text-xs font-medium text-slate-500">Text</label>
                      <input
                        type="text"
                        [value]="a.text"
                        (input)="updateAnswer(i, 'text', $event)"
                        class="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-slate-500">Value</label>
                      <input
                        type="number"
                        step="any"
                        [value]="a.value"
                        (input)="updateAnswer(i, 'value', $event)"
                        class="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-slate-500">Reverse value</label>
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
                    aria-label="Remove answer"
                  >
                    <span class="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              }
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
            <button
              type="submit"
              [disabled]="questionForm().invalid() || submitting()"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{ submitting() ? 'Saving...' : (isEditMode() ? 'Update' : 'Create') }}
            </button>
            <a
              routerLink="/dashboard/question-bank"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </a>
            @if (isEditMode()) {
              <button
                type="button"
                [disabled]="submitting()"
                (click)="onDelete()"
                class="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 transition"
              >
                Delete
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

  readonly id = input<string | undefined>(undefined);

  protected readonly questionModel = signal<QuestionFormModel>({ ...emptyModel });
  protected readonly surveyUsages = signal<SurveyUsage[]>([]);
  private readonly originalAnswerIds = signal<Set<string>>(new Set());

  protected readonly questionForm = form(this.questionModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' });
    required(schemaPath.text, { message: 'Question text is required' });
  });

  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly isEditMode = () => {
    const id = this.id();
    return !!id && id !== 'new';
  };

  constructor() {
    effect(() => {
      const questionId = this.id();
      if (questionId && questionId !== 'new') {
        this.loadQuestion(questionId);
      } else {
        this.loading.set(false);
        this.questionModel.set({ ...emptyModel, answers: [] });
        this.originalAnswerIds.set(new Set());
        this.surveyUsages.set([]);
      }
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
            const answers = (q['answers'] as {
              id: string;
              text: string;
              value: number;
              reverseValue?: number | null;
            }[]) ?? [];
            this.questionModel.set({
              title: (q['title'] as string) ?? '',
              text: (q['text'] as string) ?? '',
              weight: (q['weight'] as number) != null ? String(q['weight']) : '',
              isReversed: (q['isReversed'] as boolean) ?? false,
              isMultiAnswer: (q['isMultiAnswer'] as boolean) ?? false,
              answers: answers.map((a) => ({
                id: a.id,
                text: a.text,
                value: String(a.value),
                reverseValue: a.reverseValue != null ? String(a.reverseValue) : '',
              })),
            });
            this.originalAnswerIds.set(new Set(answers.map((a) => a.id)));
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.submitError.set(err.message ?? 'Failed to load question');
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

    if (this.isEditMode()) {
      const input = {
        title: value.title,
        text: value.text,
        weight: value.weight ? parseFloat(value.weight) : undefined,
        isReversed: value.isReversed,
        isMultiAnswer: value.isMultiAnswer,
      };
      this.submitting.set(true);
      this.apollo
        .mutate({
          mutation: UPDATE_QUESTION_MUTATION,
          variables: { id: this.id(), input },
          refetchQueries: [{ query: QUESTIONS_QUERY }],
        })
        .subscribe({
          next: () => {
            this.syncAnswers(this.id()!, () => {
              this.submitting.set(false);
              this.router.navigate(['/dashboard/question-bank']);
            }, (message) => {
              this.submitting.set(false);
              this.submitError.set(message);
            });
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(err.message ?? 'Failed to update question');
          },
        });
    } else {
      const answers = value.answers
        .filter((a) => a.text.trim())
        .map((a, i) => ({
          text: a.text.trim(),
          sortOrder: i,
          value: parseFloat(a.value) || 0,
          reverseValue: a.reverseValue
            ? parseFloat(a.reverseValue)
            : undefined,
        }));
      const input = {
        title: value.title,
        text: value.text,
        weight: value.weight ? parseFloat(value.weight) : undefined,
        isReversed: value.isReversed,
        isMultiAnswer: value.isMultiAnswer,
        answers: answers.length ? answers : undefined,
      };
      this.submitting.set(true);
      this.apollo
        .mutate({
          mutation: CREATE_QUESTION_MUTATION,
          variables: { input },
          refetchQueries: [{ query: QUESTIONS_QUERY }],
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/dashboard/question-bank']);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(err.message ?? 'Failed to create question');
          },
        });
    }
  }

  private syncAnswers(
    questionId: string,
    onDone: () => void,
    onError: (message: string) => void
  ): void {
    const answers = this.questionModel()
      .answers.filter((a) => a.text.trim())
      .map((a, i) => ({
        ...a,
        text: a.text.trim(),
        sortOrder: i,
      }));
    const originalIds = this.originalAnswerIds();
    const currentIds = new Set(answers.filter((a) => a.id).map((a) => a.id!));
    const ops: Array<(done: () => void) => void> = [];

    for (const id of originalIds) {
      if (!currentIds.has(id)) {
        ops.push((done) => {
          this.apollo
            .mutate({
              mutation: DELETE_ANSWER_MUTATION,
              variables: { id },
            })
            .subscribe({
              next: () => done(),
              error: (err) => onError(err.message ?? 'Failed to delete answer'),
            });
        });
      }
    }

    for (const answer of answers) {
      const input = {
        text: answer.text,
        sortOrder: answer.sortOrder,
        value: parseFloat(answer.value) || 0,
        reverseValue: answer.reverseValue ? parseFloat(answer.reverseValue) : undefined,
      };

      if (answer.id) {
        ops.push((done) => {
          this.apollo
            .mutate({
              mutation: UPDATE_ANSWER_MUTATION,
              variables: { id: answer.id, input },
            })
            .subscribe({
              next: () => done(),
              error: (err) => onError(err.message ?? 'Failed to update answer'),
            });
        });
      } else {
        ops.push((done) => {
          this.apollo
            .mutate({
              mutation: CREATE_ANSWER_MUTATION,
              variables: { input: { questionId, ...input } },
            })
            .subscribe({
              next: () => done(),
              error: (err) => onError(err.message ?? 'Failed to create answer'),
            });
        });
      }
    }

    if (ops.length === 0) {
      onDone();
      return;
    }

    let completed = 0;
    const checkDone = (): void => {
      completed++;
      if (completed >= ops.length) {
        onDone();
      }
    };

    ops.forEach((op) => op(checkDone));
  }

  protected onDelete(): void {
    if (!this.isEditMode() || !this.id()) return;
    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: 'Delete question',
        message:
          'Are you sure? This will remove the question from the bank. Surveys using it may be affected.',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        confirmDanger: true,
      },
      role: 'alertdialog',
      ariaModal: true,
      ariaLabel: 'Delete question confirmation',
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
              this.submitError.set(err.message ?? 'Failed to delete question');
            },
          });
      }
    });
  }
}
