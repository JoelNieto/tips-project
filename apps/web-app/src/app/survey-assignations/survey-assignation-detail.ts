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
import { SURVEY_ASSIGNATION_QUERY } from './graphql/survey-assignations.graphql';

interface InviteeDetail {
  id: string;
  email: string;
  name?: string | null;
  token: string;
}

interface AssignationDetail {
  id: string;
  surveyId: string;
  welcomeMessage?: string | null;
  startDate: string;
  expirationDate: string;
  company?: { id: string; name: string; email?: string | null } | null;
  survey?: { id: string; title: string } | null;
  invitees: InviteeDetail[];
}

@Component({
  selector: 'app-survey-assignation-detail',
  standalone: true,
  imports: [RouterLink],
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
          <h2 class="text-2xl font-bold text-slate-900">Assignation details</h2>
          <p class="mt-1 text-slate-500">
            @if (assignation()?.survey?.title) {
              {{ assignation()!.survey!.title }}
            }
          </p>
        </div>
      </div>

      <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Emails are not sent automatically yet — copy the invite links below to share manually.
      </div>

      @if (loading()) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading...
        </div>
      } @else if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p class="font-medium">Failed to load assignation</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else if (assignation(); as a) {
        <div class="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <dl class="grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-slate-500">Company</dt>
              <dd class="mt-1 text-sm text-slate-900">{{ a.company?.name ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-slate-500">Date range</dt>
              <dd class="mt-1 text-sm text-slate-900">
                {{ formatDate(a.startDate) }} – {{ formatDate(a.expirationDate) }}
              </dd>
            </div>
          </dl>
          @if (a.welcomeMessage) {
            <div>
              <dt class="text-sm font-medium text-slate-500">Welcome message</dt>
              <dd class="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{{ a.welcomeMessage }}</dd>
            </div>
          }
        </div>

        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div class="border-b border-slate-200 px-6 py-4">
            <h3 class="text-lg font-medium text-slate-900">Invitees ({{ a.invitees.length }})</h3>
          </div>
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Invite link
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              @for (inv of a.invitees; track inv.id) {
                <tr>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-900">{{ inv.email }}</td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {{ inv.name ?? '—' }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <code class="text-xs text-slate-600 break-all">{{ inviteLink(inv.token) }}</code>
                      <button
                        type="button"
                        (click)="copyLink(inv.token)"
                        class="shrink-0 text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        {{ copiedToken() === inv.token ? 'Copied' : 'Copy' }}
                      </button>
                    </div>
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
export default class SurveyAssignationDetailComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);

  readonly surveyId = input.required<string>();
  readonly id = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly assignation = signal<AssignationDetail | null>(null);
  protected readonly copiedToken = signal<string | null>(null);

  protected readonly origin = computed(() =>
    typeof window !== 'undefined' ? window.location.origin : ''
  );

  constructor() {
    effect(() => {
      const assignationId = this.id();
      if (assignationId) {
        this.loadAssignation(assignationId);
      }
    });
  }

  private loadAssignation(assignationId: string): void {
    this.loading.set(true);
    this.apollo
      .watchQuery<{ surveyAssignation: AssignationDetail | null }>({
        query: SURVEY_ASSIGNATION_QUERY,
        variables: { id: assignationId },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          if (result.data?.surveyAssignation) {
            this.assignation.set(result.data.surveyAssignation as AssignationDetail);
            this.error.set(null);
          }
          if (result.error) {
            this.error.set(result.error.message);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message ?? 'Failed to load assignation');
        },
      });
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }

  protected inviteLink(token: string): string {
    return `${this.origin()}/survey/invite/${token}`;
  }

  protected async copyLink(token: string): Promise<void> {
    const url = this.inviteLink(token);
    try {
      await navigator.clipboard.writeText(url);
      this.copiedToken.set(token);
      setTimeout(() => this.copiedToken.set(null), 2000);
    } catch {
      this.error.set('Failed to copy link to clipboard');
    }
  }
}
