'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import {
  Camera,
  MapPin,
  Search,
  Filter,
  Eye,
  X,
  AlertTriangle,
  Link as LinkIcon,
  Calendar,
  Info,
  ArrowUpRight,
  Split,
  Grid as GridIcon,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function GaleriaPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('grid');
  const [isBeforeAfter, setIsBeforeAfter] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [search, activityFilter]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (activityFilter) q.set('activity', activityFilter);

      const res = await fetch(`/api/photos?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPhotos(data.photos);
      }
    } catch (err) {
      console.error('Failed to fetch photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const georeferencedPhotos = photos.filter((p) => p.is_georeferenced !== false);
  const pendingPhotos = photos.filter((p) => p.is_georeferenced === false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F4] font-sans text-[#17211B]">
      <Header />

      <main className="flex-1 w-full pl-24 pr-6 py-6 space-y-5 max-w-[1920px] mx-auto">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE4DE] pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17211B]">Acervo Fotográfico de Evidências Reais</h1>
            <p className="text-xs text-[#5F6D65] mt-0.5">
              16 fotografias georreferenciadas (UTM 24L / SIRGAS 2000) • 2 pendentes de localização
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center bg-white border border-[#DDE4DE] rounded-lg p-0.5 font-medium">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-[#3B4E00] text-white font-semibold' : 'text-[#5F6D65]'}`}
              >
                Galeria
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded transition-colors ${viewMode === 'split' ? 'bg-[#3B4E00] text-white font-semibold' : 'text-[#5F6D65]'}`}
              >
                Mapa + Galeria
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-3 rounded-xl border border-[#DDE4DE] flex flex-col md:flex-row gap-3 text-xs">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#5F6D65]" />
            <input
              type="text"
              placeholder="Buscar por local, atividade ou observação..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-[#DDE4DE] rounded-lg focus:outline-none focus:border-[#00A651] bg-[#F5F7F4]"
            />
          </div>

          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="px-3 py-1.5 border border-[#DDE4DE] rounded-lg bg-white text-[#17211B]"
          >
            <option value="">Todas as Atividades</option>
            <option value="COLETA DE SOLO">Coleta de Solo</option>
            <option value="LIMPEZA">Limpeza de Solo</option>
          </select>
        </div>

        {/* SPLIT VIEW MODE: MAPA + GALERIA */}
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-220px)] min-h-[600px]">
            {/* Left Column: Clean Cartographic Photo Minimap Frame */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DDE4DE] overflow-hidden shadow-md flex flex-col relative sticky top-24 h-[calc(100vh-230px)]">
              <div className="p-3 bg-[#17211B] text-white flex items-center justify-between text-xs flex-shrink-0">
                <div className="flex items-center gap-2 font-bold">
                  <MapPin className="w-4 h-4 text-[#00A651]" />
                  <span>Localização da Evidência Fotográfica</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">UTM 24L / SIRGAS 2000</span>
              </div>

              {/* Lightweight Interactive Tile Canvas with PRAD Pins */}
              <div className="flex-1 relative w-full bg-[#EAECE9] overflow-hidden flex flex-col justify-between p-4">
                {/* Background Map Tiles */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-85"
                  style={{
                    backgroundImage: `url('https://a.basemaps.cartocdn.com/rastertiles/voyager/13/2642/3794.png')`,
                  }}
                />

                {/* Overlaid PRAD Vector Pins */}
                <div className="relative z-10 space-y-2">
                  <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-[#DDE4DE] shadow-md space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#365314]">Área Selecionada</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">Georreferenciada</span>
                    </div>
                    <strong className="text-xs text-[#17211B] font-bold block">
                      {selectedPhoto ? selectedPhoto.local : 'PRAD-01 - Bota-fora 01 (Umburanas 11)'}
                    </strong>
                    <div className="flex items-center justify-between text-[11px] text-[#5F6D65] font-mono pt-1 border-t border-slate-200">
                      <span>UTM E: {selectedPhoto?.easting || '227.972'} m</span>
                      <span>N: {selectedPhoto?.northing || '8.828.658'} m</span>
                    </div>
                  </div>
                </div>

                {/* Central Photo Pin Marker */}
                <div className="relative z-10 my-auto flex flex-col items-center justify-center animate-bounce">
                  <div className="bg-[#365314] text-white p-2 rounded-2xl shadow-xl border-2 border-white flex items-center gap-1.5 font-bold text-xs">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>{selectedPhoto ? selectedPhoto.file_name : 'Foto de Campo #1'}</span>
                  </div>
                  <div className="w-3 h-3 bg-[#365314] rotate-45 -mt-1.5 border-r-2 border-b-2 border-white" />
                </div>

                {/* Bottom Direct Link Action Button */}
                <div className="relative z-10 pt-3">
                  <a
                    href={selectedPhoto?.lat ? `/geoportal?lat=${selectedPhoto.lat}&lng=${selectedPhoto.lng}&zoom=16` : '/geoportal'}
                    className="w-full py-2.5 px-4 bg-[#365314] hover:bg-[#283e0e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Abrir no Geoportal 2D (Zoom Direto)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Scrollable Photo Cards List */}
            <div className="lg:col-span-7 overflow-y-auto space-y-4 pr-1">
              {(Object.entries(
                georeferencedPhotos.reduce((acc: Record<string, any[]>, photo: any) => {
                  const areaKey = photo.local || 'Área PRAD de Campo';
                  if (!acc[areaKey]) acc[areaKey] = [];
                  acc[areaKey].push(photo);
                  return acc;
                }, {})
              ) as [string, any[]][]).map(([areaName, areaPhotos]) => (
                <div key={areaName} className="bg-white p-4 rounded-2xl border border-[#DDE4DE] shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-[#DDE4DE] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#365314] text-white font-bold text-[10px]">PRAD</span>
                      <strong className="text-xs text-[#17211B] font-bold">{areaName}</strong>
                    </div>
                    <span className="text-[10px] text-[#5F6D65] font-mono">{areaPhotos.length} Fotos</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {areaPhotos.map((p: any) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPhoto(p)}
                        className="bg-[#F5F7F4] rounded-xl border border-[#DDE4DE] overflow-hidden hover:border-[#3B4E00] transition-all cursor-pointer group flex flex-col shadow-sm"
                      >
                        <div className="relative aspect-video bg-slate-900 overflow-hidden">
                          <img src={p.storage_path} alt={p.file_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <span className="absolute top-2 right-2 bg-[#00A651] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                            UTM 24L
                          </span>
                        </div>
                        <div className="p-2.5 text-xs bg-white space-y-1">
                          <span className="font-bold text-[#17211B] block truncate text-[11px]">{p.code || 'P-01'} • {p.file_name}</span>
                          <span className="text-[#00A651] font-semibold block text-[10px] truncate">{p.activity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* GRID VIEW MODE: ONLY PHOTO CARDS */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#DDE4DE] pb-2.5">
              <h2 className="font-bold text-sm uppercase tracking-wider text-[#3B4E00] flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-[#00A651]" /> Fotografias Georreferenciadas Separadas por Área PRAD ({georeferencedPhotos.length})
              </h2>
              <span className="text-xs text-[#5F6D65] font-mono">UTM 24L / SIRGAS 2000</span>
            </div>

            {/* Grouped Area Sections */}
            {(Object.entries(
              georeferencedPhotos.reduce((acc: Record<string, any[]>, photo: any) => {
                const areaKey = photo.local || 'Área PRAD de Campo';
                if (!acc[areaKey]) acc[areaKey] = [];
                acc[areaKey].push(photo);
                return acc;
              }, {})
            ) as [string, any[]][]).map(([areaName, areaPhotos]) => (
              <div key={areaName} className="bg-white p-4.5 rounded-2xl border border-[#DDE4DE] shadow-sm space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE4DE] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#365314] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      PRAD
                    </div>
                    <div>
                      <strong className="text-sm text-[#17211B] font-bold block">{areaName}</strong>
                      <span className="text-[11px] text-[#5F6D65] font-mono">
                        {areaPhotos.length} {areaPhotos.length === 1 ? 'Fotografia Georreferenciada' : 'Fotografias Georreferenciadas'} • Completo
                      </span>
                    </div>
                  </div>

                  <a
                    href="/geoportal"
                    className="text-xs text-[#365314] font-bold hover:underline flex items-center gap-1.5 bg-[#EBF3E8] px-3 py-1.5 rounded-xl border border-[#C5DCBD] transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#00A651]" />
                    <span>Ver Área no Geoportal</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {areaPhotos.map((p: any) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPhoto(p)}
                      className="bg-[#F5F7F4] rounded-xl border border-[#DDE4DE] overflow-hidden hover:border-[#3B4E00] transition-all cursor-pointer group flex flex-col shadow-sm"
                    >
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        <img
                          src={p.storage_path}
                          alt={p.file_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 right-2 bg-[#00A651] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                          <MapPin className="w-2.5 h-2.5" /> UTM 24L
                        </span>
                      </div>

                      <div className="p-3 text-xs flex-1 flex flex-col justify-between space-y-1.5 bg-white">
                        <div>
                          <span className="font-bold text-[#17211B] block truncate">{p.code || 'P-01'} • {p.file_name}</span>
                          <span className="text-[#00A651] font-semibold block text-[11px] font-mono mt-0.5">{p.activity}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-[#5F6D65] font-mono">
                          <span>{p.captured_at ? new Date(p.captured_at).toLocaleDateString('pt-BR') : '18/08/2026'}</span>
                          <span className="font-bold text-[#17211B]">{p.easting ? `E ${p.easting}` : 'UTM 24L'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2 PENDING PHOTOS SECTION */}
        {pendingPhotos.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-[#DDE4DE]">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-2 text-xs text-amber-900 font-semibold">
              <AlertTriangle className="w-4 h-4 text-[#C88B10]" />
              <span>Pendentes de Geolocalização ({pendingPhotos.length}) — Vincular aos marcadores no Geoportal</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pendingPhotos.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPhoto(p)}
                  className="bg-white rounded-lg border border-amber-200 overflow-hidden cursor-pointer group flex flex-col"
                >
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img src={p.storage_path} alt={p.file_name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                      Pendente
                    </span>
                  </div>
                  <div className="p-3 text-xs space-y-1">
                    <span className="font-bold text-[#17211B] block truncate">{p.local || 'Local Pendente'}</span>
                    <span className="text-[#00A651] font-semibold block text-[11px]">{p.activity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FULL SCREEN PHOTO VIEWER MODAL (Dark background ONLY inside modal) */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full overflow-hidden border border-[#DDE4DE] font-sans">
            <div className="bg-[#17211B] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-[#00A651]" />
                <h3 className="font-bold text-xs uppercase tracking-wider">{selectedPhoto.local || selectedPhoto.file_name}</h3>
              </div>
              <button onClick={() => setSelectedPhoto(null)} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 flex items-center justify-center max-h-[60vh] relative">
              <img src={selectedPhoto.storage_path} alt={selectedPhoto.file_name} className="max-h-[60vh] object-contain" />

              {/* Before/After Toggle Pill */}
              <button
                onClick={() => setIsBeforeAfter(!isBeforeAfter)}
                className="absolute top-3 right-3 bg-white/90 text-[#17211B] text-xs font-semibold px-3 py-1 rounded-full shadow hover:bg-white"
              >
                {isBeforeAfter ? 'Ver Foto Atual' : 'Comparar Antes / Depois'}
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs bg-white">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F5F7F4] p-3 rounded-lg border border-[#DDE4DE] font-mono text-[11px]">
                <div>UTM Easting: <strong className="text-[#17211B] block">{selectedPhoto.easting || '—'} m</strong></div>
                <div>UTM Northing: <strong className="text-[#17211B] block">{selectedPhoto.northing || '—'} m</strong></div>
                <div>Latitude: <strong className="text-[#17211B] block">{selectedPhoto.lat?.toFixed(6) || '—'}</strong></div>
                <div>Longitude: <strong className="text-[#17211B] block">{selectedPhoto.lng?.toFixed(6) || '—'}</strong></div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#DDE4DE]">
                <Link
                  href="/geoportal"
                  className="bg-[#00A651] hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow flex items-center gap-1.5"
                >
                  <span>Ver no Geoportal</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="px-4 py-1.5 text-[#5F6D65] hover:bg-[#F5F7F4] rounded-lg text-xs font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
