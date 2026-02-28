import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".bmp": "image/bmp",
  ".zip": "application/zip",
  ".rar": "application/x-rar-compressed",
  ".7z": "application/x-7z-compressed",
  ".tar": "application/x-tar",
  ".gz": "application/gzip",
  ".pdf": "application/pdf",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const relativePath = segments.join("/");

  // Path traversal koruması
  const normalized = path.normalize(relativePath).replace(/\\/g, "/");
  if (normalized.includes("..") || normalized.startsWith("/")) {
    return NextResponse.json({ error: "Geçersiz yol" }, { status: 400 });
  }

  const fullPath = path.join(process.cwd(), "public", "uploads", normalized);

  // Güvenlik: uploads dizini dışına çıkılmasın
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fullPath.startsWith(uploadsDir)) {
    return NextResponse.json({ error: "Geçersiz yol" }, { status: 400 });
  }

  try {
    const fileStat = await stat(fullPath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "Dosya değil" }, { status: 404 });
    }

    const buffer = await readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 });
  }
}
