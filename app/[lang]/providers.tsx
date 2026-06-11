"use client";

import { ThemeProvider } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppToaster from "@/components/ui/toast";
import { ReactNode } from "react";
import { I18nProvider } from "@/i18n/provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  const clientIdGoogle = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const content = (
    <>
      <AppToaster />
      <TooltipProvider>{children}</TooltipProvider>
    </>
  );

  return (
    <I18nProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {clientIdGoogle ? (
          <GoogleOAuthProvider clientId={clientIdGoogle}>
            {content}
          </GoogleOAuthProvider>
        ) : (
          content
        )}
      </ThemeProvider>
    </I18nProvider>
  );
}
