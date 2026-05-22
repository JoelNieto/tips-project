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
import { form, FormField, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { COMPANIES_QUERY } from '../companies/graphql/companies.graphql';
import { SURVEY_QUERY } from '../surveys/graphql/surveys.graphql';
import {
  CREATE_SURVEY_ASSIGNATION_MUTATION,
  SURVEY_ASSIGNATIONS_QUERY,
} from './graphql/survey-assignations.graphql';

interface CompanyOption {
  id: string;
  name: string;
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

        <div class="rounded-xl border border-slate-200 bg-white p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-slate-900">Invitees</h3>
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
                  <label class="block text-sm font-medium text-slate-700">Email *</label>
                  <input
                    type="email"
                    [value]="row.email"
                    (input)="updateInvitee($index, 'email', $any($event.target).value)"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                    placeholder="invitee@example.com"
                  />
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-slate-700">Name</label>
                  <input
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
  protected readonly invitees = signal<InviteeRow[]>([{ email: '', name: '' }]);
  protected readonly surveyTitle = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly inviteeError = signal<string | null>(null);

  constructor() {
    this.loadCompanies();
    effect(() => {
      const sid = this.surveyId();
      if (sid) {
        this.loadSurveyTitle(sid);
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validInvitees = inviteeInputs.filter((row) => emailRegex.test(row.email));

    if (validInvitees.length === 0) {
      this.inviteeError.set('Add at least one invitee with a valid email');
      return;
    }

    const seen = new Set<string>();
    const deduped = validInvitees.filter((row) => {
      const key = row.email.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

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
            invitees: deduped,
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
