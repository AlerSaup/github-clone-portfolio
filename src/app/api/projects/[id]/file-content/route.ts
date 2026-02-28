import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

// Okunabilir (metin) dosya uzantıları
const TEXT_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".py", ".cs", ".java", ".go", ".rs", ".cpp", ".cc", ".c", ".h", ".hpp",
  ".php", ".rb", ".swift", ".kt", ".scala", ".lua", ".r",
  ".html", ".htm", ".css", ".scss", ".sass", ".less",
  ".sql", ".json", ".xml", ".yaml", ".yml", ".toml", ".ini", ".cfg",
  ".md", ".mdx", ".txt", ".csv", ".log",
  ".sh", ".bash", ".zsh", ".ps1", ".bat", ".cmd",
  ".dockerfile", ".graphql", ".gql", ".prisma",
  ".env", ".gitignore", ".eslintrc", ".prettierrc", ".editorconfig",
  ".svelte", ".vue", ".astro",
  ".lock", ".conf", ".nginx", ".htaccess",
  ".makefile", ".cmake",
]);

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB max okuma

function isTextFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  // Uzantısız özel dosyalar
  if (["dockerfile", "makefile", "rakefile", "gemfile", "procfile", ".gitignore", ".env"].includes(lower)) {
    return true;
  }
  const dot = lower.lastIndexOf(".");
  if (dot === -1) return false;
  return TEXT_EXTENSIONS.has(lower.slice(dot));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: slug } = await params;
  const filePath = request.nextUrl.searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Dosya yolu gerekli" }, { status: 400 });
  }

  // Path traversal koruması
  const normalized = path.normalize(filePath).replace(/\\/g, "/");
  if (normalized.includes("..") || normalized.startsWith("/")) {
    return NextResponse.json({ error: "Geçersiz dosya yolu" }, { status: 400 });
  }

  const fullPath = path.join(process.cwd(), "public", "uploads", "projects", slug, normalized);

  // Güvenlik: dosyanın proje dizini içinde olduğundan emin ol
  const projectDir = path.join(process.cwd(), "public", "uploads", "projects", slug);
  if (!fullPath.startsWith(projectDir)) {
    return NextResponse.json({ error: "Geçersiz dosya yolu" }, { status: 400 });
  }

  try {
    const fileStat = await stat(fullPath);

    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "Bu bir dosya değil" }, { status: 400 });
    }

    const filename = path.basename(fullPath);

    if (!isTextFile(filename)) {
      return NextResponse.json({
        content: null,
        binary: true,
        filename,
        size: fileStat.size,
      });
    }

    if (fileStat.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        content: null,
        tooLarge: true,
        filename,
        size: fileStat.size,
      });
    }

    const content = await readFile(fullPath, "utf-8");
    const lineCount = content.split("\n").length;

    return NextResponse.json({
      content,
      filename,
      size: fileStat.size,
      lineCount,
      binary: false,
      tooLarge: false,
    });
  } catch {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 });
  }
}
