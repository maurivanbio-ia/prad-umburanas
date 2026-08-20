import { NextRequest, NextResponse } from 'next/server';
import {
  AREAS_PRAD_CANONICAS,
  EVIDENCIAS_FOTOS_CANONICAS,
  ALERTAS_ACIONAVEIS_CANONICOS
} from '@/data/semanticDb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const paramId = decodeURIComponent(params.id).trim().toLowerCase();

  // Buscar por ID canônico ou código legado
  const area = AREAS_PRAD_CANONICAS.find(
    (a) =>
      a.id.toLowerCase() === paramId ||
      a.codigoLegado.toLowerCase() === paramId ||
      a.id.toLowerCase().replace(/[^a-z0-9]/g, '') === paramId.replace(/[^a-z0-9]/g, '')
  ) || AREAS_PRAD_CANONICAS[0];

  // Buscar evidências vinculadas
  const photos = EVIDENCIAS_FOTOS_CANONICAS.filter((f) => f.areaId === area.id);

  // Buscar alertas ativos
  const alertas = ALERTAS_ACIONAVEIS_CANONICOS.filter((alt) => alt.areaId === area.id);

  // Gerar histórico de auditoria e linha do tempo cronológica
  const timeline = [
    {
      id: 'TL-01',
      data: '18/08/2026',
      tipo: 'Monitoramento Ecológico',
      titulo: 'Avaliação Semestral de Vigor e Sobrevivência',
      descricao: `Cobertura vegetal avaliada em ${area.coberturaVegetal}%, solo exposto em ${area.soloExposto}%. Regeneração da Caatinga satisfatória.`,
      responsavel: 'Biól. Especialista Caatinga',
      evidenciasQtd: photos.length || 2,
      tag: 'Ecológico'
    },
    {
      id: 'TL-02',
      data: '14/08/2026',
      tipo: 'Intervenção Física',
      titulo: 'Manutenção de Talude & Retaludamento',
      descricao: 'Instalação de paliçadas de madeira tratada e hidrossemeadura com espécies nativas.',
      responsavel: 'Eng. Maurivan Vaz Ribeiro',
      evidenciasQtd: 4,
      tag: 'Manutenção'
    },
    {
      id: 'TL-03',
      data: '02/08/2026',
      tipo: 'Irrigação Suplementar',
      titulo: 'Ciclo Quinzenal de Irrigação de Mudas',
      descricao: 'Aplicação de 2.500L de água com caminhão pipa nas covas de mudas jovens.',
      responsavel: 'Equipe de Campo EcoBrasil',
      evidenciasQtd: 1,
      tag: 'Operação'
    }
  ];

  return NextResponse.json({
    success: true,
    area,
    photos,
    alertas,
    timeline
  });
}
