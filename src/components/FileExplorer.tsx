"use client";

import { useState } from "react";
import { ProjectFile } from "@/types/project";

interface Props {
  files: ProjectFile[];
  onFileClick?: (filePath: string, fileName: string, language?: string | null) => void;
}

export default function FileExplorer({ files, onFileClick }: Props) {
  return (
    <div className="divide-y divide-border">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3 bg-bg-tertiary/50 text-xs text-text-secondary font-medium">
        <span className="flex-1">Ad</span>
        <span className="w-20 text-right">Boyut</span>
        <span className="w-24 text-right">Dil</span>
      </div>

      {/* File tree */}
      {files.map((file) => (
        <FileRow key={file.name} file={file} depth={0} parentPath="" onFileClick={onFileClick} />
      ))}
    </div>
  );
}

function FileRow({ file, depth, parentPath, onFileClick }: { file: ProjectFile; depth: number; parentPath: string; onFileClick?: (filePath: string, fileName: string, language?: string | null) => void }) {
  const [isOpen, setIsOpen] = useState(depth < 1);

  const isFolder = file.type === "folder";
  const currentPath = parentPath ? `${parentPath}/${file.name}` : file.name;

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else if (onFileClick) {
      onFileClick(currentPath, file.name, file.language);
    }
  };

  return (
    <>
      <div
        className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-bg-tertiary/30 transition-colors ${
          isFolder || onFileClick ? "cursor-pointer" : ""
        }`}
        style={{ paddingLeft: `${16 + depth * 20}px` }}
        onClick={handleClick}
      >
        {/* Icon */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isFolder ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className={`text-text-muted flex-shrink-0 transition-transform ${
                  isOpen ? "rotate-90" : ""
                }`}
              >
                <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isOpen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent-blue flex-shrink-0">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent-blue flex-shrink-0">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              )}
            </>
          ) : (
            <>
              <span className="w-4 flex-shrink-0"></span>
              <FileIcon language={file.language ?? undefined} />
            </>
          )}
          <span className={`truncate ${isFolder ? "text-text-primary font-medium" : "text-text-secondary"}`}>
            {file.name}
          </span>
        </div>

        {/* Size */}
        <span className="w-20 text-right text-xs text-text-muted flex-shrink-0">
          {file.size || "—"}
        </span>

        {/* Language */}
        <span className="w-24 text-right text-xs text-text-muted flex-shrink-0">
          {file.language || "—"}
        </span>
      </div>

      {/* Children */}
      {isFolder && isOpen && file.children && (
        <>
          {file.children.map((child) => (
            <FileRow key={child.name} file={child} depth={depth + 1} parentPath={currentPath} onFileClick={onFileClick} />
          ))}
        </>
      )}
    </>
  );
}

function FileIcon({ language }: { language?: string }) {
  const getColor = () => {
    switch (language?.toLowerCase()) {
      case "typescript":
        return "#3178c6";
      case "javascript":
        return "#f7df1e";
      case "python":
        return "#3776ab";
      case "html":
        return "#e34c26";
      case "css":
        return "#1572b6";
      case "json":
        return "#a8a8a8";
      case "markdown":
        return "#ffffff";
      case "prisma":
        return "#2d3748";
      default:
        return "#8b949e";
    }
  };

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke={getColor()}
        strokeWidth="1.5"
      />
      <polyline points="14 2 14 8 20 8" stroke={getColor()} strokeWidth="1.5" />
    </svg>
  );
}
