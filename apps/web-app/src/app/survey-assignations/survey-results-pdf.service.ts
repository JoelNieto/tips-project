import { Injectable } from '@angular/core';
import type { TCreatedPdf } from 'pdfmake/interfaces';
import {
  buildParticipantReportData,
  buildReportMeta,
  buildSummaryReportData,
  sanitizeFilename,
  type FillResult,
  type ResultsData,
  type ReportMeta,
} from './survey-results-report.utils';
import {
  buildParticipantPdfDocDefinition,
  buildSummaryPdfDocDefinition,
} from './survey-results-pdf.builder';

type PdfMakeInstance = {
  createPdf: (doc: unknown) => TCreatedPdf;
  addVirtualFileSystem: (vfs: Record<string, string>) => void;
};

@Injectable({ providedIn: 'root' })
export class SurveyResultsPdfService {
  private pdfMakePromise: Promise<PdfMakeInstance> | null = null;

  async downloadSummaryPdf(
    data: ResultsData,
    assignationId: string,
  ): Promise<void> {
    const reportData = buildSummaryReportData(data);
    const meta = await this.enrichMeta(buildReportMeta(data, assignationId));
    const doc = buildSummaryPdfDocDefinition(reportData, meta);
    const filename = this.summaryFilename(meta.surveyTitle);
    await this.download(doc, filename);
  }

  async downloadParticipantPdf(
    data: ResultsData,
    fill: FillResult,
    assignationId: string,
    chartImage?: string | null,
  ): Promise<void> {
    const reportData = buildParticipantReportData(data, fill);
    const meta = await this.enrichMeta(buildReportMeta(data, assignationId));
    const doc = buildParticipantPdfDocDefinition(reportData, meta, chartImage);
    const filename = this.participantFilename(
      meta.surveyTitle,
      reportData.participantName,
    );
    await this.download(doc, filename);
  }

  private async enrichMeta(meta: ReportMeta): Promise<ReportMeta> {
    const logoImageDataUrl = await this.loadLogoImage(meta.companyLogo);
    return { ...meta, logoImageDataUrl };
  }

  private async loadLogoImage(url: string | null): Promise<string | null> {
    if (!url) return null;

    try {
      const response = await fetch(url);
      if (!response.ok) return null;

      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  private async download(
    docDefinition: ReturnType<typeof buildSummaryPdfDocDefinition>,
    filename: string,
  ): Promise<void> {
    const pdfMake = await this.loadPdfMake();
    const pdf = pdfMake.createPdf(docDefinition);
    await pdf.download(filename);
  }

  private async loadPdfMake(): Promise<PdfMakeInstance> {
    if (!this.pdfMakePromise) {
      this.pdfMakePromise = (async () => {
        const [pdfMakeModule, vfsModule] = await Promise.all([
          import('pdfmake/build/pdfmake'),
          import('pdfmake/build/vfs_fonts'),
        ]);
        const pdfMake = pdfMakeModule.default as PdfMakeInstance;
        const vfs = (vfsModule as { default?: Record<string, string> }).default ?? vfsModule;
        pdfMake.addVirtualFileSystem(vfs as Record<string, string>);
        return pdfMake;
      })();
    }
    return this.pdfMakePromise;
  }

  private summaryFilename(surveyTitle: string): string {
    const date = new Date().toISOString().slice(0, 10);
    return `${sanitizeFilename(surveyTitle)}_summary_${date}.pdf`;
  }

  private participantFilename(surveyTitle: string, participant: string): string {
    const date = new Date().toISOString().slice(0, 10);
    return `${sanitizeFilename(surveyTitle)}_${sanitizeFilename(participant)}_${date}.pdf`;
  }
}
