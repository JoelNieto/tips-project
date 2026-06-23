import * as XLSX from 'xlsx';
import { categoryTotals } from './survey-results-chart.utils';

interface AnswerResult {
  id: string;
  text: string;
  value: number;
}

interface MainAnswerResult {
  dimensionId: string;
  dimensionTitle: string;
  categoryId?: string | null;
  categoryTitle?: string | null;
  answerText: string;
  answerValue: number;
}

interface QuestionAnswerGroup {
  dimensionQuestionId: string;
  dimensionId: string;
  dimensionTitle: string;
  categoryId?: string | null;
  categoryTitle?: string | null;
  questionText: string;
  answers: AnswerResult[];
}

export interface FillForExport {
  inviteeId: string;
  inviteeEmail: string;
  inviteeName?: string | null;
  submittedAt: string;
  mainAnswers: MainAnswerResult[];
  questionAnswers: QuestionAnswerGroup[];
}

export interface ResultsForExport {
  hasCategories: boolean;
  categoryName?: string | null;
  fills: FillForExport[];
}

interface QuestionColumn {
  key: string;
  header: string;
}

interface CategoryColumnGroup {
  id: string;
  title: string;
  questions: QuestionColumn[];
}

function resolveCategoryId(
  hasCategories: boolean,
  categoryId: string | null | undefined,
  dimensionId: string,
): string {
  return hasCategories ? (categoryId ?? dimensionId) : dimensionId;
}

function resolveCategoryTitle(
  hasCategories: boolean,
  categoryTitle: string | null | undefined,
  dimensionTitle: string,
): string {
  return hasCategories ? (categoryTitle ?? dimensionTitle) : dimensionTitle;
}

function collectCategoryGroups(data: ResultsForExport): CategoryColumnGroup[] {
  const hasCategories = data.hasCategories;
  const groups = new Map<
    string,
    { title: string; questions: Map<string, QuestionColumn> }
  >();

  const ensureGroup = (categoryId: string, categoryTitle: string) => {
    if (!groups.has(categoryId)) {
      groups.set(categoryId, { title: categoryTitle, questions: new Map() });
    }
    return groups.get(categoryId)!;
  };

  const addQuestion = (
    categoryId: string,
    categoryTitle: string,
    key: string,
    header: string,
  ) => {
    const group = ensureGroup(categoryId, categoryTitle);
    if (!group.questions.has(key)) {
      group.questions.set(key, { key, header });
    }
  };

  for (const fill of data.fills) {
    for (const ma of fill.mainAnswers) {
      const categoryId = resolveCategoryId(
        hasCategories,
        ma.categoryId,
        ma.dimensionId,
      );
      const categoryTitle = resolveCategoryTitle(
        hasCategories,
        ma.categoryTitle,
        ma.dimensionTitle,
      );
      const key = `main:${ma.dimensionId}`;
      addQuestion(
        categoryId,
        categoryTitle,
        key,
        `Main question (${ma.dimensionTitle})`,
      );
    }

    for (const qa of fill.questionAnswers) {
      const categoryId = resolveCategoryId(
        hasCategories,
        qa.categoryId,
        qa.dimensionId,
      );
      const categoryTitle = resolveCategoryTitle(
        hasCategories,
        qa.categoryTitle,
        qa.dimensionTitle,
      );
      const key = `q:${qa.dimensionQuestionId}`;
      const header = hasCategories
        ? `${qa.dimensionTitle}: ${qa.questionText}`
        : qa.questionText;
      addQuestion(categoryId, categoryTitle, key, header);
    }
  }

  return [...groups.entries()].map(([id, group]) => ({
    id,
    title: group.title,
    questions: [...group.questions.values()],
  }));
}

function buildFillValueMap(fill: FillForExport): Map<string, number> {
  const values = new Map<string, number>();

  for (const ma of fill.mainAnswers) {
    values.set(`main:${ma.dimensionId}`, ma.answerValue);
  }

  for (const qa of fill.questionAnswers) {
    const total = qa.answers.reduce((sum, answer) => sum + answer.value, 0);
    values.set(`q:${qa.dimensionQuestionId}`, total);
  }

  return values;
}

function categorySumForFill(
  fill: FillForExport,
  categoryId: string,
  hasCategories: boolean,
): number {
  const totals = categoryTotals(fill, hasCategories);
  return totals.find((t) => t.id === categoryId)?.total ?? 0;
}

export function buildWideResultsSheet(
  data: ResultsForExport,
): XLSX.WorkSheet {
  const hasCategories = data.hasCategories;
  const categoryGroups = collectCategoryGroups(data);

  if (categoryGroups.length === 0 || data.fills.length === 0) {
    return XLSX.utils.aoa_to_sheet([['No submissions']]);
  }

  const categoryRow: string[] = ['', ''];
  const headerRow: string[] = ['Invitee Name', 'Invitee Email'];
  const merges: XLSX.Range[] = [];
  let colIndex = 2;

  for (const group of categoryGroups) {
    const startCol = colIndex;
    for (const question of group.questions) {
      categoryRow.push('');
      headerRow.push(question.header);
      colIndex++;
    }
    categoryRow.push('');
    headerRow.push('Sum');
    colIndex++;

    if (colIndex - startCol > 1) {
      categoryRow[startCol] = group.title;
      merges.push({
        s: { r: 0, c: startCol },
        e: { r: 0, c: colIndex - 1 },
      });
    } else {
      categoryRow[startCol] = group.title;
    }
  }

  const dataRows = data.fills.map((fill) => {
    const values = buildFillValueMap(fill);
    const row: (string | number)[] = [
      fill.inviteeName?.trim() || '',
      fill.inviteeEmail,
    ];

    for (const group of categoryGroups) {
      for (const question of group.questions) {
        row.push(values.get(question.key) ?? '');
      }
      row.push(categorySumForFill(fill, group.id, hasCategories));
    }

    return row;
  });

  const worksheet = XLSX.utils.aoa_to_sheet([
    categoryRow,
    headerRow,
    ...dataRows,
  ]);
  worksheet['!merges'] = merges;
  return worksheet;
}

export function downloadResultsXls(
  data: ResultsForExport,
  filename: string,
): void {
  const worksheet = buildWideResultsSheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
  XLSX.writeFile(workbook, filename);
}
