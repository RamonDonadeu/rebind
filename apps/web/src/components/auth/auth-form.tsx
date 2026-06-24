"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ApiClientError } from "@/lib/api-client";

type AuthFormProps = {
  title: string;
  submitLabel: string;
  alternateHref: string;
  alternateLabel: string;
  passwordAutoComplete?: "current-password" | "new-password";
  onSubmit: (email: string, password: string) => Promise<void>;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthForm({
  title,
  submitLabel,
  alternateHref,
  alternateLabel,
  passwordAutoComplete = "current-password",
  onSubmit,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(email, password);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-500">ReBind</p>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>

      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-zinc-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-brand-500 focus:border-brand-500 focus:ring-1"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm text-zinc-400">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={passwordAutoComplete}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-brand-500 focus:border-brand-500 focus:ring-1"
            minLength={8}
            required
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Please wait…" : submitLabel}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href={alternateHref} className="text-zinc-300 hover:text-white">
          {alternateLabel}
        </Link>
      </p>
    </div>
  );
}
