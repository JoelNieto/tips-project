import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { Survey } from '@tips/data/models';

import { SurveysActions } from './surveys.actions';

export const SURVEYS_FEATURE_KEY = 'surveys';

export interface State extends EntityState<Survey> {
  selectedId?: string | number; // which Surveys record has been selected
  loaded: boolean; // has the Surveys list been loaded
  error?: string | null; // last known error (if any)
}

export interface SurveysPartialState {
  readonly [SURVEYS_FEATURE_KEY]: State;
}
const selectId = (x: Survey) => x._id;

export const surveysAdapter: EntityAdapter<Survey> =
  createEntityAdapter<Survey>({ selectId });

export const initialState: State = surveysAdapter.getInitialState({
  // set initial required properties
  loaded: false,
});

const surveysReducer = createReducer(
  initialState,
  on(
    SurveysActions.init,
    (state): State => ({
      ...state,
      loaded: false,
      error: null,
    })
  ),
  on(SurveysActions.loadSurveysSuccess, (state, { surveys }) =>
    surveysAdapter.setAll(surveys, { ...state, loaded: true })
  ),
  on(
    SurveysActions.loadSurveysFailure,
    (state, { error }): State => ({
      ...state,
      error,
    })
  ),
  on(
    SurveysActions.createSurveySuccess,
    (state, { payload }): State => surveysAdapter.addOne(payload, state)
  )
);

export function reducer(state: State | undefined, action: Action) {
  return surveysReducer(state, action);
}
