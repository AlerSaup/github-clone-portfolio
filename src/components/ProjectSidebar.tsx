import { Project } from "@/types/project";

interface Props {
  project: Project;
}

export default function ProjectSidebar({ project }: Props) {
  return (
    <div className="space-y-6">
      {/* About */}
      <div className="rounded-lg border border-border bg-bg-secondary p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-primary flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          Hakkında
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Owner */}
      {project.owner && (
      <div className="rounded-lg border border-border bg-bg-secondary p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-primary flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Geliştirici
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue/20 text-accent-blue font-bold text-sm">
            {project.owner.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-text-primary">
              {project.owner.name}
            </div>
            <div className="text-xs text-text-muted">{project.owner.bio}</div>
          </div>
        </div>
        <a
          href={project.owner.github}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block w-full rounded-md border border-border bg-bg-tertiary px-3 py-1.5 text-center text-xs font-medium text-text-primary hover:border-border-hover transition-colors"
        >
          GitHub Profili
        </a>
      </div>
      )}

      {/* Languages */}
      <div className="rounded-lg border border-border bg-bg-secondary p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-primary flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
          Diller & Teknolojiler
        </h3>

        {/* Language bar */}
        <div className="mb-3 flex h-2.5 overflow-hidden rounded-full bg-bg-tertiary">
          {project.languages.map((lang) => (
            <div
              key={lang.name}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${lang.percentage}%`,
                backgroundColor: lang.color,
              }}
              title={`${lang.name} ${lang.percentage}%`}
            />
          ))}
        </div>

        {/* Language list */}
        <div className="space-y-2">
          {project.languages.map((lang) => (
            <div key={lang.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: lang.color }}
                />
                <span className="text-text-secondary">{lang.name}</span>
              </div>
              <span className="text-text-muted text-xs">{lang.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="rounded-lg border border-border bg-bg-secondary p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-primary flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          Etiketler
        </h3>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag.name}
              className="rounded-full bg-accent-blue/10 border border-accent-blue/20 px-3 py-1 text-xs font-medium text-accent-blue"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="rounded-lg border border-border bg-bg-secondary p-5">
        <h3 className="mb-2 text-sm font-semibold text-text-primary flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Son Güncelleme
        </h3>
        <p className="text-sm text-text-secondary">
          {new Date(project.lastUpdated).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
