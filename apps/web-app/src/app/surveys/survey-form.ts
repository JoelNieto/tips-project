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
  SURVEYS_QUERY,
  SURVEY_QUERY,
  SURVEY_TYPES_QUERY,
  CREATE_SURVEY_MUTATION,
  DELETE_SURVEY_MUTATION,
  UPDATE_SURVEY_MUTATION,
  CREATE_DIMENSION_MUTATION,
  UPDATE_DIMENSION_MUTATION,
  DELETE_DIMENSION_MUTATION,
  ADD_QUESTION_TO_DIMENSION_MUTATION,
  REMOVE_QUESTION_FROM_DIMENSION_MUTATION,
} from './graphql/surveys.graphql';
import { QUESTIONS_QUERY } from '../question-bank/graphql/questions.graphql';
import ConfirmDialogComponent from '../shared/confirm-dialog/confirm-dialog';

interface SurveyFormModel {
  title: string;
  surveyTypeId: string;
  description: string;
}

interface Dimension {
  id: string;
  title: string;
  description?: string | null;
  mainQuestionText?: string | null;
  dimensionQuestions: {
    id: string;
    question: { id: string; title: string };
  }[];
  subdimensions?: Dimension[];
}

interface SurveyTypeOption {
  id: string;
  name: string;
  hasCategories: boolean;
  hasSubcategories: boolean;
}

const emptyModel: SurveyFormModel = {
  title: '',
  surveyTypeId: '',
  description: '',
};

@Component({
  selector: 'app-survey-form',
  standalone: true,
  imports: [FormField, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a routerLink="/dashboard/surveys" class="text-slate-500 hover:text-slate-700">
          <span class="material-symbols-outlined">arrow_back</span>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">
            {{ isEditMode() ? 'Edit survey' : 'Create survey' }}
          </h2>
          <p class="mt-1 text-slate-500">
            {{ isEditMode() ? 'Update survey' : 'Add a new survey' }}
          </p>
        </div>
      </div>

      @if (loading()) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading...
        </div>
      } @else {
        <form (submit)="onSubmit($event)" class="space-y-6">
          <div class="rounded-xl border border-slate-200 bg-white p-6">
            @if (submitError()) {
              <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm mb-4">
                {{ submitError() }}
              </div>
            }

            <div class="space-y-4">
              <div>
                <label for="title" class="block text-sm font-medium text-slate-700">Title *</label>
                <input
                  id="title"
                  type="text"
                  [formField]="surveyForm.title"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
                @if (surveyForm.title().touched() && surveyForm.title().invalid()) {
                  <p class="mt-1 text-sm text-red-600">Title is required</p>
                }
              </div>
              <div>
                <label for="surveyTypeId" class="block text-sm font-medium text-slate-700">Survey type *</label>
                @if (isEditMode()) {
                  <div class="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {{ surveyTypeName() }}
                  </div>
                } @else {
                  <select
                    id="surveyTypeId"
                    [formField]="surveyForm.surveyTypeId"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select type...</option>
                    @for (st of surveyTypes(); track st.id) {
                      <option [value]="st.id">{{ st.name }}</option>
                    }
                  </select>
                }
              </div>
              <div>
                <label for="description" class="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  id="description"
                  [formField]="surveyForm.description"
                  rows="3"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                ></textarea>
              </div>
            </div>
          </div>

          @if (isEditMode() && survey()) {
            <div class="rounded-xl border border-slate-200 bg-white p-6">
              <h3 class="text-lg font-medium text-slate-900 mb-4">Dimensions</h3>
              @if (dimensionsToShow().length === 0) {
                <p class="text-sm text-slate-500">No dimensions yet.</p>
              } @else {
                <div class="space-y-4">
                  @for (dim of dimensionsToShow(); track dim.id) {
                    <div class="rounded-lg border border-slate-200 p-4">
                      <div class="flex items-center justify-between">
                        <h4 class="font-medium text-slate-900">{{ dim.title }}</h4>
                        @if (canAddDimension()) {
                          <a
                            [routerLink]="['/dashboard/surveys', survey()?.id]"
                            class="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            Edit
                          </a>
                        }
                      </div>
                      @if (dim.description) {
                        <p class="mt-1 text-sm text-slate-500">{{ dim.description }}</p>
                      }
                      @if (dim.mainQuestionText) {
                        <p class="mt-2 text-sm italic">{{ dim.mainQuestionText }}</p>
                      }
                      <div class="mt-3">
                        <p class="text-xs font-medium text-slate-500">Questions ({{ dim.dimensionQuestions?.length ?? 0 }})</p>
                            @if (dim.dimensionQuestions?.length) {
                          <ul class="mt-1 space-y-1">
                            @for (dq of dim.dimensionQuestions; track dq.id) {
                              <li class="flex items-center gap-2 text-sm">
                                <span>{{ dq.question?.title ?? 'Question' }}</span>
                                <button
                                  type="button"
                                  (click)="removeQuestion(dq.id)"
                                  class="text-red-600 hover:text-red-800"
                                  aria-label="Remove question"
                                >
                                  <span class="material-symbols-outlined text-[16px]">close</span>
                                </button>
                              </li>
                            }
                          </ul>
                        }
                        @if (addingToDimension() === dim.id) {
                            <div class="mt-2 flex gap-2 items-center flex-wrap">
                              <select
                                (change)="selectedQuestionId.set($any($event.target).value)"
                                class="rounded border border-slate-300 px-2 py-1 text-sm"
                              >
                                <option value="">Select question...</option>
                                @for (q of availableQuestions(); track q.id) {
                                  <option [value]="q.id">{{ q.title }}</option>
                                }
                              </select>
                              <button
                                type="button"
                                (click)="confirmAddQuestion()"
                                [disabled]="!selectedQuestionId()"
                                class="rounded bg-indigo-600 px-2 py-1 text-sm text-white disabled:opacity-50"
                              >
                                Add
                              </button>
                              <button
                                type="button"
                                (click)="cancelAddQuestion()"
                                class="rounded border border-slate-300 px-2 py-1 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          } @else {
                            <button
                              type="button"
                              (click)="openAddQuestionDialog(dim.id)"
                              class="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                            >
                              + Add question from bank
                            </button>
                          }
                      </div>
                      @if (canAddSubdimension() && dim.subdimensions?.length) {
                        <div class="mt-4 pl-4 border-l-2 border-slate-200">
                          <p class="text-xs font-medium text-slate-500">Subdimensions</p>
                          @for (sub of dim.subdimensions; track sub.id) {
                            <div class="mt-2 text-sm">{{ sub.title }}</div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              }
              @if (canAddDimension() && dimensionsToShow().length > 0) {
                <button
                  type="button"
                  (click)="addDimension()"
                  class="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  + Add dimension
                </button>
              }
            </div>
          }

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              [disabled]="surveyForm().invalid() || submitting()"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{ submitting() ? 'Saving...' : (isEditMode() ? 'Update' : 'Create') }}
            </button>
            <a
              routerLink="/dashboard/surveys"
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
export default class SurveyFormComponent {
  private readonly apollo = inject(Apollo);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input<string | undefined>(undefined);

  protected readonly surveyModel = signal<SurveyFormModel>({ ...emptyModel });
  protected readonly survey = signal<{
    id: string;
    surveyType: SurveyTypeOption;
    dimensions: Dimension[];
  } | null>(null);
  protected readonly surveyTypes = signal<SurveyTypeOption[]>([]);

  protected readonly surveyForm = form(this.surveyModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' });
    required(schemaPath.surveyTypeId, { message: 'Survey type is required' });
  });

  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly isEditMode = () => !!this.id() && this.id() !== 'new';

  protected readonly dimensionsToShow = () => {
    const s = this.survey();
    return s?.dimensions ?? [];
  };

  protected readonly canAddDimension = () => {
    return this.survey()?.surveyType?.hasCategories === true;
  };

  protected readonly canAddSubdimension = () => {
    return this.survey()?.surveyType?.hasSubcategories === true;
  };

  protected readonly surveyTypeName = () => {
    const id = this.surveyModel().surveyTypeId;
    return this.surveyTypes().find((st) => st.id === id)?.name ?? '—';
  };

  constructor() {
    effect(() => {
      const surveyId = this.id();
      if (surveyId && surveyId !== 'new') {
        this.loadSurvey(surveyId);
      } else {
        this.loading.set(false);
        this.surveyModel.set({ ...emptyModel });
        this.survey.set(null);
      }
    });
    this.loadSurveyTypes();
  }

  private loadSurveyTypes(): void {
    this.apollo
      .watchQuery<{ surveyTypes: SurveyTypeOption[] }>({
        query: SURVEY_TYPES_QUERY,
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.data?.surveyTypes) {
            this.surveyTypes.set(
              result.data.surveyTypes as SurveyTypeOption[]
            );
          }
        },
      });
  }

  private loadSurvey(id: string): void {
    this.loading.set(true);
    this.apollo
      .watchQuery<{ survey: Record<string, unknown> | null }>({
        query: SURVEY_QUERY,
        variables: { id },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          const s = result.data?.survey;
          if (s && typeof s === 'object') {
            const st = s['surveyType'] as SurveyTypeOption;
            this.surveyModel.set({
              title: (s['title'] as string) ?? '',
              surveyTypeId: (st?.id as string) ?? '',
              description: (s['description'] as string) ?? '',
            });
            this.survey.set({
              id: (s['id'] as string) ?? '',
              surveyType: st ?? { id: '', name: '', hasCategories: false, hasSubcategories: false },
              dimensions: (s['dimensions'] as Dimension[]) ?? [],
            });
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.submitError.set(err.message ?? 'Failed to load survey');
        },
      });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitError.set(null);
    if (!this.surveyForm().valid()) return;

    const value = this.surveyModel();
    const input = {
      title: value.title,
      surveyTypeId: value.surveyTypeId,
      description: value.description || undefined,
    };

    if (this.isEditMode()) {
      this.submitting.set(true);
      this.apollo
        .mutate({
          mutation: UPDATE_SURVEY_MUTATION,
          variables: { id: this.id(), input },
          refetchQueries: [{ query: SURVEYS_QUERY }, { query: SURVEY_QUERY, variables: { id: this.id() } }],
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.loadSurvey(this.id()!);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(err.message ?? 'Failed to update survey');
          },
        });
    } else {
      this.submitting.set(true);
      this.apollo
        .mutate({
          mutation: CREATE_SURVEY_MUTATION,
          variables: { input },
          refetchQueries: [{ query: SURVEYS_QUERY }],
        })
        .subscribe({
          next: (res) => {
            this.submitting.set(false);
            const created = (res.data as { createSurvey?: { id?: string } })?.createSurvey;
            if (created?.id) {
              this.router.navigate(['/dashboard/surveys', created.id]);
            } else {
              this.router.navigate(['/dashboard/surveys']);
            }
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(err.message ?? 'Failed to create survey');
          },
        });
    }
  }

  protected addDimension(): void {
    const s = this.survey();
    if (!s || !this.canAddDimension()) return;
    const title = prompt('Dimension title:');
    if (!title?.trim()) return;
    this.submitting.set(true);
    this.apollo
      .mutate({
        mutation: CREATE_DIMENSION_MUTATION,
        variables: {
          input: { surveyId: s.id, title: title.trim() },
        },
        refetchQueries: [{ query: SURVEY_QUERY, variables: { id: s.id } }],
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.loadSurvey(s.id);
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(err.message ?? 'Failed to add dimension');
        },
      });
  }

  protected openAddQuestionDialog(dimensionId: string): void {
    this.apollo
      .query<{ questions: { id: string; title: string }[] }>({
        query: QUESTIONS_QUERY,
      })
      .subscribe({
        next: (result) => {
          const questions = result.data?.questions ?? [];
          if (questions.length === 0) {
            this.submitError.set('No questions in bank. Create questions first.');
            return;
          }
          this.addingToDimension.set(dimensionId);
          this.availableQuestions.set(questions);
        },
      });
  }

  protected addingToDimension = signal<string | null>(null);
  protected availableQuestions = signal<{ id: string; title: string }[]>([]);
  protected selectedQuestionId = signal<string>('');

  protected confirmAddQuestion(): void {
    const dimId = this.addingToDimension();
    const qId = this.selectedQuestionId();
    if (!dimId || !qId) return;
    this.addingToDimension.set(null);
    this.availableQuestions.set([]);
    this.selectedQuestionId.set('');
    this.submitting.set(true);
    this.apollo
      .mutate({
        mutation: ADD_QUESTION_TO_DIMENSION_MUTATION,
        variables: { input: { dimensionId: dimId, questionId: qId } },
        refetchQueries: [{ query: SURVEY_QUERY, variables: { id: this.id() } }],
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.loadSurvey(this.id()!);
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(err.message ?? 'Failed to add question');
        },
      });
  }

  protected cancelAddQuestion(): void {
    this.addingToDimension.set(null);
    this.availableQuestions.set([]);
    this.selectedQuestionId.set('');
  }

  protected removeQuestion(dimensionQuestionId: string): void {
    this.submitting.set(true);
    this.apollo
      .mutate({
        mutation: REMOVE_QUESTION_FROM_DIMENSION_MUTATION,
        variables: { dimensionQuestionId },
        refetchQueries: [
          { query: SURVEY_QUERY, variables: { id: this.id() } },
        ],
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.loadSurvey(this.id()!);
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(err.message ?? 'Failed to remove question');
        },
      });
  }

  protected onDelete(): void {
    if (!this.isEditMode() || !this.id()) return;
    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: 'Delete survey',
        message: 'Are you sure? This will delete the survey and all its dimensions.',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        confirmDanger: true,
      },
      role: 'alertdialog',
      ariaModal: true,
      ariaLabel: 'Delete survey confirmation',
      width: '400px',
    });
    dialogRef.closed.subscribe((result) => {
      if (result === true) {
        this.submitting.set(true);
        this.submitError.set(null);
        this.apollo
          .mutate({
            mutation: DELETE_SURVEY_MUTATION,
            variables: { id: this.id() },
            refetchQueries: [{ query: SURVEYS_QUERY }],
          })
          .subscribe({
            next: () => {
              this.submitting.set(false);
              this.router.navigate(['/dashboard/surveys']);
            },
            error: (err) => {
              this.submitting.set(false);
              this.submitError.set(err.message ?? 'Failed to delete survey');
            },
          });
      }
    });
  }
}
