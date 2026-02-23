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
import { QUESTIONS_QUERY } from './graphql/questions.graphql';

interface QuestionListItem {
  id: string;
  title: string;
  text: string;
  weight?: number | null;
  isReversed: boolean;
  isMultiAnswer: boolean;
  createdBy?: { id: string; name: string; email: string } | null;
  answers: { id: string }[];
}

@Component({
  selector: 'app-question-bank-list',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Question Bank</h2>
          <p class="mt-1 text-slate-500">
            Reusable questions for your surveys
          </p>
        </div>
        <a
          routerLink="/dashboard/question-bank/new"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          Add question
        </a>
      </div>

      @if (loading()) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
        >
          Loading questions...
        </div>
      } @else if (error()) {
        <div
          class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
        >
          <p class="font-medium">Failed to load questions</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (questions().length === 0) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-12 text-center"
        >
          <span class="material-symbols-outlined text-4xl text-slate-300"
            >quiz</span
          >
          <p class="mt-4 text-slate-600">No questions yet</p>
          <p class="mt-1 text-sm text-slate-500">
            Create your first question to use in surveys
          </p>
          <a
            routerLink="/dashboard/question-bank/new"
            class="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <span class="material-symbols-outlined text-[20px]">add</span>
            Add question
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
                  Answers
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
                    {{ question.answers?.length ?? 0 }} answers
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
export default class QuestionBankListComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);

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
          this.error.set(err.message ?? 'Failed to load questions');
        },
      });
  }
}
