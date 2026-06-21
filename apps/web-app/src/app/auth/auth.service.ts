import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, Injector, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';

import { getAuthClient, updateAuthUser } from './auth-client';

export type UserRole = 'ADMIN' | 'DESIGNER' | 'ORG_ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  locale?: string | null;
  role?: UserRole | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private injector = inject(Injector);

  private _user = signal<User | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _ready = signal(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly ready = this._ready.asReadonly();
  readonly role = computed(() => this._user()?.role ?? null);
  readonly isAdmin = computed(() => this.role() === 'ADMIN');
  readonly isDesigner = computed(() => this.role() === 'DESIGNER');
  readonly isOrgAdmin = computed(() => this.role() === 'ORG_ADMIN');
  readonly isEmployee = computed(() => this.role() === 'EMPLOYEE');

  private _readyPromise: Promise<void>;
  private _resolveReady!: () => void;

  constructor() {
    this._readyPromise = new Promise((resolve) => {
      this._resolveReady = resolve;
    });
    this.loadSession();
  }

  waitUntilReady(): Promise<void> {
    return this._readyPromise;
  }

  hasRole(...roles: UserRole[]): boolean {
    const role = this.role();
    return !!role && roles.includes(role);
  }

  async signIn(credentials: AuthCredentials): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const { data, error } = await getAuthClient().signIn.email({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        this._error.set(error.message ?? 'auth.signInFailed');
        return false;
      }

      this._user.set(data.user as User);
      await this.syncLocaleFromUser();
      return true;
    } catch {
      this._error.set('auth.signInFailed');
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  async logout(): Promise<void> {
    await getAuthClient().signOut();
    this._user.set(null);
    await this.syncLocaleFromUser();
    this.router.navigate(['/login']);
  }

  async updateUser(data: {
    name?: string;
    image?: string | null;
    locale?: string;
  }): Promise<{ success: boolean; error?: string }> {
    this._error.set(null);
    try {
      const { data: result, error } = await updateAuthUser(data);
      if (error) {
        return { success: false, error: error.message ?? 'Failed to update profile' };
      }
      if (result?.status && isPlatformBrowser(this.platformId)) {
        const { data: sessionData } = await getAuthClient().getSession();
        if (sessionData?.user) {
          this._user.set(sessionData.user as User);
          await this.syncLocaleFromUser();
        }
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update profile' };
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
    revokeOtherSessions?: boolean
  ): Promise<{ success: boolean; error?: string }> {
    this._error.set(null);
    try {
      const { error } = await getAuthClient().changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions,
      });
      if (error) {
        return { success: false, error: error.message ?? 'Failed to change password' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to change password' };
    }
  }

  private async syncLocaleFromUser(): Promise<void> {
    const { LocaleService } = await import('../i18n/locale.service');
    await this.injector.get(LocaleService).init();
  }

  private async loadSession(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this._ready.set(true);
      this._resolveReady();
      return;
    }

    try {
      const { data } = await getAuthClient().getSession();
      if (data?.user) {
        this._user.set(data.user as User);
      }
    } catch {
      // No active session
    } finally {
      this._ready.set(true);
      this._resolveReady();
    }
  }
}
