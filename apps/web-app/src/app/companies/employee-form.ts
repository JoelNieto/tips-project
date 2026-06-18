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
import { Dialog } from '@angular/cdk/dialog';
import {
  form,
  FormField,
  required,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import ConfirmDialogComponent from '../shared/confirm-dialog/confirm-dialog';
import {
  CREATE_EMPLOYEE_MUTATION,
  DELETE_EMPLOYEE_MUTATION,
  EMPLOYEE_QUERY,
  EMPLOYEES_QUERY,
  UPDATE_EMPLOYEE_MUTATION,
} from './graphql/employees.graphql';
import { POSITIONS_QUERY } from './graphql/positions.graphql';

type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

interface PositionOption {
  id: string;
  name: string;
  code: string;
}

interface EmployeeFormModel {
  firstName: string;
  lastName: string;
  documentId: string;
  gender: Gender;
  email: string;
  birthdate: string;
  enrollmentDate: string;
  offDate: string;
  status: EmployeeStatus;
  positionId: string;
}

const emptyModel: EmployeeFormModel = {
  firstName: '',
  lastName: '',
  documentId: '',
  gender: 'PREFER_NOT_TO_SAY',
  email: '',
  birthdate: '',
  enrollmentDate: '',
  offDate: '',
  status: 'ACTIVE',
  positionId: '',
};

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [FormField, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a
          [routerLink]="['/dashboard/companies', id()]"
          class="text-slate-500 hover:text-slate-700"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">
            {{ isEditMode() ? 'Edit employee' : 'Create employee' }}
          </h2>
          <p class="mt-1 text-slate-500">
            {{ isEditMode() ? 'Update employee details' : 'Add a new employee' }}
          </p>
        </div>
      </div>

      @if (loading()) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading...
        </div>
      } @else {
        <form
          (submit)="onSubmit($event)"
          class="space-y-6 rounded-xl border border-slate-200 bg-white p-6"
        >
          @if (submitError()) {
            <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {{ submitError() }}
            </div>
          }

          <div class="border-b border-slate-200 pb-6">
            <h3 class="text-lg font-medium text-slate-900 mb-4">Personal information</h3>
            <div class="grid gap-6 sm:grid-cols-2">
              <div>
                <label for="firstName" class="block text-sm font-medium text-slate-700">
                  First name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  [formField]="employeeForm.firstName"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
                @if (employeeForm.firstName().touched() && employeeForm.firstName().invalid()) {
                  <p class="mt-1 text-sm text-red-600">First name is required</p>
                }
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-slate-700">
                  Last name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  [formField]="employeeForm.lastName"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
                @if (employeeForm.lastName().touched() && employeeForm.lastName().invalid()) {
                  <p class="mt-1 text-sm text-red-600">Last name is required</p>
                }
              </div>

              <div>
                <label for="documentId" class="block text-sm font-medium text-slate-700">
                  Document ID *
                </label>
                <input
                  id="documentId"
                  type="text"
                  [formField]="employeeForm.documentId"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
                @if (employeeForm.documentId().touched() && employeeForm.documentId().invalid()) {
                  <p class="mt-1 text-sm text-red-600">Document ID is required</p>
                }
              </div>

              <div>
                <label for="gender" class="block text-sm font-medium text-slate-700">Gender *</label>
                <select
                  id="gender"
                  [formField]="employeeForm.gender"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label for="birthdate" class="block text-sm font-medium text-slate-700">
                  Birthdate
                </label>
                <input
                  id="birthdate"
                  type="date"
                  [formField]="employeeForm.birthdate"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-slate-700">Email *</label>
                <input
                  id="email"
                  type="email"
                  [formField]="employeeForm.email"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
                @if (employeeForm.email().touched() && employeeForm.email().invalid()) {
                  <p class="mt-1 text-sm text-red-600">Email is required</p>
                }
              </div>
            </div>
          </div>

          <div class="border-b border-slate-200 pb-6">
            <h3 class="text-lg font-medium text-slate-900 mb-4">Employment information</h3>
            <div class="grid gap-6 sm:grid-cols-2">
              <div>
                <label for="enrollmentDate" class="block text-sm font-medium text-slate-700">
                  Enrollment date *
                </label>
                <input
                  id="enrollmentDate"
                  type="date"
                  [formField]="employeeForm.enrollmentDate"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
                @if (employeeForm.enrollmentDate().touched() && employeeForm.enrollmentDate().invalid()) {
                  <p class="mt-1 text-sm text-red-600">Enrollment date is required</p>
                }
              </div>

              <div>
                <label for="offDate" class="block text-sm font-medium text-slate-700">
                  Off date
                </label>
                <input
                  id="offDate"
                  type="date"
                  [formField]="employeeForm.offDate"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label for="positionId" class="block text-sm font-medium text-slate-700">
                  Position
                </label>
                <select
                  id="positionId"
                  [formField]="employeeForm.positionId"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">No position</option>
                  @for (position of positions(); track position.id) {
                    <option [value]="position.id">{{ position.name }} ({{ position.code }})</option>
                  }
                </select>
              </div>

              <div>
                <label for="status" class="block text-sm font-medium text-slate-700">Status *</label>
                <select
                  id="status"
                  [formField]="employeeForm.status"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On leave</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              [disabled]="employeeForm().invalid() || submitting()"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{ submitting() ? 'Saving...' : (isEditMode() ? 'Update' : 'Create') }}
            </button>
            <a
              [routerLink]="isEditMode() ? ['/dashboard/companies', id(), 'employees', employeeId()] : ['/dashboard/companies', id()]"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </a>
            @if (isEditMode()) {
              <button
                type="button"
                [disabled]="submitting()"
                (click)="onDelete()"
                class="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 transition"
              >
                Delete
              </button>
            }
          </div>
        </form>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class EmployeeFormComponent {
  private readonly apollo = inject(Apollo);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input.required<string>();
  readonly employeeId = input<string | undefined>(undefined);

  protected readonly employeeModel = signal<EmployeeFormModel>({ ...emptyModel });
  protected readonly employeeForm = form(this.employeeModel, (schemaPath) => {
    required(schemaPath.firstName, { message: 'First name is required' });
    required(schemaPath.lastName, { message: 'Last name is required' });
    required(schemaPath.documentId, { message: 'Document ID is required' });
    required(schemaPath.email, { message: 'Email is required' });
    required(schemaPath.enrollmentDate, { message: 'Enrollment date is required' });
  });

  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly positions = signal<PositionOption[]>([]);

  protected readonly isEditMode = () => {
    const employeeId = this.employeeId();
    return !!employeeId && employeeId !== 'new';
  };

  constructor() {
    effect(() => {
      const companyId = this.id();
      const employeeId = this.employeeId();

      if (companyId) {
        this.loadPositions(companyId);
      }

      if (employeeId && employeeId !== 'new') {
        this.loadEmployee(employeeId);
      } else {
        this.loading.set(false);
        this.employeeModel.set({ ...emptyModel });
      }
    });
  }

  private loadPositions(companyId: string): void {
    this.apollo
      .watchQuery<{ positions: PositionOption[] }>({
        query: POSITIONS_QUERY,
        variables: { companyId },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.data?.positions) {
            this.positions.set(result.data.positions as PositionOption[]);
          }
        },
      });
  }

  private loadEmployee(employeeId: string): void {
    this.loading.set(true);
    this.apollo
      .watchQuery<{ employee: Record<string, unknown> | null }>({
        query: EMPLOYEE_QUERY,
        variables: { id: employeeId },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          const employee = result.data?.employee;
          if (employee && typeof employee === 'object') {
            this.employeeModel.set({
              firstName: (employee['firstName'] as string) ?? '',
              lastName: (employee['lastName'] as string) ?? '',
              documentId: (employee['documentId'] as string) ?? '',
              gender: (employee['gender'] as Gender) ?? 'PREFER_NOT_TO_SAY',
              email: (employee['email'] as string) ?? '',
              birthdate: this.toDateInputValue(employee['birthdate'] as string | null),
              enrollmentDate: this.toDateInputValue(
                employee['enrollmentDate'] as string
              ),
              offDate: this.toDateInputValue(employee['offDate'] as string | null),
              status: (employee['status'] as EmployeeStatus) ?? 'ACTIVE',
              positionId: (employee['positionId'] as string) ?? '',
            });
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.submitError.set(err.message ?? 'Failed to load employee');
        },
      });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitError.set(null);
    if (!this.employeeForm().valid()) return;

    const value = this.employeeModel();
    const input = {
      firstName: value.firstName,
      lastName: value.lastName,
      documentId: value.documentId,
      gender: value.gender,
      email: value.email,
      birthdate: value.birthdate || undefined,
      enrollmentDate: value.enrollmentDate,
      offDate: value.offDate || undefined,
      status: value.status,
      companyId: this.id(),
      positionId: value.positionId || undefined,
    };

    if (this.isEditMode()) {
      this.submitting.set(true);
      this.apollo
        .mutate({
          mutation: UPDATE_EMPLOYEE_MUTATION,
          variables: {
            id: this.employeeId(),
            input: {
              firstName: input.firstName,
              lastName: input.lastName,
              documentId: input.documentId,
              gender: input.gender,
              email: input.email,
              birthdate: input.birthdate,
              enrollmentDate: input.enrollmentDate,
              offDate: input.offDate,
              status: input.status,
              positionId: input.positionId ?? null,
            },
          },
          refetchQueries: [
            { query: EMPLOYEES_QUERY, variables: { companyId: this.id() } },
          ],
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate([
              '/dashboard/companies',
              this.id(),
              'employees',
              this.employeeId(),
            ]);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(err.message ?? 'Failed to update employee');
          },
        });
    } else {
      this.submitting.set(true);
      this.apollo
        .mutate<{ createEmployee: { id: string } }>({
          mutation: CREATE_EMPLOYEE_MUTATION,
          variables: { input },
          refetchQueries: [
            { query: EMPLOYEES_QUERY, variables: { companyId: this.id() } },
          ],
        })
        .subscribe({
          next: (result) => {
            this.submitting.set(false);
            const createdId = result.data?.createEmployee.id;
            if (createdId) {
              this.router.navigate([
                '/dashboard/companies',
                this.id(),
                'employees',
                createdId,
              ]);
            }
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(err.message ?? 'Failed to create employee');
          },
        });
    }
  }

  protected onDelete(): void {
    if (!this.isEditMode() || !this.employeeId()) return;

    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: 'Delete employee',
        message:
          'Are you sure you want to delete this employee? This action cannot be undone.',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        confirmDanger: true,
      },
      role: 'alertdialog',
      ariaModal: true,
      ariaLabel: 'Delete employee confirmation',
      width: '400px',
    });

    dialogRef.closed.subscribe((result) => {
      if (result === true) {
        this.submitting.set(true);
        this.submitError.set(null);
        this.apollo
          .mutate({
            mutation: DELETE_EMPLOYEE_MUTATION,
            variables: { id: this.employeeId() },
            refetchQueries: [
              { query: EMPLOYEES_QUERY, variables: { companyId: this.id() } },
            ],
          })
          .subscribe({
            next: () => {
              this.submitting.set(false);
              this.router.navigate(['/dashboard/companies', this.id()]);
            },
            error: (err) => {
              this.submitting.set(false);
              this.submitError.set(err.message ?? 'Failed to delete employee');
            },
          });
      }
    });
  }

  private toDateInputValue(value: string | null | undefined): string {
    if (!value) return '';
    return value.slice(0, 10);
  }
}
