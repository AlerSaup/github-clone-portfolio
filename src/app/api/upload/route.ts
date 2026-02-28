import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "images");
    await mkdir(uploadDir, { recursive: true });

    const uploaded: { url: string; filename: string; alt: string }[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Benzersiz dosya adı oluştur
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const ext = path.extname(file.name);
      const safeName = file.name
        .replace(ext, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 50);
      const filename = `${timestamp}-${random}-${safeName}${ext}`;

      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      uploaded.push({
        url: `/api/uploads/images/${filename}`,
        filename: file.name,
        alt: file.name.replace(ext, "").replace(/[-_]/g, " "),
      });
    }

    return NextResponse.json({ files: uploaded });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Dosya yüklenemedi" },
      { status: 500 }
    );
  }
}
