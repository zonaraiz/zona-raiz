"use client";

import { IconCirclePlusFilled } from "@tabler/icons-react";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useIsCurrentRoute } from "@/hooks/use-is-current-route";
import { useTranslation } from "react-i18next";
import { useRoutes } from "@/i18n/client-router";

interface Items {
  title: string;
  url: string;
  icon?: IconName | string;
}

export const RenderMenu = ({ items }: { items: Items[] }) => {
  const isCurrentRoute = useIsCurrentRoute();

  return items?.map((item) => {
    const isActive = isCurrentRoute(item.url);
    return (
      <Link key={item.title} href={item.url} className="font-medium ">
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip={item.title}
            className={cn(
              "w-full cursor-pointer flex items-center gap-3 px-4 py-6 rounded-xl transition-all duration-200",
              "hover:bg-secondary active:scale-[0.98]",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.icon && (
              <DynamicIcon
                name={item.icon as IconName}
                className={cn("w-5 h-5", isActive && "scale-110")}
                strokeWidth={isActive ? 2.5 : 2}
              />
            )}
            <span className="capitalize">{item.title}</span>
            {isActive && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </Link>
    );
  });
};

export function NavMain({
  items,
  showCreateProperty = true,
}: {
  items: Items[];
  showCreateProperty?: boolean;
}) {
  const { t } = useTranslation("common");
  const routes = useRoutes();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {showCreateProperty ? (
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <Link href={routes.newProperty()}>
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                >
                  <IconCirclePlusFilled />
                  <span>{t("actions.create_property")}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : null}
        <SidebarMenu>
          <RenderMenu items={items} />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
