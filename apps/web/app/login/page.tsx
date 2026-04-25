import { OAuthAuthCard } from "@/components/auth/oauth-auth-card";

export default function LoginPage() {
  return (
    <OAuthAuthCard
      mode="login"
      title="Welcome Back"
      subtitle="Sign in to continue to your dashboard."
    />
  );
}
