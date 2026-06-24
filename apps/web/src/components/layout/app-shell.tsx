"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";

function useWideBinderLayout(): boolean {
  const pathname = usePathname();
  return /^\/binders\/[^/]+$/.test(pathname);
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const wideLayout = useWideBinderLayout();
  const containerClass = wideLayout ? "max-w-full" : "max-w-5xl";

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <header className="shrink-0 border-b border-zinc-800 bg-zinc-900/50">
        <div className={`mx-auto flex ${containerClass} items-center justify-between gap-4 px-6 py-4`}>
          <div className="flex items-center gap-6">
            <Link href="/binders" className="text-sm font-semibold tracking-wide text-brand-500">
              ReBind
            </Link>
            <nav>
              <Link
                href="/binders"
                className="text-sm text-zinc-300 transition hover:text-white"
              >
                Binders
              </Link>
            </nav>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <p className="text-zinc-200">{user.email}</p>
                <p className="text-xs capitalize text-zinc-500">{user.planTier} plan</p>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className={`mx-auto flex min-h-0 w-full flex-1 flex-col ${containerClass} px-6 py-8`}>{children}</main>
    </div>
  );
}
