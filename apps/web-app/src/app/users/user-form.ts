import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { firstValueFrom } from 'rxjs';

import { ORGANIZATIONS_QUERY } from '../organizations/graphql/organizations.graphql';
import { CREATE_USER_MUTATION } from './graphql/users.graphql';

type UserRole = 'ADMIN' | 'DESIGNER' | 'ORG_ADMIN' | 'EMPLOYEE';

interface OrganizationOption {
  id: string;
  name: string;
}

const ROLE_KEYS: Record<UserRole, string> = {
  ADMIN: 'users.form.roleAdmin',
  DESIGNER: 'users.form.roleDesigner',
  ORG_ADMIN: 'users.form.roleOrgAdmin',
  EMPLOYEE: 'users.form.roleEmployee',
};

@Component({
  selector: 'app-user-form',
  imports: [FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-xl space-y-6">
      <div class="flex items-center gap-4">
        <a
          routerLink="/dashboard/users"
          class="text-slate-500 hover:text-slate-700"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">{{ 'users.form.createTitle' | translate }}</h2>
          <p class="text-slate-500 mt-1">{{ 'users.form.createSubtitle' | translate }}</p>
        </div>
      </div>

      <form
        #userForm="ngForm"
        (ngSubmit)="onSubmit(userForm)"
        class="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
      >
        @if (error()) {
          <div class="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {{ error() }}
          </div>
        }

        <div>
          <label
            for="name"
            class="block text-sm font-medium text-slate-700 mb-1"
            >{{ 'users.form.name' | translate }}</label
          >
          <input
            id="name"
            [(ngModel)]="name"
            name="name"
            required
            class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            for="email"
            class="block text-sm font-medium text-slate-700 mb-1"
            >{{ 'users.form.email' | translate }}</label
          >
          <input
            id="email"
            [(ngModel)]="email"
            name="email"
            type="email"
            required
            class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-slate-700 mb-1"
            >{{ 'users.form.password' | translate }}</label
          >
          <input
            #passwordField="ngModel"
            id="password"
            [(ngModel)]="password"
            name="password"
            type="password"
            required
            minlength="8"
            class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            [class.border-red-500]="passwordField.invalid && passwordField.touched"
          />
          @if (passwordField.touched && passwordField.errors?.['required']) {
            <p class="mt-1 text-xs text-red-600">{{ 'users.form.passwordRequired' | translate }}</p>
          } @else if (passwordField.touched && passwordField.errors?.['minlength']) {
            <p class="mt-1 text-xs text-red-600">{{ 'users.form.passwordMinLength' | translate }}</p>
          }
        </div>

        <div>
          <label
            for="role"
            class="block text-sm font-medium text-slate-700 mb-1"
            >{{ 'users.form.role' | translate }}</label
          >
          <select
            [(ngModel)]="role"
            name="role"
            required
            class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          >
            @for (option of roleOptions; track option) {
              <option [value]="option">{{ roleLabel(option) }}</option>
            }
          </select>
        </div>

        @if (role === 'ORG_ADMIN' || role === 'EMPLOYEE') {
          <div>
            <label
              for="organizationId"
              class="block text-sm font-medium text-slate-700 mb-1"
              >{{ 'users.form.organization' | translate }}</label
            >
            <select
              [(ngModel)]="organizationId"
              name="organizationId"
              required
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">{{ 'users.form.selectOrganization' | translate }}</option>
              @for (org of organizations(); track org.id) {
                <option [value]="org.id">{{ org.name }}</option>
              }
            </select>
          </div>
        }

        <div class="flex gap-3 pt-2">
          <button
            type="submit"
            [disabled]="saving()"
            class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {{
              saving()
                ? ('users.form.creating' | translate)
                : ('users.form.createUser' | translate)
            }}
          </button>
          <a routerLink="/dashboard/users" class="px-4 py-2 rounded-lg text-sm">
            {{ 'common.cancel' | translate }}
          </a>
        </div>
      </form>
    </div>
  `,
})
export default class UserFormComponent {
  private readonly apollo = inject(Apollo);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  protected readonly roleOptions: UserRole[] = [
    'ADMIN',
    'DESIGNER',
    'ORG_ADMIN',
    'EMPLOYEE',
  ];
  protected readonly organizations = signal<OrganizationOption[]>([]);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected name = '';
  protected email = '';
  protected password = '';
  protected role: UserRole = 'DESIGNER';
  protected organizationId = '';

  constructor() {
    this.apollo
      .watchQuery<{ organizations: OrganizationOption[] }>({
        query: ORGANIZATIONS_QUERY,
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.organizations.set(
          (result.data?.organizations ?? []) as OrganizationOption[],
        );
      });
  }

  protected roleLabel(role: UserRole): string {
    return this.translate.instant(ROLE_KEYS[role]);
  }

  async onSubmit(form: NgForm) {
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(
        this.apollo.mutate({
          mutation: CREATE_USER_MUTATION,
          variables: {
            input: {
              name: this.name,
              email: this.email,
              password: this.password,
              role: this.role,
              organizationId: this.organizationId || undefined,
            },
          },
          refetchQueries: ['Users'],
        }),
      );
      await this.router.navigate(['/dashboard/users']);
    } catch (err) {
      this.error.set(
        err instanceof Error
          ? err.message
          : this.translate.instant('users.form.createFailed'),
      );
    } finally {
      this.saving.set(false);
    }
  }
}
