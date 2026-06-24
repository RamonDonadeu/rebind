"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <AuthForm
      title="Sign in"
      submitLabel="Sign in"
      alternateHref="/register"
      alternateLabel="Create an account"
      onSubmit={login}
    />
  );
}
