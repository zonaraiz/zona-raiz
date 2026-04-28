import { SupabaseClient } from "@supabase/supabase-js";
import { AuthPort, SignUpData, OAuthProvider } from "@/domain/ports/auth.port";
import { EUserRole } from "@/domain/entities/profile.entity";
import { SupabaseAdminClient } from "@/infrastructure/db/supabase.server-admin";

export class SupabaseAuthAdapter implements AuthPort {
  constructor(private readonly supabase: SupabaseClient) {}

  async signUp(input: SignUpData) {
    const { error, data } = await this.supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.full_name,
          phone: input.phone,
          // Role is set via trigger based on type_register boolean in metadata
          role: input.type_register ? EUserRole.RealEstate : EUserRole.Client,
        },
      },
    });

    if (error) {
      if (error.message.includes("user_already_exists")) {
        throw new Error("Email already registered");
      }
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Registration failed");
    }

    // Profile is created automatically via trigger handle_new_user()
    // No manual profile update needed - the trigger handles role assignment
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("User not found");

    return { userId: data.user.id };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async sendOtp(email: string) {
    const { error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    });
    if (error) throw error;
  }

  async exchangeCodeForSession(token: string): Promise<{ userId: string }> {
    const { data, error } =
      await this.supabase.auth.exchangeCodeForSession(token);

    if (error) throw error;

    if (!data.user) throw new Error("User not found");

    return { userId: data.user.id };
  }

  async setSessionFromAccessToken(
    accessToken: string,
    refreshToken: string,
  ): Promise<{ userId: string }> {
    const { data, error } = await this.supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) throw error;

    if (!data.user) throw new Error("User not found");

    return { userId: data.user.id };
  }

  async verifyOtp(
    token: string,
    type: "signup" | "recovery" | "email_change" | "email",
  ): Promise<{ userId: string }> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.verifyOtp({
      type: type as "signup" | "recovery" | "email_change" | "email",
      token_hash: token,
    });
    if (error) throw error;

    if (!user) throw new Error("User not found");

    return { userId: user.id };
  }

  async signInWithOAuth(
    provider: OAuthProvider,
    redirectTo: string,
  ): Promise<string> {

    // Extract the role from redirectTo URL params if present
    const url = new URL(redirectTo);
    const userRole = url.searchParams.get("role");

    // Use state parameter to preserve the role through the OAuth flow
    // This is more reliable than URL query params which might get lost during redirects
    const state = userRole
      ? Buffer.from(JSON.stringify({ user_type: userRole })).toString("base64")
      : undefined;

    // Clean the redirectTo URL (remove role param since we're passing it via state)
    const cleanRedirectTo = url.origin + url.pathname;

    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        skipBrowserRedirect: true,
        redirectTo: cleanRedirectTo,
        scopes: "email profile openid",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        ...(state && { state }),
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error("OAuth failed to generate redirect URL");

    return data.url;
  }
}
