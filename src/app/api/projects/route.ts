import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Tüm projeleri listele (public)
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Projects GET error:", error);
    return NextResponse.json(
      { error: "Projeler yüklenemedi" },
      { status: 500 }
    );
  }
}

// POST - Yeni proje oluştur (admin only)
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const project = await prisma.project.create({
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

    // Dosyaları ayrı oluştur (ağaç yapısı)
    if (body.files && body.files.length > 0) {
      await createFiles(body.files, project.id, null);
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Project create error:", error);
    return NextResponse.json(
      { error: "Proje oluşturulamadı" },
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
