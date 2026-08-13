'use client';

import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import * as mammoth from 'mammoth';

type DocMode = 'docx-to-pdf' | 'pdf-to-txt' | 'text-to-pdf';
type ResultKind = 'pdf' | 'txt';

const MODE_LABELS: Record<DocMode, string> = {
  'docx-to-pdf': 'Word / File to PDF',
  'pdf-to-txt': 'PDF Preview / Text Export',
  'text-to-pdf': 'Text Editor to PDF',
};

export default function DocumentConverter() {
  const [mode, setMode] = useState<DocMode>('docx-to-pdf');
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('Converted Document');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const [converting, setConverting] = useState<boolean>(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedName, setConvertedName] = useState<string>('');
  const [resultKind, setResultKind] = useState<ResultKind>('pdf');

  useEffect(() => {
    return () => {
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    };
  }, [convertedUrl, pdfPreviewUrl]);

  const resetOutput = () => {
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    setConvertedUrl(null);
    setConvertedName('');
  };

  const changeMode = (nextMode: DocMode) => {
    setMode(nextMode);
    setFile(null);
    setPreviewHtml('');
    setPdfPreviewUrl(null);
    setStatusMessage('');
    resetOutput();
    if (nextMode === 'text-to-pdf') {
      setTextContent('');
      setDocumentTitle('Converted Document');
    } else {
      setTextContent('');
    }
  };

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    resetOutput();
    setPreviewHtml('');
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    setPdfPreviewUrl(null);

    const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || 'document';
    setDocumentTitle(baseName);
    setStatusMessage('Reading document...');

    try {
      if (mode === 'docx-to-pdf') {
        const isDocx = /\.docx$/i.test(selectedFile.name);
        const isOldDoc = /\.doc$/i.test(selectedFile.name);
        const isTextLike = /\.(txt|md|rtf|html)$/i.test(selectedFile.name) || selectedFile.type.startsWith('text/');

        if (isDocx) {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const [rawTextResult, htmlResult] = await Promise.all([
            mammoth.extractRawText({ arrayBuffer }),
            mammoth.convertToHtml({ arrayBuffer }),
          ]);
          const rawText = rawTextResult.value.trim();
          setTextContent(rawText || 'No readable text was found in this DOCX file.');
          setPreviewHtml(htmlResult.value || '');
          setStatusMessage(
            htmlResult.messages.length
              ? `DOCX loaded with ${htmlResult.messages.length} formatting note(s). Text is ready for PDF conversion.`
              : 'DOCX loaded and ready for PDF conversion.'
          );
        } else if (isOldDoc) {
          setTextContent('');
          setStatusMessage('Old .doc files are binary Word files. Please save the file as .docx, .txt, or .html first for accurate browser conversion.');
        } else if (isTextLike) {
          const rawText = await selectedFile.text();
          const cleaned = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+\n/g, '\n').trim();
          setTextContent(cleaned || `Document: ${selectedFile.name}`);
          setPreviewHtml('');
          setStatusMessage('Text-based document loaded and ready for PDF conversion.');
        } else {
          setTextContent('');
          setStatusMessage('Unsupported document type. Use DOCX, TXT, RTF, HTML, or paste text into the editor.');
        }
      } else if (mode === 'pdf-to-txt') {
        if (/\.pdf$/i.test(selectedFile.name) || selectedFile.type === 'application/pdf') {
          const objectUrl = URL.createObjectURL(selectedFile);
          setPdfPreviewUrl(objectUrl);
          setTextContent('');
          setStatusMessage('PDF preview loaded. Browser-safe text extraction is not enabled for scanned or locked PDFs; paste selectable text below to export TXT.');
        } else {
          const rawText = await selectedFile.text();
          setTextContent(rawText);
          setStatusMessage('Text file loaded and ready to export as clean TXT.');
        }
      }
    } catch (error: any) {
      console.error('Document read error:', error);
      setStatusMessage(error.message || 'Could not read this document.');
      setTextContent('');
    }
  };

  const convertDocument = async () => {
    if (mode !== 'text-to-pdf' && !file && !textContent.trim()) {
      alert('Please upload a file or enter text in the editor.');
      return;
    }

    if ((mode === 'docx-to-pdf' || mode === 'text-to-pdf') && !textContent.trim()) {
      alert('There is no readable document text to convert. For old .doc files, save as .docx first.');
      return;
    }

    if (mode === 'pdf-to-txt' && !textContent.trim()) {
      alert('Paste selectable PDF text into the editor before exporting TXT.');
      return;
    }

    setConverting(true);
    resetOutput();

    try {
      if (mode === 'pdf-to-txt') {
        const blob = new Blob([normalizeText(textContent)], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        setConvertedUrl(url);
        setConvertedName(`${safeFileName(documentTitle)}_extracted.txt`);
        setResultKind('txt');
        setStatusMessage('Text exported successfully.');
        return;
      }

      const pdfBlob = createPdfBlob(documentTitle || 'Converted Document', normalizeText(textContent));
      const url = URL.createObjectURL(pdfBlob);
      setConvertedUrl(url);
      setConvertedName(`${safeFileName(documentTitle)}.pdf`);
      setResultKind('pdf');
      setStatusMessage('Adobe-compatible PDF generated successfully.');
    } catch (error: any) {
      console.error('PDF generation error:', error);
      alert('Document conversion failed: ' + (error.message || 'Error creating PDF binary.'));
    } finally {
      setConverting(false);
    }
  };

  const createPdfBlob = (title: string, bodyText: string): Blob => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    doc.setProperties({
      title,
      subject: 'Converted with BridgeTech Digital Tools Hub',
      creator: 'BridgeTech IT Services',
      author: 'BridgeTech IT Services',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 18;
    const contentWidth = pageWidth - marginX * 2;

    const drawHeader = (page: number) => {
      doc.setFillColor(4, 14, 64);
      doc.rect(0, 0, pageWidth, 18, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('BridgeTech IT Services', marginX, 11);

      doc.setFontSize(8);
      doc.setTextColor(239, 68, 68);
      doc.text(`Page ${page}`, pageWidth - marginX, 11, { align: 'right' });
    };

    const drawFooter = (page: number, totalPages: number) => {
      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, pageHeight - 16, pageWidth - marginX, pageHeight - 16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`support@itservicesfreetown.com | www.itservicesfreetown.com | Page ${page} of ${totalPages}`, marginX, pageHeight - 10);
    };

    let page = 1;
    drawHeader(page);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(title, marginX, 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated ${new Date().toLocaleDateString()} with BridgeTech Digital Tools Hub`, marginX, 36);

    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.4);
    doc.line(marginX, 40, pageWidth - marginX, 40);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);

    let y = 49;
    const paragraphs = bodyText.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    const printableBottom = pageHeight - 24;

    paragraphs.forEach((paragraph) => {
      const lines = doc.splitTextToSize(paragraph, contentWidth);
      lines.forEach((line: string) => {
        if (y > printableBottom) {
          doc.addPage();
          page += 1;
          drawHeader(page);
          y = 29;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(30, 41, 59);
        }
        doc.text(line, marginX, y);
        y += 6;
      });
      y += 4;
    });

    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      drawFooter(p, totalPages);
    }

    return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  };

  const safeFileName = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'converted_document';
  const normalizeText = (text: string) => text.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim();

  const canConvert = mode === 'pdf-to-txt'
    ? !!textContent.trim()
    : !!textContent.trim();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-600/20 border border-purple-500/30 rounded-2xl flex items-center justify-center text-purple-400 text-xl font-bold">
          <i className="fas fa-file-contract"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Document & PDF Converter</h2>
          <p className="text-xs text-slate-400">Parse DOCX, preview PDFs, and generate clean Adobe-compatible PDF/TXT files</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
        {([
          { key: 'docx-to-pdf', icon: 'fa-file-word' },
          { key: 'pdf-to-txt', icon: 'fa-file-pdf' },
          { key: 'text-to-pdf', icon: 'fa-file-lines' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => changeMode(tab.key)}
            className={`py-2.5 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
              mode === tab.key
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span>{MODE_LABELS[tab.key]}</span>
          </button>
        ))}
      </div>

      {mode !== 'text-to-pdf' && (
        <div className="relative mb-6">
          <input
            type="file"
            accept={mode === 'docx-to-pdf' ? '.docx,.doc,.txt,.rtf,.html,.md' : '.pdf,.txt,.md'}
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 bg-slate-950/60 rounded-2xl p-8 text-center transition-all">
            <i className="fas fa-file-arrow-up text-4xl text-purple-500/80 mb-3 animate-pulse"></i>
            <h3 className="text-sm font-semibold text-slate-200">
              {file ? file.name : `Select document file for ${MODE_LABELS[mode].toLowerCase()}`}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'docx-to-pdf'
                ? 'Best support: DOCX, TXT, Markdown, RTF, HTML. Old DOC must be saved as DOCX first.'
                : 'PDF preview plus TXT export from pasted/selectable text.'}
            </p>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="mb-5 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-xs font-semibold text-purple-300">
          <i className="fas fa-circle-info mr-2"></i>
          {statusMessage}
        </div>
      )}

      {pdfPreviewUrl && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
            <span className="font-bold text-slate-200">PDF Preview</span>
            <span>{file?.name}</span>
          </div>
          <iframe src={pdfPreviewUrl} title="PDF preview" className="h-80 w-full bg-white" />
        </div>
      )}

      {(mode === 'text-to-pdf' || mode === 'pdf-to-txt' || textContent) && (
        <div className="mb-6 space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {mode === 'pdf-to-txt' ? 'Text to Export' : 'Document Content Editor'}
          </label>
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            placeholder="Document title..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-semibold mb-2"
          />
          <textarea
            rows={10}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder={mode === 'pdf-to-txt' ? 'Paste selectable PDF text here, then export TXT...' : 'Type, paste, or review extracted document text here...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed custom-scrollbar"
          />
        </div>
      )}

      {previewHtml && (
        <div className="mb-6 rounded-2xl border border-slate-800 bg-white p-5 text-slate-900">
          <div className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">DOCX visual preview</div>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      )}

      <button
        onClick={convertDocument}
        disabled={converting || !canConvert}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mb-6"
      >
        {converting ? (
          <>
            <i className="fas fa-circle-notch fa-spin"></i>
            <span>Processing Document...</span>
          </>
        ) : (
          <>
            <i className="fas fa-file-export"></i>
            <span>{mode === 'pdf-to-txt' ? 'Export Clean TXT' : 'Generate PDF Document'}</span>
          </>
        )}
      </button>

      {convertedUrl && (
        <div className="bg-slate-950 p-5 rounded-2xl border border-purple-500/40 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <i className="fas fa-check-circle"></i>
              <span>{resultKind === 'pdf' ? 'Valid PDF Generated!' : 'Text File Exported!'}</span>
            </div>
            <span className="text-xs font-mono text-slate-400 truncate">{convertedName}</span>
          </div>

          {resultKind === 'pdf' && (
            <iframe src={convertedUrl} title="Converted PDF preview" className="h-72 w-full rounded-xl bg-white" />
          )}

          <a
            href={convertedUrl}
            download={convertedName}
            className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <i className="fas fa-download"></i>
            <span>Download .{resultKind.toUpperCase()} File</span>
          </a>
        </div>
      )}
    </div>
  );
}
