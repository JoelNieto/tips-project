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
import { RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import CompanyEmployeesComponent from './company-employees';
import CompanyPositionsComponent from './company-positions';
import { COMPANY_QUERY } from './graphql/companies.graphql';

interface CompanyDetail {
  id: string;
  name: string;
  legalName?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  taxId?: string | null;
  logo?: string | null;
  industry?: string | null;
  size?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string; email: string } | null;
}

@Component({
  selector: 'app-company-home',
  standalone: true,
  imports: [RouterLink, CompanyPositionsComponent, CompanyEmployeesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <a routerLink="/dashboard/companies" class="text-slate-500 hover:text-slate-700">
            <span class="material-symbols-outlined">arrow_back</span>
          </a>
          <div>
            <h2 class="text-2xl font-bold text-slate-900">
              {{ company()?.name ?? 'Company details' }}
            </h2>
            <p class="mt-1 text-slate-500">Company home</p>
          </div>
        </div>
        <a
          [routerLink]="['/dashboard/companies', id(), 'edit']"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          <span class="material-symbols-outlined text-[20px]">edit</span>
          Edit company
        </a>
      </div>

      <div class="border-b border-slate-200">
        <nav class="-mb-px flex gap-6" aria-label="Company sections">
          <button
            type="button"
            class="border-b-2 px-1 py-3 text-sm font-medium transition"
            [class.border-indigo-600]="activeTab() === 'info'"
            [class.text-indigo-600]="activeTab() === 'info'"
            [class.border-transparent]="activeTab() !== 'info'"
            [class.text-slate-500]="activeTab() !== 'info'"
            [class.hover:text-slate-700]="activeTab() !== 'info'"
            (click)="activeTab.set('info')"
          >
            Info
          </button>
          <button
            type="button"
            class="border-b-2 px-1 py-3 text-sm font-medium transition"
            [class.border-indigo-600]="activeTab() === 'employees'"
            [class.text-indigo-600]="activeTab() === 'employees'"
            [class.border-transparent]="activeTab() !== 'employees'"
            [class.text-slate-500]="activeTab() !== 'employees'"
            [class.hover:text-slate-700]="activeTab() !== 'employees'"
            (click)="activeTab.set('employees')"
          >
            Employees
          </button>
          <button
            type="button"
            class="border-b-2 px-1 py-3 text-sm font-medium transition"
            [class.border-indigo-600]="activeTab() === 'hierarchy'"
            [class.text-indigo-600]="activeTab() === 'hierarchy'"
            [class.border-transparent]="activeTab() !== 'hierarchy'"
            [class.text-slate-500]="activeTab() !== 'hierarchy'"
            [class.hover:text-slate-700]="activeTab() !== 'hierarchy'"
            (click)="activeTab.set('hierarchy')"
          >
            Hierarchy
          </button>
        </nav>
      </div>

      @if (loading()) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading company...
        </div>
      } @else if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p class="font-medium">Failed to load company</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (company(); as c) {
        @if (activeTab() === 'info') {
        <div class="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
          @if (c.logo) {
            <img
              [src]="c.logo"
              [alt]="c.name + ' logo'"
              class="h-16 w-16 rounded-lg border border-slate-200 object-cover"
            />
          }

          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">Legal name</p>
              <p class="mt-1 text-sm text-slate-900">{{ c.legalName ?? '—' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">Industry</p>
              <p class="mt-1 text-sm text-slate-900">{{ c.industry ?? '—' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">Company size</p>
              <p class="mt-1 text-sm text-slate-900">{{ c.size ?? '—' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">Tax ID</p>
              <p class="mt-1 text-sm text-slate-900">{{ c.taxId ?? '—' }}</p>
            </div>
          </div>

          <div>
            <p class="text-xs uppercase tracking-wide text-slate-500">Description</p>
            <p class="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{{ c.description ?? '—' }}</p>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <h3 class="text-lg font-medium text-slate-900">Contact</h3>
          <dl class="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">Email</dt>
              <dd class="mt-1 text-sm text-slate-900">{{ c.email ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">Phone</dt>
              <dd class="mt-1 text-sm text-slate-900">{{ c.phone ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">Website</dt>
              <dd class="mt-1 text-sm">
                @if (c.website) {
                  <a
                    [href]="c.website"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-indigo-600 hover:text-indigo-800"
                  >
                    {{ c.website }}
                  </a>
                } @else {
                  <span class="text-slate-900">—</span>
                }
              </dd>
            </div>
          </dl>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <h3 class="text-lg font-medium text-slate-900">Address</h3>
          <dl class="mt-4 grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <dt class="text-xs uppercase tracking-wide text-slate-500">Street</dt>
              <dd class="mt-1 text-sm text-slate-900">{{ c.street ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">City</dt>
              <dd class="mt-1 text-sm text-slate-900">{{ c.city ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">State</dt>
              <dd class="mt-1 text-sm text-slate-900">{{ c.state ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">Postal code</dt>
              <dd class="mt-1 text-sm text-slate-900">{{ c.postalCode ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">Country</dt>
              <dd class="mt-1 text-sm text-slate-900">{{ c.country ?? '—' }}</dd>
            </div>
          </dl>
        </div>
        } @else if (activeTab() === 'employees') {
          <app-company-employees [companyId]="id()" />
        } @else {
          <app-company-positions [companyId]="id()" />
        }
      } @else {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Company not found.
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
export default class CompanyHomeComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly company = signal<CompanyDetail | null>(null);
  protected readonly activeTab = signal<'info' | 'employees' | 'hierarchy'>('info');

  constructor() {
    effect(() => {
      const companyId = this.id();
      if (companyId) {
        this.loadCompany(companyId);
      }
    });
  }

  private loadCompany(id: string): void {
    this.loading.set(true);
    this.apollo
      .watchQuery<{ company: CompanyDetail | null }>({
        query: COMPANY_QUERY,
        variables: { id },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          const company = result.data?.company;
          if (this.isCompanyDetail(company)) {
            this.company.set(company);
            this.error.set(null);
          } else if (!result.loading) {
            this.company.set(null);
          }
          if (result.error) {
            this.error.set(result.error.message);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message ?? 'Failed to load company');
        },
      });
  }

  private isCompanyDetail(value: unknown): value is CompanyDetail {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const record = value as Record<string, unknown>;
    return (
      typeof record['id'] === 'string' &&
      typeof record['name'] === 'string' &&
      typeof record['createdAt'] === 'string' &&
      typeof record['updatedAt'] === 'string'
    );
  }
}
