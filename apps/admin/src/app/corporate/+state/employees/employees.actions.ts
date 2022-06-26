import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Profile } from '@tips/data/models';

export const EmployeesActions = createActionGroup({
  source: 'Company/Employees',
  events: {
    Init: emptyProps(),
    'Load Employees Success': props<{ payload: Profile[] }>(),
    'Load Employees Failure': props<{ error: any }>(),
    'Create Employee': props<{ request: Profile }>(),
    'Create Employee Success': props<{ payload: Profile }>(),
    'Create Employee Failure': props<{ error: any }>(),
    'Update Employee': props<{ id: string; request: Partial<Profile> }>(),
    'Update Employee Success': props<{ id: string; changes: Profile }>(),
    'Update Employee Failure': props<{ error: any }>(),
  },
});
