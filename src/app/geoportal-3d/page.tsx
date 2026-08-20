"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Geoportal3DPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/geoportal");
  }, [router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F5F7F4] text-[#17211B]">
      <div className="text-center space-y-2">
        <div className="animate-spin text-3xl">⏳</div>
        <p className="text-sm font-semibold">Redirecionando para o Geoportal Oficial...</p>
      </div>
    </div>
  );
}
