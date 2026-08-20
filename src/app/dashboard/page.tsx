'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowUpRight,
  Compass,
  Sprout,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  Camera,
  Activity,
  FileText
} from 'lucide-react';
import {
  KPIS_ESTRATEGICOS,
  ALERTAS_ACIONAVEIS_CANONICOS,
  AREAS_PRAD_CANONICAS,
  AUDITORIA_QUALIDADE_DADOS
} from '@/data/semanticDb';

export default function DashboardSituacaoPage() {
  const kpis = KPIS_ESTRATEGICOS;
  const alertas = ALERTAS_ACIONAVEIS_CANONICOS;
  const areasCriticas = AREAS_PRAD_CANONICAS.filter((a) => a.resultadoAmbiental === 'critico');
  const areasAtencao = AREAS_PRAD_CANONICAS.filter((a) => a.resultadoAmbiental === 'atencao');
  const areasSatisfatorias = AREAS_PRAD_CANONICAS.filter((a) => a.resultadoAmbiental === 'satisfatorio');

  return (
    <div className="min-h-screen bg-[#F5F7F4] text-[#17211B] p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* CABEÇALHO DA CENTRAL DE SITUAÇÃO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE4DE] pb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#5F6D65] flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00A651]" />
              <span>Painel Executivo de Situação Territorial</span>
            </div>
            <h1 className="text-2xl font-bold text-[#17211B] tracking-tight">
              PRAD Umburanas • Central de Situação
            </h1>
            <p className="text-sm text-[#5F6D65] mt-0.5">
              Status consolidado da recuperação ambiental, execução física, conformidade e ações imediatas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-[#5F6D65]">Desempenho Geral</div>
              <div className="text-sm font-bold text-[#00A651] flex items-center gap-1 justify-end">
                <CheckCircle2 className="w-4 h-4" />
                <span>86,7% (BOM)</span>
              </div>
            </div>
            <Link
              href="/geoportal"
              className="px-4 py-2 bg-[#00A651] hover:bg-[#008C44] text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Abrir Mapa Operacional</span>
            </Link>
          </div>
        </div>

        {/* 4 GRANDES CARDS DE SITUAÇÃO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#DDE4DE] shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-[#5F6D65] uppercase flex items-center justify-between">
                <span>Recuperação Ambiental</span>
                <span className="text-xs font-bold text-[#00A651] flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> +6,2%
                </span>
              </div>
              <div className="text-3xl font-bold text-[#17211B] mt-2">78,4%</div>
            </div>
            <div className="text-[11px] text-[#5F6D65] mt-3 pt-2 border-t border-[#DDE4DE]/60">
              Meta contratual: <strong className="text-[#17211B]">85,0%</strong>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#DDE4DE] shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-[#5F6D65] uppercase flex items-center justify-between">
                <span>Execução Física PRAD</span>
                <span className="text-xs font-bold text-blue-600">No Prazo</span>
              </div>
              <div className="text-3xl font-bold text-[#17211B] mt-2">91,3%</div>
            </div>
            <div className="text-[11px] text-[#5F6D65] mt-3 pt-2 border-t border-[#DDE4DE]/60">
              32 de 38 áreas concluídas
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#DDE4DE] shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-[#5F6D65] uppercase flex items-center justify-between">
                <span>Conformidade Legal</span>
                <span className="text-xs font-bold text-emerald-700">INEMA / IBAMA</span>
              </div>
              <div className="text-3xl font-bold text-emerald-700 mt-2">96,2%</div>
            </div>
            <div className="text-[11px] text-[#5F6D65] mt-3 pt-2 border-t border-[#DDE4DE]/60">
              100% de atendimento a condicionantes
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#DDE4DE] shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-red-700 uppercase flex items-center justify-between">
                <span>Áreas Críticas</span>
                <span className="text-xs font-bold text-red-600">Requer Ação</span>
              </div>
              <div className="text-3xl font-bold text-red-700 mt-2">3 áreas</div>
            </div>
            <div className="text-[11px] text-red-600 mt-3 pt-2 border-t border-[#DDE4DE]/60 font-semibold">
              7,8% do total dos polígonos
            </div>
          </div>
        </div>

        {/* SITUAÇÕES QUE EXIGEM AÇÃO (ALERTAS ACIONÁVEIS) */}
        <div className="bg-white rounded-3xl border border-[#DDE4DE] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDE4DE] pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-[#17211B]">
                Situações que Exigem Ação Imediata ({alertas.length})
              </h2>
            </div>
            <span className="text-xs text-[#5F6D65]">Prioridade operacional</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 text-xs ${
                  alerta.criticidade === 'critico'
                    ? 'bg-red-50/60 border-red-200'
                    : alerta.criticidade === 'atencao'
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-blue-50/60 border-blue-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-white border border-[#DDE4DE]">
                      {alerta.codigoArea}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${
                      alerta.criticidade === 'critico' ? 'text-red-700' :
                      alerta.criticidade === 'atencao' ? 'text-amber-700' : 'text-blue-700'
                    }`}>
                      {alerta.tipo}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-[#17211B] mt-1">{alerta.titulo}</h3>
                  <p className="text-[11px] text-[#5F6D65] mt-0.5">{alerta.descricao}</p>
                </div>

                <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                  <span className="text-[10px] text-[#5F6D65]">Detectado em: {alerta.dataGeracao}</span>
                  <Link
                    href={alerta.rotaAcao}
                    className="px-3 py-1.5 bg-[#00A651] hover:bg-[#008C44] text-white font-bold rounded-xl flex items-center gap-1 shadow-sm transition-all"
                  >
                    <span>{alerta.acaoSugerida}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAPA DE SITUAÇÃO E DISTRIBUIÇÃO DAS 38 ÁREAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#DDE4DE] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#17211B]">Distribuição Territorial do PRAD</h3>
                <p className="text-xs text-[#5F6D65]">Estado das 38 áreas por Resultado Ecológico</p>
              </div>
              <Link href="/areas" className="text-xs font-bold text-[#00A651] hover:underline flex items-center gap-1">
                <span>Ver todas as 38 áreas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AREAS_PRAD_CANONICAS.slice(0, 16).map((area) => (
                <Link
                  key={area.id}
                  href={`/areas/${area.id}`}
                  className={`p-3 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                    area.resultadoAmbiental === 'satisfatorio'
                      ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-500'
                      : area.resultadoAmbiental === 'atencao'
                      ? 'bg-amber-50/50 border-amber-200 hover:border-amber-500'
                      : 'bg-red-50/50 border-red-200 hover:border-red-500'
                  }`}
                >
                  <div className="font-mono font-bold text-[10px] text-[#17211B]">{area.id}</div>
                  <div className="font-bold text-xs text-[#17211B] truncate mt-1">{area.nome}</div>
                  <div className="text-[10px] text-[#5F6D65] mt-1 flex items-center justify-between">
                    <span>{area.areaHa} ha</span>
                    <strong className="text-[#00A651]">{area.indiceRecuperacao}%</strong>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* EVOLUÇÃO TEMPORAL & PRÓXIMAS ATIVIDADES */}
          <div className="bg-white rounded-3xl border border-[#DDE4DE] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#DDE4DE] pb-3">
              <h3 className="font-bold text-base text-[#17211B]">Próximas Atividades</h3>
              <Link href="/planejamento" className="text-xs font-bold text-[#00A651] hover:underline">
                Cronograma
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F5F7F4] rounded-2xl border border-[#DDE4DE]">
                <div className="font-bold text-[#17211B]">Plantio de Enriquecimento (250 mudas)</div>
                <div className="text-[#5F6D65] text-[11px] mt-0.5">Área UMB25.BF11 • Previsão: 22/08/2026</div>
              </div>
              <div className="p-3 bg-[#F5F7F4] rounded-2xl border border-[#DDE4DE]">
                <div className="font-bold text-[#17211B]">Vistoria Semestral de Regeneração</div>
                <div className="text-[#5F6D65] text-[11px] mt-0.5">Área UMB08.PR08 • Previsão: 24/08/2026</div>
              </div>
              <div className="p-3 bg-[#F5F7F4] rounded-2xl border border-[#DDE4DE]">
                <div className="font-bold text-[#17211B]">Manutenção de Paliçadas & Drenagens</div>
                <div className="text-[#5F6D65] text-[11px] mt-0.5">Área UMB03.PR03 • Previsão: 26/08/2026</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
