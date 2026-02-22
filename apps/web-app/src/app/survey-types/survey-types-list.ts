import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { SURVEY_TYPES_QUERY } from './graphql/survey-types.graphql';

interface SurveyTypeListItem {
  id: string;
  name: string;
  description?: string | null;
  code?: string | null;
  isActive: boolean;
  createdBy?: { id: string; name: string; email: string } | null;
}

@Component({
  selector: 'app-survey-types-list',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Survey Types</h2>
          <p class="mt-1 text-slate-500">Manage survey type configurations</p>
        </div>
        <a
          routerLink="/dashboard/survey-types/new"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          Add survey type
        </a>
      </div>

      @if (loading()) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading survey types...
        </div>
      } @else if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p class="font-medium">Failed to load survey types</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (surveyTypes().length === 0) {
        <div class="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span class="material-symbols-outlined text-4xl text-slate-300">poll</span>
          <p class="mt-4 text-slate-600">No survey types yet</p>
          <p class="mt-1 text-sm text-slate-500">Create your first survey type to get started</p>
          <a
            routerLink="/dashboard/survey-types/new"
            class="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <span class="material-symbols-outlined text-[20px]">add</span>
            Add survey type
          </a>
        </div>
      } @else {
        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Code
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Created by
                </th>
                <th class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              @for (surveyType of surveyTypes(); track surveyType.id) {
                <tr class="hover:bg-slate-50">
                  <td class="whitespace-nowrap px-6 py-4">
                    <a
                      [routerLink]="['/dashboard/survey-types', surveyType.id]"
                      class="font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {{ surveyType.name }}
                    </a>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {{ surveyType.code ?? '—' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4">
                    <span
                      class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                      [class.bg-green-100]="surveyType.isActive"
                      [class.text-green-800]="surveyType.isActive"
                      [class.bg-slate-100]="!surveyType.isActive"
                      [class.text-slate-800]="!surveyType.isActive"
                    >
                      {{ surveyType.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {{ surveyType.createdBy?.name ?? '—' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <a
                      [routerLink]="['/dashboard/survey-types', surveyType.id]"
                      class="text-indigo-600 hover:text-indigo-800"
                    >
                      View
                    </a>
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
  `,
})
export default class SurveyTypesListComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly surveyTypes = signal<SurveyTypeListItem[]>([]);

  constructor() {
    this.apollo
      .watchQuery<{ surveyTypes: SurveyTypeListItem[] }>({
        query: SURVEY_TYPES_QUERY,
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          if (result.data?.surveyTypes) {
            this.surveyTypes.set(result.data.surveyTypes as SurveyTypeListItem[]);
            this.error.set(null);
          }
          if (result.error) {
            this.error.set(result.error.message);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message ?? 'Failed to load survey types');
        },
      });
  }
}
