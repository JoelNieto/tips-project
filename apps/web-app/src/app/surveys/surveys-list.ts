import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import ConfirmDialogComponent from '../shared/confirm-dialog/confirm-dialog';
import {
  DELETE_SURVEY_MUTATION,
  DUPLICATE_SURVEY_MUTATION,
  SURVEYS_QUERY,
} from './graphql/surveys.graphql';

interface SurveyListItem {
  id: string;
  title: string;
  description?: string | null;
  hasCategories?: boolean;
  hasSubcategories?: boolean;
  createdBy?: { id: string; name: string } | null;
}

@Component({
  selector: 'app-surveys-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">{{ 'surveys.list.title' | translate }}</h2>
          <p class="mt-1 text-slate-500">{{ 'surveys.list.subtitle' | translate }}</p>
        </div>
        <a
          routerLink="/dashboard/surveys/new"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          {{ 'surveys.list.newSurvey' | translate }}
        </a>
      </div>

      @if (loading()) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
        >
          {{ 'surveys.list.loading' | translate }}
        </div>
      } @else if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p class="font-medium">{{ 'surveys.list.loadFailed' | translate }}</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (surveys().length === 0) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-12 text-center"
        >
          <span class="material-symbols-outlined text-4xl text-slate-300"
            >poll</span
          >
          <p class="mt-4 text-slate-600">{{ 'surveys.list.emptyTitle' | translate }}</p>
          <p class="mt-1 text-sm text-slate-500">
            {{ 'surveys.list.emptySubtitle' | translate }}
          </p>
          <a
            routerLink="/dashboard/surveys/new"
            class="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <span class="material-symbols-outlined text-[20px]">add</span>
            {{ 'surveys.list.newSurvey' | translate }}
          </a>
        </div>
      } @else {
        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  {{ 'surveys.list.columnTitle' | translate }}
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  {{ 'surveys.list.columnStructure' | translate }}
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  {{ 'surveys.list.columnCreatedBy' | translate }}
                </th>
                <th class="relative px-6 py-3">
                  <span class="sr-only">{{ 'surveys.list.actions' | translate }}</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              @for (survey of surveys(); track survey.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-6 py-4">
                    <a
                      [routerLink]="['/dashboard/surveys', survey.id]"
                      class="font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {{ survey.title }}
                    </a>
                    @if (survey.description) {
                      <p class="mt-0.5 text-sm text-slate-500 line-clamp-1">
                        {{ survey.description }}
                      </p>
                    }
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {{ structureLabel(survey) }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {{ survey.createdBy?.name ?? '—' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right">
                    <div class="inline-flex items-center gap-1">
                      <div class="relative group">
                        <a
                          [routerLink]="['/dashboard/surveys', survey.id, 'assignations']"
                          class="inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                        >
                          <span class="material-symbols-outlined text-[20px]">assignment_ind</span>
                        </a>
                        <span class="tooltip-label">{{ 'surveys.list.assign' | translate }}</span>
                      </div>
                      <div class="relative group">
                        <button
                          type="button"
                          [disabled]="duplicatingId() === survey.id"
                          (click)="onDuplicate(survey.id)"
                          class="inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <span class="material-symbols-outlined text-[20px]">
                            {{ duplicatingId() === survey.id ? 'hourglass_empty' : 'content_copy' }}
                          </span>
                        </button>
                        <span class="tooltip-label">{{ 'surveys.list.duplicate' | translate }}</span>
                      </div>
                      <div class="relative group">
                        <a
                          [routerLink]="['/dashboard/surveys', survey.id]"
                          class="inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                        >
                          <span class="material-symbols-outlined text-[20px]">edit</span>
                        </a>
                        <span class="tooltip-label">{{ 'surveys.list.edit' | translate }}</span>
                      </div>
                      <div class="relative group">
                        <button
                          type="button"
                          [disabled]="deletingId() === survey.id"
                          (click)="onDelete(survey)"
                          class="inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <span class="material-symbols-outlined text-[20px]">
                            {{ deletingId() === survey.id ? 'hourglass_empty' : 'delete' }}
                          </span>
                        </button>
                        <span class="tooltip-label">{{ 'surveys.list.delete' | translate }}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .tooltip-label {
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      padding: 3px 8px;
      font-size: 0.75rem;
      line-height: 1rem;
      white-space: nowrap;
      color: #fff;
      background: #1e293b;
      border-radius: 4px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 120ms ease;
    }

    .tooltip-label::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: #1e293b;
    }

    .group:hover .tooltip-label {
      opacity: 1;
    }
  `,
})
export default class SurveysListComponent {
  private readonly apollo = inject(Apollo);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(Dialog);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly surveys = signal<SurveyListItem[]>([]);
  protected readonly duplicatingId = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);

  protected structureLabel(survey: SurveyListItem): string {
    if (survey.hasCategories) {
      return survey.hasSubcategories
        ? this.translate.instant('surveys.list.structureCategorizedSub')
        : this.translate.instant('surveys.list.structureCategorized');
    }
    return this.translate.instant('surveys.list.structureSingleGroup');
  }

  protected onDuplicate(id: string): void {
    this.duplicatingId.set(id);
    this.error.set(null);

    this.apollo
      .mutate<{ duplicateSurvey: { id: string } }>({
        mutation: DUPLICATE_SURVEY_MUTATION,
        variables: { id },
        refetchQueries: [{ query: SURVEYS_QUERY }],
      })
      .subscribe({
        next: (result) => {
          this.duplicatingId.set(null);
          const duplicatedId = result.data?.duplicateSurvey.id;
          if (duplicatedId) {
            void this.router.navigate(['/dashboard/surveys', duplicatedId]);
          }
        },
        error: (err) => {
          this.duplicatingId.set(null);
          this.error.set(
            err.message ?? this.translate.instant('surveys.list.duplicateFailed'),
          );
        },
      });
  }

  protected onDelete(survey: SurveyListItem): void {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('surveys.list.deleteTitle'),
        message: this.translate.instant('surveys.list.deleteMessage', {
          title: survey.title,
        }),
        confirmLabel: this.translate.instant('surveys.list.deleteConfirm'),
        cancelLabel: this.translate.instant('common.cancel'),
        confirmDanger: true,
      },
      role: 'alertdialog',
      ariaModal: true,
      ariaLabel: this.translate.instant('surveys.list.deleteAriaLabel'),
      width: '400px',
    });

    dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result !== true) return;
      this.deletingId.set(survey.id);
      this.error.set(null);

      this.apollo
        .mutate({
          mutation: DELETE_SURVEY_MUTATION,
          variables: { id: survey.id },
          refetchQueries: [{ query: SURVEYS_QUERY }],
        })
        .subscribe({
          next: () => {
            this.deletingId.set(null);
          },
          error: (err) => {
            this.deletingId.set(null);
            this.error.set(
              err.message ?? this.translate.instant('surveys.list.deleteFailed'),
            );
          },
        });
    });
  }

  constructor() {
    this.apollo
      .watchQuery<{ surveys: SurveyListItem[] }>({
        query: SURVEYS_QUERY,
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          if (result.data?.surveys) {
            this.surveys.set(result.data.surveys as SurveyListItem[]);
            this.error.set(null);
          }
          if (result.error) {
            this.error.set(result.error.message);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(
            err.message ?? this.translate.instant('surveys.list.loadFailed'),
          );
        },
      });
  }
}
