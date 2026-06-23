import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import type { FillStep, SurveyFillData } from './survey-fill.types';
import {
  buildFillSteps,
  effectiveIsMultiAnswer,
  fillStepKey,
} from './survey-fill.utils';
import SurveyFillMainQuestionComponent from './survey-fill-main-question';
import SurveyFillQuestionComponent from './survey-fill-question';

interface HiddenInputEntry {
  name: string;
  value: string;
}

@Component({
  selector: 'app-survey-fill-wizard',
  standalone: true,
  imports: [SurveyFillMainQuestionComponent, SurveyFillQuestionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      @for (hidden of hiddenInputs(); track hidden.name + hidden.value) {
        <input type="hidden" [name]="hidden.name" [value]="hidden.value" />
      }

      <p class="text-sm font-medium text-slate-500" role="status">
        Question {{ currentStepIndex() + 1 }} of {{ steps().length }}
      </p>

      @if (currentStep(); as step) {
        @if (showCategoryContext()) {
          <p class="text-sm font-medium text-indigo-700">{{ step.categoryTitle }}</p>
        }

        @if (step.kind === 'main') {
          <app-survey-fill-main-question
            [dimensionId]="step.dimensionId"
            [prompt]="step.prompt"
            [answers]="step.answers"
            [selection]="currentSelection()"
            (selectionChange)="onSelectionChange($event)"
          />
        } @else {
          <app-survey-fill-question
            [dimensionQuestion]="step.dimensionQuestion"
            [selection]="currentSelection()"
            (selectionChange)="onSelectionChange($event)"
          />
        }
      }

      <div class="flex items-center justify-between gap-3 pt-2">
        @if (showPrevious()) {
          <button
            type="button"
            (click)="goPrevious()"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Previous
          </button>
        } @else {
          <span></span>
        }

        @if (isLastStep()) {
          <button
            type="submit"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            Submit survey
          </button>
        } @else {
          <button
            type="button"
            (click)="goNext()"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            Next
          </button>
        }
      </div>
    </div>
  `,
})
export default class SurveyFillWizardComponent {
  readonly survey = input.required<SurveyFillData>();
  readonly previewMode = input(false);

  protected readonly shuffleSeed = signal(0);
  protected readonly currentStepIndex = signal(0);
  protected readonly answers = signal<Record<string, string>>({});

  protected readonly steps = computed(() =>
    buildFillSteps(this.survey(), this.shuffleSeed())
  );

  protected readonly currentStep = computed(() => {
    const list = this.steps();
    const index = this.currentStepIndex();
    return list[index] ?? null;
  });

  protected readonly currentSelection = computed(() => {
    const step = this.currentStep();
    if (!step) return '';
    return this.answers()[fillStepKey(step)] ?? '';
  });

  protected readonly isLastStep = computed(() => {
    const list = this.steps();
    return list.length > 0 && this.currentStepIndex() >= list.length - 1;
  });

  protected readonly showPrevious = computed(() => {
    return (
      this.survey().allowPreviousQuestion && this.currentStepIndex() > 0
    );
  });

  protected readonly showCategoryContext = computed(() => {
    const step = this.currentStep();
    return !!step?.categoryTitle && this.survey().visibleCategories;
  });

  protected readonly hiddenInputs = computed((): HiddenInputEntry[] => {
    const currentKey = this.currentStep()
      ? fillStepKey(this.currentStep()!)
      : null;
    const entries: HiddenInputEntry[] = [];

    for (const [key, value] of Object.entries(this.answers())) {
      if (!value || key === currentKey) continue;
      const step = this.steps().find((s) => fillStepKey(s) === key);
      if (!step) continue;

      const name =
        step.kind === 'main'
          ? `main-${step.dimensionId}`
          : `dq-${step.dimensionQuestion.id}`;

      if (step.kind === 'question' && effectiveIsMultiAnswer(step.dimensionQuestion)) {
        for (const id of value.split(',').filter(Boolean)) {
          entries.push({ name, value: id });
        }
      } else {
        entries.push({ name, value });
      }
    }

    return entries;
  });

  constructor() {
    effect(() => {
      this.survey();
      this.shuffleSeed.set(Date.now());
      this.currentStepIndex.set(0);
      this.answers.set({});
    });
  }

  protected onSelectionChange(value: string): void {
    const step = this.currentStep();
    if (!step) return;
    const key = fillStepKey(step);
    this.answers.update((prev) => ({ ...prev, [key]: value }));
  }

  protected goNext(): void {
    if (this.isLastStep()) return;
    this.currentStepIndex.update((i) => i + 1);
  }

  protected goPrevious(): void {
    if (!this.showPrevious()) return;
    this.currentStepIndex.update((i) => Math.max(0, i - 1));
  }
}
