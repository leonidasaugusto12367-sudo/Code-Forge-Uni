import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Code2, Terminal, XCircle } from 'lucide-react';
import { ALL_LESSONS } from '../data/curriculum';
import { getLanguageMeta } from '../data/languages';
import { getLessonStarterCode } from '../data/languageTemplates';
import { getTrackMeta } from '../data/tracks';
import { getSavedLessonCode } from '../hooks/useCodeForgeStore';
import { Lesson, ProgrammingLanguage, StudentProfile, StudentProgress } from '../types';
import { CodeEditorPanel } from './CodeEditorPanel';

interface LessonWorkspaceProps {
  lesson: Lesson;
  profile: StudentProfile;
  progress: StudentProgress;
  forceMobile?: boolean;
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
  onSaveCode: (lessonId: string, code: string, language: ProgrammingLanguage) => void;
  onLessonCompleted: (lessonId: string, xpReward: number, title: string) => void;
  onHintUsed: () => void;
  onReviewReceived: () => void;
}

export function LessonWorkspace({
  lesson,
  profile,
  progress,
  forceMobile = false,
  onBack,
  onSelectLesson,
  onSaveCode,
  onLessonCompleted,
  onHintUsed,
  onReviewReceived,
}: LessonWorkspaceProps) {
  const activeLang = profile.programmingLanguage;
  const langMeta = getLanguageMeta(activeLang);
  const starterForLang = getLessonStarterCode(lesson.id, lesson.challenge.starterCode, activeLang);

  const savedCode =
    getSavedLessonCode(progress.savedCodeByLesson, lesson.id, activeLang) ?? starterForLang;
  const [code, setCode] = useState(savedCode);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [justSolved, setJustSolved] = useState(false);
  const [mobilePane, setMobilePane] = useState<'theory' | 'editor' | 'output'>('theory');

  useEffect(() => {
    const nextStarter = getLessonStarterCode(lesson.id, lesson.challenge.starterCode, activeLang);
    const nextSaved = getSavedLessonCode(progress.savedCodeByLesson, lesson.id, activeLang);
    setCode(nextSaved ?? nextStarter);
    setSelectedQuizOption(null);
    setJustSolved(false);
    setMobilePane('theory');
  }, [lesson.id, activeLang]);

  const handleCodeChange = (nextCode: string) => {
    setCode(nextCode);
    onSaveCode(lesson.id, nextCode, activeLang);
  };

  const trackMeta = getTrackMeta(profile.careerTrack);
  const isCompleted = progress.completedLessonIds.includes(lesson.id);
  const currentIndex = ALL_LESSONS.findIndex((l) => l.id === lesson.id);
  const nextLesson =
    currentIndex >= 0 && currentIndex < ALL_LESSONS.length - 1
      ? ALL_LESSONS[currentIndex + 1]
      : null;

  const theoryVisibilityClass =
    mobilePane === 'theory' ? 'block' : forceMobile ? 'hidden' : 'hidden lg:block';
  const ideVisibilityClass =
    mobilePane === 'editor' || mobilePane === 'output'
      ? 'block'
      : forceMobile
        ? 'hidden'
        : 'hidden lg:block';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 min-h-[40px] text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a Trilha
        </button>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 tabular-nums">
          <span className="text-cyan-300 font-medium">{lesson.universityTag}</span>
          <span aria-hidden="true">·</span>
          <span>
            Aula {lesson.order} de {ALL_LESSONS.length}
          </span>
          <span aria-hidden="true">·</span>
          <span>+{lesson.xpReward} XP</span>
          {isCompleted && (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Concluída
              </span>
            </>
          )}
        </div>
      </div>

      {/* Dedicated Mobile Lesson Sub-Tabs (< lg or Modo Celular) */}
      <div
        className={`${
          forceMobile ? 'grid' : 'grid lg:hidden'
        } grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#111827] border border-white/[0.08] sticky top-[3.75rem] z-30 shadow-lg`}
        role="tablist"
        aria-label="Seções da aula no celular"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mobilePane === 'theory'}
          onClick={() => setMobilePane('theory')}
          className={`inline-flex items-center justify-center gap-1.5 min-h-[42px] px-2 rounded-lg text-xs font-semibold transition-colors ${
            mobilePane === 'theory'
              ? 'bg-cyan-400 text-[#0B0F19]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Aula / Teoria</span>
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

      {/* Split Two-Zone Learning & IDE Workspace */}
      <div className={`grid grid-cols-1 ${forceMobile ? '' : 'lg:grid-cols-12'} gap-6 items-start`}>
        {/* Left Pedagogical Guide Pane */}
        <div className={`${forceMobile ? '' : 'lg:col-span-5'} space-y-5 ${theoryVisibilityClass}`}>
          <div className="bg-[#111827] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {lesson.title}
              </h1>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{lesson.summary}</p>
            </div>

            {/* Track-specific context */}
            <div className="p-4 rounded-xl bg-cyan-500/8 border border-cyan-400/20 space-y-1">
              <p className="text-xs font-semibold text-cyan-300">
                Aplicação na trilha {trackMeta.name}
              </p>
              <p className="text-sm text-slate-200 leading-relaxed">
                {lesson.trackContext[profile.careerTrack]}
              </p>
            </div>

            {/* Micro-theory blocks */}
            <div className="space-y-4">
              {lesson.theoryBlocks.map((block, idx) => (
                <div key={idx} className="space-y-2">
                  <h2 className="text-base font-semibold text-white">{block.heading}</h2>
                  <p className="text-sm text-slate-300 leading-relaxed">{block.body}</p>
                  {block.codeExample && (
                    <pre className="p-3.5 rounded-xl bg-[#090D16] border border-white/[0.07] font-mono text-xs text-cyan-200 overflow-x-auto leading-relaxed">
                      <code>{block.codeExample}</code>
                    </pre>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Concept Check Quiz */}
            <div className="pt-4 border-t border-white/[0.08] space-y-3">
              <p className="text-xs font-semibold text-purple-300">Verificação conceitual relâmpago</p>
              <p className="text-sm font-medium text-white leading-snug">
                {lesson.conceptQuiz.question}
              </p>

              <div className="space-y-2">
                {lesson.conceptQuiz.options.map((opt, idx) => {
                  const isPicked = selectedQuizOption === idx;
                  const isCorrect = idx === lesson.conceptQuiz.correctIndex;
                  const showState = selectedQuizOption !== null;

                  let style = 'bg-[#0B0F19] border-white/[0.08] text-slate-300 hover:border-white/20';
                  if (showState && isPicked && isCorrect) {
                    style = 'bg-emerald-500/12 border-emerald-400/60 text-emerald-100';
                  } else if (showState && isPicked && !isCorrect) {
                    style = 'bg-rose-500/12 border-rose-400/60 text-rose-100';
                  } else if (showState && isCorrect) {
                    style = 'bg-emerald-500/6 border-emerald-500/30 text-emerald-200';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedQuizOption(idx)}
                      className={`w-full text-left px-3.5 py-3 rounded-xl border text-xs sm:text-sm transition-colors flex items-start justify-between gap-2 ${style}`}
                    >
                      <span>{opt}</span>
                      {showState && isPicked && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {showState && isPicked && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedQuizOption !== null && (
                <p
                  className={`text-xs leading-relaxed p-3 rounded-lg ${
                    selectedQuizOption === lesson.conceptQuiz.correctIndex
                      ? 'bg-emerald-500/10 text-emerald-200'
                      : 'bg-amber-500/10 text-amber-200'
                  }`}
                >
                  {lesson.conceptQuiz.explanation}
                </p>
              )}
            </div>
          </div>

          {/* Challenge Specification Card */}
          <div className="bg-[#111827] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-white">Desafio prático na IDE</h2>
              <span className="text-xs font-mono text-cyan-300">{lesson.challenge.functionName}()</span>
            </div>
            <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
              {lesson.challenge.prompt}
            </p>

            <div className="pt-3 border-t border-white/[0.06] space-y-1.5">
              <p className="text-xs font-semibold text-amber-300">Casos extremos para validar:</p>
              <ul className="space-y-1 text-xs text-slate-300">
                {lesson.challenge.edgeCasesToWatch.map((edge, idx) => (
                  <li key={idx}>• {edge}</li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setMobilePane('editor')}
              className={`${
                forceMobile ? 'inline-flex' : 'inline-flex lg:hidden'
              } w-full items-center justify-center gap-2 min-h-[48px] px-4 py-3 text-sm font-semibold text-[#0B0F19] bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors`}
            >
              <Code2 className="w-4 h-4" />
              Ir para o Editor de Código
            </button>
          </div>
        </div>

        {/* Right Interactive IDE Pane */}
        <div className={`${forceMobile ? '' : 'lg:col-span-7'} space-y-4 ${ideVisibilityClass}`}>
          {activeLang !== 'javascript' && (
            <div className="px-4 py-2.5 rounded-xl bg-[#111827] border border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
              <span>
                IDE configurada para{' '}
                <strong className={langMeta.accentTextClass}>{langMeta.runtimeLabel}</strong>. Os conceitos da teoria valem para todas as linguagens.
              </span>
              <span className="font-mono text-slate-400">{langMeta.extension}</span>
            </div>
          )}

          <CodeEditorPanel
            key={`${lesson.id}-${activeLang}`}
            challengeTitle={lesson.title}
            challengePrompt={lesson.challenge.prompt}
            functionName={lesson.challenge.functionName}
            starterCode={starterForLang}
            code={code}
            onCodeChange={handleCodeChange}
            testCases={lesson.challenge.testCases}
            careerTrack={profile.careerTrack}
            programmingLanguage={activeLang}
            studentName={profile.name}
            mobileSection={mobilePane === 'output' ? 'output' : 'editor'}
            forceMobile={forceMobile}
            onRequestMobileOutputTab={() => setMobilePane('output')}
            onAllTestsPassed={() => {
              setJustSolved(true);
              onLessonCompleted(lesson.id, lesson.xpReward, lesson.title);
            }}
            onHintUsed={onHintUsed}
            onReviewReceived={onReviewReceived}
          />

          {(justSolved || isCompleted) && nextLesson && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-400/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-emerald-200">
                  Excelente trabalho, {profile.name}!
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Dica de ouro: experimente pedir um Code Review do Professor I.A. antes de avançar para &ldquo;{nextLesson.title}&rdquo;.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectLesson(nextLesson.id)}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[42px] w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-[#0B0F19] bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                Próxima aula
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
