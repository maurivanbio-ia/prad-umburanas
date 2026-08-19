'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ArrowLeft, MapPin, Camera, Clock, FileText, CheckCircle2, AlertCircle, Save, Edit3 } from 'lucide-react';

export default function SingleAreaPage({ params }: { params: { id: string } }) {
  const [area, setArea] = useState<any | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'geral' | 'atividades' | 'fotografias' | 'historico'>('geral');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [editStatus, setEditStatus] = useState('');
  const [editSoilStatus, setEditSoilStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    fetchAreaDetails();
  }, [params.id]);

  const fetchAreaDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/areas/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setArea(data.area);
        setPhotos(data.photos || []);
        setAuditLogs(data.auditLogs || []);

        setEditStatus(data.area.status || 'Em andamento');
        setEditSoilStatus(data.area.soil_collection_status || 'Não iniciado');
        setEditNotes(data.area.notes || '');
      }
    } catch (err) {
      console.error('Failed to fetch area details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/areas/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          soil_collection_status: editSoilStatus,
          notes: editNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setArea(data.area);
        setIsEditing(false);
        fetchAreaDetails();
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  if (loading || !area) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-4 border-[#00A651] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-600">Carregando detalhes da área...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Back Link & Action Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/areas"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#3B4E00] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Lista de Áreas</span>
          </Link>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-[#3B4E00] hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancelar Edição' : 'Editar Área'}</span>
          </button>
        </div>

        {/* Header Summary Box */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-6 border-l-8 border-l-[#00A651]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700">
              <span>Área PRAD Nº {area.number}</span>
              <span>•</span>
              <span>{area.wind_complex || 'Umburanas'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{area.name}</h1>
            <p className="text-xs text-slate-500">Tipo de Atuação: {area.action_type || 'Manutenção Média'}</p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Superfície</span>
              <span className="text-xl font-bold text-slate-900">{area.area_ha} ha</span>
            </div>
            <div className="h-8 w-px bg-slate-300" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Status Geral</span>
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                {area.soil_collection_status === 'Concluído' ? 'Concluído' : area.status}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form Modal/Drawer */}
        {isEditing && (
          <form onSubmit={handleSaveUpdate} className="bg-emerald-50 border border-emerald-300 p-5 rounded-xl space-y-4 shadow-md">
            <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-700" />
              Editar Informações da Área (Persistência no Banco)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Status da Coleta de Solo</label>
                <select
                  value={editSoilStatus}
                  onChange={(e) => setEditSoilStatus(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="Concluído">Concluído</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Não iniciado">Não iniciado</option>
                  <option value="Suspenso">Suspenso</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Geral</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="Concluído">Concluído</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Não iniciado">Não iniciado</option>
                  <option value="Atrasado">Atrasado</option>
                </select>
              </div>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1 text-xs">Observações do Gestor</label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded bg-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#00A651] hover:bg-emerald-600 text-white font-bold text-xs rounded shadow"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('geral')}
            className={`pb-2 transition-colors ${
              activeTab === 'geral' ? 'border-b-2 border-[#00A651] text-[#3B4E00] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('fotografias')}
            className={`pb-2 transition-colors flex items-center gap-1 ${
              activeTab === 'fotografias' ? 'border-b-2 border-[#00A651] text-[#3B4E00] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Fotografias Vinculadas ({photos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`pb-2 transition-colors flex items-center gap-1 ${
              activeTab === 'historico' ? 'border-b-2 border-[#00A651] text-[#3B4E00] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Trilha de Auditoria</span>
          </button>
        </div>

        {/* Tab 1: Visão Geral */}
        {activeTab === 'geral' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Parâmetros Operacionais</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Coleta de Solo:</span>
                  <span className="font-bold text-slate-800">{area.soil_collection_status}</span>
                  {area.soil_collection_date && (
                    <span className="block text-[11px] text-slate-500">
                      Realizada em: {new Date(area.soil_collection_date).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block">Manutenção PRAD:</span>
                  <span className="font-bold text-slate-800">{area.maintenance_status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Irrigação:</span>
                  <span className="font-bold text-slate-800">{area.irrigation_status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Responsável Operacional:</span>
                  <span className="font-bold text-slate-800">{area.responsible}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Quinzena do Planejamento:</span>
                  <span className="font-bold text-slate-800">{area.fortnight || '1ª quinzena'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Pendências Cadastradas:</span>
                  <span className="font-bold text-slate-800">{area.pending_issue || 'Nenhuma'}</span>
                </div>
              </div>

              {area.notes && (
                <div className="pt-2">
                  <span className="text-slate-500 block text-xs font-semibold mb-1">Observações do Projeto:</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
                    {area.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Spatial Centroid / Location Info */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 border-b pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Localização Espacial (SHP)
              </h3>
              {area.lat && area.lng ? (
                <div className="space-y-2 text-xs">
                  <div className="bg-emerald-50 p-3 rounded border border-emerald-200 space-y-1">
                    <div className="font-bold text-emerald-900">Coordenadas WGS84</div>
                    <div className="font-mono text-emerald-800">Lat: {area.lat}</div>
                    <div className="font-mono text-emerald-800">Lng: {area.lng}</div>
                  </div>
                  <Link
                    href={`/geoportal`}
                    className="w-full bg-[#00A651] hover:bg-emerald-600 text-white font-bold py-2 rounded text-center block text-xs shadow"
                  >
                    Visualizar no Geoportal
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Coordenadas espaciais serão confirmadas via acervo vetorial no Geoportal.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Fotografias Vinculadas */}
        {activeTab === 'fotografias' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            {photos.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                Nenhuma fotografia vinculada diretamente a esta área.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((p) => (
                  <div key={p.id} className="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-slate-50">
                    <img src={p.storage_path} alt={p.file_name} className="w-full h-40 object-cover" />
                    <div className="p-3 text-xs space-y-1">
                      <span className="font-bold text-slate-900 block truncate">{p.local || p.file_name}</span>
                      <span className="text-emerald-700 font-semibold block">{p.activity}</span>
                      <span className="text-[11px] text-slate-500 block">
                        {p.captured_at ? new Date(p.captured_at).toLocaleDateString('pt-BR') : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Trilha de Auditoria */}
        {activeTab === 'historico' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-3">Histórico de Alterações</h3>
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">Nenhuma alteração registrada ainda.</p>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs flex justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{log.user_name}</span>{' '}
                      <span className="text-slate-500">({log.action})</span>
                      <p className="text-slate-600 mt-0.5">
                        De: <span className="font-mono bg-white px-1 rounded">{log.old_value || '—'}</span> Para:{' '}
                        <span className="font-mono bg-white px-1 rounded font-bold text-emerald-700">{log.new_value}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
