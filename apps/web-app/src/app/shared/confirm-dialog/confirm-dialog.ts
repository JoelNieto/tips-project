import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDanger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-white rounded-lg shadow-lg">
      <h2
        class="text-lg font-semibold text-slate-900"
        id="confirm-dialog-title"
      >
        {{ data.title }}
      </h2>
      <p class="mt-3 text-slate-600" id="confirm-dialog-description">
        {{ data.message }}
      </p>
      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          (click)="dialogRef.close(false)"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          {{ data.cancelLabel ?? 'Cancel' }}
        </button>
        <button
          type="button"
          (click)="dialogRef.close(true)"
          [class]="
            data.confirmDanger
              ? 'rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition'
              : 'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition'
          "
        >
          {{ data.confirmLabel ?? 'Confirm' }}
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
export default class ConfirmDialogComponent {
  protected readonly dialogRef = inject(DialogRef<boolean>);
  protected readonly data: ConfirmDialogData = inject(DIALOG_DATA, {
    optional: true,
  }) ?? {
    title: 'Confirm',
    message: 'Are you sure?',
  };
}
