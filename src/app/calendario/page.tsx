'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function CalendarioPage() {
  const [viewMode, setViewMode] = useState<'mes' | 'semana' | 'agenda'>('mes');
  const [selectedPark, setSelectedPark] = useState('all');

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentDay = 19; // 19 de Agosto de 2026

  const [events, setEvents] = useState<Record<number, any[]>>({
    12: [{ title: 'Amostragem Solo', type: 'Concluído', color: 'bg-emerald-50 text-[#1B8A5A] border-emerald-200' }],
    19: [
      { title: 'Vistoria de Campo PRAD-17', type: 'Em andamento', color: 'bg-amber-50 text-[#C88B10] border-amber-200' },
      { title: 'Irrigação Canteiro', type: 'Em andamento', color: 'bg-blue-50 text-[#00A3E0] border-blue-200' },
    ],
    25: [{ title: 'Fechamento Quinzena', type: 'Planejada', color: 'bg-[#F5F7F4] text-[#5F6D65] border-[#DDE4DE]' }],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    day: 19,
    resp: 'Rafael Oliveira (Equipe EcoBrasil)',
    status: 'Em andamento',
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    const dayNum = Number(newEvent.day) || 19;
    const color =
      newEvent.status === 'Concluído'
        ? 'bg-emerald-50 text-[#1B8A5A] border-emerald-200'
        : newEvent.status === 'Em andamento'
        ? 'bg-amber-50 text-[#C88B10] border-amber-200'
        : 'bg-blue-50 text-[#00A3E0] border-blue-200';

    const created = {
      title: newEvent.title.trim(),
      type: newEvent.status,
      color,
    };

    setEvents((prev) => ({
      ...prev,
      [dayNum]: [...(prev[dayNum] || []), created],
    }));

    setIsModalOpen(false);
    setNewEvent({
      title: '',
      day: 19,
      resp: 'Rafael Oliveira (Equipe EcoBrasil)',
      status: 'Em andamento',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F4] font-sans text-[#17211B]">
      <Header />

      <main className="flex-1 w-full pl-24 pr-6 py-6 space-y-4 max-w-[1920px] mx-auto">
        {/* Title Bar & Views */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE4DE] pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17211B]">Calendário Operacional PRAD</h1>
            <p className="text-xs text-[#5F6D65] mt-0.5">Agosto / 2026 • Programação de vistorias, amostragens e eventos de campo</p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center bg-white border border-[#DDE4DE] rounded-lg p-0.5 font-medium shadow-xs">
              <button
                onClick={() => setViewMode('mes')}
                className={`px-3 py-1 rounded transition-colors ${viewMode === 'mes' ? 'bg-[#365314] text-white font-bold' : 'text-[#5F6D65] hover:text-[#17211B]'}`}
              >
                Mês
              </button>
              <button
                onClick={() => setViewMode('semana')}
                className={`px-3 py-1 rounded transition-colors ${viewMode === 'semana' ? 'bg-[#365314] text-white font-bold' : 'text-[#5F6D65] hover:text-[#17211B]'}`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1 rounded transition-colors ${viewMode === 'agenda' ? 'bg-[#365314] text-white font-bold' : 'text-[#5F6D65] hover:text-[#17211B]'}`}
              >
                Agenda
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 bg-[#365314] hover:bg-[#283e0e] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Criar Atividade
            </button>
          </div>
        </div>

        {/* MAIN CALENDAR GRID & SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Calendar Views Container */}
          <div className="lg:col-span-9 bg-white rounded-xl border border-[#DDE4DE] p-4 space-y-3">
            <div className="flex items-center justify-between font-semibold text-sm text-[#17211B]">
              <div className="flex items-center space-x-2">
                <button className="p-1 border border-[#DDE4DE] rounded hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
                <span>Agosto de 2026</span>
                <button className="p-1 border border-[#DDE4DE] rounded hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
              </div>

              <span className="text-xs text-[#5F6D65] font-mono">
                {viewMode === 'mes' ? 'Visão Mensal' : viewMode === 'semana' ? 'Visão Semanal (17 a 23 Ago)' : 'Lista Cronológica'}
              </span>
            </div>

            {/* MODE 1: MÊS (Month Grid) */}
            {viewMode === 'mes' && (
              <>
                <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[11px] text-[#5F6D65] border-b border-[#DDE4DE] pb-2">
                  <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
                </div>

                <div className="grid grid-cols-7 gap-1 font-sans text-xs">
                  {daysInMonth.map((day) => {
                    const isToday = day === currentDay;
                    const dayEvents = events[day] || [];

                    return (
                      <div
                        key={day}
                        className={`min-h-[85px] p-1.5 border rounded-lg flex flex-col justify-between transition-colors ${
                          isToday
                            ? 'border-2 border-[#00A651] bg-emerald-50/20 font-bold'
                            : 'border-[#DDE4DE] bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span className={`text-[11px] font-mono ${isToday ? 'text-[#00A651] font-bold' : 'text-[#17211B]'}`}>
                          {day}
                        </span>

                        <div className="space-y-1">
                          {dayEvents.map((evt, idx) => (
                            <div key={idx} className={`p-1 rounded text-[9px] border leading-tight ${evt.color}`}>
                              {evt.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* MODE 2: SEMANA (Weekly Column Layout 17-23 Aug) */}
            {viewMode === 'semana' && (
              <div className="grid grid-cols-7 gap-2 pt-2 text-xs">
                {[17, 18, 19, 20, 21, 22, 23].map((d) => {
                  const dayEvts = events[d] || [];
                  const isToday = d === 19;
                  return (
                    <div key={d} className={`p-2.5 rounded-xl border min-h-[220px] flex flex-col space-y-2 ${isToday ? 'border-[#00A651] bg-emerald-50/20' : 'border-[#DDE4DE] bg-[#F5F7F4]'}`}>
                      <div className="border-b border-[#DDE4DE] pb-1 font-bold text-xs flex justify-between">
                        <span>{d} AGO</span>
                        {isToday && <span className="text-[#00A651] text-[10px]">Hoje</span>}
                      </div>
                      {dayEvts.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">Sem eventos</span>
                      ) : (
                        dayEvts.map((e, idx) => (
                          <div key={idx} className={`p-1.5 rounded-lg border text-[10px] font-semibold ${e.color}`}>
                            {e.title}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* MODE 3: AGENDA (Chronological Agenda List) */}
            {viewMode === 'agenda' && (
              <div className="space-y-2 text-xs pt-2">
                {Object.entries(events).map(([d, evts]) => (
                  <div key={d} className="p-3 bg-[#F5F7F4] rounded-xl border border-[#DDE4DE] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-[#365314] bg-[#EBF3E8] px-2.5 py-1 rounded-lg border border-[#C5DCBD]">
                        Dia {d} Ago
                      </span>
                      <div>
                        {evts.map((e, idx) => (
                          <strong key={idx} className="text-[#17211B] font-bold block">{e.title}</strong>
                        ))}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#00A651] border border-emerald-200">
                      Confirmado
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar - Upcoming Activities */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-[#DDE4DE] p-4 space-y-3">
            <h3 className="font-semibold text-sm text-[#17211B] border-b border-[#DDE4DE] pb-2">
              Próximas Pendências
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-[#F5F7F4] rounded border border-[#DDE4DE] space-y-1">
                <span className="font-mono font-bold text-[#00A651] block text-[10px]">HOJE • 19 AGO</span>
                <span className="font-semibold text-[#17211B] block">Vistoria de Campo PRAD-17</span>
                <p className="text-[11px] text-[#5F6D65]">Responsável: Rafael Oliveira</p>
              </div>

              <div className="p-2.5 bg-[#F5F7F4] rounded border border-[#DDE4DE] space-y-1">
                <span className="font-mono font-bold text-[#00A3E0] block text-[10px]">25 AGO</span>
                <span className="font-semibold text-[#17211B] block">Relatório Fotográfico</span>
                <p className="text-[11px] text-[#5F6D65]">Vincular fotos pendentes</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 📅 MODAL CRIAR ATIVIDADE NO CALENDÁRIO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#DDE4DE] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-xs">
            <div className="p-4 border-b border-[#DDE4DE] bg-[#F5F7F4] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#17211B] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#00A651]" /> Agendar Nova Atividade no Calendário
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-[#17211B]">Título do Evento / Vistoria *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Monitoramento Fotográfico PRAD-08"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4] focus:outline-none focus:border-[#00A651]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#17211B]">Dia de Agosto (2026)</label>
                  <select
                    value={newEvent.day}
                    onChange={(e) => setNewEvent({ ...newEvent, day: Number(e.target.value) })}
                    className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-white"
                  >
                    {daysInMonth.map((d) => (
                      <option key={d} value={d}>Dia {d} de Agosto</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#17211B]">Status Inicial</label>
                  <select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                    className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-white"
                  >
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Planejada">Planejada</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#17211B]">Responsável Técnico</label>
                <input
                  type="text"
                  value={newEvent.resp}
                  onChange={(e) => setNewEvent({ ...newEvent, resp: e.target.value })}
                  className="w-full p-2.5 border border-[#DDE4DE] rounded-xl bg-[#F5F7F4]"
                />
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
                  <span>Agendar Atividade</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
