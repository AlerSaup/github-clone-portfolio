"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface LanguageInput {
  name: string;
  percentage: number;
  color: string;
}

interface ImageInput {
  src: string;
  alt: string;
}

interface FileInput {
  name: string;
  type: "file" | "folder";
  size?: string;
  language?: string;
  children?: FileInput[];
}

interface ProjectFormData {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  downloadUrl: string;
  owner: {
    name: string;
    avatar: string;
    github: string;
    bio: string;
  };
  languages: LanguageInput[];
  tags: string[];
  images: ImageInput[];
  files: FileInput[];
}

interface Props {
  initialData?: ProjectFormData & { id?: string };
  isEdit?: boolean;
}

const DEFAULT_DATA: ProjectFormData = {
  slug: "",
  name: "",
  description: "",
  shortDescription: "",
  downloadUrl: "",
  owner: { name: "", avatar: "", github: "", bio: "" },
  languages: [{ name: "", percentage: 0, color: "#3178c6" }],
  tags: [""],
  images: [],
  files: [],
};

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3776ab",
  "C#": "#239120",
  Java: "#b07219",
  Go: "#00add8",
  Rust: "#dea584",
  "C++": "#f34b7d",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  "HTML/CSS": "#e34c26",
  SQL: "#e38c00",
  React: "#61dafb",
  "Next.js": "#000000",
  "Node.js": "#339933",
  Prisma: "#2d3748",
  PostgreSQL: "#336791",
  MongoDB: "#47A248",
  Docker: "#2496ED",
  Tailwind: "#06B6D4",
};

// Dosya uzantısından dil algılama
const EXT_LANGUAGE_MAP: Record<string, string> = {
  ts: "TypeScript", tsx: "TypeScript",
  js: "JavaScript", jsx: "JavaScript", mjs: "JavaScript", cjs: "JavaScript",
  py: "Python", cs: "C#", java: "Java", go: "Go", rs: "Rust",
  cpp: "C++", cc: "C++", c: "C", h: "C", hpp: "C++",
  php: "PHP", rb: "Ruby", swift: "Swift", kt: "Kotlin",
  html: "HTML", htm: "HTML", css: "CSS", scss: "CSS", sass: "CSS", less: "CSS",
  sql: "SQL", json: "JSON", xml: "XML", yaml: "YAML", yml: "YAML",
  md: "Markdown", mdx: "Markdown", prisma: "Prisma",
  sh: "Shell", bash: "Shell", zsh: "Shell", ps1: "PowerShell",
  dockerfile: "Docker", graphql: "GraphQL", gql: "GraphQL",
  toml: "TOML", ini: "INI", env: "Config", gitignore: "Config",
  svg: "SVG", txt: "Text", lock: "Lock",
};

const IGNORED_DIRS = new Set([
  "node_modules", ".git", ".next", ".nuxt", "dist", "build", "out",
  "__pycache__", ".cache", ".vscode", ".idea", ".DS_Store", "Thumbs.db",
  ".env.local", ".env.development.local", ".env.test.local", ".env.production.local",
  ".svn", ".hg", "coverage", ".turbo", ".vercel", ".output",
  "vendor", "target", "bin", "obj", ".parcel-cache", ".webpack",
  ".angular", ".expo", "pods", ".gradle", ".dart_tool",
]);

// Yüklenmemesi gereken büyük / binary uzantılar
const IGNORED_EXTENSIONS = new Set([
  ".exe", ".dll", ".so", ".dylib", ".o", ".a", ".lib",
  ".pdb", ".map", ".wasm", ".node",
  ".mp4", ".mov", ".avi", ".mkv", ".wmv",
  ".zip", ".tar", ".gz", ".rar", ".7z", ".tgz",
  ".iso", ".img", ".dmg",
  ".jar", ".war", ".class",
  ".pyc", ".pyo",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // Tek dosya max 10 MB

function detectLanguage(filename: string): string | undefined {
  const lower = filename.toLowerCase();
  if (lower === "dockerfile") return "Docker";
  if (lower === ".gitignore" || lower === ".eslintrc" || lower === ".prettierrc") return "Config";
  const ext = lower.split(".").pop();
  if (!ext) return undefined;
  return EXT_LANGUAGE_MAP[ext];
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function shouldIgnore(pathPart: string): boolean {
  return IGNORED_DIRS.has(pathPart);
}

function shouldIgnoreFile(filename: string): boolean {
  const dot = filename.lastIndexOf(".");
  if (dot === -1) return false;
  return IGNORED_EXTENSIONS.has(filename.slice(dot).toLowerCase());
}

function buildTreeFromFiles(fileList: FileList): FileInput[] {
  const root: FileInput[] = [];
  const sortedFiles = Array.from(fileList).sort((a, b) =>
    a.webkitRelativePath.localeCompare(b.webkitRelativePath)
  );

  for (const file of sortedFiles) {
    const parts = file.webkitRelativePath.split("/");
    const pathParts = parts.slice(1); // İlk parça seçilen klasör adı
    if (pathParts.some((part) => shouldIgnore(part))) continue;
    if (shouldIgnoreFile(file.name)) continue;
    if (file.size > MAX_FILE_SIZE || file.size === 0) continue;

    let current = root;
    for (let i = 0; i < pathParts.length; i++) {
      const name = pathParts[i];
      const isLast = i === pathParts.length - 1;

      if (isLast) {
        current.push({
          name,
          type: "file",
          size: formatFileSize(file.size),
          language: detectLanguage(name),
        });
      } else {
        let folder = current.find((f) => f.name === name && f.type === "folder");
        if (!folder) {
          folder = { name, type: "folder", children: [] };
          current.push(folder);
        }
        current = folder.children!;
      }
    }
  }

  sortTree(root);
  return root;
}

function buildTreeFromIndividualFiles(files: File[]): FileInput[] {
  return files
    .map((file) => ({
      name: file.name,
      type: "file" as const,
      size: formatFileSize(file.size),
      language: detectLanguage(file.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function sortTree(nodes: FileInput[]): void {
  nodes.sort((a, b) => {
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;
    return a.name.localeCompare(b.name);
  });
  for (const node of nodes) {
    if (node.children) sortTree(node.children);
  }
}

function countFiles(nodes: FileInput[]): { files: number; folders: number } {
  let files = 0;
  let folders = 0;
  for (const node of nodes) {
    if (node.type === "folder") {
      folders++;
      if (node.children) {
        const sub = countFiles(node.children);
        files += sub.files;
        folders += sub.folders;
      }
    } else {
      files++;
    }
  }
  return { files, folders };
}

// Dosya ağacı önizleme bileşeni
function FileTreePreview({ nodes, depth = 0 }: { nodes: FileInput[]; depth?: number }) {
  return (
    <div>
      {nodes.map((node, i) => (
        <div key={`${depth}-${i}-${node.name}`}>
          <div
            className="flex items-center gap-2 py-1 text-sm"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {node.type === "folder" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-accent-blue flex-shrink-0">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-text-muted flex-shrink-0">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" />
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            )}
            <span className={node.type === "folder" ? "text-text-primary font-medium" : "text-text-secondary"}>
              {node.name}
            </span>
            {node.size && <span className="text-xs text-text-muted ml-auto pr-2">{node.size}</span>}
          </div>
          {node.type === "folder" && node.children && (
            <FileTreePreview nodes={node.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ProjectForm({ initialData, isEdit }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProjectFormData>(initialData || DEFAULT_DATA);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateOwner = (key: keyof ProjectFormData["owner"], value: string) => {
    setForm((prev) => ({ ...prev, owner: { ...prev.owner, [key]: value } }));
  };

  // --- Languages ---
  const addLanguage = () => {
    updateField("languages", [...form.languages, { name: "", percentage: 0, color: "#3178c6" }]);
  };
  const updateLanguage = (index: number, field: keyof LanguageInput, value: string | number) => {
    const updated = [...form.languages];
    if (field === "name" && typeof value === "string" && LANGUAGE_COLORS[value]) {
      updated[index] = { ...updated[index], [field]: value, color: LANGUAGE_COLORS[value] };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    updateField("languages", updated);
  };
  const removeLanguage = (index: number) => {
    updateField("languages", form.languages.filter((_, i) => i !== index));
  };

  // --- Tags ---
  const addTag = () => updateField("tags", [...form.tags, ""]);
  const updateTag = (index: number, value: string) => {
    const updated = [...form.tags];
    updated[index] = value;
    updateField("tags", updated);
  };
  const removeTag = (index: number) => {
    updateField("tags", form.tags.filter((_, i) => i !== index));
  };

  // --- Images (Upload) ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploadingImages(true);
    setError("");

    try {
      const formData = new FormData();
      for (const file of Array.from(selectedFiles)) {
        formData.append("files", file);
      }

      const res = await fetch("/api/upload", { method: "POST", body: formData });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Görsel yüklenemedi");
        return;
      }

      const data = await res.json();
      const newImages: ImageInput[] = data.files.map((f: { url: string; alt: string }) => ({
        src: f.url,
        alt: f.alt,
      }));

      updateField("images", [...form.images, ...newImages]);
    } catch {
      setError("Görsel yükleme hatası");
    } finally {
      setUploadingImages(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    updateField("images", form.images.filter((_, i) => i !== index));
  };

  const updateImageAlt = (index: number, alt: string) => {
    const updated = [...form.images];
    updated[index] = { ...updated[index], alt };
    updateField("images", updated);
  };

  // --- Files (Folder picker → uploads to server) ---
  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const currentSlug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!currentSlug) {
      setError("Önce proje adını girin");
      return;
    }

    setUploadingFiles(true);
    setError("");
    setUploadProgress("Dosyalar hazırlanıyor...");

    try {
      const formData = new FormData();
      formData.append("slug", currentSlug);

      const allFiles = Array.from(fileList);
      let addedCount = 0;
      let skippedCount = 0;

      for (const file of allFiles) {
        const parts = file.webkitRelativePath.split("/");
        const pathParts = parts.slice(1); // İlk kısım seçilen klasör adı
        const relativePath = pathParts.join("/");
        if (!relativePath) continue;

        // Client-side filtreleme — ağa hiç gönderme
        if (pathParts.some((part) => shouldIgnore(part))) { skippedCount++; continue; }
        if (shouldIgnoreFile(file.name)) { skippedCount++; continue; }
        if (file.size > MAX_FILE_SIZE) { skippedCount++; continue; }
        if (file.size === 0) continue; // boş dosyalar

        formData.append("files", file);
        formData.append("paths", relativePath);
        addedCount++;
      }

      if (addedCount === 0) {
        setError(`Yüklenecek dosya bulunamadı (${skippedCount} dosya filtrelendi)`);
        return;
      }

      setUploadProgress(`${addedCount} dosya yükleniyor (${skippedCount} filtrelendi)...`);

      const res = await fetch("/api/upload/project-files", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Dosyalar yüklenemedi");
        return;
      }

      const data = await res.json();
      updateField("files", data.tree);
      updateField("downloadUrl", data.downloadUrl);
      setUploadProgress(`${data.fileCount} dosya yüklendi, ZIP oluşturuldu!`);
    } catch {
      setError("Dosya yükleme hatası");
    } finally {
      setUploadingFiles(false);
      if (folderInputRef.current) folderInputRef.current.value = "";
      setTimeout(() => setUploadProgress(""), 3000);
    }
  };

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const currentSlug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!currentSlug) {
      setError("Önce proje adını girin");
      return;
    }

    setUploadingFiles(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("slug", currentSlug);

      for (const file of Array.from(fileList)) {
        formData.append("files", file);
        formData.append("paths", file.name);
      }

      const res = await fetch("/api/upload/project-files", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Dosyalar yüklenemedi");
        return;
      }

      const data = await res.json();
      updateField("files", data.tree);
      updateField("downloadUrl", data.downloadUrl);
    } catch {
      setError("Dosya yükleme hatası");
    } finally {
      setUploadingFiles(false);
      if (filesInputRef.current) filesInputRef.current.value = "";
    }
  };

  const clearFiles = () => {
    updateField("files", []);
    updateField("downloadUrl", "");
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...form,
      tags: form.tags.filter((t) => t.trim()),
      languages: form.languages.filter((l) => l.name.trim()),
      images: form.images.filter((i) => i.src.trim()),
      files: form.files,
    };

    try {
      const url = isEdit && initialData?.id ? `/api/projects/${initialData.id}` : "/api/projects";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Kaydetme hatası");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const fileCounts = countFiles(form.files);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          {isEdit ? "Projeyi Düzenle" : "Yeni Proje Ekle"}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Proje bilgilerini doldurun</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Temel Bilgiler */}
        <section className="rounded-lg border border-border bg-bg-secondary p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Temel Bilgiler
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Proje Adı *</label>
              <input type="text" value={form.name} onChange={(e) => { updateField("name", e.target.value); if (!isEdit) { updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")); } }} required placeholder="E-Ticaret Uygulaması" className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue transition-colors" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Slug (URL) *</label>
              <input type="text" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} required placeholder="e-ticaret-uygulamasi" className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue transition-colors" />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Kısa Açıklama *</label>
            <input type="text" value={form.shortDescription} onChange={(e) => updateField("shortDescription", e.target.value)} required placeholder="Modern e-ticaret platformu" className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue transition-colors" />
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Detaylı Açıklama *</label>
            <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} required rows={4} placeholder="Projenin detaylı açıklaması..." className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue transition-colors resize-none" />
          </div>
        </section>

        {/* Geliştirici Bilgileri */}
        <section className="rounded-lg border border-border bg-bg-secondary p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Geliştirici Bilgileri
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">İsim</label>
              <input type="text" value={form.owner.name} onChange={(e) => updateOwner("name", e.target.value)} placeholder="Ali" className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue transition-colors" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Bio</label>
              <input type="text" value={form.owner.bio} onChange={(e) => updateOwner("bio", e.target.value)} placeholder="Full Stack Developer" className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue transition-colors" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">GitHub URL</label>
              <input type="text" value={form.owner.github} onChange={(e) => updateOwner("github", e.target.value)} placeholder="https://github.com/ali" className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue transition-colors" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Avatar URL</label>
              <input type="text" value={form.owner.avatar} onChange={(e) => updateOwner("avatar", e.target.value)} placeholder="/avatar.png" className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue transition-colors" />
            </div>
          </div>
        </section>

        {/* Diller */}
        <section className="rounded-lg border border-border bg-bg-secondary p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
              </svg>
              Diller & Teknolojiler
            </h2>
            <button type="button" onClick={addLanguage} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Ekle
            </button>
          </div>

          <div className="space-y-3">
            {form.languages.map((lang, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <select value={lang.name} onChange={(e) => updateLanguage(i, "name", e.target.value)} className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue transition-colors">
                    <option value="">Dil Seçin</option>
                    {Object.keys(LANGUAGE_COLORS).map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <input type="number" value={lang.percentage} onChange={(e) => updateLanguage(i, "percentage", Number(e.target.value))} min="0" max="100" placeholder="%" className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue transition-colors" />
                </div>
                <div className="w-14">
                  <input type="color" value={lang.color} onChange={(e) => updateLanguage(i, "color", e.target.value)} className="h-9 w-full cursor-pointer rounded border border-border bg-bg-primary" />
                </div>
                <button type="button" onClick={() => removeLanguage(i)} className="rounded-md p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Tags */}
        <section className="rounded-lg border border-border bg-bg-secondary p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              Etiketler
            </h2>
            <button type="button" onClick={addTag} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Ekle
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {form.tags.map((tag, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="text" value={tag} onChange={(e) => updateTag(i, e.target.value)} placeholder="Etiket" className="w-40 rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue transition-colors" />
                <button type="button" onClick={() => removeTag(i)} className="rounded-md p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Görseller (Upload) */}
        <section className="rounded-lg border border-border bg-bg-secondary p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
              Görseller
            </h2>
            <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploadingImages} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors disabled:opacity-50">
              {uploadingImages ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75" /></svg>
                  Yükleniyor...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  Görsel Yükle
                </>
              )}
            </button>
            <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </div>

          {form.images.length === 0 ? (
            <div onClick={() => imageInputRef.current?.click()} className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-10 hover:border-accent-blue/50 hover:bg-bg-tertiary/20 transition-colors">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted mb-3">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-sm text-text-muted">Görsel yüklemek için tıklayın</p>
              <p className="mt-1 text-xs text-text-muted">PNG, JPG, GIF, WebP</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {form.images.map((img, i) => (
                <div key={i} className="group relative overflow-hidden rounded-lg border border-border">
                  <div className="aspect-video bg-bg-primary">
                    <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-2">
                    <input type="text" value={img.alt} onChange={(e) => updateImageAlt(i, e.target.value)} placeholder="Açıklama" className="w-full rounded border border-border bg-bg-primary px-2 py-1 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue" />
                  </div>
                  <button type="button" onClick={() => removeImage(i)} className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              ))}
              <div onClick={() => imageInputRef.current?.click()} className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border aspect-video hover:border-accent-blue/50 hover:bg-bg-tertiary/20 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                <span className="mt-1 text-xs text-text-muted">Ekle</span>
              </div>
            </div>
          )}
        </section>

        {/* Dosya Yapısı (Klasör/Dosya Seç → Sunucuya Yüklenir) */}
        <section className="rounded-lg border border-border bg-bg-secondary p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" />
              </svg>
              Proje Dosyaları
            </h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => folderInputRef.current?.click()} disabled={uploadingFiles} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors disabled:opacity-50">
                {uploadingFiles ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75" /></svg>
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                    Klasör Seç
                  </>
                )}
              </button>
              <button type="button" onClick={() => filesInputRef.current?.click()} disabled={uploadingFiles} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors disabled:opacity-50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                Dosya Seç
              </button>
              {form.files.length > 0 && (
                <button type="button" onClick={clearFiles} className="inline-flex items-center gap-1 rounded-md border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  Temizle
                </button>
              )}
            </div>
            {/* Hidden file inputs */}
            <input
              ref={folderInputRef}
              type="file"
              // @ts-expect-error webkitdirectory is not in standard types
              webkitdirectory=""
              directory=""
              multiple
              onChange={handleFolderSelect}
              className="hidden"
            />
            <input ref={filesInputRef} type="file" multiple onChange={handleFilesSelect} className="hidden" />
          </div>

          <p className="mb-3 text-xs text-text-muted">
            Proje klasörünü seçin — dosyalar sunucuya yüklenecek ve otomatik ZIP oluşturulacak. Ziyaretçiler &ldquo;Projeyi İndir&rdquo; butonu ile dosyaları indirebilecek.
          </p>

          {uploadProgress && (
            <div className="mb-3 flex items-center gap-2 rounded-md border border-accent-blue/30 bg-accent-blue/10 px-3 py-2 text-xs text-accent-blue">
              <svg className="h-3.5 w-3.5 animate-spin flex-shrink-0" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75" /></svg>
              {uploadProgress}
            </div>
          )}

          {form.files.length === 0 && !uploadingFiles ? (
            <div onClick={() => folderInputRef.current?.click()} className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-12 hover:border-accent-blue/50 hover:bg-bg-tertiary/20 transition-colors">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted mb-3">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-sm text-text-muted">Proje klasörünü seçmek için tıklayın</p>
              <p className="mt-1 text-xs text-text-muted">Dosyalar sunucuya yüklenir, ZIP otomatik oluşturulur</p>
            </div>
          ) : form.files.length > 0 ? (
            <div>
              <div className="mb-3 flex items-center gap-4 text-xs text-text-muted">
                <span className="inline-flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                  {fileCounts.folders} klasör
                </span>
                <span className="inline-flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  {fileCounts.files} dosya
                </span>
                {form.downloadUrl && (
                  <span className="inline-flex items-center gap-1 text-accent-green">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    ZIP hazır
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto rounded-md border border-border bg-bg-primary">
                <FileTreePreview nodes={form.files} />
              </div>
            </div>
          ) : null}
        </section>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors">
            İptal
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-accent-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75" /></svg>
                Kaydediliyor...
              </>
            ) : (
              <>{isEdit ? "Güncelle" : "Proje Oluştur"}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
