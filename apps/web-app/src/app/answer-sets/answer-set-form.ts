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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import {
  ANSWER_SETS_QUERY,
  ANSWER_SET_QUERY,
  CREATE_ANSWER_SET_MUTATION,
  DELETE_ANSWER_SET_MUTATION,
  UPDATE_ANSWER_SET_MUTATION,
} from './graphql/answer-sets.graphql';
import ConfirmDialogComponent from '../shared/confirm-dialog/confirm-dialog';

interface AnswerRow {
  text: string;
  value: string;
  reverseValue: string;
}

interface AnswerSetFormModel {
  name: string;
  description: string;
  answers: AnswerRow[];
}

const emptyModel: AnswerSetFormModel = {
  name: '',
  description: '',
  answers: [],
};

@Component({
  selector: 'app-answer-set-form',
  standalone: true,
  imports: [FormField, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a
          routerLink="/dashboard/answer-sets"
          class="text-slate-500 hover:text-slate-700"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">
            {{
              isEditMode()
                ? ('answerSets.form.editTitle' | translate)
                : ('answerSets.form.createTitle' | translate)
            }}
          </h2>
          <p class="mt-1 text-slate-500">
            {{
              isEditMode()
                ? ('answerSets.form.editSubtitle' | translate)
                : ('answerSets.form.createSubtitle' | translate)
            }}
          </p>
        </div>
      </div>

      @if (loading()) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
        >
          {{ 'answerSets.form.loading' | translate }}
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

          <div>
            <label for="name" class="block text-sm font-medium text-slate-700"
              >{{ 'answerSets.form.name' | translate }} *</label
            >
            <input
              id="name"
              type="text"
              [formField]="answerSetForm.name"
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            />
            @if (answerSetForm.name().touched() && answerSetForm.name().invalid()) {
              <p class="mt-1 text-sm text-red-600">
                {{
                  (answerSetForm.name().errors()[0]?.message ??
                    'answerSets.form.nameRequired') | translate
                }}
              </p>
            }
          </div>

          <div>
            <label
              for="description"
              class="block text-sm font-medium text-slate-700"
              >{{ 'answerSets.form.description' | translate }}</label
            >
            <textarea
              id="description"
              [formField]="answerSetForm.description"
              rows="2"
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            ></textarea>
          </div>

          <div class="border-t border-slate-200 pt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-slate-900">
                {{ 'answerSets.form.answersSection' | translate }}
              </h3>
              <button
                type="button"
                (click)="addAnswer()"
                class="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                {{ 'answerSets.form.addAnswer' | translate }}
              </button>
            </div>
            @if (answerSetModel().answers.length === 0) {
              <p class="text-sm text-slate-500">
                {{ 'answerSets.form.addAnswerHint' | translate }}
              </p>
            }
            <div class="space-y-4">
              @for (a of answerSetModel().answers; track $index; let i = $index) {
                <div
                  class="flex gap-4 items-start rounded-lg border border-slate-200 p-4"
                >
                  <div class="flex-1 grid gap-4 sm:grid-cols-3">
                    <div class="sm:col-span-2">
                      <label class="block text-xs font-medium text-slate-500"
                        >{{ 'answerSets.form.text' | translate }}</label
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
                        >{{ 'answerSets.form.value' | translate }}</label
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
                        >{{ 'answerSets.form.reverseValue' | translate }}</label
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
                    [attr.aria-label]="'answerSets.form.removeAnswerAria' | translate"
                  >
                    <span class="material-symbols-outlined text-[20px]"
                      >delete</span
                    >
                  </button>
                </div>
              }
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
            <button
              type="submit"
              [disabled]="answerSetForm().invalid() || submitting()"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{
                submitting()
                  ? ('answerSets.form.saving' | translate)
                  : isEditMode()
                    ? ('answerSets.form.update' | translate)
                    : ('answerSets.form.create' | translate)
              }}
            </button>
            <a
              routerLink="/dashboard/answer-sets"
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
                {{ 'answerSets.form.delete' | translate }}
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
export default class AnswerSetFormComponent {
  private readonly apollo = inject(Apollo);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly id = input<string | undefined>(undefined);

  protected readonly answerSetModel = signal<AnswerSetFormModel>({ ...emptyModel });

  protected readonly answerSetForm = form(this.answerSetModel, (schemaPath) => {
    required(schemaPath.name, { message: 'answerSets.form.nameRequired' });
  });

  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly isEditMode = () => {
    const setId = this.id();
    return !!setId && setId !== 'new';
  };

  constructor() {
    effect(() => {
      const setId = this.id();
      if (setId && setId !== 'new') {
        this.loadAnswerSet(setId);
      } else {
        this.loading.set(false);
        this.answerSetModel.set({
          ...emptyModel,
          answers: [{ text: '', value: '0', reverseValue: '0' }],
        });
      }
    });
  }

  private loadAnswerSet(id: string): void {
    this.loading.set(true);
    this.apollo
      .watchQuery<{ answerSet: Record<string, unknown> | null }>({
        query: ANSWER_SET_QUERY,
        variables: { id },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          const set = result.data?.answerSet;
          if (set && typeof set === 'object') {
            const answers = (set['answers'] as {
              text: string;
              value: number;
              reverseValue?: number | null;
            }[]) ?? [];
            this.answerSetModel.set({
              name: (set['name'] as string) ?? '',
              description: (set['description'] as string) ?? '',
              answers: answers.length
                ? answers.map((a) => ({
                    text: a.text,
                    value: String(a.value),
                    reverseValue:
                      a.reverseValue != null ? String(a.reverseValue) : '',
                  }))
                : [{ text: '', value: '0', reverseValue: '0' }],
            });
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.submitError.set(
            err.message ?? this.translate.instant('answerSets.form.loadFailed'),
          );
        },
      });
  }

  protected addAnswer(): void {
    this.answerSetModel.update((m) => ({
      ...m,
      answers: [...m.answers, { text: '', value: '0', reverseValue: '0' }],
    }));
  }

  protected removeAnswer(index: number): void {
    this.answerSetModel.update((m) => ({
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
    this.answerSetModel.update((m) => ({
      ...m,
      answers: m.answers.map((a, i) =>
        i === index ? { ...a, [field]: value } : a
      ),
    }));
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitError.set(null);
    if (!this.answerSetForm().valid()) return;

    const value = this.answerSetModel();
    const answers = value.answers
      .filter((a) => a.text.trim())
      .map((a, i) => ({
        text: a.text.trim(),
        sortOrder: i,
        value: parseFloat(a.value) || 0,
        reverseValue: a.reverseValue ? parseFloat(a.reverseValue) : undefined,
      }));

    if (answers.length === 0) {
      this.submitError.set(this.translate.instant('answerSets.form.addAnswerRequired'));
      return;
    }

    this.submitting.set(true);

    if (this.isEditMode()) {
      const input = {
        name: value.name.trim(),
        description: value.description.trim() || undefined,
        answers,
      };
      this.apollo
        .mutate({
          mutation: UPDATE_ANSWER_SET_MUTATION,
          variables: { id: this.id(), input },
          refetchQueries: [{ query: ANSWER_SETS_QUERY }],
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/dashboard/answer-sets']);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(
              err.message ?? this.translate.instant('answerSets.form.updateFailed'),
            );
          },
        });
    } else {
      const input = {
        name: value.name.trim(),
        description: value.description.trim() || undefined,
        answers,
      };
      this.apollo
        .mutate({
          mutation: CREATE_ANSWER_SET_MUTATION,
          variables: { input },
          refetchQueries: [{ query: ANSWER_SETS_QUERY }],
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/dashboard/answer-sets']);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(
              err.message ?? this.translate.instant('answerSets.form.createFailed'),
            );
          },
        });
    }
  }

  protected onDelete(): void {
    if (!this.isEditMode() || !this.id()) return;
    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('answerSets.form.deleteTitle'),
        message: this.translate.instant('answerSets.form.deleteMessage'),
        confirmLabel: this.translate.instant('answerSets.form.deleteConfirm'),
        cancelLabel: this.translate.instant('common.cancel'),
        confirmDanger: true,
      },
      role: 'alertdialog',
      ariaModal: true,
      ariaLabel: this.translate.instant('answerSets.form.deleteAriaLabel'),
      width: '400px',
    });
    dialogRef.closed.subscribe((result) => {
      if (result === true) {
        this.submitting.set(true);
        this.submitError.set(null);
        this.apollo
          .mutate({
            mutation: DELETE_ANSWER_SET_MUTATION,
            variables: { id: this.id() },
            refetchQueries: [{ query: ANSWER_SETS_QUERY }],
          })
          .subscribe({
            next: () => {
              this.submitting.set(false);
              this.router.navigate(['/dashboard/answer-sets']);
            },
            error: (err) => {
              this.submitting.set(false);
              this.submitError.set(
                err.message ?? this.translate.instant('answerSets.form.deleteFailed'),
              );
            },
          });
      }
    });
  }
}
