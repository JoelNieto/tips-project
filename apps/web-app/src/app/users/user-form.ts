import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { firstValueFrom } from 'rxjs';

import { ORGANIZATIONS_QUERY } from '../organizations/graphql/organizations.graphql';
import { CREATE_USER_MUTATION } from './graphql/users.graphql';

type UserRole = 'ADMIN' | 'DESIGNER' | 'ORG_ADMIN' | 'EMPLOYEE';

interface OrganizationOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-user-form',
  imports: [FormsModule, RouterLink],
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
          <h2 class="text-2xl font-bold text-slate-900">Create user</h2>
          <p class="text-slate-500 mt-1">Provision a new account with a role</p>
        </div>
      </div>

      <form
        (ngSubmit)="onSubmit()"
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
            >Name</label
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
            >Email</label
          >
          <input
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
            >Password</label
          >
          <input
            [(ngModel)]="password"
            name="password"
            type="password"
            required
            minlength="8"
            class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            for="role"
            class="block text-sm font-medium text-slate-700 mb-1"
            >Role</label
          >
          <select
            [(ngModel)]="role"
            name="role"
            required
            class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          >
            @for (option of roleOptions; track option) {
              <option [value]="option">{{ option }}</option>
            }
          </select>
        </div>

        @if (role === 'ORG_ADMIN' || role === 'EMPLOYEE') {
          <div>
            <label
              for="organizationId"
              class="block text-sm font-medium text-slate-700 mb-1"
              >Organization</label
            >
            <select
              [(ngModel)]="organizationId"
              name="organizationId"
              required
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select organization</option>
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
            {{ saving() ? 'Creating...' : 'Create user' }}
          </button>
          <a routerLink="/dashboard/users" class="px-4 py-2 rounded-lg  text-sm"
            >Cancel</a
          >
        </div>
      </form>
    </div>
  `,
})
export default class UserFormComponent {
  private readonly apollo = inject(Apollo);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

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

  async onSubmit() {
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
        err instanceof Error ? err.message : 'Failed to create user',
      );
    } finally {
      this.saving.set(false);
    }
  }
}
