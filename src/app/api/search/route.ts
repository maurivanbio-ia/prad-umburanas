import { NextRequest, NextResponse } from 'next/server';
import {
  AREAS_PRAD_CANONICAS,
  EVIDENCIAS_FOTOS_CANONICAS,
  ALERTAS_ACIONAVEIS_CANONICOS
} from '@/data/semanticDb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  if (!q) {
    return NextResponse.json({
      areas: [],
      evidencias: [],
      alertas: [],
      total: 0
    });
  }

  // 1. Busca em Áreas PRAD
  const matchingAreas = AREAS_PRAD_CANONICAS.filter(area =>
    area.id.toLowerCase().includes(q) ||
    area.codigoLegado.toLowerCase().includes(q) ||
    area.nome.toLowerCase().includes(q) ||
    area.tipo.toLowerCase().includes(q) ||
    area.conjuntoEolico.toLowerCase().includes(q) ||
    area.especiesNativas.some(esp => esp.toLowerCase().includes(q))
  ).slice(0, 8);

  // 2. Busca em Evidências e Fotografias
  const matchingEvidencias = EVIDENCIAS_FOTOS_CANONICAS.filter(evid =>
    evid.id.toLowerCase().includes(q) ||
    evid.titulo.toLowerCase().includes(q) ||
    evid.descricao.toLowerCase().includes(q) ||
    evid.tipoEvidencia.toLowerCase().includes(q) ||
    evid.responsavel.toLowerCase().includes(q) ||
    evid.areaId.toLowerCase().includes(q)
  ).slice(0, 6);

  // 3. Busca em Alertas
  const matchingAlertas = ALERTAS_ACIONAVEIS_CANONICOS.filter(alerta =>
    alerta.titulo.toLowerCase().includes(q) ||
    alerta.descricao.toLowerCase().includes(q) ||
    alerta.areaNome.toLowerCase().includes(q) ||
    alerta.codigoArea.toLowerCase().includes(q)
  ).slice(0, 4);

  return NextResponse.json({
    query: q,
    total: matchingAreas.length + matchingEvidencias.length + matchingAlertas.length,
    areas: matchingAreas,
    evidencias: matchingEvidencias,
    alertas: matchingAlertas
  });
}
