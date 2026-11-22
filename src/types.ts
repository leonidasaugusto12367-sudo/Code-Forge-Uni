export type CareerTrackId = 'explorador' | 'jogos' | 'web' | 'dados' | 'sistemas';

export type InitialLevel = 'zero' | 'basico';

export type ProgrammingLanguage = 'javascript' | 'python' | 'java' | 'csharp' | 'cpp';

export type AppTab = 'trilha' | 'arena' | 'professor' | 'glossario' | 'perfil';

export interface ProgrammingLanguageMeta {
  id: ProgrammingLanguage;
  name: string;
  shortLabel: string;
  extension: string;
  runtimeLabel: string;
  tagline: string;
  universityFocus: string;
  consoleCommand: string;
  codeFence: string;
  executionMode: 'native' | 'ai_evaluator';
  accentTextClass: string;
  accentBgClass: string;
  accentBorderClass: string;
}

export interface StudentProfile {
  name: string;
  goal: string;
  initialLevel: InitialLevel;
  careerTrack: CareerTrackId;
  programmingLanguage: ProgrammingLanguage;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface CareerTrackMeta {
  id: CareerTrackId;
  name: string;
  shortName: string;
  tagline: string;
  examples: string[];
  universityCourses: string[];
  accentColor: 'cyan' | 'purple' | 'emerald' | 'amber';
  featured?: boolean;
}

export interface TestCase {
  id: string;
  label: string;
  input: unknown[];
  expected: unknown;
  isEdgeCase?: boolean;
}

export interface ConceptQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  summary: string;
  estimatedMinutes: number;
  xpReward: number;
  universityTag: string;
  theoryBlocks: {
    heading: string;
    body: string;
    codeExample?: string;
  }[];
  trackContext: Record<CareerTrackId, string>;
  conceptQuiz: ConceptQuiz;
  challenge: {
    prompt: string;
    functionName: string;
    starterCode: string;
    edgeCasesToWatch: string[];
    testCases: TestCase[];
  };
}

export interface CurriculumModule {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  universityEquivalent: string;
  lessons: Lesson[];
}

export interface DebugChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Universitário';
  xpReward: number;
  symptom: string;
  buggyCode: string;
  functionName: string;
  academicConcept: string;
  testCases: TestCase[];
}

export interface GeneratedChallenge {
  id: string;
  titulo: string;
  descricao: string;
  contextoUniversitario: string;
  funcaoAlvo: string;
  codigoInicial: string;
  dicaInicial: string;
  xpRecompensa: number;
  testes: TestCase[];
}

export interface TestExecutionItem {
  id: string;
  label: string;
  input: unknown[];
  expected: unknown;
  actual?: unknown;
  passed: boolean;
  isEdgeCase?: boolean;
  error?: string;
  durationMs: number;
}

export interface CodeRunResult {
  success: boolean;
  allPassed: boolean;
  compileError?: string;
  logs: string[];
  results: TestExecutionItem[];
  totalDurationMs: number;
}

export interface SocraticHintResponse {
  diagnosticoTecnico: string;
  perguntaSocratica: string;
  pistaDirecionada: string;
  conceitoAcademico: string;
  proximoPasso: string;
  isFallback?: boolean;
}

export interface CodeReviewResponse {
  resumoGeral: string;
  seloQualidade: string;
  complexidadeBigO: string;
  notas: {
    legibilidade: number;
    nomenclatura: number;
    casosExtremos: number;
    eficiencia: number;
  };
  pontosFortes: string[];
  sugestoesMelhoria: string[];
  alertaCasosExtremos: string;
  isFallback?: boolean;
}

export interface TutorResponse {
  explicacao: string;
  analogiaPratica: string;
  exemploCodigo: string;
  perguntaVerificacao: string;
  topicoRelacionado: string;
}

export interface ExplorerRecommendation {
  trilhaRecomendada: Exclude<CareerTrackId, 'explorador'>;
  tituloTrilha: string;
  justificativa: string;
  cursosUniversitarios: string[];
  primeiroProjetoSugerido: string;
  habilidadesChave: string[];
}

export type AccountAvatarColor = 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'indigo';

export interface SavedTutorMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  codeSnippet?: string;
  structured?: TutorResponse;
}

export interface CompletedProject {
  id: string;
  title: string;
  language: ProgrammingLanguage;
  summary: string;
  code: string;
  completedAt: string;
}

export interface ModuleExam {
  moduleId: string;
  moduleNumber: string;
  moduleTitle: string;
  universityTag: string;
  title: string;
  summary: string;
  xpReward: number;
  prompt: string;
  functionName: string;
  edgeCasesToWatch: string[];
  starterCodeByLanguage: Record<ProgrammingLanguage, string>;
  testCases: TestCase[];
}

export interface MiniProjectBlueprint {
  entrada: string;
  regras: string;
  saida: string;
}

export interface MiniProjectStep {
  stepNumber: 1 | 2 | 3;
  title: string;
  objective: string;
  prompt: string;
  functionName: string;
  starterCodeByLanguage?: Record<ProgrammingLanguage, string>;
  starterCode?: string;
  testCases: TestCase[];
}

export interface MiniProjectDefinition {
  id: string;
  title: string;
  tagline: string;
  summary: string;
  xpReward: number;
  isCustomAi?: boolean;
  blueprint: MiniProjectBlueprint;
  steps: MiniProjectStep[];
}

export interface StudentProgress {
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  completedLessonIds: string[];
  completedDebugIds: string[];
  completedAiChallengesCount: number;
  reviewsReceivedCount: number;
  hintsUsedCount: number;
  explorerQuizDone: boolean;
  savedCodeByLesson: Record<string, string>;
  unlockedBadges: string[];
  favoriteGlossaryIds?: string[];
  professorHistory?: SavedTutorMessage[];
  passedExamModuleIds?: string[];
  completedProjects?: CompletedProject[];
}

export interface LocalAccount {
  id: string;
  name: string;
  avatarColor: AccountAvatarColor;
  pin?: string;
  createdAt: string;
  lastActiveAt: string;
  profile: StudentProfile;
  progress: StudentProgress;
}

export interface MultiAccountStorage {
  accounts: LocalAccount[];
  activeAccountId: string | null;
}
