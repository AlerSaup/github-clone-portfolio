import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Project } from "@/types/project";
import ProjectDetail from "@/components/ProjectDetail";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { OR: [{ slug: id }, { id }] },
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
    notFound();
  }

  // Serialize for client component
  const serialized: Project = {
    id: project.id,
    slug: project.slug,
    name: project.name,
    description: project.description,
    shortDescription: project.shortDescription,
    downloadUrl: project.downloadUrl,
    lastUpdated: project.lastUpdated.toISOString(),
    owner: project.owner,
    languages: project.languages,
    tags: project.tags,
    images: project.images,
    files: project.files as Project["files"],
  };

  return <ProjectDetail project={serialized} />;
}
