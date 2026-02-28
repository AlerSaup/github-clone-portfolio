"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProjectForm from "@/components/ProjectForm";

export default function NewProjectPage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then((res) => {
      if (!res.ok) router.push("/admin/login");
    });
  }, [router]);

  return <ProjectForm />;
}
