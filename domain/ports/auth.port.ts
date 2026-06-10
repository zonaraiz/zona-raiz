export type SignUpData = {
  email: string
  password: string
  full_name: string
  phone: string
  type_register?: boolean
}

export type OAuthProvider = "google" | "apple" | "facebook" | "github" | "twitter"

export interface AuthPort {
  signIn(email: string, password: string): Promise<{ userId: string }>
  signUp(data: SignUpData, redirectTo?: string): Promise<void>
  sendOtp(email: string, redirectTo?: string): Promise<void>
  exchangeCodeForSession(token: string): Promise<{ userId: string }>
  setSessionFromAccessToken(accessToken: string, refreshToken: string): Promise<{ userId: string }>
  verifyOtp(token: string, type: string): Promise<{ userId: string }>
  signOut(): Promise<void>
  signInWithOAuth(provider: OAuthProvider, redirectTo: string): Promise<string>
}
