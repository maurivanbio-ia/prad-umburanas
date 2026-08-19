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
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react';
import Link from 'next/link';

export default function GaleriaPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [activeMapPhoto, setActiveMapPhoto] = useState<any | null>(null);
  const [basemapType, setBasemapType] = useState<'satellite' | 'vector' | 'terrain'>('satellite');
  const [search, setSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('split');
  const [isBeforeAfter, setIsBeforeAfter] = useState(false);
  const [minimapZoom, setMinimapZoom] = useState(15);

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
        if (data.photos.length > 0) {
          setActiveMapPhoto((prev: any) => prev || data.photos[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const georeferencedPhotos = photos.filter((p) => p.is_georeferenced !== false);
  const pendingPhotos = photos.filter((p) => p.is_georeferenced === false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [submittingPhoto, setSubmittingPhoto] = useState(false);
  const [newPhotoForm, setNewPhotoForm] = useState({
    activity: 'Revegetação com Mudas Nativas',
    local: 'PRAD-01 - Bota fora 01 (Umburanas 11)',
    responsible: 'Rafael Oliveira (EcoBrasil)',
    easting: 228050,
    northing: 8828550,
    notes: 'Vistoria fotográfica georreferenciada de campo.',
    file: null as File | null,
  });

  // Edit / Delete state
  const [editingPhoto, setEditingPhoto] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ code: '', activity: '', local: '', notes: '', responsible: '' });

  const handleDeletePhoto = (photoId: string) => {
    if (!confirm('Tem certeza que deseja remover esta fotografia do acervo?')) return;
    setPhotos((prev: any[]) => prev.filter((p: any) => p.id !== photoId));
    if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
    if (activeMapPhoto?.id === photoId) setActiveMapPhoto(null);
  };

  const handleOpenEdit = (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPhoto(p);
    setEditForm({ code: p.code || '', activity: p.activity || '', local: p.local || '', notes: p.notes || '', responsible: p.responsible || '' });
  };

  const handleSaveEdit = () => {
    setPhotos((prev: any[]) => prev.map((p: any) => p.id === editingPhoto.id ? { ...p, ...editForm } : p));
    setEditingPhoto(null);
  };

  const handleUploadPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('local', newPhotoForm.local);
      formData.append('activity', newPhotoForm.activity);
      formData.append('responsible', newPhotoForm.responsible);
      formData.append('easting', String(newPhotoForm.easting));
      formData.append('northing', String(newPhotoForm.northing));
      formData.append('notes', newPhotoForm.notes);
      if (newPhotoForm.file) {
        formData.append('file', newPhotoForm.file);
      }

      const res = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      });

      const newPhotoObj = {
        id: `photo-${Date.now()}`,
        file_name: newPhotoForm.activity,
        storage_path: newPhotoForm.file ? URL.createObjectURL(newPhotoForm.file) : '/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.32.jpeg',
        captured_at: '2026-08-19T10:00:00Z',
        easting: newPhotoForm.easting,
        northing: newPhotoForm.northing,
        code: `P-${String(photos.length + 1).padStart(2, '0')}`,
        local: newPhotoForm.local,
        activity: newPhotoForm.activity,
        notes: newPhotoForm.notes,
        responsible: newPhotoForm.responsible,
        is_georeferenced: true,
      };

      setPhotos((prev) => [newPhotoObj, ...prev]);
      setSelectedPhoto(newPhotoObj);
      setIsUploadModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPhoto(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F4] font-sans text-[#17211B]">
      <Header />

      <main className="flex-1 w-full pl-24 pr-6 py-6 space-y-5 max-w-[1920px] mx-auto">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE4DE] pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17211B]">Acervo Fotográfico das Atividades</h1>
            <p className="text-xs text-[#5F6D65] mt-0.5">
              {photos.length} fotografias de campo 100% georreferenciadas (UTM 24L / SIRGAS 2000)
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#365314] hover:bg-[#283e0e] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Nova Fotografia</span>
            </button>

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
            {/* Left Column: Clean Cartographic Photo Minimap Frame with Layers */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DDE4DE] overflow-hidden shadow-md flex flex-col relative sticky top-24 h-[calc(100vh-230px)]">
              {/* Minimap Header with Basemap Selector */}
              <div className="p-3 bg-[#17211B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs flex-shrink-0">
                <div className="flex items-center gap-2 font-bold">
                  <MapPin className="w-4 h-4 text-[#00A651]" />
                  <span>Localização da Evidência Fotográfica</span>
                </div>

                {/* Basemap Layer Selector Buttons (Satélite, Vetorial, Terreno) */}
                <div className="flex items-center bg-[#243329] p-0.5 rounded-lg border border-[#3A4D40] text-[10px] font-bold gap-0.5">
                  {/* Satélite */}
                  <button
                    onClick={() => setBasemapType('satellite')}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md transition-all cursor-pointer min-w-[60px] ${basemapType === 'satellite' ? 'bg-[#00A651] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    title="Satélite"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="2"/>
                      <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
                    </svg>
                    <span>Satélite</span>
                  </button>

                  {/* Vetorial */}
                  <button
                    onClick={() => setBasemapType('vector')}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md transition-all cursor-pointer min-w-[60px] ${basemapType === 'vector' ? 'bg-[#00A651] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    title="Vetorial"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6l6 6 4-4 8 8"/>
                      <path d="M21 3H3v18h18V3z" strokeOpacity="0.4"/>
                      <path d="M3 12h18M12 3v18" strokeOpacity="0.3"/>
                    </svg>
                    <span>Vetorial</span>
                  </button>

                  {/* Terreno */}
                  <button
                    onClick={() => setBasemapType('terrain')}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md transition-all cursor-pointer min-w-[60px] ${basemapType === 'terrain' ? 'bg-[#00A651] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    title="Terreno"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 20l5-10 4 6 3-4 6 8H3z"/>
                      <path d="M16 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor" strokeWidth="0"/>
                    </svg>
                    <span>Terreno</span>
                  </button>
                </div>
              </div>

              {/* Lightweight Interactive Tile Canvas with PRAD Pins */}
              <div className="flex-1 relative w-full bg-[#243329] overflow-hidden flex flex-col justify-between p-4">
                {/* Dynamic Tile Grid - fills entire container */}
                {(() => {
                  const currentPhoto = activeMapPhoto || georeferencedPhotos[0];
                  const lat = currentPhoto?.lat ?? -10.6272;
                  const lng = currentPhoto?.lng ?? -41.5375;
                  const z = minimapZoom;

                  // OSM tile math
                  const lat_r = (lat * Math.PI) / 180;
                  const n = Math.pow(2, z);
                  const centerTileX = Math.floor(((lng + 180) / 360) * n);
                  const centerTileY = Math.floor(((1 - Math.log(Math.tan(lat_r) + 1 / Math.cos(lat_r)) / Math.PI) / 2) * n);

                  // Sub-pixel offset so the exact coordinate is centred
                  const fracX = ((lng + 180) / 360) * n - centerTileX;
                  const fracY = ((1 - Math.log(Math.tan(lat_r) + 1 / Math.cos(lat_r)) / Math.PI) / 2) * n - centerTileY;

                  const TILE_SIZE = 256;
                  const GRID = 5; // 5×5 = 25 tiles, always enough to cover container
                  const half = Math.floor(GRID / 2);

                  const getTileUrl = (tx: number, ty: number) => {
                    const clampedY = Math.max(0, Math.min(n - 1, ty));
                    const wrappedX = ((tx % n) + n) % n;
                    if (basemapType === 'satellite')
                      return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${clampedY}/${wrappedX}`;
                    if (basemapType === 'terrain')
                      return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${clampedY}/${wrappedX}`;
                    return `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${wrappedX}/${clampedY}.png`;
                  };

                  // Offset so center tile is centred in the container
                  const offsetX = -fracX * TILE_SIZE;
                  const offsetY = -fracY * TILE_SIZE;

                  return (
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ opacity: 0.95 }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: `calc(50% + ${offsetX - half * TILE_SIZE}px)`,
                          top: `calc(50% + ${offsetY - half * TILE_SIZE}px)`,
                          display: 'grid',
                          gridTemplateColumns: `repeat(${GRID}, ${TILE_SIZE}px)`,
                          gridTemplateRows: `repeat(${GRID}, ${TILE_SIZE}px)`,
                          width: GRID * TILE_SIZE,
                          height: GRID * TILE_SIZE,
                        }}
                      >
                        {Array.from({ length: GRID * GRID }).map((_, i) => {
                          const col = i % GRID;
                          const row = Math.floor(i / GRID);
                          const tx = centerTileX + (col - half);
                          const ty = centerTileY + (row - half);
                          return (
                            <img
                              key={`${tx}-${ty}-${z}-${basemapType}`}
                              src={getTileUrl(tx, ty)}
                              width={TILE_SIZE}
                              height={TILE_SIZE}
                              style={{ display: 'block', imageRendering: 'auto' }}
                              alt=""
                              draggable={false}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}


                {/* Floating Minimap Zoom Controls (+ / -) */}
                <div className="absolute bottom-16 right-4 z-20 flex flex-col bg-white rounded-xl shadow-lg border border-[#DDE4DE] overflow-hidden text-[#17211B] divide-y divide-[#DDE4DE]">
                  <button
                    onClick={() => setMinimapZoom((prev) => Math.min(prev + 1, 19))}
                    className="p-2 hover:bg-slate-50 transition-colors font-bold text-sm cursor-pointer flex items-center justify-center w-8 h-8 select-none"
                    title="Aumentar Zoom (+)"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setMinimapZoom((prev) => Math.max(prev - 1, 10))}
                    className="p-2 hover:bg-slate-50 transition-colors font-bold text-sm cursor-pointer flex items-center justify-center w-8 h-8 select-none"
                    title="Diminuir Zoom (-)"
                  >
                    -
                  </button>
                </div>

                {/* Current Selected Photo Pin Information Card */}
                {(() => {
                  const currentPhoto = activeMapPhoto || selectedPhoto || georeferencedPhotos[0];
                  return (
                    <>
                      <div className="relative z-10 space-y-2">
                        <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#DDE4DE] shadow-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-[#365314] flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#00A651] animate-ping" />
                              Evidência Destacada no Mapa
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                              Zoom {minimapZoom}x • {basemapType.toUpperCase()}
                            </span>
                          </div>

                          {currentPhoto ? (
                            <div className="flex items-center gap-3 bg-[#F5F7F4] p-2.5 rounded-lg border border-[#DDE4DE]">
                              <img
                                src={currentPhoto.storage_path}
                                alt={currentPhoto.file_name}
                                className="w-16 h-14 rounded-md object-cover border border-[#DDE4DE] flex-shrink-0 shadow-sm"
                              />
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <strong className="text-xs text-[#17211B] font-bold block truncate">{currentPhoto.code || 'P-01'} • {currentPhoto.local}</strong>
                                </div>
                                <span className="text-[10px] text-[#00A651] font-semibold block truncate">{currentPhoto.activity}</span>
                                <div className="flex items-center justify-between pt-0.5">
                                  <span className="text-[9px] text-[#5F6D65] font-mono block">
                                    E {currentPhoto.easting ? currentPhoto.easting.toLocaleString('pt-BR') : '229.273'} m | N {currentPhoto.northing ? currentPhoto.northing.toLocaleString('pt-BR') : '8.828.407'} m
                                  </span>
                                  <button
                                    onClick={() => setSelectedPhoto(currentPhoto)}
                                    className="text-[9px] bg-[#365314] text-white px-2 py-0.5 rounded-md font-bold hover:bg-[#283e0e] transition-colors"
                                  >
                                    Ver Foto 👁️
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <strong className="text-xs text-[#17211B] font-bold block">
                              Clique em qualquer foto da lista ao lado para destacar no mapa
                            </strong>
                          )}
                        </div>
                      </div>

                      {/* Central Photo Pin Marker */}
                      <div className="relative z-10 my-auto flex flex-col items-center justify-center animate-bounce">
                        <div className="bg-[#365314] text-white p-2 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-2 font-bold text-xs max-w-[260px]">
                          {currentPhoto?.storage_path ? (
                            <img src={currentPhoto.storage_path} alt="Thumb" className="w-7 h-7 rounded-full object-cover border-2 border-emerald-400 flex-shrink-0" />
                          ) : (
                            <Camera className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="truncate block font-bold text-[11px]">{currentPhoto ? currentPhoto.code + ' • ' + currentPhoto.file_name : 'Foto de Campo'}</span>
                            <span className="text-[9px] text-emerald-300 block font-mono truncate">{currentPhoto ? currentPhoto.local : 'Gleba PRAD'}</span>
                          </div>
                        </div>
                        <div className="w-3.5 h-3.5 bg-[#365314] rotate-45 -mt-1.5 border-r-2 border-b-2 border-white shadow-md" />
                      </div>

                      {/* Bottom Direct Link Action Button */}
                      <div className="relative z-10 pt-3">
                        <a
                          href={currentPhoto?.lat ? `/geoportal?lat=${currentPhoto.lat}&lng=${currentPhoto.lng}&zoom=16` : '/geoportal'}
                          className="w-full py-2.5 px-4 bg-[#365314] hover:bg-[#283e0e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                        >
                          <MapPin className="w-4 h-4 text-emerald-400" />
                          <span>Abrir no Geoportal 2D (Zoom Direto)</span>
                        </a>
                      </div>
                    </>
                  );
                })()}
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
                    {areaPhotos.map((p: any) => {
                      const isActive = (activeMapPhoto?.id || georeferencedPhotos[0]?.id) === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setActiveMapPhoto(p)}
                          className={`rounded-xl border overflow-hidden transition-all cursor-pointer group flex flex-col shadow-sm ${
                            isActive
                              ? 'border-[#00A651] ring-2 ring-[#00A651]/30 bg-emerald-50/40 shadow-md'
                              : 'bg-[#F5F7F4] border-[#DDE4DE] hover:border-[#3B4E00]'
                          }`}
                        >
                          <div className="relative aspect-video bg-slate-900 overflow-hidden">
                            <img src={p.storage_path} alt={p.file_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <span className="absolute top-2 right-2 bg-[#00A651] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                              {isActive ? '📍 DESTACADA' : 'UTM 24L'}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPhoto(p);
                              }}
                              className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-[9px] font-bold px-2 py-1 rounded-md backdrop-blur-xs flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity"
                              title="Expandir foto em tela cheia"
                            >
                              <Eye className="w-3 h-3 text-emerald-400" />
                              <span>Ampliar</span>
                            </button>
                          </div>
                          <div className="p-2.5 text-xs bg-white space-y-1">
                            <span className="font-bold text-[#17211B] block truncate text-[11px]">{p.code || 'P-01'} • {p.file_name}</span>
                            <span className="text-[#00A651] font-semibold block text-[10px] truncate">{p.activity}</span>
                          </div>
                        </div>
                      );
                    })}
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
                        {/* Edit / Delete overlay buttons */}
                        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleOpenEdit(p, e)}
                            className="bg-blue-600/90 hover:bg-blue-700 text-white p-1.5 rounded-md shadow cursor-pointer"
                            title="Editar informações"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeletePhoto(p.id); }}
                            className="bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-md shadow cursor-pointer"
                            title="Remover foto do acervo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
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

      {/* 📷 MODAL FOR INSERING NEW FIELD PHOTO */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DDE4DE] max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#DDE4DE] pb-3">
              <h3 className="font-bold text-base text-[#17211B] flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#00A651]" />
                <span>Cadastrar Nova Fotografia de Campo</span>
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-[#5F6D65] hover:text-[#17211B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadPhotoSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#17211B] mb-1">Título / Nome da Atividade Técnica *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Irrigação de Salvamento & Adubação Orgânica"
                  value={newPhotoForm.activity}
                  onChange={(e) => setNewPhotoForm({ ...newPhotoForm, activity: e.target.value })}
                  className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4] focus:outline-none focus:border-[#00A651] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#17211B] mb-1">Área PRAD *</label>
                  <select
                    value={newPhotoForm.local}
                    onChange={(e) => setNewPhotoForm({ ...newPhotoForm, local: e.target.value })}
                    className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4] focus:outline-none focus:border-[#00A651]"
                  >
                    <option value="PRAD-01 - Bota fora 01 (Umburanas 11)">PRAD-01 - Bota fora 01</option>
                    <option value="PRAD-02 - Bota-fora 02 (Umburanas 19)">PRAD-02 - Bota-fora 02</option>
                    <option value="PRAD-03 - Caixa de empréstimo 06 (Umburanas 01)">PRAD-03 - Caixa de empréstimo 06</option>
                    <option value="PRAD-05 - Bota-fora 07 (Umburanas 15)">PRAD-05 - Bota-fora 07</option>
                    <option value="PRAD-08 - Bota-fora 10 (Umburanas 01)">PRAD-08 - Bota-fora 10</option>
                    <option value="PRAD-17 - Canteiro Principal (Umburanas 08)">PRAD-17 - Canteiro Principal</option>
                    <option value="PRAD-26 - Canteiro de Apoio 05 (Umburanas 17)">PRAD-26 - Canteiro de Apoio 05</option>
                    <option value="PRAD-30 - Jazida Santo Anjo (Umburanas 05)">PRAD-30 - Jazida Santo Anjo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#17211B] mb-1">Responsável Técnico *</label>
                  <input
                    type="text"
                    required
                    value={newPhotoForm.responsible}
                    onChange={(e) => setNewPhotoForm({ ...newPhotoForm, responsible: e.target.value })}
                    className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4] focus:outline-none focus:border-[#00A651]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#17211B] mb-1">UTM Easting (E) *</label>
                  <input
                    type="number"
                    required
                    value={newPhotoForm.easting}
                    onChange={(e) => setNewPhotoForm({ ...newPhotoForm, easting: Number(e.target.value) })}
                    className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4] focus:outline-none focus:border-[#00A651] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#17211B] mb-1">UTM Northing (N) *</label>
                  <input
                    type="number"
                    required
                    value={newPhotoForm.northing}
                    onChange={(e) => setNewPhotoForm({ ...newPhotoForm, northing: Number(e.target.value) })}
                    className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4] focus:outline-none focus:border-[#00A651] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#17211B] mb-1">Arquivo de Imagem (JPG/PNG) *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewPhotoForm({ ...newPhotoForm, file: e.target.files?.[0] || null })}
                  className="w-full p-2 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4] text-xs cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-[#17211B] mb-1">Observações Técnicas</label>
                <textarea
                  rows={2}
                  value={newPhotoForm.notes}
                  onChange={(e) => setNewPhotoForm({ ...newPhotoForm, notes: e.target.value })}
                  className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4] focus:outline-none focus:border-[#00A651]"
                  placeholder="Descreva detalhes adicionais da atividade realizada no campo..."
                />
              </div>

              <div className="pt-3 border-t border-[#DDE4DE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-[#DDE4DE] rounded-xl text-[#5F6D65] font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingPhoto}
                  className="px-5 py-2 bg-[#365314] hover:bg-[#283e0e] text-white font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingPhoto ? 'Cadastrando...' : 'Salvar Fotografia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PHOTO MODAL */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#DDE4DE] shadow-2xl font-sans">
            <div className="bg-[#17211B] text-white px-4 py-3 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Editar Fotografia</h3>
              </div>
              <button onClick={() => setEditingPhoto(null)} className="text-white/70 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#17211B] mb-1">Código da Foto</label>
                <input
                  type="text"
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                  className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4] focus:outline-none focus:border-[#00A651] font-mono"
                  placeholder="Ex: P-01"
                />
              </div>
              <div>
                <label className="block font-bold text-[#17211B] mb-1">Atividade</label>
                <input
                  type="text"
                  value={editForm.activity}
                  onChange={(e) => setEditForm({ ...editForm, activity: e.target.value })}
                  className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4] focus:outline-none focus:border-[#00A651]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#17211B] mb-1">Área / Local</label>
                <input
                  type="text"
                  value={editForm.local}
                  onChange={(e) => setEditForm({ ...editForm, local: e.target.value })}
                  className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4] focus:outline-none focus:border-[#00A651]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#17211B] mb-1">Responsável Técnico</label>
                <input
                  type="text"
                  value={editForm.responsible}
                  onChange={(e) => setEditForm({ ...editForm, responsible: e.target.value })}
                  className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4] focus:outline-none focus:border-[#00A651]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#17211B] mb-1">Observações</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4] focus:outline-none focus:border-[#00A651]"
                />
              </div>
              <div className="pt-3 border-t border-[#DDE4DE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="px-4 py-2 border border-[#DDE4DE] rounded-xl text-[#5F6D65] font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
