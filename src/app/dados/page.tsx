'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Download,
  RotateCcw,
  Layers,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { AUDITORIA_QUALIDADE_DADOS } from '@/data/semanticDb';

export default function DadosQualityPage() {
  const audit = AUDITORIA_QUALIDADE_DADOS;

  return (
    <div className="min-h-screen bg-[#F5F7F4] text-[#17211B] p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE4DE] pb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#5F6D65] flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#00A651]" />
              <span>Governança & Integridade da Informação</span>
            </div>
            <h1 className="text-2xl font-bold text-[#17211B] tracking-tight">
              Qualidade dos Dados & Auditoria
            </h1>
            <p className="text-sm text-[#5F6D65] mt-0.5">
              Auditoria contínua de completude cadastral, validação espacial de coordenadas, fotos e consistência temporal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white hover:bg-slate-50 text-[#17211B] rounded-xl text-xs font-bold border border-[#DDE4DE] shadow-sm flex items-center gap-1.5 cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Executar Nova Varredura</span>
            </button>
          </div>
        </div>

        {/* SCORE GERAL DE QUALIDADE */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#DDE4DE] shadow-sm flex flex-col justify-between">
            <div className="text-xs font-bold text-[#5F6D65] uppercase">Score de Qualidade Geral</div>
            <div className="text-4xl font-bold text-emerald-700 my-2">{audit.scoreGeralPct}%</div>
            <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Classificação: Excelente</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#DDE4DE] shadow-sm">
            <div className="text-xs font-bold text-[#5F6D65] uppercase">Registros Auditados</div>
            <div className="text-3xl font-bold text-[#17211B] my-2">{audit.totalRegistrosAuditados}</div>
            <div className="text-[11px] text-[#5F6D65]">38 áreas, 144 turbinas, 18 evidências</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#DDE4DE] shadow-sm">
            <div className="text-xs font-bold text-amber-700 uppercase flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Registros Incompletos</span>
            </div>
            <div className="text-3xl font-bold text-amber-700 my-2">{audit.registrosIncompletos}</div>
            <div className="text-[11px] text-[#5F6D65]">Campos secundários pendentes</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#DDE4DE] shadow-sm">
            <div className="text-xs font-bold text-blue-700 uppercase">Fotos sem GPS</div>
            <div className="text-3xl font-bold text-blue-700 my-2">{audit.fotosSemLocalizacao}</div>
            <div className="text-[11px] text-emerald-700 font-bold">✓ 100% de conformidade espacial</div>
          </div>
        </div>

        {/* LISTA DE INCONSISTÊNCIAS E AÇÕES CORRETIVAS */}
        <div className="bg-white rounded-3xl border border-[#DDE4DE] shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="font-bold text-base text-[#17211B]">
            Inconsistências Identificadas & Ações Corretivas
          </h3>

          <div className="space-y-3">
            {audit.detalhes.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#F5F7F4] rounded-2xl border border-[#DDE4DE] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-[#DDE4DE] text-[#17211B]">
                      {item.areaId}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      item.severidade === 'Alta' ? 'bg-red-100 text-red-800' :
                      item.severidade === 'Média' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      Severidade: {item.severidade}
                    </span>
                    <strong className="text-[#17211B]">{item.tipoInconsistencia}</strong>
                  </div>
                  <p className="text-[#5F6D65]">{item.descricao}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/areas/${item.areaId}`}
                    className="px-3.5 py-2 bg-[#00A651] hover:bg-[#008C44] text-white font-bold rounded-xl flex items-center gap-1 shadow-sm transition-all"
                  >
                    <span>{item.acaoCorretiva}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
