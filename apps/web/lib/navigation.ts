import { useState, useEffect } from "react";

/**
 * Retourne l'URL officielle ou dynamique de l'application Optimus Dev.
 * Utilisable dans un contexte non-React (comme les scripts ou configurations).
 */
export function getOptimusDevUrl(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_OPTIMUS_DEV_URL) {
    return process.env.NEXT_PUBLIC_OPTIMUS_DEV_URL;
  }

  if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
    return "http://localhost:5173";
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5173";
    }
  }

  return "https://dev.optimus.dev";
}

/**
 * Hook React retournant l'URL d'Optimus Dev de manière sécurisée sans causer de problème d'hydratation (SSR).
 */
export function useOptimusDevUrl(): string {
  const [url, setUrl] = useState(() => {
    if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_OPTIMUS_DEV_URL) {
      return process.env.NEXT_PUBLIC_OPTIMUS_DEV_URL;
    }
    if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
      return "http://localhost:5173";
    }
    return "https://dev.optimus.dev";
  });

  useEffect(() => {
    if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_OPTIMUS_DEV_URL) {
      return;
    }
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        setUrl("http://localhost:5173");
      } else {
        setUrl("https://dev.optimus.dev");
      }
    }
  }, []);

  return url;
}
