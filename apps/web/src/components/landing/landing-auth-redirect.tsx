"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { PageLoading } from "@/components/ui/page-loading";

export function LandingAuthRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/binders");
    }
  }, [loading, router, user]);

  if (loading || user) {
    return <PageLoading />;
  }

  return null;
}
