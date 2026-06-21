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
import { form, FormField, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { forkJoin } from 'rxjs';
import { COMPANIES_QUERY } from '../companies/graphql/companies.graphql';
import { EMPLOYEES_QUERY } from '../companies/graphql/employees.graphql';
import { POSITIONS_QUERY } from '../companies/graphql/positions.graphql';
import { SURVEY_QUERY } from '../surveys/graphql/surveys.graphql';
import {
  CREATE_SURVEY_ASSIGNATION_MUTATION,
  SURVEY_ASSIGNATIONS_QUERY,
} from './graphql/survey-assignations.graphql';

interface CompanyOption {
  id: string;
  name: string;
}

interface PositionOption {
  id: string;
  name: string;
  code: string;
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  positionId?: string | null;
  position?: { id: string; name: string; code: string } | null;
}

interface InviteeRow {
  email: string;
  name: string;
}

interface AssignationFormModel {
  companyId: string;
  startDate: string;
  expirationDate: string;
  welcomeMessage: string;
}

const emptyModel: AssignationFormModel = {
  companyId: '',
  startDate: '',
  expirationDate: '',
  welcomeMessage: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-survey-assignation-form',
  standalone: true,
  imports: [FormField, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a
          [routerLink]="['/dashboard/surveys', surveyId(), 'assignations']"
          class="text-slate-500 hover:text-slate-700"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">New assignation</h2>
          <p class="mt-1 text-slate-500">
            @if (surveyTitle()) {
              {{ surveyTitle() }}
            }
          </p>
        </div>
      </div>

      <form (submit)="onSubmit($event)" class="space-y-6">
        <div class="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          @if (submitError()) {
            <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {{ submitError() }}
            </div>
          }

          <div>
            <label for="companyId" class="block text-sm font-medium text-slate-700">Company *</label>
            <select
              id="companyId"
              [formField]="assignationForm.companyId"
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select company...</option>
              @for (c of companies(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
            @if (assignationForm.companyId().touched() && assignationForm.companyId().invalid()) {
              <p class="mt-1 text-sm text-red-600">Company is required</p>
            }
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="startDate" class="block text-sm font-medium text-slate-700">Start date *</label>
              <input
                id="startDate"
                type="date"
                [formField]="assignationForm.startDate"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
              @if (assignationForm.startDate().touched() && assignationForm.startDate().invalid()) {
                <p class="mt-1 text-sm text-red-600">Start date is required</p>
              }
            </div>
            <div>
              <label for="expirationDate" class="block text-sm font-medium text-slate-700">Expiration date *</label>
              <input
                id="expirationDate"
                type="date"
                [formField]="assignationForm.expirationDate"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
              @if (assignationForm.expirationDate().touched() && assignationForm.expirationDate().invalid()) {
                <p class="mt-1 text-sm text-red-600">Expiration date is required</p>
              }
            </div>
          </div>

          <div>
            <label for="welcomeMessage" class="block text-sm font-medium text-slate-700">Welcome message</label>
            <textarea
              id="welcomeMessage"
              [formField]="assignationForm.welcomeMessage"
              rows="4"
              placeholder="Message shown to invitees when they open their survey link"
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            ></textarea>
          </div>
        </div>

        @if (assignationModel().companyId) {
          <div class="rounded-xl border border-slate-200 bg-white p-6">
            <div class="mb-4">
              <h3 class="text-lg font-medium text-slate-900">Company employees</h3>
              <p class="mt-1 text-sm text-slate-500">
                Select individual employees to receive the survey
              </p>
            </div>

            @if (companyDataLoading()) {
              <p class="text-sm text-slate-500">Loading employees...</p>
            } @else if (activeEmployees().length === 0) {
              <p class="text-sm text-slate-500">No active employees in this company</p>
            } @else {
              <div class="max-h-64 overflow-y-auto space-y-2 border border-slate-100 rounded-lg p-3">
                @for (emp of activeEmployees(); track emp.id) {
                  <label class="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      [checked]="isEmployeeSelected(emp.id)"
                      (change)="toggleEmployee(emp.id)"
                      class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="flex-1 min-w-0">
                      <span class="block text-sm font-medium text-slate-900">
                        {{ emp.firstName }} {{ emp.lastName }}
                      </span>
                      <span class="block text-xs text-slate-500 truncate">
                        {{ emp.email }}
                        @if (emp.position) {
                          · {{ emp.position.name }}
                        }
                      </span>
                    </span>
                  </label>
                }
              </div>
              <p class="mt-2 text-xs text-slate-500">
                {{ selectedEmployeeIds().size }} employee(s) selected
              </p>
            }
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-6">
            <div class="mb-4">
              <h3 class="text-lg font-medium text-slate-900">Positions</h3>
              <p class="mt-1 text-sm text-slate-500">
                Select positions to include employees directly assigned to them
              </p>
            </div>

            @if (companyDataLoading()) {
              <p class="text-sm text-slate-500">Loading positions...</p>
            } @else if (positions().length === 0) {
              <p class="text-sm text-slate-500">No positions in this company</p>
            } @else {
              <div class="max-h-48 overflow-y-auto space-y-2 border border-slate-100 rounded-lg p-3">
                @for (pos of positions(); track pos.id) {
                  <label class="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      [checked]="isPositionSelected(pos.id)"
                      (change)="togglePosition(pos.id)"
                      class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="flex-1 min-w-0">
                      <span class="block text-sm font-medium text-slate-900">{{ pos.name }}</span>
                      <span class="block text-xs text-slate-500">{{ pos.code }}</span>
                    </span>
                    <span class="text-xs text-slate-400">
                      {{ employeesInPosition(pos.id).length }} active
                    </span>
                  </label>
                }
              </div>
              <p class="mt-2 text-xs text-slate-500">
                {{ selectedPositionIds().size }} position(s) selected
                @if (positionPreviewCount() > 0) {
                  · {{ positionPreviewCount() }} employee(s) from positions
                }
              </p>
            }
          </div>
        }

        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-medium text-slate-900">External invitees</h3>
              <p class="mt-1 text-sm text-slate-500">
                Add people outside the company roster by email only
              </p>
            </div>
            <button
              type="button"
              (click)="addInviteeRow()"
              class="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
            >
              <span class="material-symbols-outlined text-[18px]">add</span>
              Add invitee
            </button>
          </div>

          @if (inviteeError()) {
            <p class="mb-3 text-sm text-red-600">{{ inviteeError() }}</p>
          }

          <div class="space-y-3">
            @for (row of invitees(); track $index) {
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div class="flex-1">
                  <label [for]="'ext-email-' + $index" class="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    [id]="'ext-email-' + $index"
                    type="email"
                    [value]="row.email"
                    (input)="updateInvitee($index, 'email', $any($event.target).value)"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                    placeholder="invitee@example.com"
                  />
                </div>
                <div class="flex-1">
                  <label [for]="'ext-name-' + $index" class="block text-sm font-medium text-slate-700">Name</label>
                  <input
                    [id]="'ext-name-' + $index"
                    type="text"
                    [value]="row.name"
                    (input)="updateInvitee($index, 'name', $any($event.target).value)"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Optional"
                  />
                </div>
                @if (invitees().length > 1) {
                  <button
                    type="button"
                    (click)="removeInviteeRow($index)"
                    class="mt-7 text-slate-400 hover:text-red-600"
                    aria-label="Remove invitee"
                  >
                    <span class="material-symbols-outlined">close</span>
                  </button>
                }
              </div>
            }
          </div>
        </div>

        @if (recipientSummary() > 0) {
          <div class="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
            {{ recipientSummary() }} recipient(s) will be invited
          </div>
        }

        <div class="flex justify-end gap-3">
          <a
            [routerLink]="['/dashboard/surveys', surveyId(), 'assignations']"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </a>
          <button
            type="submit"
            [disabled]="submitting()"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {{ submitting() ? 'Creating...' : 'Create assignation' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class SurveyAssignationFormComponent {
  private readonly apollo = inject(Apollo);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly surveyId = input.required<string>();

  protected readonly assignationModel = signal<AssignationFormModel>({ ...emptyModel });
  protected readonly assignationForm = form(this.assignationModel, (schemaPath) => {
    required(schemaPath.companyId, { message: 'Company is required' });
    required(schemaPath.startDate, { message: 'Start date is required' });
    required(schemaPath.expirationDate, { message: 'Expiration date is required' });
  });

  protected readonly companies = signal<CompanyOption[]>([]);
  protected readonly employees = signal<EmployeeOption[]>([]);
  protected readonly positions = signal<PositionOption[]>([]);
  protected readonly selectedEmployeeIds = signal<Set<string>>(new Set());
  protected readonly selectedPositionIds = signal<Set<string>>(new Set());
  protected readonly invitees = signal<InviteeRow[]>([{ email: '', name: '' }]);
  protected readonly surveyTitle = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly inviteeError = signal<string | null>(null);
  protected readonly companyDataLoading = signal(false);

  protected readonly activeEmployees = computed(() =>
    this.employees().filter((emp) => emp.status === 'ACTIVE')
  );

  protected readonly positionPreviewCount = computed(() => {
    const positionIds = this.selectedPositionIds();
    if (positionIds.size === 0) return 0;
    const emails = new Set<string>();
    for (const emp of this.activeEmployees()) {
      if (emp.positionId && positionIds.has(emp.positionId)) {
        emails.add(emp.email.toLowerCase());
      }
    }
    return emails.size;
  });

  protected readonly recipientSummary = computed(() => {
    const emails = new Set<string>();

    for (const id of this.selectedEmployeeIds()) {
      const emp = this.activeEmployees().find((e) => e.id === id);
      if (emp) emails.add(emp.email.toLowerCase());
    }

    for (const emp of this.activeEmployees()) {
      if (emp.positionId && this.selectedPositionIds().has(emp.positionId)) {
        emails.add(emp.email.toLowerCase());
      }
    }

    for (const row of this.invitees()) {
      const email = row.email.trim().toLowerCase();
      if (email && EMAIL_REGEX.test(email)) {
        emails.add(email);
      }
    }

    return emails.size;
  });

  constructor() {
    this.loadCompanies();
    effect(() => {
      const sid = this.surveyId();
      if (sid) {
        this.loadSurveyTitle(sid);
      }
    });
    effect(() => {
      const companyId = this.assignationModel().companyId;
      this.selectedEmployeeIds.set(new Set());
      this.selectedPositionIds.set(new Set());
      if (companyId) {
        this.loadCompanyData(companyId);
      } else {
        this.employees.set([]);
        this.positions.set([]);
      }
    });
  }

  private loadCompanies(): void {
    this.apollo
      .watchQuery<{ companies: CompanyOption[] }>({ query: COMPANIES_QUERY })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.data?.companies) {
            this.companies.set(result.data.companies as CompanyOption[]);
          }
        },
      });
  }

  private loadSurveyTitle(surveyId: string): void {
    this.apollo
      .watchQuery<{ survey: { title: string } | null }>({
        query: SURVEY_QUERY,
        variables: { id: surveyId },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.surveyTitle.set(result.data?.survey?.title ?? null);
        },
      });
  }

  private loadCompanyData(companyId: string): void {
    this.companyDataLoading.set(true);
    forkJoin({
      employees: this.apollo.query<{ employees: EmployeeOption[] }>({
        query: EMPLOYEES_QUERY,
        variables: { companyId },
        fetchPolicy: 'network-only',
      }),
      positions: this.apollo.query<{ positions: PositionOption[] }>({
        query: POSITIONS_QUERY,
        variables: { companyId },
        fetchPolicy: 'network-only',
      }),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ employees, positions }) => {
          this.employees.set(employees.data?.employees ?? []);
          this.positions.set(positions.data?.positions ?? []);
          this.companyDataLoading.set(false);
        },
        error: () => {
          this.companyDataLoading.set(false);
        },
      });
  }

  protected employeesInPosition(positionId: string): EmployeeOption[] {
    return this.activeEmployees().filter((emp) => emp.positionId === positionId);
  }

  protected isEmployeeSelected(id: string): boolean {
    return this.selectedEmployeeIds().has(id);
  }

  protected isPositionSelected(id: string): boolean {
    return this.selectedPositionIds().has(id);
  }

  protected toggleEmployee(id: string): void {
    this.selectedEmployeeIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  protected togglePosition(id: string): void {
    this.selectedPositionIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  protected addInviteeRow(): void {
    this.invitees.update((rows) => [...rows, { email: '', name: '' }]);
  }

  protected removeInviteeRow(index: number): void {
    this.invitees.update((rows) => rows.filter((_, i) => i !== index));
  }

  protected updateInvitee(
    index: number,
    field: keyof InviteeRow,
    value: string
  ): void {
    this.invitees.update((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitError.set(null);
    this.inviteeError.set(null);

    if (!this.assignationForm().valid()) return;

    const value = this.assignationModel();
    const startDate = new Date(value.startDate);
    startDate.setHours(0, 0, 0, 0);
    const expirationDate = new Date(value.expirationDate);
    expirationDate.setHours(23, 59, 59, 999);
    if (startDate >= expirationDate) {
      this.submitError.set('Expiration date must be after start date');
      return;
    }

    const inviteeInputs = this.invitees()
      .map((row) => ({
        email: row.email.trim(),
        name: row.name.trim() || undefined,
      }))
      .filter((row) => row.email.length > 0);

    const invalidEmails = inviteeInputs.filter((row) => !EMAIL_REGEX.test(row.email));
    if (invalidEmails.length > 0) {
      this.inviteeError.set('One or more external invitee emails are invalid');
      return;
    }

    const seen = new Set<string>();
    const dedupedInvitees = inviteeInputs.filter((row) => {
      const key = row.email.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const employeeIds = [...this.selectedEmployeeIds()];
    const positionIds = [...this.selectedPositionIds()];

    if (
      dedupedInvitees.length === 0 &&
      employeeIds.length === 0 &&
      positionIds.length === 0
    ) {
      this.inviteeError.set(
        'Select at least one employee, position, or external invitee'
      );
      return;
    }

    this.submitting.set(true);
    this.apollo
      .mutate<{ createSurveyAssignation: { id: string } }>({
        mutation: CREATE_SURVEY_ASSIGNATION_MUTATION,
        variables: {
          input: {
            surveyId: this.surveyId(),
            companyId: value.companyId,
            welcomeMessage: value.welcomeMessage.trim() || undefined,
            startDate: startDate.toISOString(),
            expirationDate: expirationDate.toISOString(),
            invitees: dedupedInvitees.length > 0 ? dedupedInvitees : undefined,
            employeeIds: employeeIds.length > 0 ? employeeIds : undefined,
            positionIds: positionIds.length > 0 ? positionIds : undefined,
          },
        },
        refetchQueries: [
          {
            query: SURVEY_ASSIGNATIONS_QUERY,
            variables: { surveyId: this.surveyId() },
          },
        ],
      })
      .subscribe({
        next: (result) => {
          this.submitting.set(false);
          const id = result.data?.createSurveyAssignation?.id;
          if (id) {
            this.router.navigate([
              '/dashboard/surveys',
              this.surveyId(),
              'assignations',
              id,
            ]);
          }
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(err.message ?? 'Failed to create assignation');
        },
      });
  }
}
