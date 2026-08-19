'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Settings, Save, Database, Shield, Globe } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [epsg, setEpsg] = useState('31984');
  const [utmZone, setUtmZone] = useState('24S');
  const [datum, setDatum] = useState('SIRGAS 2000');
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#00A651] uppercase mb-1">
              <Settings className="w-4 h-4" />
              <span>Administração do Sistema</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Configurações Gerais e Sistema de Referência Espacial</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Parâmetros do projeto, datum de conversão UTM, permissões de usuários e auditoria.
            </p>
          </div>
        </div>

        {saved && (
          <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold p-3 rounded-lg">
            ✓ Configurações espaciais salvas com sucesso!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Spatial Reference Form */}
          <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              Sistema de Referência do Projeto (GIS)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Código EPSG</label>
                <input
                  type="text"
                  value={epsg}
                  onChange={(e) => setEpsg(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Zona UTM</label>
                <input
                  type="text"
                  value={utmZone}
                  onChange={(e) => setUtmZone(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Datum Terrestre</label>
                <input
                  type="text"
                  value={datum}
                  onChange={(e) => setDatum(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#00A651] hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded shadow flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Salvar Sistema de Referência
            </button>
          </form>

          {/* Database Info Box */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b pb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-600" />
              Status da Base de Dados (PostgreSQL + PostGIS)
            </h3>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between p-2 bg-slate-50 rounded border">
                <span>Motor do Banco:</span>
                <span className="font-bold text-emerald-700">PostgreSQL 16 + PostGIS 3.4</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border">
                <span>Container Docker:</span>
                <span className="font-mono font-bold text-slate-900">prad-postgis:5435</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border">
                <span>Total de Áreas no Banco:</span>
                <span className="font-bold text-slate-900">38 Registros</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border">
                <span>Fotografias de Campo:</span>
                <span className="font-bold text-slate-900">18 Arquivos Indexados</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border">
                <span>Camadas Vetoriais SHP:</span>
                <span className="font-bold text-slate-900">6 Camadas GeoJSON</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
