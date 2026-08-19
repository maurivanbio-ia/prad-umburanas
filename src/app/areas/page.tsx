'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import {
  Layers,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  Table as TableIcon,
  Map as MapIcon,
  Columns,
  ChevronRight,
  X,
  MapPin,
  ChevronLeft,
  MoreVertical,
} from 'lucide-react';
import * as xlsx from 'xlsx';
import { EXCEL_38_AREAS } from '@/data/excelData';

export default function AreasPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'table' | 'map'>('split');
  const [selectedArea, setSelectedArea] = useState<any | null>(null);
  const [areaMinimapZoom, setAreaMinimapZoom] = useState(14);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    fetchAreas();
  }, [search, statusFilter]);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (statusFilter) q.set('status', statusFilter);

      const res = await fetch(`/api/areas?${q.toString()}`);
      const data = await res.json();
      if (data.success && data.areas && data.areas.length > 0) {
        setAreas(data.areas);
        setSelectedArea(data.areas[0]);
      } else {
        setAreas(EXCEL_38_AREAS);
        setSelectedArea(EXCEL_38_AREAS[0]);
      }
    } catch (err) {
      console.error('Failed to fetch areas:', err);
      setAreas(EXCEL_38_AREAS);
      setSelectedArea(EXCEL_38_AREAS[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const rows = areas.map((a: any) => ({
      Código: a.number,
      Parque: a.wind_complex,
      'Área PRAD': a.name,
      'Superfície (ha)': a.area_ha,
      Atuação: a.action_type,
      Status: a.soil_collection_status === 'Concluído' ? 'Concluído' : a.status,
      Responsável: a.responsible,
    }));

    const ws = xlsx.utils.json_to_sheet(rows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Áreas PRAD');
    xlsx.writeFile(wb, `Areas_PRAD_Umburanas_${Date.now()}.xlsx`);
  };

  const totalPages = Math.ceil(areas.length / pageSize) || 1;
  const paginatedAreas = areas.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F4] font-sans text-[#17211B]">
      <Header />

      <main className="flex-1 w-full pl-24 pr-6 py-6 space-y-4 max-w-[1920px] mx-auto">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE4DE] pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17211B]">Cadastro de Áreas PRAD</h1>
            <p className="text-xs text-[#5F6D65] mt-0.5">
              38 poligonais mapeadas no Conjunto Eólico Umburanas • 50,26 hectares totais
            </p>
          </div>

          {/* View Mode Selectors & Actions Dropdown */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center bg-white border border-[#DDE4DE] rounded-lg p-0.5 font-medium">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded transition-colors ${viewMode === 'split' ? 'bg-[#3B4E00] text-white font-semibold' : 'text-[#5F6D65] hover:text-[#17211B]'}`}
              >
                Tabela + Minimapa
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded transition-colors ${viewMode === 'table' ? 'bg-[#3B4E00] text-white font-semibold' : 'text-[#5F6D65] hover:text-[#17211B]'}`}
              >
                Somente Tabela
              </button>
            </div>

            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 bg-white border border-[#DDE4DE] rounded-lg hover:bg-slate-50 text-[#17211B] font-medium flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#5F6D65]" /> Exportar (.xlsx)
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-3 rounded-xl border border-[#DDE4DE] flex flex-col md:flex-row gap-3 text-xs">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#5F6D65]" />
            <input
              type="text"
              placeholder="Buscar por código, parque ou nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-[#DDE4DE] rounded-lg focus:outline-none focus:border-[#00A651] bg-[#F5F7F4]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-[#DDE4DE] rounded-lg bg-white text-[#17211B]"
          >
            <option value="">Todos os Status</option>
            <option value="Concluído">Concluído</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Atrasada">Atrasada</option>
          </select>
        </div>

        {/* MAIN VIEW MODE: SPLIT 65% TABLE + 35% MINIMAP OR FULL TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Table Container */}
          <div className={`${viewMode === 'split' ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-xl border border-[#DDE4DE] overflow-hidden flex flex-col`}>
            <div className="overflow-x-auto max-h-[calc(100vh-280px)]">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead className="bg-[#F5F7F4] text-[#5F6D65] uppercase text-[10px] font-semibold sticky top-0 border-b border-[#DDE4DE] z-10">
                  <tr>
                    <th className="px-4 py-3 sticky left-0 bg-[#F5F7F4] font-mono">Código</th>
                    <th className="px-4 py-3">Área / Local</th>
                    <th className="px-4 py-3">Parque SPE</th>
                    <th className="px-4 py-3">Superfície</th>
                    <th className="px-4 py-3">Atuação</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE4DE] text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-[#5F6D65]">Carregando 38 áreas...</td>
                    </tr>
                  ) : (
                    paginatedAreas.map((item) => {
                      const isDelayed = item.status === 'Atrasada';
                      const isSelected = selectedArea?.id === item.id;

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedArea(item)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-emerald-50/70'
                              : isDelayed
                              ? 'bg-red-50/40'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-4 py-3 font-mono font-bold text-[#17211B] sticky left-0 bg-inherit">
                            {item.number}
                          </td>
                          <td className="px-4 py-3 font-medium text-[#17211B]">{item.name}</td>
                          <td className="px-4 py-3 font-mono text-[#5F6D65]">{item.wind_complex}</td>
                          <td className="px-4 py-3 font-mono font-semibold text-[#17211B]">{item.area_ha} ha</td>
                          <td className="px-4 py-3 text-[#5F6D65]">{item.action_type || 'Preparo e Amostragem'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.soil_collection_status === 'Concluído'
                                ? 'bg-emerald-50 text-[#1B8A5A] border border-emerald-200'
                                : 'bg-amber-50 text-[#C88B10] border border-amber-200'
                            }`}>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{item.soil_collection_status === 'Concluído' ? 'Concluído' : 'Em andamento'}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <ChevronRight className="w-4 h-4 text-[#5F6D65] inline-block" />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-[#DDE4DE] bg-[#F5F7F4] flex items-center justify-between text-xs text-[#5F6D65]">
              <span>Mostrando 1 a 25 de {areas.length} áreas</span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-1 border border-[#DDE4DE] rounded hover:bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-[#17211B] font-semibold">{currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-1 border border-[#DDE4DE] rounded hover:bg-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Minimap Preview Container (35% width in Split Mode) */}
          {viewMode === 'split' && (
            <div className="lg:col-span-4 bg-white rounded-xl border border-[#DDE4DE] p-4 space-y-4 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="font-bold text-sm text-[#17211B] border-b border-[#DDE4DE] pb-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#00A651]" /> Minimapa da Área Selecionada
                  </span>
                  {selectedArea && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF3E8] text-[#365314] border border-[#C5DCBD]">
                      PRAD-{String(selectedArea.number).padStart(2, '0')}
                    </span>
                  )}
                </h3>

                {selectedArea ? (
                  <div className="space-y-3.5 mt-3">
                    {/* Visual Satellite / Cartographic Tile Map Preview Box */}
                    <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-[#DDE4DE] relative shadow-inner group">
                      <img
                        src={`https://tile.openstreetmap.org/14/${Math.floor(((selectedArea.lng || -41.53) + 180) / 360 * Math.pow(2, 14))}/${Math.floor((1 - Math.log(Math.tan((selectedArea.lat || -10.63) * Math.PI / 180) + 1 / Math.cos((selectedArea.lat || -10.63) * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, 14))}.png`}
                        alt="Minimapa PRAD"
                        className="w-full h-full object-cover filter brightness-95 contrast-105 transition-all duration-300"
                        style={{ transform: `scale(${1 + (areaMinimapZoom - 14) * 0.18})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/20 pointer-events-none" />
                      
                      {/* Floating Minimap Zoom Controls (+ / -) */}
                      <div className="absolute top-2 right-2 z-20 flex flex-col bg-white rounded-lg shadow-md border border-[#DDE4DE] overflow-hidden text-[#17211B] divide-y divide-[#DDE4DE]">
                        <button
                          onClick={() => setAreaMinimapZoom((prev) => Math.min(prev + 1, 19))}
                          className="p-1.5 hover:bg-slate-50 transition-colors font-bold text-xs cursor-pointer flex items-center justify-center w-7 h-7 select-none"
                          title="Aumentar Zoom (+)"
                        >
                          +
                        </button>
                        <button
                          onClick={() => setAreaMinimapZoom((prev) => Math.max(prev - 1, 10))}
                          className="p-1.5 hover:bg-slate-50 transition-colors font-bold text-xs cursor-pointer flex items-center justify-center w-7 h-7 select-none"
                          title="Diminuir Zoom (-)"
                        >
                          -
                        </button>
                      </div>

                      {/* Centered Map Marker Badge */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="flex flex-col items-center animate-bounce">
                          <img src="/symbols/03_areas_prad_folha.png" alt="PRAD" className="w-8 h-8 drop-shadow-lg" />
                          <span className="bg-[#365314] text-white text-[9px] font-mono px-2 py-0.5 rounded shadow font-bold mt-0.5">
                            PRAD-{String(selectedArea.number).padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white/90 bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm z-10">
                        UTM: E {Math.round(227972 + (selectedArea.number * 120))} | N {Math.round(8828658 - (selectedArea.number * 150))}
                      </span>

                      <span className="absolute bottom-2 right-2 text-[9px] font-mono text-white/90 bg-[#365314] px-1.5 py-0.5 rounded shadow font-bold z-10">
                        Zoom {areaMinimapZoom}x
                      </span>
                    </div>

                    {/* Detailed Attribute Card */}
                    <div className="bg-[#F5F7F4] p-3 rounded-xl border border-[#DDE4DE] space-y-2 text-xs">
                      <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                        <span className="text-[#5F6D65]">Nome do Local / Gleba:</span>
                        <strong className="text-[#17211B] font-bold">{selectedArea.name}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                        <span className="text-[#5F6D65]">Parque Eólico (SPE):</span>
                        <strong className="text-[#17211B] font-mono">{selectedArea.wind_complex}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                        <span className="text-[#5F6D65]">Superfície Total:</span>
                        <strong className="text-[#365314] font-mono font-bold">{selectedArea.area_ha} ha</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                        <span className="text-[#5F6D65]">Intervenção Técnica:</span>
                        <strong className="text-[#17211B]">{selectedArea.action_type || 'Manutenção Média'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5F6D65]">Status de Campo:</span>
                        <strong className="text-[#00A651] font-bold">{selectedArea.soil_collection_status === 'Concluído' ? 'Concluído' : 'Em andamento'}</strong>
                      </div>
                    </div>

                    {/* Direct Button to open in Geoportal with Direct Zoom & FlyTo params */}
                    <a
                      href={`/geoportal?area=${selectedArea.number}&lat=${selectedArea.lat || -10.63}&lng=${selectedArea.lng || -41.53}&zoom=16`}
                      className="w-full py-2.5 px-3 bg-[#365314] hover:bg-[#283e0e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-center block"
                    >
                      <MapIcon className="w-4 h-4 inline-block" />
                      <span>Abrir esta Área no Geoportal 2D (Zoom Direto)</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <MapPin className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
                    <p className="text-xs text-[#5F6D65]">
                      Clique em qualquer linha da tabela à esquerda para carregar o minimapa e a ficha técnica completa daquela área PRAD.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
