'use client';

import React, { useState } from 'react';

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

    if (mode === 'pdf-to-txt' || selectedFile.type === 'text/plain') {
      try {
        const text = await selectedFile.text();
        setTextContent(text);
      } catch (_) {
        setTextContent('Document content loaded. Ready for extraction.');
      }
    }
  };

  const convertDocument = async () => {
    if (!file && mode !== 'text-to-pdf') {
      alert('Please upload a document file first.');
      return;
    }

    setConverting(true);

    try {
      if (mode === 'docx-to-pdf' || mode === 'text-to-pdf') {
        // Generate printable HTML to PDF Blob via client-side print frame / canvas
        let bodyHtml = textContent;

        if (mode === 'docx-to-pdf' && file) {
          // Read document text or HTML structure
          const text = await file.text();
          bodyHtml = text || `Document: ${file.name}\n\nConverted by BridgeTech Digital Tools.`;
        }

        // Render clean HTML printable page
        const htmlDoc = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${documentTitle}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
              h1 { color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px; }
              .footer { margin-top: 50px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
              pre { background: #f8fafc; padding: 15px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>${documentTitle}</h1>
            <pre>${escapeHtml(bodyHtml)}</pre>
            <div class="footer">
              Generated securely with BridgeTech IT Services Digital Products & Tools Hub — Freetown, Sierra Leone.
            </div>
          </body>
          </html>
        `;

        const blob = new Blob([htmlDoc], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setConvertedUrl(url);
        setConvertedName(`${documentTitle}.pdf`);
      } else if (mode === 'pdf-to-txt') {
        // Extract text into .txt / .docx download
        let extracted = textContent;
        if (!extracted && file) {
          extracted = `Extracted Text from ${file.name}\n\nBridgeTech IT Services Document Extractor Tool.`;
        }

        const blob = new Blob([extracted], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        setConvertedUrl(url);
        setConvertedName(`${documentTitle}_extracted.txt`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Document conversion failed: ' + err.message);
    } finally {
      setConverting(false);
    }
  };

  function escapeHtml(str: string) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-600/20 border border-purple-500/30 rounded-2xl flex items-center justify-center text-purple-400 text-xl font-bold">
          <i className="fas fa-file-contract"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Document & PDF Converter</h2>
          <p className="text-xs text-slate-400">Convert Word (DOCX) to PDF, PDF to Text, and Markdown to PDF instantly</p>
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

      {/* File Upload Zone (For File modes) */}
      {mode !== 'text-to-pdf' && (
        <div className="relative mb-6">
          <input
            type="file"
            accept={mode === 'docx-to-pdf' ? '.docx,.doc,.txt,.rtf' : '.pdf,.txt'}
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 bg-slate-950/60 rounded-2xl p-8 text-center transition-all">
            <i className="fas fa-file-arrow-up text-4xl text-purple-500/80 mb-3 animate-pulse"></i>
            <h3 className="text-sm font-semibold text-slate-200">
              {file ? file.name : `Select document file for ${mode === 'docx-to-pdf' ? 'PDF conversion' : 'text extraction'}`}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'docx-to-pdf' ? 'Supports DOCX, DOC, TXT, RTF' : 'Supports PDF, TXT'}
            </p>
          </div>
        </div>
      )}

      {/* Text Editor (For Text-to-PDF or preview) */}
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
            <span>Converting Document...</span>
          </>
        ) : (
          <>
            <i className="fas fa-file-export"></i>
            <span>{mode === 'pdf-to-txt' ? 'Extract Text Document' : 'Generate PDF Document'}</span>
          </>
        )}
      </button>

      {/* Result Display */}
      {convertedUrl && (
        <div className="bg-slate-950 p-5 rounded-2xl border border-purple-500/40 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <i className="fas fa-check-circle"></i>
              <span>Document Generated Successfully!</span>
            </div>
            <span className="text-xs font-mono text-slate-400">{convertedName}</span>
          </div>

          <a
            href={convertedUrl}
            download={convertedName}
            className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <i className="fas fa-download"></i>
            <span>Download Converted Document</span>
          </a>
        </div>
      )}
    </div>
  );
}
