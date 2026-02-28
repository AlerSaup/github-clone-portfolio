import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      languages: true,
      tags: true,
      images: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Projelerim</h1>
        <p className="text-text-secondary">
          Geliştirdiğim projeleri buradan inceleyebilirsiniz.
        </p>
      </div>

      {/* Project List */}
      {projects.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-secondary p-12 text-center">
          <p className="text-text-secondary">Henüz proje eklenmemiş.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group block rounded-lg border border-border bg-bg-secondary p-6 hover:border-border-hover transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-text-muted">
                      <path d="M3 3h7l2 2h9v15H3V3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h2 className="text-xl font-semibold text-accent-blue group-hover:underline">
                      {project.name}
                    </h2>
                  </div>

                  <p className="text-sm text-text-secondary mb-4 ml-8">
                    {project.shortDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 ml-8">
                    {project.languages.slice(0, 3).map((lang) => (
                      <div key={lang.id} className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: lang.color }}
                        />
                        {lang.name}
                      </div>
                    ))}

                    {project.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full bg-accent-blue/10 px-2.5 py-0.5 text-xs font-medium text-accent-blue"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-text-muted group-hover:text-text-primary group-hover:translate-x-1 transition-all mt-1 flex-shrink-0"
                >
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
