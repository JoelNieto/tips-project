import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Login } from '@tips/data/models';

export const AuthActions = createActionGroup({
  source: 'Auth/API',
  events: {
    Init: emptyProps(),
    Login: props<{ request: Login }>(),
    'Login Success': props<{ payload: { access_token: string } }>(),
    'Login Failure': props<{ error: unknown }>(),
  },
});
