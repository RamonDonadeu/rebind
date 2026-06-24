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
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[var(--background)]">
      <header className="shrink-0 border-b border-zinc-800 bg-zinc-900/50">
        <div
          className={`mx-auto flex min-w-0 ${containerClass} items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4`}
        >
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <Link href="/binders" className="shrink-0 text-sm font-semibold tracking-wide text-brand-500">
              ReBind
            </Link>
            <nav className="hidden sm:block">
              <Link
                href="/binders"
                className="text-sm text-zinc-300 transition hover:text-white"
              >
                Binders
              </Link>
            </nav>
          </div>

          {user && (
            <div className="flex shrink-0 items-center gap-3 sm:gap-4">
              <div className="hidden text-right text-sm sm:block">
                <p className="text-zinc-200">{user.email}</p>
                <p className="text-xs capitalize text-zinc-500">{user.planTier} plan</p>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="shrink-0 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white sm:px-3"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      <main
        className={`mx-auto flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col ${containerClass} px-4 py-4 sm:px-6 sm:py-8`}
      >
        {children}
      </main>
    </div>
  );
}
