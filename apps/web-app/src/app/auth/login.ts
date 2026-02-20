import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white text-2xl font-bold mb-4 shadow-lg shadow-indigo-200"
          >
            T
          </div>
          <h1 class="text-2xl font-bold text-slate-900">
            {{ isSignUp() ? 'Create your account' : 'Welcome back' }}
          </h1>
          <p class="text-slate-500 mt-1">
            {{ isSignUp() ? 'Get started with Tips App' : 'Sign in to your account' }}
          </p>
        </div>

        <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8">
          @if (auth.error()) {
            <div
              class="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
              role="alert"
            >
              {{ auth.error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-5">
            @if (isSignUp()) {
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  [(ngModel)]="name"
                  name="name"
                  required
                  autocomplete="name"
                  placeholder="Jane Doe"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            }

            <div>
              <label
                for="email"
                class="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                autocomplete="email"
                placeholder="you@example.com"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                autocomplete="{{ isSignUp() ? 'new-password' : 'current-password' }}"
                placeholder="••••••••"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              [disabled]="auth.loading()"
              class="w-full py-2.5 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              @if (auth.loading()) {
                <span class="inline-flex items-center gap-2">
                  <span class="material-symbols-outlined animate-spin text-xl" aria-hidden="true">progress_activity</span>
                  {{ isSignUp() ? 'Creating account…' : 'Signing in…' }}
                </span>
              } @else {
                {{ isSignUp() ? 'Create account' : 'Sign in' }}
              }
            </button>
          </form>
        </div>

        <p class="text-center text-sm text-slate-500 mt-6">
          @if (isSignUp()) {
            Already have an account?
            <button
              (click)="isSignUp.set(false)"
              class="text-indigo-600 font-medium hover:text-indigo-500"
            >
              Sign in
            </button>
          } @else {
            Don't have an account?
            <button
              (click)="isSignUp.set(true)"
              class="text-indigo-600 font-medium hover:text-indigo-500"
            >
              Get started
            </button>
          }
        </p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class LoginComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  returnUrl = input<string>('/dashboard');

  protected email = signal('');
  protected password = signal('');
  protected name = signal('');
  protected isSignUp = signal(false);

  async onSubmit() {
    let success: boolean;

    if (this.isSignUp()) {
      success = await this.auth.signUp({
        email: this.email(),
        password: this.password(),
        name: this.name(),
      });
    } else {
      success = await this.auth.signIn({
        email: this.email(),
        password: this.password(),
      });
    }

    if (success) {
      this.router.navigateByUrl(this.returnUrl());
    }
  }
}
