interface MainAnswerResult {
  dimensionId: string;
  dimensionTitle: string;
  categoryId?: string | null;
  categoryTitle?: string | null;
  answerValue: number;
}

interface AnswerResult {
  value: number;
}

interface QuestionAnswerGroup {
  dimensionId: string;
  dimensionTitle: string;
  categoryId?: string | null;
  categoryTitle?: string | null;
  answers: AnswerResult[];
}

export interface FillForChart {
  mainAnswers: MainAnswerResult[];
  questionAnswers: QuestionAnswerGroup[];
}

export interface CategoryTotal {
  id: string;
  title: string;
  total: number;
}

export function categoryTotals(
  fill: FillForChart,
  hasCategories: boolean
): CategoryTotal[] {
  const totals = new Map<string, CategoryTotal>();

  const addValue = (categoryId: string, categoryTitle: string, value: number) => {
    const existing = totals.get(categoryId);
    if (existing) {
      existing.total += value;
      return;
    }
    totals.set(categoryId, { id: categoryId, title: categoryTitle, total: value });
  };

  for (const ma of fill.mainAnswers) {
    const categoryId = hasCategories ? (ma.categoryId ?? ma.dimensionId) : ma.dimensionId;
    const categoryTitle = hasCategories
      ? (ma.categoryTitle ?? ma.dimensionTitle)
      : ma.dimensionTitle;
    addValue(categoryId, categoryTitle, ma.answerValue);
  }

  for (const qa of fill.questionAnswers) {
    const categoryId = hasCategories ? (qa.categoryId ?? qa.dimensionId) : qa.dimensionId;
    const categoryTitle = hasCategories
      ? (qa.categoryTitle ?? qa.dimensionTitle)
      : qa.dimensionTitle;
    const questionTotal = qa.answers.reduce((sum, answer) => sum + answer.value, 0);
    addValue(categoryId, categoryTitle, questionTotal);
  }

  return [...totals.values()];
}

export function collectCategoryAxes(
  fills: FillForChart[],
  hasCategories: boolean
): { ids: string[]; titles: string[] } {
  const seen = new Map<string, string>();

  for (const fill of fills) {
    for (const category of categoryTotals(fill, hasCategories)) {
      if (!seen.has(category.id)) {
        seen.set(category.id, category.title);
      }
    }
  }

  return {
    ids: [...seen.keys()],
    titles: [...seen.values()],
  };
}

export function mapTotalsToAxes(
  totals: CategoryTotal[],
  axisIds: string[]
): number[] {
  const byId = new Map(totals.map((t) => [t.id, t.total]));
  return axisIds.map((id) => byId.get(id) ?? 0);
}
