'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Camera,
  MapPin,
  Calendar,
  User,
  Filter,
  Search,
  Download,
  Eye,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { EVIDENCIAS_FOTOS_CANONICAS } from '@/data/semanticDb';

export default function EvidenciasPage() {
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  const filteredEvidencias = EVIDENCIAS_FOTOS_CANONICAS.filter((item) => {
    const matchTipo = filterTipo === 'todos' || item.tipoEvidencia === filterTipo;
    const matchSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.areaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTipo && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F5F7F4] text-[#17211B] p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE4DE] pb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#5F6D65] flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00A651]" />
              <span>Acervo Documental & Georreferenciado</span>
            </div>
            <h1 className="text-2xl font-bold text-[#17211B] tracking-tight">
              Evidências & Registros Fotográficos
            </h1>
            <p className="text-sm text-[#5F6D65] mt-0.5">
              Acervo de fotografias de campo com coordenadas UTM, altitude, responsável técnico e rastreabilidade por Área PRAD.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
              ✓ 100% Georreferenciadas (SIRGAS 2000)
            </span>
          </div>
        </div>

        {/* BARRA DE FILTROS E BUSCA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#DDE4DE] shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ID, área, responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F5F7F4] border border-[#DDE4DE] rounded-xl text-xs text-[#17211B] focus:outline-none focus:ring-2 focus:ring-[#00A651]/40"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {['todos', 'Antes/Depois', 'Plantio', 'Controle Erosivo', 'Monitoramento'].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFilterTipo(tipo)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterTipo === tipo
                    ? 'bg-[#17211B] text-white'
                    : 'bg-[#F5F7F4] text-[#5F6D65] hover:text-[#17211B] border border-[#DDE4DE]'
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>

        {/* GRID DE EVIDÊNCIAS FOTOGRÁFICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvidencias.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="bg-white rounded-2xl border border-[#DDE4DE] overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col"
            >
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={item.urlFoto}
                  alt={item.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-white backdrop-blur-sm border border-white/20">
                    {item.areaId}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-sm shadow-sm">
                    {item.tipoEvidencia}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs text-[#17211B] group-hover:text-[#00A651] transition-colors leading-snug">
                    {item.titulo}
                  </h3>
                  <p className="text-[11px] text-[#5F6D65] line-clamp-2 mt-1">
                    {item.descricao}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#DDE4DE]/60 space-y-1 text-[10px] text-[#5F6D65]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-mono text-slate-700">
                      <MapPin className="w-3 h-3 text-[#00A651]" />
                      <span>{item.coordenadasUtm}</span>
                    </span>
                    <span className="font-medium">{item.data}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#5F6D65]">
                    <span>Resp: {item.responsavel}</span>
                    <span className="text-emerald-700 font-bold">✓ Validado</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL DE ZOOM E DETALHES DA EVIDÊNCIA */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#DDE4DE] overflow-hidden animate-in fade-in zoom-in-95">
              <div className="relative h-80 bg-slate-950">
                <img
                  src={selectedPhoto.urlFoto}
                  alt={selectedPhoto.titulo}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-950/80 text-white flex items-center justify-center font-bold hover:bg-slate-900 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {selectedPhoto.id} • {selectedPhoto.areaId}
                  </span>
                  <span className="text-slate-500 font-medium">{selectedPhoto.data} às {selectedPhoto.hora}</span>
                </div>
                <h3 className="text-base font-bold text-[#17211B]">{selectedPhoto.titulo}</h3>
                <p className="text-sm text-[#5F6D65]">{selectedPhoto.descricao}</p>
                <div className="grid grid-cols-2 gap-2 p-3 bg-[#F5F7F4] rounded-xl border border-[#DDE4DE] font-mono text-[11px]">
                  <div>Coordenadas: {selectedPhoto.coordenadasUtm}</div>
                  <div>Altitude: {selectedPhoto.altitudeM} m</div>
                  <div>Responsável: {selectedPhoto.responsavel}</div>
                  <div>Campanha: {selectedPhoto.campanha}</div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Link
                    href={`/areas/${selectedPhoto.areaId}`}
                    className="px-4 py-2 bg-[#00A651] text-white rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <span>Abrir Ficha da Área {selectedPhoto.areaId}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
