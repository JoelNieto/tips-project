import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { USERS_QUERY } from './graphql/users.graphql';

type UserRole = 'ADMIN' | 'DESIGNER' | 'ORG_ADMIN' | 'EMPLOYEE';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

const ROLE_KEYS: Record<UserRole, string> = {
  ADMIN: 'users.form.roleAdmin',
  DESIGNER: 'users.form.roleDesigner',
  ORG_ADMIN: 'users.form.roleOrgAdmin',
  EMPLOYEE: 'users.form.roleEmployee',
};

@Component({
  selector: 'app-users-list',
  imports: [RouterLink, DatePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">{{ 'users.list.title' | translate }}</h2>
          <p class="text-slate-500 mt-1">{{ 'users.list.subtitle' | translate }}</p>
        </div>
        <a
          routerLink="/dashboard/users/new"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          <span class="material-symbols-outlined text-lg">person_add</span>
          {{ 'users.list.newUser' | translate }}
        </a>
      </div>

      @if (loading()) {
        <p class="text-slate-500">{{ 'users.list.loading' | translate }}</p>
      } @else if (error()) {
        <p class="text-red-600">{{ error() }}</p>
      } @else {
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  {{ 'users.list.columnName' | translate }}
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  {{ 'users.list.columnEmail' | translate }}
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  {{ 'users.list.columnRole' | translate }}
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  {{ 'users.list.columnCreated' | translate }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              @for (user of users(); track user.id) {
                <tr>
                  <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ user.name }}</td>
                  <td class="px-4 py-3 text-sm text-slate-600">{{ user.email }}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                      {{ roleLabel(user.role) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-slate-500">{{ user.createdAt | date: 'mediumDate' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="px-4 py-8 text-center text-slate-500">
                    {{ 'users.list.empty' | translate }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export default class UsersListComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  protected readonly users = signal<UserRow[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.apollo
      .watchQuery<{ users: UserRow[] }>({ query: USERS_QUERY })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          this.users.set((result.data?.users ?? []) as UserRow[]);
          this.error.set(result.error?.message ?? null);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(
            err.message ?? this.translate.instant('users.list.loadFailed'),
          );
        },
      });
  }

  protected roleLabel(role: UserRole): string {
    return this.translate.instant(ROLE_KEYS[role]);
  }
}
