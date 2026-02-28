export interface ProjectImage {
  id?: string;
  src: string;
  alt: string;
}

export interface ProjectFile {
  id?: string;
  name: string;
  type: "file" | "folder";
  size?: string | null;
  language?: string | null;
  children?: ProjectFile[];
}

export interface Language {
  id?: string;
  name: string;
  percentage: number;
  color: string;
}

export interface Owner {
  id?: string;
  name: string;
  avatar: string;
  github: string;
  bio: string;
}

export interface Tag {
  id?: string;
  name: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  downloadUrl?: string | null;
  owner: Owner | null;
  languages: Language[];
  tags: Tag[];
  lastUpdated: string;
  images: ProjectImage[];
  files: ProjectFile[];
}
