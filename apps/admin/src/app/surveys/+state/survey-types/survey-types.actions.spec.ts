import { SurveyTypesActions } from './survey-types.actions';

describe('loadSurveyTypess', () => {
  it('should return an action', () => {
    expect(SurveyTypesActions.load().type).toBe(
      '[SurveyTypes] Load SurveyTypess'
    );
  });
});
