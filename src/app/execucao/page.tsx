'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  Plus,
  ArrowUpRight,
  User,
  Calendar,
  Layers,
  Search,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  MapPin,
  Camera
} from 'lucide-react';
import { AREAS_PRAD_CANONICAS } from '@/data/semanticDb';

export default function ExecucaoPage() {
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showNewModal, setShowNewModal] = useState<boolean>(false);

  // Lista de atividades operacionais derivadas das 38 áreas
  const atividades = AREAS_PRAD_CANONICAS.map((area, idx) => ({
    id: `ATIV-${String(idx + 1).padStart(3, '0')}`,
    areaId: area.id,
    areaNome: area.nome,
    tipo: idx % 4 === 0 ? 'Plantio & Enriquecimento' : idx % 4 === 1 ? 'Controle Erosivo & Palissadas' : idx % 4 === 2 ? 'Manutenção & Coroamento' : 'Irrigação Suplementar',
    status: area.statusOperacional,
    progresso: area.progressoExecucao,
    responsavel: area.ultimaAtividade?.responsavel || 'Equipe Campo EcoBrasil',
    dataInicio: '01/08/2026',
    dataPrevisao: '30/08/2026',
    equipe: idx % 2 === 0 ? 'Equipe Alfa (Caatinga)' : 'Equipe Beta (Obras Verdes)',
    fotosQtd: area.totalEvidencias
  }));

  const filtered = atividades.filter(a => {
    const matchStatus = filterStatus === 'todos' || a.status === filterStatus;
    const matchSearch = a.areaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        a.areaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        a.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalConcluidas = atividades.filter(a => a.status === 'concluido').length;
  const totalEmAndamento = atividades.filter(a => a.status === 'em_execucao').length;
  const totalAtrasadas = atividades.filter(a => a.status === 'atrasado').length;
  const totalProgramadas = atividades.filter(a => a.status === 'programado').length;

  return (
    <div className="min-h-screen bg-[#F5F7F4] text-[#17211B] p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* CABEÇALHO DA PÁGINA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE4DE] pb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#5F6D65] flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00A651]" />
              <span>Gestão Operacional de Campo</span>
            </div>
            <h1 className="text-2xl font-bold text-[#17211B] tracking-tight">
              Execução de Atividades & Intervenções
            </h1>
            <p className="text-sm text-[#5F6D65] mt-0.5">
              Acompanhamento de plantio, contenção erosiva, irrigação e manutenção nas 38 áreas PRAD.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2.5 bg-[#00A651] hover:bg-[#008C44] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nova Atividade</span>
            </button>
          </div>
        </div>

        {/* CARDS DE STATUS OPERACIONAL */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            onClick={() => setFilterStatus('todos')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === 'todos'
                ? 'bg-white border-[#00A651] shadow-md ring-2 ring-[#00A651]/20'
                : 'bg-white border-[#DDE4DE] hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="text-xs font-bold text-[#5F6D65] uppercase">Total Atividades</div>
            <div className="text-2xl font-bold text-[#17211B] mt-1">{atividades.length}</div>
            <div className="text-[11px] text-[#5F6D65] mt-1">Distribuídas em 38 polígonos</div>
          </div>

          <div
            onClick={() => setFilterStatus('concluido')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === 'concluido'
                ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white border-[#DDE4DE] hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Concluídas</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{totalConcluidas}</div>
            <div className="text-[11px] text-[#5F6D65] mt-1">{Math.round((totalConcluidas / atividades.length) * 100)}% da meta total</div>
          </div>

          <div
            onClick={() => setFilterStatus('em_execucao')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === 'em_execucao'
                ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white border-[#DDE4DE] hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Em Andamento</span>
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{totalEmAndamento}</div>
            <div className="text-[11px] text-[#5F6D65] mt-1">Frente de trabalho ativa</div>
          </div>

          <div
            onClick={() => setFilterStatus('atrasado')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === 'atrasado'
                ? 'bg-white border-red-500 shadow-md ring-2 ring-red-500/20'
                : 'bg-white border-[#DDE4DE] hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="text-xs font-bold text-red-700 uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>Atrasadas / Atenção</span>
            </div>
            <div className="text-2xl font-bold text-red-700 mt-1">{totalAtrasadas}</div>
            <div className="text-[11px] text-red-600 mt-1">Exigem intervenção imediata</div>
          </div>
        </div>

        {/* BARRA DE FILTRO E BUSCA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#DDE4DE] shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ID, área ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F5F7F4] border border-[#DDE4DE] rounded-xl text-xs text-[#17211B] focus:outline-none focus:ring-2 focus:ring-[#00A651]/40"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {['todos', 'concluido', 'em_execucao', 'atrasado', 'programado'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-[#17211B] text-white'
                    : 'bg-[#F5F7F4] text-[#5F6D65] hover:text-[#17211B] border border-[#DDE4DE]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* TABELA CORPORATIVA DE ATIVIDADES */}
        <div className="bg-white rounded-2xl border border-[#DDE4DE] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F4] border-b border-[#DDE4DE] text-[#5F6D65] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">ID & Área PRAD</th>
                  <th className="py-3 px-4">Tipo de Intervenção</th>
                  <th className="py-3 px-4">Status Operacional</th>
                  <th className="py-3 px-4">Progresso Físico</th>
                  <th className="py-3 px-4">Responsável & Equipe</th>
                  <th className="py-3 px-4">Evidências</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]/60">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link href={`/areas/${item.areaId}`} className="font-bold text-[#17211B] hover:text-[#00A651] flex items-center gap-1.5 group">
                        <span className="font-mono text-emerald-700 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                          {item.areaId}
                        </span>
                        <span className="truncate max-w-[180px]">{item.areaNome}</span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#17211B]">
                      {item.tipo}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'concluido' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Concluído
                        </span>
                      )}
                      {item.status === 'em_execucao' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          <Clock className="w-3 h-3" /> Em Andamento
                        </span>
                      )}
                      {item.status === 'atrasado' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3" /> Atrasado
                        </span>
                      )}
                      {item.status === 'programado' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          Programado
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-32">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span>{item.progresso}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.progresso >= 90 ? 'bg-[#00A651]' : item.progresso >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.progresso}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#5F6D65]">
                      <div className="leading-tight font-medium text-[#17211B]">{item.responsavel}</div>
                      <div className="text-[10px]">{item.equipe}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href="/evidencias"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#F5F7F4] hover:bg-slate-200 text-[#17211B] rounded-lg text-[11px] font-medium border border-[#DDE4DE] transition-colors"
                      >
                        <Camera className="w-3 h-3 text-[#00A651]" />
                        <span>{item.fotosQtd} fotos</span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/areas/${item.areaId}?tab=execucao`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00A651] hover:underline"
                      >
                        <span>Detalhes</span>
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
