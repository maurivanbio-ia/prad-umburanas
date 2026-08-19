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
  Share2,
  Check,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export default function GaleriaPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [activeMapPhoto, setActiveMapPhoto] = useState<any | null>(null);
  const [basemapType, setBasemapType] = useState<'satellite' | 'vector' | 'terrain'>('satellite');
  const [search, setSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [pradFilter, setPradFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('split');
  const [minimapZoom, setMinimapZoom] = useState(15);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [search, activityFilter, pradFilter]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (activityFilter) q.set('activity', activityFilter);
      if (pradFilter) q.set('pradCode', pradFilter);

      const res = await fetch(`/api/photos?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPhotos(data.photos);
        if (data.photos.length > 0) {
          setActiveMapPhoto((prev: any) => {
            // Keep current if still in list, else set to first
            if (prev && data.photos.some((p: any) => p.id === prev.id)) return prev;
            return data.photos[0];
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const georeferencedPhotos = photos.filter((p) => p.is_georeferenced !== false);

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

  const handleDeletePhoto = (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Tem certeza que deseja remover esta fotografia do acervo?')) return;
    setPhotos((prev: any[]) => prev.filter((p: any) => p.id !== photoId));
    if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
    if (activeMapPhoto?.id === photoId) setActiveMapPhoto(null);
  };

  const handleOpenEdit = (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPhoto(p);
    setEditForm({
      code: p.code || '',
      activity: p.activity || '',
      local: p.local || '',
      notes: p.notes || '',
      responsible: p.responsible || '',
    });
  };

  const handleSaveEdit = () => {
    setPhotos((prev: any[]) =>
      prev.map((p: any) => (p.id === editingPhoto.id ? { ...p, ...editForm } : p))
    );
    if (activeMapPhoto?.id === editingPhoto.id) {
      setActiveMapPhoto((prev: any) => ({ ...prev, ...editForm }));
    }
    if (selectedPhoto?.id === editingPhoto.id) {
      setSelectedPhoto((prev: any) => ({ ...prev, ...editForm }));
    }
    setEditingPhoto(null);
  };

  const handleSharePhoto = (photo: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/geoportal?lat=${photo.lat}&lng=${photo.lng}&zoom=17`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
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

      await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      });

      const newPhotoObj = {
        id: `photo-${Date.now()}`,
        file_name: newPhotoForm.activity,
        storage_path: newPhotoForm.file ? URL.createObjectURL(newPhotoForm.file) : '/figuras/P-16_PRAD17_limpeza_17ago2026.jpeg',
        captured_at: new Date().toISOString(),
        display_date: new Date().toLocaleDateString('pt-BR'),
        easting: newPhotoForm.easting,
        northing: newPhotoForm.northing,
        lat: -10.63,
        lng: -41.53,
        code: `P-${String(photos.length + 1).padStart(2, '0')}`,
        local: newPhotoForm.local,
        activity: newPhotoForm.activity,
        notes: newPhotoForm.notes,
        responsible: newPhotoForm.responsible,
        is_georeferenced: true,
      };

      setPhotos((prev) => [newPhotoObj, ...prev]);
      setSelectedPhoto(newPhotoObj);
      setActiveMapPhoto(newPhotoObj);
      setIsUploadModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPhoto(false);
    }
  };

  // Distinct PRAD areas for filter
  const distinctPrads = [
    { code: '', label: 'Todas as Áreas PRAD' },
    { code: 'PRAD-01', label: 'PRAD-01 • Bota-fora 01' },
    { code: 'PRAD-17', label: 'PRAD-17 • Canteiro Central (9 fotos)' },
    { code: 'PRAD-25', label: 'PRAD-25 • Bota-fora 25' },
    { code: 'PRAD-27', label: 'PRAD-27 • Bota-fora 27' },
    { code: 'PRAD-30', label: 'PRAD-30 • Jazida Santo Anjo (2 fotos)' },
    { code: 'PRAD-33', label: 'PRAD-33 • Jazida do Alegre (2 fotos)' },
  ];

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
            {copiedLink && (
              <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link copiado!</span>
              </span>
            )}

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
                className={`px-3 py-1 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-[#3B4E00] text-white font-semibold' : 'text-[#5F6D65]'
                }`}
              >
                Galeria
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded transition-colors ${
                  viewMode === 'split' ? 'bg-[#3B4E00] text-white font-semibold' : 'text-[#5F6D65]'
                }`}
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
              placeholder="Buscar por código, local, atividade ou observação..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-[#DDE4DE] rounded-lg focus:outline-none focus:border-[#00A651] bg-[#F5F7F4]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#5F6D65]" />
            <select
              value={pradFilter}
              onChange={(e) => setPradFilter(e.target.value)}
              className="px-3 py-1.5 border border-[#DDE4DE] rounded-lg bg-white text-[#17211B] font-medium"
            >
              {distinctPrads.map((dp) => (
                <option key={dp.code} value={dp.code}>
                  {dp.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="px-3 py-1.5 border border-[#DDE4DE] rounded-lg bg-white text-[#17211B] font-medium"
          >
            <option value="">Todas as Atividades</option>
            <option value="COLETA DE SOLO">Coleta de Solo</option>
            <option value="LIMPEZA">Limpeza & Preparo de Solo</option>
          </select>
        </div>

        {/* LOADING SKELETON */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#DDE4DE] p-3 space-y-3">
                <div className="aspect-video bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DDE4DE] p-12 text-center text-[#5F6D65] space-y-2">
            <Camera className="w-10 h-10 mx-auto text-slate-300" />
            <strong className="block text-sm text-[#17211B]">Nenhuma fotografia encontrada</strong>
            <p className="text-xs">Tente ajustar seus filtros de busca ou cadastre uma nova foto.</p>
          </div>
        ) : viewMode === 'split' ? (
          /* SPLIT VIEW MODE: MAPA + GALERIA */
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
                  <button
                    onClick={() => setBasemapType('satellite')}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md transition-all cursor-pointer min-w-[60px] ${
                      basemapType === 'satellite'
                        ? 'bg-[#00A651] text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Satélite"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="2" />
                      <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
                    </svg>
                    <span>Satélite</span>
                  </button>

                  <button
                    onClick={() => setBasemapType('vector')}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md transition-all cursor-pointer min-w-[60px] ${
                      basemapType === 'vector'
                        ? 'bg-[#00A651] text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Vetorial"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6l6 6 4-4 8 8" />
                      <path d="M21 3H3v18h18V3z" strokeOpacity="0.4" />
                      <path d="M3 12h18M12 3v18" strokeOpacity="0.3" />
                    </svg>
                    <span>Vetorial</span>
                  </button>

                  <button
                    onClick={() => setBasemapType('terrain')}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md transition-all cursor-pointer min-w-[60px] ${
                      basemapType === 'terrain'
                        ? 'bg-[#00A651] text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Terreno"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 20l5-10 4 6 3-4 6 8H3z" />
                    </svg>
                    <span>Terreno</span>
                  </button>
                </div>
              </div>

              {/* Minimap Viewport */}
              <div className="flex-1 relative bg-slate-900 overflow-hidden flex flex-col justify-between p-4">
                {/* Dynamic Tile Grid */}
                {(() => {
                  const currentPhoto = activeMapPhoto || georeferencedPhotos[0];
                  const lat = currentPhoto?.lat ?? -10.590748;
                  const lng = currentPhoto?.lng ?? -41.472719;
                  const z = minimapZoom;

                  const lat_r = (lat * Math.PI) / 180;
                  const n = Math.pow(2, z);
                  const centerTileX = Math.floor(((lng + 180) / 360) * n);
                  const centerTileY = Math.floor(
                    ((1 - Math.log(Math.tan(lat_r) + 1 / Math.cos(lat_r)) / Math.PI) / 2) * n
                  );

                  const fracX = ((lng + 180) / 360) * n - centerTileX;
                  const fracY =
                    ((1 - Math.log(Math.tan(lat_r) + 1 / Math.cos(lat_r)) / Math.PI) / 2) * n - centerTileY;

                  const TILE_SIZE = 256;
                  const GRID = 5;
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

                  const offsetX = -fracX * TILE_SIZE;
                  const offsetY = -fracY * TILE_SIZE;

                  return (
                    <div className="absolute inset-0 overflow-hidden" style={{ opacity: 0.95 }}>
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

                {/* Minimap Zoom Controls */}
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

                {/* Selected Photo Info Box */}
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
                                src={currentPhoto.storage_path || currentPhoto.storagePath}
                                alt={currentPhoto.file_name}
                                className="w-16 h-14 rounded-md object-cover border border-[#DDE4DE] flex-shrink-0 shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.src = '/figuras/P-16_PRAD17_limpeza_17ago2026.jpeg';
                                }}
                              />
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <strong className="text-xs text-[#17211B] font-bold block truncate">
                                    {currentPhoto.code || 'P-01'} • {currentPhoto.local}
                                  </strong>
                                </div>
                                <span className="text-[10px] text-[#00A651] font-semibold block truncate">
                                  {currentPhoto.activity}
                                </span>
                                <div className="flex items-center justify-between pt-0.5">
                                  <span className="text-[9px] text-[#5F6D65] font-mono block">
                                    E {currentPhoto.easting ? Number(currentPhoto.easting).toLocaleString('pt-BR') : '229.273'} m | N{' '}
                                    {currentPhoto.northing ? Number(currentPhoto.northing).toLocaleString('pt-BR') : '8.828.407'} m
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={(e) => handleSharePhoto(currentPhoto, e)}
                                      className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 p-1 rounded-md font-bold transition-colors cursor-pointer"
                                      title="Copiar link georreferenciado"
                                    >
                                      <Share2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => setSelectedPhoto(currentPhoto)}
                                      className="text-[9px] bg-[#365314] text-white px-2 py-0.5 rounded-md font-bold hover:bg-[#283e0e] transition-colors cursor-pointer"
                                    >
                                      Ver Foto 👁️
                                    </button>
                                  </div>
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

                      {/* Center Pin Marker */}
                      <div className="relative z-10 my-auto flex flex-col items-center justify-center animate-bounce">
                        <div className="bg-[#365314] text-white p-2 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-2 font-bold text-xs max-w-[260px]">
                          <img
                            src={currentPhoto?.storage_path || currentPhoto?.storagePath || '/figuras/P-16_PRAD17_limpeza_17ago2026.jpeg'}
                            alt="Thumb"
                            className="w-7 h-7 rounded-full object-cover border-2 border-emerald-400 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = '/figuras/P-16_PRAD17_limpeza_17ago2026.jpeg';
                            }}
                          />
                          <div className="min-w-0">
                            <span className="truncate block font-bold text-[11px]">
                              {currentPhoto ? `${currentPhoto.code} • ${currentPhoto.activity || currentPhoto.file_name}` : 'Foto de Campo'}
                            </span>
                            <span className="text-[9px] text-emerald-300 block font-mono truncate">
                              {currentPhoto ? currentPhoto.local : 'Gleba PRAD'}
                            </span>
                          </div>
                        </div>
                        <div className="w-3.5 h-3.5 bg-[#365314] rotate-45 -mt-1.5 border-r-2 border-b-2 border-white shadow-md" />
                      </div>

                      {/* Direct Zoom Link Button */}
                      <div className="relative z-10 pt-3">
                        <a
                          href={currentPhoto?.lat ? `/geoportal?lat=${currentPhoto.lat}&lng=${currentPhoto.lng}&zoom=17` : '/geoportal'}
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

            {/* Right Column: Scrollable Photo Cards List with Edit / Delete */}
            <div className="lg:col-span-7 overflow-y-auto space-y-4 pr-1">
              {(
                Object.entries(
                  georeferencedPhotos.reduce((acc: Record<string, any[]>, photo: any) => {
                    const areaKey = photo.local || 'Área PRAD de Campo';
                    if (!acc[areaKey]) acc[areaKey] = [];
                    acc[areaKey].push(photo);
                    return acc;
                  }, {})
                ) as [string, any[]][]
              ).map(([areaName, areaPhotos]) => (
                <div key={areaName} className="bg-white p-4 rounded-2xl border border-[#DDE4DE] shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-[#DDE4DE] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#365314] text-white font-bold text-[10px]">PRAD</span>
                      <strong className="text-xs text-[#17211B] font-bold">{areaName}</strong>
                    </div>
                    <span className="text-[10px] text-[#5F6D65] font-mono bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                      {areaPhotos.length} {areaPhotos.length === 1 ? 'Foto' : 'Fotos'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {areaPhotos.map((p: any) => {
                      const isActive = (activeMapPhoto?.id || georeferencedPhotos[0]?.id) === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setActiveMapPhoto(p)}
                          className={`rounded-xl border overflow-hidden transition-all cursor-pointer group flex flex-col shadow-sm relative ${
                            isActive
                              ? 'border-[#00A651] ring-2 ring-[#00A651]/30 bg-emerald-50/40 shadow-md'
                              : 'bg-[#F5F7F4] border-[#DDE4DE] hover:border-[#3B4E00]'
                          }`}
                        >
                          <div className="relative aspect-video bg-slate-900 overflow-hidden">
                            <img
                              src={p.storage_path || p.storagePath}
                              alt={p.file_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src = '/figuras/P-16_PRAD17_limpeza_17ago2026.jpeg';
                              }}
                            />
                            <span className="absolute top-2 right-2 bg-[#00A651] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                              {isActive ? '📍 DESTACADA' : 'UTM 24L'}
                            </span>

                            {/* Top Left Action Buttons (Edit, Delete, Share) */}
                            <div className="absolute top-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleOpenEdit(p, e)}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-md shadow transition-colors cursor-pointer"
                                title="Editar dados da foto"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => handleDeletePhoto(p.id, e)}
                                className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-md shadow transition-colors cursor-pointer"
                                title="Deletar foto"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => handleSharePhoto(p, e)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-md shadow transition-colors cursor-pointer"
                                title="Copiar link"
                              >
                                <Share2 className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPhoto(p);
                              }}
                              className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-[9px] font-bold px-2 py-1 rounded-md backdrop-blur-xs flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Expandir foto em tela cheia"
                            >
                              <Eye className="w-3 h-3 text-emerald-400" />
                              <span>Ampliar</span>
                            </button>
                          </div>
                          <div className="p-2.5 text-xs bg-white space-y-1">
                            <span className="font-bold text-[#17211B] block truncate text-[11px]">
                              {p.code || 'P-01'} • {p.activity || p.file_name}
                            </span>
                            <span className="text-[#00A651] font-semibold block text-[10px] truncate">{p.local}</span>
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
                <MapPin className="w-4.5 h-4.5 text-[#00A651]" /> Fotografias Georreferenciadas Separadas por Área PRAD (
                {georeferencedPhotos.length})
              </h2>
              <span className="text-xs text-[#5F6D65] font-mono">UTM 24L / SIRGAS 2000</span>
            </div>

            {/* Grouped Area Sections */}
            {(
              Object.entries(
                georeferencedPhotos.reduce((acc: Record<string, any[]>, photo: any) => {
                  const areaKey = photo.local || 'Área PRAD de Campo';
                  if (!acc[areaKey]) acc[areaKey] = [];
                  acc[areaKey].push(photo);
                  return acc;
                }, {})
              ) as [string, any[]][]
            ).map(([areaName, areaPhotos]) => (
              <div key={areaName} className="bg-white p-4.5 rounded-2xl border border-[#DDE4DE] shadow-sm space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE4DE] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#365314] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      PRAD
                    </div>
                    <div>
                      <strong className="text-sm text-[#17211B] font-bold block">{areaName}</strong>
                      <span className="text-[11px] text-[#5F6D65] font-mono">
                        {areaPhotos.length} {areaPhotos.length === 1 ? 'Fotografia Georreferenciada' : 'Fotografias Georreferenciadas'}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`/geoportal?search=${encodeURIComponent(areaPhotos[0]?.pradCode || 'PRAD-17')}`}
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
                      className="rounded-xl border border-[#DDE4DE] overflow-hidden bg-[#F5F7F4] flex flex-col group hover:shadow-md transition-all hover:border-[#3B4E00]"
                    >
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        <img
                          src={p.storage_path || p.storagePath}
                          alt={p.file_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = '/figuras/P-16_PRAD17_limpeza_17ago2026.jpeg';
                          }}
                        />
                        <span className="absolute top-2 right-2 bg-[#00A651] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                          {p.code || 'P-01'}
                        </span>

                        {/* Hover Action Buttons */}
                        <div className="absolute top-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleOpenEdit(p, e)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-md shadow transition-colors cursor-pointer"
                            title="Editar dados da foto"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeletePhoto(p.id, e)}
                            className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-md shadow transition-colors cursor-pointer"
                            title="Deletar foto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleSharePhoto(p, e)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-md shadow transition-colors cursor-pointer"
                            title="Copiar link"
                          >
                            <Share2 className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => setSelectedPhoto(p)}
                          className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-[9px] font-bold px-2 py-1 rounded-md backdrop-blur-xs flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Expandir foto em tela cheia"
                        >
                          <Eye className="w-3 h-3 text-emerald-400" />
                          <span>Ampliar</span>
                        </button>
                      </div>

                      <div className="p-3 text-xs bg-white space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <strong className="font-bold text-[#17211B] block truncate text-[11px]">
                            {p.code || 'P-01'} • {p.activity || p.file_name}
                          </strong>
                          <span className="text-[10px] text-[#00A651] font-semibold block truncate">{p.local}</span>
                        </div>

                        <div className="pt-2 border-t border-[#DDE4DE] flex items-center justify-between text-[9px] text-[#5F6D65] font-mono">
                          <span>{p.display_date || p.capturedAt || '17/08/2026'}</span>
                          <span>E {p.easting ? Number(p.easting).toLocaleString('pt-BR') : '229.273'}</span>
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

      {/* 🖼️ LIGHTBOX MODAL (PHOTO PREVIEW) */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DDE4DE] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-[#17211B] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#00A651]" />
                <h3 className="font-bold text-sm">
                  {selectedPhoto.code || 'P-01'} • {selectedPhoto.activity || selectedPhoto.file_name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleSharePhoto(selectedPhoto, e)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copiar link com coordenadas"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartilhar</span>
                </button>
                <button onClick={() => setSelectedPhoto(null)} className="text-white/70 hover:text-white p-1 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-y-auto">
              <div className="md:col-span-2 bg-slate-950 flex items-center justify-center p-2 min-h-[350px]">
                <img
                  src={selectedPhoto.storage_path || selectedPhoto.storagePath}
                  alt={selectedPhoto.file_name}
                  className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/figuras/P-16_PRAD17_limpeza_17ago2026.jpeg';
                  }}
                />
              </div>

              <div className="p-5 space-y-4 bg-white text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#5F6D65] uppercase font-bold tracking-wider">Área / Local</span>
                  <strong className="text-sm text-[#17211B] block font-bold">{selectedPhoto.local}</strong>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-[#5F6D65] uppercase font-bold tracking-wider">Atividade Técnica</span>
                  <p className="text-xs text-[#00A651] font-bold">{selectedPhoto.activity}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#F5F7F4] p-3 rounded-xl border border-[#DDE4DE]">
                  <div>
                    <span className="text-[9px] text-[#5F6D65] uppercase font-mono block">Easting (E)</span>
                    <strong className="text-xs text-[#17211B] font-mono">
                      {selectedPhoto.easting ? Number(selectedPhoto.easting).toLocaleString('pt-BR') : '229.273'} m
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#5F6D65] uppercase font-mono block">Northing (N)</span>
                    <strong className="text-xs text-[#17211B] font-mono">
                      {selectedPhoto.northing ? Number(selectedPhoto.northing).toLocaleString('pt-BR') : '8.828.407'} m
                    </strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-[#5F6D65] uppercase font-bold tracking-wider">Responsável Técnico</span>
                  <p className="text-xs text-[#17211B]">{selectedPhoto.responsible || 'Equipe Ambiental EcoBrasil'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-[#5F6D65] uppercase font-bold tracking-wider">Observações de Campo</span>
                  <p className="text-xs text-slate-600 bg-[#F5F7F4] p-2.5 rounded-lg border border-[#DDE4DE]">
                    {selectedPhoto.notes || 'Registro fotográfico georreferenciado de campo com precisão submétrica.'}
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={`/geoportal?lat=${selectedPhoto.lat || -10.590748}&lng=${selectedPhoto.lng || -41.472719}&zoom=17`}
                    className="w-full py-2.5 px-3 bg-[#365314] hover:bg-[#283e0e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Ver Local no Geoportal 2D</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📷 MODAL FOR INSERTING NEW FIELD PHOTO */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DDE4DE] max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#DDE4DE] pb-3">
              <h3 className="font-bold text-base text-[#17211B] flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#00A651]" />
                <span>Cadastrar Nova Fotografia de Campo</span>
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-[#5F6D65] hover:text-[#17211B] cursor-pointer">
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
                    <option value="PRAD-01 - BOTA FORA 01">PRAD-01 - Bota fora 01</option>
                    <option value="PRAD-17 - CANTEIRO CENTRAL">PRAD-17 - Canteiro Central</option>
                    <option value="PRAD-25 - BOTA FORA 25">PRAD-25 - Bota fora 25</option>
                    <option value="PRAD-27 - BOTA FORA 27">PRAD-27 - Bota fora 27</option>
                    <option value="PRAD-30 - JAZIDA SANTO ANJO">PRAD-30 - Jazida Santo Anjo</option>
                    <option value="PRAD-33 - JAZIDA DO ALEGRE">PRAD-33 - Jazida do Alegre</option>
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
