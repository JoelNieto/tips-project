import type {
  FillDimension,
  FillSurveyConfig,
  SurveyFillData,
} from './survey-fill.types';

export function effectiveIsMultiAnswer(dq: {
  isMultiAnswerOverride?: boolean | null;
  question: { isMultiAnswer: boolean };
}): boolean {
  return dq.isMultiAnswerOverride ?? dq.question.isMultiAnswer;
}

export function effectiveIsReversed(dq: {
  isReversedOverride?: boolean | null;
  question: { isReversed: boolean };
}): boolean {
  return dq.isReversedOverride ?? dq.question.isReversed;
}

export function resolveAnswerOptions(dq: {
  answerOverrides?: {
    answer: {
      id: string;
      text: string;
      sortOrder: number | null;
      value: number;
      reverseValue: number | null;
    };
    orderOverride?: number | null;
    valueOverride?: number | null;
    reverseValueOverride?: number | null;
  }[];
  question: {
    answerSet?: {
      answers: {
        id: string;
        text: string;
        sortOrder: number | null;
        value: number;
        reverseValue: number | null;
      }[];
    } | null;
  };
}) {
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
  return [...(dq.question.answerSet?.answers ?? [])].sort(compareBySortOrder);
}

export function orderAnswerOptions<T extends { sortOrder?: number | null }>(
  options: T[],
  isReversed: boolean
): T[] {
  const sorted = [...options].sort(compareBySortOrder);
  return isReversed ? [...sorted].reverse() : sorted;
}

export function orderMainQuestionAnswers<T extends { sortOrder?: number | null }>(
  answers: T[]
): T[] {
  return [...answers].sort(compareBySortOrder);
}

export function orderDimensionQuestions<T extends { order?: number | null }>(
  questions: T[],
  randomize: boolean,
  shuffleSeed: number
): T[] {
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
  return {
    id: (raw['id'] as string) ?? '',
    title: (raw['title'] as string) ?? '',
    description: (raw['description'] as string | null) ?? null,
    categoryName: (raw['categoryName'] as string | null) ?? null,
    subcategoryName: (raw['subcategoryName'] as string | null) ?? null,
    hasCategories: (raw['hasCategories'] as boolean) ?? false,
    hasSubcategories: (raw['hasSubcategories'] as boolean) ?? false,
    visibleCategories: (raw['visibleCategories'] as boolean) ?? false,
    visibleSubcategories: (raw['visibleSubcategories'] as boolean) ?? false,
    randomizeQuestions: (raw['randomizeQuestions'] as boolean) ?? false,
    dimensions: ((raw['dimensions'] as FillDimension[]) ?? []).map(normalizeDimension),
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

export function toFillSurveyConfig(data: SurveyFillData): FillSurveyConfig {
  return {
    visibleCategories: data.visibleCategories,
    visibleSubcategories: data.visibleSubcategories,
    randomizeQuestions: data.randomizeQuestions,
  };
}

export function categoryLabel(data: Pick<SurveyFillData, 'categoryName'>): string {
  return data.categoryName?.trim() || 'Category';
}

export function subcategoryLabel(data: Pick<SurveyFillData, 'subcategoryName'>): string {
  return data.subcategoryName?.trim() || 'Subcategory';
}
