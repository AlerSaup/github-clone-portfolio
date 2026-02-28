import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg-secondary/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-blue/10 border border-accent-blue/20 group-hover:bg-accent-blue/20 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent-blue">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-lg font-semibold text-text-primary">Portfolio</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Ana Sayfa
          </Link>
          <Link
            href="/projects"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Projeler
          </Link>
        </div>
      </div>
    </nav>
  );
}
