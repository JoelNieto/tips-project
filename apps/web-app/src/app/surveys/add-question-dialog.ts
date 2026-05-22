import { DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { Apollo } from 'apollo-angular';
import {
  CREATE_QUESTION_MUTATION,
  QUESTIONS_QUERY,
} from '../question-bank/graphql/questions.graphql';

interface AnswerRow {
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

const emptyModel: QuestionFormModel = {
  title: '',
  text: '',
  weight: '',
  isReversed: false,
  isMultiAnswer: false,
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
        <p class="text-sm text-slate-500 mb-6">Add a new question to the bank and attach it to this dimension.</p>

        <form (submit)="onSubmit($event)" class="space-y-4">
          @if (submitError()) {
            <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {{ submitError() }}
            </div>
          }

          <div>
            <label for="add-q-title" class="block text-sm font-medium text-slate-700">Title *</label>
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
            <label for="add-q-text" class="block text-sm font-medium text-slate-700">Question text *</label>
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
              <label for="add-q-weight" class="block text-sm font-medium text-slate-700">Weight</label>
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

          <div class="border-t border-slate-200 pt-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-medium text-slate-900">Answers</h3>
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
export default class AddQuestionDialogComponent {
  private readonly apollo = inject(Apollo);
  protected readonly dialogRef = inject(DialogRef<AddQuestionDialogResult | null>);

  protected readonly questionModel = signal<QuestionFormModel>({ ...emptyModel, answers: [] });

  protected readonly questionForm = form(this.questionModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' });
    required(schemaPath.text, { message: 'Question text is required' });
  });

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

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
    const answers = value.answers
      .filter((a) => a.text.trim())
      .map((a, i) => ({
        text: a.text.trim(),
        sortOrder: i,
        value: parseFloat(a.value) || 0,
        reverseValue: a.reverseValue ? parseFloat(a.reverseValue) : undefined,
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
      .mutate<{ createQuestion: { id: string; title: string } }>({
        mutation: CREATE_QUESTION_MUTATION,
        variables: { input },
        refetchQueries: [{ query: QUESTIONS_QUERY }],
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
}
