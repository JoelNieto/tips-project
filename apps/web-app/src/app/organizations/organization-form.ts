import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { firstValueFrom } from 'rxjs';

import { CREATE_ORGANIZATION_MUTATION } from './graphql/organizations.graphql';

@Component({
  selector: 'app-organization-form',
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-xl space-y-6">
      <div class="flex items-center gap-4">
        <a routerLink="/dashboard/organizations" class="text-slate-500 hover:text-slate-700">
          <span class="material-symbols-outlined">arrow_back</span>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Create organization</h2>
        </div>
      </div>

      <form (ngSubmit)="onSubmit()" class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        @if (error()) {
          <div class="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{{ error() }}</div>
        }

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input [(ngModel)]="name" name="name" required class="w-full px-3 py-2 border rounded-lg" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea [(ngModel)]="description" name="description" rows="3" class="w-full px-3 py-2 border rounded-lg"></textarea>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="submit" [disabled]="saving()" class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm">
            {{ saving() ? 'Creating...' : 'Create organization' }}
          </button>
          <a routerLink="/dashboard/organizations" class="px-4 py-2 rounded-lg border text-sm">Cancel</a>
        </div>
      </form>
    </div>
  `,
})
export default class OrganizationFormComponent {
  private readonly apollo = inject(Apollo);
  private readonly router = inject(Router);

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected name = '';
  protected description = '';

  async onSubmit() {
    this.saving.set(true);
    this.error.set(null);

    try {
      const result = await firstValueFrom(
        this.apollo.mutate<{ createOrganization: { id: string } }>({
          mutation: CREATE_ORGANIZATION_MUTATION,
          variables: {
            input: {
              name: this.name,
              description: this.description || undefined,
            },
          },
        })
      );
      const id = result.data?.createOrganization.id;
      await this.router.navigate(id ? ['/dashboard/organizations', id] : ['/dashboard/organizations']);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      this.saving.set(false);
    }
  }
}
