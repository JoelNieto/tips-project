import { describe, expect, it } from 'vitest';
import type { Content } from 'pdfmake/interfaces';
import {
  buildParticipantPdfDocDefinition,
  buildSummaryPdfDocDefinition,
} from './survey-results-pdf.builder';
import {
  buildParticipantReportData,
  buildReportMeta,
  buildSummaryReportData,
  type ResultsData,
} from './survey-results-report.utils';

const baseData: ResultsData = {
  hasCategories: true,
  hasSubcategories: false,
  categoryName: 'Competency',
  subcategoryName: null,
  visibleCategories: true,
  visibleSubcategories: false,
  surveyTitle: 'Leadership Survey',
  companyName: 'Acme Corp',
  assignationStartDate: '2026-01-01T00:00:00.000Z',
  assignationExpirationDate: '2026-06-30T00:00:00.000Z',
  dimensions: [
    {
      id: 'cat-1',
      title: 'Communication',
      parentId: null,
      scoreRanges: [],
    },
    {
      id: 'cat-2',
      title: 'Strategy',
      parentId: null,
      scoreRanges: [],
    },
    {
      id: 'dim-1',
      title: 'Verbal',
      parentId: 'cat-1',
      scoreRanges: [],
    },
    {
      id: 'dim-2',
      title: 'Planning',
      parentId: 'cat-2',
      scoreRanges: [],
    },
  ],
  fills: [
    {
      inviteeId: 'inv-1',
      inviteeEmail: 'alice@example.com',
      inviteeName: 'Alice',
      submittedAt: '2026-02-01T10:00:00.000Z',
      mainAnswers: [
        {
          dimensionId: 'dim-1',
          dimensionTitle: 'Verbal',
          categoryId: 'cat-1',
          categoryTitle: 'Communication',
          answerText: 'Often',
          answerValue: 4,
        },
        {
          dimensionId: 'dim-2',
          dimensionTitle: 'Planning',
          categoryId: 'cat-2',
          categoryTitle: 'Strategy',
          answerText: 'Sometimes',
          answerValue: 2,
        },
      ],
      questionAnswers: [],
    },
  ],
};

describe('survey-results-pdf.builder', () => {
  it('builds portrait summary doc with correct table columns', () => {
    const summary = buildSummaryReportData(baseData);
    const meta = buildReportMeta(baseData, 'assignation-042');
    const doc = buildSummaryPdfDocDefinition(summary, meta);

    expect(doc.pageOrientation).toBe('portrait');
    const content = (Array.isArray(doc.content) ? doc.content : [doc.content]) as Content[];
    const table = content.find(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'table' in item &&
        Array.isArray((item as { table: { body: { text: string }[][] } }).table.body) &&
        (item as { table: { body: { text: string }[][] } }).table.body[0]?.some(
          (cell) => cell.text === 'Participant',
        ),
    ) as { table: { body: unknown[][] } } | undefined;

    expect(table?.table.body[0]).toHaveLength(3);
    expect(table?.table.body[1]).toHaveLength(3);
  });

  it('uses landscape when many summary columns', () => {
    const wideData: ResultsData = {
      ...baseData,
      fills: [
        {
          inviteeId: 'inv-1',
          inviteeEmail: 'alice@example.com',
          inviteeName: 'Alice',
          submittedAt: '2026-02-01T10:00:00.000Z',
          mainAnswers: Array.from({ length: 6 }, (_, i) => ({
            dimensionId: `dim-${i}`,
            dimensionTitle: `Dim ${i}`,
            categoryId: `cat-${i}`,
            categoryTitle: `Category ${i}`,
            answerText: 'Yes',
            answerValue: 1,
          })),
          questionAnswers: [],
        },
      ],
      dimensions: Array.from({ length: 6 }, (_, i) => ({
        id: `cat-${i}`,
        title: `Category ${i}`,
        parentId: null,
        scoreRanges: [],
      })),
    };

    const summary = buildSummaryReportData(wideData);
    const doc = buildSummaryPdfDocDefinition(summary, buildReportMeta(wideData, 'assign-123'));

    expect(summary.columns.length).toBeGreaterThan(5);
    expect(doc.pageOrientation).toBe('landscape');
  });

  it('builds participant doc with domain overview table and no page breaks', () => {
    const dataWithRanges: ResultsData = {
      ...baseData,
      dimensions: [
        {
          id: 'cat-1',
          title: 'Communication',
          parentId: null,
          scoreRanges: [
            {
              label: 'Above Average',
              message: 'Strong skills',
              minValue: 0,
              maxValue: 10,
              order: 0,
            },
          ],
        },
        {
          id: 'cat-2',
          title: 'Strategy',
          parentId: null,
          scoreRanges: [
            {
              label: 'Moderate Concern',
              message: 'Room to improve',
              minValue: 0,
              maxValue: 10,
              order: 0,
            },
          ],
        },
        ...baseData.dimensions.slice(2),
      ],
    };
    const fill = dataWithRanges.fills[0];
    const report = buildParticipantReportData(dataWithRanges, fill);
    const doc = buildParticipantPdfDocDefinition(
      report,
      buildReportMeta(dataWithRanges, 'assignation-042'),
    );

    expect(report.groups).toHaveLength(2);
    expect(doc.pageOrientation).toBe('portrait');

    const content = (Array.isArray(doc.content) ? doc.content : [doc.content]) as Content[];
    const overviewTable = content.find(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'table' in item &&
        Array.isArray((item as { table: { body: unknown[][] } }).table.body) &&
        (item as { table: { body: { text: string }[][] } }).table.body[0]?.some(
          (cell) => cell.text === 'Domain',
        ),
    ) as { table: { body: { text: string }[][] } } | undefined;

    expect(overviewTable).toBeDefined();
    expect(overviewTable?.table.body[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: 'Domain' }),
        expect.objectContaining({ text: 'Raw score' }),
        expect.objectContaining({ text: 'Interpretation' }),
      ]),
    );
    expect(overviewTable?.table.body).toHaveLength(3);

    const pageBreaks = content.filter(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        ('pageBreak' in item ||
          ('stack' in item &&
            Array.isArray((item as { stack: unknown[] }).stack) &&
            (item as { stack: { pageBreak?: string }[] }).stack.some(
              (s) => typeof s === 'object' && s?.pageBreak === 'before',
            ))),
    );
    expect(pageBreaks).toHaveLength(0);
  });

  it('embeds chart image when provided', () => {
    const fill = baseData.fills[0];
    const report = buildParticipantReportData(baseData, fill);
    const chartImage = 'data:image/png;base64,abc';
    const doc = buildParticipantPdfDocDefinition(
      report,
      buildReportMeta(baseData, 'assignation-042'),
      chartImage,
    );

    const content = (Array.isArray(doc.content) ? doc.content : [doc.content]) as Content[];
    const imageBlock = content.find(
      (item) => typeof item === 'object' && item !== null && 'image' in item,
    ) as { image: string } | undefined;

    expect(imageBlock?.image).toBe(chartImage);
  });
});
