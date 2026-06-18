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
import { RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { EMPLOYEES_QUERY } from './graphql/employees.graphql';
import { POSITIONS_QUERY } from './graphql/positions.graphql';

type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

interface PositionSummary {
  id: string;
  name: string;
  code: string;
}

interface EmployeeListItem {
  id: string;
  firstName: string;
  lastName: string;
  documentId: string;
  email: string;
  enrollmentDate: string;
  status: EmployeeStatus;
  position?: PositionSummary | null;
}

const STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ON_LEAVE: 'On leave',
  TERMINATED: 'Terminated',
};

const STATUS_CLASSES: Record<EmployeeStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-slate-100 text-slate-700',
  ON_LEAVE: 'bg-amber-100 text-amber-800',
  TERMINATED: 'bg-red-100 text-red-800',
};

@Component({
  selector: 'app-company-employees',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-lg font-medium text-slate-900">Employees</h3>
          <p class="mt-1 text-sm text-slate-500">Manage company employees</p>
        </div>
        <a
          [routerLink]="['/dashboard/companies', companyId(), 'employees', 'new']"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          Add employee
        </a>
      </div>

      <div class="flex flex-col gap-4 sm:flex-row">
        <div class="flex-1">
          <label for="search" class="sr-only">Search employees</label>
          <input
            id="search"
            type="search"
            placeholder="Search by name, email, or document ID..."
            [value]="searchText()"
            (input)="onSearchInput($event)"
            class="block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div class="sm:w-64">
          <label for="positionFilter" class="sr-only">Filter by position</label>
          <select
            id="positionFilter"
            [value]="positionFilter()"
            (change)="onPositionFilterChange($event)"
            class="block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All positions</option>
            @for (position of positions(); track position.id) {
              <option [value]="position.id">{{ position.name }}</option>
            }
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading employees...
        </div>
      } @else if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p class="font-medium">Failed to load employees</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (filteredEmployees().length === 0) {
        <div class="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span class="material-symbols-outlined text-4xl text-slate-300">group</span>
          @if (employees().length === 0) {
            <p class="mt-4 text-slate-600">No employees yet</p>
            <p class="mt-1 text-sm text-slate-500">Add your first employee to get started</p>
          } @else {
            <p class="mt-4 text-slate-600">No employees match your filters</p>
            <p class="mt-1 text-sm text-slate-500">Try adjusting your search or position filter</p>
          }
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
                  Document ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Position
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Enrollment date
                </th>
                <th class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              @for (employee of filteredEmployees(); track employee.id) {
                <tr class="hover:bg-slate-50">
                  <td class="whitespace-nowrap px-6 py-4">
                    <a
                      [routerLink]="['/dashboard/companies', companyId(), 'employees', employee.id]"
                      class="font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {{ employee.firstName }} {{ employee.lastName }}
                    </a>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {{ employee.documentId }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {{ employee.position?.name ?? '—' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4">
                    <span
                      class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                      [class]="statusClass(employee.status)"
                    >
                      {{ statusLabel(employee.status) }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {{ employee.email }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {{ formatDate(employee.enrollmentDate) }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <a
                      [routerLink]="['/dashboard/companies', companyId(), 'employees', employee.id]"
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
export default class CompanyEmployeesComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);

  readonly companyId = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly employees = signal<EmployeeListItem[]>([]);
  protected readonly positions = signal<PositionSummary[]>([]);
  protected readonly searchText = signal('');
  protected readonly positionFilter = signal('');

  protected readonly filteredEmployees = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    const positionId = this.positionFilter();

    return this.employees().filter((employee) => {
      const matchesPosition =
        !positionId || employee.position?.id === positionId;

      if (!query) {
        return matchesPosition;
      }

      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const matchesText =
        fullName.includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.documentId.toLowerCase().includes(query);

      return matchesPosition && matchesText;
    });
  });

  constructor() {
    effect(() => {
      const companyId = this.companyId();
      if (companyId) {
        this.loadEmployees(companyId);
        this.loadPositions(companyId);
      }
    });
  }

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchText.set(target.value);
  }

  protected onPositionFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.positionFilter.set(target.value);
  }

  protected statusLabel(status: EmployeeStatus): string {
    return STATUS_LABELS[status];
  }

  protected statusClass(status: EmployeeStatus): string {
    return STATUS_CLASSES[status];
  }

  protected formatDate(value: string): string {
    return new Date(value).toLocaleDateString();
  }

  private loadEmployees(companyId: string): void {
    this.loading.set(true);
    this.apollo
      .watchQuery<{ employees: EmployeeListItem[] }>({
        query: EMPLOYEES_QUERY,
        variables: { companyId },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          if (result.data?.employees) {
            this.employees.set(result.data.employees as EmployeeListItem[]);
            this.error.set(null);
          }
          if (result.error) {
            this.error.set(result.error.message);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message ?? 'Failed to load employees');
        },
      });
  }

  private loadPositions(companyId: string): void {
    this.apollo
      .watchQuery<{ positions: PositionSummary[] }>({
        query: POSITIONS_QUERY,
        variables: { companyId },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.data?.positions) {
            this.positions.set(result.data.positions as PositionSummary[]);
          }
        },
      });
  }
}
