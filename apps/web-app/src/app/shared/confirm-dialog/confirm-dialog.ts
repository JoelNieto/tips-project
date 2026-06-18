import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

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
  imports: [TranslatePipe],
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
          {{ data.cancelLabel ?? ('common.cancel' | translate) }}
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
          {{ data.confirmLabel ?? ('common.confirm' | translate) }}
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
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  protected readonly dialogRef = inject(DialogRef<boolean>);
}
