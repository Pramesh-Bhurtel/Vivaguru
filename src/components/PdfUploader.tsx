import React, { useState, useRef } from 'react';
import { FileUp, FileText, CheckCircle2, AlertCircle, Loader2, X, Sparkles } from 'lucide-react';
import { extractTextFromPdf, ExtractedPdfResult } from '../utils/pdfExtractor.js';

interface PdfUploaderProps {
  onTextExtracted: (result: ExtractedPdfResult) => void;
  disabled?: boolean;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({
  onTextExtracted,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressInfo, setProgressInfo] = useState<{
    currentPage: number;
    totalPages: number;
    percent: number;
  } | null>(null);
  const [extractedMeta, setExtractedMeta] = useState<ExtractedPdfResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please provide a valid PDF document (.pdf).');
      return;
    }

    // Check size cap (e.g. 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('PDF exceeds the 25MB limit. Please upload a smaller syllabus or chapter extract.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setProgressInfo({ currentPage: 0, totalPages: 1, percent: 0 });

    try {
      const result = await extractTextFromPdf(file, (progress) => {
        setProgressInfo(progress);
      });

      if (!result.text.trim()) {
        setErrorMessage('Could not extract readable text from this PDF. It may contain scanned images without OCR.');
        setIsProcessing(false);
        return;
      }

      setExtractedMeta(result);
      onTextExtracted(result);
    } catch (err: any) {
      console.error('[PdfUploader] Error parsing PDF:', err);
      setErrorMessage(
        err?.message || 'Failed to parse PDF. Ensure the file is not password-protected or corrupted.'
      );
    } finally {
      setIsProcessing(false);
      setProgressInfo(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isProcessing) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
    // reset input so the same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setExtractedMeta(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-3">
      {/* Hidden file input supporting click */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleInputChange}
        disabled={disabled || isProcessing}
        className="hidden"
        id="pdf-document-upload"
      />

      {/* Active Extracted File Banner */}
      {extractedMeta && !isProcessing ? (
        <div className="p-3.5 bg-slate-900 border border-emerald-500/40 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100 truncate max-w-xs font-mono">
                  {extractedMeta.fileName}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-emerald-500/20 text-emerald-300 uppercase">
                  PARSED_OK
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                {extractedMeta.pageCount} pages &bull; {extractedMeta.wordCount.toLocaleString()} words extracted &bull; {(extractedMeta.fileSizeBytes / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-sm bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-mono transition-colors cursor-pointer"
            >
              REPLACE PDF
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Remove extracted file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Drag-and-drop & Click Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isProcessing && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-sm p-5 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200'
              : 'border-slate-800 bg-[#0a0f1d]/70 hover:border-slate-700 hover:bg-[#0a0f1d]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <div className="py-3 space-y-3">
              <div className="flex items-center justify-center gap-2 text-indigo-400 text-xs font-mono">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="uppercase tracking-widest font-semibold">
                  Extracting PDF Syllabus &bull; Page {progressInfo?.currentPage || 1} of {progressInfo?.totalPages || 1}...
                </span>
              </div>
              {progressInfo && (
                <div className="w-48 mx-auto bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-200"
                    style={{ width: `${progressInfo.percent}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-1">
              <div className="w-8 h-8 rounded-sm bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <FileUp className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-300 font-sans">
                  <span className="font-semibold text-indigo-400 hover:underline">Click to upload</span> or drag &amp; drop textbook chapters, lecture slides, or papers
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  PDF format &bull; Extracts full text via PDF.js &bull; Max 25 MB
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Parsing error notification */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-sm text-rose-400 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
