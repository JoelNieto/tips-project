import { describe, expect, it } from 'vitest';
import {
  buildParticipantReportData,
  buildSummaryReportData,
  buildReportMeta,
  buildReportNumber,
  formatInterpretation,
  formatParticipantNameForReport,
  formatScore,
  interpretationEmoji,
  participantLabel,
  sanitizeFilename,
  type FillResult,
  type ResultsData,
} from './survey-results-report.utils';

const baseData: ResultsData = {
  hasCategories: true,
  hasSubcategories: true,
  categoryName: 'Competency',
  subcategoryName: 'Skill',
  visibleCategories: true,
  visibleSubcategories: true,
  surveyTitle: 'Leadership Survey',
  companyName: 'Acme Corp',
  assignationStartDate: '2026-01-01T00:00:00.000Z',
  assignationExpirationDate: '2026-06-30T00:00:00.000Z',
  dimensions: [
    {
      id: 'cat-1',
      title: 'Communication',
      parentId: null,
      scoreRanges: [
        {
          label: 'Strong',
          message: 'Excellent communicator',
          minValue: 5,
          maxValue: 20,
          order: 0,
        },
      ],
    },
    {
      id: 'dim-1',
      title: 'Verbal',
      parentId: 'cat-1',
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
      ],
      questionAnswers: [
        {
          dimensionQuestionId: 'dq-1',
          dimensionId: 'dim-1',
          dimensionTitle: 'Verbal',
          categoryId: 'cat-1',
          categoryTitle: 'Communication',
          questionText: 'Speaks clearly?',
          answers: [{ id: 'a-1', text: 'Yes', value: 3 }],
        },
      ],
    },
    {
      inviteeId: 'inv-2',
      inviteeEmail: 'bob@example.com',
      inviteeName: null,
      submittedAt: '2026-02-02T10:00:00.000Z',
      mainAnswers: [
        {
          dimensionId: 'dim-1',
          dimensionTitle: 'Verbal',
          categoryId: 'cat-1',
          categoryTitle: 'Communication',
          answerText: 'Sometimes',
          answerValue: 2,
        },
      ],
      questionAnswers: [],
    },
  ],
};

describe('survey-results-report.utils', () => {
  it('formats scores and participant labels', () => {
    expect(formatScore(10)).toBe('10');
    expect(formatScore(10.5)).toBe('10.5');
    expect(
      participantLabel({
        inviteeId: '1',
        inviteeEmail: 'bob@example.com',
        inviteeName: 'Bob',
        submittedAt: '',
        mainAnswers: [],
        questionAnswers: [],
      }),
    ).toBe('Bob');
  });

  it('builds summary rows and averages', () => {
    const summary = buildSummaryReportData(baseData);

    expect(summary.columns).toHaveLength(1);
    expect(summary.columns[0].title).toBe('Communication');
    expect(summary.rows).toHaveLength(2);
    expect(summary.rows[0].scores[0]).toBe(7);
    expect(summary.rows[1].displayName).toBe('bob@example.com');
    expect(summary.averages?.[0]).toBe(4.5);
    expect(summary.submissionCount).toBe(2);
  });

  it('builds participant groups with score messages', () => {
    const fill = baseData.fills[0] as FillResult;
    const report = buildParticipantReportData(baseData, fill);

    expect(report.groups).toHaveLength(1);
    expect(report.groups[0].title).toBe('Communication');
    expect(report.groups[0].categoryTotal).toBe(7);
    expect(report.groups[0].categoryMessage?.label).toBe('Strong');
    expect(report.groups[0].subdimensions[0].questions[0].questionText).toBe(
      'Speaks clearly?',
    );
  });

  it('sanitizes filenames', () => {
    expect(sanitizeFilename('Leadership Survey!')).toBe('Leadership_Survey');
  });

  it('formats interpretations with emoji indicators', () => {
    expect(interpretationEmoji('High Concern')).toBe('🔴');
    expect(interpretationEmoji('Moderate Concern')).toBe('🟡');
    expect(interpretationEmoji('Above Average')).toBe('🟢');
    expect(formatInterpretation({ label: 'High Concern', message: 'Needs attention' })).toBe(
      '🔴 High Concern',
    );
  });

  it('builds report numbers and participant display names', () => {
    expect(buildReportNumber('assignation-042', new Date('2026-06-24'))).toBe(
      'PSY-2026-042',
    );
    expect(formatParticipantNameForReport('Jordan Martinez')).toBe('JORDAN M.');
    expect(buildReportMeta(baseData, 'assignation-042').assignationId).toBe(
      'assignation-042',
    );
  });
});
