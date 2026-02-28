"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import ImageGallery from "./ImageGallery";
import FileExplorer from "./FileExplorer";
import FileViewer from "./FileViewer";
import ProjectSidebar from "./ProjectSidebar";
import Link from "next/link";

interface Props {
  project: Project;
}

type Tab = "images" | "files";

export default function ProjectDetail({ project }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("images");
  const [downloading, setDownloading] = useState(false);
  const [viewingFile, setViewingFile] = useState<{ path: string; name: string; language?: string | null } | null>(null);

  const handleDownload = async () => {
    if (!project.downloadUrl || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(project.downloadUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = project.downloadUrl.split("/").pop() || `${project.slug}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // fallback: direct navigation
      window.location.href = project.downloadUrl;
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/projects" className="text-accent-blue hover:underline">
          Projeler
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-text-primary font-semibold">{project.name}</span>
      </div>

      {/* Project Header */}
      <div className="mb-6 flex items-center gap-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-text-muted">
          <path d="M3 3h7l2 2h9v15H3V3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h1 className="text-2xl font-bold text-text-primary">{project.name}</h1>
        <span className="rounded-full border border-border px-3 py-0.5 text-xs text-text-secondary">
          Public
        </span>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-border mb-0">
        <div className="flex gap-0 items-center">
          <button
            onClick={() => setActiveTab("images")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "images"
                ? "border-accent-orange text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Görseller
            <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-xs text-text-secondary">
              {project.images.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("files")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "files"
                ? "border-accent-orange text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
              <polyline points="13 2 13 9 20 9"/>
            </svg>
            Proje Dosyaları
            <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-xs text-text-secondary">
              {countFiles(project.files)}
            </span>
          </button>

          {/* Projeyi İndir Butonu */}
          {project.downloadUrl && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="ml-auto flex items-center gap-2 rounded-md bg-accent-green px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-green/90 disabled:opacity-70 transition-colors"
            >
              {downloading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75" />
                  </svg>
                  İndiriliyor...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Projeyi İndir
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="rounded-lg border border-border bg-bg-secondary overflow-hidden">
            {activeTab === "images" ? (
              <ImageGallery images={project.images} />
            ) : viewingFile ? (
              <FileViewer
                slug={project.slug}
                filePath={viewingFile.path}
                fileName={viewingFile.name}
                language={viewingFile.language}
                onClose={() => setViewingFile(null)}
              />
            ) : (
              <FileExplorer
                files={project.files}
                onFileClick={(path, name, language) => setViewingFile({ path, name, language })}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <ProjectSidebar project={project} />
        </div>
      </div>
    </div>
  );
}

function countFiles(files: Project["files"]): number {
  let count = 0;
  for (const file of files) {
    if (file.type === "file") count++;
    if (file.children) count += countFiles(file.children);
  }
  return count;
}
