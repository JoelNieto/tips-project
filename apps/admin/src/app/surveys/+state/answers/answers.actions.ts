import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AnswersSet } from '@tips/data/models';

export const AnswersActions = createActionGroup({
  source: 'Answers Sets',
  events: {
    'Load Sets': emptyProps(),
    'Load Sets Success': props<{ payload: AnswersSet[] }>(),
    'Create Set': props<{ request: AnswersSet }>(),
    'Create Set Success': props<{ payload: AnswersSet }>(),
  },
});
