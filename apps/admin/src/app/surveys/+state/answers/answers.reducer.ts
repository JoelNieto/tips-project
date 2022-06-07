import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { AnswersSet } from '@tips/data/models';

import { AnswersActions } from './answers.actions';

export const answersFeatureKey = 'answers';

export interface State extends EntityState<AnswersSet> {
  selectedId?: string | number; // which Surveys record has been selected
  loaded: boolean; // has the Surveys list been loaded
  error?: string | null; // last known error (if any)
}

export interface AnswersPartialState {
  readonly [answersFeatureKey]: State;
}

const selectId = (x: AnswersSet) => x._id;

export const answersAdapter: EntityAdapter<AnswersSet> =
  createEntityAdapter<AnswersSet>({ selectId });

export const initialState: State = answersAdapter.getInitialState({
  loaded: false,
});

export const reducer = createReducer(
  initialState,

  on(
    AnswersActions.loadSetsSuccess,
    (state, { payload }): State => answersAdapter.setAll(payload, state)
  ),
  on(AnswersActions.createSetSuccess, (state, { payload }) =>
    answersAdapter.addOne(payload, state)
  )
);
