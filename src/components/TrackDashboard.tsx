import { useState } from 'react';
import { ArrowRight, Award, CheckCircle2, Compass, Flame, LogOut, PlayCircle, ShieldCheck, Users } from 'lucide-react';
import heroCanvasImg from '../assets/images/codeforge_hero_canvas_1795049259385.jpg';
import { ALL_LESSONS, CURRICULUM_MODULES } from '../data/curriculum';
import { getLanguageMeta } from '../data/languages';
import { ACHIEVEMENTS, getRankForXp, getTrackMeta } from '../data/tracks';
import { Lesson, StudentProfile, StudentProgress } from '../types';

interface TrackDashboardProps {
  profile: StudentProfile;
  progress: StudentProgress;
  nextLesson?: Lesson | null;
  accountsCount: number;
  onSelectLesson: (lessonId: string) => void;
  onOpenExplorerQuiz: () => void;
  onOpenArena: () => void;
  onOpenAccountSwitcher: () => void;
  onLogout: () => void;
}

export function TrackDashboard({
  profile,
  progress,
  nextLesson,
  accountsCount,
  onSelectLesson,
  onOpenExplorerQuiz,
  onOpenArena,
  onOpenAccountSwitcher,
  onLogout,
}: TrackDashboardProps) {
  const [heroLoaded, setHeroLoaded] = useState(true);
  const trackMeta = getTrackMeta(profile.careerTrack);
  const langMeta = getLanguageMeta(profile.programmingLanguage);
  const rank = getRankForXp(progress.xp);

  const isMaxRank =
    !Number.isFinite(rank.nextXp) ||
    rank.nextXp <= rank.minXp ||
    progress.xp >= rank.nextXp;
  const rankSpan = Math.max(1, rank.nextXp - rank.minXp);
  const rankPct = isMaxRank
    ? 100
    : Math.max(0, Math.min(100, Math.round(((progress.xp - rank.minXp) / rankSpan) * 100)));

  const completedSet = new Set(progress.completedLessonIds);
  const passedExamSet = new Set(progress.passedExamModuleIds ?? []);
  const totalLessons = ALL_LESSONS.length;
  const completedCount = ALL_LESSONS.filter((l) => completedSet.has(l.id)).length;
  const curriculumPct = Math.min(
    100,
    Math.round((completedCount / Math.max(1, totalLessons)) * 100)
  );
  const allCompleted = totalLessons > 0 && completedCount >= totalLessons;
  const showCompletedHero = allCompleted || !nextLesson;

  const handleScrollToCurriculum = () => {
    document.getElementById('curriculo-progressivo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner with Generated Visual Asset + Measured Contrast Scrim */}
      <section className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#111827]">
        {heroLoaded ? (
          <img
            src={heroCanvasImg}
            alt="Representação visual da trilha de algoritmos da CodeForge Uni"
            referrerPolicy="no-referrer"
            onError={() => setHeroLoaded(false)}
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/60 via-[#0F172A] to-purple-950/50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/90 to-[#0B0F19]/55" />

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium">
              <span className="text-cyan-300">Trilha {trackMeta.name}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className={`font-mono ${langMeta.accentTextClass}`}>
                {langMeta.name} ({langMeta.extension})
              </span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-300">Nível {rank.level}: {rank.title}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <button
                type="button"
                onClick={onOpenAccountSwitcher}
                className="inline-flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                Trocar conta{accountsCount > 1 ? ` (${accountsCount})` : ''}
              </button>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-2xl">
              {showCompletedHero
                ? `Parabéns, ${profile.name}! Você zerou a trilha universitária.`
                : (profile.experienceLevel ?? profile.initialLevel) === 'zero' && completedCount < 3
                  ? `Olá, ${profile.name}. Vamos dar seus primeiros passos no código.`
                  : `Olá, ${profile.name}. Vamos avançar na sua preparação universitária.`}
            </h1>

            {showCompletedHero ? (
              <p className="text-sm sm:text-base text-emerald-200/95 max-w-2xl leading-relaxed flex items-start gap-2">
                <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Currículo 100% concluído! Você dominou todos os módulos e está pronto para a faculdade. Continue afiando seu nível na Arena ou revisite qualquer aula.
                </span>
              </p>
            ) : (
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Próximo passo recomendado: <strong className="text-white">{nextLesson.title}</strong> — {nextLesson.summary}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {showCompletedHero ? (
                <>
                  <button
                    type="button"
                    onClick={onOpenArena}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0B0F19] bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] rounded-xl transition-all whitespace-nowrap"
                  >
                    <Flame className="w-4 h-4" />
                    Treinar na Arena de Prática
                  </button>

                  <button
                    type="button"
                    onClick={handleScrollToCurriculum}
                    className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl transition-colors whitespace-nowrap"
                  >
                    Revisar qualquer aula
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onSelectLesson(nextLesson.id)}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0B0F19] bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] rounded-xl transition-all whitespace-nowrap"
                  >
                    <PlayCircle className="w-4 h-4" />
                    {completedCount === 0 ? 'Começar primeira aula' : 'Continuar próxima aula'}
                  </button>

                  <button
                    type="button"
                    onClick={onOpenArena}
                    className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl transition-colors whitespace-nowrap"
                  >
                    Ir para a Arena de Prática
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Rank Progress Summary */}
          <div className="lg:col-span-4 bg-[#0B0F19]/80 backdrop-blur-sm border border-white/[0.08] rounded-xl p-5 space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs text-slate-400">Progresso de patente</span>
              <span className="text-xs font-mono text-cyan-300 tabular-nums">
                {isMaxRank ? `Patente Máxima · ${progress.xp} XP` : `${progress.xp} / ${rank.nextXp} XP`}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-transform duration-300 origin-left"
                style={{ transform: `scaleX(${isMaxRank ? 1 : Math.max(0.03, rankPct / 100)})` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1 border-t border-white/[0.06]">
              <div>
                <p className="text-xs text-slate-400">Sequência ativa</p>
                <p className="text-xl font-bold font-mono text-white tabular-nums mt-0.5">
                  {progress.streakDays} {progress.streakDays === 1 ? 'dia' : 'dias'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Aulas concluídas</p>
                <p className="text-xl font-bold font-mono text-white tabular-nums mt-0.5">
                  {completedCount}/{totalLessons}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Bugs eliminados</p>
                <p className="text-xl font-bold font-mono text-white tabular-nums mt-0.5">
                  {progress.completedDebugIds.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Conquistas</p>
                <p className="text-xl font-bold font-mono text-white tabular-nums mt-0.5">
                  {progress.unlockedBadges.length}/{ACHIEVEMENTS.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explorer Mode Highlight Strip */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#111827] border border-cyan-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium text-cyan-300">
            <Compass className="w-4 h-4 shrink-0" />
            <span>
              {profile.careerTrack === 'explorador'
                ? 'Modo Explorador ativo · Descubra sua área ideal'
                : `Trilha atual: ${trackMeta.name} · Quer comparar áreas?`}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            {progress.explorerQuizDone
              ? 'Refazer diagnóstico vocacional com o Professor I.A.'
              : 'Ainda em dúvida entre Jogos, Web, Dados ou Sistemas?'}
          </h2>
          <p className="text-sm text-slate-400">
            Responda a 4 cenários reais de tecnologia e receba uma recomendação fundamentada do Professor Doutor I.A. com cursos universitários alinhados.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenExplorerQuiz}
          className="px-4 py-2.5 text-sm font-semibold text-cyan-100 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 rounded-xl transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
        >
          {progress.explorerQuizDone ? 'Abrir diagnóstico novamente' : 'Fazer diagnóstico (+75 XP)'}
        </button>
      </section>

      {/* Full 6-Module Curriculum Roadmap */}
      <section id="curriculo-progressivo" className="space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-white">Currículo Progressivo</h2>
            <p className="text-sm text-slate-400 mt-1">
              6 módulos guiados: começa no nível zero absoluto (bem fácil) e evolui aos poucos até o nível universitário.
            </p>
          </div>
          <p className="text-xs text-slate-400 tabular-nums">
            {curriculumPct}% do currículo concluído
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {CURRICULUM_MODULES.map((mod) => {
            const modDone = mod.lessons.filter((l) => completedSet.has(l.id)).length;
            const modComplete = modDone === mod.lessons.length;
            const examPassed = passedExamSet.has(mod.id);

            return (
              <div
                key={mod.id}
                className="bg-[#111827] border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="text-cyan-300 font-medium">{mod.universityEquivalent}</span>
                    <div className="flex items-center gap-2">
                      {examPassed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          Aprovado em Prova
                        </span>
                      )}
                      <span className="font-mono tabular-nums">
                        {modDone}/{mod.lessons.length} concluídas
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {mod.number}. {mod.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{mod.subtitle}</p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-white/[0.06]">
                  {mod.lessons.map((lesson) => {
                    const isDone = completedSet.has(lesson.id);
                    const isNext = !allCompleted && !isDone && lesson.id === nextLesson?.id;

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => onSelectLesson(lesson.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-colors flex items-center justify-between gap-4 ${
                          isNext
                            ? 'bg-cyan-500/[0.08] border-cyan-400/50 hover:border-cyan-400'
                            : isDone
                            ? 'bg-[#0B0F19]/80 border-emerald-500/25 hover:border-emerald-400/50'
                            : 'bg-[#0B0F19]/60 border-white/[0.07] hover:border-white/20'
                        }`}
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                            {isDone ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                Concluída
                              </span>
                            ) : isNext ? (
                              <span className="text-cyan-300 font-medium">Próxima recomendada</span>
                            ) : (
                              <span className="text-slate-400">Aula {lesson.order}</span>
                            )}
                            {lesson.difficultyTag && (
                              <>
                                <span aria-hidden="true" className="text-slate-600">·</span>
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
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="text-slate-400 tabular-nums">{lesson.estimatedMinutes} min</span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="text-purple-300 font-mono tabular-nums">+{lesson.xpReward} XP</span>
                          </div>
                          <p className="text-sm font-semibold text-white truncate">{lesson.title}</p>
                          <p className="text-xs text-slate-400 line-clamp-1">{lesson.summary}</p>
                        </div>

                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    );
                  })}
                </div>

                {modComplete && (
                  <p className="text-xs font-medium text-emerald-400">
                    Módulo dominado — pronto para o próximo nível.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
