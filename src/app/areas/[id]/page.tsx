'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Camera,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sprout,
  Activity,
  Layers,
  Mountain,
  Compass,
  Calendar,
  User,
  Plus,
  ShieldCheck,
  TrendingUp,
  Download,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { AreaPRAD, EvidenciaFoto, AlertaAcionavel } from '@/types/prad';

export default function SingleAreaPage({ params }: { params: { id: string } }) {
  const [area, setArea] = useState<AreaPRAD | null>(null);
  const [photos, setPhotos] = useState<EvidenciaFoto[]>([]);
  const [alertas, setAlertas] = useState<AlertaAcionavel[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    'visao_geral' | 'execucao' | 'monitoramento' | 'evidencias' | 'relevo' | 'historico' | 'documentos'
  >('visao_geral');
  const [loading, setLoading] = useState(true);

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
        setAlertas(data.alertas || []);
        setTimeline(data.timeline || []);
      }
    } catch (err) {
      console.error('Failed to fetch area details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !area) {
    return (
      <div className="min-h-screen bg-[#F5F7F4] flex items-center justify-center p-8 font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#00A651] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#5F6D65]">Carregando Ficha Digital da Área...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F4] text-[#17211B] p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* BARRA SUPERIOR: NAVEGAÇÃO & ATALHOS */}
        <div className="flex items-center justify-between">
          <Link
            href="/areas"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5F6D65] hover:text-[#17211B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Catálogo de Áreas</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/geoportal?lat=${area.latitude}&lng=${area.longitude}&zoom=17`}
              className="px-3.5 py-1.5 bg-[#17211B] text-white hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#00A651]" />
              <span>Ver no Mapa Operacional</span>
            </Link>
          </div>
        </div>

        {/* CABEÇALHO DA FICHA DIGITAL DA ÁREA */}
        <div className="bg-white rounded-3xl border border-[#DDE4DE] p-6 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#DDE4DE] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {area.id}
                </span>
                <span className="text-xs text-[#5F6D65] font-semibold">{area.conjuntoEolico}</span>
              </div>
              <h1 className="text-2xl font-bold text-[#17211B] tracking-tight">
                {area.nome}
              </h1>
              <p className="text-xs text-[#5F6D65] mt-0.5">
                {area.tipo} • {area.areaHa} hectares • Altitude média: {area.altitudeMediaM} m
              </p>
            </div>

            {/* STATUS OPERACIONAL E RESULTADO AMBIENTAL */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-[#5F6D65]">Status Operacional</div>
                <div className="text-xs font-bold text-[#17211B] capitalize mt-0.5">
                  {area.statusOperacional.replace('_', ' ')}
                </div>
              </div>

              <div className="border-l border-[#DDE4DE] pl-3">
                <div className="text-[10px] uppercase font-bold text-[#5F6D65]">Resultado Ambiental</div>
                <div className="mt-0.5">
                  {area.resultadoAmbiental === 'satisfatorio' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Satisfatório
                    </span>
                  )}
                  {area.resultadoAmbiental === 'atencao' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5" /> Atenção
                    </span>
                  )}
                  {area.resultadoAmbiental === 'critico' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                      <XCircle className="w-3.5 h-3.5" /> Crítico
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* KPIS LOCAIS DA ÁREA */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <div className="p-3 bg-[#F5F7F4] rounded-2xl border border-[#DDE4DE]">
              <div className="text-[10px] font-bold uppercase text-[#5F6D65]">Recuperação Ambiental</div>
              <div className="text-2xl font-bold text-[#17211B] mt-1">{area.indiceRecuperacao}%</div>
              <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Cobertura: {area.coberturaVegetal}%</div>
            </div>

            <div className="p-3 bg-[#F5F7F4] rounded-2xl border border-[#DDE4DE]">
              <div className="text-[10px] font-bold uppercase text-[#5F6D65]">Execução Física PRAD</div>
              <div className="text-2xl font-bold text-[#17211B] mt-1">{area.progressoExecucao}%</div>
              <div className="text-[10px] text-[#5F6D65] mt-0.5">Intervenções concluídas</div>
            </div>

            <div className="p-3 bg-[#F5F7F4] rounded-2xl border border-[#DDE4DE]">
              <div className="text-[10px] font-bold uppercase text-[#5F6D65]">Taxa de Sobrevivência</div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">{area.taxaSobrevivencia}%</div>
              <div className="text-[10px] text-[#5F6D65] mt-0.5">Mudas de Caatinga</div>
            </div>

            <div className="p-3 bg-[#F5F7F4] rounded-2xl border border-[#DDE4DE]">
              <div className="text-[10px] font-bold uppercase text-[#5F6D65]">Qualidade dos Dados</div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">{area.scoreQualidadeDados}%</div>
              <div className="text-[10px] text-emerald-700 font-bold mt-0.5">✓ 100% Auditada</div>
            </div>
          </div>
        </div>

        {/* ABAS DA FICHA DIGITAL (7 ABAS ESTRUTURADAS) */}
        <div className="bg-white rounded-3xl border border-[#DDE4DE] shadow-sm overflow-hidden">
          <div className="flex items-center space-x-1 p-2 bg-[#F5F7F4] border-b border-[#DDE4DE] overflow-x-auto text-xs font-bold">
            {[
              { id: 'visao_geral', label: 'Visão Geral' },
              { id: 'execucao', label: 'Execução' },
              { id: 'monitoramento', label: 'Monitoramento' },
              { id: 'evidencias', label: `Evidências (${photos.length})` },
              { id: 'relevo', label: 'Sensoriamento & Relevo' },
              { id: 'historico', label: 'Linha do Tempo' },
              { id: 'documentos', label: 'Documentos & ART' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-[#17211B] shadow-sm'
                    : 'text-[#5F6D65] hover:text-[#17211B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* CONTEÚDO DAS ABAS */}
          <div className="p-6">
            
            {/* 1. ABA: VISÃO GERAL */}
            {activeTab === 'visao_geral' && (
              <div className="space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-[#17211B]">Diagnóstico Ecológico & Físico</h3>
                    <div className="p-4 bg-[#F5F7F4] rounded-2xl border border-[#DDE4DE] space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#5F6D65]">Declividade Média:</span>
                        <span className="font-bold text-[#17211B]">{area.declividadeMediaGraus}° ({area.riscoErosao.toUpperCase()})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5F6D65]">Solo Exposto:</span>
                        <span className="font-bold text-amber-700">{area.soloExposto}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5F6D65]">Coordenadas UTM:</span>
                        <span className="font-mono text-[#17211B]">{area.coordenadasUtm.este} mE / {area.coordenadasUtm.norte} mN</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-[#17211B]">Espécies Nativas da Caatinga Registradas</h3>
                    <div className="p-4 bg-[#F5F7F4] rounded-2xl border border-[#DDE4DE] space-y-1.5">
                      {area.especiesNativas.map((esp, i) => (
                        <div key={i} className="flex items-center gap-2 text-[#17211B] font-medium">
                          <Sprout className="w-3.5 h-3.5 text-[#00A651]" />
                          <span>{esp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ABA: EXECUÇÃO */}
            {activeTab === 'execucao' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#17211B]">Atividades & Intervenções na Área</h3>
                </div>
                <div className="p-4 bg-[#F5F7F4] rounded-2xl border border-[#DDE4DE] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-[#17211B]">{area.ultimaAtividade?.tipo}</div>
                    <div className="text-[#5F6D65] text-xs mt-0.5">Responsável: {area.ultimaAtividade?.responsavel} • Realizada em {area.ultimaAtividade?.data}</div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs">
                    Concluída
                  </span>
                </div>
              </div>
            )}

            {/* 3. ABA: MONITORAMENTO */}
            {activeTab === 'monitoramento' && (
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-sm text-[#17211B]">Avaliação Ecológica Semestral</h3>
                <div className="grid grid-cols-3 gap-3 p-4 bg-[#F5F7F4] rounded-2xl border border-[#DDE4DE] text-center">
                  <div>
                    <div className="text-[10px] text-[#5F6D65] uppercase font-bold">Cobertura Vegetal</div>
                    <div className="text-xl font-bold text-[#00A651] mt-1">{area.coberturaVegetal}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5F6D65] uppercase font-bold">Solo Exposto</div>
                    <div className="text-xl font-bold text-amber-700 mt-1">{area.soloExposto}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5F6D65] uppercase font-bold">Regeneração Natural</div>
                    <div className="text-xl font-bold text-emerald-800 mt-1">Vigorosa</div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. ABA: EVIDÊNCIAS */}
            {activeTab === 'evidencias' && (
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-sm text-[#17211B]">Acervo Fotográfico da Área ({photos.length} fotos)</h3>
                {photos.length === 0 ? (
                  <p className="text-[#5F6D65]">Nenhuma foto registrada especificamente para esta área.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {photos.map((p) => (
                      <div key={p.id} className="rounded-2xl border border-[#DDE4DE] overflow-hidden bg-[#F5F7F4]">
                        <img src={p.urlFoto} alt={p.titulo} className="w-full h-44 object-cover" />
                        <div className="p-3">
                          <div className="font-bold text-[#17211B]">{p.titulo}</div>
                          <div className="text-[10px] text-[#5F6D65] font-mono mt-1">{p.coordenadasUtm}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. ABA: SENSOREAMENTO & RELEVO */}
            {activeTab === 'relevo' && (
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-sm text-[#17211B]">Topografia & Sensoriamento Remoto (Copernicus DEM & CBERS)</h3>
                <div className="p-4 bg-[#F5F7F4] rounded-2xl border border-[#DDE4DE] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#5F6D65]">Modelo Digital de Terreno (MDT):</span>
                    <span className="font-bold text-[#17211B]">{area.altitudeMediaM} metros acima do nível do mar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5F6D65]">Declividade Média da Encosta:</span>
                    <span className="font-bold text-[#17211B]">{area.declividadeMediaGraus}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5F6D65]">Vigor Espectral NDVI:</span>
                    <span className="font-bold text-[#00A651]">0.58 (Caatinga Densa em Regeneração)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 6. ABA: LINHA DO TEMPO CRONOLÓGICA */}
            {activeTab === 'historico' && (
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-sm text-[#17211B]">Histórico Cronológico da Área PRAD</h3>
                <div className="relative border-l-2 border-emerald-500/30 pl-4 ml-2 space-y-6">
                  {timeline.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="absolute -left-[23px] top-0 w-3.5 h-3.5 rounded-full bg-[#00A651] border-2 border-white shadow-sm" />
                      <div className="bg-[#F5F7F4] p-4 rounded-2xl border border-[#DDE4DE] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#17211B]">{item.titulo}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#5F6D65] border border-[#DDE4DE]">
                            {item.data}
                          </span>
                        </div>
                        <p className="text-[#5F6D65]">{item.descricao}</p>
                        <div className="text-[10px] text-[#5F6D65] pt-1 flex items-center justify-between">
                          <span>Responsável: {item.responsavel}</span>
                          <span className="text-emerald-700 font-bold">📷 {item.evidenciasQtd} evidências</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. ABA: DOCUMENTOS */}
            {activeTab === 'documentos' && (
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-sm text-[#17211B]">Documentos Técnicos, ART & Laudos</h3>
                <div className="p-4 bg-[#F5F7F4] rounded-2xl border border-[#DDE4DE] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#00A651]" />
                    <div>
                      <div className="font-bold text-[#17211B]">Laudo Técnico de Vistoria Semestral PRAD 2026</div>
                      <div className="text-[#5F6D65] text-[10px]">Emitido por: EcoBrasil Consultoria Ambiental • ART nº 2026.04.912</div>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#17211B] rounded-xl font-bold border border-[#DDE4DE] shadow-sm flex items-center gap-1 cursor-pointer">
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar PDF</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
