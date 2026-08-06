"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EntryRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirection automatique vers le tableau de bord rebranded
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-sm font-medium">
      <div className="flex items-center space-x-3">
        <span className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span>Redirection vers Optimus Dev...</span>
      </div>
    </div>
  );
}
