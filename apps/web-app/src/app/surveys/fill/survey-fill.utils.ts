import type {
  FillAnswerOption,
  FillDimension,
  FillDimensionQuestion,
  FillMainQuestionAnswer,
  FillSurveyType,
  SurveyFillData,
} from './survey-fill.types';

export function effectiveIsMultiAnswer(dq: FillDimensionQuestion): boolean {
  return dq.isMultiAnswerOverride ?? dq.question.isMultiAnswer;
}

export function effectiveIsReversed(dq: FillDimensionQuestion): boolean {
  return dq.isReversedOverride ?? dq.question.isReversed;
}

export function resolveAnswerOptions(dq: FillDimensionQuestion): FillAnswerOption[] {
  const overrides = dq.answerOverrides ?? [];
  if (overrides.length > 0) {
    return overrides
      .map((o) => ({
        id: o.answer.id,
        text: o.answer.text,
        sortOrder: o.orderOverride ?? o.answer.sortOrder,
        value: o.valueOverride ?? o.answer.value,
        reverseValue: o.reverseValueOverride ?? o.answer.reverseValue,
      }))
      .sort(compareBySortOrder);
  }
  return [...(dq.question.answers ?? [])].sort(compareBySortOrder);
}

export function orderAnswerOptions(
  options: FillAnswerOption[],
  isReversed: boolean
): FillAnswerOption[] {
  const sorted = [...options].sort(compareBySortOrder);
  return isReversed ? [...sorted].reverse() : sorted;
}

export function orderMainQuestionAnswers(
  answers: FillMainQuestionAnswer[]
): FillMainQuestionAnswer[] {
  return [...answers].sort(compareBySortOrder);
}

export function orderDimensionQuestions(
  questions: FillDimensionQuestion[],
  randomize: boolean,
  shuffleSeed: number
): FillDimensionQuestion[] {
  const sorted = [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  if (!randomize) return sorted;
  return shuffleArray(sorted, shuffleSeed);
}

function compareBySortOrder<T extends { sortOrder?: number | null }>(a: T, b: T): number {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
}

function shuffleArray<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function toSurveyFillData(
  raw: Record<string, unknown> | null | undefined
): SurveyFillData | null {
  if (!raw || typeof raw !== 'object') return null;
  const st = raw['surveyType'] as Record<string, unknown> | undefined;
  return {
    id: (raw['id'] as string) ?? '',
    title: (raw['title'] as string) ?? '',
    description: (raw['description'] as string | null) ?? null,
    surveyType: toFillSurveyType(st),
    dimensions: ((raw['dimensions'] as FillDimension[]) ?? []).map(normalizeDimension),
  };
}

function toFillSurveyType(st?: Record<string, unknown>): FillSurveyType {
  return {
    id: (st?.['id'] as string) ?? '',
    name: (st?.['name'] as string) ?? '',
    hasCategories: (st?.['hasCategories'] as boolean) ?? false,
    hasSubcategories: (st?.['hasSubcategories'] as boolean) ?? false,
    categoryName: (st?.['categoryName'] as string | null) ?? null,
    subcategoryName: (st?.['subcategoryName'] as string | null) ?? null,
    visibleCategories: (st?.['visibleCategories'] as boolean) ?? false,
    visibleSubcategories: (st?.['visibleSubcategories'] as boolean) ?? false,
    randomizeQuestions: (st?.['randomizeQuestions'] as boolean) ?? false,
  };
}

function normalizeDimension(dim: FillDimension): FillDimension {
  return {
    ...dim,
    mainQuestionAnswers: dim.mainQuestionAnswers ?? [],
    dimensionQuestions: dim.dimensionQuestions ?? [],
    subdimensions: dim.subdimensions?.map(normalizeDimension),
  };
}

export function sectionHasContent(dim: FillDimension): boolean {
  const hasMain =
    !!dim.mainQuestionText?.trim() && (dim.mainQuestionAnswers?.length ?? 0) > 0;
  const hasQuestions = (dim.dimensionQuestions?.length ?? 0) > 0;
  const hasSubContent = (dim.subdimensions ?? []).some(sectionHasContent);
  return hasMain || hasQuestions || hasSubContent;
}

export function categoryLabel(surveyType: FillSurveyType): string {
  return surveyType.categoryName?.trim() || 'Category';
}

export function subcategoryLabel(surveyType: FillSurveyType): string {
  return surveyType.subcategoryName?.trim() || 'Subcategory';
}
