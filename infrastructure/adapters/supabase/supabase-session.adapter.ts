import { ProfileEntity } from "@/domain/entities/profile.entity";
import {
  RealEstateEntity,
  RealEstateWithRoleEntity,
} from "@/domain/entities/real-estate.entity";
import { EAgentRole } from "@/domain/entities/real-estate-agent.entity";
import { ProfilePort } from "@/domain/ports/profile.port";
import { SessionPort } from "@/domain/ports/sesion.port";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseSessionAdapter implements SessionPort {
  constructor(
    private supabase: SupabaseClient,
    private profileRepository: ProfilePort,
  ) {}

  private cachedUserId?: string | null;
  private cachedProfile?: ProfileEntity | null;

  async isAuth(): Promise<boolean> {
    const {
      data: { session },
      error,
    } = await this.supabase.auth.getSession();

    if (error) return false;
    return !!session;
  }

  async getCurrentUserId(): Promise<string | null> {
    if (this.cachedUserId !== undefined) {
      return this.cachedUserId;
    }

    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    if (error) {
      this.cachedUserId = null; // cache the null so we don't retry
      return null; // not authenticated, not an error
    }

    this.cachedUserId = !user ? null : user.id;
    return this.cachedUserId;
  }

  async getCurrentUser(): Promise<ProfileEntity | null> {
    if (this.cachedProfile !== undefined) {
      return this.cachedProfile;
    }

    const userId = await this.getCurrentUserId();

    if (!userId) {
      this.cachedProfile = null;
      return null;
    }

    this.cachedProfile =
      await this.profileRepository.getProfileByUserId(userId);
    return this.cachedProfile;
  }

  async getRealEstatesForUser(): Promise<RealEstateWithRoleEntity[]> {
    const userId = await this.getCurrentUserId();

    const { data, error } = await this.supabase
      .from("real_estate_agents")
      .select(
        `
          role,
          real_estates (
            id,
            name,
            description,
            whatsapp,
            street,
            city,
            state,
            postal_code,
            country,
            logo_url,
            created_at,
            updated_at
          )
      `,
      )
      .eq("profile_id", userId);
    if (error) throw new Error(error.message);

    type RealEstateAgentRow = {
      role: EAgentRole;
      real_estates: RealEstateEntity | RealEstateEntity[] | null;
    };

    return (data as RealEstateAgentRow[]).flatMap((item) => {
      const realEstate = Array.isArray(item.real_estates)
        ? item.real_estates[0]
        : item.real_estates;

      if (!realEstate) {
        return [];
      }

      return {
        real_estate: realEstate,
        role: item.role,
      };
    });
  }

  async getCurrentRealEstateId(): Promise<string | null> {
    const cookieStore = await import("next/headers").then((m) => m.cookies());
    const cookie = cookieStore.get("real_estate_id");
    return cookie?.value || null;
  }
}
