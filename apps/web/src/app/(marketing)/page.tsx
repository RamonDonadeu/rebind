import { LandingAuthRedirect } from "@/components/landing/landing-auth-redirect";
import { LandingPage } from "@/components/landing/landing-page";

export default function HomePage() {
  return (
    <>
      <LandingAuthRedirect />
      <LandingPage />
    </>
  );
}
