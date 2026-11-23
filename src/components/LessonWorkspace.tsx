import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Eye,
  EyeOff,
  Lightbulb,
  Pause,
  Play,
  Square,
  Terminal,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { ALL_LESSONS } from '../data/curriculum';
import { getLanguageMeta } from '../data/languages';
import { getLessonStarterCode } from '../data/languageTemplates';
import { getTrackMeta } from '../data/tracks';
import { getSavedLessonCode } from '../hooks/useCodeForgeStore';
import { Lesson, ProgrammingLanguage, StudentProfile, StudentProgress } from '../types';
import { buildLessonVoiceScript, stopSpeech, useVoiceProfessor } from '../utils/voiceProfessor';
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
  const [showSimilarExample, setShowSimilarExample] = useState(false);
  const [mobilePane, setMobilePane] = useState<'theory' | 'editor' | 'output'>('theory');

  const voice = useVoiceProfessor({ stopOnUnmount: true });
  const lessonVoiceSourceId = `lesson-script-${lesson.id}`;
  const isLessonVoiceActive =
    voice.isSpeaking && voice.activeSourceId === lessonVoiceSourceId;

  const lessonVoiceScript = useMemo(
    () =>
      buildLessonVoiceScript({
        lesson,
        studentName: profile.name,
        languageName: langMeta.name,
      }),
    [lesson, profile.name, langMeta.name]
  );

  useEffect(() => {
    stopSpeech();
    const nextStarter = getLessonStarterCode(lesson.id, lesson.challenge.starterCode, activeLang);
    const nextSaved = getSavedLessonCode(progress.savedCodeByLesson, lesson.id, activeLang);
    setCode(nextSaved ?? nextStarter);
    setSelectedQuizOption(null);
    setJustSolved(false);
    setShowSimilarExample(false);
    setMobilePane('theory');
  }, [lesson.id, activeLang]);

  const handleToggleLessonAudio = () => {
    if (!voice.isSupported) return;
    if (isLessonVoiceActive) {
      if (voice.isPaused) {
        voice.resume();
      } else {
        voice.pause();
      }
      return;
    }
    voice.speak(lessonVoiceScript, lessonVoiceSourceId);
  };

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
          {lesson.difficultyTag && (
            <>
              <span aria-hidden="true">·</span>
              <span
                className={
                  lesson.difficultyTag === 'Bem fácil' || lesson.difficultyTag === 'Fácil'
                    ? 'text-emerald-300 font-medium'
                    : lesson.difficultyTag === 'Fácil → Médio' || lesson.difficultyTag === 'Médio'
                      ? 'text-amber-300 font-medium'
                      : 'text-purple-300 font-medium'
                }
              >
                {lesson.difficultyTag}
              </span>
            </>
          )}
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

      {/* Professor em Áudio — Compact Voice Companion Bar */}
      <section
        aria-label="Professor em Áudio"
        className="p-3.5 sm:p-4 rounded-2xl bg-[#111827] border border-cyan-500/20 flex flex-col gap-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                voice.isSpeaking && !voice.isPaused
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                  : 'bg-[#0B0F19] border-white/10 text-cyan-300'
              }`}
            >
              {voice.isSpeaking && !voice.isPaused ? (
                <div className="flex items-end gap-0.5 h-4" aria-hidden="true">
                  <span className="w-1 h-2 bg-cyan-300 rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-emerald-300 rounded-full animate-pulse" />
                  <span className="w-1 h-3 bg-cyan-300 rounded-full animate-pulse" />
                </div>
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <p className="text-sm font-semibold text-white">Professor em Áudio</p>
                {voice.isSpeaking && (
                  <span className="text-[11px] font-medium text-cyan-300">
                    {voice.isPaused ? '· Pausado' : '· Falando agora...'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">
                {voice.isSupported
                  ? 'Ouça a explicação da aula e o passo a passo inicial em português.'
                  : 'Áudio por voz não disponível neste navegador.'}
              </p>
            </div>
          </div>

          {voice.isSupported && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleLessonAudio}
                className={`inline-flex items-center justify-center gap-2 min-h-[42px] sm:min-h-[38px] px-4 py-2 text-xs font-semibold rounded-xl sm:rounded-lg transition-colors whitespace-nowrap ${
                  isLessonVoiceActive && !voice.isPaused
                    ? 'bg-amber-400 hover:bg-amber-300 text-[#0B0F19]'
                    : 'bg-cyan-400 hover:bg-cyan-300 text-[#0B0F19]'
                } ${forceMobile ? 'flex-1' : 'flex-1 sm:flex-none'}`}
              >
                {isLessonVoiceActive && !voice.isPaused ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current shrink-0" />
                    Pausar áudio
                  </>
                ) : isLessonVoiceActive && voice.isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                    Continuar aula
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 shrink-0" />
                    Ouvir explicação da aula
                  </>
                )}
              </button>

              {voice.isSpeaking && (
                <button
                  type="button"
                  onClick={voice.stop}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[42px] sm:min-h-[38px] px-3 py-2 text-xs font-semibold text-rose-200 bg-rose-500/12 hover:bg-rose-500/20 border border-rose-400/30 rounded-xl sm:rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Square className="w-3 h-3 fill-current" />
                  Parar
                </button>
              )}
            </div>
          )}
        </div>

        {voice.isSupported && (
          <div className="pt-2.5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Speed Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 mr-1">Velocidade:</span>
              {(
                [
                  { value: 0.9, label: '0.9x' },
                  { value: 1, label: '1x' },
                  { value: 1.15, label: '1.15x' },
                ] as const
              ).map((opt) => {
                const active = Math.abs(voice.rate - opt.value) < 0.03;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => voice.setRate(opt.value)}
                    className={`min-h-[32px] px-2.5 py-1 rounded-lg font-mono text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                        : 'bg-[#0B0F19] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Auto-Speak Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={voice.autoSpeak}
              onClick={() => voice.setAutoSpeak(!voice.autoSpeak)}
              className={`inline-flex items-center gap-2 min-h-[34px] px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                voice.autoSpeak
                  ? 'bg-emerald-500/15 border-emerald-400/45 text-emerald-200'
                  : 'bg-[#0B0F19] border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              {voice.autoSpeak ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span>Acompanhar automaticamente com voz</span>
              <span
                className={`font-mono text-[11px] font-semibold ${
                  voice.autoSpeak ? 'text-emerald-300' : 'text-slate-500'
                }`}
              >
                {voice.autoSpeak ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        )}
      </section>

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
              <p className="text-xs font-semibold text-amber-300">Casos especiais para conferir:</p>
              <ul className="space-y-1 text-xs text-slate-300">
                {lesson.challenge.edgeCasesToWatch.map((edge, idx) => (
                  <li key={idx}>• {edge}</li>
                ))}
              </ul>
            </div>

            {lesson.similarExample && (
              <div className="pt-3 border-t border-white/[0.06] space-y-3">
                <button
                  type="button"
                  onClick={() => setShowSimilarExample((v) => !v)}
                  className={`w-full inline-flex items-center justify-center gap-2 min-h-[42px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    showSimilarExample
                      ? 'text-amber-100 bg-amber-500/15 border-amber-400/45'
                      : 'text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-400/30'
                  }`}
                >
                  {showSimilarExample ? (
                    <EyeOff className="w-4 h-4 shrink-0" />
                  ) : (
                    <Eye className="w-4 h-4 shrink-0" />
                  )}
                  {showSimilarExample ? 'Ocultar exemplo parecido' : 'Ver exemplo parecido'}
                </button>

                {showSimilarExample && (
                  <div className="p-4 rounded-xl bg-[#0B0F19] border border-amber-400/25 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-amber-300">
                        <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                        {lesson.similarExample.title}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {langMeta.shortLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {lesson.similarExample.explanation}
                    </p>
                    <pre className="p-3 rounded-lg bg-[#090D16] border border-white/[0.07] font-mono text-xs text-emerald-200 overflow-x-auto leading-relaxed">
                      <code>
                        {lesson.similarExample.codeByLanguage[activeLang] ??
                          lesson.similarExample.codeByLanguage.javascript}
                      </code>
                    </pre>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Este é um problema parecido (não igual). Use a mesma lógica adaptando os nomes e regras para o desafio acima!
                    </p>
                  </div>
                )}
              </div>
            )}

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
            experienceLevel={profile.experienceLevel ?? profile.initialLevel}
            moduleId={lesson.moduleId}
            lessonOrder={lesson.order}
            progressiveHints={lesson.progressiveHints}
            progressiveHintTemplate={lesson.progressiveHintTemplateByLanguage?.[activeLang]}
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
