'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sprout,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  Layers,
  Camera,
  Activity,
  Trees,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { AREAS_PRAD_CANONICAS } from '@/data/semanticDb';

export default function MonitoramentoPage() {
  const [filterCondicao, setFilterCondicao] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Estados do formulário inteligente
  const [selectedAreaId, setSelectedAreaId] = useState<string>('UMB01.PR01');
  const [tipoMonitoramento, setTipoMonitoramento] = useState<string>('Ecológico Semestral');
  const [coberturaVeg, setCoberturaVeg] = useState<number>(68);
  const [soloExposto, setSoloExposto] = useState<number>(14);
  const [presencaErosao, setPresencaErosao] = useState<boolean>(false);
  const [severidadeErosao, setSeveridadeErosao] = useState<string>('Leve');
  const [regeneracao, setRegeneracao] = useState<string>('Boa');
  const [salvoSucesso, setSalvoSucesso] = useState<boolean>(false);

  const filteredAreas = AREAS_PRAD_CANONICAS.filter((a) => {
    const matchCond =
      filterCondicao === 'todos' || a.resultadoAmbiental === filterCondicao;
    const matchSearch =
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCond && matchSearch;
  });

  const totalSatisfatorio = AREAS_PRAD_CANONICAS.filter((a) => a.resultadoAmbiental === 'satisfatorio').length;
  const totalAtencao = AREAS_PRAD_CANONICAS.filter((a) => a.resultadoAmbiental === 'atencao').length;
  const totalCritico = AREAS_PRAD_CANONICAS.filter((a) => a.resultadoAmbiental === 'critico').length;

  const handleSalvarMonitoramento = (e: React.FormEvent) => {
    e.preventDefault();
    setSalvoSucesso(true);
    setTimeout(() => {
      setSalvoSucesso(false);
      setIsModalOpen(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F4] text-[#17211B] p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE4DE] pb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#5F6D65] flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00A651]" />
              <span>Avaliação Ecológica & Sobrevivência</span>
            </div>
            <h1 className="text-2xl font-bold text-[#17211B] tracking-tight">
              Monitoramento Ambiental do PRAD
            </h1>
            <p className="text-sm text-[#5F6D65] mt-0.5">
              Acompanhamento de biomassa, cobertura de solo, regeneração da Caatinga e indicadores biológicos.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-[#00A651] hover:bg-[#008C44] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Registro de Monitoramento</span>
            </button>
          </div>
        </div>

        {/* CARDS DE RESULTADO ECOLÓGICO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#DDE4DE] shadow-sm">
            <div className="text-xs font-bold text-[#5F6D65] uppercase flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-[#00A651]" />
              <span>Cobertura Média</span>
            </div>
            <div className="text-2xl font-bold text-[#17211B] mt-1">78,4%</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">▲ +6,2% no último ciclo</div>
          </div>

          <div
            onClick={() => setFilterCondicao('satisfatorio')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterCondicao === 'satisfatorio'
                ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white border-[#DDE4DE] hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Satisfatório</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{totalSatisfatorio} áreas</div>
            <div className="text-[11px] text-[#5F6D65] mt-1">Regeneração natural vigorosa</div>
          </div>

          <div
            onClick={() => setFilterCondicao('atencao')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterCondicao === 'atencao'
                ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20'
                : 'bg-white border-[#DDE4DE] hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="text-xs font-bold text-amber-700 uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Atenção</span>
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{totalAtencao} áreas</div>
            <div className="text-[11px] text-[#5F6D65] mt-1">Requer adubação ou coroamento</div>
          </div>

          <div
            onClick={() => setFilterCondicao('critico')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterCondicao === 'critico'
                ? 'bg-white border-red-500 shadow-md ring-2 ring-red-500/20'
                : 'bg-white border-[#DDE4DE] hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="text-xs font-bold text-red-700 uppercase flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Crítico</span>
            </div>
            <div className="text-2xl font-bold text-red-700 mt-1">{totalCritico} áreas</div>
            <div className="text-[11px] text-red-600 mt-1">Intervenção física urgente</div>
          </div>
        </div>

        {/* TABELA DE AVALIAÇÃO ECOLÓGICA POR ÁREA */}
        <div className="bg-white rounded-2xl border border-[#DDE4DE] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#DDE4DE] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar área PRAD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F5F7F4] border border-[#DDE4DE] rounded-xl text-xs text-[#17211B] focus:outline-none focus:ring-2 focus:ring-[#00A651]/40"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5F6D65]">Exibindo {filteredAreas.length} de 38 áreas</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F4] border-b border-[#DDE4DE] text-[#5F6D65] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">ID & Nome</th>
                  <th className="py-3 px-4">Resultado Ambiental</th>
                  <th className="py-3 px-4">Cobertura Vegetal</th>
                  <th className="py-3 px-4">Solo Exposto</th>
                  <th className="py-3 px-4">Sobrevivência</th>
                  <th className="py-3 px-4">Último Laudo</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DE]/60">
                {filteredAreas.map((area) => (
                  <tr key={area.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link href={`/areas/${area.id}`} className="font-bold text-[#17211B] hover:text-[#00A651] flex items-center gap-1.5">
                        <span className="font-mono text-emerald-700 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                          {area.id}
                        </span>
                        <span className="truncate max-w-[180px]">{area.nome}</span>
                      </Link>
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
                    <td className="py-3.5 px-4 font-bold text-[#17211B]">
                      {area.coberturaVegetal}%
                    </td>
                    <td className="py-3.5 px-4 text-[#5F6D65]">
                      {area.soloExposto}%
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">
                      {area.taxaSobrevivencia}%
                    </td>
                    <td className="py-3.5 px-4 text-[#5F6D65]">
                      <div>{area.ultimoMonitoramento?.data || '18/08/2026'}</div>
                      <div className="text-[10px] text-[#5F6D65]">{area.ultimoMonitoramento?.responsavel}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/areas/${area.id}?tab=monitoramento`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00A651] hover:underline"
                      >
                        <span>Ficha Ecológica</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL / FORMULÁRIO INTELIGENTE DE MONITORAMENTO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#DDE4DE] overflow-hidden animate-in fade-in zoom-in-95">
              <div className="px-6 py-4 bg-[#F5F7F4] border-b border-[#DDE4DE] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#00A651]">Formulário Inteligente de Campo</div>
                  <h3 className="text-base font-bold text-[#17211B]">Registrar Avaliação de Monitoramento</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-[#17211B] hover:bg-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {salvoSucesso ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#00A651] mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg text-[#17211B]">Monitoramento Registrado com Sucesso!</h4>
                  <p className="text-xs text-[#5F6D65]">Os indicadores ecológicos e a linha do tempo da área foram atualizados.</p>
                </div>
              ) : (
                <form onSubmit={handleSalvarMonitoramento} className="p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#17211B] mb-1">Área PRAD Alvo</label>
                      <select
                        value={selectedAreaId}
                        onChange={(e) => setSelectedAreaId(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F7F4] border border-[#DDE4DE] rounded-xl text-xs font-bold text-[#17211B]"
                      >
                        {AREAS_PRAD_CANONICAS.map((a) => (
                          <option key={a.id} value={a.id}>{a.id} - {a.nome}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#17211B] mb-1">Tipo de Avaliação</label>
                      <select
                        value={tipoMonitoramento}
                        onChange={(e) => setTipoMonitoramento(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F7F4] border border-[#DDE4DE] rounded-xl text-xs font-bold text-[#17211B]"
                      >
                        <option value="Ecológico Semestral">Ecológico Semestral</option>
                        <option value="Operacional Mensal">Operacional Mensal</option>
                        <option value="Vistoria Emergencial">Vistoria Emergencial</option>
                      </select>
                    </div>
                  </div>

                  {/* COBERTURA VEGETAL & SOLO EXPOSTO */}
                  <div className="grid grid-cols-2 gap-3 bg-[#F5F7F4] p-3 rounded-2xl border border-[#DDE4DE]">
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Cobertura Vegetal:</span>
                        <span className="text-[#00A651]">{coberturaVeg}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={coberturaVeg}
                        onChange={(e) => {
                          const v = parseInt(e.target.value);
                          setCoberturaVeg(v);
                          setSoloExposto(Math.max(0, 100 - v));
                        }}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00A651]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Solo Exposto:</span>
                        <span className="text-amber-700">{soloExposto}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={soloExposto}
                        onChange={(e) => {
                          const v = parseInt(e.target.value);
                          setSoloExposto(v);
                          setCoberturaVeg(Math.max(0, 100 - v));
                        }}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                    </div>
                  </div>

                  {/* EROSÃO (CAMPO CONDICIONAL) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#17211B]">Presença de Processos Erosivos?</span>
                      <input
                        type="checkbox"
                        checked={presencaErosao}
                        onChange={(e) => setPresencaErosao(e.target.checked)}
                        className="rounded text-red-600 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                    </div>

                    {presencaErosao && (
                      <div className="p-3 bg-red-50 rounded-xl border border-red-200 grid grid-cols-2 gap-2 animate-in fade-in">
                        <div>
                          <label className="block text-[10px] font-bold text-red-800 mb-1">Severidade da Erosão</label>
                          <select
                            value={severidadeErosao}
                            onChange={(e) => setSeveridadeErosao(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-red-300 rounded-lg text-xs font-medium text-red-900"
                          >
                            <option value="Leve">Leve (Sulcos incipientes)</option>
                            <option value="Moderada">Moderada (Ravinamento)</option>
                            <option value="Severa">Severa (Voçorocamento)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-red-800 mb-1">Ação Preventiva</label>
                          <input
                            type="text"
                            defaultValue="Instalação de paliçadas de contenção"
                            className="w-full px-2.5 py-1.5 bg-white border border-red-300 rounded-lg text-xs text-red-900"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* COORDENADAS GPS AUTOMÁTICAS */}
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-medium">
                      <MapPin className="w-4 h-4 text-[#00A651]" />
                      <span>GPS Capturado: Lat -10.5928 / Lng -41.4735 (Precisão: 3.2m)</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Válido
                    </span>
                  </div>

                  {/* BOTÕES DE AÇÃO */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DDE4DE]">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#17211B] rounded-xl font-bold transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#00A651] hover:bg-[#008C44] text-white rounded-xl font-bold shadow-sm transition-all cursor-pointer"
                    >
                      Salvar Monitoramento
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
