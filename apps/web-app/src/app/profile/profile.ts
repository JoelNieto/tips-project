import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  form,
  FormField,
  minLength,
  required,
} from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../auth/auth.service';
import { LocaleService } from '../i18n/locale.service';
import {
  type AppLocale,
  LOCALE_LABELS,
  normalizeLocale,
  SUPPORTED_LOCALES,
} from '../i18n/supported-locales';

interface ProfileFormModel {
  name: string;
  image: string;
  locale: AppLocale;
}

interface ChangePasswordFormModel {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  revokeOtherSessions: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormField, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <a
          routerLink="/dashboard"
          class="text-slate-500 hover:text-slate-700"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">{{ 'profile.title' | translate }}</h2>
          <p class="mt-1 text-slate-500">{{ 'profile.subtitle' | translate }}</p>
        </div>
      </div>

      @if (auth.user(); as user) {
        <form
          (submit)="onProfileSubmit($event)"
          class="space-y-6 rounded-xl border border-slate-200 bg-white p-6"
        >
          <h3 class="text-lg font-medium text-slate-900">{{ 'profile.information' | translate }}</h3>

          @if (profileSuccess()) {
            <div class="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 text-sm">
              {{ 'profile.updatedSuccess' | translate }}
            </div>
          }
          @if (profileError()) {
            <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {{ profileError() }}
            </div>
          }

          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label for="profile-name" class="block text-sm font-medium text-slate-700">{{ 'profile.name' | translate }} *</label>
              <input
                id="profile-name"
                type="text"
                [formField]="profileForm.name"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
              @if (profileForm.name().touched() && profileForm.name().invalid()) {
                <p class="mt-1 text-sm text-red-600">
                  {{ (profileForm.name().errors()[0]?.message ?? 'profile.nameRequired') | translate }}
                </p>
              }
            </div>

            <div>
              <label for="profile-email" class="block text-sm font-medium text-slate-700">{{ 'profile.email' | translate }}</label>
              <input
                id="profile-email"
                type="email"
                [value]="user.email"
                readonly
                class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 sm:text-sm"
              />
              <p class="mt-1 text-xs text-slate-500">{{ 'profile.emailReadonly' | translate }}</p>
            </div>
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label for="profile-locale" class="block text-sm font-medium text-slate-700">{{ 'profile.language' | translate }}</label>
              <select
                id="profile-locale"
                [formField]="profileForm.locale"
                (change)="onLocaleChange()"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              >
                @for (loc of supportedLocales; track loc) {
                  <option [value]="loc">{{ localeLabels[loc] }}</option>
                }
              </select>
            </div>
          </div>

          <div>
            <label for="profile-image" class="block text-sm font-medium text-slate-700">{{ 'profile.avatarUrl' | translate }}</label>
            <input
              id="profile-image"
              type="url"
              [formField]="profileForm.image"
              placeholder="https://example.com/avatar.jpg"
              class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              [disabled]="profileForm().invalid() || profileSubmitting()"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{
                profileSubmitting()
                  ? ('profile.saving' | translate)
                  : ('profile.saveProfile' | translate)
              }}
            </button>
          </div>
        </form>

        <form
          (submit)="onPasswordSubmit($event)"
          class="space-y-6 rounded-xl border border-slate-200 bg-white p-6"
        >
          <h3 class="text-lg font-medium text-slate-900">{{ 'profile.changePassword' | translate }}</h3>

          @if (passwordSuccess()) {
            <div class="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 text-sm">
              {{ 'profile.passwordChangedSuccess' | translate }}
            </div>
          }
          @if (passwordError()) {
            <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {{ passwordError() }}
            </div>
          }

          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label for="current-password" class="block text-sm font-medium text-slate-700">{{ 'profile.currentPassword' | translate }} *</label>
              <input
                id="current-password"
                type="password"
                [formField]="passwordForm.currentPassword"
                autocomplete="current-password"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
              @if (passwordForm.currentPassword().touched() && passwordForm.currentPassword().invalid()) {
                <p class="mt-1 text-sm text-red-600">
                  {{ (passwordForm.currentPassword().errors()[0]?.message ?? 'profile.currentPasswordRequired') | translate }}
                </p>
              }
            </div>
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label for="new-password" class="block text-sm font-medium text-slate-700">{{ 'profile.newPassword' | translate }} *</label>
              <input
                id="new-password"
                type="password"
                [formField]="passwordForm.newPassword"
                autocomplete="new-password"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
              @if (passwordForm.newPassword().touched() && passwordForm.newPassword().invalid()) {
                <p class="mt-1 text-sm text-red-600">
                  {{ (passwordForm.newPassword().errors()[0]?.message ?? 'profile.passwordMinLength') | translate }}
                </p>
              }
            </div>

            <div>
              <label for="confirm-password" class="block text-sm font-medium text-slate-700">{{ 'profile.confirmPassword' | translate }} *</label>
              <input
                id="confirm-password"
                type="password"
                [formField]="passwordForm.confirmPassword"
                autocomplete="new-password"
                class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
              @if (passwordForm.confirmPassword().touched() && confirmPasswordMismatch()) {
                <p class="mt-1 text-sm text-red-600">{{ 'profile.passwordsMustMatch' | translate }}</p>
              }
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input
              id="revoke-sessions"
              type="checkbox"
              [formField]="passwordForm.revokeOtherSessions"
              class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label for="revoke-sessions" class="text-sm font-medium text-slate-700">
              {{ 'profile.revokeOtherSessions' | translate }}
            </label>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="passwordForm().invalid() || passwordSubmitting() || confirmPasswordMismatch()"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{
                passwordSubmitting()
                  ? ('profile.changingPassword' | translate)
                  : ('profile.changePasswordButton' | translate)
              }}
            </button>
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
export default class ProfileComponent {
  protected readonly auth = inject(AuthService);
  private readonly localeService = inject(LocaleService);
  private readonly translate = inject(TranslateService);

  protected readonly supportedLocales = SUPPORTED_LOCALES;
  protected readonly localeLabels = LOCALE_LABELS;

  protected readonly profileModel = signal<ProfileFormModel>({
    name: '',
    image: '',
    locale: 'en',
  });
  protected readonly profileForm = form(this.profileModel, (schemaPath) => {
    required(schemaPath.name, { message: 'profile.nameRequired' });
  });

  protected readonly passwordModel = signal<ChangePasswordFormModel>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    revokeOtherSessions: false,
  });
  protected readonly passwordForm = form(this.passwordModel, (schemaPath) => {
    required(schemaPath.currentPassword, { message: 'profile.currentPasswordRequired' });
    required(schemaPath.newPassword, { message: 'profile.newPasswordRequired' });
    minLength(schemaPath.newPassword, 8, { message: 'profile.passwordMinLength' });
    required(schemaPath.confirmPassword, { message: 'profile.confirmPasswordRequired' });
    minLength(schemaPath.confirmPassword, 8, { message: 'profile.passwordMinLength' });
  });

  protected readonly profileSubmitting = signal(false);
  protected readonly profileSuccess = signal(false);
  protected readonly profileError = signal<string | null>(null);

  protected readonly passwordSubmitting = signal(false);
  protected readonly passwordSuccess = signal(false);
  protected readonly passwordError = signal<string | null>(null);

  protected readonly confirmPasswordMismatch = () => {
    const p = this.passwordModel();
    return p.newPassword !== '' && p.confirmPassword !== '' && p.newPassword !== p.confirmPassword;
  };

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (user) {
        this.profileModel.set({
          name: user.name ?? '',
          image: user.image ?? '',
          locale: normalizeLocale(user.locale),
        });
      }
    });
  }

  protected async onLocaleChange(): Promise<void> {
    await this.localeService.setLocale(this.profileModel().locale);
  }

  protected async onProfileSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.profileSuccess.set(false);
    this.profileError.set(null);
    if (!this.profileForm().valid()) return;

    const { name, image, locale } = this.profileModel();
    this.profileSubmitting.set(true);

    const result = await this.auth.updateUser({
      name,
      image: image || null,
      locale,
    });

    this.profileSubmitting.set(false);
    if (result.success) {
      this.profileSuccess.set(true);
    } else {
      this.profileError.set(
        result.error ?? this.translate.instant('profile.updateFailed')
      );
    }
  }

  protected async onPasswordSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.passwordSuccess.set(false);
    this.passwordError.set(null);
    if (!this.passwordForm().valid() || this.confirmPasswordMismatch()) return;

    const { currentPassword, newPassword, revokeOtherSessions } = this.passwordModel();
    this.passwordSubmitting.set(true);

    const result = await this.auth.changePassword(
      currentPassword,
      newPassword,
      revokeOtherSessions
    );

    this.passwordSubmitting.set(false);
    if (result.success) {
      this.passwordSuccess.set(true);
      this.passwordModel.set({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        revokeOtherSessions: false,
      });
    } else {
      this.passwordError.set(
        result.error ?? this.translate.instant('profile.passwordChangeFailed')
      );
    }
  }
}
