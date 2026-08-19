'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import {
  CheckSquare,
  Calendar,
  User,
  AlertTriangle,
  Clock,
  TrendingUp,
  Filter,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default function PlanejamentoPage() {
  const [selectedFortnight, setSelectedFortnight] = useState('2q_ago');
  const [selectedTeam, setSelectedTeam] = useState('all');

  const [activitiesList, setActivitiesList] = useState([
    { id: 'ACT-01', name: 'Amostragem e Coleta de Solo', area: 'PRAD-01 a PRAD-38', ha: '50,26 ha', resp: 'Equipe EcoBrasil', deadline: '31/08/2026', pct: 100, status: 'Concluído', dep: '—' },
    { id: 'ACT-02', name: 'Limpeza e Descompactação de Solo', area: 'PRAD-01 (Bota Fora 01)', ha: '2,45 ha', resp: 'Equipe Campo 1', deadline: '25/08/2026', pct: 85, status: 'Em andamento', dep: 'ACT-01' },
    { id: 'ACT-03', name: 'Cercamento de Proteção', area: 'PRAD-30 (Jazida Santo Anjo)', ha: '0,82 ha', resp: 'Equipe Campo 2', deadline: '30/08/2026', pct: 40, status: 'Em andamento', dep: 'ACT-01' },
    { id: 'ACT-04', name: 'Adubação e Semeadura Direta', area: 'PRAD-17 (Canteiro Central)', ha: '5,12 ha', resp: 'Equipe ENGIE', deadline: '05/09/2026', pct: 15, status: 'Em andamento', dep: 'ACT-02' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: '',
    area: 'PRAD-01 - Bota fora 01 (Umburanas 11)',
    resp: 'Rafael Oliveira (Equipe EcoBrasil)',
    deadline: '2026-08-30',
    pct: 0,
    status: 'Em andamento',
  });

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.name.trim()) return;

    const nextId = `ACT-${String(activitiesList.length + 1).padStart(2, '0')}`;
    const createdItem = {
      id: nextId,
      name: newActivity.name.trim(),
      area: newActivity.area,
      ha: '1,45 ha',
      resp: newActivity.resp,
      deadline: newActivity.deadline ? new Date(newActivity.deadline).toLocaleDateString('pt-BR') : '30/08/2026',
      pct: Number(newActivity.pct) || 0,
      status: newActivity.status,
      dep: '—',
    };

    setActivitiesList([createdItem, ...activitiesList]);
    setIsModalOpen(false);
    setNewActivity({
      name: '',
      area: 'PRAD-01 - Bota fora 01 (Umburanas 11)',
      resp: 'Rafael Oliveira (Equipe EcoBrasil)',
      deadline: '2026-08-30',
      pct: 0,
      status: 'Em andamento',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F4] font-sans text-[#17211B]">
      <Header />

      <main className="flex-1 w-full pl-24 pr-6 py-6 space-y-5 max-w-[1920px] mx-auto">
        {/* Title Bar & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE4DE] pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17211B]">Central de Operação e Planejamento PRAD</h1>
            <p className="text-xs text-[#5F6D65] mt-0.5">
              Controle físico-temporal quinzenal, metas executadas, saldos e gerenciamento de equipes
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <select
              value={selectedFortnight}
              onChange={(e) => setSelectedFortnight(e.target.value)}
              className="px-3 py-1.5 border border-[#DDE4DE] rounded-lg bg-white font-medium text-[#17211B]"
            >
              <option value="2q_ago">2ª Quinzena de Agosto/2026 (Atual)</option>
              <option value="1q_set">1ª Quinzena de Setembro/2026</option>
            </select>

            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="px-3 py-1.5 border border-[#DDE4DE] rounded-lg bg-white font-medium text-[#17211B]"
            >
              <option value="all">Todas as Equipes</option>
              <option value="ecobrasil">Equipe EcoBrasil</option>
              <option value="engie">Equipe ENGIE</option>
            </select>
          </div>
        </div>

        {/* TOP SUMMARY METRICS (Meta Planejada, Executada, Saldo, Desvio) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#DDE4DE] space-y-1">
            <span className="text-xs text-[#5F6D65] font-semibold block">Meta Planejada (Quinzena)</span>
            <div className="text-2xl font-bold text-[#17211B]">50,26 ha</div>
            <span className="text-[11px] text-[#5F6D65]">100% da área amostral</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DDE4DE] space-y-1">
            <span className="text-xs text-[#5F6D65] font-semibold block">Superfície Executada</span>
            <div className="text-2xl font-bold text-[#1B8A5A]">41,87 ha</div>
            <span className="text-[11px] text-[#1B8A5A] font-semibold">83,31% da meta quinzenal</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DDE4DE] space-y-1">
            <span className="text-xs text-[#5F6D65] font-semibold block">Saldo a Executar</span>
            <div className="text-2xl font-bold text-[#C88B10]">8,39 ha</div>
            <span className="text-[11px] text-[#C88B10] font-semibold">5 áreas em andamento</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DDE4DE] space-y-1">
            <span className="text-xs text-[#5F6D65] font-semibold block">Desvio de Prazo</span>
            <div className="text-2xl font-bold text-[#1B8A5A]">0 dias</div>
            <span className="text-[11px] text-[#1B8A5A] font-semibold">Sem atrasos críticos</span>
          </div>
        </div>

        {/* MAIN OPERATIONAL TABLE & ALERTS PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Operational Activities Table */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-[#DDE4DE] overflow-hidden flex flex-col">
            <div className="p-3.5 bg-[#F5F7F4] border-b border-[#DDE4DE] flex items-center justify-between">
              <h3 className="font-semibold text-sm text-[#17211B]">Cronograma de Atividades da Quinzena</h3>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 bg-[#365314] hover:bg-[#283e0e] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Atividade</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#F5F7F4] text-[#5F6D65] uppercase text-[10px] font-semibold border-b border-[#DDE4DE]">
                  <tr>
                    <th className="px-4 py-3 font-mono">ID</th>
                    <th className="px-4 py-3">Atividade</th>
                    <th className="px-4 py-3">Área Associada</th>
                    <th className="px-4 py-3">Responsável</th>
                    <th className="px-4 py-3">Avanço %</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE4DE] text-xs">
                  {activitiesList.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#17211B]">{act.id}</td>
                      <td className="px-4 py-3 font-medium text-[#17211B]">{act.name}</td>
                      <td className="px-4 py-3 text-[#5F6D65]">{act.area}</td>
                      <td className="px-4 py-3 text-[#5F6D65]">{act.resp}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-semibold">{act.pct}%</span>
                          <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#00A651] h-1.5 rounded-full" style={{ width: `${act.pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          act.status === 'Concluído' ? 'bg-emerald-50 text-[#1B8A5A] border border-emerald-200' : 'bg-amber-50 text-[#C88B10] border border-amber-200'
                        }`}>
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Side Alerts Panel */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#DDE4DE] p-4 space-y-4">
            <h3 className="font-semibold text-sm text-[#17211B] border-b border-[#DDE4DE] pb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#C88B10]" /> Painel Lateral de Alertas
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg space-y-1">
                <span className="font-bold text-[#C88B10] block">2 Fotografias sem Localização</span>
                <p className="text-[#5F6D65] text-[11px]">
                  Evidências de campo aguardando vinculação espacial no Geoportal.
                </p>
              </div>

              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-lg space-y-1">
                <span className="font-bold text-[#00A3E0] block">Dependência ACT-02 Bloqueada</span>
                <p className="text-[#5F6D65] text-[11px]">
                  Semeadura direta aguardando finalização da descompactação de solo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 📝 MODAL NOVA ATIVIDADE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#DDE4DE] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-xs">
            <div className="p-4 border-b border-[#DDE4DE] bg-[#F5F7F4] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#17211B] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#00A651]" /> Cadastrar Nova Atividade de Campo (PRAD)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-[#17211B]">Nome da Atividade *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Plantio de Mudas Nativas e Adubação"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4] focus:outline-none focus:border-[#00A651]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#17211B]">Área PRAD Associada</label>
                <select
                  value={newActivity.area}
                  onChange={(e) => setNewActivity({ ...newActivity, area: e.target.value })}
                  className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-white focus:outline-none focus:border-[#00A651]"
                >
                  <option value="PRAD-01 - Bota fora 01 (Umburanas 11)">PRAD-01 - Bota fora 01 (Umburanas 11)</option>
                  <option value="PRAD-02 - Bota-fora 02 (Umburanas 19)">PRAD-02 - Bota-fora 02 (Umburanas 19)</option>
                  <option value="PRAD-08 - Bota-fora 10 (Umburanas 01)">PRAD-08 - Bota-fora 10 (Umburanas 01)</option>
                  <option value="PRAD-17 - Canteiro Principal (Umburanas 08)">PRAD-17 - Canteiro Principal (Umburanas 08)</option>
                  <option value="PRAD-30 - Jazida Santo Anjo (Umburanas 05)">PRAD-30 - Jazida Santo Anjo (Umburanas 05)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#17211B]">Responsável</label>
                  <input
                    type="text"
                    value={newActivity.resp}
                    onChange={(e) => setNewActivity({ ...newActivity, resp: e.target.value })}
                    className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#17211B]">Prazo Limite</label>
                  <input
                    type="date"
                    value={newActivity.deadline}
                    onChange={(e) => setNewActivity({ ...newActivity, deadline: e.target.value })}
                    className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#17211B]">Progresso Físico (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newActivity.pct}
                    onChange={(e) => setNewActivity({ ...newActivity, pct: Number(e.target.value) })}
                    className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#17211B]">Status Inicial</label>
                  <select
                    value={newActivity.status}
                    onChange={(e) => setNewActivity({ ...newActivity, status: e.target.value })}
                    className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-white"
                  >
                    <option value="Planejado">Planejado</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#DDE4DE] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#DDE4DE] text-[#5F6D65] hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#365314] hover:bg-[#283e0e] text-white rounded-xl font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Atividade</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
