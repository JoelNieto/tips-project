import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { DashboardSummaryEntity } from './dto/dashboard-summary.entity';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string): Promise<DashboardSummaryEntity> {
    const now = new Date();

    const [
      companiesRegistered,
      numberOfSurveys,
      numberOfQuestions,
      numberOfSurveyAssignations,
      activeRows,
    ] = await Promise.all([
      this.prisma.company.count({ where: { createdById: userId } }),
      this.prisma.survey.count({ where: { createdById: userId } }),
      this.prisma.question.count({ where: { createdById: userId } }),
      this.prisma.surveyAssignation.count({ where: { createdById: userId } }),
      this.prisma.surveyAssignation.findMany({
        where: {
          createdById: userId,
          startDate: { lte: now },
          expirationDate: { gte: now },
        },
        include: {
          survey: { select: { id: true, title: true } },
          company: { select: { name: true } },
          _count: { select: { invitees: true } },
        },
        orderBy: { expirationDate: 'asc' },
        take: 5,
      }),
    ]);

    return {
      companiesRegistered,
      numberOfSurveys,
      numberOfQuestions,
      numberOfSurveyAssignations,
      activeSurveyWindows: activeRows.map((row) => ({
        id: row.id,
        surveyId: row.surveyId,
        surveyTitle: row.survey.title,
        companyName: row.company.name,
        startDate: row.startDate,
        expirationDate: row.expirationDate,
        inviteeCount: row._count.invitees,
      })),
    };
  }
}
