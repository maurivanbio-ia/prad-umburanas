/**
 * Modelo de Dados Semântico e Canônico do PRAD Umburanas
 * Sistema Integrado de Gestão, Monitoramento e Inteligência da Recuperação Ambiental
 */

export type StatusOperacional = 
  | 'nao_iniciado' 
  | 'programado' 
  | 'em_execucao' 
  | 'concluido' 
  | 'atrasado' 
  | 'suspenso';

export type ResultadoAmbiental = 
  | 'satisfatorio' 
  | 'atencao' 
  | 'critico' 
  | 'nao_avaliado';

export type ModoOperacao = 'gestao' | 'campo' | 'analitico';

export interface AreaPRAD {
  id: string;                 // Ex: "UMB25.BF11"
  codigoLegado: string;       // Ex: "PRAD-01", "BF-11"
  nome: string;               // Ex: "Bota Fora 11 - Serra da Babilônia"
  tipo: string;               // Ex: "Bota Fora", "Acesso", "Canteiro", "Erosão"
  conjuntoEolico: string;     // Ex: "Delta 03", "Serra da Babilônia"
  areaHa: number;             // Ex: 1.42
  statusOperacional: StatusOperacional;
  resultadoAmbiental: ResultadoAmbiental;
  progressoExecucao: number;  // 0 - 100%
  indiceRecuperacao: number;  // 0 - 100%
  taxaSobrevivencia: number;  // 0 - 100%
  coberturaVegetal: number;   // 0 - 100%
  soloExposto: number;        // 0 - 100%
  riscoErosao: 'baixo' | 'medio' | 'alto' | 'critico';
  declividadeMediaGraus: number;
  altitudeMediaM: number;
  latitude: number;
  longitude: number;
  coordenadasUtm: {
    este: number;
    norte: number;
    fuso: string;
  };
  ultimaAtividade?: {
    tipo: string;
    data: string;
    responsavel: string;
  };
  ultimoMonitoramento?: {
    data: string;
    responsavel: string;
    cobertura: number;
    condicaoGeral: string;
  };
  especiesNativas: string[];
  alertasAtivos: AlertaAcionavel[];
  totalEvidencias: number;
  scoreQualidadeDados: number; // 0 - 100%
}

export interface AtividadeIntervencao {
  id: string;
  areaId: string;
  tipo: 'Plantio' | 'Replantio' | 'Controle Erosivo' | 'Irrigacao' | 'Adubacao' | 'Coveamento' | 'Retaludamento' | 'Manutencao';
  descricao: string;
  dataInicio: string;
  dataFim?: string;
  status: StatusOperacional;
  responsavel: string;
  equipe: string;
  insumosUtilizados?: string[];
  quantidadeMudas?: number;
  volumeAguaLitros?: number;
  evidenciasFotosIds: string[];
  observacoesTecnicas?: string;
}

export interface MonitoramentoEcolgico {
  id: string;
  areaId: string;
  data: string;
  campanha: string;
  responsavel: string;
  tipo: 'Ecológico Semestral' | 'Operacional Mensal' | 'Vistoria Emergencial';
  coberturaVegetalPct: number;
  soloExpostoPct: number;
  coberturaHerbaccaPct: number;
  coberturaArbustivaPct: number;
  coberturaArboreaPct: number;
  regeneracaoNatural: 'Excelente' | 'Boa' | 'Regular' | 'Insuficiente';
  mudasVivas: number;
  mudasMortas: number;
  taxaSobrevivenciaPct: number;
  riquezaEspeciesNativas: number;
  presencaEspeciesInvasoras: boolean;
  especiesInvasorasDetectadas?: string[];
  presencaErosao: boolean;
  severidadeErosao?: 'Leve' | 'Moderada' | 'Severa' | 'Laminar' | 'Sulcos' | 'Voçoroca';
  necessitaReplantio: boolean;
  necessitaIrrigacao: boolean;
  necessitaControleFormiga: boolean;
  condicaoGeral: 'Satisfatório' | 'Atenção' | 'Crítico';
  observacoes: string;
  evidenciasFotosIds: string[];
  coordenadasGps: [number, number];
}

export interface EvidenciaFoto {
  id: string;
  areaId: string;
  atividadeId?: string;
  monitoramentoId?: string;
  campanha: string;
  data: string;
  hora: string;
  latitude: number;
  longitude: number;
  altitudeM: number;
  coordenadasUtm: string;
  responsavel: string;
  titulo: string;
  descricao: string;
  tipoEvidencia: 'Antes/Depois' | 'Plantio' | 'Controle Erosivo' | 'Monitoramento' | 'Vistoria';
  urlFoto: string;
  origem: 'App Campo' | 'Vistoria Técnica' | 'Drone';
  statusValidacao: 'Validado' | 'Pendente' | 'Inconsistente';
}

export interface AlertaAcionavel {
  id: string;
  areaId: string;
  areaNome: string;
  codigoArea: string;
  tipo: 'Ecológico' | 'Operacional' | 'Qualidade de Dados' | 'Clima';
  criticidade: 'critico' | 'atencao' | 'informativo';
  titulo: string;
  descricao: string;
  dataGeracao: string;
  diasAtraso?: number;
  acaoSugerida: string;
  rotaAcao: string;
  parametrosAcao?: Record<string, any>;
}

export interface KpiDef {
  codigo: string;
  nome: string;
  definicao: string;
  formula: string;
  unidade: string;
  valorAtual: number;
  meta: number;
  limiteAtencao: number;
  limiteCritico: number;
  variacaoPeriodo: number; // percentual ou p.p.
  tendencia: 'alta' | 'baixa' | 'estavel';
  status: 'satisfatorio' | 'atencao' | 'critico';
  areasSatisfatorias: number;
  areasAtencao: number;
  areasCriticas: number;
  responsavel: string;
  frequenciaAtualizacao: string;
  ultimaAtualizacao: string;
}

export interface DataQualityAudit {
  scoreGeralPct: number;
  totalRegistrosAuditados: number;
  registrosIncompletos: number;
  inconsistenciasEspaciais: number;
  fotosSemLocalizacao: number;
  atividadesSemEvidencia: number;
  monitoramentosAtrasados: number;
  detalhes: {
    areaId: string;
    tipoInconsistencia: string;
    severidade: 'Alta' | 'Média' | 'Baixa';
    descricao: string;
    acaoCorretiva: string;
  }[];
}
