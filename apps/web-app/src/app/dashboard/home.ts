import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../auth/auth.service';
import { LocaleService } from '../i18n/locale.service';

@Component({
  selector: 'app-dashboard-home',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">
          {{ 'home.welcome' | translate: { name: firstName() } }}
        </h2>
        <p class="text-slate-500 mt-1">{{ 'home.overview' | translate }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @for (stat of stats(); track stat.label) {
          <div class="bg-white rounded-xl border border-slate-200 p-6">
            <p class="text-sm font-medium text-slate-500">{{ stat.label }}</p>
            <p class="mt-2 text-3xl font-bold text-slate-900">{{ stat.value }}</p>
            <p class="mt-1 text-sm" [class]="stat.changeClass">{{ stat.change }}</p>
          </div>
        }
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">{{ 'home.recentActivity' | translate }}</h3>
        <div class="text-slate-500 text-sm py-8 text-center">
          {{ 'home.noRecentActivity' | translate }}
        </div>
      </div>
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
  private readonly translate = inject(TranslateService);
  private readonly localeService = inject(LocaleService);

  protected readonly firstName = computed(() => {
    this.localeService.locale();
    const name = this.auth.user()?.name?.split(' ')[0];
    return name || this.translate.instant('home.guestName');
  });

  protected readonly stats = computed(() => {
    this.localeService.locale();
    return [
      {
        label: this.translate.instant('home.totalTips'),
        value: '$0.00',
        change: this.translate.instant('home.changeFromLastMonth'),
        changeClass: 'text-slate-400',
      },
      {
        label: this.translate.instant('home.transactions'),
        value: '0',
        change: this.translate.instant('home.changeFromLastMonth'),
        changeClass: 'text-slate-400',
      },
      {
        label: this.translate.instant('home.activeStaff'),
        value: '0',
        change: this.translate.instant('home.noChange'),
        changeClass: 'text-slate-400',
      },
    ];
  });
}
