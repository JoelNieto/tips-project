import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { SurveyType } from '@tips/data/models';

import { SurveyTypesActions } from './survey-types.actions';

export const surveyTypesFeatureKey = 'surveyTypes';

export interface State extends EntityState<SurveyType> {
  selectedId?: string | number; // which Surveys record has been selected
  loaded: boolean; // has the Surveys list been loaded
  error?: string | null; // last known error (if any)
}

export interface SurveysTypesPartialState {
  readonly [surveyTypesFeatureKey]: State;
}

const selectId = (x: SurveyType) => x._id;

export const typesAdapter: EntityAdapter<SurveyType> =
  createEntityAdapter<SurveyType>({ selectId });
export const initialState: State = typesAdapter.getInitialState({
  loaded: false,
});

export const reducer = createReducer(
  initialState,

  on(SurveyTypesActions.load, (state): State => state),
  on(
    SurveyTypesActions.loadSuccess,
    (state, { types }): State =>
      typesAdapter.setAll(types, { ...state, loaded: true })
  ),
  on(
    SurveyTypesActions.createTypeSuccess,
    (state, { payload }): State => typesAdapter.addOne(payload, state)
  ),
  on(
    SurveyTypesActions.updateTypeSuccess,
    (state, { id, payload }): State =>
      typesAdapter.updateOne({ id, changes: payload }, state)
  )
);
