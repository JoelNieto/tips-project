import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';

import { getAuthClient } from './auth-client';

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private _user = signal<User | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _ready = signal(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly ready = this._ready.asReadonly();

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

  async signIn(credentials: AuthCredentials): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const { data, error } = await getAuthClient().signIn.email({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        this._error.set(error.message ?? 'Sign in failed. Please try again.');
        return false;
      }

      this._user.set(data.user as User);
      return true;
    } catch {
      this._error.set('Sign in failed. Please try again.');
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  async signUp(credentials: AuthCredentials): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const { data, error } = await getAuthClient().signUp.email({
        email: credentials.email,
        password: credentials.password,
        name: credentials.name ?? credentials.email.split('@')[0],
      });

      if (error) {
        this._error.set(error.message ?? 'Sign up failed. Please try again.');
        return false;
      }

      this._user.set(data.user as User);
      return true;
    } catch {
      this._error.set('Sign up failed. Please try again.');
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  async logout(): Promise<void> {
    await getAuthClient().signOut();
    this._user.set(null);
    this.router.navigate(['/login']);
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
