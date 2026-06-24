import { Dialog } from '@angular/cdk/dialog';
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
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import ConfirmDialogComponent from '../shared/confirm-dialog/confirm-dialog';
import CategoryFormDialogComponent from './category-form-dialog';
import SurveyFillViewComponent from './fill/survey-fill-view';
import type { FillDimension, SurveyFillData } from './fill/survey-fill.types';
import { toSurveyFillData } from './fill/survey-fill.utils';
import {
  CREATE_SURVEY_MUTATION,
  DELETE_SURVEY_MUTATION,
  REMOVE_QUESTION_FROM_DIMENSION_MUTATION,
  SURVEY_QUERY,
  SURVEYS_QUERY,
  UPDATE_SURVEY_MUTATION,
} from './graphql/surveys.graphql';

interface SurveyFormModel {
  title: string;
  description: string;
  categoryName: string;
  subcategoryName: string;
  hasCategories: boolean;
  hasSubcategories: boolean;
  visibleCategories: boolean;
  visibleSubcategories: boolean;
  randomizeQuestions: boolean;
  presentAllQuestionsAtOnce: boolean;
  allowPreviousQuestion: boolean;
}

type BuilderDimension = FillDimension;

const emptyModel: SurveyFormModel = {
  title: '',
  description: '',
  categoryName: '',
  subcategoryName: '',
  hasCategories: false,
  hasSubcategories: false,
  visibleCategories: false,
  visibleSubcategories: false,
  randomizeQuestions: false,
  presentAllQuestionsAtOnce: true,
  allowPreviousQuestion: false,
};

@Component({
  selector: 'app-survey-form',
  standalone: true,
  imports: [FormField, RouterLink, SurveyFillViewComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a
          routerLink="/dashboard/surveys"
          class="text-slate-500 hover:text-slate-700"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">
            {{
              isEditMode()
                ? ('surveys.form.editTitle' | translate)
                : ('surveys.form.createTitle' | translate)
            }}
          </h2>
          <p class="mt-1 text-slate-500">
            {{
              isEditMode()
                ? ('surveys.form.editSubtitle' | translate)
                : ('surveys.form.createSubtitle' | translate)
            }}
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
            {{ 'surveys.form.tabBuilder' | translate }}
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
            {{ 'surveys.form.tabPreview' | translate }}
          </button>
          <a
            role="tab"
            [routerLink]="['/dashboard/surveys', id(), 'assignations']"
            class="rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-indigo-700"
          >
            {{ 'surveys.form.tabAssignations' | translate }}
          </a>
        </div>
      }

      @if (loading()) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
        >
          {{ 'surveys.form.loading' | translate }}
        </div>
      } @else if (isEditMode() && activeTab() === 'preview') {
        @if (surveyFillData(); as fillData) {
          <app-survey-fill-view [survey]="fillData" [previewMode]="true" />
        } @else {
          <div
            class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
          >
            {{ 'surveys.form.previewSaveFirst' | translate }}
          </div>
        }
      } @else {
        <form (submit)="onSubmit($event)" class="space-y-6">
          <div class="rounded-xl border border-slate-200 bg-white p-6">
            @if (submitError()) {
              <div
                class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm mb-4"
              >
                {{ submitError() }}
              </div>
            }

            <div class="space-y-4">
              <div>
                <label
                  for="title"
                  class="block text-sm font-medium text-slate-700"
                  >{{ 'surveys.form.title' | translate }} *</label
                >
                <input
                  id="title"
                  type="text"
                  [formField]="surveyForm.title"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
                @if (
                  surveyForm.title().touched() && surveyForm.title().invalid()
                ) {
                  <p class="mt-1 text-sm text-red-600">
                    {{
                      (surveyForm.title().errors()[0]?.message ??
                        'surveys.form.titleRequired') | translate
                    }}
                  </p>
                }
              </div>
              <div>
                <label
                  for="description"
                  class="block text-sm font-medium text-slate-700"
                  >{{ 'surveys.form.description' | translate }}</label
                >
                <textarea
                  id="description"
                  [formField]="surveyForm.description"
                  rows="3"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                ></textarea>
              </div>
            </div>
          </div>

          <div
            class="rounded-xl border border-slate-200 bg-white p-6 space-y-6"
          >
            <div class="border-b border-slate-200 pb-6">
              <h3 class="text-lg font-medium text-slate-900 mb-4">
                {{ 'surveys.form.categoriesConfig' | translate }}
              </h3>
              <div class="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    for="categoryName"
                    class="block text-sm font-medium text-slate-700"
                    >{{ 'surveys.form.categoryLabel' | translate }}</label
                  >
                  <input
                    id="categoryName"
                    type="text"
                    [formField]="surveyForm.categoryName"
                    [placeholder]="'surveys.form.categoryLabelPlaceholder' | translate"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    for="subcategoryName"
                    class="block text-sm font-medium text-slate-700"
                    >{{ 'surveys.form.subcategoryLabel' | translate }}</label
                  >
                  <input
                    id="subcategoryName"
                    type="text"
                    [formField]="surveyForm.subcategoryName"
                    [placeholder]="'surveys.form.subcategoryLabelPlaceholder' | translate"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div class="mt-4 space-y-3">
                <div class="flex items-center gap-2">
                  <input
                    id="hasCategories"
                    type="checkbox"
                    [formField]="surveyForm.hasCategories"
                    class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    for="hasCategories"
                    class="text-sm font-medium text-slate-700"
                    >{{ 'surveys.form.hasCategories' | translate }}</label
                  >
                </div>
                <div class="flex items-center gap-2">
                  <input
                    id="hasSubcategories"
                    type="checkbox"
                    [formField]="surveyForm.hasSubcategories"
                    class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    for="hasSubcategories"
                    class="text-sm font-medium text-slate-700"
                    >{{ 'surveys.form.hasSubcategories' | translate }}</label
                  >
                </div>
              </div>
            </div>

            <div class="border-b border-slate-200 pb-6">
              <h3 class="text-lg font-medium text-slate-900 mb-4">
                {{ 'surveys.form.visibility' | translate }}
              </h3>
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <input
                    id="visibleCategories"
                    type="checkbox"
                    [formField]="surveyForm.visibleCategories"
                    class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    for="visibleCategories"
                    class="text-sm font-medium text-slate-700"
                    >{{ 'surveys.form.visibleCategories' | translate }}</label
                  >
                </div>
                <div class="flex items-center gap-2">
                  <input
                    id="visibleSubcategories"
                    type="checkbox"
                    [formField]="surveyForm.visibleSubcategories"
                    class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    for="visibleSubcategories"
                    class="text-sm font-medium text-slate-700"
                    >{{ 'surveys.form.visibleSubcategories' | translate }}</label
                  >
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium text-slate-900 mb-4">
                {{ 'surveys.form.behavior' | translate }}
              </h3>
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <input
                    id="randomizeQuestions"
                    type="checkbox"
                    [formField]="surveyForm.randomizeQuestions"
                    class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    for="randomizeQuestions"
                    class="text-sm font-medium text-slate-700"
                    >{{ 'surveys.form.randomizeQuestions' | translate }}</label
                  >
                </div>
                <div class="flex items-center gap-2">
                  <input
                    id="presentAllQuestionsAtOnce"
                    type="checkbox"
                    [formField]="surveyForm.presentAllQuestionsAtOnce"
                    class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    for="presentAllQuestionsAtOnce"
                    class="text-sm font-medium text-slate-700"
                    >{{ 'surveys.form.presentAllAtOnce' | translate }}</label
                  >
                </div>
                @if (!surveyModel().presentAllQuestionsAtOnce) {
                  <div class="flex items-center gap-2 pl-6">
                    <input
                      id="allowPreviousQuestion"
                      type="checkbox"
                      [formField]="surveyForm.allowPreviousQuestion"
                      class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      for="allowPreviousQuestion"
                      class="text-sm font-medium text-slate-700"
                      >{{ 'surveys.form.allowPreviousQuestion' | translate }}</label
                    >
                  </div>
                }
              </div>
            </div>
          </div>

          @if (isEditMode() && survey()) {
            <div class="rounded-xl border border-slate-200 bg-white p-6">
              <h3 class="text-lg font-medium text-slate-900 mb-4">
                {{ 'surveys.form.dimensions' | translate }}
              </h3>
              @if (dimensionsToShow().length === 0) {
                <p class="text-sm text-slate-500 mb-3">
                  {{ emptyDimensionsMessage() | translate }}
                </p>
              } @else {
                <div class="space-y-4">
                  @for (dim of dimensionsToShow(); track dim.id) {
                    <div class="rounded-lg border border-slate-200 p-4">
                      <div class="flex items-center justify-between">
                        <h4 class="font-medium text-slate-900">
                          {{ dim.title }}
                        </h4>
                        @if (canManageDimensionQuestions()) {
                          <button
                            type="button"
                            (click)="editCategory(dim)"
                            class="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            {{ dimensionActionLabel() | translate }}
                          </button>
                        }
                      </div>
                      @if (dim.description) {
                        <p class="mt-1 text-sm text-slate-500">
                          {{ dim.description }}
                        </p>
                      }
                      @if (dim.mainQuestionText) {
                        <p class="mt-2 text-sm italic">
                          {{ dim.mainQuestionText }}
                        </p>
                      }
                      <div class="mt-3">
                        <p class="text-xs font-medium text-slate-500">
                          {{
                            'surveys.form.questionsCount' | translate: {
                              count: dim.dimensionQuestions.length,
                            }
                          }}
                        </p>
                        @if (dim.dimensionQuestions.length) {
                          <ul class="mt-1 space-y-1">
                            @for (dq of dim.dimensionQuestions; track dq.id) {
                              <li class="flex items-center gap-2 text-sm">
                                <span>{{ dq.question.text }}</span>
                                @if (canManageDimensionQuestions()) {
                                  <button
                                    type="button"
                                    (click)="removeQuestion(dq.id)"
                                    class="text-red-600 hover:text-red-800"
                                    [attr.aria-label]="
                                      'surveys.form.removeQuestion' | translate
                                    "
                                  >
                                    <span
                                      class="material-symbols-outlined text-[16px]"
                                      >close</span
                                    >
                                  </button>
                                }
                              </li>
                            }
                          </ul>
                        }
                      </div>
                      @if (canAddSubdimension() && dim.subdimensions?.length) {
                        <div class="mt-4 pl-4 border-l-2 border-slate-200">
                          <p class="text-xs font-medium text-slate-500">
                            {{ 'surveys.form.subdimensions' | translate }}
                          </p>
                          @for (sub of dim.subdimensions; track sub.id) {
                            <div
                              class="mt-2 flex items-center justify-between text-sm"
                            >
                              <span>{{ sub.title }}</span>
                              @if (canManageDimensionQuestions()) {
                                <button
                                  type="button"
                                  (click)="editSubdimension(sub)"
                                  class="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                  {{ 'common.edit' | translate }}
                                </button>
                              }
                            </div>
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
                  {{ 'surveys.form.addDimension' | translate }}
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
              {{
                submitting()
                  ? ('surveys.form.saving' | translate)
                  : isEditMode()
                    ? ('surveys.form.update' | translate)
                    : ('surveys.form.create' | translate)
              }}
            </button>
            <a
              routerLink="/dashboard/surveys"
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
                {{ 'surveys.form.delete' | translate }}
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
  private readonly translate = inject(TranslateService);

  readonly id = input<string | undefined>(undefined);

  protected readonly surveyModel = signal<SurveyFormModel>({ ...emptyModel });
  protected readonly survey = signal<SurveyFillData | null>(null);
  protected readonly activeTab = signal<'builder' | 'preview'>('builder');

  protected readonly surveyForm = form(this.surveyModel, (schemaPath) => {
    required(schemaPath.title, { message: 'surveys.form.titleRequired' });
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
      categoryName: model.categoryName || s.categoryName,
      subcategoryName: model.subcategoryName || s.subcategoryName,
      hasCategories: model.hasCategories,
      hasSubcategories: model.hasSubcategories,
      visibleCategories: model.visibleCategories,
      visibleSubcategories: model.visibleSubcategories,
      randomizeQuestions: model.randomizeQuestions,
      presentAllQuestionsAtOnce: model.presentAllQuestionsAtOnce,
      allowPreviousQuestion: model.allowPreviousQuestion,
    };
  });

  protected readonly dimensionsToShow = () => {
    const s = this.survey();
    return s?.dimensions ?? [];
  };

  protected readonly canAddDimension = () => {
    return this.surveyModel().hasCategories === true;
  };

  protected readonly canAddSubdimension = () => {
    return this.surveyModel().hasSubcategories === true;
  };

  protected readonly canManageDimensionQuestions = () => {
    return !!this.survey();
  };

  protected readonly dimensionActionLabel = () => {
    return this.canAddDimension()
      ? 'common.edit'
      : 'surveys.form.manageQuestions';
  };

  protected readonly emptyDimensionsMessage = () => {
    return this.canAddDimension()
      ? 'surveys.form.noCategoriesYet'
      : 'surveys.form.noQuestionGroup';
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
          if (result.error) {
            this.submitError.set(
              result.error.message ??
                this.translate.instant('surveys.form.loadFailed'),
            );
            return;
          }
          const s = result.data?.survey;
          if (s && typeof s === 'object') {
            this.surveyModel.set({
              title: (s['title'] as string) ?? '',
              description: (s['description'] as string) ?? '',
              categoryName: (s['categoryName'] as string) ?? '',
              subcategoryName: (s['subcategoryName'] as string) ?? '',
              hasCategories: (s['hasCategories'] as boolean) ?? false,
              hasSubcategories: (s['hasSubcategories'] as boolean) ?? false,
              visibleCategories: (s['visibleCategories'] as boolean) ?? false,
              visibleSubcategories:
                (s['visibleSubcategories'] as boolean) ?? false,
              randomizeQuestions: (s['randomizeQuestions'] as boolean) ?? false,
              presentAllQuestionsAtOnce:
                (s['presentAllQuestionsAtOnce'] as boolean) ?? true,
              allowPreviousQuestion:
                (s['allowPreviousQuestion'] as boolean) ?? false,
            });
            const fillData = toSurveyFillData(s);
            if (fillData) {
              this.survey.set(fillData);
            }
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.submitError.set(
            err.message ?? this.translate.instant('surveys.form.loadFailed'),
          );
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
      description: value.description || undefined,
      categoryName: value.categoryName || undefined,
      subcategoryName: value.subcategoryName || undefined,
      hasCategories: value.hasCategories,
      hasSubcategories: value.hasSubcategories,
      visibleCategories: value.visibleCategories,
      visibleSubcategories: value.visibleSubcategories,
      randomizeQuestions: value.randomizeQuestions,
      presentAllQuestionsAtOnce: value.presentAllQuestionsAtOnce,
      allowPreviousQuestion: value.presentAllQuestionsAtOnce
        ? false
        : value.allowPreviousQuestion,
    };

    if (this.isEditMode()) {
      const surveyId = this.id();
      if (!surveyId) return;
      this.submitting.set(true);
      this.apollo
        .mutate({
          mutation: UPDATE_SURVEY_MUTATION,
          variables: { id: surveyId, input },
          refetchQueries: [
            { query: SURVEYS_QUERY },
            { query: SURVEY_QUERY, variables: { id: surveyId } },
          ],
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.loadSurvey(surveyId);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(
              err.message ?? this.translate.instant('surveys.form.updateFailed'),
            );
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
            const created = (res.data as { createSurvey?: { id?: string } })
              ?.createSurvey;
            if (created?.id) {
              this.router.navigate(['/dashboard/surveys', created.id]);
            } else {
              this.router.navigate(['/dashboard/surveys']);
            }
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(
              err.message ?? this.translate.instant('surveys.form.createFailed'),
            );
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
      ariaLabel: this.translate.instant('surveys.form.addCategoryAria'),
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
    if (!s || !this.canManageDimensionQuestions()) return;
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      data: {
        surveyId: s.id,
        dimensionId: dim.id,
        dimension: {
          title: dim.title,
          description: dim.description,
          mainQuestionText: dim.mainQuestionText,
          mainQuestionAnswers: dim.mainQuestionAnswers ?? [],
          scoreRanges: dim.scoreRanges ?? [],
          dimensionQuestions: dim.dimensionQuestions ?? [],
          dimensionQuestionsForBounds: dim.dimensionQuestions ?? [],
        },
      },
      width: '700px',
      role: 'dialog',
      ariaLabel: this.translate.instant('surveys.form.editCategoryAria'),
    });
    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.submitError.set(null);
        this.loadSurvey(s.id);
      }
    });
  }

  protected editSubdimension(sub: BuilderDimension): void {
    const s = this.survey();
    if (!s || !this.canManageDimensionQuestions()) return;
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      data: {
        surveyId: s.id,
        dimensionId: sub.id,
        dimension: {
          title: sub.title,
          description: sub.description,
          mainQuestionText: sub.mainQuestionText,
          mainQuestionAnswers: sub.mainQuestionAnswers ?? [],
          scoreRanges: sub.scoreRanges ?? [],
          dimensionQuestions: sub.dimensionQuestions ?? [],
          dimensionQuestionsForBounds: sub.dimensionQuestions ?? [],
        },
      },
      width: '700px',
      role: 'dialog',
      ariaLabel: this.translate.instant('surveys.form.editSubcategoryAria'),
    });
    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.submitError.set(null);
        this.loadSurvey(s.id);
      }
    });
  }

  protected removeQuestion(dimensionQuestionId: string): void {
    const surveyId = this.id();
    if (!surveyId) return;
    this.submitting.set(true);
    this.apollo
      .mutate({
        mutation: REMOVE_QUESTION_FROM_DIMENSION_MUTATION,
        variables: { dimensionQuestionId },
        refetchQueries: [{ query: SURVEY_QUERY, variables: { id: surveyId } }],
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.loadSurvey(surveyId);
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(
            err.message ??
              this.translate.instant('surveys.form.removeQuestionFailed'),
          );
        },
      });
  }

  protected onDelete(): void {
    if (!this.isEditMode() || !this.id()) return;
    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('surveys.form.deleteTitle'),
        message: this.translate.instant('surveys.form.deleteMessage'),
        confirmLabel: this.translate.instant('surveys.form.deleteConfirm'),
        cancelLabel: this.translate.instant('common.cancel'),
        confirmDanger: true,
      },
      role: 'alertdialog',
      ariaModal: true,
      ariaLabel: this.translate.instant('surveys.form.deleteAriaLabel'),
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
              this.submitError.set(
                err.message ??
                  this.translate.instant('surveys.form.deleteFailed'),
              );
            },
          });
      }
    });
  }
}
