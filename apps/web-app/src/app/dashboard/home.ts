import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';

import { AuthService } from '../auth/auth.service';
import { LocaleService } from '../i18n/locale.service';
import { DASHBOARD_SUMMARY_QUERY } from './graphql/dashboard.graphql';

interface ActiveSurveyWindow {
  id: string;
  surveyId: string;
  surveyTitle: string;
  companyName: string;
  startDate: string;
  expirationDate: string;
  inviteeCount: number;
}

interface DashboardSummary {
  companiesRegistered: number;
  numberOfSurveys: number;
  numberOfQuestions: number;
  numberOfSurveyAssignations: number;
  activeSurveyWindows: ActiveSurveyWindow[];
}

@Component({
  selector: 'app-dashboard-home',
  imports: [TranslatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">
          {{ 'home.welcome' | translate: { name: firstName() } }}
        </h2>
        <p class="text-slate-500 mt-1">{{ 'home.overview' | translate }}</p>
      </div>

      @if (loading()) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          {{ 'home.loading' | translate }}
        </div>
      } @else if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p class="font-medium">{{ 'home.loadFailed' | translate }}</p>
          <p class="mt-1 text-sm">{{ error() }}</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          @for (stat of stats(); track stat.label) {
            <div class="bg-white rounded-xl border border-slate-200 p-6">
              <p class="text-sm font-medium text-slate-500">{{ stat.label }}</p>
              <p class="mt-2 text-3xl font-bold text-slate-900">{{ stat.value }}</p>
            </div>
          }
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">
            {{ 'home.activeSurveys' | translate }}
          </h3>

          @if (activeSurveys().length === 0) {
            <div class="text-slate-500 text-sm py-8 text-center">
              {{ 'home.noActiveSurveys' | translate }}
            </div>
          } @else {
            <div class="overflow-hidden rounded-lg border border-slate-200">
              <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                  <tr>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                    >
                      {{ 'home.survey' | translate }}
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                    >
                      {{ 'home.company' | translate }}
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                    >
                      {{ 'home.dateRange' | translate }}
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                    >
                      {{ 'home.invitees' | translate }}
                    </th>
                    <th class="relative px-6 py-3">
                      <span class="sr-only">{{ 'home.view' | translate }}</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 bg-white">
                  @for (item of activeSurveys(); track item.id) {
                    <tr class="hover:bg-slate-50">
                      <td class="px-6 py-4 text-sm font-medium text-slate-900">
                        {{ item.surveyTitle }}
                      </td>
                      <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {{ item.companyName }}
                      </td>
                      <td class="px-6 py-4 text-sm text-slate-500">
                        {{ formatDate(item.startDate) }} –
                        {{ formatDate(item.expirationDate) }}
                      </td>
                      <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {{ item.inviteeCount }}
                      </td>
                      <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <a
                          [routerLink]="[
                            '/dashboard/surveys',
                            item.surveyId,
                            'assignations',
                            item.id,
                          ]"
                          class="text-indigo-600 hover:text-indigo-800"
                        >
                          {{ 'home.view' | translate }}
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
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
export default class DashboardHomeComponent {
  protected readonly auth = inject(AuthService);
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private readonly localeService = inject(LocaleService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  private readonly summary = signal<DashboardSummary | null>(null);

  protected readonly firstName = computed(() => {
    this.localeService.locale();
    const name = this.auth.user()?.name?.split(' ')[0];
    return name || this.translate.instant('home.guestName');
  });

  protected readonly stats = computed(() => {
    this.localeService.locale();
    const data = this.summary();
    return [
      {
        label: this.translate.instant('home.companiesRegistered'),
        value: data?.companiesRegistered ?? 0,
      },
      {
        label: this.translate.instant('home.numberOfSurveys'),
        value: data?.numberOfSurveys ?? 0,
      },
      {
        label: this.translate.instant('home.numberOfQuestions'),
        value: data?.numberOfQuestions ?? 0,
      },
      {
        label: this.translate.instant('home.numberOfSurveyAssignations'),
        value: data?.numberOfSurveyAssignations ?? 0,
      },
    ];
  });

  protected readonly activeSurveys = computed(
    () => this.summary()?.activeSurveyWindows ?? []
  );

  constructor() {
    this.apollo
      .watchQuery<{ dashboardSummary: DashboardSummary }>({
        query: DASHBOARD_SUMMARY_QUERY,
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          if (result.data?.dashboardSummary) {
            this.summary.set(result.data.dashboardSummary as DashboardSummary);
            this.error.set(null);
          }
          if (result.error) {
            this.error.set(result.error.message);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message ?? 'Failed to load dashboard');
        },
      });
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }
}
