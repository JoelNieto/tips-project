import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Assignment } from '@tips/data/models';

export const AssignmentsActions = createActionGroup({
  source: 'Assignment',
  events: {
    'Init Assignments': emptyProps(),
    'Load Assignments Success': props<{ payload: Assignment[] }>(),
    'Create Assignment': props<{ request: Assignment }>(),
    'Create Assignment Success': props<{ payload: Assignment }>(),
  },
});
