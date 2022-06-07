import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromAnswers from './answers.reducer';

export const selectAnswersState = createFeatureSelector<fromAnswers.State>(
  fromAnswers.answersFeatureKey
);
