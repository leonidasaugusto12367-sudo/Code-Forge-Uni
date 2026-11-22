import { CareerTrackId, CareerTrackMeta, StudentProgress } from '../types';

export const CAREER_TRACKS: CareerTrackMeta[] = [
  {
    id: 'explorador',
    name: 'Modo Explorador',
    shortName: 'Explorador',
    tagline: 'Ainda não decidi — experimente desafios de cada área e descubra seu perfil com o Professor I.A.',
    examples: ['Diagnóstico vocacional', 'Projetos multidisciplinares', 'Base sólida para qualquer curso'],
    universityCourses: ['Ciência da Computação', 'Engenharia de Software', 'Sistemas de Informação', 'Jogos Digitais'],
    accentColor: 'cyan',
    featured: true,
  },
  {
    id: 'jogos',
    name: 'Desenvolvimento de Jogos',
    shortName: 'Jogos Digitais',
    tagline: 'Domine a lógica por trás de motores gráficos, mecânicas de combate, física e comportamento de NPCs.',
    examples: ['Barra de vida e dano crítico', 'Sistema de inventário', 'Detecção de colisões 2D', 'I.A. de inimigos'],
    universityCourses: ['Jogos Digitais', 'Ciência da Computação', 'Computação Gráfica'],
    accentColor: 'purple',
  },
  {
    id: 'web',
    name: 'Engenharia Web & Apps',
    shortName: 'Web & Apps',
    tagline: 'Construa regras de negócio robustas, interfaces reativas, autenticação segura e APIs escaláveis.',
    examples: ['Validação de formulários', 'Cálculo de carrinho e cupons', 'Controle de sessão', 'Filtros de busca'],
    universityCourses: ['Engenharia de Software', 'Sistemas de Informação', 'ADS'],
    accentColor: 'cyan',
  },
  {
    id: 'dados',
    name: 'Ciência de Dados & I.A.',
    shortName: 'Dados & I.A.',
    tagline: 'Aprenda a limpar conjuntos de dados, extrair estatísticas confiáveis e preparar modelos analíticos.',
    examples: ['Limpeza de amostras inválidas', 'Média e desvio de métricas', 'Classificação por regras', 'Frequência de eventos'],
    universityCourses: ['Ciência de Dados', 'Ciência da Computação', 'Engenharia de Computação'],
    accentColor: 'emerald',
  },
  {
    id: 'sistemas',
    name: 'Engenharia de Software & Sistemas',
    shortName: 'Sistemas & Algoritmos',
    tagline: 'Foco máximo em estruturas de dados, performance, análise Big-O e arquitetura de software limpa.',
    examples: ['Busca binária em logs', 'Filas de prioridade', 'Deduplicação em O(n)', 'Recursão e árvores'],
    universityCourses: ['Ciência da Computação', 'Engenharia de Software', 'Engenharia de Computação'],
    accentColor: 'amber',
  },
];

export function getTrackMeta(id: CareerTrackId): CareerTrackMeta {
  return CAREER_TRACKS.find((t) => t.id === id) ?? CAREER_TRACKS[0];
}

export interface UniversityRank {
  level: number;
  title: string;
  minXp: number;
  nextXp: number;
}

export const UNIVERSITY_RANKS: UniversityRank[] = [
  { level: 1, title: 'Calouro Curioso', minXp: 0, nextXp: 250 },
  { level: 2, title: 'Aprendiz de Lógica', minXp: 250, nextXp: 600 },
  { level: 3, title: 'Construtor de Algoritmos', minXp: 600, nextXp: 1100 },
  { level: 4, title: 'Monitor de Laboratório', minXp: 1100, nextXp: 1750 },
  { level: 5, title: 'Engenheiro em Formação', minXp: 1750, nextXp: 2500 },
  { level: 6, title: 'Veterano CodeForge', minXp: 2500, nextXp: 4000 },
];

export function getRankForXp(xp: number): UniversityRank {
  let current = UNIVERSITY_RANKS[0];
  for (const rank of UNIVERSITY_RANKS) {
    if (xp >= rank.minXp) {
      current = rank;
    }
  }
  return current;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  check: (p: StudentProgress) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'primeiro-codigo',
    title: 'Primeiro Código Compilado',
    description: 'Conclua sua primeira aula prática passando em todos os testes automatizados.',
    check: (p) => p.completedLessonIds.length >= 1,
  },
  {
    id: 'logica-blindada',
    title: 'Lógica Blindada',
    description: 'Conclua 4 aulas completas cobrindo variáveis, condicionais e laços.',
    check: (p) => p.completedLessonIds.length >= 4,
  },
  {
    id: 'cacador-bugs',
    title: 'Caçador de Bugs',
    description: 'Corrija pelo menos 2 códigos defeituosos no Laboratório de Depuração.',
    check: (p) => p.completedDebugIds.length >= 2,
  },
  {
    id: 'revisao-rigorosa',
    title: 'Aprovado no Code Review',
    description: 'Submeta seu código para análise técnica do Professor Doutor I.A.',
    check: (p) => p.reviewsReceivedCount >= 1,
  },
  {
    id: 'mente-socratica',
    title: 'Mente Socrática',
    description: 'Utilize o método socrático para investigar um erro sem pular etapas.',
    check: (p) => p.hintsUsedCount >= 1,
  },
  {
    id: 'explorador-vocacional',
    title: 'Bússola de Carreira',
    description: 'Complete o diagnóstico interativo do Modo Explorador.',
    check: (p) => p.explorerQuizDone,
  },
  {
    id: 'forja-adaptativa',
    title: 'Forjador de Desafios',
    description: 'Resolva um desafio inédito gerado sob demanda pela Inteligência Artificial.',
    check: (p) => p.completedAiChallengesCount >= 1,
  },
  {
    id: 'pronto-universidade',
    title: 'Pronto para a Faculdade',
    description: 'Alcance 1.100 XP ou conclua 10 aulas da trilha universitária.',
    check: (p) => p.xp >= 1100 || p.completedLessonIds.length >= 10,
  },
];
