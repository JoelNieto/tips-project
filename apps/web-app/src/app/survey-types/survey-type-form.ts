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
  SURVEY_TYPES_QUERY,
  SURVEY_TYPE_QUERY,
  CREATE_SURVEY_TYPE_MUTATION,
  DELETE_SURVEY_TYPE_MUTATION,
  UPDATE_SURVEY_TYPE_MUTATION,
} from './graphql/survey-types.graphql';
import ConfirmDialogComponent from '../shared/confirm-dialog/confirm-dialog';

interface SurveyTypeFormModel {
  name: string;
  description: string;
  code: string;
  isActive: boolean;
  categoryName: string;
  subcategoryName: string;
  hasCategories: boolean;
  hasSubcategories: boolean;
  visibleCategories: boolean;
  visibleSubcategories: boolean;
  randomizeQuestions: boolean;
}

const emptyModel: SurveyTypeFormModel = {
  name: '',
  description: '',
  code: '',
  isActive: true,
  categoryName: '',
  subcategoryName: '',
  hasCategories: false,
  hasSubcategories: false,
  visibleCategories: false,
  visibleSubcategories: false,
  randomizeQuestions: false,
};

@Component({
  selector: 'app-survey-type-form',
  standalone: true,
  imports: [FormField, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a
          routerLink="/dashboard/survey-types"
          class="text-slate-500 hover:text-slate-700"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">
            {{ isEditMode() ? 'Edit survey type' : 'Create survey type' }}
          </h2>
          <p class="mt-1 text-slate-500">
            {{
              isEditMode()
                ? 'Update survey type configuration'
                : 'Add a new survey type'
            }}
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

          <div class="border-b border-slate-200 pb-6">
            <h3 class="text-lg font-medium text-slate-900 mb-4">Basic info</h3>
            <div class="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-slate-700"
                  >Name *</label
                >
                <input
                  id="name"
                  type="text"
                  [formField]="surveyTypeForm.name"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
                @if (surveyTypeForm.name().touched() &&
                surveyTypeForm.name().invalid()) {
                  <p class="mt-1 text-sm text-red-600">Name is required</p>
                }
              </div>
              <div>
                <label
                  for="code"
                  class="block text-sm font-medium text-slate-700"
                  >Code</label
                >
                <input
                  id="code"
                  type="text"
                  [formField]="surveyTypeForm.code"
                  placeholder="e.g. employee_engagement"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div class="mt-4">
              <label
                for="description"
                class="block text-sm font-medium text-slate-700"
                >Description</label
              >
              <textarea
                id="description"
                [formField]="surveyTypeForm.description"
                rows="3"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              ></textarea>
            </div>
            <div class="mt-4 flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                [formField]="surveyTypeForm.isActive"
                class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label for="isActive" class="text-sm font-medium text-slate-700"
                >Active</label
              >
            </div>
          </div>

          <div class="border-b border-slate-200 pb-6">
            <h3 class="text-lg font-medium text-slate-900 mb-4">
              Categories configuration
            </h3>
            <div class="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  for="categoryName"
                  class="block text-sm font-medium text-slate-700"
                  >Category label (custom name for categories)</label
                >
                <input
                  id="categoryName"
                  type="text"
                  [formField]="surveyTypeForm.categoryName"
                  placeholder="e.g. dimensions, competencies"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  for="subcategoryName"
                  class="block text-sm font-medium text-slate-700"
                  >Subcategory label</label
                >
                <input
                  id="subcategoryName"
                  type="text"
                  [formField]="surveyTypeForm.subcategoryName"
                  placeholder="e.g. sub-dimensions"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div class="mt-4 space-y-3">
              <div class="flex items-center gap-2">
                <input
                  id="hasCategories"
                  type="checkbox"
                  [formField]="surveyTypeForm.hasCategories"
                  class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  for="hasCategories"
                  class="text-sm font-medium text-slate-700"
                  >Has categories</label
                >
              </div>
              <div class="flex items-center gap-2">
                <input
                  id="hasSubcategories"
                  type="checkbox"
                  [formField]="surveyTypeForm.hasSubcategories"
                  class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  for="hasSubcategories"
                  class="text-sm font-medium text-slate-700"
                  >Has subcategories</label
                >
              </div>
            </div>
          </div>

          <div class="border-b border-slate-200 pb-6">
            <h3 class="text-lg font-medium text-slate-900 mb-4">Visibility</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <input
                  id="visibleCategories"
                  type="checkbox"
                  [formField]="surveyTypeForm.visibleCategories"
                  class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  for="visibleCategories"
                  class="text-sm font-medium text-slate-700"
                  >Visible categories (show as sections when filling survey)</label
                >
              </div>
              <div class="flex items-center gap-2">
                <input
                  id="visibleSubcategories"
                  type="checkbox"
                  [formField]="surveyTypeForm.visibleSubcategories"
                  class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  for="visibleSubcategories"
                  class="text-sm font-medium text-slate-700"
                  >Visible subcategories</label
                >
              </div>
            </div>
          </div>

          <div class="border-b border-slate-200 pb-6">
            <h3 class="text-lg font-medium text-slate-900 mb-4">Behavior</h3>
            <div class="flex items-center gap-2">
              <input
                id="randomizeQuestions"
                type="checkbox"
                [formField]="surveyTypeForm.randomizeQuestions"
                class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                for="randomizeQuestions"
                class="text-sm font-medium text-slate-700"
                >Randomize question order when filling survey</label
              >
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 pt-4">
            <button
              type="submit"
              [disabled]="surveyTypeForm().invalid() || submitting()"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{
                submitting()
                  ? 'Saving...'
                  : isEditMode()
                    ? 'Update'
                    : 'Create'
              }}
            </button>
            <a
              routerLink="/dashboard/survey-types"
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
export default class SurveyTypeFormComponent {
  private readonly apollo = inject(Apollo);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input<string | undefined>(undefined);

  protected readonly surveyTypeModel = signal<SurveyTypeFormModel>({
    ...emptyModel,
  });

  protected readonly surveyTypeForm = form(this.surveyTypeModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required' });
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
      const surveyTypeId = this.id();
      if (surveyTypeId && surveyTypeId !== 'new') {
        this.loadSurveyType(surveyTypeId);
      } else {
        this.loading.set(false);
        this.surveyTypeModel.set({ ...emptyModel });
      }
    });
  }

  private loadSurveyType(id: string): void {
    this.loading.set(true);
    this.apollo
      .watchQuery<{ surveyType: Record<string, unknown> | null }>({
        query: SURVEY_TYPE_QUERY,
        variables: { id },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          const surveyType = result.data?.surveyType;
          if (surveyType && typeof surveyType === 'object') {
            this.surveyTypeModel.set({
              name: (surveyType['name'] as string) ?? '',
              description: (surveyType['description'] as string) ?? '',
              code: (surveyType['code'] as string) ?? '',
              isActive: (surveyType['isActive'] as boolean) ?? true,
              categoryName: (surveyType['categoryName'] as string) ?? '',
              subcategoryName: (surveyType['subcategoryName'] as string) ?? '',
              hasCategories: (surveyType['hasCategories'] as boolean) ?? false,
              hasSubcategories:
                (surveyType['hasSubcategories'] as boolean) ?? false,
              visibleCategories:
                (surveyType['visibleCategories'] as boolean) ?? false,
              visibleSubcategories:
                (surveyType['visibleSubcategories'] as boolean) ?? false,
              randomizeQuestions:
                (surveyType['randomizeQuestions'] as boolean) ?? false,
            });
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.submitError.set(err.message ?? 'Failed to load survey type');
        },
      });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitError.set(null);
    if (!this.surveyTypeForm().valid()) return;

    const value = this.surveyTypeModel();
    const input = {
      name: value.name,
      description: value.description || undefined,
      code: value.code || undefined,
      isActive: value.isActive,
      categoryName: value.categoryName || undefined,
      subcategoryName: value.subcategoryName || undefined,
      hasCategories: value.hasCategories,
      hasSubcategories: value.hasSubcategories,
      visibleCategories: value.visibleCategories,
      visibleSubcategories: value.visibleSubcategories,
      randomizeQuestions: value.randomizeQuestions,
    };

    if (this.isEditMode()) {
      this.submitting.set(true);
      this.apollo
        .mutate({
          mutation: UPDATE_SURVEY_TYPE_MUTATION,
          variables: { id: this.id(), input },
          refetchQueries: [{ query: SURVEY_TYPES_QUERY }],
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/dashboard/survey-types']);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(
              err.message ?? 'Failed to update survey type'
            );
          },
        });
    } else {
      this.submitting.set(true);
      this.apollo
        .mutate({
          mutation: CREATE_SURVEY_TYPE_MUTATION,
          variables: { input },
          refetchQueries: [{ query: SURVEY_TYPES_QUERY }],
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/dashboard/survey-types']);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(
              err.message ?? 'Failed to create survey type'
            );
          },
        });
    }
  }

  protected onDelete(): void {
    if (!this.isEditMode() || !this.id()) return;

    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: 'Delete survey type',
        message:
          'Are you sure you want to delete this survey type? This action cannot be undone.',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        confirmDanger: true,
      },
      role: 'alertdialog',
      ariaModal: true,
      ariaLabel: 'Delete survey type confirmation',
      width: '400px',
    });

    dialogRef.closed.subscribe((result) => {
      if (result === true) {
        this.submitting.set(true);
        this.submitError.set(null);
        this.apollo
          .mutate({
            mutation: DELETE_SURVEY_TYPE_MUTATION,
            variables: { id: this.id() },
            refetchQueries: [{ query: SURVEY_TYPES_QUERY }],
          })
          .subscribe({
            next: () => {
              this.submitting.set(false);
              this.router.navigate(['/dashboard/survey-types']);
            },
            error: (err) => {
              this.submitting.set(false);
              this.submitError.set(
                err.message ?? 'Failed to delete survey type'
              );
            },
          });
      }
    });
  }
}
