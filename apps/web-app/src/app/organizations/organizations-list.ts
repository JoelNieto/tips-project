import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { ORGANIZATIONS_QUERY } from './graphql/organizations.graphql';

interface OrganizationRow {
  id: string;
  name: string;
  description?: string | null;
}

@Component({
  selector: 'app-organizations-list',
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">
            {{ 'organizations.list.title' | translate }}
          </h2>
          <p class="text-slate-500 mt-1">
            {{ 'organizations.list.subtitle' | translate }}
          </p>
        </div>
        <a
          routerLink="/dashboard/organizations/new"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          <span class="material-symbols-outlined text-lg">add</span>
          {{ 'organizations.list.newOrganization' | translate }}
        </a>
      </div>

      @if (loading()) {
        <p class="text-slate-500">{{ 'organizations.list.loading' | translate }}</p>
      } @else if (error()) {
        <p class="text-red-600">{{ error() }}</p>
      } @else {
        <div class="grid gap-4 md:grid-cols-2">
          @for (org of organizations(); track org.id) {
            <a
              [routerLink]="['/dashboard/organizations', org.id]"
              class="block rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 transition"
            >
              <h3 class="font-semibold text-slate-900">{{ org.name }}</h3>
              @if (org.description) {
                <p class="mt-1 text-sm text-slate-500">{{ org.description }}</p>
              }
            </a>
          } @empty {
            <p class="text-slate-500">{{ 'organizations.list.empty' | translate }}</p>
          }
        </div>
      }
    </div>
  `,
})
export default class OrganizationsListComponent {
  private readonly apollo = inject(Apollo);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  protected readonly organizations = signal<OrganizationRow[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.apollo
      .watchQuery<{ organizations: OrganizationRow[] }>({
        query: ORGANIZATIONS_QUERY,
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          this.organizations.set((result.data?.organizations ?? []) as OrganizationRow[]);
          this.error.set(result.error?.message ?? null);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(
            err.message ?? this.translate.instant('organizations.list.loadFailed'),
          );
        },
      });
  }
}
