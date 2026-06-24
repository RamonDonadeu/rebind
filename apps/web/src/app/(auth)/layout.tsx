"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { PageLoading } from "@/components/ui/page-loading";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/binders");
    }
  }, [loading, router, user]);

  if (loading) {
    return <PageLoading />;
  }

  if (user) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">{children}</main>
  );
}
