"use client";

import { useState, useEffect } from "react";

interface FileViewerProps {
  slug: string;
  filePath: string;
  fileName: string;
  language?: string | null;
  onClose: () => void;
}

export default function FileViewer({ slug, filePath, fileName, language, onClose }: FileViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [binary, setBinary] = useState(false);
  const [tooLarge, setTooLarge] = useState(false);
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/projects/${slug}/file-content?path=${encodeURIComponent(filePath)}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Dosya okunamadı");
          return;
        }
        const data = await res.json();
        if (data.binary) {
          setBinary(true);
        } else if (data.tooLarge) {
          setTooLarge(true);
        } else {
          setContent(data.content);
          setLineCount(data.lineCount || 0);
        }
      } catch {
        setError("Dosya yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [slug, filePath]);

  return (
    <div>
      {/* File header - breadcrumb */}
      <div className="flex items-center justify-between border-b border-border bg-bg-tertiary/50 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-accent-blue hover:underline flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
            Dosyalara Dön
          </button>
          <span className="text-text-muted">/</span>
          <FilePathBreadcrumb path={filePath} />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {!loading && !error && !binary && content !== null && (
            <span className="text-xs text-text-muted">
              {lineCount} satır
            </span>
          )}
          {language && (
            <span className="rounded-full bg-bg-tertiary px-2.5 py-0.5 text-xs text-text-secondary">
              {language}
            </span>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="h-6 w-6 animate-spin text-text-muted" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
              <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75" />
            </svg>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-red-400">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        ) : binary ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-sm font-medium text-text-secondary">{fileName}</p>
            <p className="mt-1 text-xs">Bu dosya binary (ikili) formatta, önizleme yapılamıyor.</p>
          </div>
        ) : tooLarge ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-sm font-medium text-text-secondary">{fileName}</p>
            <p className="mt-1 text-xs">Dosya çok büyük (1 MB üzeri), önizleme yapılamıyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-sm leading-relaxed">
              <tbody>
                {(content || "").split("\n").map((line, i) => (
                  <tr key={i} className="hover:bg-bg-tertiary/30">
                    <td className="select-none border-r border-border px-4 py-0 text-right text-xs text-text-muted/50 align-top w-[1%] whitespace-nowrap">
                      {i + 1}
                    </td>
                    <td className="px-4 py-0 whitespace-pre text-text-secondary">
                      {line || "\u00A0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FilePathBreadcrumb({ path }: { path: string }) {
  const parts = path.split("/");
  return (
    <div className="flex items-center gap-1 text-sm min-w-0 truncate">
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-text-muted">/</span>}
          <span className={i === parts.length - 1 ? "text-text-primary font-medium" : "text-text-secondary"}>
            {part}
          </span>
        </span>
      ))}
    </div>
  );
}
