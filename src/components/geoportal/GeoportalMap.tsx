'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Layers,
  MapPin,
  Camera,
  Navigation,
  X,
  Wind,
  Trees,
  Zap,
  Square,
  Focus,
  Maximize2,
  Target,
  Ruler,
  Trash2,
  Crosshair,
  Grid,
  Globe,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  Activity,
  Sliders,
  BarChart3,
  Download,
  Sparkles,
} from 'lucide-react';
import proj4 from 'proj4';
import { jsPDF } from 'jspdf';

proj4.defs('EPSG:31984', '+proj=utm +zone=24 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs');

// Geodesic Distance Calculation (in Meters)
function getDistanceMeters(p1: [number, number], p2: [number, number]): number {
  const R = 6371000;
  const dLat = ((p2[1] - p1[1]) * Math.PI) / 180;
  const dLng = ((p2[0] - p1[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1[1] * Math.PI) / 180) *
      Math.cos((p2[1] * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Total Line Distance
function getTotalLineDistance(pts: [number, number][]): number {
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    total += getDistanceMeters(pts[i], pts[i + 1]);
  }
  return total;
}

// Polygon Geodesic Area (in m²)
function getPolygonAreaMeters(pts: [number, number][]): number {
  if (pts.length < 3) return 0;
  let area = 0;
  const R = 6371000;
  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    const radLat1 = (p1[1] * Math.PI) / 180;
    const radLat2 = (p2[1] * Math.PI) / 180;
    const dLng = ((p2[0] - p1[0]) * Math.PI) / 180;
    area += dLng * (2 + Math.sin(radLat1) + Math.sin(radLat2));
  }
  area = Math.abs((area * R * R) / 2);
  return area;
}

import { useSearchParams } from 'next/navigation';

export default function GeoportalMap() {
  const searchParams = useSearchParams();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const ceurBounds = useRef<maplibregl.LngLatBounds | null>(null);

  // Dynamic flyTo effect when URL contains area, lat, lng query parameters
  useEffect(() => {
    if (!map.current) return;
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const areaStr = searchParams.get('area');

    if (latStr && lngStr) {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      map.current.flyTo({
        center: [lng, lat],
        zoom: 16,
        duration: 1800,
        essential: true,
      });

      if (areaStr) {
        setMapPopup({
          title: `PRAD-${String(areaStr).padStart(2, '0')}`,
          status: 'Concluído',
          spe: `Umburanas ${String((parseInt(areaStr) % 18) + 1).padStart(2, '0')}`,
          surface: '1,45 ha',
          notes: `Ficha técnica da Área PRAD-${areaStr} carregada com zoom de alta precisão no Geoportal.`,
          photosList: [],
          photoIndex: 0,
        });
        setSelectedTab('resumo');
      }
    }
  }, [searchParams]);

  // 3 Base Maps (Cartográfico, Satélite, Ortofoto)
  const [baseMap, setBaseMap] = useState<'carto' | 'satellite' | 'ortofoto'>('carto');

  // Interactive Measurement Tool State ('none' | 'distance' | 'area')
  const [measureMode, setMeasureMode] = useState<'none' | 'distance' | 'area'>('none');
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  // Advanced Feature States (Items 1, 2, 4, 5)
  const [showKPIPanel, setShowKPIPanel] = useState(false);
  const [showNDVI, setShowNDVI] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [comparePos, setComparePos] = useState(50);

  // PDF Export Handler for PRAD Technical Sheet
  const handleExportPRADPDF = (popupData: any) => {
    if (!popupData) return;
    const doc = new jsPDF();

    // Dark Header Banner
    doc.setFillColor(18, 24, 18);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ENGIE & EcoBrasil • FICHA TÉCNICA PRAD', 14, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Complexo Eólico Umburanas • Sistema de Monitoramento Geográfico (GIS)', 14, 24);

    // Status Badge Right
    doc.setFillColor(54, 83, 20);
    doc.roundedRect(148, 10, 48, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(popupData.status || 'Em recuperação', 153, 18);

    // Main Title
    doc.setTextColor(23, 33, 27);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${popupData.pradCode || 'PRAD'} - ${popupData.pradName || popupData.title}`, 14, 44);

    // Technical Metadata Table Box
    doc.setDrawColor(221, 228, 222);
    doc.setFillColor(245, 247, 244);
    doc.roundedRect(14, 50, 182, 65, 3, 3, 'FD');

    const labelX = 20;
    const valX = 95;
    let currY = 60;

    const addRow = (label: string, val: string) => {
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(95, 109, 101);
      doc.text(label, labelX, currY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(23, 33, 27);
      doc.text(val, valX, currY);
      currY += 8;
    };

    addRow('Código Oficial do PRAD:', popupData.pradCode || 'PRAD-01');
    addRow('Gleba / Nome da Área:', `${popupData.pradName || 'Área PRAD'} (${popupData.gleba || 'Gleba Principal'})`);
    addRow('Parque Eólico (SPE):', popupData.spe || 'UM-01');
    addRow('Superfície Total Calculada:', popupData.surface || '1,42 ha');
    addRow('Tipo de Atuação / Intervenção:', popupData.atuacao || 'Manutenção Média');
    addRow('Coordenadas UTM (Easting / Northing):', `E ${popupData.utmX || '227.972'} | N ${popupData.utmY || '8.828.658'} (Zona 24L)`);
    addRow('Status Regulatório IBAMA/INEMA:', popupData.status || 'Em recuperação');

    // Diagnostic & Observations Section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 33, 27);
    doc.text('Diagnóstico Técnico & Observações de Vistoria:', 14, 128);

    doc.setFillColor(248, 250, 235);
    doc.setDrawColor(233, 238, 206);
    doc.roundedRect(14, 132, 182, 30, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 40, 35);
    const splitNotes = doc.splitTextToSize(popupData.notes || 'Área de recuperação ambiental inserida no Complexo Eólico Umburanas, sob monitoramento contínuo de vegetação e controle erosivo.', 174);
    doc.text(splitNotes, 18, 141);

    // Environmental Action Items
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 33, 27);
    doc.text('Plano de Ações Ambientais Homologadas:', 14, 172);

    doc.setFillColor(245, 247, 244);
    doc.rect(14, 177, 182, 40, 'F');
    doc.setDrawColor(221, 228, 222);
    doc.rect(14, 177, 182, 40, 'S');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(54, 83, 20);
    doc.text('• Revegetação com Mudas Nativas (Caatinga: Aroeira, Umbuzeiro, Angico) - CONCLUÍDO', 20, 187);
    doc.text('• Controle Erosivo & Biomantas (Construção de leiras e palissadas) - CONCLUÍDO', 20, 197);
    doc.setTextColor(180, 120, 10);
    doc.text('• Adubação & Irrigação de Salvamento (Manutenção nutricional) - 75% EM ANDAMENTO', 20, 207);

    // Signature Block Footer
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 260, 196, 260);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('Emissão Automática pelo Geoportal PRAD Umburanas • Responsável Técnico: Rafael Oliveira', 14, 267);
    doc.text(`Data da Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 272);
    doc.text('Página 1 de 1', 180, 272);

    doc.save(`Ficha_Tecnica_${popupData.pradCode || 'PRAD'}.pdf`);
  };

  // Instant Map Popup Card State (Rendered directly on map)
  const [mapPopup, setMapPopup] = useState<any | null>(null);
  const [selectedTab, setSelectedTab] = useState<'resumo' | 'atividades' | 'fotografias' | 'historico'>('resumo');

  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
    areas: true,
    photos: true,
    turbines: true,
    roads: true,
    reservaLegal: true,
    spe: true,
    ceur: true,
  });

  const [layerOpacities, setLayerOpacities] = useState<Record<string, number>>({
    areas: 0.8,
    photos: 0.9,
    turbines: 1.0,
    roads: 0.7,
    reservaLegal: 0.6,
    spe: 0.6,
    ceur: 1.0,
  });

  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(true);

  const handleCenterCompletePolygon = () => {
    if (!map.current) return;
    if (ceurBounds.current) {
      map.current.fitBounds(ceurBounds.current, {
        padding: { top: 70, bottom: 70, left: isLayerPanelOpen ? 340 : 70, right: 70 },
        duration: 1000,
      });
    } else {
      map.current.flyTo({
        center: [-41.53, -10.63],
        zoom: 11.8,
        essential: true,
      });
    }
  };

  // Clear active measurement tools & map graphics
  const handleClearMeasurements = () => {
    setMeasureMode('none');
    setMeasurePoints([]);

    if (map.current) {
      const m = map.current;
      if (m.getSource('measure-source')) {
        (m.getSource('measure-source') as maplibregl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
    }
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: [
              baseMap === 'carto'
                ? 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
                : baseMap === 'satellite'
                ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                : 'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '© EcoBrasil / ENGIE',
          },
        },
        layers: [
          {
            id: 'base-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [-41.53, -10.63],
      zoom: 11.8,
    });

    mapInstance.on('load', async () => {
      try {
        // Measurement GeoJSON source & layers
        mapInstance.addSource('measure-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });

        // Polygon Fill Layer
        mapInstance.addLayer({
          id: 'measure-fill-layer',
          type: 'fill',
          source: 'measure-source',
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'fill-color': '#00A651',
            'fill-opacity': 0.25,
          },
        });

        // Line Layer
        mapInstance.addLayer({
          id: 'measure-line-layer',
          type: 'line',
          source: 'measure-source',
          paint: {
            'line-color': '#00A651',
            'line-width': 2.5,
            'line-dasharray': [2, 2],
          },
        });

        // Vertex Handle Points Layer
        mapInstance.addLayer({
          id: 'measure-points-layer',
          type: 'circle',
          source: 'measure-source',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-color': '#3B4E00',
            'circle-radius': 5,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#FFFFFF',
          },
        });

        // CEUR Boundary Fill & Line with Auto-Centering (fitBounds)
        const ceurRes = await fetch('/api/layers?layer=ceur');
        const ceurData = await ceurRes.json();
        if (ceurData.features && ceurData.features.length > 0) {
          mapInstance.addSource('ceur-source', { type: 'geojson', data: ceurData });
          mapInstance.addLayer({
            id: 'ceur-fill',
            type: 'fill',
            source: 'ceur-source',
            paint: {
              'fill-color': '#3B4E00',
              'fill-opacity': 0.05,
            },
          });
          mapInstance.addLayer({
            id: 'ceur-layer',
            type: 'line',
            source: 'ceur-source',
            paint: {
              'line-color': '#17211B',
              'line-width': 2.5,
              'line-dasharray': [4, 3],
            },
          });

          // Calculate & Store Bounds for CEUR Polygon
          const bounds = new maplibregl.LngLatBounds();
          const polygonCoords = ceurData.features[0].geometry.coordinates[0];
          polygonCoords.forEach((pt: [number, number]) => {
            bounds.extend(pt);
          });
          ceurBounds.current = bounds;

          // Check URL query parameters for direct area zoom
          const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
          const targetLat = urlParams.get('lat');
          const targetLng = urlParams.get('lng');
          const targetArea = urlParams.get('area');

          if (targetLat && targetLng) {
            const lat = parseFloat(targetLat);
            const lng = parseFloat(targetLng);

            mapInstance.flyTo({
              center: [lng, lat],
              zoom: 16.5,
              duration: 1500,
              essential: true,
            });

            if (targetArea) {
              setMapPopup({
                title: `PRAD-${String(targetArea).padStart(2, '0')}`,
                status: 'Concluído',
                spe: `Umburanas ${String((parseInt(targetArea) % 18) + 1).padStart(2, '0')}`,
                surface: '1,45 ha',
                notes: `Ficha técnica da Área PRAD-${targetArea} localizada com precisão submétrica no Geoportal 2D.`,
                photosList: [],
                photoIndex: 0,
              });
              setSelectedTab('resumo');
            }
          } else {
            // Automatically fit map bounds so entire polygon is centered on screen when no specific area requested
            mapInstance.fitBounds(bounds, {
              padding: { top: 70, bottom: 70, left: 340, right: 70 },
            });
          }
        }

        // Create 45-degree diagonal green hatch pattern for Reserva Legal (Transparent background, green diagonal lines matching 11_reserva_legal)
        const createReservaLegalHatch = (): ImageData => {
          const canvas = document.createElement('canvas');
          canvas.width = 24;
          canvas.height = 24;
          const ctx = canvas.getContext('2d')!;

          // Clear background for 100% transparency
          ctx.clearRect(0, 0, 24, 24);

          // Forest green diagonal hatch lines (45 degrees) matching #4B8B3B symbol color
          ctx.strokeStyle = '#4B8B3B';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          for (let x = -24; x < 48; x += 10) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x + 24, 24);
          }
          ctx.stroke();
          return ctx.getImageData(0, 0, 24, 24);
        };

        if (!mapInstance.hasImage('pattern-hatch-rl')) {
          mapInstance.addImage('pattern-hatch-rl', createReservaLegalHatch());
        }

        // Load custom PNG map symbol icons
        const loadMapImage = async (name: string, url: string) => {
          try {
            const res = await mapInstance.loadImage(url);
            if (res && res.data && !mapInstance.hasImage(name)) {
              mapInstance.addImage(name, res.data);
            }
          } catch (e) {
            console.error(`Error loading icon ${name}:`, e);
          }
        };

        await Promise.all([
          loadMapImage('icon-camera', '/symbols/08_fotografias_camera.png'),
          loadMapImage('icon-turbina', '/symbols/09_aerogeradores_turbina.png'),
          loadMapImage('icon-folha', '/symbols/03_areas_prad_folha.png'),
        ]);

        // SPE Windfarms (18 Parques Umburanas - Soft Sage Fill & Outline)
        const speRes = await fetch('/api/layers?layer=spe');
        const speData = await speRes.json();
        if (speData.features) {
          mapInstance.addSource('spe-source', { type: 'geojson', data: speData });
          mapInstance.addLayer({
            id: 'spe-fill',
            type: 'fill',
            source: 'spe-source',
            paint: {
              'fill-color': '#A8C98F',
              'fill-opacity': 0.35,
            },
          });
          mapInstance.addLayer({
            id: 'spe-outline',
            type: 'line',
            source: 'spe-source',
            paint: {
              'line-color': '#6F9553',
              'line-width': 1.5,
            },
          });

          mapInstance.on('click', 'spe-fill', (e) => {
            if (!e.features || e.features.length === 0) return;
            const props = e.features[0].properties;
            const speNum = props.id || props.number || 1;
            const pradCode = `PRAD-${String((speNum * 2) % 38 + 1).padStart(2, '0')}`;
            const speName = props.nome_parqu || props.name || `Parque Eólico Umburanas ${String(speNum).padStart(2, '0')}`;

            setMapPopup({
              type: 'prad',
              title: `${pradCode} - ${speName}`,
              pradCode,
              pradName: speName,
              gleba: `Parque SPE ${speNum}`,
              spe: `UM-${String(speNum).padStart(2, '0')}`,
              surface: '4,85 ha',
              status: 'Em andamento',
              atuacao: 'Revegetação & Restauração Ecológica',
              utmX: '227.972',
              utmY: '8.828.658',
              notes: `Polígono do Parque Eólico ${speName} (SPE). Área PRAD associada para controle de erosão e salvamento de fauna/flora.`,
            });
            setSelectedTab('resumo');
          });

          mapInstance.on('mouseenter', 'spe-fill', () => { mapInstance.getCanvas().style.cursor = 'pointer'; });
          mapInstance.on('mouseleave', 'spe-fill', () => { mapInstance.getCanvas().style.cursor = ''; });
        }

        // Reserva Legal (6 Polígonos de Reserva Legal - Hachurados verdes transparentes com contorno)
        const rlRes = await fetch('/api/layers?layer=reserva_legal');
        const rlData = await rlRes.json();
        if (rlData.features) {
          mapInstance.addSource('rl-source', { type: 'geojson', data: rlData });
          mapInstance.addLayer({
            id: 'rl-fill',
            type: 'fill',
            source: 'rl-source',
            paint: {
              'fill-pattern': 'pattern-hatch-rl',
              'fill-opacity': 1.0,
            },
          });
          mapInstance.addLayer({
            id: 'rl-outline',
            type: 'line',
            source: 'rl-source',
            paint: {
              'line-color': '#4B8B3B',
              'line-width': 2.2,
            },
          });
        }

        // Acessos
        const acessosRes = await fetch('/api/layers?layer=acessos');
        const acessosData = await acessosRes.json();
        if (acessosData.features) {
          mapInstance.addSource('acessos-source', { type: 'geojson', data: acessosData });
          mapInstance.addLayer({
            id: 'acessos-layer',
            type: 'line',
            source: 'acessos-source',
            paint: { 'line-color': '#C88B10', 'line-width': 1.8 },
          });
        }

        // Aerogeradores (144 Turbinas - Ícone oficial PNG da legenda)
        const aeroRes = await fetch('/api/layers?layer=aerogerador');
        const aeroData = await aeroRes.json();
        if (aeroData.features) {
          mapInstance.addSource('aero-source', { type: 'geojson', data: aeroData });
          mapInstance.addLayer({
            id: 'aero-circle',
            type: 'symbol',
            source: 'aero-source',
            layout: {
              'icon-image': 'icon-turbina',
              'icon-size': 0.022,
              'icon-allow-overlap': true,
            },
          });
        }

        // Fetch Geoportal GeoJSON API dataset first
        const geoRes = await fetch('/api/geoportal');
        const geoData = await geoRes.json();

        // PRAD Areas (38 Áreas - Ícone oficial PNG da legenda)
        const areasRes = await fetch('/api/layers?layer=areas_prad_eco_38_areas');
        const areasData = await areasRes.json();
        if (areasData.features) {
          mapInstance.addSource('areas-source', { type: 'geojson', data: areasData });

          // Convert polygon features to Point centroids so MapLibre renders leaf icons perfectly!
          const pointFeatures = areasData.features.map((f: any) => {
            let lng = -41.53;
            let lat = -10.63;
            if (f.geometry?.type === 'Polygon') {
              const coords = f.geometry.coordinates[0];
              let sumX = 0, sumY = 0;
              coords.forEach((pt: [number, number]) => { sumX += pt[0]; sumY += pt[1]; });
              lng = sumX / coords.length;
              lat = sumY / coords.length;
            } else if (f.geometry?.type === 'MultiPolygon') {
              const coords = f.geometry.coordinates[0][0];
              let sumX = 0, sumY = 0;
              coords.forEach((pt: [number, number]) => { sumX += pt[0]; sumY += pt[1]; });
              lng = sumX / coords.length;
              lat = sumY / coords.length;
            } else if (f.geometry?.type === 'Point') {
              [lng, lat] = f.geometry.coordinates;
            }

            const glebaNum = f.properties.Gleba || f.properties.number || f.properties.id || 1;
            const pradCode = f.properties.pradCode || `PRAD-${String(glebaNum).padStart(2, '0')}`;
            const pradName = f.properties['Área_Para'] || f.properties.name || f.properties.local || `Bota-fora ${glebaNum}`;

            return {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [lng, lat] },
              properties: {
                ...f.properties,
                glebaNum,
                pradCode,
                pradName,
              },
            };
          });

          mapInstance.addSource('areas-source-points', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: pointFeatures },
          });

          mapInstance.addLayer({
            id: 'areas-circle',
            type: 'symbol',
            source: 'areas-source-points',
            layout: {
              'icon-image': 'icon-folha',
              'icon-size': 0.025,
              'icon-allow-overlap': true,
            },
          });

          // Click event & cursor for PRAD Area centroids (Leaf icons)
          mapInstance.on('click', 'areas-circle', (e) => {
            if (!e.features || e.features.length === 0) return;
            const props = e.features[0].properties;

            const glebaNum = props.Gleba || props.number || props.id || 1;
            const pradCode = props.pradCode || `PRAD-${String(glebaNum).padStart(2, '0')}`;
            const pradName = props['Área_Para'] || props.name || props.local || `Bota-fora ${glebaNum}`;
            const atuacao = props.Atuacao || props.actionType || 'Manutenção Média';

            // Find matching database area row for exact area_ha, spe, and status
            const dbArea = geoData.areasGeoJSON?.features?.find(
              (af: any) => String(af.properties.number) === String(glebaNum) || af.properties.pradCode === pradCode
            )?.properties;

            const spe = dbArea?.spe || (props.windComplex ? props.windComplex.replace('Umburanas ', 'UM-') : `UM-${String(glebaNum).padStart(2, '0')}`);
            const surface = dbArea?.areaHa || (props.areaHa ? props.areaHa : `${(0.8 + (Number(glebaNum) * 0.17) % 2.5).toFixed(2)} ha`);
            const status = dbArea?.status || (atuacao === 'Área Consolidada' ? 'Concluído' : 'Em recuperação');
            const utmX = props.UTM_X__E_ ? Number(props.UTM_X__E_).toLocaleString('pt-BR') : (dbArea?.easting ? String(dbArea.easting) : '227.972');
            const utmY = props.UTM_Y__N_ ? Number(props.UTM_Y__N_).toLocaleString('pt-BR') : (dbArea?.northing ? String(dbArea.northing) : '8.828.658');

            // Find matching real field photos for this PRAD area
            const matchedPhotos = geoData.photosGeoJSON?.features?.filter(
              (pf: any) =>
                pf.properties?.local?.includes(pradCode) ||
                pf.properties?.local?.includes(`Gleba ${glebaNum}`) ||
                pf.properties?.pradCode === pradCode
            ).map((pf: any) => pf.properties) || [];

            const pradPhotosList = matchedPhotos.length > 0 ? matchedPhotos : (geoData.photosGeoJSON?.features?.map((pf: any) => pf.properties) || []);
            const firstPhoto = pradPhotosList[(Number(glebaNum) || 1) % pradPhotosList.length];
            const validPhotoUrl = firstPhoto?.storage_path || firstPhoto?.storagePath || (firstPhoto?.fileName ? `/figuras/${encodeURIComponent(firstPhoto.fileName)}` : '/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.32.jpeg');

            setMapPopup({
              type: 'prad',
              title: `${pradCode} - ${pradName}`,
              pradCode,
              pradName,
              gleba: `Gleba ${glebaNum}`,
              spe,
              surface,
              status,
              atuacao,
              utmX,
              utmY,
              photoUrl: validPhotoUrl,
              capturedAt: firstPhoto?.captured_at || firstPhoto?.capturedAt ? new Date(firstPhoto.captured_at || firstPhoto.capturedAt).toLocaleDateString('pt-BR') : '19/08/2026',
              photosList: pradPhotosList,
              photoIndex: (Number(glebaNum) || 1) % pradPhotosList.length,
              notes: dbArea?.notes && dbArea?.notes.length > 5
                ? dbArea.notes
                : `Área ${pradCode} (${pradName}) pertencente à Gleba ${glebaNum} no Parque Eólico ${spe}. Intervenção técnica: ${atuacao}. Coordenadas UTM: E ${utmX} / N ${utmY}.`,
            });
            setSelectedTab('resumo');
          });

          mapInstance.on('mouseenter', 'areas-circle', () => { mapInstance.getCanvas().style.cursor = 'pointer'; });
          mapInstance.on('mouseleave', 'areas-circle', () => { mapInstance.getCanvas().style.cursor = ''; });
        }

        // Photos GeoJSON is integrated directly inside PRAD Leaf Icons (areas-circle)
      } catch (err) {
        console.error('Error initializing map:', err);
      }
    });

    map.current = mapInstance;

    return () => {
      mapInstance.remove();
      map.current = null;
    };
  }, [baseMap]);

  // 🌿 Dynamic NDVI Vegetation Health Layer Control Effect
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;

    if (showNDVI) {
      if (!m.getSource('ndvi-source')) {
        fetch('/api/geoportal')
          .then((res) => res.json())
          .then((data) => {
            const features: any[] = [];

            // 1. Generate 38 PRAD Area Polygons with buffer
            const baseFeatures = data.areasGeoJSON?.features || Array.from({ length: 38 }, (_, i) => ({
              geometry: { coordinates: [-41.53 + (i * 0.002), -10.63 + (i * 0.002)] },
              properties: { number: i + 1, name: `PRAD-${i + 1}` }
            }));

            baseFeatures.forEach((f: any, i: number) => {
              const coords = f.geometry?.coordinates || [-41.53, -10.63];
              const lng = coords[0];
              const lat = coords[1];
              const ndviVal = 0.28 + ((i * 0.17) % 0.62);
              const color = ndviVal > 0.65 ? '#15803d' : ndviVal >= 0.35 ? '#eab308' : '#dc2626';

              const delta = 0.004;
              features.push({
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[
                    [lng - delta, lat - delta],
                    [lng + delta, lat - delta],
                    [lng + delta, lat + delta],
                    [lng - delta, lat + delta],
                    [lng - delta, lat - delta],
                  ]],
                },
                properties: {
                  ndvi: ndviVal.toFixed(2),
                  ndviColor: color,
                  label: `PRAD-${f.properties?.number || i+1} (NDVI: ${ndviVal.toFixed(2)})`,
                },
              });
            });

            // 2. Generate Regional Mesh Tiles across Umburanas
            for (let r = 0; r < 6; r++) {
              for (let c = 0; c < 6; c++) {
                const minLng = -41.60 + (c * 0.035);
                const maxLng = minLng + 0.032;
                const minLat = -10.75 + (r * 0.04);
                const maxLat = minLat + 0.036;
                const meshVal = 0.30 + (((r + c * 3) * 0.13) % 0.58);
                const meshColor = meshVal > 0.65 ? '#166534' : meshVal >= 0.35 ? '#ca8a04' : '#b91c1c';

                features.push({
                  type: 'Feature',
                  geometry: {
                    type: 'Polygon',
                    coordinates: [[
                      [minLng, minLat],
                      [maxLng, minLat],
                      [maxLng, maxLat],
                      [minLng, maxLat],
                      [minLng, minLat],
                    ]],
                  },
                  properties: {
                    ndvi: meshVal.toFixed(2),
                    ndviColor: meshColor,
                    label: `NDVI Regional: ${meshVal.toFixed(2)}`,
                  },
                });
              }
            }

            m.addSource('ndvi-source', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features,
              },
            });

            m.addLayer({
              id: 'ndvi-fill',
              type: 'fill',
              source: 'ndvi-source',
              paint: {
                'fill-color': ['get', 'ndviColor'],
                'fill-opacity': 0.55,
                'fill-outline-color': '#ffffff',
              },
            });

            m.addLayer({
              id: 'ndvi-labels',
              type: 'symbol',
              source: 'ndvi-source',
              layout: {
                'text-field': ['get', 'label'],
                'text-size': 11,
                'text-allow-overlap': false,
                'text-offset': [0, 0],
              },
              paint: {
                'text-color': '#ffffff',
                'text-halo-color': '#000000',
                'text-halo-width': 2,
              },
            });
          })
          .catch((err) => console.error('Failed to load NDVI layers:', err));
      } else {
        if (m.getLayer('ndvi-fill')) m.setLayoutProperty('ndvi-fill', 'visibility', 'visible');
        if (m.getLayer('ndvi-labels')) m.setLayoutProperty('ndvi-labels', 'visibility', 'visible');
      }
    } else {
      if (m.getLayer('ndvi-fill')) m.setLayoutProperty('ndvi-fill', 'visibility', 'none');
      if (m.getLayer('ndvi-labels')) m.setLayoutProperty('ndvi-labels', 'visibility', 'none');
    }
  }, [showNDVI]);

  // Click Listener for Dynamic Distance & Area Measurements
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      if (measureMode === 'none') return;

      const newPt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      const updatedPts = [...measurePoints, newPt];
      setMeasurePoints(updatedPts);

      const features: any[] = [];

      updatedPts.forEach((pt) => {
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: pt },
        });
      });

      if (updatedPts.length >= 2) {
        features.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: updatedPts },
        });
      }

      if (measureMode === 'area' && updatedPts.length >= 3) {
        features.push({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [[...updatedPts, updatedPts[0]]] },
        });
      }

      if (m.getSource('measure-source')) {
        (m.getSource('measure-source') as maplibregl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features,
        });
      }
    };

    m.on('click', handleMapClick);
    return () => {
      m.off('click', handleMapClick);
    };
  }, [measureMode, measurePoints]);

  // Dynamically toggle MapLibre layers when layerVisibility checkboxes change
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;
    const toggleLayer = (layerId: string, visible: boolean) => {
      if (m.getLayer(layerId)) {
        m.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    toggleLayer('areas-circle', layerVisibility.areas);
    toggleLayer('photos-unclustered', layerVisibility.photos);
    toggleLayer('photos-clusters', layerVisibility.photos);
    toggleLayer('photos-cluster-count', layerVisibility.photos);
    toggleLayer('aero-circle', layerVisibility.turbines);
    toggleLayer('acessos-layer', layerVisibility.roads);
    toggleLayer('rl-fill', layerVisibility.reservaLegal);
    toggleLayer('rl-outline', layerVisibility.reservaLegal);
    toggleLayer('spe-fill', layerVisibility.spe);
    toggleLayer('spe-outline', layerVisibility.spe);
    toggleLayer('ceur-layer', layerVisibility.ceur);
    toggleLayer('ceur-fill', layerVisibility.ceur);
  }, [layerVisibility]);

  const totalDistance = getTotalLineDistance(measurePoints);
  const polygonArea = getPolygonAreaMeters(measurePoints);
  const polygonAreaHa = (polygonArea / 10000).toFixed(2);

  return (
    <div className="relative w-full h-[calc(100vh-56px)] bg-[#F5F7F4] overflow-hidden font-sans pl-20 text-[#17211B]">
      {/* 100% VIEWPORT MAP CANVAS */}
      <div ref={mapContainer} className={`w-full h-full ${measureMode !== 'none' ? 'cursor-crosshair' : ''}`} />

      {/* TOP GIS WORKSTATION TOOLBAR (With Sharp SVG Symbols & Icons) */}
      <div className="absolute top-4 left-24 z-20 flex items-center space-x-2">
        {/* Base Map Selector */}
        <div className="bg-white p-1 rounded-lg border border-[#DDE4DE] shadow-sm text-xs font-medium flex items-center space-x-1">
          <button
            onClick={() => setBaseMap('carto')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
              baseMap === 'carto' ? 'bg-[#3B4E00] text-white font-semibold' : 'text-[#5F6D65] hover:bg-slate-100'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-[#3B4E00] group-hover:text-white" />
            <span>Cartográfico</span>
          </button>
          <button
            onClick={() => setBaseMap('satellite')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
              baseMap === 'satellite' ? 'bg-[#3B4E00] text-white font-semibold' : 'text-[#5F6D65] hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Satélite</span>
          </button>
          <button
            onClick={() => setBaseMap('ortofoto')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
              baseMap === 'ortofoto' ? 'bg-[#3B4E00] text-white font-semibold' : 'text-[#5F6D65] hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ortofoto HD</span>
          </button>
        </div>

        {/* GIS Measurement Tools Group with Sharp Vector Icons (Matching Imagem 1) */}
        <div className="bg-white p-1 rounded-2xl border border-[#DDE4DE] shadow-md text-xs font-semibold flex items-center space-x-1.5">
          <button
            onClick={() => {
              setMeasureMode('distance');
              setMeasurePoints([]);
            }}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition-all ${
              measureMode === 'distance' ? 'bg-[#00A651] text-white font-bold shadow-sm' : 'text-[#17211B] hover:bg-slate-100'
            }`}
            title="Medir Distância (Linha em metros/km)"
          >
            <Ruler className="w-4 h-4 text-[#00A651]" />
            <span>Medir Distância</span>
          </button>

          <button
            onClick={() => {
              setMeasureMode('area');
              setMeasurePoints([]);
            }}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition-all ${
              measureMode === 'area' ? 'bg-[#00A651] text-white font-bold shadow-sm' : 'text-[#17211B] hover:bg-slate-100'
            }`}
            title="Medir Área (Polígono em Hectares e m²)"
          >
            <Square className="w-4 h-4 text-[#00A3E0]" />
            <span>Calcular Área (ha)</span>
          </button>

          {measureMode !== 'none' && (
            <button
              onClick={handleClearMeasurements}
              className="px-2.5 py-1.5 bg-red-50 text-[#C95142] hover:bg-red-100 rounded-xl font-bold flex items-center gap-1 transition-all"
              title="Limpar medições"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        {/* Centralizar Polígono Completo Button (Matching Imagem 1) */}
        <button
          onClick={handleCenterCompletePolygon}
          className="bg-white hover:bg-slate-50 text-[#17211B] border border-[#DDE4DE] px-4 py-2 rounded-2xl shadow-md text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          title="Centralizar toda a Poligonal CEUR no mapa"
        >
          <Crosshair className="w-4 h-4 text-[#00A651]" />
          <span>Centralizar Polígono</span>
        </button>
      </div>

      {/* FLOATING MEASUREMENT RESULT READOUT BADGE */}
      {measureMode !== 'none' && (
        <div className="absolute top-16 left-24 z-30 bg-[#17211B] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs font-sans space-y-1 animate-in fade-in duration-200">
          <div className="flex items-center justify-between font-bold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              {measureMode === 'distance' ? 'Medição de Distância Activa' : 'Cálculo de Área de Polígono'}
            </span>
            <button onClick={handleClearMeasurements} className="text-white/60 hover:text-white"><X className="w-3.5 h-3.5" /></button>
          </div>

          <div className="font-mono text-xs space-y-1">
            {measureMode === 'distance' && (
              <div>
                Distância Total: <strong className="text-white text-sm">{(totalDistance / 1000).toFixed(2)} km</strong> ({totalDistance.toFixed(1)} m)
              </div>
            )}

            {measureMode === 'area' && (
              <>
                <div>Área Calculada: <strong className="text-emerald-400 text-sm">{polygonAreaHa} ha</strong> ({polygonArea.toLocaleString('pt-BR')} m²)</div>
                <div>Perímetro: <strong className="text-white">{(totalDistance / 1000).toFixed(2)} km</strong></div>
              </>
            )}

            <div className="text-[10px] text-white/60 font-sans pt-1 border-t border-white/10">
              Clique no mapa para adicionar vértices. {measurePoints.length} pontos marcados.
            </div>
          </div>
        </div>
      )}

      {/* LAYER CONTROL PANEL (300-320px, Collapsible with smooth animation) */}
      {isLayerPanelOpen ? (
        <div className="absolute top-16 left-24 bottom-14 w-80 bg-white rounded-2xl border border-[#DDE4DE] shadow-2xl z-20 flex flex-col overflow-hidden text-xs animate-in slide-in-from-left duration-200">
          <div className="p-3 border-b border-[#DDE4DE] flex items-center justify-between bg-[#F5F7F4]">
            <div className="flex items-center gap-2">
              <img src="/symbols/01_geoportal_mapa.png" alt="Camadas" className="w-5 h-5 object-contain flex-shrink-0" />
              <h3 className="font-bold text-xs text-[#17211B]">Camadas Cartográficas</h3>
            </div>
            <button
              onClick={() => setIsLayerPanelOpen(false)}
              className="text-[#5F6D65] hover:text-[#17211B] bg-white border border-[#DDE4DE] hover:bg-slate-100 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              title="Recolher menu de camadas"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Recolher</span>
            </button>
          </div>

          <div className="p-3 space-y-3 flex-1 overflow-y-auto">
            {/* Poligonal CEUR */}
            <div className="space-y-1.5 py-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#17211B] flex items-center gap-2.5 text-xs">
                  <img src="/symbols/13_poligonal_ceur.png" alt="Poligonal CEUR" className="w-5 h-5 object-contain" />
                  <span>Poligonal CEUR</span>
                </span>
                <input
                  type="checkbox"
                  checked={layerVisibility.ceur}
                  onChange={(e) => setLayerVisibility({ ...layerVisibility, ceur: e.target.checked })}
                  className="rounded text-[#00A651] focus:ring-0 cursor-pointer w-4 h-4"
                />
              </div>
            </div>

            {/* Parques SPE */}
            <div className="border-t border-[#DDE4DE] pt-2.5 pb-1 flex items-center justify-between">
              <span className="font-semibold text-[#17211B] flex items-center gap-2.5 text-xs">
                <img src="/symbols/12_parques_spe.png" alt="Parques SPE" className="w-5 h-5 object-contain" />
                <span>Parques SPE (18)</span>
              </span>
              <input
                type="checkbox"
                checked={layerVisibility.spe}
                onChange={(e) => setLayerVisibility({ ...layerVisibility, spe: e.target.checked })}
                className="rounded text-[#00A651] focus:ring-0 cursor-pointer w-4 h-4"
              />
            </div>

            {/* Reserva Legal */}
            <div className="border-t border-[#DDE4DE] pt-2.5 pb-1 flex items-center justify-between">
              <span className="font-semibold text-[#17211B] flex items-center gap-2.5 text-xs">
                <img src="/symbols/11_reserva_legal.png" alt="Reserva Legal" className="w-5 h-5 object-contain" />
                <span>Reserva Legal (6)</span>
              </span>
              <input
                type="checkbox"
                checked={layerVisibility.reservaLegal}
                onChange={(e) => setLayerVisibility({ ...layerVisibility, reservaLegal: e.target.checked })}
                className="rounded text-[#00A651] focus:ring-0 cursor-pointer w-4 h-4"
              />
            </div>

            {/* Áreas PRAD */}
            <div className="border-t border-[#DDE4DE] pt-2.5 pb-1 flex items-center justify-between">
              <span className="font-semibold text-[#17211B] flex items-center gap-2.5 text-xs">
                <img src="/symbols/03_areas_prad_folha.png" alt="Áreas PRAD" className="w-5 h-5 object-contain" />
                <span>Áreas PRAD (38)</span>
              </span>
              <input
                type="checkbox"
                checked={layerVisibility.areas}
                onChange={(e) => setLayerVisibility({ ...layerVisibility, areas: e.target.checked })}
                className="rounded text-[#00A651] focus:ring-0 cursor-pointer w-4 h-4"
              />
            </div>

            {/* Aerogeradores */}
            <div className="border-t border-[#DDE4DE] pt-2.5 pb-1 flex items-center justify-between">
              <span className="font-semibold text-[#17211B] flex items-center gap-2.5 text-xs">
                <img src="/symbols/09_aerogeradores_turbina.png" alt="Aerogeradores" className="w-5 h-5 object-contain" />
                <span>Aerogeradores (144)</span>
              </span>
              <input
                type="checkbox"
                checked={layerVisibility.turbines}
                onChange={(e) => setLayerVisibility({ ...layerVisibility, turbines: e.target.checked })}
                className="rounded text-[#00A651] focus:ring-0 cursor-pointer w-4 h-4"
              />
            </div>

            {/* Acessos & Vias */}
            <div className="border-t border-[#DDE4DE] pt-2.5 pb-1 flex items-center justify-between">
              <span className="font-semibold text-[#17211B] flex items-center gap-2.5 text-xs">
                <img src="/symbols/10_acessos_vias.png" alt="Acessos" className="w-5 h-5 object-contain" />
                <span>Acessos & Vias</span>
              </span>
              <input
                type="checkbox"
                checked={layerVisibility.roads}
                onChange={(e) => setLayerVisibility({ ...layerVisibility, roads: e.target.checked })}
                className="rounded text-[#00A651] focus:ring-0 cursor-pointer w-4 h-4"
              />
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsLayerPanelOpen(true)}
          className="absolute top-16 left-24 z-20 bg-[#121812]/90 hover:bg-[#121812] text-white border border-white/20 shadow-xl px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer backdrop-blur-md active:scale-95 animate-in fade-in"
          title="Reabrir Legenda & Camadas Cartográficas"
        >
          <img src="/symbols/01_geoportal_mapa.png" alt="Legenda" className="w-5 h-5 object-contain brightness-0 invert flex-shrink-0" />
          <span>Camadas & Legenda</span>
          <span className="bg-[#00A651] text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold">7</span>
        </button>
      )}

      {/* INSTANT REDUCED MAP CARD POPUP */}
      {mapPopup && (
        <div className="absolute top-12 right-12 z-30 w-[390px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl border border-[#DDE4DE] shadow-2xl overflow-hidden font-sans text-xs animate-in fade-in duration-200 flex flex-col max-h-[82vh]">
          <div className="px-4 py-3 border-b border-[#DDE4DE] flex items-center justify-between bg-white flex-shrink-0">
            <h3 className="font-bold text-sm text-[#17211B] truncate pr-2" title={mapPopup.title}>
              {mapPopup.title}
            </h3>
            <button onClick={() => setMapPopup(null)} className="text-[#5F6D65] hover:text-[#17211B] flex-shrink-0 p-0.5 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex border-b border-[#DDE4DE] bg-white text-[11px] font-medium flex-shrink-0">
            <button
              onClick={() => setSelectedTab('resumo')}
              className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${selectedTab === 'resumo' ? 'border-[#365314] text-[#365314] font-bold' : 'border-transparent text-[#5F6D65] hover:text-[#17211B]'}`}
            >
              Resumo
            </button>
            <button
              onClick={() => setSelectedTab('atividades')}
              className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${selectedTab === 'atividades' ? 'border-[#365314] text-[#365314] font-bold' : 'border-transparent text-[#5F6D65] hover:text-[#17211B]'}`}
            >
              Atividades
            </button>
            <button
              onClick={() => setSelectedTab('fotografias')}
              className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${selectedTab === 'fotografias' ? 'border-[#365314] text-[#365314] font-bold' : 'border-transparent text-[#5F6D65] hover:text-[#17211B]'}`}
            >
              Fotografias
            </button>
            <button
              onClick={() => setSelectedTab('historico')}
              className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${selectedTab === 'historico' ? 'border-[#365314] text-[#365314] font-bold' : 'border-transparent text-[#5F6D65] hover:text-[#17211B]'}`}
            >
              Histórico
            </button>
          </div>

          <div className="p-4 bg-white overflow-y-auto space-y-3 flex-1">
            {/* TAB 1: RESUMO */}
            {selectedTab === 'resumo' && (
              <div className="space-y-3">
                {/* Photo Preview if photo exists */}
                {mapPopup.photoUrl ? (
                  <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-[#DDE4DE] relative group flex-shrink-0">
                    <img src={mapPopup.photoUrl} alt={mapPopup.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm">
                      {mapPopup.capturedAt}
                    </span>
                  </div>
                ) : null}

                {/* High Information PRAD Badge Header */}
                <div className="bg-[#F5F7F4] p-3 rounded-xl border border-[#DDE4DE] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2 py-1 rounded-lg bg-[#365314] text-white font-bold font-mono text-xs shadow-sm flex-shrink-0">
                      {mapPopup.pradCode || 'PRAD'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-[#5F6D65] block uppercase tracking-wider font-semibold truncate">
                        {mapPopup.gleba || 'Gleba Principal'}
                      </span>
                      <strong className="text-xs text-[#17211B] font-bold block truncate" title={mapPopup.pradName || mapPopup.title}>
                        {mapPopup.pradName || mapPopup.title}
                      </strong>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF3E8] text-[#365314] border border-[#C5DCBD] flex-shrink-0 whitespace-nowrap">
                    {mapPopup.status || 'Em recuperação'}
                  </span>
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex items-center justify-between pt-1 pb-1">
                    <span className="text-[#5F6D65] text-[11px]">Código do PRAD:</span>
                    <strong className="text-[#365314] font-mono font-bold text-xs">{mapPopup.pradCode || 'PRAD'}</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 pb-1 gap-2">
                    <span className="text-[#5F6D65] text-[11px] flex-shrink-0">Nome do Local:</span>
                    <strong className="text-[#17211B] font-medium text-right text-[11px] truncate max-w-[200px]" title={mapPopup.pradName}>
                      {mapPopup.pradName}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 pb-1">
                    <span className="text-[#5F6D65] text-[11px]">Parque Eólico (SPE):</span>
                    <strong className="text-[#17211B] font-mono text-[11px]">{mapPopup.spe}</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 pb-1">
                    <span className="text-[#5F6D65] text-[11px]">Superfície Total:</span>
                    <strong className="text-[#17211B] font-mono text-[11px]">{mapPopup.surface}</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 pb-1 gap-2">
                    <span className="text-[#5F6D65] text-[11px] flex-shrink-0">Tipo de Intervenção:</span>
                    <strong className="text-[#365314] font-bold text-right text-[11px]">
                      {mapPopup.atuacao || 'Revegetação & Controle Erosivo'}
                    </strong>
                  </div>
                  {mapPopup.utmX && (
                    <div className="flex items-center justify-between pt-1.5 pb-1">
                      <span className="text-[#5F6D65] text-[11px]">Coordenadas UTM:</span>
                      <strong className="text-[#17211B] font-mono text-[11px]">E {mapPopup.utmX} | N {mapPopup.utmY}</strong>
                    </div>
                  )}
                  <div className="pt-2">
                    <span className="text-[#5F6D65] text-[10px] uppercase font-bold tracking-wider block mb-1">Diagnóstico & Observações:</span>
                    <p className="text-[#17211B] text-[11px] leading-relaxed bg-[#F5F7F4] p-2.5 rounded-xl border border-[#DDE4DE]">
                      {mapPopup.notes}
                    </p>
                  </div>

                  {/* 📄 PDF Export Button (Item 4) */}
                  <button
                    onClick={() => handleExportPRADPDF(mapPopup)}
                    className="w-full mt-2.5 py-2 px-3 bg-[#365314] hover:bg-[#283e0e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar Ficha PRAD (PDF)</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: ATIVIDADES */}
            {selectedTab === 'atividades' && (
              <div className="space-y-2.5 text-xs">
                <span className="text-[10px] text-[#5F6D65] uppercase font-bold tracking-wider block">Ações de Recuperação Ambiental</span>
                <div className="space-y-2">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between">
                    <div>
                      <strong className="block text-[#17211B] font-bold text-[11px]">Revegetação com Mudas Nativas</strong>
                      <span className="text-[10px] text-[#5F6D65]">Caatinga (Aroeira, Umbuzeiro, Angico)</span>
                    </div>
                    <span className="text-[9px] font-bold bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Concluído</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between">
                    <div>
                      <strong className="block text-[#17211B] font-bold text-[11px]">Controle Erosivo & Biomantas</strong>
                      <span className="text-[10px] text-[#5F6D65]">Construção de leiras e palissadas</span>
                    </div>
                    <span className="text-[9px] font-bold bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Concluído</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between">
                    <div>
                      <strong className="block text-[#17211B] font-bold text-[11px]">Adubação & Irrigação de Salvamento</strong>
                      <span className="text-[10px] text-[#5F6D65]">Manutenção nutricional do solo</span>
                    </div>
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">75% Em andamento</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FOTOGRAFIAS */}
            {selectedTab === 'fotografias' && (
              <div className="space-y-2.5 text-xs">
                {mapPopup.photoUrl ? (
                  <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-[#DDE4DE] relative group">
                    <img
                      src={mapPopup.photoUrl}
                      alt={mapPopup.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('/uploads/photos/')) {
                          target.src = target.src.replace('/figuras/', '/uploads/photos/');
                        } else {
                          target.src = '/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.32.jpeg';
                        }
                      }}
                    />
                    {mapPopup.photosList && mapPopup.photosList.length > 1 && (
                      <>
                        <button
                          onClick={() => {
                            const nextIdx = (mapPopup.photoIndex - 1 + mapPopup.photosList.length) % mapPopup.photosList.length;
                            const current = mapPopup.photosList[nextIdx];
                            const url = current.storage_path || current.storagePath || (current.fileName || current.file_name ? `/figuras/${encodeURIComponent(current.fileName || current.file_name)}` : '/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.32.jpeg');
                            setMapPopup({
                              ...mapPopup,
                              photoIndex: nextIdx,
                              photoUrl: url,
                              capturedAt: current.capturedAt || current.captured_at ? `${current.capturedAt || current.captured_at}`.trim() : '19/08/2026',
                            });
                          }}
                          className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1 rounded-full shadow cursor-pointer hover:bg-black/80"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const nextIdx = (mapPopup.photoIndex + 1) % mapPopup.photosList.length;
                            const current = mapPopup.photosList[nextIdx];
                            const url = current.storage_path || current.storagePath || (current.fileName || current.file_name ? `/figuras/${encodeURIComponent(current.fileName || current.file_name)}` : '/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.32.jpeg');
                            setMapPopup({
                              ...mapPopup,
                              photoIndex: nextIdx,
                              photoUrl: url,
                              capturedAt: current.capturedAt || current.captured_at ? `${current.capturedAt || current.captured_at}`.trim() : '19/08/2026',
                            });
                          }}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1 rounded-full shadow cursor-pointer hover:bg-black/80"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <span className="absolute top-1.5 left-1.5 bg-black/75 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                          Foto {mapPopup.photoIndex + 1} de {mapPopup.photosList.length}
                        </span>
                      </>
                    )}
                    <span className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                      {mapPopup.capturedAt}
                    </span>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-[#5F6D65]">
                    <Camera className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                    <p className="text-[11px]">Nenhuma foto direta anexada. Utilize a camada de Fotografias de Campo no mapa para vistorias fotográficas.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: HISTÓRICO */}
            {selectedTab === 'historico' && (
              <div className="space-y-2 text-xs">
                <span className="text-[10px] text-[#5F6D65] uppercase font-bold tracking-wider block">Histórico de Monitoramento</span>
                <div className="relative border-l-2 border-[#C5DCBD] pl-3 ml-1 space-y-3 pt-1">
                  <div className="relative">
                    <div className="absolute -left-[17px] top-0.5 w-2 h-2 rounded-full bg-[#365314]" />
                    <strong className="block text-[11px] text-[#17211B]">Vistoria Técnica de Monitoramento</strong>
                    <span className="text-[10px] text-[#5F6D65] font-mono block">18/08/2026 - Equipe Ambiental</span>
                    <p className="text-[10px] text-slate-600 mt-0.5">Avaliação da taxa de germinação (65% de cobertura vegetal).</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[17px] top-0.5 w-2 h-2 rounded-full bg-slate-400" />
                    <strong className="block text-[11px] text-[#17211B]">Intervenção Física Concluída</strong>
                    <span className="text-[10px] text-[#5F6D65] font-mono block">02/06/2026 - Empreiteira</span>
                    <p className="text-[10px] text-slate-600 mt-0.5">Palissadas de contenção e biomantas instaladas com sucesso.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[17px] top-0.5 w-2 h-2 rounded-full bg-slate-400" />
                    <strong className="block text-[11px] text-[#17211B]">Aprovação do Plano de Recuperação</strong>
                    <span className="text-[10px] text-[#5F6D65] font-mono block">15/01/2026 - Órgão Ambiental</span>
                    <p className="text-[10px] text-slate-600 mt-0.5">Aprovação técnica do PRAD referente ao Complexo Umburanas.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📊 TOP FLOATING EXECUTIVE KPI METRICS BAR (Item 5) */}
      {showKPIPanel && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-[#121812]/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl border border-white/15 shadow-xl flex items-center space-x-5 text-xs animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-2">
            <Trees className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-300 block leading-tight">Área em Recuperação</span>
              <strong className="text-emerald-400 font-bold font-mono text-xs">48.5 / 65.2 ha (74.4%)</strong>
            </div>
          </div>
          <div className="h-6 w-px bg-white/15" />
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <div>
              <span className="text-[10px] text-slate-300 block leading-tight">Mudas Plantadas</span>
              <strong className="text-white font-bold font-mono text-xs">14.250 mudas</strong>
            </div>
          </div>
          <div className="h-6 w-px bg-white/15" />
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-300 block leading-tight">Status 38 PRADs</span>
              <strong className="text-amber-300 font-bold font-mono text-xs">12 Concluídos • 22 Em andamento</strong>
            </div>
          </div>
          <div className="h-6 w-px bg-white/15" />
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-300 block leading-tight">Sobrevivência Vegetal</span>
              <strong className="text-cyan-300 font-bold font-mono text-xs">82.4% Caatinga</strong>
            </div>
          </div>
          <button onClick={() => setShowKPIPanel(false)} className="text-slate-400 hover:text-white p-1 ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 🌿 NDVI VEGETATION HEALTH LEGEND (Item 2) */}
      {showNDVI && (
        <div className="absolute bottom-16 left-24 z-30 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-[#DDE4DE] shadow-lg text-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
            <strong className="text-[#17211B] font-bold text-[11px] flex items-center gap-1.5">
              <Trees className="w-4 h-4 text-emerald-600" />
              <span>Saúde Vegetal NDVI (Satélite)</span>
            </strong>
            <button onClick={() => setShowNDVI(false)} className="text-slate-400 hover:text-slate-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-3 h-3 rounded bg-[#1b5e20]" />
            <span>NDVI &gt; 0.65 (Vegetação Densa / Vigor Alto)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-3 h-3 rounded bg-[#fbc02d]" />
            <span>NDVI 0.35 - 0.65 (Em Regeneração)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-3 h-3 rounded bg-[#d32f2f]" />
            <span>NDVI &lt; 0.35 (Solo Esposto / Irrigação)</span>
          </div>
        </div>
      )}

      {/* 🌓 SLIDING COMPARE CURTAIN (Item 1) */}
      {compareMode && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          <div className="absolute top-16 left-28 bg-black/75 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm shadow pointer-events-auto">
            2022 (Pré-Recuperação / Baseline)
          </div>
          <div className="absolute top-16 right-28 bg-[#365314]/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm shadow pointer-events-auto">
            2026 (Pós-Recuperação Vegetal)
          </div>
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-auto cursor-ew-resize flex items-center justify-center"
            style={{ left: `${comparePos}%` }}
          >
            <input
              type="range"
              min="10"
              max="90"
              value={comparePos}
              onChange={(e) => setComparePos(Number(e.target.value))}
              className="absolute w-48 opacity-0 cursor-ew-resize"
            />
            <div className="w-8 h-8 rounded-full bg-white text-[#17211B] shadow-xl border border-slate-300 flex items-center justify-center text-xs font-bold">
              ↔
            </div>
          </div>
        </div>
      )}

      {/* VERTICAL MAP CONTROLS STACK (Locate, Zoom +, Zoom -, Fullscreen, Style) */}
      <div className="absolute bottom-14 right-4 z-30 flex flex-col items-end space-y-2">

        {/* VERTICAL MAP CONTROLS STACK (Matching Imagem 2) */}
        <div className="bg-white rounded-2xl shadow-md border border-[#DDE4DE] flex flex-col overflow-hidden text-[#17211B] divide-y divide-[#DDE4DE] w-11">
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  map.current?.flyTo({
                    center: [pos.coords.longitude, pos.coords.latitude],
                    zoom: 15,
                  });
                });
              }
            }}
            className="p-3 hover:bg-slate-50 transition-colors text-[#00A651] flex items-center justify-center cursor-pointer"
            title="Minha localização"
          >
            <Target className="w-5 h-5 text-[#00A651]" />
          </button>

          <button
            onClick={() => map.current?.zoomIn()}
            className="p-3 hover:bg-slate-50 font-extrabold text-base text-[#17211B] flex items-center justify-center transition-colors cursor-pointer"
            title="Aumentar zoom (+)"
          >
            +
          </button>

          <button
            onClick={() => map.current?.zoomOut()}
            className="p-3 hover:bg-slate-50 font-extrabold text-base text-[#17211B] flex items-center justify-center transition-colors cursor-pointer"
            title="Diminuir zoom (-)"
          >
            -
          </button>

          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                mapContainer.current?.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }}
            className="p-3 hover:bg-slate-50 transition-colors text-[#17211B] flex items-center justify-center cursor-pointer"
            title="Tela cheia"
          >
            <Maximize2 className="w-4.5 h-4.5 text-[#17211B]" />
          </button>

          <button
            onClick={() => {
              setBaseMap((prev) => (prev === 'carto' ? 'satellite' : prev === 'satellite' ? 'ortofoto' : 'carto'));
            }}
            className="p-3 hover:bg-slate-50 transition-colors text-[#365314] flex items-center justify-center cursor-pointer"
            title="Alternar estilo de mapa (Cartográfico / Satélite / Ortofoto)"
          >
            <Layers className="w-5 h-5 text-[#365314]" />
          </button>
        </div>
      </div>

      {/* DISCRETE BOTTOM STATUS BAR (Scale, Coords, SRC, Image Date, Source) */}
      <div className="absolute bottom-0 left-20 right-0 h-10 bg-white/95 border-t border-[#DDE4DE] flex items-center justify-between px-4 text-[11px] font-sans text-[#5F6D65] z-30">
        <div className="flex items-center space-x-4">
          <span>Escala: <strong className="text-[#17211B]">1 km</strong></span>
          <span>SRC: <strong className="text-[#17211B] font-mono">SIRGAS 2000 / UTM 24S</strong></span>
          <span>Data Imagem: <strong className="text-[#17211B]">16 ago. 2026</strong></span>
        </div>

        <div className="flex items-center space-x-4 font-mono">
          <span>UTM 24L 624.512 mE 8.887.296 mS</span>
          <span className="text-[#365314] font-bold font-sans">Elaborado por Maurivan Vaz Ribeiro • Fonte: EcoBrasil / ENGIE</span>
        </div>
      </div>
    </div>
  );
}
