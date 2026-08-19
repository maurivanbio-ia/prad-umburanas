"use client";

import React, { useState, useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import MapViewer3D from "@/components/MapViewer3D";

export default function Geoportal3DPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula o tempo de carregamento da nuvem de pontos pesada (ex: 3 segundos)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="h-screen w-full overflow-hidden bg-[#111111]">
      {isLoading ? <LoadingScreen /> : <MapViewer3D />}
    </main>
  );
}
