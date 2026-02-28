import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Tek proje getir (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const project = await prisma.project.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        owner: true,
        languages: true,
        tags: true,
        images: { orderBy: { order: "asc" } },
        files: {
          where: { parentId: null },
          include: {
            children: {
              include: {
                children: {
                  include: {
                    children: true,
                  },
                },
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Proje bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Project GET error:", error);
    return NextResponse.json(
      { error: "Proje yüklenemedi" },
      { status: 500 }
    );
  }
}

// PUT - Proje güncelle (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    // Mevcut ilişkili verileri sil
    await prisma.language.deleteMany({ where: { projectId: id } });
    await prisma.tag.deleteMany({ where: { projectId: id } });
    await prisma.image.deleteMany({ where: { projectId: id } });
    await prisma.file.deleteMany({ where: { projectId: id } });
    await prisma.owner.deleteMany({ where: { projectId: id } });

    // Projeyi güncelle
    const project = await prisma.project.update({
      where: { id },
      data: {
        slug: body.slug,
        name: body.name,
        description: body.description,
        shortDescription: body.shortDescription,
        downloadUrl: body.downloadUrl || null,
        lastUpdated: new Date(),
        owner: body.owner
          ? {
              create: {
                name: body.owner.name,
                avatar: body.owner.avatar || "",
                github: body.owner.github || "",
                bio: body.owner.bio || "",
              },
            }
          : undefined,
        languages: {
          create: (body.languages || []).map(
            (lang: { name: string; percentage: number; color: string }) => ({
              name: lang.name,
              percentage: lang.percentage,
              color: lang.color,
            })
          ),
        },
        tags: {
          create: (body.tags || []).map((tag: string) => ({
            name: tag,
          })),
        },
        images: {
          create: (body.images || []).map(
            (img: { src: string; alt: string }, i: number) => ({
              src: img.src,
              alt: img.alt,
              order: i,
            })
          ),
        },
      },
      include: {
        owner: true,
        languages: true,
        tags: true,
        images: true,
        files: true,
      },
    });

    // Dosyaları oluştur
    if (body.files && body.files.length > 0) {
      await createFiles(body.files, project.id, null);
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Project update error:", error);
    return NextResponse.json(
      { error: "Proje güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Proje sil (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Project delete error:", error);
    return NextResponse.json(
      { error: "Proje silinemedi" },
      { status: 500 }
    );
  }
}

async function createFiles(
  files: Array<{
    name: string;
    type: string;
    size?: string;
    language?: string;
    children?: Array<unknown>;
  }>,
  projectId: string,
  parentId: string | null
) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const created = await prisma.file.create({
      data: {
        name: file.name,
        type: file.type,
        size: file.size || null,
        language: file.language || null,
        order: i,
        projectId,
        parentId,
      },
    });

    if (file.children && file.children.length > 0) {
      await createFiles(
        file.children as typeof files,
        projectId,
        created.id
      );
    }
  }
}
