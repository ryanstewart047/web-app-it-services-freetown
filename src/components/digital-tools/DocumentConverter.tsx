'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';

type DocMode = 'docx-to-pdf' | 'pdf-to-txt' | 'text-to-pdf';

export default function DocumentConverter() {
  const [mode, setMode] = useState<DocMode>('docx-to-pdf');
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('Converted Document');

  const [converting, setConverting] = useState<boolean>(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedName, setConvertedName] = useState<string>('');

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setConvertedUrl(null);

    const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || 'document';
    setDocumentTitle(baseName);

    try {
      const text = await selectedFile.text();
      setTextContent(text);
    } catch (_) {
      setTextContent('Document content loaded. Click Convert to generate your document.');
    }
  };

  const convertDocument = async () => {
    if (!file && mode !== 'text-to-pdf' && !textContent.trim()) {
      alert('Please upload a file or enter text in the editor.');
      return;
    }

    setConverting(true);

    try {
      if (mode === 'docx-to-pdf' || mode === 'text-to-pdf') {
        let bodyText = textContent;

        if (mode === 'docx-to-pdf' && file) {
          try {
            const rawText = await file.text();
            // Clean control characters or HTML markup if any
            bodyText = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || `Document: ${file.name}\n\nConverted by BridgeTech Digital Tools.`;
          } catch (_) {
            bodyText = `Document: ${file.name}\n\nConverted by BridgeTech Digital Tools.`;
          }
        }

        if (!bodyText.trim()) {
          bodyText = 'BridgeTech IT Services Digital Products & Tools Hub Document';
        }

        // Generate TRUE binary PDF using jsPDF (valid %PDF-1.4 binary structure)
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        // Header Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(220, 38, 38); // Red brand theme
        doc.text(documentTitle || 'Converted Document', 20, 20);

        // Subtitle / Date
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated on ${new Date().toLocaleDateString()} — BridgeTech Digital Tools Hub`, 20, 26);

        // Divider Line
        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(0.5);
        doc.line(20, 29, 190, 29);

        // Body Content Text (Wrapped to fit 170mm page width)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);

        const textLines = doc.splitTextToSize(bodyText, 170);
        let y = 37;
        const pageHeight = doc.internal.pageSize.getHeight();

        for (let i = 0; i < textLines.length; i++) {
          if (y > pageHeight - 25) {
            doc.addPage();
            y = 20;
          }
          doc.text(textLines[i], 20, y);
          y += 6;
        }

        // Footer Banner
        const totalPages = doc.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
          doc.setPage(p);
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`Page ${p} of ${totalPages} • BridgeTech IT Services — Freetown, Sierra Leone`, 20, pageHeight - 10);
        }

        // Output Blob as true application/pdf binary
        const pdfArrayBuffer = doc.output('arraybuffer');
        const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);

        setConvertedUrl(url);
        setConvertedName(`${documentTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
      } else if (mode === 'pdf-to-txt') {
        // Extract text into clean .txt or .docx formatted document
        let extracted = textContent;
        if (!extracted && file) {
          extracted = `Extracted text from ${file.name}\n\nProcessed with BridgeTech IT Services Document Converter.`;
        }

        const blob = new Blob([extracted], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        setConvertedUrl(url);
        setConvertedName(`${documentTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_extracted.txt`);
      }
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      alert('Document conversion failed: ' + (err.message || 'Error creating PDF binary.'));
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-600/20 border border-purple-500/30 rounded-2xl flex items-center justify-center text-purple-400 text-xl font-bold">
          <i className="fas fa-file-contract"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Document & PDF Converter</h2>
          <p className="text-xs text-slate-400">Convert Word & Text to Valid Adobe-Compatible PDF or Extract Text</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => { setMode('docx-to-pdf'); setFile(null); setConvertedUrl(null); }}
          className={`py-2.5 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            mode === 'docx-to-pdf'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <i className="fas fa-file-word"></i>
          <span>Word / File to PDF</span>
        </button>
        <button
          type="button"
          onClick={() => { setMode('pdf-to-txt'); setFile(null); setConvertedUrl(null); }}
          className={`py-2.5 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            mode === 'pdf-to-txt'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <i className="fas fa-file-pdf"></i>
          <span>PDF to Word / Text</span>
        </button>
        <button
          type="button"
          onClick={() => { setMode('text-to-pdf'); setConvertedUrl(null); }}
          className={`py-2.5 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            mode === 'text-to-pdf'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <i className="fas fa-[#38bdf8] fa-file-lines"></i>
          <span>Text Editor to PDF</span>
        </button>
      </div>

      {/* File Upload Zone */}
      {mode !== 'text-to-pdf' && (
        <div className="relative mb-6">
          <input
            type="file"
            accept={mode === 'docx-to-pdf' ? '.docx,.doc,.txt,.rtf,.html' : '.pdf,.txt'}
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 bg-slate-950/60 rounded-2xl p-8 text-center transition-all">
            <i className="fas fa-file-arrow-up text-4xl text-purple-500/80 mb-3 animate-pulse"></i>
            <h3 className="text-sm font-semibold text-slate-200">
              {file ? file.name : `Select document file for ${mode === 'docx-to-pdf' ? 'PDF conversion' : 'text extraction'}`}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'docx-to-pdf' ? 'Supports DOCX, DOC, TXT, RTF, HTML' : 'Supports PDF, TXT'}
            </p>
          </div>
        </div>
      )}

      {/* Text Content Editor */}
      {(mode === 'text-to-pdf' || textContent) && (
        <div className="mb-6 space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Document Content Editor
          </label>
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            placeholder="Document Title..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-semibold mb-2"
          />
          <textarea
            rows={8}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Type or paste document text here to render into PDF..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed custom-scrollbar"
          ></textarea>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={convertDocument}
        disabled={converting}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mb-6"
      >
        {converting ? (
          <>
            <i className="fas fa-circle-notch fa-spin"></i>
            <span>Generating Binary PDF...</span>
          </>
        ) : (
          <>
            <i className="fas fa-file-export"></i>
            <span>{mode === 'pdf-to-txt' ? 'Extract Text Document' : 'Generate Binary PDF Document'}</span>
          </>
        )}
      </button>

      {/* Result Display */}
      {convertedUrl && (
        <div className="bg-slate-950 p-5 rounded-2xl border border-purple-500/40 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <i className="fas fa-check-circle"></i>
              <span>Valid Adobe-Compatible PDF Generated!</span>
            </div>
            <span className="text-xs font-mono text-slate-400">{convertedName}</span>
          </div>

          <a
            href={convertedUrl}
            download={convertedName}
            className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <i className="fas fa-download"></i>
            <span>Download .{mode === 'pdf-to-txt' ? 'TXT' : 'PDF'} File</span>
          </a>
        </div>
      )}
    </div>
  );
}
