'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Clock, Calendar, AlertTriangle, CheckCircle, Plus, Layers, ShieldCheck, Flag } from 'lucide-react';

export default function CronogramaPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schedule');
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-mineral font-sans text-grafite">
      <Header />

      <main className="flex-1 max-w-[1920px] w-full mx-auto pl-24 pr-6 py-6 space-y-5">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-divisor shadow-atlas">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-ecobrasil uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4 text-ecobrasil" />
              <span>Cronograma Gantt Físico-Temporal (2026–2028)</span>
            </div>
            <h2 className="text-xl font-extrabold text-grafite">Cronograma Macro Integrado de Atividades</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Controle de caminho crítico, dependências, datas planejadas vs realizadas e avanço físico em hectares.
            </p>
          </div>

          <div className="flex items-center space-x-2 font-mono">
            <span className="bg-emerald-50 text-status-concluido border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
              Prazo Global: Em Dia
            </span>
          </div>
        </div>

        {/* Gantt Schedule Table */}
        <div className="bg-white rounded-xl shadow-atlas border border-divisor overflow-hidden">
          <div className="bg-mineral p-3 border-b border-divisor flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-oliva uppercase">Linha do Tempo de Execução (Visualização Gantt)</span>
            <span className="text-[11px] text-slate-500">Caminho Crítico Destacado em Vermelho</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] font-bold border-b border-divisor">
                <tr>
                  <th className="px-4 py-3">ID / Código</th>
                  <th className="px-4 py-3">Atividade Macro</th>
                  <th className="px-4 py-3">Área PRAD / Local</th>
                  <th className="px-4 py-3">Responsável</th>
                  <th className="px-4 py-3">Início Previsto</th>
                  <th className="px-4 py-3">Término Previsto</th>
                  <th className="px-4 py-3">% Execução</th>
                  <th className="px-4 py-3">Situação</th>
                  <th className="px-4 py-3">Caminho Crítico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500 font-sans">
                      Carregando atividades do cronograma Gantt...
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    const isDone = item.status === 'Concluído';
                    const isCritical = idx === 0 || idx === 3;

                    return (
                      <tr key={item.id} className="hover:bg-mineral/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-oliva">{item.code}</td>
                        <td className="px-4 py-3 font-sans font-bold text-grafite">{item.activity}</td>
                        <td className="px-4 py-3 font-sans text-slate-600">38 Áreas / Poligonal CEUR</td>
                        <td className="px-4 py-3 font-sans text-slate-600 text-[10px]">Equipe ENGIE / EcoBrasil</td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.planned_start ? new Date(item.planned_start).toLocaleDateString('pt-BR') : '01/08/2026'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.planned_end ? new Date(item.planned_end).toLocaleDateString('pt-BR') : '31/08/2026'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold">{isDone ? '100%' : '85%'}</span>
                            <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${isDone ? 'bg-status-concluido' : 'bg-ecobrasil'}`}
                                style={{ width: isDone ? '100%' : '85%' }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-sans">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                              isDone
                                ? 'bg-emerald-50 text-status-concluido border-emerald-200'
                                : 'bg-amber-50 text-amber-900 border-amber-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isCritical ? (
                            <span className="bg-rose-50 text-status-atrasado border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-max">
                              <Flag className="w-3 h-3 text-status-atrasado" /> Crítico
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Normal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
