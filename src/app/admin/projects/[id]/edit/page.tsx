"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProjectForm from "@/components/ProjectForm";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then((res) => {
      if (!res.ok) router.push("/admin/login");
    });
  }, [router]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${params.id}`);
        if (!res.ok) {
          router.push("/admin");
          return;
        }
        const data = await res.json();

        // Flatten data for form
        setInitialData({
          id: data.id,
          slug: data.slug,
          name: data.name,
          description: data.description,
          shortDescription: data.shortDescription,
          downloadUrl: data.downloadUrl || "",
          owner: data.owner
            ? {
                name: data.owner.name,
                avatar: data.owner.avatar,
                github: data.owner.github,
                bio: data.owner.bio,
              }
            : { name: "", avatar: "", github: "", bio: "" },
          languages: data.languages.map((l: { name: string; percentage: number; color: string }) => ({
            name: l.name,
            percentage: l.percentage,
            color: l.color,
          })),
          tags: data.tags.map((t: { name: string }) => t.name),
          images: data.images.map((i: { src: string; alt: string }) => ({
            src: i.src,
            alt: i.alt,
          })),
          files: flattenFiles(data.files),
        });
      } catch {
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchProject();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex items-center gap-3 text-text-secondary">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75" />
          </svg>
          Yükleniyor...
        </div>
      </div>
    );
  }

  if (!initialData) return null;

  return <ProjectForm initialData={initialData} isEdit />;
}

interface FileNode {
  name: string;
  type: string;
  size?: string;
  language?: string;
  children?: FileNode[];
}

function flattenFiles(files: FileNode[]): FileNode[] {
  return files.map((f) => ({
    name: f.name,
    type: f.type,
    size: f.size,
    language: f.language,
    children: f.children ? flattenFiles(f.children) : undefined,
  }));
}
