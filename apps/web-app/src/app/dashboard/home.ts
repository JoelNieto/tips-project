import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">
          Welcome back, {{ firstName() }}
        </h2>
        <p class="text-slate-500 mt-1">Here's an overview of your tips activity.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @for (stat of stats; track stat.label) {
          <div class="bg-white rounded-xl border border-slate-200 p-6">
            <p class="text-sm font-medium text-slate-500">{{ stat.label }}</p>
            <p class="mt-2 text-3xl font-bold text-slate-900">{{ stat.value }}</p>
            <p class="mt-1 text-sm" [class]="stat.changeClass">{{ stat.change }}</p>
          </div>
        }
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <div class="text-slate-500 text-sm py-8 text-center">
          No recent activity to display.
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
  protected readonly firstName = computed(
    () => this.auth.user()?.name?.split(' ')[0] ?? 'there'
  );

  protected readonly stats = [
    {
      label: 'Total Tips',
      value: '$0.00',
      change: '+0% from last month',
      changeClass: 'text-slate-400',
    },
    {
      label: 'Transactions',
      value: '0',
      change: '+0% from last month',
      changeClass: 'text-slate-400',
    },
    {
      label: 'Active Staff',
      value: '0',
      change: 'No change',
      changeClass: 'text-slate-400',
    },
  ];
}
