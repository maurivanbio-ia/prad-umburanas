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
  RotateCw,
  Eye,
  Sliders,
  ChevronRight,
  Maximize2,
  Compass,
  MapPin,
  Trees,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { EXCEL_38_AREAS } from "@/data/excelData";
import { EXCEL_PHOTOS } from "@/data/photos";

export default function MapViewer3D() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // 3D Solar Time & Wind Speed Simulator States
  const [solarHour, setSolarHour] = useState<number>(14.5); // 14:30
  const [windSpeed, setWindSpeed] = useState<number>(14); // 14 RPM
  const [isDroneFlying, setIsDroneFlying] = useState<boolean>(false);
  const [selectedTurbine, setSelectedTurbine] = useState<any | null>(null);
  const [selectedPrad, setSelectedPrad] = useState<any | null>(null);

  // Layer Toggles
  const [showTurbines, setShowTurbines] = useState<boolean>(true);
  const [showContours, setShowContours] = useState<boolean>(true);
  const [showPradPillars, setShowPradPillars] = useState<boolean>(true);
  const [showSpe3D, setShowSpe3D] = useState<boolean>(true);
  const [showShadows, setShowShadows] = useState<boolean>(true);

  // Base Style Mode ('satellite' | 'dark' | 'terrain')
  const [baseMapStyle, setBaseMapStyle] = useState<'satellite' | 'dark' | 'terrain'>('satellite');

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
        : baseMapStyle === 'dark'
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [-41.53, -10.63],
      zoom: 13.5,
      pitch: 62, // 3D Tilt perspective
      bearing: -25, // Isometric angle
      maxPitch: 85,
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

        // 4. Generate 3D Topographic Contour Lines (Curvas de Nível da Serra 800m-1050m)
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
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: coords },
            properties: {
              elevation: `${elevation} m`,
              height: elevation,
              color: elevation >= 1000 ? '#F59E0B' : elevation >= 900 ? '#10B981' : '#059669',
            },
          });
        }

        // Add 3D Contour lines source & layer
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
            'line-width': 1.8,
            'line-opacity': 0.75,
            'line-dasharray': [3, 2],
          },
        });

        // 5. Parques SPE 3D Glass Extrusions
        if (speData.features) {
          mapInstance.addSource('spe-3d-source', { type: 'geojson', data: speData });
          mapInstance.addLayer({
            id: 'spe-3d-fill',
            type: 'fill',
            source: 'spe-3d-source',
            paint: {
              'fill-color': '#00A651',
              'fill-opacity': 0.12,
              'fill-outline-color': '#00A651',
            },
          });
          mapInstance.addLayer({
            id: 'spe-3d-line',
            type: 'line',
            source: 'spe-3d-source',
            paint: {
              'line-color': '#10B981',
              'line-width': 2,
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
              'line-width': 2.5,
              'line-dasharray': [4, 3],
            },
          });
        }

        // 7. 38 PRAD 3D Holographic Pillars
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
            'circle-radius': 14,
            'circle-color': '#10B981',
            'circle-opacity': 0.35,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#34D399',
          },
        });

        mapInstance.addLayer({
          id: 'prad-3d-center',
          type: 'circle',
          source: 'prad-3d-pillars-source',
          paint: {
            'circle-radius': 6,
            'circle-color': '#FFFFFF',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#059669',
          },
        });

        mapInstance.on('click', 'prad-3d-halo', (e) => {
          if (!e.features || e.features.length === 0) return;
          const props = e.features[0].properties;
          setSelectedPrad(props);
          setSelectedTurbine(null);
        });

        // 8. 144 Wind Turbines with 3D Towers & Aviation Beacons
        if (aeroData.features) {
          mapInstance.addSource('turbines-3d-source', { type: 'geojson', data: aeroData });

          // Tower Shadows (Dynamic based on solar hour)
          mapInstance.addLayer({
            id: 'turbines-shadow-layer',
            type: 'circle',
            source: 'turbines-3d-source',
            paint: {
              'circle-radius': 12,
              'circle-color': '#000000',
              'circle-opacity': 0.45,
              'circle-blur': 0.8,
            },
          });

          // Turbine Tower Base
          mapInstance.addLayer({
            id: 'turbines-base-circle',
            type: 'circle',
            source: 'turbines-3d-source',
            paint: {
              'circle-radius': 7,
              'circle-color': '#E2E8F0',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#475569',
            },
          });

          // Top Aviation Beacon (Red Pulsing)
          mapInstance.addLayer({
            id: 'turbines-beacon-dot',
            type: 'circle',
            source: 'turbines-3d-source',
            paint: {
              'circle-radius': 3.5,
              'circle-color': '#EF4444',
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#FFFFFF',
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

  // Solar Shadow Dynamics (moves shadow offset based on hour 06:00 to 18:00)
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;
    if (m.getLayer('turbines-shadow-layer')) {
      const angle = ((solarHour - 12) / 6) * Math.PI; // -PI at 6h, 0 at 12h, +PI at 18h
      const length = Math.max(4, Math.abs(solarHour - 12) * 5 + 4);
      const offsetX = Math.sin(angle) * length;
      const offsetY = Math.cos(angle) * (length * 0.6);

      try {
        m.setPaintProperty('turbines-shadow-layer', 'circle-translate', [offsetX, offsetY]);
        m.setPaintProperty('turbines-shadow-layer', 'circle-opacity', showShadows ? 0.45 : 0.0);
      } catch (e) {}
    }
  }, [solarHour, showShadows]);

  // Layer Toggles Listener
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

  // Drone Flythrough Flight Mode (Smooth orbital 360 tour)
  useEffect(() => {
    let interval: any;
    if (isDroneFlying && map.current) {
      interval = setInterval(() => {
        if (!map.current) return;
        const currBearing = map.current.getBearing();
        map.current.easeTo({
          bearing: currBearing + 1.2,
          duration: 300,
          easing: (t) => t,
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isDroneFlying]);

  return (
    <div className="relative w-full h-screen bg-[#0F172A] overflow-hidden font-sans text-white">
      <Header />

      {/* 100% 3D VIEWPORT CANVAS */}
      <div ref={mapContainer} className="w-full h-[calc(100vh-56px)]" />

      {/* TOP FLOATING 3D COCKPIT BAR */}
      <div className="absolute top-18 left-6 z-20 flex items-center space-x-3 flex-wrap gap-y-2">
        {/* Style Selector */}
        <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700 shadow-2xl flex items-center space-x-1 text-xs">
          <button
            onClick={() => setBaseMapStyle('satellite')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              baseMapStyle === 'satellite' ? 'bg-[#00A651] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Satélite HD 3D
          </button>
          <button
            onClick={() => setBaseMapStyle('dark')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              baseMapStyle === 'dark' ? 'bg-[#00A651] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Digital Twin Dark
          </button>
        </div>

        {/* Drone Flythrough Auto-Tour Button */}
        <button
          onClick={() => setIsDroneFlying(!isDroneFlying)}
          className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-2xl transition-all cursor-pointer backdrop-blur-md ${
            isDroneFlying
              ? 'bg-amber-500 border-amber-400 text-slate-950 animate-pulse'
              : 'bg-slate-900/90 border-slate-700 text-white hover:bg-slate-800'
          }`}
        >
          {isDroneFlying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          <span>{isDroneFlying ? 'Pausar Voo de Drone' : 'Iniciar Voo 3D'}</span>
        </button>

        {/* Reset Camera to Isometric View */}
        <button
          onClick={() => {
            if (map.current) {
              map.current.flyTo({
                center: [-41.53, -10.63],
                zoom: 13.5,
                pitch: 62,
                bearing: -25,
                duration: 1500,
              });
            }
          }}
          className="bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-2xl backdrop-blur-md cursor-pointer"
        >
          <Compass className="w-4 h-4 text-sky-400" />
          <span>Vista Isométrica</span>
        </button>
      </div>

      {/* SOLAR TIME-OF-DAY & SHADOW SIMULATOR WIDGET */}
      <div className="absolute top-18 right-6 z-20 bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl w-80 space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white">Simulador Solar & Sombras</span>
          </div>
          <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
            {Math.floor(solarHour).toString().padStart(2, '0')}:{Math.round((solarHour % 1) * 60).toString().padStart(2, '0')}h
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Nascer (06h)</span>
            <span>Zênite (12h)</span>
            <span>Pôr do Sol (18h)</span>
          </div>
          <input
            type="range"
            min="6"
            max="18"
            step="0.25"
            value={solarHour}
            onChange={(e) => setSolarHour(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-300">
          <span>Projeção de Sombras 3D:</span>
          <button
            onClick={() => setShowShadows(!showShadows)}
            className={`px-2.5 py-0.5 rounded font-bold transition-colors ${
              showShadows ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
            }`}
          >
            {showShadows ? 'Ativo' : 'Inativo'}
          </button>
        </div>
      </div>

      {/* 3D LAYER CONTROL PANEL */}
      <div className="absolute bottom-6 left-6 z-20 bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl w-80 space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Camadas & Objetos 3D</span>
          </span>
          <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-bold">
            144 Turbinas
          </span>
        </div>

        <div className="space-y-2">
          {/* Turbines Toggle */}
          <label className="flex items-center justify-between p-1.5 hover:bg-slate-800/60 rounded-lg cursor-pointer">
            <span className="flex items-center gap-2 text-slate-200">
              <Wind className="w-4 h-4 text-sky-400" />
              <span>144 Aerogeradores 3D</span>
            </span>
            <input
              type="checkbox"
              checked={showTurbines}
              onChange={(e) => setShowTurbines(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
            />
          </label>

          {/* 3D Contours Toggle */}
          <label className="flex items-center justify-between p-1.5 hover:bg-slate-800/60 rounded-lg cursor-pointer">
            <span className="flex items-center gap-2 text-slate-200">
              <span className="w-4 h-0.5 bg-amber-400 inline-block border-t border-dashed" />
              <span>Curvas de Nível (800m-1050m)</span>
            </span>
            <input
              type="checkbox"
              checked={showContours}
              onChange={(e) => setShowContours(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
            />
          </label>

          {/* 38 PRAD Pillars Toggle */}
          <label className="flex items-center justify-between p-1.5 hover:bg-slate-800/60 rounded-lg cursor-pointer">
            <span className="flex items-center gap-2 text-slate-200">
              <Trees className="w-4 h-4 text-emerald-400" />
              <span>38 Pilares PRAD (50,26 ha)</span>
            </span>
            <input
              type="checkbox"
              checked={showPradPillars}
              onChange={(e) => setShowPradPillars(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
            />
          </label>

          {/* SPE Complexes Toggle */}
          <label className="flex items-center justify-between p-1.5 hover:bg-slate-800/60 rounded-lg cursor-pointer">
            <span className="flex items-center gap-2 text-slate-200">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500/30 border border-emerald-400 inline-block" />
              <span>18 Parques Eólicos SPE</span>
            </span>
            <input
              type="checkbox"
              checked={showSpe3D}
              onChange={(e) => setShowSpe3D(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* INSPECTION POPUP FOR SELECTED TURBINE */}
      {selectedTurbine && (
        <div className="absolute top-18 right-6 z-30 bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl border border-sky-500/50 shadow-2xl w-84 space-y-3 text-xs animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-white text-sm">Aerogerador #{selectedTurbine.id || 'AER-42'}</h3>
            </div>
            <button onClick={() => setSelectedTurbine(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <span>Parque Eólico (SPE):</span>
              <strong className="text-white">Umburanas 08</strong>
            </div>
            <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <span>Altura da Torre:</span>
              <strong className="text-white">100 metros</strong>
            </div>
            <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <span>Diâmetro do Rotor:</span>
              <strong className="text-white">110 metros (3 pás)</strong>
            </div>
            <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <span>Cota Altimétrica:</span>
              <strong className="text-amber-400">920 metros</strong>
            </div>
            <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <span>Status Operacional:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Em Geração Ativa
              </span>
            </div>
          </div>
        </div>
      )}

      {/* INSPECTION POPUP FOR SELECTED PRAD */}
      {selectedPrad && (
        <div className="absolute top-18 right-6 z-30 bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl border border-emerald-500/50 shadow-2xl w-84 space-y-3 text-xs animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Trees className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">{selectedPrad.pradCode} - {selectedPrad.name}</h3>
            </div>
            <button onClick={() => setSelectedPrad(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <span>Parque Eólico:</span>
              <strong className="text-white">{selectedPrad.wind_complex || selectedPrad.windComplex}</strong>
            </div>
            <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <span>Superfície:</span>
              <strong className="text-emerald-400">{selectedPrad.areaHa || `${selectedPrad.area_ha} ha`}</strong>
            </div>
            <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <span>Tipo de Intervenção:</span>
              <strong className="text-white">{selectedPrad.action_type || selectedPrad.actionType}</strong>
            </div>
            <div className="flex justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <span>Coleta de Solo:</span>
              <strong className="text-emerald-400">{selectedPrad.soil_collection_status || selectedPrad.soilCollectionStatus}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
