"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/contexts/auth-context";

export default function RegisterPage() {
  const { register } = useAuth();

  return (
    <AuthForm
      title="Create account"
      submitLabel="Create account"
      alternateHref="/login"
      alternateLabel="Already have an account? Sign in"
      passwordAutoComplete="new-password"
      onSubmit={register}
    />
  );
}
