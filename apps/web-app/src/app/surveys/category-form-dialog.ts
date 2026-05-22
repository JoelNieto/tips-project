import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { Apollo } from 'apollo-angular';
import {
  CREATE_DIMENSION_MUTATION,
  UPDATE_DIMENSION_MUTATION,
  ADD_QUESTION_TO_DIMENSION_MUTATION,
  CREATE_MAIN_QUESTION_ANSWER_MUTATION,
  UPDATE_MAIN_QUESTION_ANSWER_MUTATION,
  DELETE_MAIN_QUESTION_ANSWER_MUTATION,
} from './graphql/surveys.graphql';
import {
  CREATE_QUESTION_MUTATION,
  QUESTIONS_QUERY,
} from '../question-bank/graphql/questions.graphql';

interface AnswerRow {
  id?: string;
  text: string;
  value: string;
  reverseValue: string;
}

interface InlineQuestionModel {
  title: string;
  text: string;
  weight: string;
  isReversed: boolean;
  isMultiAnswer: boolean;
  answers: AnswerRow[];
}

type SelectedQuestion =
  | { type: 'bank'; id: string; title: string }
  | { type: 'new'; title: string; text: string; model: InlineQuestionModel };

export interface CategoryFormDialogData {
  surveyId: string;
  dimensionId?: string;
  dimension?: {
    title: string;
    description?: string | null;
    mainQuestionText?: string | null;
    mainQuestionAnswers?: {
      id: string;
      text: string;
      value: number;
      reverseValue?: number | null;
    }[];
    dimensionQuestions: { id: string; question: { id: string; title: string } }[];
  };
}

export interface CategoryFormDialogResult {
  dimensionId: string;
}

const emptyInlineQuestion: InlineQuestionModel = {
  title: '',
  text: '',
  weight: '',
  isReversed: false,
  isMultiAnswer: false,
  answers: [],
};

@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div class="p-6 overflow-y-auto flex-1">
        <h2 class="text-lg font-semibold text-slate-900 mb-1">{{ isEditMode() ? 'Edit category' : 'Add category' }}</h2>
        <p class="text-sm text-slate-500 mb-6">{{ isEditMode() ? 'Update the category and add more questions.' : 'Define the category and add questions from the bank or create new ones inline.' }}</p>

        @if (submitError()) {
          <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm mb-4">
            {{ submitError() }}
          </div>
        }

        <form (submit)="onSubmit($event)" class="space-y-6">
          <div class="space-y-4">
            <div>
              <label for="cat-title" class="block text-sm font-medium text-slate-700">Title *</label>
              <input
                id="cat-title"
                type="text"
                [formField]="dimensionForm.title"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
              @if (dimensionForm.title().touched() && dimensionForm.title().invalid()) {
                <p class="mt-1 text-sm text-red-600">Title is required</p>
              }
            </div>
            <div>
              <label for="cat-desc" class="block text-sm font-medium text-slate-700">Description</label>
              <textarea
                id="cat-desc"
                [formField]="dimensionForm.description"
                rows="2"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              ></textarea>
            </div>
            <div>
              <label for="cat-main-q" class="block text-sm font-medium text-slate-700">Main question text</label>
              <input
                id="cat-main-q"
                type="text"
                [formField]="dimensionForm.mainQuestionText"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div class="rounded-lg border border-slate-200 p-4">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h4 class="text-sm font-medium text-slate-900">Main question answers</h4>
                  <p class="text-xs text-slate-500">Answer options shown with the main question in the survey.</p>
                </div>
                <button
                  type="button"
                  (click)="addMainQuestionAnswer()"
                  class="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  + Add answer
                </button>
              </div>
              <div class="space-y-3">
                @for (a of mainQuestionAnswers(); track $index; let i = $index) {
                  <div class="flex gap-3 items-start rounded-lg border border-slate-200 p-3 bg-white">
                    <div class="flex-1 grid gap-3 sm:grid-cols-3">
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-slate-500">Text</label>
                        <input
                          type="text"
                          [value]="a.text"
                          (input)="updateMainQuestionAnswer(i, 'text', $event)"
                          class="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-slate-500">Value</label>
                        <input
                          type="number"
                          step="any"
                          [value]="a.value"
                          (input)="updateMainQuestionAnswer(i, 'value', $event)"
                          class="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-slate-500">Reverse value</label>
                        <input
                          type="number"
                          step="any"
                          [value]="a.reverseValue"
                          (input)="updateMainQuestionAnswer(i, 'reverseValue', $event)"
                          class="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      (click)="removeMainQuestionAnswer(i)"
                      class="text-red-600 hover:text-red-800 p-1"
                      aria-label="Remove answer"
                    >
                      <span class="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="border-t border-slate-200 pt-6">
            <h3 class="text-sm font-medium text-slate-900 mb-3">Questions</h3>

            @if (selectedQuestions().length > 0) {
              <ul class="space-y-2 mb-4">
                @for (q of selectedQuestions(); track trackQuestion($index, q); let i = $index) {
                  <li class="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <span>{{ q.type === 'bank' ? q.title : q.title || 'New question' }}</span>
                    @if (q.type === 'new') {
                      <span class="text-xs text-amber-600">(will save to bank)</span>
                    }
                    <button
                      type="button"
                      (click)="removeQuestion(i)"
                      class="text-red-600 hover:text-red-800 p-1"
                      aria-label="Remove"
                    >
                      <span class="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </li>
                }
              </ul>
            }

            <div class="flex gap-2 items-center flex-wrap mb-4">
              <select
                (change)="onBankSelect($event)"
                [value]="selectedBankId()"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select from bank...</option>
                @for (q of bankQuestions(); track q.id) {
                  <option [value]="q.id">{{ q.title }}</option>
                }
              </select>
              <button
                type="button"
                (click)="addFromBank()"
                [disabled]="!selectedBankId()"
                class="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                Add from bank
              </button>
              <button
                type="button"
                (click)="showInlineForm.set(!showInlineForm())"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                {{ showInlineForm() ? 'Cancel' : '+ Create new inline' }}
              </button>
            </div>

            @if (showInlineForm()) {
              <div class="rounded-lg border border-slate-200 p-4 bg-slate-50 space-y-3">
                <p class="text-xs font-medium text-slate-600">New question (saved to bank on save)</p>
                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="sm:col-span-2">
                    <label class="block text-xs font-medium text-slate-600">Title *</label>
                    <input
                      type="text"
                      [value]="inlineModel().title"
                      (input)="updateInline('title', $event)"
                      class="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-xs font-medium text-slate-600">Question text *</label>
                    <textarea
                      [value]="inlineModel().text"
                      (input)="updateInline('text', $event)"
                      rows="2"
                      class="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    ></textarea>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-600">Weight</label>
                    <input
                      type="number"
                      step="any"
                      [value]="inlineModel().weight"
                      (input)="updateInline('weight', $event)"
                      class="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div class="flex flex-wrap gap-4 pt-6">
                    <label class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        [checked]="inlineModel().isReversed"
                        (change)="updateInlineCheckbox('isReversed', $event)"
                        class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span class="text-xs font-medium text-slate-600">Reversed scale</span>
                    </label>
                    <label class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        [checked]="inlineModel().isMultiAnswer"
                        (change)="updateInlineCheckbox('isMultiAnswer', $event)"
                        class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span class="text-xs font-medium text-slate-600">Multi-answer</span>
                    </label>
                  </div>
                </div>
                <div class="border-t border-slate-200 pt-3">
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="text-xs font-medium text-slate-700">Answer options</h4>
                    <button
                      type="button"
                      (click)="addInlineAnswer()"
                      class="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      + Add answer
                    </button>
                  </div>
                  <div class="space-y-2">
                    @for (a of inlineModel().answers; track $index; let i = $index) {
                      <div class="flex gap-2 items-start rounded border border-slate-200 p-2 bg-white">
                        <div class="flex-1 grid gap-2 sm:grid-cols-3">
                          <div class="sm:col-span-2">
                            <label class="block text-xs font-medium text-slate-500">Text</label>
                            <input
                              type="text"
                              [value]="a.text"
                              (input)="updateInlineAnswer(i, 'text', $event)"
                              class="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-slate-500">Value</label>
                            <input
                              type="number"
                              step="any"
                              [value]="a.value"
                              (input)="updateInlineAnswer(i, 'value', $event)"
                              class="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-slate-500">Reverse value</label>
                            <input
                              type="number"
                              step="any"
                              [value]="a.reverseValue"
                              (input)="updateInlineAnswer(i, 'reverseValue', $event)"
                              class="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1 text-sm"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          (click)="removeInlineAnswer(i)"
                          class="text-red-600 hover:text-red-800 p-1"
                          aria-label="Remove answer"
                        >
                          <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    }
                  </div>
                </div>
                <div class="flex gap-2 items-center flex-wrap">
                  <button
                    type="button"
                    (click)="addInlineQuestion()"
                    [disabled]="!inlineModel().title.trim() || !inlineModel().text.trim()"
                    class="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                  >
                    Add to list
                  </button>
                  <button
                    type="button"
                    (click)="resetInlineForm()"
                    class="rounded border border-slate-300 px-3 py-1.5 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            }
          </div>

          <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              [disabled]="dimensionForm().invalid() || submitting()"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{ submitting() ? 'Saving...' : (isEditMode() ? 'Update category' : 'Save category') }}
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
export default class CategoryFormDialogComponent {
  private readonly apollo = inject(Apollo);
  protected readonly dialogRef = inject(DialogRef<CategoryFormDialogResult | null>);
  protected readonly data = inject<CategoryFormDialogData>(DIALOG_DATA);

  protected readonly dimensionModel = signal({
    title: '',
    description: '',
    mainQuestionText: '',
  });
  protected readonly dimensionForm = form(this.dimensionModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' });
  });

  protected readonly selectedQuestions = signal<SelectedQuestion[]>([]);
  protected readonly bankQuestions = signal<{ id: string; title: string }[]>([]);
  protected readonly selectedBankId = signal('');
  protected readonly showInlineForm = signal(false);
  protected readonly inlineModel = signal<InlineQuestionModel>({ ...emptyInlineQuestion, answers: [] });
  protected readonly mainQuestionAnswers = signal<AnswerRow[]>([]);
  private readonly originalMainQuestionAnswerIds = signal<Set<string>>(new Set());

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly isEditMode = () => !!this.data.dimensionId;

  constructor() {
    if (this.data.dimension) {
      const d = this.data.dimension;
      this.dimensionModel.set({
        title: d.title,
        description: d.description ?? '',
        mainQuestionText: d.mainQuestionText ?? '',
      });
      const mainAnswers = (d.mainQuestionAnswers ?? []).map((a) => ({
        id: a.id,
        text: a.text,
        value: String(a.value),
        reverseValue: a.reverseValue != null ? String(a.reverseValue) : '',
      }));
      this.mainQuestionAnswers.set(mainAnswers);
      this.originalMainQuestionAnswerIds.set(new Set(mainAnswers.map((a) => a.id!).filter(Boolean)));
      this.selectedQuestions.set(
        d.dimensionQuestions.map((dq) => ({
          type: 'bank' as const,
          id: dq.question.id,
          title: dq.question.title,
        }))
      );
    }
    this.apollo
      .query<{ questions: { id: string; title: string }[] }>({
        query: QUESTIONS_QUERY,
      })
      .subscribe({
        next: (result) => {
          this.bankQuestions.set(result.data?.questions ?? []);
          const first = result.data?.questions?.[0];
          if (first) this.selectedBankId.set(first.id);
        },
      });
  }

  protected trackQuestion(_i: number, q: SelectedQuestion): string {
    return q.type === 'bank' ? q.id : `new-${q.title}-${q.text}`;
  }

  protected onBankSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedBankId.set(value);
  }

  protected addFromBank(): void {
    const id = this.selectedBankId();
    if (!id) return;
    const q = this.bankQuestions().find((x) => x.id === id);
    if (!q || this.selectedQuestions().some((s) => s.type === 'bank' && s.id === id)) return;
    this.selectedQuestions.update((list) => [...list, { type: 'bank', id: q.id, title: q.title }]);
  }

  protected updateInline(field: keyof InlineQuestionModel, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.inlineModel.update((m) => ({ ...m, [field]: value }));
  }

  protected updateInlineCheckbox(field: 'isReversed' | 'isMultiAnswer', event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.inlineModel.update((m) => ({ ...m, [field]: checked }));
  }

  protected addInlineAnswer(): void {
    this.inlineModel.update((m) => ({
      ...m,
      answers: [...m.answers, { text: '', value: '0', reverseValue: '0' }],
    }));
  }

  protected removeInlineAnswer(index: number): void {
    this.inlineModel.update((m) => ({
      ...m,
      answers: m.answers.filter((_, i) => i !== index),
    }));
  }

  protected updateInlineAnswer(index: number, field: keyof AnswerRow, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.inlineModel.update((m) => ({
      ...m,
      answers: m.answers.map((a, i) =>
        i === index ? { ...a, [field]: value } : a
      ),
    }));
  }

  protected addMainQuestionAnswer(): void {
    this.mainQuestionAnswers.update((list) => [
      ...list,
      { text: '', value: '0', reverseValue: '0' },
    ]);
  }

  protected removeMainQuestionAnswer(index: number): void {
    this.mainQuestionAnswers.update((list) => list.filter((_, i) => i !== index));
  }

  protected updateMainQuestionAnswer(
    index: number,
    field: keyof AnswerRow,
    event: Event
  ): void {
    const value = (event.target as HTMLInputElement).value;
    this.mainQuestionAnswers.update((list) =>
      list.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  }

  protected addInlineQuestion(): void {
    const m = this.inlineModel();
    if (!m.title.trim() || !m.text.trim()) return;
    this.selectedQuestions.update((list) => [
      ...list,
      { type: 'new', title: m.title, text: m.text, model: { ...m } },
    ]);
    this.resetInlineForm();
  }

  protected resetInlineForm(): void {
    this.inlineModel.set({ ...emptyInlineQuestion, answers: [] });
    this.showInlineForm.set(false);
  }

  protected removeQuestion(index: number): void {
    this.selectedQuestions.update((list) => list.filter((_, i) => i !== index));
  }

  protected cancel(): void {
    this.dialogRef.close(null);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitError.set(null);
    if (!this.dimensionForm().valid()) return;

    const updateInput = {
      title: this.dimensionModel().title.trim(),
      description: this.dimensionModel().description?.trim() || undefined,
      mainQuestionText: this.dimensionModel().mainQuestionText?.trim() || undefined,
    };

    this.submitting.set(true);

    if (this.data.dimensionId) {
      this.apollo
        .mutate<{ updateDimension: { id: string } }>({
          mutation: UPDATE_DIMENSION_MUTATION,
          variables: { id: this.data.dimensionId, input: updateInput },
        })
        .subscribe({
          next: () => {
            this.finalizeDimensionSave(this.data.dimensionId!);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(err.message ?? 'Failed to update category');
          },
        });
    } else {
      const dimInput = {
        surveyId: this.data.surveyId,
        ...updateInput,
      };
      this.apollo
        .mutate<{ createDimension: { id: string } }>({
          mutation: CREATE_DIMENSION_MUTATION,
          variables: { input: dimInput },
        })
        .subscribe({
          next: (res) => {
            const dimensionId = res.data?.createDimension?.id;
            if (!dimensionId) {
              this.submitError.set('Failed to create category');
              this.submitting.set(false);
              return;
            }
            this.finalizeDimensionSave(dimensionId);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(err.message ?? 'Failed to create category');
          },
        });
    }
  }

  private finalizeDimensionSave(dimensionId: string): void {
    const existingIds = new Set(
      this.data.dimension?.dimensionQuestions?.map((dq) => dq.question.id) ?? []
    );
    const questions = this.selectedQuestions();
    const bankQuestions = questions
      .filter((q): q is { type: 'bank'; id: string; title: string } => q.type === 'bank')
      .filter((q) => !existingIds.has(q.id));
    const newQuestions = questions.filter(
      (q): q is { type: 'new'; title: string; text: string; model: InlineQuestionModel } =>
        q.type === 'new'
    );

    const mainAnswerOps = this.buildMainQuestionAnswerOps(dimensionId);
    const total = mainAnswerOps.length + bankQuestions.length + newQuestions.length;

    if (total === 0) {
      this.dialogRef.close({ dimensionId });
      this.submitting.set(false);
      return;
    }

    let completed = 0;
    const checkDone = (): void => {
      completed++;
      if (completed >= total) {
        this.dialogRef.close({ dimensionId });
        this.submitting.set(false);
      }
    };

    const onError = (message: string): void => {
      this.submitError.set(message);
      this.submitting.set(false);
    };

    mainAnswerOps.forEach((op) => op(checkDone, onError));

    const addOne = (questionId: string): void => {
      this.apollo
        .mutate({
          mutation: ADD_QUESTION_TO_DIMENSION_MUTATION,
          variables: { input: { dimensionId, questionId } },
          refetchQueries: [{ query: QUESTIONS_QUERY }],
        })
        .subscribe({
          next: () => checkDone(),
          error: (err) => onError(err.message ?? 'Failed to add question'),
        });
    };

    bankQuestions.forEach((q) => addOne(q.id));

    newQuestions.forEach((q) => {
      const answers = q.model.answers
        .filter((a) => a.text.trim())
        .map((a, i) => ({
          text: a.text.trim(),
          sortOrder: i,
          value: parseFloat(a.value) || 0,
          reverseValue: a.reverseValue ? parseFloat(a.reverseValue) : undefined,
        }));
      const input = {
        title: q.model.title,
        text: q.model.text,
        weight: q.model.weight ? parseFloat(q.model.weight) : undefined,
        isReversed: q.model.isReversed,
        isMultiAnswer: q.model.isMultiAnswer,
        answers: answers.length ? answers : undefined,
      };
      this.apollo
        .mutate<{ createQuestion: { id: string } }>({
          mutation: CREATE_QUESTION_MUTATION,
          variables: { input },
          refetchQueries: [{ query: QUESTIONS_QUERY }],
        })
        .subscribe({
          next: (res) => {
            const id = res.data?.createQuestion?.id;
            if (id) addOne(id);
            else checkDone();
          },
          error: (err) => onError(err.message ?? 'Failed to create question'),
        });
    });
  }

  private buildMainQuestionAnswerOps(
    dimensionId: string
  ): Array<(onDone: () => void, onError: (message: string) => void) => void> {
    const answers = this.mainQuestionAnswers()
      .filter((a) => a.text.trim())
      .map((a, i) => ({
        ...a,
        text: a.text.trim(),
        sortOrder: i,
      }));
    const originalIds = this.originalMainQuestionAnswerIds();
    const currentIds = new Set(answers.filter((a) => a.id).map((a) => a.id!));
    const ops: Array<(onDone: () => void, onError: (message: string) => void) => void> = [];

    for (const id of originalIds) {
      if (!currentIds.has(id)) {
        ops.push((onDone, onError) => {
          this.apollo
            .mutate({
              mutation: DELETE_MAIN_QUESTION_ANSWER_MUTATION,
              variables: { id },
            })
            .subscribe({
              next: () => onDone(),
              error: (err) => onError(err.message ?? 'Failed to delete main question answer'),
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
        ops.push((onDone, onError) => {
          this.apollo
            .mutate({
              mutation: UPDATE_MAIN_QUESTION_ANSWER_MUTATION,
              variables: { id: answer.id, input },
            })
            .subscribe({
              next: () => onDone(),
              error: (err) => onError(err.message ?? 'Failed to update main question answer'),
            });
        });
      } else {
        ops.push((onDone, onError) => {
          this.apollo
            .mutate({
              mutation: CREATE_MAIN_QUESTION_ANSWER_MUTATION,
              variables: { input: { dimensionId, ...input } },
            })
            .subscribe({
              next: () => onDone(),
              error: (err) => onError(err.message ?? 'Failed to create main question answer'),
            });
        });
      }
    }

    return ops;
  }
}
