import type { FillDimension, FillDimensionQuestion } from './fill/survey-fill.types';

export interface ScoreBounds {
  min: number;
  max: number;
}

function questionValueBounds(dq: FillDimensionQuestion): ScoreBounds {
  const values = (dq.question.answerSet?.answers ?? []).map((a) => a.value);
  if (values.length === 0) {
    return { min: 0, max: 0 };
  }

  const isMulti = dq.isMultiAnswerOverride ?? dq.question.isMultiAnswer;
  if (isMulti) {
    const minVal = Math.min(...values);
    const maxVal = values.filter((v) => v > 0).reduce((sum, v) => sum + v, 0);
    return { min: minVal, max: maxVal };
  }

  return { min: Math.min(...values), max: Math.max(...values) };
}

function mainQuestionBounds(dimension: FillDimension): ScoreBounds {
  const values = dimension.mainQuestionAnswers.map((a) => a.value);
  if (values.length === 0) {
    return { min: 0, max: 0 };
  }
  return { min: Math.min(...values), max: Math.max(...values) };
}

export function computeDimensionScoreBounds(dimension: FillDimension): ScoreBounds {
  let min = 0;
  let max = 0;

  const mainBounds = mainQuestionBounds(dimension);
  min += mainBounds.min;
  max += mainBounds.max;

  for (const dq of dimension.dimensionQuestions ?? []) {
    const bounds = questionValueBounds(dq);
    min += bounds.min;
    max += bounds.max;
  }

  return { min, max };
}
