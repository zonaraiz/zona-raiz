import { ProfileEntity } from "../entities/profile.entity"
import { AuthPort, SignUpData, OAuthProvider } from "../ports/auth.port"
import { ProfilePort } from "../ports/profile.port"
import { Lang } from "@/i18n/settings"

export class AuthService {
  constructor(
    private readonly auth: AuthPort,
    private readonly profiles: ProfilePort,
    private readonly lang: Lang = "es",
  ) { }

  async signUp(data: SignUpData, redirectTo?: string) {
    return this.auth.signUp(data, redirectTo)
  }

  async signIn(email: string, password: string): Promise<string> {
    const { userId } = await this.auth.signIn(email, password)

    const role = await this.profiles.getRoleByUserId(userId)
    
    return role
  }

  async sendOtp(email: string, redirectTo?: string) {
    return this.auth.sendOtp(email, redirectTo)
  }

  async signOut() {
    return this.auth.signOut()
  }

  async exchangeCodeForSession(token: string): Promise<ProfileEntity> {
    const { userId } = await this.auth.exchangeCodeForSession(token)
    const profile = await this.profiles.getProfileByUserId(userId)
    return profile
  }

  async setSessionFromAccessToken(
    accessToken: string,
    refreshToken: string,
  ): Promise<ProfileEntity> {
    const { userId } = await this.auth.setSessionFromAccessToken(
      accessToken,
      refreshToken,
    )
    const profile = await this.profiles.getProfileByUserId(userId)
    return profile
  }


  async verifyOtp(token: string, type: string): Promise<ProfileEntity> {
    const { userId } = await this.auth.verifyOtp(token, type)
    const profile = await this.profiles.getProfileByUserId(userId)
    return profile
  }

  async signInWithOAuth(provider: OAuthProvider, redirectTo: string): Promise<string> {
    return this.auth.signInWithOAuth(provider, redirectTo)
  }
}
