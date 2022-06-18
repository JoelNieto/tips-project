import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Survey } from '@tips/data/models';

export const SurveysActions = createActionGroup({
  source: 'SURVEYS',
  events: {
    Init: emptyProps(),
    'Load Surveys Success': props<{ surveys: Survey[] }>(),
    'Load Surveys Failure': props<{ error: any }>(),
    'Create Survey': props<{ request: Survey }>(),
    'Create Survey Success': props<{ payload: Survey }>(),
    'Create Survey Failure': props<{ error: any }>(),
  },
});
