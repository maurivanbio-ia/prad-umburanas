'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Compass,
  MapPin,
  Sprout,
  ArrowUpRight
} from 'lucide-react';
import { AREAS_PRAD_CANONICAS } from '@/data/semanticDb';

export default function AreasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResultado, setFilterResultado] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');

  const filteredAreas = AREAS_PRAD_CANONICAS.filter((a) => {
    const matchRes = filterResultado === 'todos' || a.resultadoAmbiental === filterResultado;
    const matchTipo = filterTipo === 'todos' || a.tipo.toLowerCase().includes(filterTipo.toLowerCase());
    const matchSearch =
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.conjuntoEolico.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRes && matchTipo && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F5F7F4] text-[#17211B] p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE4DE] pb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#5F6D65] flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00A651]" />
              <span>Gestão Territorial das 38 Áreas PRAD</span>
            </div>
            <h1 className="text-2xl font-bold text-[#17211B] tracking-tight">
              Catálogo de Áreas em Recuperação
            </h1>
            <p className="text-sm text-[#5F6D65] mt-0.5">
              Polígonos de Botas-Foras, Acessos, Canteiros e Jazidas com rastreabilidade por identificador canônico.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/geoportal"
              className="px-4 py-2 bg-[#00A651] hover:bg-[#008C44] text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Ver no Mapa Operacional</span>
            </Link>
          </div>
        </div>

        {/* BARRA DE FILTROS E BUSCA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#DDE4DE] shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ID (ex: UMB25), nome ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F5F7F4] border border-[#DDE4DE] rounded-xl text-xs text-[#17211B] focus:outline-none focus:ring-2 focus:ring-[#00A651]/40"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {['todos', 'satisfatorio', 'atencao', 'critico'].map((res) => (
              <button
                key={res}
                onClick={() => setFilterResultado(res)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                  filterResultado === res
                    ? 'bg-[#17211B] text-white'
                    : 'bg-[#F5F7F4] text-[#5F6D65] hover:text-[#17211B] border border-[#DDE4DE]'
                }`}
              >
                {res === 'todos' ? 'Todos os Resultados' : res}
              </button>
            ))}
          </div>
        </div>

        {/* TABELA DE ÁREAS PRAD */}
        <div className="bg-white rounded-3xl border border-[#DDE4DE] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F4] border-b border-[#DDE4DE] text-[#5F6D65] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">ID Canônico</th>
                  <th className="py-3 px-4">Nome da Área & Conjunto Eólico</th>
                  <th className="py-3 px-4">Tipo de Intervenção</th>
                  <th className="py-3 px-4">Área (ha)</th>
                  <th className="py-3 px-4">Resultado Ambiental</th>
                  <th className="py-3 px-4">Recuperação</th>
                  <th className="py-3 px-4">Execução</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]/60">
                {filteredAreas.map((area) => (
                  <tr key={area.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px] border border-emerald-300">
                        {area.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link href={`/areas/${area.id}`} className="font-bold text-[#17211B] hover:text-[#00A651] block leading-tight">
                        {area.nome}
                      </Link>
                      <span className="text-[10px] text-[#5F6D65]">{area.conjuntoEolico}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#5F6D65] font-medium">
                      {area.tipo}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#17211B]">
                      {area.areaHa} ha
                    </td>
                    <td className="py-3.5 px-4">
                      {area.resultadoAmbiental === 'satisfatorio' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Satisfatório
                        </span>
                      )}
                      {area.resultadoAmbiental === 'atencao' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3" /> Atenção
                        </span>
                      )}
                      {area.resultadoAmbiental === 'critico' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3" /> Crítico
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#00A651]">
                      {area.indiceRecuperacao}%
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#17211B]">
                      {area.progressoExecucao}%
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/areas/${area.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00A651] hover:underline"
                      >
                        <span>Abrir Ficha</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
