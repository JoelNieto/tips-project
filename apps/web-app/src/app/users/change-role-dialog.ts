import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

export type UserRole = 'ADMIN' | 'DESIGNER' | 'ORG_ADMIN' | 'EMPLOYEE';

export interface ChangeRoleDialogData {
  userName: string;
  currentRole: UserRole;
}

const ROLE_KEYS: Record<UserRole, string> = {
  ADMIN: 'users.form.roleAdmin',
  DESIGNER: 'users.form.roleDesigner',
  ORG_ADMIN: 'users.form.roleOrgAdmin',
  EMPLOYEE: 'users.form.roleEmployee',
};

@Component({
  selector: 'app-change-role-dialog',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-white rounded-lg shadow-lg w-full max-w-sm">
      <h2 class="text-lg font-semibold text-slate-900">
        {{ 'users.changeRole.title' | translate }}
      </h2>
      <p class="mt-1 text-sm text-slate-500">
        {{ 'users.changeRole.subtitle' | translate: { name: data.userName } }}
      </p>

      <div class="mt-4">
        <label
          for="role"
          class="block text-sm font-medium text-slate-700 mb-1"
        >
          {{ 'users.changeRole.role' | translate }}
        </label>
        <select
          id="role"
          [(ngModel)]="selectedRole"
          name="role"
          class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          @for (option of roleOptions; track option) {
            <option [value]="option">{{ roleLabel(option) }}</option>
          }
        </select>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          (click)="dialogRef.close(null)"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          {{ 'common.cancel' | translate }}
        </button>
        <button
          type="button"
          (click)="onConfirm()"
          [disabled]="selectedRole === data.currentRole"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {{ 'users.changeRole.confirm' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export default class ChangeRoleDialogComponent {
  protected readonly data = inject<ChangeRoleDialogData>(DIALOG_DATA);
  protected readonly dialogRef = inject(DialogRef<UserRole | null>);
  private readonly translate = inject(TranslateService);

  protected readonly roleOptions: UserRole[] = [
    'ADMIN',
    'DESIGNER',
    'ORG_ADMIN',
    'EMPLOYEE',
  ];

  protected selectedRole: UserRole = this.data.currentRole;

  protected roleLabel(role: UserRole): string {
    return this.translate.instant(ROLE_KEYS[role]);
  }

  protected onConfirm(): void {
    if (this.selectedRole === this.data.currentRole) return;
    this.dialogRef.close(this.selectedRole);
  }
}
