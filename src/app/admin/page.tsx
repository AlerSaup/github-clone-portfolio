"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProjectSummary {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  lastUpdated: string;
  languages: { name: string; color: string }[];
  tags: { name: string }[];
  images: { id: string }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchProjects();
  }, []);

  const checkAuth = async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      router.push("/admin/login");
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Projeler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" projesini silmek istediğinize emin misiniz?`)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Silme hatası:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex items-center gap-3 text-text-secondary">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75" />
          </svg>
          Yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admin Panel</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Projelerinizi yönetin — {projects.length} proje
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-green/90 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Yeni Proje
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Çıkış
          </button>
        </div>
      </div>

      {/* Projects Table */}
      {projects.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-secondary p-12 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 text-text-muted">
            <path d="M3 3h7l2 2h9v15H3V3z" />
          </svg>
          <h3 className="text-lg font-medium text-text-primary mb-2">Henüz proje yok</h3>
          <p className="text-sm text-text-secondary mb-4">İlk projenizi ekleyerek başlayın</p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-blue/90 transition-colors"
          >
            Proje Ekle
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-bg-secondary overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg-tertiary/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Proje
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Teknolojiler
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Görseller
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Son Güncelleme
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-bg-tertiary/30 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="text-sm font-medium text-accent-blue hover:underline"
                        target="_blank"
                      >
                        {project.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-text-muted">{project.shortDescription}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {project.languages.slice(0, 3).map((lang) => (
                        <span key={lang.name} className="flex items-center gap-1 text-xs text-text-secondary">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                          {lang.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-secondary">
                    {project.images.length}
                  </td>
                  <td className="px-4 py-4 text-xs text-text-muted">
                    {new Date(project.lastUpdated).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id, project.name)}
                        disabled={deleting === project.id}
                        className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                      >
                        {deleting === project.id ? "Siliniyor..." : "Sil"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
