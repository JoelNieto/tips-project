import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { ANSWER_SETS_QUERY } from './graphql/answer-sets.graphql';

interface AnswerSetListItem {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  createdBy?: { id: string; name: string; email: string } | null;
  answers: { id: string }[];
}

@Component({
  selector: 'app-answer-set-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">{{ 'answerSets.list.title' | translate }}</h2>
          <p class="mt-1 text-slate-500">{{ 'answerSets.list.subtitle' | translate }}</p>
        </div>
        <a
          routerLink="/dashboard/answer-sets/new"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          {{ 'answerSets.list.addAnswerSet' | translate }}
        </a>
      </div>

      @if (loading()) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
        >
          {{ 'answerSets.list.loading' | translate }}
        </div>
      } @else if (error()) {
        <div
          class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
        >
          <p class="font-medium">{{ 'answerSets.list.loadFailed' | translate }}</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (answerSets().length === 0) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-12 text-center"
        >
          <span class="material-symbols-outlined text-4xl text-slate-300"
            >list_alt</span
          >
          <p class="mt-4 text-slate-600">{{ 'answerSets.list.emptyTitle' | translate }}</p>
          <p class="mt-1 text-sm text-slate-500">
            {{ 'answerSets.list.emptySubtitle' | translate }}
          </p>
          <a
            routerLink="/dashboard/answer-sets/new"
            class="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <span class="material-symbols-outlined text-[20px]">add</span>
            {{ 'answerSets.list.addAnswerSet' | translate }}
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
                  {{ 'answerSets.list.columnName' | translate }}
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  {{ 'answerSets.list.columnAnswers' | translate }}
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  {{ 'answerSets.list.columnCreatedBy' | translate }}
                </th>
                <th class="relative px-6 py-3">
                  <span class="sr-only">{{ 'answerSets.list.actions' | translate }}</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              @for (set of answerSets(); track set.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-6 py-4">
                    <a
                      [routerLink]="['/dashboard/answer-sets', set.id]"
                      class="font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {{ set.name }}
                    </a>
                    @if (set.description) {
                      <p class="mt-0.5 text-sm text-slate-500 line-clamp-1">
                        {{ set.description }}
                      </p>
                    }
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {{ 'answerSets.list.answersCount' | translate: { count: set.answers.length } }}
                  </td>
                  <td
                    class="whitespace-nowrap px-6 py-4 text-sm text-slate-500"
                  >
                    {{ set.createdBy?.name ?? '—' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <a
                      [routerLink]="['/dashboard/answer-sets', set.id]"
                      class="text-indigo-600 hover:text-indigo-800"
                    >
                      {{ 'answerSets.list.edit' | translate }}
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
export default class AnswerSetListComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly answerSets = signal<AnswerSetListItem[]>([]);

  constructor() {
    this.apollo
      .watchQuery<{ answerSets: AnswerSetListItem[] }>({
        query: ANSWER_SETS_QUERY,
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          if (result.data?.answerSets) {
            this.answerSets.set(result.data.answerSets as AnswerSetListItem[]);
            this.error.set(null);
          }
          if (result.error) {
            this.error.set(result.error.message);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(
            err.message ?? this.translate.instant('answerSets.list.loadFailed'),
          );
        },
      });
  }
}
