import * as fromAnswers from './answers.reducer';
import { selectAnswersState } from './answers.selectors';

describe('Answers Selectors', () => {
  it('should select the feature state', () => {
    const result = selectAnswersState({
      [fromAnswers.answersFeatureKey]: {}
    });

    expect(result).toEqual({});
  });
});
