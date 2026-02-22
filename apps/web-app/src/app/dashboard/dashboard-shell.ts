import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex bg-slate-50">
      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 lg:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.translate-x-0]="sidebarOpen()"
      >
        <div class="flex items-center gap-3 h-16 px-6 border-b border-slate-200 shrink-0">
          <div
            class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white text-sm font-bold"
          >
            T
          </div>
          <span class="font-semibold text-slate-900">Tips App</span>
        </div>

        <nav class="flex-1 overflow-y-auto p-4 space-y-1">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-indigo-50 text-indigo-700"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              <span class="material-symbols-outlined shrink-0 text-[20px] leading-none" [attr.aria-hidden]="true">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="p-4 border-t border-slate-200 shrink-0">
          <div class="flex items-center gap-3 px-3 py-2">
            <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium">
              {{ userInitials() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 truncate">{{ auth.user()?.name }}</p>
              <p class="text-xs text-slate-500 truncate">{{ auth.user()?.email }}</p>
            </div>
          </div>
          <button
            (click)="auth.logout()"
            class="mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition"
          >
            <span class="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>
            Sign out
          </button>
        </div>
      </aside>

      <!-- Mobile overlay -->
      @if (sidebarOpen()) {
        <button
          type="button"
          class="fixed inset-0 z-20 block w-full bg-black/30 lg:hidden"
          aria-label="Close menu"
          (click)="sidebarOpen.set(false)"
        ></button>
      }

      <!-- Main content -->
      <div class="flex-1 flex flex-col lg:pl-64">
        <header class="sticky top-0 z-10 h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4">
          <button
            class="lg:hidden p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            (click)="toggleSidebar()"
          >
            <span class="material-symbols-outlined text-2xl" aria-hidden="true">menu</span>
          </button>
          <h1 class="text-lg font-semibold text-slate-900">Dashboard</h1>
        </header>

        <main class="flex-1 p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class DashboardShellComponent {
  protected readonly auth = inject(AuthService);
  protected sidebarOpen = signal(false);

  protected readonly navItems = [
    { path: '/dashboard', label: 'Home', exact: true, icon: 'home' },
    { path: '/dashboard/companies', label: 'Companies', exact: false, icon: 'business' },
    { path: '/dashboard/survey-types', label: 'Survey Types', exact: false, icon: 'poll' },
    { path: '/dashboard/tips', label: 'Tips', exact: false, icon: 'payments' },
    { path: '/dashboard/reports', label: 'Reports', exact: false, icon: 'bar_chart' },
    { path: '/dashboard/profile', label: 'Profile', exact: false, icon: 'person' },
  ];

  protected toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  protected userInitials(): string {
    const name = this.auth.user()?.name ?? '';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
