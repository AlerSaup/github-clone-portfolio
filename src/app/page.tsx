import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projectCount = await prisma.project.count();
  const languages = await prisma.language.findMany({ distinct: ["name"] });

  return (
    <div className="flex flex-col items-center justify-center px-4 py-32">
      <div className="max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-text-secondary">
          <span className="inline-block h-2 w-2 rounded-full bg-accent-green animate-pulse"></span>
          Portfolyo Sitesi
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-text-primary sm:text-6xl">
          Merhaba, ben{" "}
          <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
            Ali
          </span>
        </h1>

        <p className="mb-10 text-lg leading-relaxed text-text-secondary">
          Full Stack Developer olarak geliştirdiğim projeleri burada sergiliyorum.
          Projelerimi inceleyebilir, kullandığım teknolojileri ve dosya yapılarını görebilirsiniz.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-6 py-3 text-sm font-semibold text-white hover:bg-accent-blue/90 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            Projelerimi Gör
          </Link>
          <a
            href="https://github.com/ali"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text-primary hover:border-border-hover hover:bg-bg-secondary transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-2 gap-8 border-t border-border pt-10">
        <div className="text-center">
          <div className="text-3xl font-bold text-text-primary">{projectCount}</div>
          <div className="mt-1 text-sm text-text-secondary">Proje</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-text-primary">{languages.length}</div>
          <div className="mt-1 text-sm text-text-secondary">Teknoloji</div>
        </div>
      </div>
    </div>
  );
}
