import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Company } from '@tips/data/models';

export const CompaniesActions = createActionGroup({
  source: 'Companies',
  events: {
    Init: emptyProps(),
    'Load Companies': emptyProps(),
    'Load Companies Success': props<{ payload: Company[] }>(),
    'Load Companies Failure': props<{ error: any }>(),
    'Select Company': props<{ id: string | undefined }>(),
    'Create Company': props<{ request: Company }>(),
    'Create Company Success': props<{ payload: Company }>(),
    'Create Company Failure': props<{ error: any }>(),
    'Update Company': props<{ id: string; changes: Partial<Company> }>(),
    'Update Company Success': props<{ id: string; payload: Company }>(),
    'Update Company Failure': props<{ error: any }>(),
  },
});
