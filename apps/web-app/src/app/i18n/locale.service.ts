import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  detectBrowserLocale,
  normalizeLocale,
} from './supported-locales';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly translate = inject(TranslateService);
  private readonly auth = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _locale = signal<AppLocale>(DEFAULT_LOCALE);
  readonly locale = this._locale.asReadonly();

  /** Resolves locale after auth session is ready and loads translations. */
  async init(): Promise<void> {
    const locale = this.resolveInitialLocale();
    await this.applyLocale(locale);
  }

  /** Active locale for guests and for sign-up. */
  getActiveLocale(): AppLocale {
    return this._locale();
  }

  async setLocale(locale: AppLocale): Promise<void> {
    await this.applyLocale(locale);
  }

  private resolveInitialLocale(): AppLocale {
    const user = this.auth.user();
    if (user?.locale) {
      return normalizeLocale(user.locale);
    }
    if (this.auth.isAuthenticated()) {
      return detectBrowserLocale();
    }
    return detectBrowserLocale();
  }

  private async applyLocale(locale: AppLocale): Promise<void> {
    this._locale.set(locale);
    await firstValueFrom(this.translate.use(locale));
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.lang = locale;
    }
  }
}
