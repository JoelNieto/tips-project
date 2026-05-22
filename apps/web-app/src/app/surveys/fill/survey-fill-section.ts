import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import type { FillDimension, FillSurveyType } from './survey-fill.types';
import {
  orderDimensionQuestions,
  sectionHasContent,
} from './survey-fill.utils';
import SurveyFillMainQuestionComponent from './survey-fill-main-question';
import SurveyFillQuestionComponent from './survey-fill-question';

@Component({
  selector: 'app-survey-fill-section',
  standalone: true,
  imports: [
    SurveyFillMainQuestionComponent,
    SurveyFillQuestionComponent,
    forwardRef(() => SurveyFillSectionComponent),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (hasContent()) {
      <section [class]="sectionClass()">
        @if (showHeader()) {
          <header class="mb-6">
            <h3 class="text-xl font-semibold text-slate-900">{{ dimension().title }}</h3>
            @if (dimension().description) {
              <p class="mt-2 text-slate-600">{{ dimension().description }}</p>
            }
          </header>
        }

        @if (showMainQuestion()) {
          <app-survey-fill-main-question
            [dimensionId]="dimension().id"
            [prompt]="dimension().mainQuestionText!"
            [answers]="dimension().mainQuestionAnswers"
            [selection]="mainSelection()"
            (selectionChange)="mainSelection.set($event)"
          />
        }

        <div [class]="questionsContainerClass()">
          @for (dq of orderedQuestions(); track dq.id) {
            <app-survey-fill-question
              [dimensionQuestion]="dq"
              [selection]="getQuestionSelection(dq.id)"
              (selectionChange)="setQuestionSelection(dq.id, $event)"
            />
          }
        </div>

        @if (dimension().subdimensions?.length) {
          <div class="space-y-8">
            @for (sub of dimension().subdimensions!; track sub.id) {
              <app-survey-fill-section
                [dimension]="sub"
                [surveyType]="surveyType()"
                [isSubdimension]="true"
                [shuffleSeed]="shuffleSeed()"
              />
            }
          </div>
        }
      </section>
    }
  `,
})
export default class SurveyFillSectionComponent {
  readonly dimension = input.required<FillDimension>();
  readonly surveyType = input.required<FillSurveyType>();
  readonly isSubdimension = input(false);
  readonly shuffleSeed = input(0);

  protected readonly mainSelection = signal('');
  protected readonly questionSelections = signal<Record<string, string>>({});

  protected readonly hasContent = computed(() =>
    sectionHasContent(this.dimension())
  );

  protected readonly showHeader = computed(() => {
    if (this.isSubdimension()) {
      return this.surveyType().visibleSubcategories;
    }
    return this.surveyType().visibleCategories;
  });

  protected readonly showMainQuestion = computed(() => {
    const dim = this.dimension();
    return (
      !!dim.mainQuestionText?.trim() &&
      (dim.mainQuestionAnswers?.length ?? 0) > 0
    );
  });

  protected readonly orderedQuestions = computed(() =>
    orderDimensionQuestions(
      this.dimension().dimensionQuestions ?? [],
      this.surveyType().randomizeQuestions,
      this.shuffleSeed() + hashString(this.dimension().id)
    )
  );

  protected readonly sectionClass = computed(() =>
    this.isSubdimension()
      ? 'rounded-xl border border-slate-200 bg-slate-50/50 p-6'
      : 'space-y-6'
  );

  protected readonly questionsContainerClass = computed(() => {
    const classes = ['space-y-6'];
    if (this.showMainQuestion()) {
      classes.push('mt-6');
    }
    return classes.join(' ');
  });

  protected getQuestionSelection(id: string): string {
    return this.questionSelections()[id] ?? '';
  }

  protected setQuestionSelection(id: string, value: string): void {
    this.questionSelections.update((prev) => ({ ...prev, [id]: value }));
  }
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
