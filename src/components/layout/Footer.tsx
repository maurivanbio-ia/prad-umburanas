'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#121812] text-white/80 text-xs py-3 px-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 z-40 font-sans">
      <div className="flex items-center space-x-2">
        <span className="font-extrabold text-white">PRAD Umburanas</span>
        <span className="text-white/40">•</span>
        <span className="text-white/70">Conjunto Eólico Umburanas (ENGIE / EcoBrasil)</span>
      </div>
      <div className="font-semibold text-emerald-400 flex items-center gap-1.5 bg-[#1F2E0D] px-3 py-1 rounded-full border border-emerald-500/30">
        <span>Elaborado por</span>
        <strong className="text-white font-extrabold">Maurivan Vaz Ribeiro</strong>
      </div>
    </footer>
  );
}
