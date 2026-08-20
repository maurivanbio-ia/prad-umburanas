'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  Info,
  Layers,
  MapPin,
  Compass,
  FileText,
  Sliders
} from 'lucide-react';
import { KPIS_ESTRATEGICOS, AREAS_PRAD_CANONICAS } from '@/data/semanticDb';
import { KpiDef } from '@/types/prad';

export default function IndicadoresPage() {
  const [selectedKpi, setSelectedKpi] = useState<KpiDef | null>(null);

  return (
    <div className="min-h-screen bg-[#F5F7F4] text-[#17211B] p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE4DE] pb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#5F6D65] flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00A651]" />
              <span>Inteligência & Análise Estratégica</span>
            </div>
            <h1 className="text-2xl font-bold text-[#17211B] tracking-tight">
              Indicadores & KPIs do PRAD Umburanas
            </h1>
            <p className="text-sm text-[#5F6D65] mt-0.5">
              Métricas corporativas consolidadas com rastreabilidade analítica e drill-down territorial por Área PRAD.
            </p>
          </div>

          <div className="text-xs text-[#5F6D65] bg-white px-3 py-2 rounded-xl border border-[#DDE4DE] shadow-sm">
            Frequência de auditoria: <strong className="text-[#17211B]">Semanal / Quinzenal</strong>
          </div>
        </div>

        {/* GRID DE CARDS DE KPIS COM DRILL-DOWN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {KPIS_ESTRATEGICOS.map((kpi) => (
            <div
              key={kpi.codigo}
              onClick={() => setSelectedKpi(kpi)}
              className="bg-white rounded-3xl border border-[#DDE4DE] p-6 shadow-sm hover:shadow-md hover:border-[#00A651]/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {kpi.codigo}
                  </span>
                  <span className="text-xs font-bold text-[#00A651] flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>▲ +{kpi.variacaoPeriodo} p.p.</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#17211B] group-hover:text-[#00A651] transition-colors">
                    {kpi.nome}
                  </h3>
                  <p className="text-xs text-[#5F6D65] mt-1 line-clamp-2">
                    {kpi.definicao}
                  </p>
                </div>

                <div className="flex items-baseline gap-3 pt-2">
                  <span className="text-4xl font-bold text-[#17211B] tracking-tight">
                    {kpi.valorAtual}{kpi.unidade}
                  </span>
                  <span className="text-xs text-[#5F6D65]">
                    Meta: <strong className="text-[#17211B]">{kpi.meta}{kpi.unidade}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#DDE4DE]/60 text-center text-xs">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <div className="font-bold text-emerald-800">{kpi.areasSatisfatorias}</div>
                    <div className="text-[10px] text-emerald-700">Satisfatórias</div>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-xl">
                    <div className="font-bold text-amber-800">{kpi.areasAtencao}</div>
                    <div className="text-[10px] text-amber-700">Atenção</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded-xl">
                    <div className="font-bold text-red-800">{kpi.areasCriticas}</div>
                    <div className="text-[10px] text-red-700">Críticas</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2 flex items-center justify-between text-xs text-[#5F6D65]">
                <span>Resp: {kpi.responsavel}</span>
                <span className="font-bold text-[#00A651] group-hover:underline flex items-center gap-1">
                  <span>Explorar Drill-down</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL DE DRILL-DOWN ANALÍTICO */}
        {selectedKpi && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#DDE4DE] overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
              <div className="px-6 py-4 bg-[#F5F7F4] border-b border-[#DDE4DE] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#00A651]">Drill-down de Indicador Estratégico</div>
                  <h3 className="text-base font-bold text-[#17211B]">{selectedKpi.nome} ({selectedKpi.codigo})</h3>
                </div>
                <button
                  onClick={() => setSelectedKpi(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-[#17211B] hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3 p-4 bg-[#F5F7F4] rounded-2xl border border-[#DDE4DE]">
                  <div>
                    <div className="text-[10px] text-[#5F6D65] uppercase font-bold">Fórmula de Cálculo</div>
                    <div className="font-mono text-xs font-bold text-[#17211B] mt-0.5">{selectedKpi.formula}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5F6D65] uppercase font-bold">Meta Contratual</div>
                    <div className="text-xs font-bold text-[#00A651] mt-0.5">{selectedKpi.meta}{selectedKpi.unidade}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5F6D65] uppercase font-bold">Última Atualização</div>
                    <div className="text-xs font-bold text-[#17211B] mt-0.5">{selectedKpi.ultimaAtualizacao}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[#17211B] mb-2">Distribuição Territorial das 38 Áreas</h4>
                  <div className="border border-[#DDE4DE] rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F5F7F4] text-[#5F6D65] uppercase font-bold text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Área PRAD</th>
                          <th className="py-2.5 px-3">Resultado</th>
                          <th className="py-2.5 px-3">Cobertura</th>
                          <th className="py-2.5 px-3">Execução</th>
                          <th className="py-2.5 px-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DDE4DE]/60">
                        {AREAS_PRAD_CANONICAS.slice(0, 8).map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-[#17211B]">{a.id} - {a.nome}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                a.resultadoAmbiental === 'satisfatorio' ? 'bg-emerald-100 text-emerald-800' :
                                a.resultadoAmbiental === 'atencao' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {a.resultadoAmbiental}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-bold">{a.coberturaVegetal}%</td>
                            <td className="py-2 px-3">{a.progressoExecucao}%</td>
                            <td className="py-2 px-3 text-right">
                              <Link href={`/areas/${a.id}`} className="text-[#00A651] font-bold hover:underline">
                                Abrir Área
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#F5F7F4] border-t border-[#DDE4DE] flex items-center justify-between">
                <Link
                  href="/geoportal"
                  className="px-4 py-2 bg-[#17211B] text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Compass className="w-4 h-4" />
                  <span>Visualizar Áreas no Mapa Operacional</span>
                </Link>
                <button
                  onClick={() => setSelectedKpi(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-[#17211B] rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
