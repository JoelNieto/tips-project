import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromAnswers from './answers.reducer';

export const selectAnswersState = createFeatureSelector<fromAnswers.State>(
  fromAnswers.answersFeatureKey
);

const { selectAll } = fromAnswers.answersAdapter.getSelectors();

export const selectAllAnswers = createSelector(
  selectAnswersState,
  (state: fromAnswers.State) => selectAll(state)
);
