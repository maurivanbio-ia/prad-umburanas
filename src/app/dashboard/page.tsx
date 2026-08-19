'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Camera,
  Calendar,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Activity,
  Filter,
  ArrowRight,
  User,
  AlertCircle,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const DEFAULT_DASHBOARD_DATA = {
    summary: {
      totalAreas: 38,
      totalHa: 65.2,
      soilCompletedAreas: 28,
      soilCompletedHa: 48.5,
      remainingAreas: 10,
      remainingHa: 16.7,
      generalProgressPct: 74.4,
      photosCount: 18,
      georeferencedPhotosCount: 18,
    },
    statusCounts: {
      'Concluído': 12,
      'Em andamento': 22,
      'Não iniciado': 4,
      'Atrasado': 0,
    },
    planning: [],
    schedule: [],
    areas: [],
  };

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((d) => {
        if (d && d.summary) {
          setData(d);
        } else {
          setData(DEFAULT_DASHBOARD_DATA);
        }
      })
      .catch((err) => {
        console.error('Dashboard load error:', err);
        setData(DEFAULT_DASHBOARD_DATA);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F7F4] font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-12 pl-24">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#00A651] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#5F6D65] font-medium font-sans">Carregando indicadores executivos...</p>
          </div>
        </div>
      </div>
    );
  }

  const barHectaresData = [
    { name: 'Concluído', hectares: 41.87 },
    { name: 'Em Andamento', hectares: 8.39 },
    { name: 'Planejado', hectares: 0.0 },
  ];

  const temporalData = [
    { fortnight: '1ª Q Ago/26', planejado: 19.0, realizado: 19.0 },
    { fortnight: '2ª Q Ago/26', planejado: 50.26, realizado: 41.87 },
    { fortnight: '1ª Q Set/26', planejado: 50.26, realizado: 50.26 },
  ];

  const priorityAreas = [
    { code: 'BOTA FORA 01', local: 'Bota Fora 01', ha: '2,45 ha', status: 'Em andamento', deadline: '25 ago 2026', gravity: 'Alta', responsible: 'Equipe EcoBrasil' },
    { code: 'CANTEIRO CENTRAL', local: 'Canteiro Central', ha: '5,12 ha', status: 'Em andamento', deadline: '28 ago 2026', gravity: 'Média', responsible: 'Equipe ENGIE' },
    { code: 'JAZIDA SANTO ANJO', local: 'Jazida Santo Anjo', ha: '0,82 ha', status: 'Em andamento', deadline: '30 ago 2026', gravity: 'Média', responsible: 'Equipe Campo' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F4] font-sans text-[#17211B]">
      <Header />

      <main className="flex-1 w-full pl-24 pr-6 py-6 space-y-5 max-w-[1920px] mx-auto">
        {/* Title Header (Replacing large green banner) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE4DE] pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#5F6D65]">
              <span>Conjunto Eólico Umburanas</span>
              <span>•</span>
              <span>ENGIE & EcoBrasil</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17211B]">
              Painel Executivo de Acompanhamento
            </h1>
          </div>

          <div className="flex items-center space-x-4 text-xs text-[#5F6D65] font-sans">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Período Analisado</span>
              <span className="font-semibold text-[#17211B]">Agosto / 2026 (2ª Quinzena)</span>
            </div>
            <div className="h-6 w-px bg-[#DDE4DE]" />
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Sincronização Base</span>
              <span className="font-mono text-[#17211B]">19/08/2026 • 12:45</span>
            </div>
          </div>
        </div>

        {/* 4 EXECUTIVE KPI CARDS (Linear icons, large numbers, no colored circle backgrounds) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1 */}
          <div className="bg-white p-4 rounded-xl border border-[#DDE4DE] space-y-1">
            <div className="flex items-center justify-between text-[#5F6D65]">
              <span className="text-xs font-semibold">Progresso Físico Global</span>
              <Activity className="w-4 h-4 text-[#00A651]" />
            </div>
            <div className="text-3xl font-semibold tracking-tight text-[#17211B]">
              85,07%
            </div>
            <div className="text-xs text-[#1B8A5A] font-medium flex items-center gap-1">
              <span>33 de 38 áreas concluídas</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white p-4 rounded-xl border border-[#DDE4DE] space-y-1">
            <div className="flex items-center justify-between text-[#5F6D65]">
              <span className="text-xs font-semibold">Superfície Executada</span>
              <Layers className="w-4 h-4 text-[#00A3E0]" />
            </div>
            <div className="text-3xl font-semibold tracking-tight text-[#17211B]">
              41,87 <span className="text-sm font-normal text-[#5F6D65]">/ 50,26 ha</span>
            </div>
            <div className="text-xs text-[#5F6D65] font-medium">
              8,39 ha em andamento
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white p-4 rounded-xl border border-[#DDE4DE] space-y-1">
            <div className="flex items-center justify-between text-[#5F6D65]">
              <span className="text-xs font-semibold">Áreas Concluídas</span>
              <CheckCircle2 className="w-4 h-4 text-[#1B8A5A]" />
            </div>
            <div className="text-3xl font-semibold tracking-tight text-[#17211B]">
              33 <span className="text-sm font-normal text-[#5F6D65]">de 38</span>
            </div>
            <div className="text-xs text-[#1B8A5A] font-medium">
              100% amostragem validada
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-white p-4 rounded-xl border border-[#DDE4DE] space-y-1">
            <div className="flex items-center justify-between text-[#5F6D65]">
              <span className="text-xs font-semibold">Áreas Críticas / Atrasadas</span>
              <AlertTriangle className="w-4 h-4 text-[#C88B10]" />
            </div>
            <div className="text-3xl font-semibold tracking-tight text-[#C88B10]">
              5 <span className="text-sm font-normal text-[#5F6D65]">áreas</span>
            </div>
            <div className="text-xs text-[#C88B10] font-medium">
              Acompanhamento quinzenal
            </div>
          </div>
        </div>

        {/* DENSE CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Chart 1: Evolução Físico-Temporal */}
          <div className="bg-white p-4 rounded-xl border border-[#DDE4DE] space-y-3">
            <div className="flex items-center justify-between border-b border-[#DDE4DE] pb-2">
              <h3 className="font-semibold text-sm text-[#17211B]">Evolução Físico-Temporal (Planejado vs Realizado)</h3>
              <span className="text-xs text-[#5F6D65]">Hectares (ha)</span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temporalData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <XAxis dataKey="fortnight" stroke="#5F6D65" fontSize={11} />
                  <YAxis stroke="#5F6D65" fontSize={11} unit=" ha" />
                  <Tooltip formatter={(val: any) => [`${val} ha`, 'Superfície']} />
                  <Legend />
                  <Line type="monotone" dataKey="planejado" stroke="#94A3B8" strokeDasharray="3 3" strokeWidth={1.5} name="Planejado" />
                  <Line type="monotone" dataKey="realizado" stroke="#00A651" strokeWidth={2.5} name="Realizado" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Distribuição de Hectares */}
          <div className="bg-white p-4 rounded-xl border border-[#DDE4DE] space-y-3">
            <div className="flex items-center justify-between border-b border-[#DDE4DE] pb-2">
              <h3 className="font-semibold text-sm text-[#17211B]">Distribuição por Situação das Áreas</h3>
              <span className="text-xs text-[#5F6D65]">Total: 50,26 ha</span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barHectaresData} layout="vertical" margin={{ left: -10, right: 20, top: 10, bottom: 0 }}>
                  <XAxis type="number" stroke="#5F6D65" fontSize={11} unit=" ha" />
                  <YAxis type="category" dataKey="name" stroke="#5F6D65" fontSize={11} width={90} />
                  <Tooltip formatter={(val: any) => [`${val} ha`, 'Área']} />
                  <Bar dataKey="hectares" fill="#3B4E00" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: PRIORITY LIST & UPCOMING MILESTONES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Priority List (Replaces passive table) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#DDE4DE] overflow-hidden">
            <div className="p-4 bg-[#F5F7F4] border-b border-[#DDE4DE] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-[#C88B10]" />
                <h3 className="font-semibold text-sm text-[#17211B]">Lista de Áreas Prioritárias (Prazo e Responsável)</h3>
              </div>
              <Link href="/areas" className="text-xs font-semibold text-[#3B4E00] hover:underline flex items-center gap-1">
                Ver todas as 38 áreas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#DDE4DE] text-xs">
              {priorityAreas.map((item) => (
                <div key={item.code} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-[#17211B] block">{item.code}</span>
                    <span className="text-[#5F6D65]">{item.local} • {item.ha}</span>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="text-[#5F6D65] block font-mono text-[11px]">Prazo: {item.deadline}</span>
                    <span className="text-[#5F6D65] block text-[11px]">{item.responsible}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.gravity === 'Alta' ? 'bg-red-50 text-[#C95142] border border-red-200' : 'bg-amber-50 text-[#C88B10] border border-amber-200'
                    }`}>
                      Gravidade {item.gravity}
                    </span>

                    <Link
                      href="/areas"
                      className="px-2.5 py-1 text-xs border border-[#DDE4DE] rounded hover:bg-slate-100 font-medium text-[#17211B]"
                    >
                      Ação
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div className="bg-white p-4 rounded-xl border border-[#DDE4DE] space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-sm text-[#17211B] border-b border-[#DDE4DE] pb-2">
                Próximos Marcos Operacionais
              </h3>

              <div className="space-y-3 mt-3 text-xs">
                <div className="p-2.5 bg-[#F5F7F4] rounded border border-[#DDE4DE] space-y-1">
                  <div className="flex justify-between font-semibold text-[#17211B]">
                    <span>Fechamento da 2ª Quinzena</span>
                    <span className="font-mono text-[10px] text-[#00A651]">31/08</span>
                  </div>
                  <p className="text-[#5F6D65] text-[11px]">
                    Consolidação dos 50,26 hectares de área amostrada.
                  </p>
                </div>

                <div className="p-2.5 bg-[#F5F7F4] rounded border border-[#DDE4DE] space-y-1">
                  <div className="flex justify-between font-semibold text-[#17211B]">
                    <span>Relatório Fotográfico Quinzenal</span>
                    <span className="font-mono text-[10px] text-[#00A3E0]">02/09</span>
                  </div>
                  <p className="text-[#5F6D65] text-[11px]">
                    Vincular 2 fotos pendentes de geolocalização.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/relatorios"
              className="w-full bg-[#3B4E00] hover:bg-[#2C3A00] text-white font-semibold text-xs py-2 rounded text-center block shadow-sm transition-colors"
            >
              Gerar Relatório PDF
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
