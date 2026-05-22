import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type { FillDimensionQuestion } from './survey-fill.types';
import {
  effectiveIsMultiAnswer,
  effectiveIsReversed,
  orderAnswerOptions,
  resolveAnswerOptions,
} from './survey-fill.utils';

@Component({
  selector: 'app-survey-fill-question',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset class="rounded-lg border border-slate-200 bg-white p-5">
      <legend class="text-base font-medium text-slate-900">
        {{ prompt() }}
      </legend>
      <div class="mt-4 space-y-2">
        @for (option of answerOptions(); track option.id) {
          <label
            class="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-4 py-3 transition hover:border-indigo-300 hover:bg-indigo-50/50"
            [class.border-indigo-500]="isSelected(option.id)"
            [class.bg-indigo-50]="isSelected(option.id)"
          >
            <input
              [type]="inputType()"
              [name]="fieldName()"
              [value]="option.id"
              [checked]="isSelected(option.id)"
              (change)="onOptionChange(option.id, $event)"
              class="mt-0.5 h-4 w-4 shrink-0 border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-sm text-slate-800">{{ option.text }}</span>
          </label>
        }
      </div>
    </fieldset>
  `,
})
export default class SurveyFillQuestionComponent {
  readonly dimensionQuestion = input.required<FillDimensionQuestion>();

  /** Single: answer id. Multi: comma-separated answer ids. */
  readonly selection = input<string>('');
  readonly selectionChange = output<string>();

  protected readonly prompt = computed(() => {
    const q = this.dimensionQuestion().question;
    return q.text?.trim() || q.title;
  });

  protected readonly fieldName = computed(
    () => `dq-${this.dimensionQuestion().id}`
  );

  protected readonly inputType = computed(() =>
    effectiveIsMultiAnswer(this.dimensionQuestion()) ? 'checkbox' : 'radio'
  );

  protected readonly answerOptions = computed(() => {
    const dq = this.dimensionQuestion();
    const options = resolveAnswerOptions(dq);
    return orderAnswerOptions(options, effectiveIsReversed(dq));
  });

  protected isSelected(optionId: string): boolean {
    const sel = this.selection();
    if (effectiveIsMultiAnswer(this.dimensionQuestion())) {
      return sel.split(',').filter(Boolean).includes(optionId);
    }
    return sel === optionId;
  }

  protected onOptionChange(optionId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const isMulti = effectiveIsMultiAnswer(this.dimensionQuestion());

    if (isMulti) {
      const current = new Set(
        this.selection()
          .split(',')
          .filter(Boolean)
      );
      if (input.checked) {
        current.add(optionId);
      } else {
        current.delete(optionId);
      }
      this.selectionChange.emit([...current].join(','));
    } else if (input.checked) {
      this.selectionChange.emit(optionId);
    }
  }
}
