import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

export interface ResetPasswordDialogData {
  userName: string;
}

@Component({
  selector: 'app-reset-password-dialog',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-white rounded-lg shadow-lg w-full max-w-sm">
      <h2 class="text-lg font-semibold text-slate-900">
        {{ 'users.resetPassword.title' | translate }}
      </h2>
      <p class="mt-1 text-sm text-slate-500">
        {{ 'users.resetPassword.subtitle' | translate: { name: data.userName } }}
      </p>

      <form #f="ngForm" (ngSubmit)="onSubmit(f)" class="mt-4 space-y-4">
        <div>
          <label
            for="newPassword"
            class="block text-sm font-medium text-slate-700 mb-1"
          >
            {{ 'users.resetPassword.newPassword' | translate }}
          </label>
          <input
            #newPasswordField="ngModel"
            id="newPassword"
            [(ngModel)]="newPassword"
            name="newPassword"
            type="password"
            required
            minlength="8"
            class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            [class.border-red-500]="newPasswordField.invalid && newPasswordField.touched"
          />
          @if (newPasswordField.touched && newPasswordField.errors?.['required']) {
            <p class="mt-1 text-xs text-red-600">
              {{ 'users.resetPassword.passwordRequired' | translate }}
            </p>
          } @else if (newPasswordField.touched && newPasswordField.errors?.['minlength']) {
            <p class="mt-1 text-xs text-red-600">
              {{ 'users.resetPassword.passwordMinLength' | translate }}
            </p>
          }
        </div>

        <div>
          <label
            for="confirmPassword"
            class="block text-sm font-medium text-slate-700 mb-1"
          >
            {{ 'users.resetPassword.confirmPassword' | translate }}
          </label>
          <input
            #confirmField="ngModel"
            id="confirmPassword"
            [(ngModel)]="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            [class.border-red-500]="confirmField.touched && passwordMismatch()"
          />
          @if (confirmField.touched && passwordMismatch()) {
            <p class="mt-1 text-xs text-red-600">
              {{ 'users.resetPassword.passwordsMustMatch' | translate }}
            </p>
          }
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            (click)="dialogRef.close(null)"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            {{ 'common.cancel' | translate }}
          </button>
          <button
            type="submit"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {{ 'users.resetPassword.confirm' | translate }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class ResetPasswordDialogComponent {
  protected readonly data = inject<ResetPasswordDialogData>(DIALOG_DATA);
  protected readonly dialogRef = inject(DialogRef<string | null>);

  protected newPassword = '';
  protected confirmPassword = '';
  protected readonly mismatch = signal(false);

  protected passwordMismatch(): boolean {
    return (
      this.confirmPassword.length > 0 &&
      this.newPassword !== this.confirmPassword
    );
  }

  protected onSubmit(form: NgForm): void {
    form.form.markAllAsTouched();
    if (form.invalid || this.passwordMismatch()) {
      return;
    }
    this.dialogRef.close(this.newPassword);
  }
}
