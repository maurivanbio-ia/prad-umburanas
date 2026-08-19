"use client";

import React from "react";
import Image from "next/image";

export default function MapToolbar() {
  return (
    <>
      {/* Menu Principal Esquerdo (Navegação Principal) */}
      <div className="absolute top-6 left-6 z-40 flex flex-col space-y-2 rounded-xl border border-gray-700/50 bg-grafite/90 p-2 shadow-2xl backdrop-blur-sm">
        <button title="Geoportal Mapa" className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-800">
          <Image src="/simbolos/01_geoportal_mapa.svg" alt="Mapa" width={20} height={20} />
        </button>
        <button title="Dashboard" className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-800">
          <Image src="/simbolos/02_dashboard_velocimetro.svg" alt="Dashboard" width={20} height={20} />
        </button>
        <button title="Áreas PRAD" className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-800">
          <Image src="/simbolos/03_areas_prad_folha.svg" alt="Áreas" width={20} height={20} />
        </button>
        <div className="mx-2 h-px bg-gray-700/50"></div>
        <button title="Planejamento" className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-800">
          <Image src="/simbolos/04_planejamento_grafico.svg" alt="Planejamento" width={20} height={20} />
        </button>
        <button title="Calendário" className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-800">
          <Image src="/simbolos/05_calendario.svg" alt="Calendário" width={20} height={20} />
        </button>
        <button title="Galeria" className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-800">
          <Image src="/simbolos/06_galeria.svg" alt="Galeria" width={20} height={20} />
        </button>
        <button title="Relatórios" className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-800">
          <Image src="/simbolos/07_relatorios_documento.svg" alt="Relatórios" width={20} height={20} />
        </button>
      </div>

      {/* Camadas Cartográficas (Canto Superior Direito) */}
      <div className="absolute top-6 right-6 z-40 flex space-x-2 rounded-xl border border-gray-700/50 bg-grafite/90 p-2 shadow-2xl backdrop-blur-sm">
        <button title="Poligonal CEUR" className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-800">
          <Image src="/simbolos/13_poligonal_ceur.svg" alt="CEUR" width={20} height={20} />
        </button>
        <button title="Aerogeradores" className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-800">
          <Image src="/simbolos/09_aerogeradores_turbina.svg" alt="Aerogeradores" width={20} height={20} />
        </button>
        <button title="Acessos" className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-800">
          <Image src="/simbolos/10_acessos_vias.svg" alt="Acessos" width={20} height={20} />
        </button>
        <div className="mx-1 w-px bg-gray-700/50"></div>
        <button title="Reserva Legal" className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-800">
          <Image src="/simbolos/11_reserva_legal.svg" alt="Reserva Legal" width={20} height={20} />
        </button>
        <button title="Parques SPE" className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-800">
          <Image src="/simbolos/12_parques_spe.svg" alt="Parques SPE" width={20} height={20} />
        </button>
      </div>

      {/* Legenda de Marcadores de Situação (Canto Inferior Esquerdo) */}
      <div className="absolute bottom-6 left-6 z-40 flex flex-col space-y-2 rounded-xl border border-gray-700/50 bg-grafite/90 p-4 shadow-2xl backdrop-blur-sm">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Situação</h3>
        <div className="flex items-center space-x-2">
          <Image src="/simbolos/14_status_concluida.svg" alt="Concluída" width={16} height={16} />
          <span className="text-xs text-gray-300">Concluída</span>
        </div>
        <div className="flex items-center space-x-2">
          <Image src="/simbolos/15_status_em_andamento.svg" alt="Em Andamento" width={16} height={16} />
          <span className="text-xs text-gray-300">Em Andamento</span>
        </div>
        <div className="flex items-center space-x-2">
          <Image src="/simbolos/16_status_atrasada.svg" alt="Atrasada" width={16} height={16} />
          <span className="text-xs text-gray-300">Atrasada</span>
        </div>
        <div className="flex items-center space-x-2">
          <Image src="/simbolos/17_status_planejada.svg" alt="Planejada" width={16} height={16} />
          <span className="text-xs text-gray-300">Planejada</span>
        </div>
      </div>
    </>
  );
}
