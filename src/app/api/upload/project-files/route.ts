import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir, rm } from "fs/promises";
import path from "path";
import archiver from "archiver";
import { createWriteStream } from "fs";

// node_modules, .git gibi gereksiz dosyaları filtrele
const IGNORED_DIRS = new Set([
  "node_modules", ".git", ".next", ".nuxt", "dist", "build", "out",
  "__pycache__", ".cache", ".vscode", ".idea", ".DS_Store", "Thumbs.db",
  ".svn", ".hg", "coverage", ".turbo", ".vercel", ".output",
  "vendor", "target", "bin", "obj", ".parcel-cache", ".webpack",
  ".angular", ".expo", "pods", ".gradle", ".dart_tool",
]);

const IGNORED_EXTENSIONS = new Set([
  ".exe", ".dll", ".so", ".dylib", ".o", ".a", ".lib",
  ".pdb", ".map", ".wasm", ".node",
  ".mp4", ".mov", ".avi", ".mkv", ".wmv",
  ".zip", ".tar", ".gz", ".rar", ".7z", ".tgz",
  ".iso", ".img", ".dmg",
  ".jar", ".war", ".class",
  ".pyc", ".pyo",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function shouldIgnore(relativePath: string): boolean {
  const parts = relativePath.split("/");
  return parts.some((p) => IGNORED_DIRS.has(p));
}

function shouldIgnoreFile(filename: string): boolean {
  const dot = filename.lastIndexOf(".");
  if (dot === -1) return false;
  return IGNORED_EXTENSIONS.has(filename.slice(dot).toLowerCase());
}

// Dosya uzantısından dil algılama
const EXT_LANG: Record<string, string> = {
  ts: "TypeScript", tsx: "TypeScript", js: "JavaScript", jsx: "JavaScript",
  mjs: "JavaScript", cjs: "JavaScript", py: "Python", cs: "C#",
  java: "Java", go: "Go", rs: "Rust", cpp: "C++", cc: "C++", c: "C",
  h: "C", hpp: "C++", php: "PHP", rb: "Ruby", swift: "Swift", kt: "Kotlin",
  html: "HTML", htm: "HTML", css: "CSS", scss: "CSS", sass: "CSS",
  less: "CSS", sql: "SQL", json: "JSON", xml: "XML", yaml: "YAML",
  yml: "YAML", md: "Markdown", mdx: "Markdown", prisma: "Prisma",
  sh: "Shell", bash: "Shell", ps1: "PowerShell", dockerfile: "Docker",
  graphql: "GraphQL", toml: "TOML", svg: "SVG", txt: "Text", lock: "Lock",
};

function detectLanguage(name: string): string | undefined {
  const lower = name.toLowerCase();
  if (lower === "dockerfile") return "Docker";
  const ext = lower.split(".").pop();
  if (!ext) return undefined;
  return EXT_LANG[ext];
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

interface FileNode {
  name: string;
  type: "file" | "folder";
  size?: string;
  language?: string;
  children?: FileNode[];
}

function buildTree(
  files: { path: string; size: number }[]
): FileNode[] {
  const root: FileNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        current.push({
          name,
          type: "file",
          size: formatSize(file.size),
          language: detectLanguage(name),
        });
      } else {
        let folder = current.find(
          (f) => f.name === name && f.type === "folder"
        );
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

function sortTree(nodes: FileNode[]): void {
  nodes.sort((a, b) => {
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;
    return a.name.localeCompare(b.name);
  });
  for (const n of nodes) {
    if (n.children) sortTree(n.children);
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const slug = formData.get("slug") as string;

    if (!slug) {
      return NextResponse.json(
        { error: "Proje slug gerekli" },
        { status: 400 }
      );
    }

    const files = formData.getAll("files") as File[];
    const paths = formData.getAll("paths") as string[];

    if (!files.length) {
      return NextResponse.json(
        { error: "Dosya bulunamadı" },
        { status: 400 }
      );
    }

    // Proje dosya dizini oluştur
    const projectDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "projects",
      slug
    );
    // Eski dosyaları temizle
    try {
      await rm(projectDir, { recursive: true, force: true });
    } catch {
      // Klasör yoksa sorun yok
    }
    await mkdir(projectDir, { recursive: true });

    const savedFiles: { path: string; size: number }[] = [];

    // Dosyaları kaydet
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = paths[i] || file.name;

      // Filtreleme (dizin, uzantı, boyut)
      if (shouldIgnore(relativePath)) continue;
      if (shouldIgnoreFile(file.name)) continue;
      if (file.size > MAX_FILE_SIZE || file.size === 0) continue;

      const filePath = path.join(projectDir, relativePath);
      const fileDir = path.dirname(filePath);
      await mkdir(fileDir, { recursive: true });

      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      savedFiles.push({ path: relativePath, size: file.size });
    }

    // ZIP oluştur
    const zipPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "projects",
      `${slug}.zip`
    );

    await new Promise<void>((resolve, reject) => {
      const output = createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 6 } });

      output.on("close", resolve);
      archive.on("error", reject);

      archive.pipe(output);
      archive.directory(projectDir, slug);
      archive.finalize();
    });

    // Ağaç yapısını oluştur
    const tree = buildTree(savedFiles);
    const downloadUrl = `/api/uploads/projects/${slug}.zip`;

    return NextResponse.json({
      tree,
      downloadUrl,
      fileCount: savedFiles.length,
    });
  } catch (error) {
    console.error("Project files upload error:", error);
    return NextResponse.json(
      { error: "Dosyalar yüklenemedi" },
      { status: 500 }
    );
  }
}
