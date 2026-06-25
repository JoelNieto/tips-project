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
import { Dialog } from '@angular/cdk/dialog';
import { Apollo } from 'apollo-angular';
import { firstValueFrom } from 'rxjs';
import { RESET_USER_PASSWORD_MUTATION, UPDATE_USER_MUTATION, USERS_QUERY } from './graphql/users.graphql';
import ChangeRoleDialogComponent, { type UserRole } from './change-role-dialog';
import ResetPasswordDialogComponent from './reset-password-dialog';

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

      @if (resetSuccess()) {
        <div class="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <span class="material-symbols-outlined text-base">check_circle</span>
          {{ 'users.resetPassword.success' | translate }}
        </div>
      }

      @if (roleChangeSuccess()) {
        <div class="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <span class="material-symbols-outlined text-base">check_circle</span>
          {{ 'users.changeRole.success' | translate }}
        </div>
      }

      @if (resetError()) {
        <div class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {{ resetError() }}
        </div>
      }

      @if (roleChangeError()) {
        <div class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {{ roleChangeError() }}
        </div>
      }

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
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  {{ 'users.list.columnActions' | translate }}
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
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="onChangeRole(user)"
                        [disabled]="changingRoleId() === user.id"
                        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                      >
                        <span class="material-symbols-outlined text-sm">manage_accounts</span>
                        @if (changingRoleId() === user.id) {
                          {{ 'users.changeRole.changing' | translate }}
                        } @else {
                          {{ 'users.changeRole.buttonLabel' | translate }}
                        }
                      </button>
                      <button
                        type="button"
                        (click)="onResetPassword(user)"
                        [disabled]="resettingId() === user.id"
                        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                      >
                        <span class="material-symbols-outlined text-sm">lock_reset</span>
                        @if (resettingId() === user.id) {
                          {{ 'users.resetPassword.resetting' | translate }}
                        } @else {
                          {{ 'users.resetPassword.buttonLabel' | translate }}
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-4 py-8 text-center text-slate-500">
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
  private readonly dialog = inject(Dialog);

  protected readonly users = signal<UserRow[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly resettingId = signal<string | null>(null);
  protected readonly resetSuccess = signal(false);
  protected readonly resetError = signal<string | null>(null);
  protected readonly changingRoleId = signal<string | null>(null);
  protected readonly roleChangeSuccess = signal(false);
  protected readonly roleChangeError = signal<string | null>(null);

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

  protected onChangeRole(user: UserRow): void {
    this.roleChangeSuccess.set(false);
    this.roleChangeError.set(null);

    const dialogRef = this.dialog.open<UserRole | null>(
      ChangeRoleDialogComponent,
      {
        data: { userName: user.name, currentRole: user.role },
        ariaLabel: this.translate.instant('users.changeRole.title'),
      },
    );

    dialogRef.closed
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (newRole) => {
        if (!newRole) return;

        this.changingRoleId.set(user.id);
        try {
          await firstValueFrom(
            this.apollo.mutate({
              mutation: UPDATE_USER_MUTATION,
              variables: { id: user.id, input: { role: newRole } },
              refetchQueries: ['Users'],
            }),
          );
          this.roleChangeSuccess.set(true);
        } catch (err) {
          this.roleChangeError.set(
            err instanceof Error
              ? err.message
              : this.translate.instant('users.changeRole.failed'),
          );
        } finally {
          this.changingRoleId.set(null);
        }
      });
  }

  protected onResetPassword(user: UserRow): void {
    this.resetSuccess.set(false);
    this.resetError.set(null);

    const dialogRef = this.dialog.open<string | null>(
      ResetPasswordDialogComponent,
      {
        data: { userName: user.name },
        ariaLabel: this.translate.instant('users.resetPassword.title'),
      },
    );

    dialogRef.closed
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (newPassword) => {
        if (!newPassword) return;

        this.resettingId.set(user.id);
        try {
          await firstValueFrom(
            this.apollo.mutate<{ resetUserPassword: boolean }>({
              mutation: RESET_USER_PASSWORD_MUTATION,
              variables: { id: user.id, newPassword },
            }),
          );
          this.resetSuccess.set(true);
        } catch (err) {
          this.resetError.set(
            err instanceof Error
              ? err.message
              : this.translate.instant('users.resetPassword.failed'),
          );
        } finally {
          this.resettingId.set(null);
        }
      });
  }
}
