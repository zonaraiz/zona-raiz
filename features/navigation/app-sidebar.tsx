"use client";

import * as React from "react";
import { NavMain } from "@/features/navigation/nav-main";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { IconName } from "lucide-react/dynamic";
import { ProfileEntity } from "@/domain/entities/profile.entity";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { FavoritesList } from "@/features/favorites/favorites-list";
import { ListingEntity } from "@/domain/entities/listing.entity";
import { EUserRole } from "@/domain/entities/profile.entity";
import Logo from "@/assets/svg/logo";
import { DropwdownMenuUser } from "./dropdow-menu-user";
import { useRoutes } from "@/i18n/client-router";

interface FavoriteWithListing {
  id: string;
  listing_id: string;
  created_at: string;
  listing?: ListingEntity;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  profile: ProfileEntity;
  menu: {
    title: string;
    url: string;
    icon?: IconName | string;
  }[];
  favorites?: FavoriteWithListing[];
  showCreateProperty?: boolean;
}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { t } = useTranslation("common");
  const routes = useRoutes();
  const favorites = props.favorites || [];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="p-3 group-data-[collapsible=icon]:p-0">
          <Link
            href={routes.home()}
            className="flex items-center gap-3 rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="size-10 group-data-[collapsible=icon]:size-9 p-2 rounded-xl bg-linear-to-br from-gray-900 to-gray-700 flex items-center justify-center">
              <Logo />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground group-data-[collapsible=icon]:hidden">
                <span className="text-base font-semibold">Zonaraíz</span>
              </h1>
              <p className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                {t("words.dashboard")}
              </p>
            </div>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={props.menu}
          showCreateProperty={
            props.showCreateProperty ?? props.profile.role !== EUserRole.Client
          }
        />
        <Separator className="my-2" />
        <FavoritesList favorites={favorites} />
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropwdownMenuUser profile={props.profile} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
