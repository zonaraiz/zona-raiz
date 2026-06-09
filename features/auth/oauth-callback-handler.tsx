"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRoutes } from "@/i18n/client-router";

/**
 * Componente que maneja el callback de OAuth desde Supabase.
 * 
 * Este componente se monta en la página de sign-in y procesa los tokens
 * que Supabase devuelve en el hash de la URL después del flujo OAuth.
 * 
 * El problema que resuelve:
 * - Supabase redirige a una ruta como /es/auth/login?error=Token%20faltante#access_token=...
 * - El componente GoogleAuth NO está en esa ruta, así que el hash nunca se procesa
 * 
 * Solución:
 * - Al cargar, detectar si hay access_token en el hash
 * - Redirigir a /es/auth/callback con los tokens como query params
 * - Limpiar el hash de la URL después de procesar
 */
export default function OAuthCallbackHandler() {
  const router = useRouter();
  const routes = useRoutes();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Evitar procesamiento multiple
    if (isProcessing) return;

    // Parsear el hash de la URL
    const hash = window.location.hash.slice(1); // Quitar #
    if (!hash) return;

    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    // Si hay tokens en el hash, redirigir al callback
    if (accessToken || refreshToken) {
      setIsProcessing(true);

      const url = new URL(routes.callback(), window.location.origin);
      if (accessToken) url.searchParams.set("access_token", accessToken);
      if (refreshToken) url.searchParams.set("refresh_token", refreshToken);

      // Limpiar el hash de la URL actual antes de redirigir
      const cleanPath = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", cleanPath);

      // Redirigir al callback
      router.push(url.toString());
    }
  }, [router, routes, isProcessing]);

  // Este componente no renderiza nada visible
  return null;
}
