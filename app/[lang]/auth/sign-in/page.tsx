import { SignInForm } from "@/features/auth/sign-in-form";
import OAuthCallbackHandler from "@/features/auth/oauth-callback-handler";

export const dynamic = "force-dynamic";

export default function page() {
  return (
    <>
      <OAuthCallbackHandler />
      <SignInForm />
    </>
  );
}