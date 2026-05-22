import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import type { SurveyFillData } from './survey-fill.types';
import { sectionHasContent } from './survey-fill.utils';
import SurveyFillSectionComponent from './survey-fill-section';

@Component({
  selector: 'app-survey-fill-view',
  standalone: true,
  imports: [SurveyFillSectionComponent],
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
      </header>

      @if (visibleDimensions().length === 0) {
        <div
          class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
        >
          This survey has no questions yet.
        </div>
      } @else {
        <div class="space-y-10">
          @for (dim of visibleDimensions(); track dim.id) {
            <app-survey-fill-section
              [dimension]="dim"
              [surveyType]="survey().surveyType"
              [shuffleSeed]="shuffleSeed()"
            />
          }
        </div>
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

  constructor() {
    effect(() => {
      this.survey();
      this.shuffleSeed.set(Date.now());
    });
  }
}
