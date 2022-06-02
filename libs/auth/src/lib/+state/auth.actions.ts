import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Login, User } from '@tips/data/models';

export const AuthActions = createActionGroup({
  source: 'Auth/API',
  events: {
    Init: emptyProps(),
    Login: props<{ request: Login }>(),
    'Login Success': emptyProps(),
    'Login Failure': props<{ error: unknown }>(),
    'Load Profile': emptyProps(),
    'Load Profile Success': props<{ payload: User }>(),
  },
});
