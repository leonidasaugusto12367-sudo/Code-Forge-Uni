import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Code2, Compass, Lock, Monitor, Smartphone, Sparkles } from 'lucide-react';
import heroCanvasImg from '../assets/images/codeforge_hero_canvas_1795049259385.jpg';
import {
  getRecommendationReason,
  getRecommendedLanguage,
  PROGRAMMING_LANGUAGES,
} from '../data/languages';
import { CAREER_TRACKS } from '../data/tracks';
import { ACCOUNT_AVATAR_COLORS, getAvatarColorStyle, getInitials } from '../hooks/useCodeForgeStore';
import { AccountAvatarColor, CareerTrackId, InitialLevel, ProgrammingLanguage } from '../types';

interface OnboardingFlowProps {
  onComplete: (data: {
    name: string;
    goal: string;
    initialLevel: InitialLevel;
    careerTrack: CareerTrackId;
    programmingLanguage: ProgrammingLanguage;
    avatarColor: AccountAvatarColor;
    pin?: string;
  }) => void;
  onCancel?: () => void;
  existingAccountsCount?: number;
  forceMobile?: boolean;
  onToggleMobileMode?: () => void;
}

const GOAL_OPTIONS = [
  'Chegar na faculdade de tecnologia já dominando lógica e algoritmos',
  'Criar meus próprios jogos digitais entendendo a programação por trás',
  'Desenvolver aplicativos e sistemas web reais do zero',
  'Explorar Ciência de Dados, Inteligência Artificial e automação',
];

export function OnboardingFlow({
  onComplete,
  onCancel,
  existingAccountsCount = 0,
  forceMobile = false,
  onToggleMobileMode,
}: OnboardingFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(GOAL_OPTIONS[0]);
  const [avatarColor, setAvatarColor] = useState<AccountAvatarColor>(
    ACCOUNT_AVATAR_COLORS[existingAccountsCount % ACCOUNT_AVATAR_COLORS.length].id
  );
  const [pin, setPin] = useState('');
  const [initialLevel, setInitialLevel] = useState<InitialLevel>('zero');
  const [careerTrack, setCareerTrack] = useState<CareerTrackId>('explorador');
  const [programmingLanguage, setProgrammingLanguage] = useState<ProgrammingLanguage>(
    getRecommendedLanguage('explorador')
  );
  const [languageTouched, setLanguageTouched] = useState(false);
  const [step1Error, setStep1Error] = useState('');
  const [heroLoaded, setHeroLoaded] = useState(true);

  const selectedAvatarStyle = getAvatarColorStyle(avatarColor);
  const recommendedLang = getRecommendedLanguage(careerTrack);

  const handleSelectTrack = (trackId: CareerTrackId) => {
    setCareerTrack(trackId);
    if (!languageTouched) {
      setProgrammingLanguage(getRecommendedLanguage(trackId));
    }
  };

  const handleNextFromStep1 = () => {
    if (name.trim().length < 2) {
      setStep1Error('Digite seu primeiro nome ou apelido (mínimo 2 letras).');
      return;
    }
    if (pin.length > 0 && !/^\d{4}$/.test(pin)) {
      setStep1Error('O PIN opcional precisa ter exatamente 4 dígitos numéricos (ou deixe em branco).');
      return;
    }
    setStep1Error('');
    setStep(2);
  };

  const handleFinish = () => {
    onComplete({
      name: name.trim(),
      goal,
      initialLevel,
      careerTrack,
      programmingLanguage,
      avatarColor,
      pin: pin.length === 4 ? pin : undefined,
    });
  };

  return (
    <div
      className={`min-h-[100dvh] bg-[#0B0F19] text-slate-100 flex flex-col overflow-x-hidden overflow-y-auto pb-[env(safe-area-inset-bottom)] ${
        forceMobile ? 'max-w-[430px] mx-auto border-x border-white/[0.08] shadow-2xl' : ''
      }`}
    >
      <div
        className={`w-full mx-auto px-4 ${
          forceMobile ? 'py-5' : 'sm:px-6 py-6 sm:py-10 max-w-[1160px]'
        } flex-1 flex flex-col justify-start sm:justify-center`}
      >
        {/* Top Wordmark & Step Progress */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap">
              CodeForge <span className="text-cyan-400">Uni</span>
            </div>
            {onCancel && existingAccountsCount > 0 && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors min-h-[36px] px-2 rounded-lg"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-400 tabular-nums">
            {onToggleMobileMode && (
              <button
                type="button"
                onClick={onToggleMobileMode}
                title={forceMobile ? 'Voltar para layout automático' : 'Testar em Modo Celular'}
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                  forceMobile
                    ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200'
                    : 'bg-[#111827] border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {forceMobile ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                <span>{forceMobile ? 'Modo Auto' : 'Modo Celular'}</span>
              </button>
            )}
            <span>Passo {step} de 4</span>
            <div className="w-16 sm:w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-transform duration-300 origin-left"
                style={{ transform: `scaleX(${step / 4})` }}
              />
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${forceMobile ? 'gap-5' : 'lg:grid-cols-12 gap-6 lg:gap-8'} items-stretch`}>
          {/* Left Showcase Panel */}
          <div
            className={`${
              forceMobile
                ? 'min-h-[150px] p-5'
                : 'lg:col-span-5 min-h-[170px] sm:min-h-[220px] lg:min-h-[540px] p-5 sm:p-8'
            } relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#111827] flex flex-col justify-end`}
          >
            {heroLoaded ? (
              <img
                src={heroCanvasImg}
                alt="Estrutura algorítmica luminosa sobre fundo grafite da CodeForge Uni"
                referrerPolicy="no-referrer"
                onError={() => setHeroLoaded(false)}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/60 via-[#0F172A] to-purple-950/60" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/80 to-[#0B0F19]/25" />

            <div className="relative z-10 space-y-2">
              <p className="text-xs font-medium text-cyan-300">
                Preparação Universitária · Ciência da Computação
              </p>
              <h1 className={`${forceMobile ? 'text-xl' : 'text-xl sm:text-3xl'} font-bold text-white leading-tight`}>
                {existingAccountsCount > 0
                  ? 'Crie um novo perfil isolado neste aparelho.'
                  : 'Do zero absoluto ao nível intermediário real.'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Aprenda programação com testes automatizados, casos extremos e um Professor Doutor em I.A. que usa método socrático.
              </p>
            </div>
          </div>

          {/* Right Interactive Wizard Panel */}
          <div
            className={`${
              forceMobile ? 'p-5' : 'lg:col-span-7 p-5 sm:p-8'
            } bg-[#111827]/90 border border-white/[0.08] rounded-2xl flex flex-col justify-between`}
          >
            <div>
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Etapa 1 de 4 · Perfil e segurança</p>
                    <h2 className="text-2xl font-bold text-white">Como devemos chamar você?</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Cada conta salva seu progresso isoladamente no navegador, com opção de PIN de 4 dígitos.
                    </p>
                  </div>

                  {/* Name + Avatar Preview */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center font-display font-bold text-base shrink-0 mt-6 ${selectedAvatarStyle.bgClass} ${selectedAvatarStyle.textClass} ${selectedAvatarStyle.borderClass}`}
                    >
                      {getInitials(name || 'CF')}
                    </div>
                    <div className="flex-1">
                      <label htmlFor="student-name" className="block text-sm font-medium text-slate-200 mb-2">
                        Seu nome
                      </label>
                      <input
                        id="student-name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (step1Error) setStep1Error('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleNextFromStep1();
                        }}
                        placeholder="Ex: Lucas, Mariana, Rafael..."
                        className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#0B0F19] border border-white/10 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Avatar Color + Optional PIN */}
                  <div className={`grid grid-cols-1 ${forceMobile ? '' : 'sm:grid-cols-2'} gap-4`}>
                    <div>
                      <p className="text-xs font-medium text-slate-300 mb-2">Cor do avatar</p>
                      <div className="flex flex-wrap items-center gap-2.5">
                        {ACCOUNT_AVATAR_COLORS.map((c) => {
                          const active = avatarColor === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setAvatarColor(c.id)}
                              aria-label={`Cor ${c.label}`}
                              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${c.bgClass} ${c.textClass} ${
                                active ? `${c.borderClass} ring-2 ring-white/40` : 'border-white/10 opacity-75 hover:opacity-100'
                              }`}
                            >
                              {active && <Check className="w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="student-pin" className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        PIN opcional (4 dígitos)
                      </label>
                      <input
                        id="student-pin"
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => {
                          setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                          if (step1Error) setStep1Error('');
                        }}
                        placeholder="Opcional (ex: 1234)"
                        className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-base font-mono text-white placeholder:text-slate-500 placeholder:font-sans focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {step1Error && <p className="text-xs text-rose-400">{step1Error}</p>}

                  <div>
                    <p className="text-sm font-medium text-slate-200 mb-2.5">
                      Qual é o seu principal objetivo agora?
                    </p>
                    <div className="space-y-2">
                      {GOAL_OPTIONS.map((opt) => {
                        const selected = goal === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setGoal(opt)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                              selected
                                ? 'bg-cyan-500/10 border-cyan-400/60 text-white'
                                : 'bg-[#0B0F19]/70 border-white/[0.07] text-slate-300 hover:border-white/20'
                            }`}
                          >
                            <span className="text-sm leading-snug">{opt}</span>
                            {selected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Etapa 2 de 4 · Ponto de partida</p>
                    <h2 className="text-2xl font-bold text-white">Qual é sua experiência atual?</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Sem pressão! Isso define o jeito que o Professor I.A. explica e qual aula recomendamos primeiro. Você pode mudar depois no Perfil.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    <button
                      type="button"
                      onClick={() => setInitialLevel('zero')}
                      className={`text-left p-4 sm:p-5 rounded-xl border transition-colors ${
                        initialLevel === 'zero'
                          ? 'bg-cyan-500/10 border-cyan-400/70'
                          : 'bg-[#0B0F19]/70 border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-white">Não sei nada de programação</h3>
                        {initialLevel === 'zero' && <Check className="w-5 h-5 text-cyan-400 shrink-0" />}
                      </div>
                      <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                        Começo do zero absoluto: o que é uma variável, somas simples, textos e primeiras decisões com analogias do dia a dia e zero jargão difícil.
                      </p>
                      <p className="text-xs text-cyan-300 mt-2.5">
                        Recomendado · Começa na Aula 1 (Bem fácil) com dicas passo a passo
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInitialLevel('basico')}
                      className={`text-left p-4 sm:p-5 rounded-xl border transition-colors ${
                        initialLevel === 'basico'
                          ? 'bg-emerald-500/10 border-emerald-400/70'
                          : 'bg-[#0B0F19]/70 border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-white">Sei apenas o básico</h3>
                        {initialLevel === 'basico' && <Check className="w-5 h-5 text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                        Já vi um pouco de variáveis ou <code className="font-mono text-slate-200">if/else</code>, mas quero firmar a base com exercícios guiados sem pular etapas.
                      </p>
                      <p className="text-xs text-emerald-300 mt-2.5">
                        Explicações simples e diretas · Evolução gradual até a faculdade
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInitialLevel('intermediario')}
                      className={`text-left p-4 sm:p-5 rounded-xl border transition-colors ${
                        initialLevel === 'intermediario'
                          ? 'bg-purple-500/10 border-purple-400/70'
                          : 'bg-[#0B0F19]/70 border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-white">Já tenho base</h3>
                        {initialLevel === 'intermediario' && <Check className="w-5 h-5 text-purple-400 shrink-0" />}
                      </div>
                      <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                        Já programo o básico com tranquilidade e quero acelerar para lógica composta, laços, busca binária, pilhas, recursão e nível universitário.
                      </p>
                      <p className="text-xs text-purple-300 mt-2.5">
                        Sugere começar pelo Módulo 02 (todos os módulos seguem livres)
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Etapa 3 de 4 · Área de interesse</p>
                    <h2 className="text-2xl font-bold text-white">Escolha sua trilha de carreira</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Você pode trocar de área a qualquer momento no seu Perfil. Os exemplos e projetos se adaptam automaticamente.
                    </p>
                  </div>

                  {/* Featured Explorer Mode */}
                  {(() => {
                    const explorer = CAREER_TRACKS[0];
                    const selected = careerTrack === 'explorador';
                    return (
                      <button
                        type="button"
                        onClick={() => handleSelectTrack('explorador')}
                        className={`w-full text-left p-5 rounded-xl border transition-colors ${
                          selected
                            ? 'bg-cyan-500/12 border-cyan-400'
                            : 'bg-[#0B0F19]/80 border-cyan-500/30 hover:border-cyan-400/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-medium text-cyan-300">
                              <Compass className="w-4 h-4 shrink-0" />
                              <span>Destaque Principal · Descoberta Guiada</span>
                            </div>
                            <h3 className="text-base font-semibold text-white">
                              {explorer.name} — Ainda não decidi, me ajude a escolher
                            </h3>
                          </div>
                          {selected && <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />}
                        </div>
                        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                          {explorer.tagline}
                        </p>
                        <p className="text-xs text-slate-400 mt-2.5">
                          {explorer.examples.join(' · ')}
                        </p>
                      </button>
                    );
                  })()}

                  {/* 4 Specialized Tracks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CAREER_TRACKS.slice(1).map((track) => {
                      const selected = careerTrack === track.id;
                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => handleSelectTrack(track.id)}
                          className={`text-left p-4 rounded-xl border transition-colors flex flex-col justify-between ${
                            selected
                              ? 'bg-purple-500/12 border-purple-400 text-white'
                              : 'bg-[#0B0F19]/70 border-white/[0.08] hover:border-white/20 text-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-sm font-semibold text-white">{track.name}</h3>
                              {selected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                              {track.examples.slice(0, 3).join(' · ')}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Etapa 4 de 4 · Linguagem principal</p>
                    <h2 className="text-2xl font-bold text-white">Escolha sua linguagem de programação</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Cada conta salva sua própria linguagem. Você pode trocar em 1 clique no topo da tela ou no Perfil sempre que quiser.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-cyan-500/8 border border-cyan-400/25 flex items-start gap-2.5 text-xs text-slate-200">
                    <Code2 className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong className="text-cyan-300">Sugestão para sua trilha:</strong>{' '}
                      {getRecommendationReason(careerTrack)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PROGRAMMING_LANGUAGES.map((lang) => {
                      const selected = programmingLanguage === lang.id;
                      const isRecommended = recommendedLang === lang.id;
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => {
                            setProgrammingLanguage(lang.id);
                            setLanguageTouched(true);
                          }}
                          className={`text-left p-4 rounded-xl border transition-colors flex flex-col justify-between gap-2 ${
                            selected
                              ? `${lang.accentBgClass} ${lang.accentBorderClass} text-white`
                              : 'bg-[#0B0F19]/75 border-white/[0.08] hover:border-white/20 text-slate-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-sm font-bold text-white">{lang.name}</span>
                                <span className={`text-xs font-mono ${lang.accentTextClass}`}>
                                  {lang.extension}
                                </span>
                              </div>
                              {selected && <Check className={`w-4 h-4 shrink-0 ${lang.accentTextClass}`} />}
                            </div>

                            {isRecommended && (
                              <p className="text-[11px] font-medium text-cyan-300">
                                Recomendada para sua trilha
                              </p>
                            )}

                            <p className="text-xs text-slate-400 leading-relaxed pt-0.5">
                              {lang.tagline}
                            </p>
                          </div>

                          <p className="text-[11px] text-slate-500 pt-1 border-t border-white/[0.06]">
                            {lang.executionMode === 'native'
                              ? 'Execução nativa instantânea no navegador'
                              : 'Avaliação automatizada de testes + Professor I.A.'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div
              className={`pt-6 mt-6 border-t border-white/[0.08] flex ${
                forceMobile ? 'flex-col-reverse gap-3' : 'flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3'
              }`}
            >
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s === 4 ? 3 : s === 3 ? 2 : 1))}
                  className={`inline-flex items-center justify-center gap-2 min-h-[48px] px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-colors ${
                    forceMobile ? 'w-full' : 'w-full sm:w-auto'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
              ) : (
                <span className="text-xs text-slate-500 text-center sm:text-left">
                  Salvo localmente com isolamento por conta
                </span>
              )}

              {step === 1 && (
                <button
                  type="button"
                  onClick={handleNextFromStep1}
                  className={`inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 text-sm font-semibold text-[#0B0F19] bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] rounded-xl transition-all ${
                    forceMobile ? 'w-full' : 'w-full sm:w-auto'
                  }`}
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className={`inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 text-sm font-semibold text-[#0B0F19] bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] rounded-xl transition-all ${
                    forceMobile ? 'w-full' : 'w-full sm:w-auto'
                  }`}
                >
                  Escolher trilha
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className={`inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 text-sm font-semibold text-[#0B0F19] bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] rounded-xl transition-all ${
                    forceMobile ? 'w-full' : 'w-full sm:w-auto'
                  }`}
                >
                  Escolher linguagem
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {step === 4 && (
                <button
                  type="button"
                  onClick={handleFinish}
                  className={`inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 text-sm font-semibold text-[#0B0F19] bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] rounded-xl transition-all ${
                    forceMobile ? 'w-full' : 'w-full sm:w-auto'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {existingAccountsCount > 0 ? 'Criar conta e entrar' : 'Iniciar CodeForge Uni'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
