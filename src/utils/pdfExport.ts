import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  filename?: string;
  topicTitle?: string;
  onProgress?: (stage: string) => void;
}

export async function exportReportCardToPdf(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<void> {
  const {
    topicTitle = 'Oral Defense Dossier',
    filename,
    onProgress,
  } = options;

  onProgress?.('Preparing examination dossier for rendering...');

  // Target standard A4 page dimensions in mm
  const pdfWidthMm = 210;
  const pdfHeightMm = 297;
  const marginMm = 8;
  const contentWidthMm = pdfWidthMm - marginMm * 2;

  // Render high-DPI snapshot of the element
  onProgress?.('Capturing charts and examiner telemetry...');
  const canvas = await html2canvas(element, {
    scale: 2, // 2x resolution for crisp text & charts
    useCORS: true,
    backgroundColor: '#0a0f1d',
    logging: false,
    windowWidth: element.scrollWidth,
    ignoreElements: (el) => el.classList?.contains('pdf-exclude-export'),
  });

  onProgress?.('Synthesizing PDF pages...');

  const imgData = canvas.toDataURL('image/png');
  const imgWidthPx = canvas.width;
  const imgHeightPx = canvas.height;

  // Calculate scaled height in mm
  const scaledHeightMm = (imgHeightPx * contentWidthMm) / imgWidthPx;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageContentHeightMm = pdfHeightMm - marginMm * 2;
  let remainingHeightMm = scaledHeightMm;
  let positionMm = marginMm;
  let pageNumber = 1;

  // If entire report fits comfortably on one page
  if (scaledHeightMm <= pageContentHeightMm) {
    pdf.addImage(imgData, 'PNG', marginMm, marginMm, contentWidthMm, scaledHeightMm);
  } else {
    // Multi-page slicing
    while (remainingHeightMm > 0) {
      pdf.addImage(imgData, 'PNG', marginMm, positionMm, contentWidthMm, scaledHeightMm);
      remainingHeightMm -= pageContentHeightMm;
      positionMm -= pageContentHeightMm;

      if (remainingHeightMm > 0) {
        pdf.addPage();
        pageNumber++;
      }
    }
  }

  onProgress?.('Downloading official examination dossier...');
  const sanitizedTopic = topicTitle
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  const dateStr = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `VivaGuru_Dossier_${sanitizedTopic}_${dateStr}.pdf`;

  pdf.save(finalFilename);
}
