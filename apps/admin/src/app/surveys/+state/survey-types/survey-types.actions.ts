import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { SurveyType } from '@tips/data/models';

export const SurveyTypesActions = createActionGroup({
  source: 'Survey Types',
  events: {
    Load: emptyProps(),
    'Load Success': props<{ types: SurveyType[] }>(),
    'Create Type': props<{ request: SurveyType }>(),
    'Create Type Success': props<{ payload: SurveyType }>(),
    'Update Type': props<{ id: string; request: Partial<SurveyType> }>(),
    'Update Type Success': props<{
      id: string;
      payload: Partial<SurveyType>;
    }>(),
    'Delete Type': props<{ id: string }>(),
  },
});
