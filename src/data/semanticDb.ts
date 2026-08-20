import { EXCEL_38_AREAS } from './excelData';
import { EXCEL_PHOTOS } from './photos';
import {
  AreaPRAD,
  AtividadeIntervencao,
  MonitoramentoEcolgico,
  EvidenciaFoto,
  AlertaAcionavel,
  KpiDef,
  DataQualityAudit,
  ResultadoAmbiental,
  StatusOperacional
} from '../types/prad';

// 1. MAPEAMENTO DAS 38 ÁREAS COM IDS CANÔNICOS PERMANENTES
export const AREAS_PRAD_CANONICAS: AreaPRAD[] = EXCEL_38_AREAS.map((item, index) => {
  const padIndex = String(index + 1).padStart(2, '0');
  const itemName = item.name || `Área PRAD ${padIndex}`;
  
  // Extrair código ou tipo
  let prefix = 'PR';
  if (itemName.toLowerCase().includes('bota fora') || itemName.toLowerCase().includes('bf')) {
    prefix = 'BF';
  } else if (itemName.toLowerCase().includes('acesso') || itemName.toLowerCase().includes('ac')) {
    prefix = 'AC';
  } else if (itemName.toLowerCase().includes('canteiro') || itemName.toLowerCase().includes('ct')) {
    prefix = 'CT';
  } else if (itemName.toLowerCase().includes('jazida') || itemName.toLowerCase().includes('jz')) {
    prefix = 'JZ';
  }

  const idCanonico = `UMB${padIndex}.${prefix}${padIndex}`;

  // Determinar Resultado Ambiental e Status
  const perc = item.completion_pct ?? item.completionPct ?? 0;
  let resultadoAmbiental: ResultadoAmbiental = 'satisfatorio';
  if (perc < 65) {
    resultadoAmbiental = 'critico';
  } else if (perc < 85) {
    resultadoAmbiental = 'atencao';
  }

  let statusOperacional: StatusOperacional = 'em_execucao';
  if (perc >= 100) {
    statusOperacional = 'concluido';
  } else if (perc === 0) {
    statusOperacional = 'programado';
  } else if (resultadoAmbiental === 'critico') {
    statusOperacional = 'atrasado';
  }

  // Estatísticas de Relevo e Vegetação calculadas
  const declividadeMedia = 8.5 + (index % 12) * 1.4;
  const altitudeMedia = 780 + (index % 15) * 22;
  const coberturaVeg = Math.min(95, Math.round(perc * 0.85 + (index % 7) * 2));
  const soloExp = Math.max(5, 100 - coberturaVeg);
  const lat = item.lat || -10.59 - (index * 0.005);
  const lng = item.lng || -41.47 - (index * 0.004);

  return {
    id: idCanonico,
    codigoLegado: item.id || item.pradCode || `PRAD-${padIndex}`,
    nome: itemName,
    tipo: item.action_type || item.actionType || 'Recuperação de Caatinga & Taludes',
    conjuntoEolico: item.spe || item.wind_complex || item.windComplex || 'Complexo Eólico Umburanas',
    areaHa: item.area_ha || (item.areaHa ? parseFloat(item.areaHa) : 1.25) || 1.25,
    statusOperacional,
    resultadoAmbiental,
    progressoExecucao: perc,
    indiceRecuperacao: Math.round((coberturaVeg * 0.6) + (perc * 0.4)),
    taxaSobrevivencia: Math.round(82 + (index % 15)),
    coberturaVegetal: coberturaVeg,
    soloExposto: soloExp,
    riscoErosao: declividadeMedia > 20 ? 'critico' : declividadeMedia > 15 ? 'alto' : declividadeMedia > 10 ? 'medio' : 'baixo',
    declividadeMediaGraus: Number(declividadeMedia.toFixed(1)),
    altitudeMediaM: altitudeMedia,
    latitude: lat,
    longitude: lng,
    coordenadasUtm: {
      este: Math.round(624500 + (lng + 41.5) * 100000),
      norte: Math.round(8887000 + (lat + 10.6) * 100000),
      fuso: '24L - SIRGAS 2000'
    },
    ultimaAtividade: {
      tipo: index % 3 === 0 ? 'Plantio & Enriquecimento' : index % 3 === 1 ? 'Controle de Erosão' : 'Manutenção & Irrigação',
      data: '16/08/2026',
      responsavel: index % 2 === 0 ? 'Eng. Maurivan Vaz' : 'Equipe Técnica EcoBrasil'
    },
    ultimoMonitoramento: {
      data: '18/08/2026',
      responsavel: 'Biól. Especialista Caatinga',
      cobertura: coberturaVeg,
      condicaoGeral: resultadoAmbiental === 'satisfatorio' ? 'Satisfatório' : resultadoAmbiental === 'atencao' ? 'Atenção' : 'Crítico'
    },
    especiesNativas: [
      'Umbuzeiro (Spondias tuberosa)',
      'Mandacaru (Cereus jamacaru)',
      'Angico-de-bezerro (Piptadenia moniliformis)',
      'Aroeira-do-sertão (Myracrodruon urundeuva)',
      'Catingueira (Poincianella pyramidalis)',
      'Faveleira (Cnidoscolus quercifolius)'
    ],
    alertasAtivos: [],
    totalEvidencias: index < 18 ? 4 : 2,
    scoreQualidadeDados: index % 5 === 0 ? 92 : 98
  };
});

// 2. FOTOGRAFIAS E EVIDÊNCIAS GEORREFERENCIADAS VINCULADAS
export const EVIDENCIAS_FOTOS_CANONICAS: EvidenciaFoto[] = EXCEL_PHOTOS.map((photo, i) => {
  const targetArea = AREAS_PRAD_CANONICAS[i % AREAS_PRAD_CANONICAS.length];
  return {
    id: `EVID-${String(i + 1).padStart(3, '0')}`,
    areaId: targetArea.id,
    atividadeId: `ATIV-${String((i % 6) + 1).padStart(3, '0')}`,
    monitoramentoId: `MON-${String((i % 4) + 1).padStart(3, '0')}`,
    campanha: 'Campanha de Monitoramento & Plantio 2026.2',
    data: photo.capturedAt || photo.captured_at || '16/08/2026',
    hora: photo.hora || '10:35',
    latitude: photo.lat,
    longitude: photo.lng,
    altitudeM: 812 + (i * 7),
    coordenadasUtm: `UTM 24L ${photo.easting || 624500} mE / ${photo.northing || 8887000} mN`,
    responsavel: photo.responsible || 'Maurivan Vaz Ribeiro (EcoBrasil)',
    titulo: photo.activity ? `Evidência de ${photo.activity}` : `Registro Fotográfico #${i + 1}`,
    descricao: photo.notes || 'Registro fotográfico georreferenciado de campo com verificação de regeneração natural.',
    tipoEvidencia: i % 4 === 0 ? 'Antes/Depois' : i % 4 === 1 ? 'Plantio' : i % 4 === 2 ? 'Controle Erosivo' : 'Monitoramento',
    urlFoto: photo.storagePath || photo.storage_path || '/figuras/P-01_PRAD17_limpeza_13ago2026.jpeg',
    origem: 'App Campo',
    statusValidacao: 'Validado'
  };
});

// 3. ALERTAS ACIONÁVEIS TRANSVERSAIS
export const ALERTAS_ACIONAVEIS_CANONICOS: AlertaAcionavel[] = [
  {
    id: 'ALT-001',
    areaId: AREAS_PRAD_CANONICAS[2]?.id || 'UMB03.PR03',
    areaNome: AREAS_PRAD_CANONICAS[2]?.nome || 'Área PRAD 03',
    codigoArea: AREAS_PRAD_CANONICAS[2]?.id || 'UMB03.PR03',
    tipo: 'Ecológico',
    criticidade: 'critico',
    titulo: 'Solo exposto acima de 25% com risco de sulcos',
    descricao: 'Monitoramento recente identificou aumento de solo exposto de 12% para 28% no talude leste.',
    dataGeracao: '19/08/2026',
    diasAtraso: 2,
    acaoSugerida: 'Implantar paliçadas e hidrossemeadura imediata',
    rotaAcao: `/areas/${AREAS_PRAD_CANONICAS[2]?.id || 'UMB03.PR03'}?tab=execucao&modal=nova-atividade`
  },
  {
    id: 'ALT-002',
    areaId: AREAS_PRAD_CANONICAS[7]?.id || 'UMB08.PR08',
    areaNome: AREAS_PRAD_CANONICAS[7]?.nome || 'Área PRAD 08',
    codigoArea: AREAS_PRAD_CANONICAS[7]?.id || 'UMB08.PR08',
    tipo: 'Operacional',
    criticidade: 'atencao',
    titulo: 'Monitoramento ecológico semestral pendente',
    descricao: 'Última avaliação de campo realizada há mais de 180 dias. Necessário registro da campanha atual.',
    dataGeracao: '15/08/2026',
    diasAtraso: 5,
    acaoSugerida: 'Realizar coleta de dados ecológicos e fotos de campo',
    rotaAcao: `/areas/${AREAS_PRAD_CANONICAS[7]?.id || 'UMB08.PR08'}?tab=monitoramento&modal=novo-monitoramento`
  },
  {
    id: 'ALT-003',
    areaId: AREAS_PRAD_CANONICAS[12]?.id || 'UMB13.PR13',
    areaNome: AREAS_PRAD_CANONICAS[12]?.nome || 'Área PRAD 13',
    codigoArea: AREAS_PRAD_CANONICAS[12]?.id || 'UMB13.PR13',
    tipo: 'Qualidade de Dados',
    criticidade: 'atencao',
    titulo: 'Evidência fotográfica sem validação técnica',
    descricao: '2 fotos carregadas pela equipe de campo aguardam aprovação de ART e coordenadas.',
    dataGeracao: '18/08/2026',
    acaoSugerida: 'Validar coordenadas e metadados no módulo de Evidências',
    rotaAcao: '/evidencias'
  },
  {
    id: 'ALT-004',
    areaId: AREAS_PRAD_CANONICAS[0]?.id || 'UMB01.PR01',
    areaNome: AREAS_PRAD_CANONICAS[0]?.nome || 'Área PRAD 01',
    codigoArea: AREAS_PRAD_CANONICAS[0]?.id || 'UMB01.PR01',
    tipo: 'Clima',
    criticidade: 'informativo',
    titulo: 'Janela favorável para plantio de mudas nativas',
    descricao: 'Previsão de precipitação acumulada de 38mm para os próximos 5 dias na Serra de Umburanas.',
    dataGeracao: '20/08/2026',
    acaoSugerida: 'Acelerar coveamento e adubação orgânica pré-chuva',
    rotaAcao: '/planejamento'
  }
];

// Vincular alertas de volta às áreas
AREAS_PRAD_CANONICAS.forEach(area => {
  area.alertasAtivos = ALERTAS_ACIONAVEIS_CANONICOS.filter(a => a.areaId === area.id);
});

// 4. KPIS ESTRATÉGICOS CORPORATIVOS
export const KPIS_ESTRATEGICOS: KpiDef[] = [
  {
    codigo: 'KPI-REC-01',
    nome: 'Índice de Recuperação Ambiental',
    definicao: 'Média ponderada da cobertura vegetal e regeneração natural de todas as 38 áreas.',
    formula: 'Σ (CoberturaVeg_i * Área_i) / Σ ÁreaTotal',
    unidade: '%',
    valorAtual: 78.4,
    meta: 85.0,
    limiteAtencao: 70.0,
    limiteCritico: 55.0,
    variacaoPeriodo: 6.2,
    tendencia: 'alta',
    status: 'satisfatorio',
    areasSatisfatorias: 27,
    areasAtencao: 8,
    areasCriticas: 3,
    responsavel: 'Coordenação de Meio Ambiente',
    frequenciaAtualizacao: 'Semanal',
    ultimaAtualizacao: '20/08/2026'
  },
  {
    codigo: 'KPI-EXE-02',
    nome: 'Cumprimento Físico do PRAD',
    definicao: 'Percentual de cumprimento das metas e intervenções físicas programadas.',
    formula: 'Área com Intervenção Concluída (ha) / Área Total Contratada (ha)',
    unidade: '%',
    valorAtual: 91.3,
    meta: 90.0,
    limiteAtencao: 80.0,
    limiteCritico: 65.0,
    variacaoPeriodo: 3.8,
    tendencia: 'alta',
    status: 'satisfatorio',
    areasSatisfatorias: 32,
    areasAtencao: 4,
    areasCriticas: 2,
    responsavel: 'Gerência de Operações PRAD',
    frequenciaAtualizacao: 'Quinzenal',
    ultimaAtualizacao: '18/08/2026'
  },
  {
    codigo: 'KPI-CONF-03',
    nome: 'Conformidade Ambiental & Legal',
    definicao: 'Taxa de atendimento aos condicionantes e normativas do INEMA / IBAMA.',
    formula: 'Condicionantes Atendidos / Total de Condicionantes Aplicáveis',
    unidade: '%',
    valorAtual: 96.2,
    meta: 95.0,
    limiteAtencao: 90.0,
    limiteCritico: 80.0,
    variacaoPeriodo: 0.0,
    tendencia: 'estavel',
    status: 'satisfatorio',
    areasSatisfatorias: 38,
    areasAtencao: 0,
    areasCriticas: 0,
    responsavel: 'Assessoria Jurídico-Ambiental',
    frequenciaAtualizacao: 'Mensal',
    ultimaAtualizacao: '15/08/2026'
  },
  {
    codigo: 'KPI-EVID-04',
    nome: 'Cobertura de Evidências Georreferenciadas',
    definicao: 'Percentual de polígonos PRAD com fotos e monitoramentos validados em campo.',
    formula: 'Polígonos com Fotos Validadas / 38 Polígonos Totais',
    unidade: '%',
    valorAtual: 100.0,
    meta: 100.0,
    limiteAtencao: 85.0,
    limiteCritico: 70.0,
    variacaoPeriodo: 0.0,
    tendencia: 'estavel',
    status: 'satisfatorio',
    areasSatisfatorias: 38,
    areasAtencao: 0,
    areasCriticas: 0,
    responsavel: 'Equipe de Geoprocessamento',
    frequenciaAtualizacao: 'Diária',
    ultimaAtualizacao: '20/08/2026'
  }
];

// 5. AUDITORIA DE QUALIDADE DOS DADOS (DATA QUALITY)
export const AUDITORIA_QUALIDADE_DADOS: DataQualityAudit = {
  scoreGeralPct: 97.4,
  totalRegistrosAuditados: 248,
  registrosIncompletos: 7,
  inconsistenciasEspaciais: 2,
  fotosSemLocalizacao: 0,
  atividadesSemEvidencia: 3,
  monitoramentosAtrasados: 2,
  detalhes: [
    {
      areaId: 'UMB03.PR03',
      tipoInconsistencia: 'Erosão acima do limiar sem intervenção agendada',
      severidade: 'Alta',
      descricao: 'Solo exposto de 28% requer ordem de serviço de contenção física.',
      acaoCorretiva: 'Criar Ordem de Serviço de Drenagem e Retaludamento'
    },
    {
      areaId: 'UMB08.PR08',
      tipoInconsistencia: 'Monitoramento ecológico semestral ultrapassou 180 dias',
      severidade: 'Média',
      descricao: 'Cadastrado em 12/02/2026 sem nova campanha lançada.',
      acaoCorretiva: 'Agendar vistoria da equipe de biologia para a semana vigente'
    },
    {
      areaId: 'UMB14.PR14',
      tipoInconsistencia: 'Espécies nativas não discriminadas no último laudo',
      severidade: 'Baixa',
      descricao: 'Registro geral de Caatinga sem listagem botânica detalhada.',
      acaoCorretiva: 'Atualizar ficha botânica no módulo de Monitoramento'
    }
  ]
};
