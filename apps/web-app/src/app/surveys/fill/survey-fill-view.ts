import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import type { SurveyFillData } from './survey-fill.types';
import {
  buildFillSteps,
  countFillSteps,
  sectionHasContent,
  toFillSurveyConfig,
} from './survey-fill.utils';
import SurveyFillSectionComponent from './survey-fill-section';
import SurveyFillWizardComponent from './survey-fill-wizard';

@Component({
  selector: 'app-survey-fill-view',
  standalone: true,
  imports: [SurveyFillSectionComponent, SurveyFillWizardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-3xl space-y-8">
      @if (previewMode()) {
        <div
          class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          Preview mode — responses are not saved
        </div>
      }

      <header class="text-center">
        <h2 class="text-3xl font-bold text-slate-900">{{ survey().title }}</h2>
        @if (survey().description) {
          <p class="mt-3 text-slate-600">{{ survey().description }}</p>
        }
        @if (showSurveyLevelCounter()) {
          <p class="mt-3 text-sm font-medium text-slate-500">
            {{ totalQuestionCount() }} {{ totalQuestionCount() === 1 ? 'question' : 'questions' }}
          </p>
        }
      </header>

      @if (visibleDimensions().length === 0) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
        >
          This survey has no questions yet.
        </div>
      } @else if (survey().presentAllQuestionsAtOnce) {
        <div class="space-y-10">
          @for (dim of visibleDimensions(); track dim.id) {
            <app-survey-fill-section
              [dimension]="dim"
              [surveyConfig]="fillSurveyConfig()"
              [shuffleSeed]="shuffleSeed()"
              [showQuestionCounter]="survey().visibleCategories"
            />
          }
        </div>
      } @else {
        <app-survey-fill-wizard
          [survey]="survey()"
          [previewMode]="previewMode()"
        />
      }
    </div>
  `,
})
export default class SurveyFillViewComponent {
  readonly survey = input.required<SurveyFillData>();
  readonly previewMode = input(true);

  protected readonly shuffleSeed = signal(0);

  protected readonly visibleDimensions = computed(() =>
    (this.survey().dimensions ?? []).filter(sectionHasContent)
  );

  protected readonly fillSurveyConfig = computed(() =>
    toFillSurveyConfig(this.survey())
  );

  protected readonly totalQuestionCount = computed(() =>
    countFillSteps(buildFillSteps(this.survey(), this.shuffleSeed()))
  );

  protected readonly showSurveyLevelCounter = computed(
    () =>
      this.survey().presentAllQuestionsAtOnce &&
      !this.survey().visibleCategories
  );

  constructor() {
    effect(() => {
      this.survey();
      this.shuffleSeed.set(Date.now());
    });
  }
}
