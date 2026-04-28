"use client";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Lock, TextAlignJustify, Unlock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRoutes } from "@/i18n/client-router";
import Logo from "../navigation/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CtaButton } from "./button-cta";
import { EUserRole, ProfileEntity } from "@/domain/entities/profile.entity";
import { NavUser } from "../navigation/nav-user";

interface LandingNavProps {
  isAuth: boolean;
  role: EUserRole | null;
  profile?: ProfileEntity | null;
}

type NavigationSection = {
  title: string;
  href: string;
};

const AuthButton = ({
  className,
  href,
  text,
}: {
  className?: string;
  text: string;
  href: string;
}) => (
  <Link href={href}>
    <Button
      className={cn(
        "relative text-sm font-medium rounded-full h-10 p-1 ps-4 pe-12 group transition-all duration-500 hover:ps-12 hover:pe-4 w-fit overflow-hidden hover:bg-primary/80",
        className,
      )}
    >
      <span className="relative z-10 transition-all duration-500 hover:cursor-pointer">
        {text}
      </span>
      <div className="absolute right-1 w-8 h-8 bg-background text-foreground rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-36px)] group-hover:rotate-45">
        <Lock className="group-hover:hidden" size={16} />
        <Unlock className="hidden group-hover:flex" size={16} />
      </div>
    </Button>
  </Link>
);

export function LandingNav({ isAuth, role, profile }: LandingNavProps) {
  const { t } = useTranslation("landing");
  const routes = useRoutes();

  const navigationData: NavigationSection[] = [
    {
      href: routes.home(),
      title: t("nav.home"),
    },

    {
      href: routes.about(),
      title: t("nav.about"),
    },
    {
      href: routes.contact(),
      title: t("nav.contact"),
    },
  ];

  if (role === EUserRole.Admin || role === EUserRole.RealEstate) {
    navigationData.push({
      href: isAuth ? routes.dashboard() : routes.signin(),
      title: isAuth ? t("nav.dashboard") : t("nav.login"),
    });
  }

  const [sticky, setSticky] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const handleScroll = useCallback(() => {
    setSticky(window.scrollY >= 50);
  }, []);

  const handleResize = useCallback(() => {
    if (window.innerWidth >= 768) setIsOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleScroll, handleResize]);

  return (
    <div>
      <header className="bg-background border-b-2 border-primary">
        <div className="max-w-7xl mx-auto w-full px-4 py-4 sm:px-6">
          <nav
            className={cn(
              "w-full flex items-center h-fit justify-between gap-3.5 lg:gap-6 transition-all duration-500",
              sticky
                ? "p-2.5 bg-background/60 backdrop-blur-lg border border-border/40 shadow-2xl shadow-primary/5 rounded-full"
                : "bg-transparent border-transparent",
            )}
          >
            <Link href={routes.home()}>
              <Logo />
            </Link>
            <div>
              <NavigationMenu className="max-lg:hidden  p-0.5 rounded-full">
                <NavigationMenuList className="flex gap-0">
                  {navigationData.map((navItem, key) => (
                    <NavigationMenuItem key={key}>
                      <NavigationMenuContent>
                        <NavigationMenuLink>
                          <Link href={navItem.href}>{navItem.title}</Link>
                        </NavigationMenuLink>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <div className="flex space-x-1">
              <CtaButton
                text={t("nav.cta")}
                href={routes.search()}
                className="hidden lg:flex"
              />
              {isAuth && profile ? (
                <div className="hidden lg:flex">
                  <NavUser profile={profile} />
                </div>
              ) : (
                (role === EUserRole.Admin || role === EUserRole.RealEstate) && (
                  <AuthButton
                    text={isAuth ? t("nav.dashboard") : t("nav.login")}
                    href={isAuth ? routes.onboarding() : routes.signin()}
                    className="hidden lg:flex"
                  />
                )
              )}
            </div>
            <div className="lg:hidden">
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger className="rounded-full bg-background border border-border p-2 outline-none flex items-center justify-center cursor-pointer transition-colors">
                  <TextAlignJustify size={20} />
                  <span className="sr-only">Menu</span>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 mt-2">
                  {navigationData.map((item) => (
                    <DropdownMenuItem key={item.title}>
                      <Link
                        href={item.href}
                        className="w-full cursor-pointer text-sm font-medium"
                      >
                        {item.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  {isAuth && profile && (
                    <>
                      <DropdownMenuSeparator />
                      <Link href={routes.profile()}>
                        <DropdownMenuItem className="cursor-pointer text-sm font-medium">
                          {profile.full_name}
                        </DropdownMenuItem>
                      </Link>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </div>
      </header>
    </div>
  );
}
