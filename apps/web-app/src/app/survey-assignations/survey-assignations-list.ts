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
import { RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import {
  DELETE_SURVEY_ASSIGNATION_MUTATION,
  SURVEY_ASSIGNATIONS_QUERY,
} from './graphql/survey-assignations.graphql';
import { SURVEY_QUERY } from '../surveys/graphql/surveys.graphql';
import ConfirmDialogComponent from '../shared/confirm-dialog/confirm-dialog';

interface AssignationListItem {
  id: string;
  surveyId: string;
  welcomeMessage?: string | null;
  startDate: string;
  expirationDate: string;
  inviteeCount?: number | null;
  company?: { id: string; name: string } | null;
  survey?: { id: string; title: string } | null;
}

type AssignationStatus = 'upcoming' | 'active' | 'expired';

@Component({
  selector: 'app-survey-assignations-list',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a
          [routerLink]="['/dashboard/surveys', surveyId()]"
          class="text-slate-500 hover:text-slate-700"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </a>
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-slate-900">Assignations</h2>
          <p class="mt-1 text-slate-500">
            @if (surveyTitle()) {
              {{ surveyTitle() }}
            } @else {
              Survey assignations
            }
          </p>
        </div>
        <a
          [routerLink]="['/dashboard/surveys', surveyId(), 'assignations', 'new']"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          New assignation
        </a>
      </div>

      @if (loading()) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading assignations...
        </div>
      } @else if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p class="font-medium">Failed to load assignations</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (assignations().length === 0) {
        <div class="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span class="material-symbols-outlined text-4xl text-slate-300">group_add</span>
          <p class="mt-4 text-slate-600">No assignations yet</p>
          <p class="mt-1 text-sm text-slate-500">
            Create an assignation to send survey links to invitees
          </p>
          <a
            [routerLink]="['/dashboard/surveys', surveyId(), 'assignations', 'new']"
            class="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <span class="material-symbols-outlined text-[20px]">add</span>
            New assignation
          </a>
        </div>
      } @else {
        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Company
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Date range
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Invitees
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              @for (a of assignations(); track a.id) {
                <tr class="hover:bg-slate-50">
                  <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                    {{ a.company?.name ?? '—' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-500">
                    {{ formatDate(a.startDate) }} – {{ formatDate(a.expirationDate) }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {{ a.inviteeCount ?? 0 }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4">
                    <span
                      class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                      [class]="statusClass(statusFor(a))"
                    >
                      {{ statusLabel(statusFor(a)) }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right text-sm space-x-3">
                    <a
                      [routerLink]="['/dashboard/surveys', surveyId(), 'assignations', a.id]"
                      class="text-indigo-600 hover:text-indigo-800"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      (click)="onDelete(a.id)"
                      class="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
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
export default class SurveyAssignationsListComponent {
  private readonly apollo = inject(Apollo);
  private readonly dialog = inject(Dialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly surveyId = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly assignations = signal<AssignationListItem[]>([]);
  protected readonly surveyTitle = signal<string | null>(null);

  constructor() {
    effect(() => {
      const sid = this.surveyId();
      if (sid) {
        this.loadSurveyTitle(sid);
        this.loadAssignations(sid);
      }
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

  private loadAssignations(surveyId: string): void {
    this.apollo
      .watchQuery<{ surveyAssignations: AssignationListItem[] }>({
        query: SURVEY_ASSIGNATIONS_QUERY,
        variables: { surveyId },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          if (result.data?.surveyAssignations) {
            this.assignations.set(result.data.surveyAssignations as AssignationListItem[]);
            this.error.set(null);
          }
          if (result.error) {
            this.error.set(result.error.message);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message ?? 'Failed to load assignations');
        },
      });
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }

  protected statusFor(a: AssignationListItem): AssignationStatus {
    const now = new Date();
    const start = new Date(a.startDate);
    const end = new Date(a.expirationDate);
    if (now < start) return 'upcoming';
    if (now > end) return 'expired';
    return 'active';
  }

  protected statusLabel(status: AssignationStatus): string {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
    }
  }

  protected statusClass(status: AssignationStatus): string {
    switch (status) {
      case 'upcoming':
        return 'bg-amber-100 text-amber-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-slate-100 text-slate-600';
    }
  }

  protected onDelete(id: string): void {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: 'Delete assignation',
        message:
          'Are you sure you want to delete this assignation? All invitee links will stop working.',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        confirmDanger: true,
      },
      role: 'alertdialog',
      ariaModal: true,
      ariaLabel: 'Delete assignation confirmation',
      width: '400px',
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (confirmed !== true) return;
      this.apollo
        .mutate({
          mutation: DELETE_SURVEY_ASSIGNATION_MUTATION,
          variables: { id },
          refetchQueries: [
            {
              query: SURVEY_ASSIGNATIONS_QUERY,
              variables: { surveyId: this.surveyId() },
            },
          ],
        })
        .subscribe({
          error: (err) => {
            this.error.set(err.message ?? 'Failed to delete assignation');
          },
        });
    });
  }
}
