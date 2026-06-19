import { DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { form, FormField, required } from '@angular/forms/signals';
import { Apollo } from 'apollo-angular';
import {
  ANSWER_SETS_QUERY,
  CREATE_QUESTION_MUTATION,
  QUESTIONS_QUERY,
} from '../question-bank/graphql/questions.graphql';

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

export interface AddQuestionDialogResult {
  id: string;
  title: string;
}

@Component({
  selector: 'app-add-question-dialog',
  standalone: true,
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-slate-900 mb-1">Create question</h2>
        <p class="text-sm text-slate-500 mb-6">
          Add a new question to the bank and attach it to this dimension.
        </p>

        <form (submit)="onSubmit($event)" class="space-y-4">
          @if (submitError()) {
            <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {{ submitError() }}
            </div>
          }

          <div>
            <label for="add-q-title" class="block text-sm font-medium text-slate-700"
              >Title *</label
            >
            <input
              id="add-q-title"
              type="text"
              [formField]="questionForm.title"
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            />
            @if (questionForm.title().touched() && questionForm.title().invalid()) {
              <p class="mt-1 text-sm text-red-600">Title is required</p>
            }
          </div>

          <div>
            <label for="add-q-text" class="block text-sm font-medium text-slate-700"
              >Question text *</label
            >
            <textarea
              id="add-q-text"
              [formField]="questionForm.text"
              rows="3"
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            ></textarea>
            @if (questionForm.text().touched() && questionForm.text().invalid()) {
              <p class="mt-1 text-sm text-red-600">Question text is required</p>
            }
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="add-q-weight" class="block text-sm font-medium text-slate-700"
                >Weight</label
              >
              <input
                id="add-q-weight"
                type="number"
                step="any"
                [formField]="questionForm.weight"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div class="flex flex-wrap gap-4 pt-8">
              <label class="flex items-center gap-2">
                <input
                  id="add-q-reversed"
                  type="checkbox"
                  [formField]="questionForm.isReversed"
                  class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="text-sm font-medium text-slate-700">Reversed scale</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  id="add-q-multi"
                  type="checkbox"
                  [formField]="questionForm.isMultiAnswer"
                  class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="text-sm font-medium text-slate-700">Multi-answer</span>
              </label>
            </div>
          </div>

          <div class="border-t border-slate-200 pt-4 space-y-3">
            <h3 class="text-sm font-medium text-slate-900">Answer set</h3>
            <div class="flex flex-wrap gap-3">
              <label class="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="addAnswerSetMode"
                  [checked]="questionModel().answerSetMode === 'none'"
                  (change)="setAnswerSetMode('none')"
                />
                No answers
              </label>
              <label class="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="addAnswerSetMode"
                  [checked]="questionModel().answerSetMode === 'existing'"
                  (change)="setAnswerSetMode('existing')"
                />
                Use existing
              </label>
              <label class="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="addAnswerSetMode"
                  [checked]="questionModel().answerSetMode === 'new'"
                  (change)="setAnswerSetMode('new')"
                />
                Create new
              </label>
            </div>

            @if (questionModel().answerSetMode === 'existing') {
              <select
                [value]="questionModel().selectedAnswerSetId"
                (change)="onAnswerSetSelect($event)"
                class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select an answer set...</option>
                @for (set of answerSets(); track set.id) {
                  <option [value]="set.id">
                    {{ set.name }} ({{ set.answers.length }})
                  </option>
                }
              </select>
              @if (selectedAnswerSetPreview().length > 0) {
                <ul class="text-xs text-slate-500 space-y-0.5">
                  @for (a of selectedAnswerSetPreview(); track $index) {
                    <li>{{ a.text }}</li>
                  }
                </ul>
              }
            }

            @if (questionModel().answerSetMode === 'new') {
              <input
                type="text"
                [value]="questionModel().newAnswerSetName"
                (input)="updateNewAnswerSetName($event)"
                placeholder="Answer set name (defaults to title)"
                class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600">Answers</span>
                <button
                  type="button"
                  (click)="addAnswer()"
                  class="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  + Add answer
                </button>
              </div>
              <div class="space-y-3">
                @for (a of questionModel().answers; track $index; let i = $index) {
                  <div class="flex gap-3 items-start rounded-lg border border-slate-200 p-3">
                    <div class="flex-1 grid gap-3 sm:grid-cols-3">
                      <div class="sm:col-span-2">
                        <input
                          type="text"
                          [value]="a.text"
                          (input)="updateAnswer(i, 'text', $event)"
                          placeholder="Text"
                          class="block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="any"
                          [value]="a.value"
                          (input)="updateAnswer(i, 'value', $event)"
                          placeholder="Value"
                          class="block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
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
            }
          </div>

          <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              [disabled]="questionForm().invalid() || submitting()"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{ submitting() ? 'Creating...' : 'Create & add to dimension' }}
            </button>
            <button
              type="button"
              (click)="cancel()"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class AddQuestionDialogComponent implements OnInit {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly dialogRef = inject(DialogRef<AddQuestionDialogResult | null>);

  protected readonly questionModel = signal<QuestionFormModel>({
    ...emptyModel,
  });
  protected readonly answerSets = signal<AnswerSetOption[]>([]);

  protected readonly selectedAnswerSetPreview = computed(() => {
    const selectedId = this.questionModel().selectedAnswerSetId;
    if (!selectedId) return [];
    return this.answerSets().find((s) => s.id === selectedId)?.answers ?? [];
  });

  protected readonly questionForm = form(this.questionModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' });
    required(schemaPath.text, { message: 'Question text is required' });
  });

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  ngOnInit(): void {
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

  protected updateAnswer(index: number, field: keyof AnswerRow, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.questionModel.update((m) => ({
      ...m,
      answers: m.answers.map((a, i) =>
        i === index ? { ...a, [field]: value } : a
      ),
    }));
  }

  protected cancel(): void {
    this.dialogRef.close(null);
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
        err instanceof Error ? err.message : 'Invalid answer set configuration'
      );
      return;
    }

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
      .mutate<{ createQuestion: { id: string; title: string } }>({
        mutation: CREATE_QUESTION_MUTATION,
        variables: { input },
        refetchQueries: [{ query: QUESTIONS_QUERY }, { query: ANSWER_SETS_QUERY }],
      })
      .subscribe({
        next: (result) => {
          const created = result.data?.createQuestion;
          if (created) {
            this.dialogRef.close({ id: created.id, title: created.title });
          } else {
            this.submitError.set('Failed to create question');
          }
          this.submitting.set(false);
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(err.message ?? 'Failed to create question');
        },
      });
  }

  private buildAnswerSetInput(value: QuestionFormModel): Record<string, unknown> {
    if (value.answerSetMode === 'none') {
      return {};
    }

    if (value.answerSetMode === 'existing') {
      if (!value.selectedAnswerSetId) {
        throw new Error('Please select an answer set');
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
      throw new Error('Add at least one answer to the new answer set');
    }

    return {
      newAnswerSet: {
        name: value.newAnswerSetName.trim() || value.title.trim(),
        answers,
      },
    };
  }
}
