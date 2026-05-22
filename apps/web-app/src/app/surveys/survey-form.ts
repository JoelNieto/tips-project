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
import { Apollo } from 'apollo-angular';
import {
  SURVEYS_QUERY,
  SURVEY_QUERY,
  SURVEY_TYPES_QUERY,
  CREATE_SURVEY_MUTATION,
  DELETE_SURVEY_MUTATION,
  UPDATE_SURVEY_MUTATION,
  REMOVE_QUESTION_FROM_DIMENSION_MUTATION,
} from './graphql/surveys.graphql';
import ConfirmDialogComponent from '../shared/confirm-dialog/confirm-dialog';
import CategoryFormDialogComponent from './category-form-dialog';
import SurveyFillViewComponent from './fill/survey-fill-view';
import type { FillDimension, SurveyFillData } from './fill/survey-fill.types';
import { toSurveyFillData } from './fill/survey-fill.utils';

interface SurveyFormModel {
  title: string;
  surveyTypeId: string;
  description: string;
}

type BuilderDimension = FillDimension;

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
  imports: [FormField, RouterLink, SurveyFillViewComponent],
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

      @if (isEditMode()) {
        <div
          class="flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 w-fit"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="activeTab() === 'builder'"
            (click)="setActiveTab('builder')"
            class="rounded-md px-4 py-2 text-sm font-medium transition"
            [class.bg-white]="activeTab() === 'builder'"
            [class.text-indigo-700]="activeTab() === 'builder'"
            [class.shadow-sm]="activeTab() === 'builder'"
            [class.text-slate-600]="activeTab() !== 'builder'"
          >
            Builder
          </button>
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="activeTab() === 'preview'"
            (click)="setActiveTab('preview')"
            class="rounded-md px-4 py-2 text-sm font-medium transition"
            [class.bg-white]="activeTab() === 'preview'"
            [class.text-indigo-700]="activeTab() === 'preview'"
            [class.shadow-sm]="activeTab() === 'preview'"
            [class.text-slate-600]="activeTab() !== 'preview'"
          >
            Preview
          </button>
        </div>
      }

      @if (loading()) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading...
        </div>
      } @else if (isEditMode() && activeTab() === 'preview') {
        @if (surveyFillData(); as fillData) {
          <app-survey-fill-view [survey]="fillData" [previewMode]="true" />
        } @else {
          <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Save the survey first to preview.
          </div>
        }
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
                <p class="text-sm text-slate-500 mb-3">No categories yet. Add your first category.</p>
              } @else {
                <div class="space-y-4">
                  @for (dim of dimensionsToShow(); track dim.id) {
                    <div class="rounded-lg border border-slate-200 p-4">
                      <div class="flex items-center justify-between">
                        <h4 class="font-medium text-slate-900">{{ dim.title }}</h4>
                        @if (canAddDimension()) {
                          <button
                            type="button"
                            (click)="editCategory(dim)"
                            class="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            Edit
                          </button>
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
                                @if (canAddDimension()) {
                                  <button
                                    type="button"
                                    (click)="removeQuestion(dq.id)"
                                    class="text-red-600 hover:text-red-800"
                                    aria-label="Remove question"
                                  >
                                    <span class="material-symbols-outlined text-[16px]">close</span>
                                  </button>
                                }
                              </li>
                            }
                          </ul>
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
              @if (canAddDimension()) {
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
  protected readonly survey = signal<SurveyFillData | null>(null);
  protected readonly activeTab = signal<'builder' | 'preview'>('builder');
  protected readonly surveyTypes = signal<SurveyTypeOption[]>([]);

  protected readonly surveyForm = form(this.surveyModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' });
    required(schemaPath.surveyTypeId, { message: 'Survey type is required' });
  });

  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly isEditMode = () => !!this.id() && this.id() !== 'new';

  protected readonly surveyFillData = computed((): SurveyFillData | null => {
    const s = this.survey();
    if (!s) return null;
    const model = this.surveyModel();
    return {
      ...s,
      title: model.title || s.title,
      description: model.description || s.description,
    };
  });

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
      this.activeTab.set('builder');
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
            const fillData = toSurveyFillData(s);
            if (fillData) {
              this.survey.set(fillData);
            }
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
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      data: { surveyId: s.id },
      width: '700px',
      role: 'dialog',
      ariaLabel: 'Add category',
    });
    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.submitError.set(null);
        this.loadSurvey(s.id);
      }
    });
  }

  protected setActiveTab(tab: 'builder' | 'preview'): void {
    this.activeTab.set(tab);
  }

  protected editCategory(dim: BuilderDimension): void {
    const s = this.survey();
    if (!s || !this.canAddDimension()) return;
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      data: {
        surveyId: s.id,
        dimensionId: dim.id,
        dimension: {
          title: dim.title,
          description: dim.description,
          mainQuestionText: dim.mainQuestionText,
          dimensionQuestions: dim.dimensionQuestions ?? [],
        },
      },
      width: '700px',
      role: 'dialog',
      ariaLabel: 'Edit category',
    });
    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.submitError.set(null);
        this.loadSurvey(s.id);
      }
    });
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
