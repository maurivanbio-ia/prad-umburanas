"use client";

import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Header from "@/components/layout/Header";
import {
  Wind,
  Sun,
  Layers,
  Camera,
  Play,
  Pause,
  Compass,
  MapPin,
  Trees,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Download,
  FileText,
  Activity,
  Globe,
  Mountain,
} from "lucide-react";
import { EXCEL_38_AREAS } from "@/data/excelData";
import { EXCEL_PHOTOS } from "@/data/photos";
import { jsPDF } from "jspdf";

export default function MapViewer3D() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // 3D Controls
  const [solarHour, setSolarHour] = useState<number>(14.5); // 14:30
  const [isDroneFlying, setIsDroneFlying] = useState<boolean>(false);
  const [selectedTurbine, setSelectedTurbine] = useState<any | null>(null);
  const [selectedPrad, setSelectedPrad] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'resumo' | 'fotos' | 'tecnico'>('resumo');

  // Layer Toggles
  const [showTurbines, setShowTurbines] = useState<boolean>(true);
  const [showContours, setShowContours] = useState<boolean>(true);
  const [showPradPillars, setShowPradPillars] = useState<boolean>(true);
  const [showSpe3D, setShowSpe3D] = useState<boolean>(true);
  const [showShadows, setShowShadows] = useState<boolean>(true);

  const [isLayerDrawerOpen, setIsLayerDrawerOpen] = useState<boolean>(false);
  const [quickSearch, setQuickSearch] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Base Style Mode ('satellite' | 'terrain' | 'carto')
  const [baseMapStyle, setBaseMapStyle] = useState<'satellite' | 'terrain' | 'carto'>('satellite');

  // Filtered search results
  const searchResults = quickSearch.trim()
    ? EXCEL_38_AREAS.filter(
        (a) =>
          a.pradCode.toLowerCase().includes(quickSearch.toLowerCase()) ||
          a.name.toLowerCase().includes(quickSearch.toLowerCase()) ||
          a.wind_complex.toLowerCase().includes(quickSearch.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (!mapContainer.current) return;

    const styleUrl =
      baseMapStyle === 'satellite'
        ? {
            version: 8 as const,
            sources: {
              satellite: {
                type: 'raster' as const,
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
              },
            },
            layers: [
              {
                id: 'satellite-bg',
                type: 'raster' as const,
                source: 'satellite',
                minzoom: 0,
                maxzoom: 19,
              },
            ],
          }
        : baseMapStyle === 'terrain'
        ? {
            version: 8 as const,
            sources: {
              terrain: {
                type: 'raster' as const,
                tiles: ['https://a.tile.opentopomap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
              },
            },
            layers: [
              {
                id: 'terrain-bg',
                type: 'raster' as const,
                source: 'terrain',
                minzoom: 0,
                maxzoom: 17,
              },
            ],
          }
        : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [-41.53, -10.63],
      zoom: 12.8,
      pitch: 58,
      bearing: -22,
      maxPitch: 80,
    });

    mapInstance.on('load', async () => {
      try {
        // 1. Fetch 144 Aerogeradores
        const aeroRes = await fetch('/api/layers?layer=aerogeradores');
        const aeroData = await aeroRes.json();

        // 2. Fetch Parques SPE
        const speRes = await fetch('/api/layers?layer=spe');
        const speData = await speRes.json();

        // 3. Fetch Poligonal CEUR
        const ceurRes = await fetch('/api/layers?layer=ceur');
        const ceurData = await ceurRes.json();

        // 4. Curvas de Nível da Serra de Umburanas (Elegantes e finas)
        const contourFeatures: any[] = [];
        const baseCenterLng = -41.53;
        const baseCenterLat = -10.63;

        for (let elevation = 800; elevation <= 1050; elevation += 25) {
          const radiusX = 0.05 - ((elevation - 800) / 250) * 0.025;
          const radiusY = 0.09 - ((elevation - 800) / 250) * 0.035;
          const coords: [number, number][] = [];

          for (let deg = 0; deg <= 360; deg += 10) {
            const rad = (deg * Math.PI) / 180;
            const wave = Math.sin(deg * 4 * (Math.PI / 180)) * 0.003;
            const lng = baseCenterLng + (radiusX + wave) * Math.cos(rad);
            const lat = baseCenterLat + (radiusY + wave) * Math.sin(rad);
            coords.push([lng, lat]);
          }

          contourFeatures.push({
            type: 'Feature' as const,
            geometry: { type: 'LineString' as const, coordinates: coords },
            properties: {
              elevation: `${elevation} m`,
              height: elevation,
              color: elevation >= 1000 ? '#F59E0B' : elevation >= 900 ? '#10B981' : '#059669',
            },
          });
        }

        mapInstance.addSource('contours-3d-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: contourFeatures } as any,
        });

        mapInstance.addLayer({
          id: 'contours-3d-lines',
          type: 'line',
          source: 'contours-3d-source',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 1.2,
            'line-opacity': 0.65,
            'line-dasharray': [4, 2],
          },
        });

        // 5. Parques SPE 3D
        if (speData.features) {
          mapInstance.addSource('spe-3d-source', { type: 'geojson', data: speData });
          mapInstance.addLayer({
            id: 'spe-3d-fill',
            type: 'fill',
            source: 'spe-3d-source',
            paint: {
              'fill-color': '#00A651',
              'fill-opacity': 0.08,
              'fill-outline-color': '#00A651',
            },
          });
          mapInstance.addLayer({
            id: 'spe-3d-line',
            type: 'line',
            source: 'spe-3d-source',
            paint: {
              'line-color': '#00A651',
              'line-width': 1.8,
            },
          });
        }

        // 6. Poligonal CEUR
        if (ceurData.features) {
          mapInstance.addSource('ceur-3d-source', { type: 'geojson', data: ceurData });
          mapInstance.addLayer({
            id: 'ceur-3d-line',
            type: 'line',
            source: 'ceur-3d-source',
            paint: {
              'line-color': '#F59E0B',
              'line-width': 2,
              'line-dasharray': [3, 2],
            },
          });
        }

        // 7. 38 Áreas PRAD 3D (Pillars com halo e clique)
        const pradPillars = EXCEL_38_AREAS.map((a, i) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [-41.53 + (i * 0.002), -10.63 + (i * 0.002)],
          },
          properties: {
            ...a,
          },
        }));

        mapInstance.addSource('prad-3d-pillars-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: pradPillars } as any,
        });

        mapInstance.addLayer({
          id: 'prad-3d-halo',
          type: 'circle',
          source: 'prad-3d-pillars-source',
          paint: {
            'circle-radius': 12,
            'circle-color': '#00A651',
            'circle-opacity': 0.3,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#FFFFFF',
          },
        });

        mapInstance.addLayer({
          id: 'prad-3d-center',
          type: 'circle',
          source: 'prad-3d-pillars-source',
          paint: {
            'circle-radius': 5,
            'circle-color': '#365314',
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#FFFFFF',
          },
        });

        mapInstance.on('click', 'prad-3d-halo', (e) => {
          if (!e.features || e.features.length === 0) return;
          const props = e.features[0].properties;
          setSelectedPrad(props);
          setSelectedTurbine(null);
          setActiveTab('resumo');
        });

        mapInstance.on('mouseenter', 'prad-3d-halo', () => {
          mapInstance.getCanvas().style.cursor = 'pointer';
        });
        mapInstance.on('mouseleave', 'prad-3d-halo', () => {
          mapInstance.getCanvas().style.cursor = '';
        });

        // 8. 144 Aerogeradores 3D
        if (aeroData.features) {
          mapInstance.addSource('turbines-3d-source', { type: 'geojson', data: aeroData });

          // Sombras solares
          mapInstance.addLayer({
            id: 'turbines-shadow-layer',
            type: 'circle',
            source: 'turbines-3d-source',
            paint: {
              'circle-radius': 10,
              'circle-color': '#000000',
              'circle-opacity': 0.35,
              'circle-blur': 0.6,
            },
          });

          // Base da torre
          mapInstance.addLayer({
            id: 'turbines-base-circle',
            type: 'circle',
            source: 'turbines-3d-source',
            paint: {
              'circle-radius': 6,
              'circle-color': '#FFFFFF',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#334155',
            },
          });

          // Baliza de sinalização de topo
          mapInstance.addLayer({
            id: 'turbines-beacon-dot',
            type: 'circle',
            source: 'turbines-3d-source',
            paint: {
              'circle-radius': 2.5,
              'circle-color': '#EF4444',
            },
          });

          mapInstance.on('click', 'turbines-base-circle', (e) => {
            if (!e.features || e.features.length === 0) return;
            const props = e.features[0].properties;
            setSelectedTurbine(props);
            setSelectedPrad(null);
          });

          mapInstance.on('mouseenter', 'turbines-base-circle', () => {
            mapInstance.getCanvas().style.cursor = 'pointer';
          });
          mapInstance.on('mouseleave', 'turbines-base-circle', () => {
            mapInstance.getCanvas().style.cursor = '';
          });
        }
      } catch (err) {
        console.error('Error loading 3D layers:', err);
      }
    });

    map.current = mapInstance;

    return () => {
      mapInstance.remove();
      map.current = null;
    };
  }, [baseMapStyle]);

  // Solar Shadow Dynamics
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;
    if (m.getLayer('turbines-shadow-layer')) {
      const angle = ((solarHour - 12) / 6) * Math.PI;
      const length = Math.max(3, Math.abs(solarHour - 12) * 4 + 3);
      const offsetX = Math.sin(angle) * length;
      const offsetY = Math.cos(angle) * (length * 0.6);

      try {
        m.setPaintProperty('turbines-shadow-layer', 'circle-translate', [offsetX, offsetY]);
        m.setPaintProperty('turbines-shadow-layer', 'circle-opacity', showShadows ? 0.35 : 0.0);
      } catch (e) {}
    }
  }, [solarHour, showShadows]);

  // Layer Toggles
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;
    const toggle = (layerId: string, visible: boolean) => {
      if (m.getLayer(layerId)) {
        m.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    toggle('contours-3d-lines', showContours);
    toggle('turbines-base-circle', showTurbines);
    toggle('turbines-beacon-dot', showTurbines);
    toggle('turbines-shadow-layer', showTurbines && showShadows);
    toggle('prad-3d-halo', showPradPillars);
    toggle('prad-3d-center', showPradPillars);
    toggle('spe-3d-fill', showSpe3D);
    toggle('spe-3d-line', showSpe3D);
  }, [showTurbines, showContours, showPradPillars, showSpe3D, showShadows]);

  // Drone Flythrough
  useEffect(() => {
    let interval: any;
    if (isDroneFlying && map.current) {
      interval = setInterval(() => {
        if (!map.current) return;
        const currBearing = map.current.getBearing();
        map.current.easeTo({
          bearing: currBearing + 1.0,
          duration: 300,
          easing: (t) => t,
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isDroneFlying]);

  const handleSelectArea = (area: any) => {
    if (!map.current) return;
    const lat = area.lat ?? -10.63 + (area.number * 0.002);
    const lng = area.lng ?? -41.53 + (area.number * 0.002);

    map.current.flyTo({
      center: [lng, lat],
      zoom: 15.5,
      pitch: 65,
      duration: 1500,
      essential: true,
    });

    setSelectedPrad(area);
    setSelectedTurbine(null);
    setQuickSearch('');
    setIsSearchOpen(false);
  };

  const handleExportPDF = (prad: any) => {
    if (!prad) return;
    const doc = new jsPDF();
    doc.setFillColor(18, 24, 18);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ENGIE & EcoBrasil • FICHA TÉCNICA 3D', 14, 18);
    doc.save(`Ficha_3D_${prad.pradCode || 'PRAD'}.pdf`);
  };

  return (
    <div className="relative w-full h-screen bg-[#F5F7F4] overflow-hidden font-sans text-[#17211B]">
      <Header />

      {/* 100% 3D VIEWPORT CANVAS */}
      <div ref={mapContainer} className="w-full h-[calc(100vh-56px)] pl-20" />

      {/* TOP FLOATING SLIM WORKSTATION BAR (Clean White Design System) */}
      <div className="absolute top-18 left-24 z-20 flex items-center space-x-2 flex-wrap gap-y-2">
        {/* Quick Search */}
        <div className="relative">
          <div className="bg-white px-3 py-1.5 rounded-2xl border border-[#DDE4DE] shadow-md flex items-center gap-2 text-xs w-60 focus-within:ring-2 focus-within:ring-[#00A651] transition-all">
            <Search className="w-3.5 h-3.5 text-[#5F6D65] flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar no Gêmeo 3D..."
              value={quickSearch}
              onChange={(e) => {
                setQuickSearch(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-transparent focus:outline-none text-xs text-[#17211B] placeholder:text-[#5F6D65]"
            />
            {quickSearch && (
              <button
                onClick={() => {
                  setQuickSearch('');
                  setIsSearchOpen(false);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl border border-[#DDE4DE] shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-[#DDE4DE] text-xs">
              {searchResults.map((area) => (
                <div
                  key={area.id}
                  onClick={() => handleSelectArea(area)}
                  className="p-2.5 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-[#365314] text-white px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">
                        {area.pradCode}
                      </span>
                      <strong className="text-xs text-[#17211B]">{area.name}</strong>
                    </div>
                    <span className="text-[10px] text-[#5F6D65] block mt-0.5">
                      {area.wind_complex} • {area.areaHa}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Basemap Switcher */}
        <div className="bg-white p-1 rounded-2xl border border-[#DDE4DE] shadow-md flex items-center space-x-1 text-xs">
          <button
            onClick={() => setBaseMapStyle('satellite')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              baseMapStyle === 'satellite' ? 'bg-[#3B4E00] text-white shadow-sm' : 'text-[#5F6D65] hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Satélite 3D</span>
          </button>
          <button
            onClick={() => setBaseMapStyle('terrain')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              baseMapStyle === 'terrain' ? 'bg-[#3B4E00] text-white shadow-sm' : 'text-[#5F6D65] hover:bg-slate-100'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>Relevo</span>
          </button>
        </div>

        {/* Solar Simulator Pill */}
        <div className="bg-white px-3 py-1.5 rounded-2xl border border-[#DDE4DE] shadow-md flex items-center space-x-2 text-xs">
          <Sun className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <input
            type="range"
            min="6"
            max="18"
            step="0.5"
            value={solarHour}
            onChange={(e) => setSolarHour(parseFloat(e.target.value))}
            className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            title="Horário Solar"
          />
          <span className="font-mono font-bold text-[#17211B] text-[11px] w-9 text-right">
            {Math.floor(solarHour).toString().padStart(2, '0')}:{Math.round((solarHour % 1) * 60).toString().padStart(2, '0')}h
          </span>
        </div>

        {/* Drone Flythrough Auto-Tour */}
        <button
          onClick={() => setIsDroneFlying(!isDroneFlying)}
          className={`px-3.5 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
            isDroneFlying
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-white border-[#DDE4DE] text-[#17211B] hover:bg-slate-50'
          }`}
        >
          {isDroneFlying ? <Pause className="w-3.5 h-3.5 text-amber-600" /> : <Play className="w-3.5 h-3.5 text-[#00A651]" />}
          <span>{isDroneFlying ? 'Pausar Voo' : 'Voo 3D'}</span>
        </button>

        {/* Reset Camera View */}
        <button
          onClick={() => {
            if (map.current) {
              map.current.flyTo({
                center: [-41.53, -10.63],
                zoom: 12.8,
                pitch: 58,
                bearing: -22,
                duration: 1200,
              });
            }
          }}
          className="bg-white hover:bg-slate-50 border border-[#DDE4DE] text-[#17211B] px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          title="Vista Panorâmica da Serra"
        >
          <Compass className="w-3.5 h-3.5 text-[#00A651]" />
          <span>Vista Geral</span>
        </button>
      </div>

      {/* FLOATING LAYER DRAWER (Collapsible at bottom-left) */}
      <div className="absolute bottom-6 left-24 z-20">
        {isLayerDrawerOpen ? (
          <div className="bg-white p-4 rounded-2xl border border-[#DDE4DE] shadow-2xl w-72 space-y-3 text-xs animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-[#DDE4DE] pb-2">
              <span className="font-bold text-xs text-[#17211B] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#00A651]" /> Camadas 3D
              </span>
              <button
                onClick={() => setIsLayerDrawerOpen(false)}
                className="text-[#5F6D65] hover:text-[#17211B] text-[10px] font-bold"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                <span className="flex items-center gap-2 text-slate-700">
                  <Wind className="w-4 h-4 text-sky-600" />
                  <span>144 Aerogeradores 3D</span>
                </span>
                <input
                  type="checkbox"
                  checked={showTurbines}
                  onChange={(e) => setShowTurbines(e.target.checked)}
                  className="rounded text-[#00A651] focus:ring-0 cursor-pointer w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3.5 h-0.5 bg-amber-500 inline-block border-t border-dashed" />
                  <span>Curvas de Nível (800-1050m)</span>
                </span>
                <input
                  type="checkbox"
                  checked={showContours}
                  onChange={(e) => setShowContours(e.target.checked)}
                  className="rounded text-[#00A651] focus:ring-0 cursor-pointer w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                <span className="flex items-center gap-2 text-slate-700">
                  <Trees className="w-4 h-4 text-[#00A651]" />
                  <span>38 Áreas PRAD (50,26 ha)</span>
                </span>
                <input
                  type="checkbox"
                  checked={showPradPillars}
                  onChange={(e) => setShowPradPillars(e.target.checked)}
                  className="rounded text-[#00A651] focus:ring-0 cursor-pointer w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-400 inline-block" />
                  <span>18 Parques SPE</span>
                </span>
                <input
                  type="checkbox"
                  checked={showSpe3D}
                  onChange={(e) => setShowSpe3D(e.target.checked)}
                  className="rounded text-[#00A651] focus:ring-0 cursor-pointer w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                <span className="flex items-center gap-2 text-slate-700">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Sombreamento Solar</span>
                </span>
                <input
                  type="checkbox"
                  checked={showShadows}
                  onChange={(e) => setShowShadows(e.target.checked)}
                  className="rounded text-[#00A651] focus:ring-0 cursor-pointer w-4 h-4"
                />
              </label>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsLayerDrawerOpen(true)}
            className="bg-white hover:bg-slate-50 text-[#17211B] border border-[#DDE4DE] shadow-xl px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#00A651]" />
            <span>Camadas 3D</span>
            <span className="bg-[#00A651] text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full">5</span>
          </button>
        )}
      </div>

      {/* INSPECTION DRAWER (Slide-over card for Selected PRAD or Turbine) */}
      {selectedPrad && (
        <div className="absolute top-18 right-6 z-30 w-88 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-[#DDE4DE] shadow-2xl overflow-hidden text-xs flex flex-col max-h-[82vh] animate-in fade-in duration-200">
          {/* Header */}
          <div className="p-4 border-b border-[#DDE4DE] bg-[#F5F7F4] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="bg-[#365314] text-white font-mono px-2 py-0.5 rounded text-[11px] font-bold flex-shrink-0">
                {selectedPrad.pradCode}
              </span>
              <h3 className="font-bold text-xs text-[#17211B] truncate">{selectedPrad.name}</h3>
            </div>
            <button
              onClick={() => setSelectedPrad(null)}
              className="text-[#5F6D65] hover:text-[#17211B] p-1 rounded-lg hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#DDE4DE] bg-white text-xs font-medium">
            <button
              onClick={() => setActiveTab('resumo')}
              className={`flex-1 py-2 text-center border-b-2 transition-all ${
                activeTab === 'resumo'
                  ? 'border-[#00A651] text-[#00A651] font-bold'
                  : 'border-transparent text-[#5F6D65] hover:text-[#17211B]'
              }`}
            >
              Resumo
            </button>
            <button
              onClick={() => setActiveTab('fotos')}
              className={`flex-1 py-2 text-center border-b-2 transition-all ${
                activeTab === 'fotos'
                  ? 'border-[#00A651] text-[#00A651] font-bold'
                  : 'border-transparent text-[#5F6D65] hover:text-[#17211B]'
              }`}
            >
              Fotos ({EXCEL_PHOTOS.filter((p) => p.pradCode === selectedPrad.pradCode).length})
            </button>
            <button
              onClick={() => setActiveTab('tecnico')}
              className={`flex-1 py-2 text-center border-b-2 transition-all ${
                activeTab === 'tecnico'
                  ? 'border-[#00A651] text-[#00A651] font-bold'
                  : 'border-transparent text-[#5F6D65] hover:text-[#17211B]'
              }`}
            >
              Técnico
            </button>
          </div>

          {/* Content Body */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {activeTab === 'resumo' && (
              <>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#F5F7F4] rounded-xl border border-[#DDE4DE]">
                    <span className="text-[10px] text-[#5F6D65] block uppercase font-bold">Parque Eólico</span>
                    <strong className="text-xs text-[#17211B]">{selectedPrad.wind_complex || selectedPrad.windComplex}</strong>
                  </div>
                  <div className="p-2.5 bg-[#F5F7F4] rounded-xl border border-[#DDE4DE]">
                    <span className="text-[10px] text-[#5F6D65] block uppercase font-bold">Superfície</span>
                    <strong className="text-xs text-[#00A651]">{selectedPrad.areaHa || `${selectedPrad.area_ha} ha`}</strong>
                  </div>
                </div>

                <div className="p-2.5 bg-[#F5F7F4] rounded-xl border border-[#DDE4DE] space-y-1">
                  <span className="text-[10px] text-[#5F6D65] block uppercase font-bold">Status Coleta de Solo</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17211B]">{selectedPrad.soil_collection_status || selectedPrad.soilCollectionStatus}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Concluído
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#F5F7F4] rounded-xl border border-[#DDE4DE] space-y-1">
                  <span className="text-[10px] text-[#5F6D65] block uppercase font-bold">Diagnóstico Técnico</span>
                  <p className="text-[11px] text-[#5F6D65] leading-relaxed">
                    {selectedPrad.notes || `Área PRAD sob intervenção de revegetação e bioengenharia no Parque Eólico ${selectedPrad.wind_complex}.`}
                  </p>
                </div>
              </>
            )}

            {activeTab === 'fotos' && (
              <div className="space-y-3">
                {EXCEL_PHOTOS.filter((p) => p.pradCode === selectedPrad.pradCode).map((photo) => (
                  <div key={photo.id} className="rounded-xl border border-[#DDE4DE] overflow-hidden bg-[#F5F7F4]">
                    <img src={photo.storagePath} alt={photo.code} className="w-full h-36 object-cover" />
                    <div className="p-2 text-[11px] flex justify-between items-center text-[#5F6D65]">
                      <span className="font-mono font-bold text-[#17211B]">{photo.code}</span>
                      <span>{photo.activity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'tecnico' && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-[#F5F7F4] rounded-lg">
                  <span className="text-[#5F6D65]">Intervenção:</span>
                  <strong className="text-[#17211B]">{selectedPrad.action_type || selectedPrad.actionType}</strong>
                </div>
                <div className="flex justify-between p-2 bg-[#F5F7F4] rounded-lg">
                  <span className="text-[#5F6D65]">Responsável:</span>
                  <strong className="text-[#17211B]">{selectedPrad.responsible || 'Equipe de Campo'}</strong>
                </div>
                <div className="flex justify-between p-2 bg-[#F5F7F4] rounded-lg">
                  <span className="text-[#5F6D65]">Cota Altimétrica:</span>
                  <strong className="text-amber-600">890 metros</strong>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-3 border-t border-[#DDE4DE] bg-[#F5F7F4]">
            <button
              onClick={() => handleExportPDF(selectedPrad)}
              className="w-full py-2 bg-[#365314] hover:bg-[#283e0e] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Exportar Ficha Técnica (PDF)</span>
            </button>
          </div>
        </div>
      )}

      {/* INSPECTION DRAWER FOR TURBINE */}
      {selectedTurbine && (
        <div className="absolute top-18 right-6 z-30 w-80 bg-white rounded-2xl border border-[#DDE4DE] shadow-2xl overflow-hidden text-xs flex flex-col p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#DDE4DE] pb-2">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-[#00A651]" />
              <h3 className="font-bold text-xs text-[#17211B]">Aerogerador #{selectedTurbine.id || 'AER-42'}</h3>
            </div>
            <button onClick={() => setSelectedTurbine(null)} className="text-[#5F6D65] hover:text-[#17211B]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between p-2 bg-[#F5F7F4] rounded-lg">
              <span className="text-[#5F6D65]">Parque Eólico:</span>
              <strong className="text-[#17211B]">Umburanas 08</strong>
            </div>
            <div className="flex justify-between p-2 bg-[#F5F7F4] rounded-lg">
              <span className="text-[#5F6D65]">Altura da Torre:</span>
              <strong className="text-[#17211B]">100 metros</strong>
            </div>
            <div className="flex justify-between p-2 bg-[#F5F7F4] rounded-lg">
              <span className="text-[#5F6D65]">Diâmetro do Rotor:</span>
              <strong className="text-[#17211B]">110 metros (3 pás)</strong>
            </div>
            <div className="flex justify-between p-2 bg-[#F5F7F4] rounded-lg">
              <span className="text-[#5F6D65]">Status de Operação:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Geração Ativa
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
