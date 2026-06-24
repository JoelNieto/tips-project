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
import { COMPANIES_QUERY } from './graphql/companies.graphql';

interface CompanyListItem {
  id: string;
  name: string;
  email?: string | null;
  createdBy?: { id: string; name: string; email: string } | null;
}

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">
            {{ 'companies.list.title' | translate }}
          </h2>
          <p class="mt-1 text-slate-500">{{ 'companies.list.subtitle' | translate }}</p>
        </div>
        <a
          routerLink="/dashboard/companies/new"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          {{ 'companies.list.addCompany' | translate }}
        </a>
      </div>

      @if (loading()) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          {{ 'companies.list.loading' | translate }}
        </div>
      } @else if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p class="font-medium">{{ 'companies.list.loadFailed' | translate }}</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (companies().length === 0) {
        <div class="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span class="material-symbols-outlined text-4xl text-slate-300">business</span>
          <p class="mt-4 text-slate-600">{{ 'companies.list.emptyTitle' | translate }}</p>
          <p class="mt-1 text-sm text-slate-500">
            {{ 'companies.list.emptySubtitle' | translate }}
          </p>
          <a
            routerLink="/dashboard/companies/new"
            class="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <span class="material-symbols-outlined text-[20px]">add</span>
            {{ 'companies.list.addCompany' | translate }}
          </a>
        </div>
      } @else {
        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  {{ 'companies.list.columnName' | translate }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  {{ 'companies.list.columnEmail' | translate }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  {{ 'companies.list.columnCreatedBy' | translate }}
                </th>
                <th class="relative px-6 py-3">
                  <span class="sr-only">{{ 'companies.list.actions' | translate }}</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              @for (company of companies(); track company.id) {
                <tr class="hover:bg-slate-50">
                  <td class="whitespace-nowrap px-6 py-4">
                    <a
                      [routerLink]="['/dashboard/companies', company.id]"
                      class="font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {{ company.name }}
                    </a>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {{ company.email ?? '—' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {{ company.createdBy?.name ?? '—' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <a
                      [routerLink]="['/dashboard/companies', company.id]"
                      class="text-indigo-600 hover:text-indigo-800"
                    >
                      {{ 'companies.list.view' | translate }}
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
export default class CompaniesListComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly companies = signal<CompanyListItem[]>([]);

  constructor() {
    this.apollo
      .watchQuery<{ companies: CompanyListItem[] }>({
        query: COMPANIES_QUERY,
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          if (result.data?.companies) {
            this.companies.set(result.data.companies as CompanyListItem[]);
            this.error.set(null);
          }
          if (result.error) {
            this.error.set(result.error.message);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(
            err.message ?? this.translate.instant('companies.list.loadFailed'),
          );
        },
      });
  }
}
