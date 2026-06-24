import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  form,
  FormField,
  required,
} from '@angular/forms/signals';
import { Dialog } from '@angular/cdk/dialog';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import {
  COMPANIES_QUERY,
  COMPANY_QUERY,
  CREATE_COMPANY_MUTATION,
  DELETE_COMPANY_MUTATION,
  UPDATE_COMPANY_MUTATION,
} from './graphql/companies.graphql';
import { ORGANIZATIONS_QUERY } from '../organizations/graphql/organizations.graphql';
import ConfirmDialogComponent from '../shared/confirm-dialog/confirm-dialog';

interface CompanyFormModel {
  organizationId: string;
  name: string;
  legalName: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId: string;
  logo: string;
  industry: string;
  size: string;
}

const emptyModel: CompanyFormModel = {
  organizationId: '',
  name: '',
  legalName: '',
  description: '',
  email: '',
  phone: '',
  website: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  taxId: '',
  logo: '',
  industry: '',
  size: '',
};

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [FormField, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a
          routerLink="/dashboard/companies"
          class="text-slate-500 hover:text-slate-700"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">
            {{ isEditMode() ? ('companies.form.editTitle' | translate) : ('companies.form.createTitle' | translate) }}
          </h2>
          <p class="mt-1 text-slate-500">
            {{
              isEditMode()
                ? ('companies.form.editSubtitle' | translate)
                : ('companies.form.createSubtitle' | translate)
            }}
          </p>
        </div>
      </div>

      @if (loading()) {
        <div class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          {{ 'companies.form.loading' | translate }}
        </div>
      } @else {
        <form
          (submit)="onSubmit($event)"
          class="space-y-6 rounded-xl border border-slate-200 bg-white p-6"
        >
          @if (submitError()) {
            <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {{ submitError() }}
            </div>
          }

          @if (!isEditMode()) {
            <div>
              <label for="organizationId" class="block text-sm font-medium text-slate-700">{{ 'companies.form.organization' | translate }} *</label>
              <select
                id="organizationId"
                [formField]="companyForm.organizationId"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">{{ 'companies.form.selectOrganization' | translate }}</option>
                @for (org of organizations(); track org.id) {
                  <option [value]="org.id">{{ org.name }}</option>
                }
              </select>
            </div>
          }

          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label for="name" class="block text-sm font-medium text-slate-700">{{ 'companies.form.name' | translate }} *</label>
              <input
                id="name"
                type="text"
                [formField]="companyForm.name"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
              @if (companyForm.name().touched() && companyForm.name().invalid()) {
                <p class="mt-1 text-sm text-red-600">
                  {{
                    (companyForm.name().errors()[0]?.message ??
                      'companies.form.nameRequired') | translate
                  }}
                </p>
              }
            </div>

            <div>
              <label for="legalName" class="block text-sm font-medium text-slate-700">
                {{ 'companies.form.legalName' | translate }}
              </label>
              <input
                id="legalName"
                type="text"
                [formField]="companyForm.legalName"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-slate-700">
              {{ 'companies.form.description' | translate }}
            </label>
            <textarea
              id="description"
              [formField]="companyForm.description"
              rows="3"
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            ></textarea>
          </div>

          <div class="border-t border-slate-200 pt-6">
            <h3 class="text-lg font-medium text-slate-900 mb-4">{{ 'companies.form.contact' | translate }}</h3>
            <div class="grid gap-6 sm:grid-cols-3">
              <div>
                <label for="email" class="block text-sm font-medium text-slate-700">{{ 'companies.form.email' | translate }}</label>
                <input
                  id="email"
                  type="email"
                  [formField]="companyForm.email"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label for="phone" class="block text-sm font-medium text-slate-700">{{ 'companies.form.phone' | translate }}</label>
                <input
                  id="phone"
                  type="tel"
                  [formField]="companyForm.phone"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label for="website" class="block text-sm font-medium text-slate-700">{{ 'companies.form.website' | translate }}</label>
                <input
                  id="website"
                  type="url"
                  [formField]="companyForm.website"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div class="border-t border-slate-200 pt-6">
            <h3 class="text-lg font-medium text-slate-900 mb-4">{{ 'companies.form.address' | translate }}</h3>
            <div class="space-y-4">
              <div>
                <label for="street" class="block text-sm font-medium text-slate-700">{{ 'companies.form.street' | translate }}</label>
                <input
                  id="street"
                  type="text"
                  [formField]="companyForm.street"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div class="grid gap-6 sm:grid-cols-3">
                <div>
                  <label for="city" class="block text-sm font-medium text-slate-700">{{ 'companies.form.city' | translate }}</label>
                  <input
                    id="city"
                    type="text"
                    [formField]="companyForm.city"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label for="state" class="block text-sm font-medium text-slate-700">{{ 'companies.form.state' | translate }}</label>
                  <input
                    id="state"
                    type="text"
                    [formField]="companyForm.state"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label for="postalCode" class="block text-sm font-medium text-slate-700">
                    {{ 'companies.form.postalCode' | translate }}
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    [formField]="companyForm.postalCode"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label for="country" class="block text-sm font-medium text-slate-700">{{ 'companies.form.country' | translate }}</label>
                <input
                  id="country"
                  type="text"
                  [formField]="companyForm.country"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div class="border-t border-slate-200 pt-6">
            <h3 class="text-lg font-medium text-slate-900 mb-4">{{ 'companies.form.details' | translate }}</h3>
            <div class="grid gap-6 sm:grid-cols-3">
              <div>
                <label for="taxId" class="block text-sm font-medium text-slate-700">{{ 'companies.form.taxId' | translate }}</label>
                <input
                  id="taxId"
                  type="text"
                  [formField]="companyForm.taxId"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label for="industry" class="block text-sm font-medium text-slate-700">{{ 'companies.form.industry' | translate }}</label>
                <input
                  id="industry"
                  type="text"
                  [formField]="companyForm.industry"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label for="size" class="block text-sm font-medium text-slate-700">{{ 'companies.form.size' | translate }}</label>
                <input
                  id="size"
                  type="text"
                  [formField]="companyForm.size"
                  [placeholder]="'companies.form.sizePlaceholder' | translate"
                  class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div class="mt-4">
              <label for="logo" class="block text-sm font-medium text-slate-700">{{ 'companies.form.logoUrl' | translate }}</label>
              <input
                id="logo"
                type="url"
                [formField]="companyForm.logo"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
            <button
              type="submit"
              [disabled]="companyForm().invalid() || submitting()"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{
                submitting()
                  ? ('companies.form.saving' | translate)
                  : isEditMode()
                    ? ('companies.form.update' | translate)
                    : ('companies.form.create' | translate)
              }}
            </button>
            <a
              routerLink="/dashboard/companies"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              {{ 'common.cancel' | translate }}
            </a>
            @if (isEditMode()) {
              <button
                type="button"
                [disabled]="submitting()"
                (click)="onDelete()"
                class="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 transition"
              >
                {{ 'companies.form.delete' | translate }}
              </button>
            }
          </div>
        </form>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class CompanyFormComponent {
  private readonly apollo = inject(Apollo);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly id = input<string | undefined>(undefined);

  protected readonly companyModel = signal<CompanyFormModel>({ ...emptyModel });

  protected readonly companyForm = form(this.companyModel, (schemaPath) => {
    required(schemaPath.name, { message: 'companies.form.nameRequired' });
  });

  protected readonly organizations = signal<{ id: string; name: string }[]>([]);

  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly isEditMode = () => {
    const id = this.id();
    return !!id && id !== 'new';
  };

  constructor() {
    this.apollo
      .watchQuery<{ organizations: { id: string; name: string }[] }>({
        query: ORGANIZATIONS_QUERY,
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.organizations.set((result.data?.organizations ?? []) as { id: string; name: string }[]);
      });

    effect(() => {
      const companyId = this.id();
      if (companyId && companyId !== 'new') {
        this.loadCompany(companyId);
      } else {
        this.loading.set(false);
        this.companyModel.set({ ...emptyModel });
      }
    });
  }

  private loadCompany(id: string): void {
    this.loading.set(true);
    this.apollo
      .watchQuery<{ company: Record<string, unknown> | null }>({
        query: COMPANY_QUERY,
        variables: { id },
      })
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(result.loading);
          const company = result.data?.company;
          if (company && typeof company === 'object') {
            this.companyModel.set({
              organizationId: (company['organizationId'] as string) ?? '',
              name: (company['name'] as string) ?? '',
              legalName: (company['legalName'] as string) ?? '',
              description: (company['description'] as string) ?? '',
              email: (company['email'] as string) ?? '',
              phone: (company['phone'] as string) ?? '',
              website: (company['website'] as string) ?? '',
              street: (company['street'] as string) ?? '',
              city: (company['city'] as string) ?? '',
              state: (company['state'] as string) ?? '',
              postalCode: (company['postalCode'] as string) ?? '',
              country: (company['country'] as string) ?? '',
              taxId: (company['taxId'] as string) ?? '',
              logo: (company['logo'] as string) ?? '',
              industry: (company['industry'] as string) ?? '',
              size: (company['size'] as string) ?? '',
            });
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.submitError.set(
            err.message ?? this.translate.instant('companies.form.loadFailed'),
          );
        },
      });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitError.set(null);
    if (!this.companyForm().valid()) return;

    const value = this.companyModel();
    const input = {
      organizationId: value.organizationId || undefined,
      name: value.name,
      legalName: value.legalName || undefined,
      description: value.description || undefined,
      email: value.email || undefined,
      phone: value.phone || undefined,
      website: value.website || undefined,
      street: value.street || undefined,
      city: value.city || undefined,
      state: value.state || undefined,
      postalCode: value.postalCode || undefined,
      country: value.country || undefined,
      taxId: value.taxId || undefined,
      logo: value.logo || undefined,
      industry: value.industry || undefined,
      size: value.size || undefined,
    };

    if (this.isEditMode()) {
      this.submitting.set(true);
      this.apollo
        .mutate({
          mutation: UPDATE_COMPANY_MUTATION,
          variables: { id: this.id(), input },
          refetchQueries: [{ query: COMPANIES_QUERY }],
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/dashboard/companies']);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(
              err.message ?? this.translate.instant('companies.form.updateFailed'),
            );
          },
        });
    } else {
      if (!value.organizationId) {
        this.submitError.set(
          this.translate.instant('companies.form.organizationRequired'),
        );
        return;
      }
      this.submitting.set(true);
      this.apollo
        .mutate({
          mutation: CREATE_COMPANY_MUTATION,
          variables: { input },
          refetchQueries: [{ query: COMPANIES_QUERY }],
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/dashboard/companies']);
          },
          error: (err) => {
            this.submitting.set(false);
            this.submitError.set(
              err.message ?? this.translate.instant('companies.form.createFailed'),
            );
          },
        });
    }
  }

  protected onDelete(): void {
    if (!this.isEditMode() || !this.id()) return;

    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('companies.form.deleteTitle'),
        message: this.translate.instant('companies.form.deleteMessage'),
        confirmLabel: this.translate.instant('companies.form.deleteConfirm'),
        cancelLabel: this.translate.instant('common.cancel'),
        confirmDanger: true,
      },
      role: 'alertdialog',
      ariaModal: true,
      ariaLabel: this.translate.instant('companies.form.deleteAriaLabel'),
      width: '400px',
    });

    dialogRef.closed.subscribe((result) => {
      if (result === true) {
        this.submitting.set(true);
        this.submitError.set(null);
        this.apollo
          .mutate({
            mutation: DELETE_COMPANY_MUTATION,
            variables: { id: this.id() },
            refetchQueries: [{ query: COMPANIES_QUERY }],
          })
          .subscribe({
            next: () => {
              this.submitting.set(false);
              this.router.navigate(['/dashboard/companies']);
            },
            error: (err) => {
              this.submitting.set(false);
              this.submitError.set(
                err.message ?? this.translate.instant('companies.form.deleteFailed'),
              );
            },
          });
      }
    });
  }
}
