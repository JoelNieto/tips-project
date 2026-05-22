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
import { Apollo } from 'apollo-angular';
import { SURVEY_INVITE_BY_TOKEN_QUERY } from './graphql/survey-invite.graphql';
import SurveyFillViewComponent from '../surveys/fill/survey-fill-view';
import { toSurveyFillData } from '../surveys/fill/survey-fill.utils';
import type { SurveyFillData } from '../surveys/fill/survey-fill.types';

interface SurveyInviteContext {
  token: string;
  email: string;
  name?: string | null;
  welcomeMessage?: string | null;
  companyName?: string | null;
  startDate: string;
  expirationDate: string;
  survey: Record<string, unknown>;
}

@Component({
  selector: 'app-survey-invite',
  standalone: true,
  imports: [SurveyFillViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 py-10 px-4">
      <div class="mx-auto max-w-3xl space-y-6">
        @if (loading()) {
          <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading survey...
          </div>
        } @else if (error()) {
          <div class="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <span class="material-symbols-outlined text-4xl text-red-300">link_off</span>
            <p class="mt-4 text-lg font-medium text-red-800">{{ errorTitle() }}</p>
            <p class="mt-2 text-sm text-red-700">{{ error() }}</p>
          </div>
        } @else if (invite(); as ctx) {
          @if (ctx.welcomeMessage) {
            <div class="rounded-xl border border-indigo-200 bg-indigo-50 p-6">
              @if (ctx.name) {
                <p class="text-sm font-medium text-indigo-900">Hello, {{ ctx.name }}</p>
              }
              <p class="mt-2 whitespace-pre-wrap text-indigo-900">{{ ctx.welcomeMessage }}</p>
              @if (ctx.companyName) {
                <p class="mt-3 text-xs text-indigo-700">{{ ctx.companyName }}</p>
              }
            </div>
          }

          @if (surveyFillData(); as fillData) {
            <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <app-survey-fill-view [survey]="fillData" [previewMode]="false" />
            </div>
          } @else {
            <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              This survey has no content yet.
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class SurveyInviteComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);

  readonly token = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly errorTitle = signal('Invitation unavailable');
  protected readonly invite = signal<SurveyInviteContext | null>(null);

  protected readonly surveyFillData = computed<SurveyFillData | null>(() => {
    const ctx = this.invite();
    if (!ctx) return null;
    return toSurveyFillData(ctx.survey);
  });

  constructor() {
    effect(() => {
      const inviteToken = this.token();
      if (inviteToken) {
        this.loadInvite(inviteToken);
      }
    });
  }

  private loadInvite(inviteToken: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.apollo
      .watchQuery<{ surveyInviteByToken: SurveyInviteContext | null }>({
        query: SURVEY_INVITE_BY_TOKEN_QUERY,
        variables: { token: inviteToken },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          const ctx = result.data?.surveyInviteByToken;
          if (ctx) {
            this.invite.set(ctx as SurveyInviteContext);
            this.error.set(null);
          } else if (!result.loading && !result.error) {
            this.setErrorFromMessage('Invitation not found');
          }
          if (result.error) {
            this.setErrorFromMessage(result.error.message);
          }
          if (!result.loading) {
            this.loading.set(false);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.setErrorFromMessage(err.message ?? 'Failed to load invitation');
        },
      });
  }

  private setErrorFromMessage(message: string): void {
    const lower = message.toLowerCase();
    if (lower.includes('not active yet')) {
      this.errorTitle.set('Invitation not active yet');
      this.error.set('This survey link will become available on the start date.');
    } else if (lower.includes('expired')) {
      this.errorTitle.set('Invitation expired');
      this.error.set('This survey link is no longer valid.');
    } else if (lower.includes('not found')) {
      this.errorTitle.set('Invalid invitation');
      this.error.set('This survey link does not exist or has been removed.');
    } else {
      this.errorTitle.set('Invitation unavailable');
      this.error.set(message);
    }
    this.invite.set(null);
  }
}
