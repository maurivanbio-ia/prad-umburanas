'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import {
  FileText,
  Download,
  Printer,
  Filter,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Camera,
  Layers,
  AlertTriangle,
  FileCheck,
  Eye,
  ArrowRight,
  ChevronRight,
  Clock,
} from 'lucide-react';
import * as xlsx from 'xlsx';

export default function RelatoriosPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [template, setTemplate] = useState('quinzenal');
  const [period, setPeriod] = useState('2q_ago');

  const [incPhotos, setIncPhotos] = useState(true);
  const [incMaps, setIncMaps] = useState(true);
  const [incTables, setIncTables] = useState(true);

  const reportHistory = [
    { version: 'v2.4', type: 'Relatório Quinzenal 2ª Q Ago/26', date: '19/08/2026', author: 'Rafael Oliveira', status: 'Homologado', pages: '14 págs' },
    { version: 'v2.3', type: 'Relatório Quinzenal 1ª Q Ago/26', date: '05/08/2026', author: 'Rafael Oliveira', status: 'Homologado', pages: '12 págs' },
  ];

  const handleGenerateExcel = async () => {
    try {
      const res = await fetch('/api/areas');
      const data = await res.json();
      if (data.success) {
        const rows = data.areas.map((a: any) => ({
          'Código': a.number,
          'Parque': a.wind_complex,
          'Área PRAD': a.name,
          'Superfície (ha)': a.area_ha,
          'Atuação': a.action_type,
          'Status': a.soil_collection_status === 'Concluído' ? 'Concluído' : a.status,
          'Responsável': a.responsible,
        }));

        const ws = xlsx.utils.json_to_sheet(rows);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Relatório Oficial');
        xlsx.writeFile(wb, `Relatorio_Oficial_PRAD_Umburanas_${Date.now()}.xlsx`);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F4] font-sans text-[#17211B]">
      <Header />

      <main className="flex-1 w-full pl-24 pr-6 py-6 space-y-5 max-w-[1920px] mx-auto">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE4DE] pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17211B]">Construtor de Relatórios Oficiais</h1>
            <p className="text-xs text-[#5F6D65] mt-0.5">
              Geração estruturada em 3 etapas com rastreabilidade territorial e auditoria antes da exportação
            </p>
          </div>
        </div>

        {/* 3-STEP WIZARD PROGRESS BAR */}
        <div className="bg-white p-3 rounded-xl border border-[#DDE4DE] flex items-center justify-between text-xs font-medium">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
              step === 1 ? 'bg-[#3B4E00] text-white font-semibold' : 'text-[#5F6D65] hover:bg-slate-50'
            }`}
          >
            <span>1. Escopo & Modelo</span>
          </button>
          <ChevronRight className="w-4 h-4 text-[#5F6D65]" />

          <button
            onClick={() => setStep(2)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
              step === 2 ? 'bg-[#3B4E00] text-white font-semibold' : 'text-[#5F6D65] hover:bg-slate-50'
            }`}
          >
            <span>2. Conteúdo & Anexos</span>
          </button>
          <ChevronRight className="w-4 h-4 text-[#5F6D65]" />

          <button
            onClick={() => setStep(3)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
              step === 3 ? 'bg-[#3B4E00] text-white font-semibold' : 'text-[#5F6D65] hover:bg-slate-50'
            }`}
          >
            <span>3. Prévia Real & Exportação</span>
          </button>
        </div>

        {/* STEP CONTENT & REAL DOCUMENT PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Form Wizard Config (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#DDE4DE] p-5 space-y-4">
            {step === 1 && (
              <div className="space-y-4 text-xs">
                <h3 className="font-semibold text-sm text-[#17211B] border-b border-[#DDE4DE] pb-2">
                  1. Seleção de Escopo e Modelo
                </h3>

                <div>
                  <label className="font-semibold text-[#17211B] block mb-1">Modelo de Relatório</label>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full p-2 border border-[#DDE4DE] rounded-lg bg-white text-[#17211B]"
                  >
                    <option value="quinzenal">Relatório Quinzenal de Acompanhamento PRAD</option>
                    <option value="executivo">Relatório Executivo para Diretoria (ENGIE)</option>
                    <option value="tecnico">Relatório Técnico de Amostragem de Solo</option>
                    <option value="auditoria">Relatório de Auditoria e Conformidade Ambiental</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#17211B] block mb-1">Período de Referência</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full p-2 border border-[#DDE4DE] rounded-lg bg-white text-[#17211B]"
                  >
                    <option value="2q_ago">2ª Quinzena de Agosto/2026 (Atual)</option>
                    <option value="1q_ago">1ª Quinzena de Agosto/2026</option>
                  </select>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-[#3B4E00] text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5"
                >
                  <span>Avançar para Conteúdo</span> <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 text-xs">
                <h3 className="font-semibold text-sm text-[#17211B] border-b border-[#DDE4DE] pb-2">
                  2. Conteúdo e Módulos Anexos
                </h3>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={incMaps}
                      onChange={(e) => setIncMaps(e.target.checked)}
                      className="rounded text-[#00A651]"
                    />
                    <span className="font-semibold text-[#17211B]">Incluir Enquadramentos de Mapas</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={incPhotos}
                      onChange={(e) => setIncPhotos(e.target.checked)}
                      className="rounded text-[#00A651]"
                    />
                    <span className="font-semibold text-[#17211B]">Incluir Anexo de Fotografias de Campo</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={incTables}
                      onChange={(e) => setIncTables(e.target.checked)}
                      className="rounded text-[#00A651]"
                    />
                    <span className="font-semibold text-[#17211B]">Incluir Tabela Consolidada de 38 Áreas</span>
                  </label>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-[#DDE4DE] text-[#17211B] py-2 rounded-lg font-semibold"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-[#3B4E00] text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5"
                  >
                    <span>Avançar para Prévia</span> <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 text-xs">
                <h3 className="font-semibold text-sm text-[#17211B] border-b border-[#DDE4DE] pb-2">
                  3. Auditoria Pré-Exportação & Ações
                </h3>

                {/* Pre-export Audit Alerts */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1 text-[#C88B10]">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Alertas da Auditoria do Relatório</span>
                  </div>
                  <p className="text-[11px] text-[#5F6D65]">
                    2 fotografias pendentes de geolocalização serão incluídas no anexo de pendências.
                  </p>
                </div>

                <div className="space-y-2 font-mono text-[11px] bg-[#F5F7F4] p-3 rounded-lg border border-[#DDE4DE]">
                  <div>Estimativa de Páginas: <strong className="text-[#17211B]">14 páginas</strong></div>
                  <div>Áreas Abrangidas: <strong className="text-[#17211B]">38 poligonais (50,26 ha)</strong></div>
                  <div>Fotos Anexadas: <strong className="text-[#17211B]">16 georreferenciadas</strong></div>
                </div>

                {/* Main Action (PDF Primary) & XLSX Secondary */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="w-full bg-[#3B4E00] hover:bg-[#2C3A00] text-white py-2.5 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Gerar PDF Oficial (Ação Principal)
                  </button>

                  <button
                    onClick={handleGenerateExcel}
                    className="w-full bg-white border border-[#DDE4DE] hover:bg-slate-50 text-[#17211B] py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-[#5F6D65]" /> Exportar Planilha XLSX (Secundário)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Real Interactive Document Preview (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#DDE4DE] p-6 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-[#DDE4DE] pb-3">
              <span className="font-semibold text-xs text-[#5F6D65] uppercase tracking-wider">
                Prévia do Documento Oficial a Ser Gerado
              </span>
              <span className="font-mono text-[11px] bg-[#F5F7F4] border border-[#DDE4DE] px-2 py-0.5 rounded text-[#17211B]">
                Capa • Sumário • Mapas • Tabelas
              </span>
            </div>

            {/* Document Sheet Simulation */}
            <div className="border border-[#DDE4DE] rounded-lg p-6 bg-[#F5F7F4]/50 shadow-inner space-y-6 max-h-[500px] overflow-y-auto">
              <div className="text-center space-y-2 border-b border-[#DDE4DE] pb-4">
                <span className="text-[10px] font-semibold text-[#5F6D65] uppercase tracking-widest block">
                  EcoBrasil Consultoria Ambiental • ENGIE Brasil Energia
                </span>
                <h2 className="text-lg font-bold text-[#17211B]">
                  RELATÓRIO QUINZENAL DE ACOMPANHAMENTO DO PRAD
                </h2>
                <span className="text-xs text-[#5F6D65] font-mono block">
                  Conjunto Eólico Umburanas • Agosto / 2026 (2ª Quinzena)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-[#17211B]">1. RESUMO EXECUTIVO E METAS</h4>
                <p className="text-[#5F6D65] leading-relaxed">
                  O presente documento consolida os resultados do monitoramento físico-temporal do PRAD do Conjunto Eólico Umburanas. Foram atendidas 33 das 38 áreas mapeadas, totalizando 41,87 hectares executados (85,07% de progresso global).
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-[#17211B]">2. QUADRO RESUMO DAS 38 ÁREAS PRAD</h4>
                <div className="border border-[#DDE4DE] rounded bg-white p-2 font-mono text-[10px]">
                  [ Tabela de Atributos das 38 Áreas PRAD - 50,26 ha ]
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REPORT HISTORY TABLE */}
        <div className="bg-white rounded-xl border border-[#DDE4DE] overflow-hidden p-4 space-y-3">
          <h3 className="font-semibold text-sm text-[#17211B] border-b border-[#DDE4DE] pb-2">
            Histórico de Relatórios Gerados e Homologados
          </h3>

          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#F5F7F4] text-[#5F6D65] uppercase text-[10px] font-semibold border-b border-[#DDE4DE]">
              <tr>
                <th className="px-4 py-2 font-mono">Versão</th>
                <th className="px-4 py-2">Tipo de Relatório</th>
                <th className="px-4 py-2">Data Emissão</th>
                <th className="px-4 py-2">Responsável</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE4DE]">
              {reportHistory.map((rep, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono font-bold text-[#17211B]">{rep.version}</td>
                  <td className="px-4 py-2.5 font-medium text-[#17211B]">{rep.type}</td>
                  <td className="px-4 py-2.5 text-[#5F6D65] font-mono text-[11px]">{rep.date}</td>
                  <td className="px-4 py-2.5 text-[#5F6D65]">{rep.author}</td>
                  <td className="px-4 py-2.5">
                    <span className="bg-emerald-50 text-[#1B8A5A] border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      {rep.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-[11px] text-[#3B4E00] font-bold hover:underline cursor-pointer">
                    PDF ({rep.pages})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
