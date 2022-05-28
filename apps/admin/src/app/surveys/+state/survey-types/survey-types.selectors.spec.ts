import * as fromSurveyTypes from './survey-types.reducer';
import { selectSurveyTypesState } from './survey-types.selectors';

describe('SurveyTypes Selectors', () => {
  it('should select the feature state', () => {
    const result = selectSurveyTypesState({
      [fromSurveyTypes.surveyTypesFeatureKey]: {}
    });

    expect(result).toEqual({});
  });
});
