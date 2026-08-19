import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GeoportalMap from '@/components/geoportal/GeoportalMap';

export default function GeoportalPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />
      <main className="flex-1 relative">
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Carregando Geoportal 2D...</div>}>
          <GeoportalMap />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
