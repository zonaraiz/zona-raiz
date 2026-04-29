"use client";

import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile"
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ProfileEntity } from "@/domain/entities/profile.entity";
import { signOutAction } from "@/application/actions/auth.actions";
import { useTranslation } from "react-i18next";
import { useRoutes } from "@/i18n/client-router";
import { Button } from "@/components/ui/button";

export function DropwdownMenuUser({ profile }: { profile: ProfileEntity }) {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  const router = useRouter();
  const routes = useRoutes();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await signOutAction();
        router.push(routes.signin());
      } catch (err) {
        console.error("Sign out failed:", err);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          className="rounded-full items-center justify-start p-5 bg-secondary"
        >
          <Avatar className="size-7 rounded-full">
            <AvatarImage
              src={profile?.avatar_url || ""}
              alt={profile?.full_name || "User"}
            />
            <AvatarFallback className="rounded-lg">
              {profile?.full_name?.substring(0, 2).toUpperCase() || "CN"}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {profile?.full_name || "User"}
            </span>
          </div>
          <IconDotsVertical className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={profile?.avatar_url || ""}
                alt={profile?.full_name || "User"}
              />
              <AvatarFallback className="rounded-lg">
                {profile?.full_name?.substring(0, 2).toUpperCase() || "CN"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {profile?.full_name || "User"}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={routes.profile()}>
            <DropdownMenuItem className="capitalize">
              <IconUserCircle />
              {t("words.profile")}
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isPending}
          className="capitalize"
        >
          <IconLogout />
          {t("words.sign_out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
