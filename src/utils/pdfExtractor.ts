import * as pdfjsLib from 'pdfjs-dist';

// Configure the PDF.js worker
try {
  // Use unpkg / cdnjs fallback to avoid worker chunk bundler mismatches
  const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '6.3.289'}/build/pdf.worker.min.mjs`;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
} catch (e) {
  console.warn('[PDF.js] Worker configuration fallback warning:', e);
}

export interface ExtractedPdfResult {
  text: string;
  pageCount: number;
  wordCount: number;
  suggestedTitle: string;
  fileName: string;
  fileSizeBytes: number;
}

export async function extractTextFromPdf(
  file: File,
  onProgress?: (progress: { currentPage: number; totalPages: number; percent: number }) => void
): Promise<ExtractedPdfResult> {
  const arrayBuffer = await file.arrayBuffer();
  const typedArray = new Uint8Array(arrayBuffer);

  const loadingTask = pdfjsLib.getDocument({
    data: typedArray,
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageLines: string[] = [];
    let currentLine = '';

    for (const item of textContent.items) {
      if ('str' in item) {
        const textItem = item as { str: string; hasEOL?: boolean };
        currentLine += textItem.str + ' ';
        if (textItem.hasEOL) {
          pageLines.push(currentLine.trim());
          currentLine = '';
        }
      }
    }

    if (currentLine.trim()) {
      pageLines.push(currentLine.trim());
    }

    const cleanedPageText = pageLines.join('\n').trim();
    if (cleanedPageText) {
      pageTexts.push(`[Section / Page ${pageNum}]\n${cleanedPageText}`);
    }

    onProgress?.({
      currentPage: pageNum,
      totalPages: numPages,
      percent: Math.round((pageNum / numPages) * 100),
    });
  }

  const combinedText = pageTexts.join('\n\n');

  // Derive human-readable topic title from filename
  const cleanBaseName = file.name
    .replace(/\.pdf$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();

  const words = combinedText.trim().split(/\s+/).filter(Boolean);

  return {
    text: combinedText,
    pageCount: numPages,
    wordCount: words.length,
    suggestedTitle: cleanBaseName || 'Uploaded PDF Notes',
    fileName: file.name,
    fileSizeBytes: file.size,
  };
}
