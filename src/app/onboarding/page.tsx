"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/goals/new");
  }, [router]);

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="animate-pulse text-accent-gold text-sm font-serif">
        Redirecting to Goals...
      </div>
    </div>
  );
}
