import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type { FillMainQuestionAnswer } from './survey-fill.types';
import { orderMainQuestionAnswers } from './survey-fill.utils';

@Component({
  selector: 'app-survey-fill-main-question',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset class="rounded-lg border border-indigo-100 bg-indigo-50/30 p-5">
      <legend class="text-base font-medium text-slate-900">
        {{ prompt() }}
      </legend>
      <div class="mt-4 space-y-2">
        @for (option of orderedAnswers(); track option.id) {
          <label
            class="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:border-indigo-300"
            [class.border-indigo-500]="selection() === option.id"
            [class.bg-indigo-50]="selection() === option.id"
          >
            <input
              type="radio"
              [name]="fieldName()"
              [value]="option.id"
              [checked]="selection() === option.id"
              (change)="selectionChange.emit(option.id)"
              class="mt-0.5 h-4 w-4 shrink-0 border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-sm text-slate-800">{{ option.text }}</span>
          </label>
        }
      </div>
    </fieldset>
  `,
})
export default class SurveyFillMainQuestionComponent {
  readonly dimensionId = input.required<string>();
  readonly prompt = input.required<string>();
  readonly answers = input.required<FillMainQuestionAnswer[]>();

  readonly selection = input<string>('');
  readonly selectionChange = output<string>();

  protected readonly fieldName = computed(
    () => `main-${this.dimensionId()}`
  );

  protected readonly orderedAnswers = computed(() =>
    orderMainQuestionAnswers(this.answers())
  );
}
