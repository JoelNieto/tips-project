import * as fromAnswers from './answers.actions';

describe('loadAnswerss', () => {
  it('should return an action', () => {
    expect(fromAnswers.loadAnswerss().type).toBe('[Answers] Load Answerss');
  });
});
