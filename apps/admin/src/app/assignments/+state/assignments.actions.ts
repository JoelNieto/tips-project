import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Assignment } from '@tips/data/models';

export const AssignmentsActions = createActionGroup({
  source: 'Assignment',
  events: {
    'Init Assignments': emptyProps(),
    'Load Assignments Success': props<{ payload: Assignment[] }>(),
    'Set Assignment': props<{ id: string | undefined }>(),
    'Create Assignment': props<{ request: Assignment }>(),
    'Create Assignment Success': props<{ payload: Assignment }>(),
    'Update Assignment': props<{ id: string; request: Partial<Assignment> }>(),
    'Update Assignment Success': props<{ id: string; payload: Assignment }>(),
  },
});
