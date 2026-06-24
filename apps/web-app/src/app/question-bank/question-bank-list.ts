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
import { QUESTIONS_QUERY } from './graphql/questions.graphql';

interface QuestionListItem {
  id: string;
  title: string;
  text: string;
  weight?: number | null;
  isReversed: boolean;
  isMultiAnswer: boolean;
  createdBy?: { id: string; name: string; email: string } | null;
  answerSet?: { id: string; name: string; answers: { id: string }[] } | null;
}

@Component({
  selector: 'app-question-bank-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">{{ 'questionBank.list.title' | translate }}</h2>
          <p class="mt-1 text-slate-500">{{ 'questionBank.list.subtitle' | translate }}</p>
        </div>
        <a
          routerLink="/dashboard/question-bank/new"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          {{ 'questionBank.list.addQuestion' | translate }}
        </a>
      </div>

      @if (loading()) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
        >
          {{ 'questionBank.list.loading' | translate }}
        </div>
      } @else if (error()) {
        <div
          class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
        >
          <p class="font-medium">{{ 'questionBank.list.loadFailed' | translate }}</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (questions().length === 0) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-12 text-center"
        >
          <span class="material-symbols-outlined text-4xl text-slate-300"
            >quiz</span
          >
          <p class="mt-4 text-slate-600">{{ 'questionBank.list.emptyTitle' | translate }}</p>
          <p class="mt-1 text-sm text-slate-500">
            {{ 'questionBank.list.emptySubtitle' | translate }}
          </p>
          <a
            routerLink="/dashboard/question-bank/new"
            class="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <span class="material-symbols-outlined text-[20px]">add</span>
            {{ 'questionBank.list.addQuestion' | translate }}
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
                  {{ 'questionBank.list.columnTitle' | translate }}
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  {{ 'questionBank.list.columnAnswerSet' | translate }}
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  {{ 'questionBank.list.columnCreatedBy' | translate }}
                </th>
                <th class="relative px-6 py-3">
                  <span class="sr-only">{{ 'questionBank.list.actions' | translate }}</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              @for (question of questions(); track question.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-6 py-4">
                    <a
                      [routerLink]="['/dashboard/question-bank', question.id]"
                      class="font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {{ question.title }}
                    </a>
                    <p class="mt-0.5 text-sm text-slate-500 line-clamp-1">
                      {{ question.text }}
                    </p>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    @if (question.answerSet) {
                      {{ question.answerSet.name }}
                      <span class="text-slate-400"
                        >({{ question.answerSet.answers.length }})</span
                      >
                    } @else {
                      —
                    }
                  </td>
                  <td
                    class="whitespace-nowrap px-6 py-4 text-sm text-slate-500"
                  >
                    {{ question.createdBy?.name ?? '—' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <a
                      [routerLink]="['/dashboard/question-bank', question.id]"
                      class="text-indigo-600 hover:text-indigo-800"
                    >
                      {{ 'questionBank.list.edit' | translate }}
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
export default class QuestionBankListComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly questions = signal<QuestionListItem[]>([]);

  constructor() {
    this.apollo
      .watchQuery<{ questions: QuestionListItem[] }>({
        query: QUESTIONS_QUERY,
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          if (result.data?.questions) {
            this.questions.set(result.data.questions as QuestionListItem[]);
            this.error.set(null);
          }
          if (result.error) {
            this.error.set(result.error.message);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(
            err.message ?? this.translate.instant('questionBank.list.loadFailed'),
          );
        },
      });
  }
}
