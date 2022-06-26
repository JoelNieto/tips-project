import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Position } from '@tips/data/models';

export const PositionsActions = createActionGroup({
  source: 'Positions',
  events: {
    Init: emptyProps(),
    'Load Positions Success': props<{ positions: Position[] }>(),
    'Load Positions Failure': props<{ error: any }>(),
    'Create Position': props<{ request: Position }>(),
    'Create Position Success': props<{ payload: Position }>(),
    'Create Position Failure': props<{ error: any }>(),
    'Update Position': props<{ id: string; request: Partial<Position> }>(),
    'Update Position Success': props<{ id: string; payload: Position }>(),
    'Update Position Failure': props<{ error: any }>(),
  },
});
