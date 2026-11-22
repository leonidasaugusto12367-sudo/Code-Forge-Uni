import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Bug,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Code2,
  FolderGit2,
  Layers,
  Loader2,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wand2,
} from 'lucide-react';
import { DEBUG_CHALLENGES } from '../data/debugChallenges';
import { getLanguageMeta } from '../data/languages';
import { getDebugBuggyCode } from '../data/languageTemplates';
import { BUILTIN_MINI_PROJECTS, getProjectStepStarterCode } from '../data/miniProjects';
import { MODULE_EXAMS } from '../data/moduleExams';
import { generateAdaptiveChallenge, generateCustomMiniProject } from '../services/aiProfessor';
import {
  CompletedProject,
  DebugChallenge,
  GeneratedChallenge,
  MiniProjectDefinition,
  ModuleExam,
  ProgrammingLanguage,
  StudentProfile,
  StudentProgress,
} from '../types';
import { CodeEditorPanel } from './CodeEditorPanel';

interface PracticeArenaProps {
  profile: StudentProfile;
  progress: StudentProgress;
  forceMobile?: boolean;
  onDebugCompleted: (id: string, xp: number, title: string) => void;
  onAiChallengeCompleted: (xp: number, title: string) => void;
  onExamPassed: (moduleId: string, xpReward: number, moduleTitle: string) => void;
  onProjectCompleted: (project: CompletedProject, xpReward: number) => void;
  onHintUsed: () => void;
  onReviewReceived: () => void;
}

const TOPICS = [
  'Lógica Booleana e Casos Extremos',
  'Laços de Repetição e Acumuladores',
  'Arrays, Filtros e Imutabilidade',
  'Mapas de Frequência e Tabelas Hash',
  'Strings, Parsing e Validação',
  'Recursão e Divisão e Conquista',
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function assembleProjectCode(
  project: MiniProjectDefinition,
  language: ProgrammingLanguage,
  codeByKey: Record<string, string>,
  overrideStep?: { stepNumber: number; code: string }
): string {
  const commentPrefix = language === 'python' ? '#' : '//';
  const header = `${commentPrefix} Projeto: ${project.title}\n${commentPrefix} Linguagem: ${getLanguageMeta(language).name}\n${commentPrefix} Resumo: ${project.summary}\n`;
  const parts = project.steps.map((step) => {
    const key = `${project.id}::s${step.stepNumber}::${language}`;
    const stepCode =
      overrideStep && overrideStep.stepNumber === step.stepNumber
        ? overrideStep.code
        : codeByKey[key] ?? getProjectStepStarterCode(step, language);
    return `${commentPrefix} ==========================================\n${commentPrefix} ETAPA ${step.stepNumber}/3 — ${step.title}\n${commentPrefix} Objetivo: ${step.objective}\n${commentPrefix} ==========================================\n${stepCode.trim()}`;
  });
  return `${header}\n${parts.join('\n\n')}`;
}

export function PracticeArena({
  profile,
  progress,
  forceMobile = false,
  onDebugCompleted,
  onAiChallengeCompleted,
  onExamPassed,
  onProjectCompleted,
  onHintUsed,
  onReviewReceived,
}: PracticeArenaProps) {
  const [mode, setMode] = useState<'bugs' | 'forge' | 'exam' | 'projects'>('bugs');
  const [mobilePane, setMobilePane] = useState<'brief' | 'editor' | 'output'>('brief');
  const [selectedBug, setSelectedBug] = useState<DebugChallenge>(DEBUG_CHALLENGES[0]);
  const [bugCodeByKey, setBugCodeByKey] = useState<Record<string, string>>({});

  // AI Challenge Forge state
  const [topic, setTopic] = useState(TOPICS[0]);
  const [difficulty, setDifficulty] = useState<'iniciante' | 'intermediario' | 'universitario'>('intermediario');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [aiChallenge, setAiChallenge] = useState<GeneratedChallenge | null>(null);
  const [aiCode, setAiCode] = useState('');
  const [aiSolvedId, setAiSolvedId] = useState<string | null>(null);

  // Module Exam Simulator state
  const [selectedExam, setSelectedExam] = useState<ModuleExam>(MODULE_EXAMS[0]);
  const [examCodeByKey, setExamCodeByKey] = useState<Record<string, string>>({});
  const [examResultByKey, setExamResultByKey] = useState<
    Record<string, { passedAll: boolean; elapsedSeconds: number }>
  >({});

  // Mini-Projects Workshop state
  const [customProjects, setCustomProjects] = useState<MiniProjectDefinition[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(BUILTIN_MINI_PROJECTS[0].id);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [projectCodeByKey, setProjectCodeByKey] = useState<Record<string, string>>({});
  const [solvedStepsByProject, setSolvedStepsByProject] = useState<Record<string, number[]>>({});
  const [ideaInput, setIdeaInput] = useState('');
  const [generatingProject, setGeneratingProject] = useState(false);
  const [projectGenError, setProjectGenError] = useState<string | null>(null);

  const activeLang = profile.programmingLanguage;
  const langMeta = getLanguageMeta(activeLang);

  // Debug active state
  const bugKey = `${selectedBug.id}::${activeLang}`;
  const starterBugCode = getDebugBuggyCode(selectedBug.id, selectedBug.buggyCode, activeLang);
  const currentBugCode = bugCodeByKey[bugKey] ?? starterBugCode;

  // Exam active state
  const passedExamIds = progress.passedExamModuleIds ?? [];
  const examKey = `${selectedExam.moduleId}::${activeLang}`;
  const starterExamCode = selectedExam.starterCodeByLanguage[activeLang];
  const currentExamCode = examCodeByKey[examKey] ?? starterExamCode;
  const currentExamSubmission = examResultByKey[examKey];
  const isCurrentExamApproved = passedExamIds.includes(selectedExam.moduleId);

  // Projects active state
  const completedProjects = progress.completedProjects ?? [];
  const allProjects = useMemo(
    () => [...BUILTIN_MINI_PROJECTS, ...customProjects],
    [customProjects]
  );
  const activeProject =
    allProjects.find((p) => p.id === selectedProjectId) ?? BUILTIN_MINI_PROJECTS[0];
  const safeStepIndex = Math.min(activeStepIndex, Math.max(0, activeProject.steps.length - 1));
  const activeStep = activeProject.steps[safeStepIndex];
  const projectSessionKey = `${activeProject.id}::${activeLang}`;
  const solvedStepNumbers = solvedStepsByProject[projectSessionKey] ?? [];
  const stepCodeKey = `${activeProject.id}::s${activeStep.stepNumber}::${activeLang}`;
  const starterStepCode = getProjectStepStarterCode(activeStep, activeLang);
  const currentStepCode = projectCodeByKey[stepCodeKey] ?? starterStepCode;
  const isProjectInPortfolio = completedProjects.some((p) => p.id === activeProject.id);

  const briefVisibilityClass =
    mobilePane === 'brief' ? 'block' : forceMobile ? 'hidden' : 'hidden lg:block';
  const ideVisibilityClass =
    mobilePane === 'editor' || mobilePane === 'output'
      ? 'block'
      : forceMobile
        ? 'hidden'
        : 'hidden lg:block';

  const handleSwitchMode = (nextMode: 'bugs' | 'forge' | 'exam' | 'projects') => {
    setMode(nextMode);
    setMobilePane('brief');
  };

  const handleGenerateChallenge = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const challenge = await generateAdaptiveChallenge({
        topic,
        difficulty,
        careerTrack: profile.careerTrack,
        programmingLanguage: activeLang,
      });
      setAiChallenge(challenge);
      setAiCode(challenge.codigoInicial);
      setAiSolvedId(null);
      setMobilePane('brief');
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Erro ao gerar desafio com a I.A.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateCustomProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = ideaInput.trim();
    if (cleaned.length < 4 || generatingProject) return;

    setGeneratingProject(true);
    setProjectGenError(null);
    try {
      const project = await generateCustomMiniProject({
        idea: cleaned,
        careerTrack: profile.careerTrack,
        programmingLanguage: activeLang,
      });
      setCustomProjects((prev) => [project, ...prev]);
      setSelectedProjectId(project.id);
      setActiveStepIndex(0);
      setIdeaInput('');
      setMobilePane('brief');
    } catch (err) {
      setProjectGenError(
        err instanceof Error ? err.message : 'Não foi possível criar o projeto com a I.A.'
      );
    } finally {
      setGeneratingProject(false);
    }
  };

  const handleProjectStepPassed = () => {
    const stepNum = activeStep.stepNumber;
    setSolvedStepsByProject((prev) => {
      const existing = prev[projectSessionKey] ?? [];
      if (existing.includes(stepNum)) return prev;
      return {
        ...prev,
        [projectSessionKey]: [...existing, stepNum].sort((a, b) => a - b),
      };
    });

    if (stepNum === 3) {
      const combinedCode = assembleProjectCode(activeProject, activeLang, projectCodeByKey, {
        stepNumber: 3,
        code: currentStepCode,
      });
      onProjectCompleted(
        {
          id: activeProject.id,
          title: activeProject.title,
          language: activeLang,
          summary: activeProject.summary,
          code: combinedCode,
          completedAt: new Date().toISOString(),
        },
        activeProject.xpReward
      );
    }
  };

  const handleSyncProjectToPortfolio = () => {
    const combinedCode = assembleProjectCode(activeProject, activeLang, projectCodeByKey);
    onProjectCompleted(
      {
        id: activeProject.id,
        title: activeProject.title,
        language: activeLang,
        summary: activeProject.summary,
        code: combinedCode,
        completedAt: new Date().toISOString(),
      },
      activeProject.xpReward
    );
  };

  const renderMobilePaneBar = (briefLabel: string) => (
    <div
      className={`${
        forceMobile ? 'grid' : 'grid lg:hidden'
      } grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#111827] border border-white/[0.08] sticky top-[3.75rem] z-30 shadow-lg`}
      role="tablist"
      aria-label="Seções do desafio no celular"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mobilePane === 'brief'}
        onClick={() => setMobilePane('brief')}
        className={`inline-flex items-center justify-center gap-1.5 min-h-[42px] px-2 rounded-lg text-xs font-semibold transition-colors ${
          mobilePane === 'brief'
            ? 'bg-cyan-400 text-[#0B0F19]'
            : 'text-slate-300 hover:text-white'
        }`}
      >
        <BookOpen className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{briefLabel}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mobilePane === 'editor'}
        onClick={() => setMobilePane('editor')}
        className={`inline-flex items-center justify-center gap-1.5 min-h-[42px] px-2 rounded-lg text-xs font-semibold transition-colors ${
          mobilePane === 'editor'
            ? 'bg-emerald-400 text-[#0B0F19]'
            : 'text-slate-300 hover:text-white'
        }`}
      >
        <Code2 className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Editor</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mobilePane === 'output'}
        onClick={() => setMobilePane('output')}
        className={`inline-flex items-center justify-center gap-1.5 min-h-[42px] px-2 rounded-lg text-xs font-semibold transition-colors ${
          mobilePane === 'output'
            ? 'bg-purple-400 text-[#0B0F19]'
            : 'text-slate-300 hover:text-white'
        }`}
      >
        <Terminal className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Console / I.A.</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header & Mode Switcher */}
      <div className={`flex flex-col ${forceMobile ? '' : 'lg:flex-row lg:items-end'} justify-between gap-4`}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Arena de Prática & Projetos</h1>
          <p className="text-sm text-slate-400 mt-1">
            Pratique em{' '}
            <strong className={langMeta.accentTextClass}>
              {langMeta.name} ({langMeta.extension})
            </strong>{' '}
            com depuração real, desafios com I.A., simulado de prova sem ajuda e mini-projetos de portfólio.
          </p>
        </div>

        <div className="overflow-x-auto max-w-full pb-1 -mb-1">
          <div className="inline-flex items-center p-1 rounded-xl bg-[#111827] border border-white/[0.08] gap-1">
            <button
              type="button"
              onClick={() => handleSwitchMode('bugs')}
              className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                mode === 'bugs'
                  ? 'bg-cyan-400 text-[#0B0F19]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Bug className="w-3.5 h-3.5 shrink-0" />
              Caça aos Bugs ({progress.completedDebugIds.length}/{DEBUG_CHALLENGES.length})
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('forge')}
              className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                mode === 'forge'
                  ? 'bg-purple-400 text-[#0B0F19]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Forja com I.A.
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('exam')}
              className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                mode === 'exam'
                  ? 'bg-amber-400 text-[#0B0F19]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
              Simulado de Prova ({passedExamIds.length}/{MODULE_EXAMS.length})
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('projects')}
              className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                mode === 'projects'
                  ? 'bg-emerald-400 text-[#0B0F19]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 shrink-0" />
              Oficina de Projetos ({completedProjects.length})
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: CAÇA AOS BUGS */}
      {mode === 'bugs' && (
        <div className="space-y-4">
          {renderMobilePaneBar('Bugs / Guia')}

          <div className={`grid grid-cols-1 ${forceMobile ? '' : 'lg:grid-cols-12'} gap-6 items-start`}>
            {/* Bug List */}
            <div className={`${forceMobile ? '' : 'lg:col-span-4'} space-y-3 ${briefVisibilityClass}`}>
              {DEBUG_CHALLENGES.map((bug) => {
                const isSelected = bug.id === selectedBug.id;
                const isSolved = progress.completedDebugIds.includes(bug.id);
                return (
                  <button
                    key={bug.id}
                    type="button"
                    onClick={() => setSelectedBug(bug)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors space-y-1.5 ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-400/60'
                        : 'bg-[#111827] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-400">
                        {bug.category} · {bug.difficulty}
                      </span>
                      {isSolved ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Corrigido
                        </span>
                      ) : (
                        <span className="font-mono text-purple-300 tabular-nums">+{bug.xpReward} XP</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white">{bug.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{bug.symptom}</p>
                  </button>
                );
              })}

              {/* Mobile quick brief + jump to editor */}
              <div className={`${forceMobile ? 'block' : 'block lg:hidden'} p-5 rounded-2xl bg-[#111827] border border-cyan-500/25 space-y-3`}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span className="text-amber-300 font-medium">Relatório · {selectedBug.category}</span>
                  <span>{selectedBug.academicConcept}</span>
                </div>
                <h2 className="text-lg font-bold text-white">{selectedBug.title}</h2>
                <p className="text-sm text-slate-200 leading-relaxed">{selectedBug.symptom}</p>
                <button
                  type="button"
                  onClick={() => setMobilePane('editor')}
                  className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 text-sm font-semibold text-[#0B0F19] bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors"
                >
                  <Code2 className="w-4 h-4" />
                  Abrir Editor de Código
                </button>
              </div>
            </div>

            {/* Active Debug IDE */}
            <div className={`${forceMobile ? '' : 'lg:col-span-8'} space-y-4 ${ideVisibilityClass}`}>
              <div className={`${forceMobile ? 'hidden' : 'hidden lg:block'} p-5 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-2`}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span className="text-amber-300 font-medium">Relatório de Bug · {selectedBug.category}</span>
                  <span>Conceito: {selectedBug.academicConcept}</span>
                </div>
                <h2 className="text-xl font-bold text-white">{selectedBug.title}</h2>
                <p className="text-sm text-slate-200 leading-relaxed">{selectedBug.symptom}</p>
              </div>

              <CodeEditorPanel
                key={bugKey}
                challengeTitle={`Depuração: ${selectedBug.title}`}
                challengePrompt={`${selectedBug.symptom}\nConceito técnico: ${selectedBug.academicConcept}`}
                functionName={selectedBug.functionName}
                starterCode={starterBugCode}
                code={currentBugCode}
                onCodeChange={(next) =>
                  setBugCodeByKey((prev) => ({ ...prev, [bugKey]: next }))
                }
                testCases={selectedBug.testCases}
                careerTrack={profile.careerTrack}
                programmingLanguage={activeLang}
                studentName={profile.name}
                mobileSection={mobilePane === 'output' ? 'output' : 'editor'}
                forceMobile={forceMobile}
                onRequestMobileOutputTab={() => setMobilePane('output')}
                onAllTestsPassed={() =>
                  onDebugCompleted(selectedBug.id, selectedBug.xpReward, selectedBug.title)
                }
                onHintUsed={onHintUsed}
                onReviewReceived={onReviewReceived}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: FORJA COM I.A. */}
      {mode === 'forge' && (
        <div className="space-y-5">
          {/* Generator Controls */}
          <div className={`p-5 sm:p-6 rounded-2xl bg-[#111827] border border-white/[0.08] grid grid-cols-1 ${forceMobile ? '' : 'md:grid-cols-12'} gap-4 items-end`}>
            <div className={`${forceMobile ? '' : 'md:col-span-5'} space-y-1.5`}>
              <label htmlFor="forge-topic" className="block text-xs font-medium text-slate-300">
                Tema do desafio
              </label>
              <select
                id="forge-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-base sm:text-sm text-white focus:outline-none focus:border-purple-400"
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${forceMobile ? '' : 'md:col-span-4'} space-y-1.5`}>
              <label htmlFor="forge-diff" className="block text-xs font-medium text-slate-300">
                Nível de exigência
              </label>
              <select
                id="forge-diff"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as 'iniciante' | 'intermediario' | 'universitario')
                }
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-base sm:text-sm text-white focus:outline-none focus:border-purple-400"
              >
                <option value="iniciante">Iniciante (Fundamentos sólidos)</option>
                <option value="intermediario">Intermediário (Lógica + casos extremos)</option>
                <option value="universitario">Universitário (Estruturas & eficiência)</option>
              </select>
            </div>

            <div className={forceMobile ? '' : 'md:col-span-3'}>
              <button
                type="button"
                disabled={generating}
                onClick={handleGenerateChallenge}
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0B0F19] bg-purple-400 hover:bg-purple-300 disabled:opacity-50 rounded-xl transition-colors whitespace-nowrap"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {generating ? 'Forjando desafio...' : 'Gerar novo desafio'}
              </button>
            </div>
          </div>

          {genError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-sm text-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-300">Não foi possível forjar o desafio</p>
                <p className="text-xs text-rose-200/80 mt-0.5">{genError}</p>
              </div>
            </div>
          )}

          {!aiChallenge && !generating && (
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111827]/70 border border-white/[0.07] text-center space-y-2 max-w-2xl mx-auto">
              <h2 className="text-lg font-bold text-white">Pronto para um desafio inédito?</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                O Professor Doutor I.A. cria um enunciado original contextualizado na sua trilha com 4 casos de teste reais (incluindo casos extremos) executados na hora pela IDE.
              </p>
            </div>
          )}

          {aiChallenge && (
            <div className="space-y-4">
              {renderMobilePaneBar('Enunciado')}

              <div className={`grid grid-cols-1 ${forceMobile ? '' : 'lg:grid-cols-12'} gap-6 items-start`}>
                <div className={`${forceMobile ? '' : 'lg:col-span-5'} p-5 sm:p-6 rounded-2xl bg-[#111827] border border-purple-500/25 space-y-4 ${briefVisibilityClass}`}>
                  <div className="flex items-center justify-between gap-2 text-xs text-purple-300 font-medium">
                    <span>Desafio inédito da Forja I.A.</span>
                    <span className="font-mono tabular-nums">+{aiChallenge.xpRecompensa} XP</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{aiChallenge.titulo}</h2>
                  <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                    {aiChallenge.descricao}
                  </p>
                  <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-white/[0.06] space-y-1">
                    <p className="text-xs font-semibold text-cyan-300">Conexão universitária</p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {aiChallenge.contextoUniversitario}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-white/[0.06] space-y-1">
                    <p className="text-xs font-semibold text-amber-300">Ponto de atenção</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{aiChallenge.dicaInicial}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobilePane('editor')}
                    className={`${
                      forceMobile ? 'inline-flex' : 'inline-flex lg:hidden'
                    } w-full items-center justify-center gap-2 min-h-[48px] px-4 py-3 text-sm font-semibold text-[#0B0F19] bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors`}
                  >
                    <Code2 className="w-4 h-4" />
                    Abrir Editor de Código
                  </button>
                </div>

                <div className={`${forceMobile ? '' : 'lg:col-span-7'} ${ideVisibilityClass}`}>
                  <CodeEditorPanel
                    key={`${aiChallenge.id}-${activeLang}`}
                    challengeTitle={aiChallenge.titulo}
                    challengePrompt={aiChallenge.descricao}
                    functionName={aiChallenge.funcaoAlvo}
                    starterCode={aiChallenge.codigoInicial}
                    code={aiCode}
                    onCodeChange={setAiCode}
                    testCases={aiChallenge.testes}
                    careerTrack={profile.careerTrack}
                    programmingLanguage={activeLang}
                    studentName={profile.name}
                    mobileSection={mobilePane === 'output' ? 'output' : 'editor'}
                    forceMobile={forceMobile}
                    onRequestMobileOutputTab={() => setMobilePane('output')}
                    onAllTestsPassed={() => {
                      if (aiSolvedId !== aiChallenge.id) {
                        setAiSolvedId(aiChallenge.id);
                        onAiChallengeCompleted(aiChallenge.xpRecompensa, aiChallenge.titulo);
                      }
                    }}
                    onHintUsed={onHintUsed}
                    onReviewReceived={onReviewReceived}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: SIMULADO DE PROVA (SEM AJUDA DA I.A.) */}
      {mode === 'exam' && (
        <div className="space-y-4">
          {renderMobilePaneBar('Prova / Guia')}

          <div className={`grid grid-cols-1 ${forceMobile ? '' : 'lg:grid-cols-12'} gap-6 items-start`}>
            {/* Module Exam Selector */}
            <div className={`${forceMobile ? '' : 'lg:col-span-4'} space-y-3 ${briefVisibilityClass}`}>
              <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-400/25 space-y-1">
                <p className="text-xs font-semibold text-amber-300">
                  Avaliação prática de autonomia
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Simule uma prova real de faculdade: sem dicas durante o código, com cronômetro ativo. Ao entregar a prova, o Code Review da I.A. é liberado.
                </p>
              </div>

              {MODULE_EXAMS.map((exam) => {
                const isSelected = exam.moduleId === selectedExam.moduleId;
                const isApproved = passedExamIds.includes(exam.moduleId);
                return (
                  <button
                    key={exam.moduleId}
                    type="button"
                    onClick={() => setSelectedExam(exam)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors space-y-1.5 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400/60'
                        : 'bg-[#111827] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono text-slate-400">Módulo {exam.moduleNumber}</span>
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Aprovado em Prova
                        </span>
                      ) : (
                        <span className="font-mono text-amber-300 tabular-nums">+{exam.xpReward} XP</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white">{exam.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{exam.moduleTitle}</p>
                  </button>
                );
              })}

              {/* Mobile Specification Preview + Jump to Editor */}
              <div className={`${forceMobile ? 'block' : 'block lg:hidden'} p-5 rounded-2xl bg-[#111827] border border-amber-400/25 space-y-3`}>
                <span className="text-xs font-semibold text-amber-300">
                  {selectedExam.universityTag}
                </span>
                <h2 className="text-lg font-bold text-white">{selectedExam.title}</h2>
                <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                  {selectedExam.prompt}
                </p>
                <div className="p-3 rounded-xl bg-[#0B0F19] border border-white/[0.06] space-y-1">
                  <p className="text-xs font-semibold text-slate-300">Critérios cobrados:</p>
                  <ul className="space-y-1 text-xs text-slate-400 list-disc pl-4">
                    {selectedExam.edgeCasesToWatch.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => setMobilePane('editor')}
                  className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 text-sm font-semibold text-[#0B0F19] bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors"
                >
                  <Code2 className="w-4 h-4" />
                  Iniciar Prova no Editor
                </button>
              </div>
            </div>

            {/* Active Exam Specification + Exam Mode IDE */}
            <div className={`${forceMobile ? '' : 'lg:col-span-8'} space-y-4 ${ideVisibilityClass}`}>
              <div className={`${forceMobile ? 'hidden' : 'hidden lg:block'} p-5 sm:p-6 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-3.5`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-amber-300">
                    {selectedExam.universityTag} · {selectedExam.moduleTitle}
                  </span>
                  {isCurrentExamApproved ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Aprovado em Prova
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-amber-300 tabular-nums">
                      Bônus de aprovação: +{selectedExam.xpReward} XP
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-white">{selectedExam.title}</h2>
                <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                  {selectedExam.prompt}
                </p>

                <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-white/[0.06] space-y-1.5">
                  <p className="text-xs font-semibold text-slate-300">
                    Critérios cobrados na banca avaliadora:
                  </p>
                  <ul className="space-y-1 text-xs text-slate-400 list-disc pl-4">
                    {selectedExam.edgeCasesToWatch.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                {currentExamSubmission && (
                  <div
                    className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
                      currentExamSubmission.passedAll
                        ? 'bg-emerald-500/10 border-emerald-400/35 text-emerald-200'
                        : 'bg-amber-500/10 border-amber-400/35 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      {currentExamSubmission.passedAll ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          Prova aprovada com 100% dos testes! Selo registrado no Mapa da Trilha e Code Review liberado.
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          Prova entregue para análise. Você pode pedir Code Review abaixo ou continuar ajustando para aprovação.
                        </>
                      )}
                    </div>
                    <span className="font-mono tabular-nums text-slate-200">
                      Tempo: {formatDuration(currentExamSubmission.elapsedSeconds)}
                    </span>
                  </div>
                )}
              </div>

              <CodeEditorPanel
                key={`exam-${selectedExam.moduleId}-${activeLang}`}
                challengeTitle={`Simulado de Prova — ${selectedExam.title}`}
                challengePrompt={selectedExam.prompt}
                functionName={selectedExam.functionName}
                starterCode={starterExamCode}
                code={currentExamCode}
                onCodeChange={(next) =>
                  setExamCodeByKey((prev) => ({ ...prev, [examKey]: next }))
                }
                testCases={selectedExam.testCases}
                careerTrack={profile.careerTrack}
                programmingLanguage={activeLang}
                studentName={profile.name}
                examMode={true}
                mobileSection={mobilePane === 'output' ? 'output' : 'editor'}
                forceMobile={forceMobile}
                onRequestMobileOutputTab={() => setMobilePane('output')}
                onAllTestsPassed={() =>
                  onExamPassed(selectedExam.moduleId, selectedExam.xpReward, selectedExam.moduleTitle)
                }
                onExamSubmitted={(passedAll, elapsedSeconds) =>
                  setExamResultByKey((prev) => ({
                    ...prev,
                    [examKey]: { passedAll, elapsedSeconds },
                  }))
                }
                onHintUsed={onHintUsed}
                onReviewReceived={onReviewReceived}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: OFICINA DE MINI-PROJETOS */}
      {mode === 'projects' && (
        <div className="space-y-5">
          {renderMobilePaneBar('Projeto / Guia')}

          {/* Blueprint & Selector (shown in 'brief' on mobile, always on desktop) */}
          <div className={`space-y-5 ${briefVisibilityClass}`}>
            {/* Custom Project Generator + Built-in Project Cards */}
            <div className={`grid grid-cols-1 ${forceMobile ? '' : 'lg:grid-cols-12'} gap-4 items-stretch`}>
              {/* Project Cards */}
              <div className={`${forceMobile ? '' : 'lg:col-span-8 sm:grid-cols-3'} grid grid-cols-1 gap-3`}>
                {allProjects.map((proj) => {
                  const isSelected = proj.id === activeProject.id;
                  const isDone = completedProjects.some((p) => p.id === proj.id);
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(proj.id);
                        setActiveStepIndex(0);
                      }}
                      className={`text-left p-4 rounded-xl border transition-colors flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-400/60'
                          : 'bg-[#111827] border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className={proj.isCustomAi ? 'text-purple-300 font-medium' : 'text-slate-400'}>
                            {proj.isCustomAi ? 'Projeto Autoral I.A.' : 'Projeto Guiado'}
                          </span>
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              No Portfólio
                            </span>
                          ) : (
                            <span className="font-mono text-emerald-300 tabular-nums">
                              +{proj.xpReward} XP
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-white leading-snug">{proj.title}</p>
                        <p className="text-xs text-slate-400 line-clamp-2">{proj.summary}</p>
                      </div>
                      <span className="text-[11px] font-medium text-cyan-300">
                        3 etapas com testes reais
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Create Your Own Idea Form */}
              <form
                onSubmit={handleGenerateCustomProject}
                className={`${forceMobile ? '' : 'lg:col-span-4'} p-4 rounded-xl bg-[#111827] border border-purple-500/25 flex flex-col justify-between gap-3`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                    <Wand2 className="w-3.5 h-3.5" />
                    Criar projeto com sua própria ideia
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Descreva o que quer construir e a I.A. monta um Blueprint + 3 etapas testáveis em {langMeta.name}.
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={ideaInput}
                    onChange={(e) => {
                      setIdeaInput(e.target.value);
                      setProjectGenError(null);
                    }}
                    placeholder="Ex: Simulador de fila ou placar de torneio"
                    className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#0B0F19] border border-white/10 text-base sm:text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                  />
                  {projectGenError && (
                    <p className="text-[11px] text-rose-400 leading-snug">{projectGenError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={generatingProject || ideaInput.trim().length < 4}
                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B0F19] bg-purple-400 hover:bg-purple-300 disabled:opacity-45 rounded-lg transition-colors"
                  >
                    {generatingProject ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {generatingProject ? 'Projetando 3 etapas...' : 'Gerar Projeto com I.A.'}
                  </button>
                </div>
              </form>
            </div>

            {/* Blueprint Card (Entrada -> Regras -> Saída) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
                    <Layers className="w-3.5 h-3.5" />
                    Blueprint Arquitetural · {activeProject.tagline}
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">{activeProject.title}</h2>
                  <p className="text-sm text-slate-300 mt-1">{activeProject.summary}</p>
                </div>

                {isProjectInPortfolio && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/12 border border-emerald-400/35 text-xs font-semibold text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Salvo no Portfólio
                    </span>
                    <button
                      type="button"
                      onClick={handleSyncProjectToPortfolio}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/25 transition-colors"
                    >
                      Atualizar código salvo
                    </button>
                  </div>
                )}
              </div>

              <div className={`grid grid-cols-1 ${forceMobile ? '' : 'md:grid-cols-3'} gap-3`}>
                <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-cyan-500/20 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                    1. Entrada
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeProject.blueprint.entrada}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-purple-500/20 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-300">
                    2. Regras
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeProject.blueprint.regras}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-emerald-500/20 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                    3. Saída
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeProject.blueprint.saida}
                  </p>
                </div>
              </div>

              {/* 3-Step Interactive Stepper */}
              <div className={`grid grid-cols-1 ${forceMobile ? '' : 'sm:grid-cols-3'} gap-2.5 pt-2 border-t border-white/[0.06]`}>
                {activeProject.steps.map((step, idx) => {
                  const isCurrent = idx === safeStepIndex;
                  const isStepSolved = solvedStepNumbers.includes(step.stepNumber);
                  return (
                    <button
                      key={`${activeProject.id}-step-${step.stepNumber}`}
                      type="button"
                      onClick={() => setActiveStepIndex(idx)}
                      className={`text-left p-3 rounded-xl border transition-colors flex items-start gap-2.5 ${
                        isCurrent
                          ? 'bg-cyan-500/12 border-cyan-400/60'
                          : isStepSolved
                          ? 'bg-emerald-500/8 border-emerald-400/30 hover:border-emerald-400/50'
                          : 'bg-[#0B0F19] border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          isStepSolved
                            ? 'bg-emerald-400 text-[#0B0F19]'
                            : isCurrent
                            ? 'bg-cyan-400 text-[#0B0F19]'
                            : 'bg-white/[0.06] text-slate-400'
                        }`}
                      >
                        {isStepSolved ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.stepNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          Etapa {step.stepNumber}: {step.title}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {step.objective}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Step Instructions + IDE */}
          <div className={`grid grid-cols-1 ${forceMobile ? '' : 'lg:grid-cols-12'} gap-6 items-start`}>
            <div className={`${forceMobile ? '' : 'lg:col-span-5'} p-5 sm:p-6 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-4 ${briefVisibilityClass}`}>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-cyan-300">
                  Etapa {activeStep.stepNumber} de {activeProject.steps.length}
                </span>
                <span className="font-mono text-slate-400 truncate">
                  Função: {activeStep.functionName}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">{activeStep.title}</h3>
              <p className="text-xs text-slate-400">{activeStep.objective}</p>
              <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                {activeStep.prompt}
              </p>

              <button
                type="button"
                onClick={() => setMobilePane('editor')}
                className={`${
                  forceMobile ? 'inline-flex' : 'inline-flex lg:hidden'
                } w-full items-center justify-center gap-2 min-h-[48px] px-4 py-3 text-sm font-semibold text-[#0B0F19] bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors`}
              >
                <Code2 className="w-4 h-4" />
                Programar Etapa {activeStep.stepNumber}
              </button>

              {solvedStepNumbers.includes(activeStep.stepNumber) && activeStep.stepNumber < 3 && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-400/35 flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-emerald-200">
                    Etapa {activeStep.stepNumber} aprovada! Siga para a próxima parte do projeto.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveStepIndex(safeStepIndex + 1)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0B0F19] bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Etapa {activeStep.stepNumber + 1}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {solvedStepNumbers.includes(3) && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <FolderGit2 className="w-4 h-4" />
                    Mini-projeto concluído e salvo no seu Portfólio!
                  </div>
                  <p className="text-xs text-emerald-100/85 leading-relaxed">
                    O código completo das 3 etapas já está disponível na seção <strong>Portfólio de Projetos</strong> da aba <strong>Perfil</strong> para você visualizar ou copiar.
                  </p>
                </div>
              )}
            </div>

            <div className={`${forceMobile ? '' : 'lg:col-span-7'} ${ideVisibilityClass}`}>
              <CodeEditorPanel
                key={stepCodeKey}
                challengeTitle={`${activeProject.title} — Etapa ${activeStep.stepNumber}: ${activeStep.title}`}
                challengePrompt={`${activeStep.prompt}\n\nContexto do projeto: ${activeProject.summary}`}
                functionName={activeStep.functionName}
                starterCode={starterStepCode}
                code={currentStepCode}
                onCodeChange={(next) =>
                  setProjectCodeByKey((prev) => ({ ...prev, [stepCodeKey]: next }))
                }
                testCases={activeStep.testCases}
                careerTrack={profile.careerTrack}
                programmingLanguage={activeLang}
                studentName={profile.name}
                mobileSection={mobilePane === 'output' ? 'output' : 'editor'}
                forceMobile={forceMobile}
                onRequestMobileOutputTab={() => setMobilePane('output')}
                onAllTestsPassed={handleProjectStepPassed}
                onHintUsed={onHintUsed}
                onReviewReceived={onReviewReceived}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
