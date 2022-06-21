import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Survey } from '@tips/data/models';

export const SurveysActions = createActionGroup({
  source: 'SURVEYS',
  events: {
    Init: emptyProps(),
    'Load Surveys Success': props<{ surveys: Survey[] }>(),
    'Load Surveys Failure': props<{ error: unknown }>(),
    'Create Survey': props<{ request: Survey }>(),
    'Create Survey Success': props<{ payload: Survey }>(),
    'Create Survey Failure': props<{ error: unknown }>(),
    'Update Survey': props<{ id: string; request: Survey }>(),
    'Update Survey Success': props<{ id: string; payload: Survey }>(),
    'Update Survey Failure': props<{ error: unknown }>(),
    'Set Survey': props<{ id: string }>(),
    'Load Survey': emptyProps(),
    'Load Survey Success': props<{ payload: Survey }>(),
    'Clear Selection': emptyProps(),
  },
});
