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
import { SURVEYS_QUERY } from './graphql/surveys.graphql';

interface SurveyListItem {
  id: string;
  title: string;
  description?: string | null;
  surveyType?: { id: string; name: string } | null;
  createdBy?: { id: string; name: string } | null;
}

@Component({
  selector: 'app-surveys-list',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Surveys</h2>
          <p class="mt-1 text-slate-500">Create and manage your surveys</p>
        </div>
        <a
          routerLink="/dashboard/surveys/new"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          New survey
        </a>
      </div>

      @if (loading()) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
        >
          Loading surveys...
        </div>
      } @else if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p class="font-medium">Failed to load surveys</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (surveys().length === 0) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-12 text-center"
        >
          <span class="material-symbols-outlined text-4xl text-slate-300"
            >poll</span
          >
          <p class="mt-4 text-slate-600">No surveys yet</p>
          <p class="mt-1 text-sm text-slate-500">
            Create your first survey to get started
          </p>
          <a
            routerLink="/dashboard/surveys/new"
            class="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <span class="material-symbols-outlined text-[20px]">add</span>
            New survey
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
                  Title
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  Type
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  Created by
                </th>
                <th class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
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
                    {{ survey.surveyType?.name ?? '—' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {{ survey.createdBy?.name ?? '—' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <a
                      [routerLink]="['/dashboard/surveys', survey.id]"
                      class="text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
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
export default class SurveysListComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly surveys = signal<SurveyListItem[]>([]);

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
          this.error.set(err.message ?? 'Failed to load surveys');
        },
      });
  }
}
