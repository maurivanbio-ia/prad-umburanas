"use client";

import React, { useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { Tile3DLayer } from "@deck.gl/geo-layers";
import { PointCloudLayer } from "@deck.gl/layers";
// @ts-ignore
import Map from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Tiles3DLoader } from "@loaders.gl/3d-tiles";
import MapToolbar from "./MapToolbar";

// Configuração inicial da câmera
const INITIAL_VIEW_STATE = {
  longitude: -75.61209430782448, // Ajustado para o sample
  latitude: 40.042530611425896,
  zoom: 16,
  pitch: 45,
  bearing: 0,
};

// URL de uma nuvem de pontos pública de exemplo (já que os dados de Umburanas ainda não estão disponíveis em 3D Tiles)
const SAMPLE_TILESET_URL =
  "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-tiles/pointcloud/tileset.json";

export default function MapViewer3D() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const layers = [
    new Tile3DLayer({
      id: "point-cloud-3d-tiles",
      data: SAMPLE_TILESET_URL,
      loader: Tiles3DLoader,
      onTilesetLoad: (tileset: any) => {
        // Centraliza a câmera no tileset quando ele carrega
        const { cartographicCenter, zoom } = tileset;
        if (cartographicCenter) {
          setViewState({
            ...viewState,
            longitude: cartographicCenter[0],
            latitude: cartographicCenter[1],
            zoom: zoom || 16,
          });
        }
      },
      pointSize: 2,
    }),
  ];

  return (
    <div className="relative h-screen w-full bg-grafite">
      {/* Toolbar customizada */}
      <MapToolbar />

      <DeckGL
        layers={layers}
        viewState={viewState as any}
        onViewStateChange={({ viewState }) => setViewState(viewState as any)}
        controller={true}
      >
        <Map
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json"
          mapLib={maplibregl as any}
        />
      </DeckGL>
    </div>
  );
}
