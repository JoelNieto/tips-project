import {
  categoryTotals,
  collectCategoryAxes,
  dimensionTotals,
  mapTotalsToAxes,
  matchRange,
  type MatchedScoreRange,
} from './survey-results-chart.utils';

export function formatInterpretation(
  message: MatchedScoreRange | null | undefined,
): string {
  if (!message) return '—';

  const text = message.label?.trim() || message.message.trim();
  const emoji = interpretationEmoji(text);
  return emoji ? `${emoji} ${text}` : text;
}

export function interpretationEmoji(text: string): string {
  const lower = text.toLowerCase();

  if (/\b(moderate|medium)\b/.test(lower)) {
    return '🟡';
  }
  if (/\b(low concern|no concern|normal|above average|good|strong|healthy|average)\b/.test(lower)) {
    return '🟢';
  }
  if (
    /\b(high|severe|critical|urgent)\b/.test(lower) ||
    /\bconcern\b/.test(lower)
  ) {
    return '🔴';
  }

  return '';
}

export interface AnswerResult {
  id: string;
  text: string;
  value: number;
}

export interface MainAnswerResult {
  dimensionId: string;
  dimensionTitle: string;
  categoryId?: string | null;
  categoryTitle?: string | null;
  answerText: string;
  answerValue: number;
}

export interface QuestionAnswerGroup {
  dimensionQuestionId: string;
  dimensionId: string;
  dimensionTitle: string;
  categoryId?: string | null;
  categoryTitle?: string | null;
  questionText: string;
  answers: AnswerResult[];
}

export interface FillResult {
  inviteeId: string;
  inviteeEmail: string;
  inviteeName?: string | null;
  submittedAt: string;
  mainAnswers: MainAnswerResult[];
  questionAnswers: QuestionAnswerGroup[];
}

export interface ResultDimension {
  id: string;
  title: string;
  parentId?: string | null;
  scoreRanges: {
    label?: string | null;
    message: string;
    minValue: number;
    maxValue: number;
    order?: number | null;
  }[];
}

export interface ResultsData {
  hasCategories: boolean;
  hasSubcategories: boolean;
  categoryName?: string | null;
  subcategoryName?: string | null;
  visibleCategories: boolean;
  visibleSubcategories: boolean;
  surveyTitle?: string | null;
  companyName?: string | null;
  companyLogo?: string | null;
  assignationStartDate?: string | null;
  assignationExpirationDate?: string | null;
  dimensions: ResultDimension[];
  fills: FillResult[];
}

export interface ReportGroup {
  id: string;
  title: string;
  categoryTotal?: number;
  categoryMessage?: MatchedScoreRange | null;
  subdimensions: ReportSubdimension[];
}

export interface ReportSubdimension {
  dimensionId: string;
  dimensionTitle: string;
  dimensionTotal?: number;
  dimensionMessage?: MatchedScoreRange | null;
  mainAnswer?: { text: string; value: number };
  questions: QuestionAnswerGroup[];
}

export interface SummaryColumn {
  id: string;
  title: string;
}

export interface SummaryReportRow {
  inviteeId: string;
  displayName: string;
  email: string;
  hasName: boolean;
  scores: number[];
}

export interface SummaryReportData {
  columns: SummaryColumn[];
  rows: SummaryReportRow[];
  averages: number[] | null;
  submissionCount: number;
  categoryLabel: string;
}

export interface ParticipantReportData {
  participantName: string;
  participantEmail: string;
  submittedAt: string;
  categoryLabel: string;
  hasCategories: boolean;
  groups: ReportGroup[];
}

export interface ReportMeta {
  surveyTitle: string;
  companyName: string | null;
  companyLogo: string | null;
  assignationId: string;
  assignationStartDate: string | null;
  assignationExpirationDate: string | null;
  generatedAt: string;
  logoImageDataUrl?: string | null;
}

export function buildReportNumber(assignationId: string, date = new Date()): string {
  const year = date.getFullYear();
  const digits = assignationId.replace(/\D/g, '');
  const suffix = (digits.slice(-3) || '1').padStart(3, '0');
  return `PSY-${year}-${suffix}`;
}

export function formatLongDate(iso: string | Date): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatParticipantNameForReport(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'UNKNOWN';
  if (trimmed.includes('@')) return trimmed.toUpperCase();

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].toUpperCase();

  const last = parts[parts.length - 1];
  const first = parts.slice(0, -1).join(' ');
  return `${first.toUpperCase()} ${last.charAt(0).toUpperCase()}.`;
}

export function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function participantLabel(fill: FillResult): string {
  return fill.inviteeName?.trim() || fill.inviteeEmail || 'Unknown';
}

export function buildReportMeta(
  data: ResultsData,
  assignationId: string,
): ReportMeta {
  return {
    surveyTitle: data.surveyTitle?.trim() || 'Survey Results',
    companyName: data.companyName?.trim() || null,
    companyLogo: data.companyLogo?.trim() || null,
    assignationId,
    assignationStartDate: data.assignationStartDate ?? null,
    assignationExpirationDate: data.assignationExpirationDate ?? null,
    generatedAt: new Date().toLocaleString(),
  };
}

export function buildSummaryReportData(data: ResultsData): SummaryReportData {
  const hasCategories = data.hasCategories;
  const axes = collectCategoryAxes(data.fills, hasCategories);
  const columns = axes.ids.map((id, index) => ({
    id,
    title: axes.titles[index],
  }));

  const rows: SummaryReportRow[] = data.fills.map((fill) => {
    const displayName = participantLabel(fill);
    const totals = categoryTotals(fill, hasCategories);
    return {
      inviteeId: fill.inviteeId,
      displayName,
      email: fill.inviteeEmail,
      hasName: !!fill.inviteeName?.trim(),
      scores: mapTotalsToAxes(totals, axes.ids),
    };
  });

  let averages: number[] | null = null;
  if (axes.ids.length > 0 && data.fills.length > 0) {
    const sums = axes.ids.map(() => 0);
    for (const fill of data.fills) {
      const totals = categoryTotals(fill, hasCategories);
      const values = mapTotalsToAxes(totals, axes.ids);
      values.forEach((value, index) => {
        sums[index] += value;
      });
    }
    averages = sums.map((sum) => sum / data.fills.length);
  }

  return {
    columns,
    rows,
    averages,
    submissionCount: data.fills.length,
    categoryLabel: data.categoryName ?? 'Category',
  };
}

export function buildParticipantReportData(
  data: ResultsData,
  fill: FillResult,
): ParticipantReportData {
  const hasCategories = data.hasCategories;
  const dimensions = data.dimensions;
  const rangesByDimensionId = new Map(
    dimensions.map((d) => [d.id, d.scoreRanges]),
  );
  const categoryTotalsById = new Map(
    categoryTotals(fill, hasCategories).map((t) => [t.id, t.total]),
  );
  const dimensionTotalsById = new Map(
    dimensionTotals(fill).map((t) => [t.id, t.total]),
  );
  const groups = new Map<string, ReportGroup>();

  const getGroup = (groupId: string, groupTitle: string): ReportGroup => {
    const existing = groups.get(groupId);
    if (existing) return existing;

    const total = categoryTotalsById.get(groupId);
    const ranges = rangesByDimensionId.get(groupId) ?? [];
    const group: ReportGroup = {
      id: groupId,
      title: groupTitle,
      categoryTotal: total,
      categoryMessage: total != null ? matchRange(total, ranges) : null,
      subdimensions: [],
    };
    groups.set(groupId, group);
    return group;
  };

  const getSubdimension = (
    group: ReportGroup,
    dimensionId: string,
    dimensionTitle: string,
  ): ReportSubdimension => {
    let sub = group.subdimensions.find((s) => s.dimensionId === dimensionId);
    if (!sub) {
      const total = dimensionTotalsById.get(dimensionId);
      const ranges = rangesByDimensionId.get(dimensionId) ?? [];
      sub = {
        dimensionId,
        dimensionTitle,
        dimensionTotal: total,
        dimensionMessage: total != null ? matchRange(total, ranges) : null,
        questions: [],
      };
      group.subdimensions.push(sub);
    }
    return sub;
  };

  for (const ma of fill.mainAnswers) {
    const groupId = hasCategories
      ? (ma.categoryId ?? ma.dimensionId)
      : ma.dimensionId;
    const groupTitle = hasCategories
      ? (ma.categoryTitle ?? ma.dimensionTitle)
      : ma.dimensionTitle;
    const group = getGroup(groupId, groupTitle);
    const sub = getSubdimension(group, ma.dimensionId, ma.dimensionTitle);
    sub.mainAnswer = { text: ma.answerText, value: ma.answerValue };
  }

  for (const qa of fill.questionAnswers) {
    const groupId = hasCategories
      ? (qa.categoryId ?? qa.dimensionId)
      : qa.dimensionId;
    const groupTitle = hasCategories
      ? (qa.categoryTitle ?? qa.dimensionTitle)
      : qa.dimensionTitle;
    const group = getGroup(groupId, groupTitle);
    const sub = getSubdimension(group, qa.dimensionId, qa.dimensionTitle);
    sub.questions.push(qa);
  }

  return {
    participantName: participantLabel(fill),
    participantEmail: fill.inviteeEmail,
    submittedAt: fill.submittedAt,
    categoryLabel: data.categoryName ?? 'Category',
    hasCategories,
    groups: [...groups.values()],
  };
}

export function sanitizeFilename(value: string): string {
  return value.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').slice(0, 80);
}
