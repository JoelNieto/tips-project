import type {
  Content,
  StyleDictionary,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import {
  buildReportNumber,
  formatInterpretation,
  formatLongDate,
  formatParticipantNameForReport,
  formatScore,
  type ParticipantReportData,
  type ReportMeta,
  type SummaryReportData,
} from './survey-results-report.utils';

const LANDSCAPE_COLUMN_THRESHOLD = 5;

const PDF_STYLES: StyleDictionary = {
  title: { fontSize: 18, bold: true, color: '#0f172a', margin: [0, 0, 0, 4] },
  subtitle: { fontSize: 11, color: '#475569', margin: [0, 0, 0, 2] },
  sectionTitle: {
    fontSize: 13,
    bold: true,
    color: '#0f172a',
    margin: [0, 12, 0, 6],
  },
  label: { fontSize: 10, bold: true, color: '#334155' },
  body: { fontSize: 10, color: '#1e293b' },
  muted: { fontSize: 9, color: '#64748b' },
  tableHeader: {
    fontSize: 9,
    bold: true,
    color: '#334155',
    fillColor: '#f1f5f9',
  },
  tableCell: { fontSize: 9, color: '#1e293b' },
  tableCellRight: { fontSize: 9, color: '#1e293b', alignment: 'right' },
  tableFooter: {
    fontSize: 9,
    bold: true,
    color: '#0f172a',
    fillColor: '#f8fafc',
  },
  reportClinic: { fontSize: 11, bold: true, color: '#0f172a' },
  reportMeta: { fontSize: 9, color: '#334155' },
  reportMainTitle: {
    fontSize: 14,
    bold: true,
    color: '#0f172a',
    alignment: 'center',
    characterSpacing: 0.5,
  },
  reportSubtitle: {
    fontSize: 11,
    color: '#1e293b',
    alignment: 'center',
    margin: [0, 3, 0, 0],
  },
};

const TABLE_LAYOUT = {
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => '#cbd5e1',
  vLineColor: () => '#cbd5e1',
  paddingLeft: () => 8,
  paddingRight: () => 8,
  paddingTop: () => 5,
  paddingBottom: () => 5,
};

const HEADER_BORDER_LAYOUT = {
  hLineWidth: () => 1,
  vLineWidth: () => 1,
  hLineColor: () => '#0f172a',
  vLineColor: () => '#0f172a',
  paddingLeft: () => 18,
  paddingRight: () => 18,
  paddingTop: () => 16,
  paddingBottom: () => 20,
};

function companyInitials(companyName: string | null): string {
  if (!companyName?.trim()) return 'T';
  return companyName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function buildLogoBlock(meta: ReportMeta): Content {
  if (meta.logoImageDataUrl) {
    return {
      image: meta.logoImageDataUrl,
      width: 52,
      height: 52,
      margin: [0, 2, 0, 0],
    };
  }

  return {
    table: {
      widths: [52],
      heights: [52],
      body: [
        [
          {
            text: companyInitials(meta.companyName),
            alignment: 'center',
            fontSize: 16,
            bold: true,
            color: '#334155',
            margin: [0, 14, 0, 0],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#94a3b8',
      vLineColor: () => '#94a3b8',
    },
  };
}

function buildReportHeaderFrame(inner: Content[]): Content {
  return {
    table: {
      widths: ['*'],
      body: [[{ stack: inner, border: [false, false, false, false] }]],
    },
    layout: HEADER_BORDER_LAYOUT,
    margin: [0, 0, 0, 20],
  } as Content;
}

function buildParticipantReportHeader(
  meta: ReportMeta,
  data: ParticipantReportData,
): Content {
  const reportNumber = buildReportNumber(meta.assignationId);
  const reportDate = formatLongDate(new Date());
  const participant = formatParticipantNameForReport(data.participantName);
  const assessmentDate = formatLongDate(data.submittedAt);

  return buildReportHeaderFrame([
    {
      columns: [
        buildLogoBlock(meta),
        {
          width: '*',
          stack: [
            {
              text: meta.companyName ?? 'Assessment Center',
              style: 'reportClinic',
              margin: [10, 14, 0, 0],
            },
          ],
        },
        {
          width: 'auto',
          stack: [
            {
              text: `Report #: ${reportNumber}`,
              style: 'reportMeta',
              alignment: 'right',
            },
            {
              text: `Date: ${reportDate}`,
              style: 'reportMeta',
              alignment: 'right',
              margin: [0, 4, 0, 0],
            },
          ],
          margin: [0, 10, 0, 0],
        },
      ],
      columnGap: 8,
    },
    { text: '', margin: [0, 18] },
    { text: meta.surveyTitle.toUpperCase(), style: 'reportMainTitle' },
    { text: '', margin: [0, 10] },
    {
      text: `Survey Results for: ${participant}`,
      style: 'reportSubtitle',
      bold: true,
    },
    {
      text: `Assessment Date: ${assessmentDate}`,
      style: 'reportSubtitle',
      margin: [0, 6, 0, 0],
    },
  ]);
}

function buildSummaryReportHeader(
  meta: ReportMeta,
  data: SummaryReportData,
): Content {
  const reportNumber = buildReportNumber(meta.assignationId);
  const reportDate = formatLongDate(new Date());

  return buildReportHeaderFrame([
    {
      columns: [
        buildLogoBlock(meta),
        {
          width: '*',
          stack: [
            {
              text: meta.companyName ?? 'Assessment Center',
              style: 'reportClinic',
              margin: [10, 14, 0, 0],
            },
          ],
        },
        {
          width: 'auto',
          stack: [
            {
              text: `Report #: ${reportNumber}`,
              style: 'reportMeta',
              alignment: 'right',
            },
            {
              text: `Date: ${reportDate}`,
              style: 'reportMeta',
              alignment: 'right',
              margin: [0, 4, 0, 0],
            },
          ],
          margin: [0, 10, 0, 0],
        },
      ],
      columnGap: 8,
    },
    { text: '', margin: [0, 18] },
    { text: meta.surveyTitle.toUpperCase(), style: 'reportMainTitle' },
    { text: '', margin: [0, 10] },
    {
      text: 'Group Results Summary',
      style: 'reportSubtitle',
      bold: true,
    },
    {
      text: `${data.submissionCount} submission${data.submissionCount === 1 ? '' : 's'}`,
      style: 'reportSubtitle',
      margin: [0, 6, 0, 0],
    },
    ...(meta.surveyTitle
      ? [
          {
            text: meta.surveyTitle,
            style: 'muted',
            alignment: 'center' as const,
            margin: [0, 4, 0, 0] as [number, number, number, number],
          },
        ]
      : []),
  ]);
}

function pageFooter(): Content {
  return {
    text: 'Page {currentPage} of {pageCount}',
    alignment: 'center',
    fontSize: 8,
    color: '#94a3b8',
    margin: [0, 8, 0, 0],
  };
}

export function buildSummaryPdfDocDefinition(
  data: SummaryReportData,
  meta: ReportMeta,
): TDocumentDefinitions {
  const landscape = data.columns.length > LANDSCAPE_COLUMN_THRESHOLD;
  const headerRow = [
    { text: 'Participant', style: 'tableHeader' },
    ...data.columns.map((col) => ({
      text: col.title,
      style: 'tableHeader',
      alignment: 'right',
    })),
  ];

  const bodyRows = data.rows.map((row) => [
    {
      stack: row.hasName
        ? [
            { text: row.displayName, style: 'tableCell' },
            { text: row.email, style: 'muted' },
          ]
        : [{ text: row.displayName, style: 'tableCell' }],
    },
    ...row.scores.map((score) => ({
      text: formatScore(score),
      style: 'tableCellRight',
    })),
  ]);

  const footerRow = data.averages
    ? [
        { text: 'Group average', style: 'tableFooter' },
        ...data.averages.map((avg) => ({
          text: formatScore(avg),
          style: 'tableCellRight',
        })),
      ]
    : null;

  const tableBody = footerRow ? [...bodyRows, footerRow] : bodyRows;
  const widths: (string | number)[] = ['*', ...data.columns.map(() => 'auto')];

  const content: Content[] = [buildSummaryReportHeader(meta, data)];

  if (data.columns.length === 0) {
    content.push({ text: 'No category scores available.', style: 'body' });
  } else {
    content.push({
      table: {
        headerRows: 1,
        widths,
        body: [headerRow, ...tableBody],
      },
      layout: TABLE_LAYOUT,
    } as Content);
  }

  return {
    pageOrientation: landscape ? 'landscape' : 'portrait',
    pageMargins: [40, 40, 40, 50],
    defaultStyle: { font: 'Roboto', fontSize: 10 },
    styles: PDF_STYLES,
    footer: pageFooter,
    content,
  };
}

function buildDomainOverviewTable(data: ParticipantReportData): Content {
  const headerRow = [
    { text: 'Domain', style: 'tableHeader' },
    { text: 'Raw score', style: 'tableHeader', alignment: 'right' },
    { text: 'Interpretation', style: 'tableHeader' },
  ];

  const bodyRows = data.groups.map((group) => [
    { text: group.title, style: 'tableCell' },
    {
      text:
        group.categoryTotal != null ? formatScore(group.categoryTotal) : '—',
      style: 'tableCellRight',
    },
    {
      text: formatInterpretation(group.categoryMessage),
      style: 'tableCell',
    },
  ]);

  return {
    table: {
      headerRows: 1,
      widths: ['*', 'auto', '*'],
      body: [headerRow, ...bodyRows],
    },
    layout: TABLE_LAYOUT,
    margin: [0, 0, 0, 16],
  } as Content;
}

function buildCategorySection(
  group: ParticipantReportData['groups'][number],
  data: ParticipantReportData,
): Content {
  const section: Content[] = [
    {
      text: data.hasCategories
        ? `${data.categoryLabel}: ${group.title}`
        : group.title,
      style: 'sectionTitle',
      margin: [0, 8, 0, 4],
    },
  ];

  if (group.categoryMessage?.message) {
    section.push({
      text: group.categoryMessage.message,
      style: 'muted',
      margin: [0, 0, 0, 6],
    });
  }

  for (const sub of group.subdimensions) {
    if (data.hasCategories) {
      section.push({
        text: sub.dimensionTitle,
        style: 'label',
        margin: [0, 8, 0, 4],
      });
    }

    if (sub.mainAnswer) {
      section.push({
        columns: [
          { text: 'Main question', style: 'muted', width: 'auto' },
          {
            text: `${sub.mainAnswer.text} (${sub.mainAnswer.value})`,
            style: 'body',
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 4],
      });
    }

    for (const qa of sub.questions) {
      const answers = qa.answers
        .map((ans) => `${ans.text} (${ans.value})`)
        .join(', ');
      section.push({
        stack: [
          { text: qa.questionText, style: 'body', margin: [0, 4, 0, 2] },
          { text: answers, style: 'muted' },
        ],
        margin: [0, 0, 0, 6],
      });
    }
  }

  return { stack: section };
}

export function buildParticipantPdfDocDefinition(
  data: ParticipantReportData,
  meta: ReportMeta,
  chartImage?: string | null,
): TDocumentDefinitions {
  const content: Content[] = [buildParticipantReportHeader(meta, data)];

  if (chartImage) {
    content.push({
      image: chartImage,
      width: 480,
      alignment: 'center',
      margin: [0, 0, 0, 16],
    });
  }

  if (data.groups.length === 0) {
    content.push({
      text: 'No answers recorded for this submission.',
      style: 'body',
    });
  } else {
    content.push(buildDomainOverviewTable(data));
    content.push({
      text: 'Detailed results',
      style: 'sectionTitle',
      margin: [0, 4, 0, 4],
    });

    for (const group of data.groups) {
      content.push(buildCategorySection(group, data));
    }
  }

  return {
    pageOrientation: 'portrait',
    pageMargins: [40, 40, 40, 50],
    defaultStyle: { font: 'Roboto', fontSize: 10 },
    styles: PDF_STYLES,
    footer: pageFooter,
    content,
  };
}
