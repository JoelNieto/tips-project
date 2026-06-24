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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { EMPLOYEE_QUERY } from './graphql/employees.graphql';

type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

interface EmployeeDetail {
  id: string;
  firstName: string;
  lastName: string;
  documentId: string;
  gender: Gender;
  email: string;
  birthdate?: string | null;
  enrollmentDate: string;
  offDate?: string | null;
  status: EmployeeStatus;
  companyId: string;
  positionId?: string | null;
  position?: { id: string; name: string; code: string } | null;
  createdAt: string;
  updatedAt: string;
}

const GENDER_KEYS: Record<Gender, string> = {
  MALE: 'companies.employeeForm.genderMale',
  FEMALE: 'companies.employeeForm.genderFemale',
  OTHER: 'companies.employeeForm.genderOther',
  PREFER_NOT_TO_SAY: 'companies.employeeForm.genderPreferNotToSay',
};

const STATUS_KEYS: Record<EmployeeStatus, string> = {
  ACTIVE: 'companies.employees.statusActive',
  INACTIVE: 'companies.employees.statusInactive',
  ON_LEAVE: 'companies.employees.statusOnLeave',
  TERMINATED: 'companies.employees.statusTerminated',
};

const STATUS_CLASSES: Record<EmployeeStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-slate-100 text-slate-700',
  ON_LEAVE: 'bg-amber-100 text-amber-800',
  TERMINATED: 'bg-red-100 text-red-800',
};

@Component({
  selector: 'app-employee-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <a
            [routerLink]="['/dashboard/companies', id()]"
            class="text-slate-500 hover:text-slate-700"
          >
            <span class="material-symbols-outlined">arrow_back</span>
          </a>
          <div>
            <h2 class="text-2xl font-bold text-slate-900">
              {{
                employee()
                  ? employee()!.firstName + ' ' + employee()!.lastName
                  : ('companies.employeeHome.defaultTitle' | translate)
              }}
            </h2>
            <p class="mt-1 text-slate-500">{{ 'companies.employeeHome.subtitle' | translate }}</p>
          </div>
        </div>
        @if (employee()) {
          <a
            [routerLink]="['/dashboard/companies', id(), 'employees', employeeId(), 'edit']"
            class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <span class="material-symbols-outlined text-[20px]">edit</span>
            {{ 'companies.employeeHome.editEmployee' | translate }}
          </a>
        }
      </div>

      @if (loading()) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          {{ 'companies.employeeHome.loading' | translate }}
        </div>
      } @else if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p class="font-medium">{{ 'companies.employeeHome.loadFailed' | translate }}</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (employee(); as e) {
        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <h3 class="text-lg font-medium text-slate-900">
            {{ 'companies.employeeForm.personalInfo' | translate }}
          </h3>
          <dl class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">
                {{ 'companies.employeeForm.firstName' | translate }}
              </dt>
              <dd class="mt-1 text-sm text-slate-900">{{ e.firstName }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">
                {{ 'companies.employeeForm.lastName' | translate }}
              </dt>
              <dd class="mt-1 text-sm text-slate-900">{{ e.lastName }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">
                {{ 'companies.employeeForm.documentId' | translate }}
              </dt>
              <dd class="mt-1 text-sm text-slate-900">{{ e.documentId }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">
                {{ 'companies.employeeForm.gender' | translate }}
              </dt>
              <dd class="mt-1 text-sm text-slate-900">{{ genderLabel(e.gender) }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">
                {{ 'companies.employeeForm.birthdate' | translate }}
              </dt>
              <dd class="mt-1 text-sm text-slate-900">{{ formatDate(e.birthdate) }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">
                {{ 'companies.employeeForm.email' | translate }}
              </dt>
              <dd class="mt-1 text-sm text-slate-900">{{ e.email }}</dd>
            </div>
          </dl>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <h3 class="text-lg font-medium text-slate-900">
            {{ 'companies.employeeForm.employmentInfo' | translate }}
          </h3>
          <dl class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">
                {{ 'companies.employeeForm.enrollmentDate' | translate }}
              </dt>
              <dd class="mt-1 text-sm text-slate-900">{{ formatDate(e.enrollmentDate) }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">
                {{ 'companies.employeeForm.offDate' | translate }}
              </dt>
              <dd class="mt-1 text-sm text-slate-900">{{ formatDate(e.offDate) }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">
                {{ 'companies.employeeForm.position' | translate }}
              </dt>
              <dd class="mt-1 text-sm text-slate-900">
                @if (e.position) {
                  {{ e.position.name }} ({{ e.position.code }})
                } @else {
                  —
                }
              </dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">
                {{ 'companies.employeeForm.status' | translate }}
              </dt>
              <dd class="mt-1">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                  [class]="statusClass(e.status)"
                >
                  {{ statusLabel(e.status) }}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      } @else {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          {{ 'companies.employeeHome.notFound' | translate }}
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
export default class EmployeeHomeComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly id = input.required<string>();
  readonly employeeId = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly employee = signal<EmployeeDetail | null>(null);

  constructor() {
    effect(() => {
      const employeeId = this.employeeId();
      if (employeeId) {
        this.loadEmployee(employeeId);
      }
    });
  }

  protected genderLabel(gender: Gender): string {
    return this.translate.instant(GENDER_KEYS[gender]);
  }

  protected statusLabel(status: EmployeeStatus): string {
    return this.translate.instant(STATUS_KEYS[status]);
  }

  protected statusClass(status: EmployeeStatus): string {
    return STATUS_CLASSES[status];
  }

  protected formatDate(value?: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString();
  }

  private loadEmployee(employeeId: string): void {
    this.loading.set(true);
    this.apollo
      .watchQuery<{ employee: EmployeeDetail | null }>({
        query: EMPLOYEE_QUERY,
        variables: { id: employeeId },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          const employee = result.data?.employee;
          if (this.isEmployeeDetail(employee)) {
            this.employee.set(employee);
            this.error.set(null);
          } else if (!result.loading) {
            this.employee.set(null);
          }
          if (result.error) {
            this.error.set(result.error.message);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(
            err.message ?? this.translate.instant('companies.employeeHome.loadFailed'),
          );
        },
      });
  }

  private isEmployeeDetail(value: unknown): value is EmployeeDetail {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const record = value as Record<string, unknown>;
    return (
      typeof record['id'] === 'string' &&
      typeof record['firstName'] === 'string' &&
      typeof record['lastName'] === 'string' &&
      typeof record['documentId'] === 'string' &&
      typeof record['email'] === 'string' &&
      typeof record['enrollmentDate'] === 'string'
    );
  }
}
