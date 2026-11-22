import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Compass,
  Cpu,
  Flame,
  Monitor,
  Smartphone,
  User,
} from 'lucide-react';
import {
  getLanguageMeta,
  getRecommendedLanguage,
  PROGRAMMING_LANGUAGES,
} from '../data/languages';
import { AppTab, CareerTrackId, ProgrammingLanguage } from '../types';

interface TopNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onContinueLesson: () => void;
  continueLabel: string;
  activeLanguage: ProgrammingLanguage;
  careerTrack: CareerTrackId;
  onChangeLanguage: (lang: ProgrammingLanguage) => void;
  forceMobile?: boolean;
  onToggleMobileMode?: () => void;
}

const NAV_ITEMS: { id: AppTab; label: string; mobileLabel: string; icon: typeof Compass }[] = [
  { id: 'trilha', label: 'Trilha', mobileLabel: 'Trilha', icon: Compass },
  { id: 'arena', label: 'Arena', mobileLabel: 'Arena', icon: Flame },
  { id: 'professor', label: 'Professor I.A.', mobileLabel: 'Professor', icon: Cpu },
  { id: 'glossario', label: 'Glossário', mobileLabel: 'Glossário', icon: BookOpen },
  { id: 'perfil', label: 'Perfil', mobileLabel: 'Perfil', icon: User },
];

export function TopNav({
  activeTab,
  onSelectTab,
  onContinueLesson,
  continueLabel,
  activeLanguage,
  careerTrack,
  onChangeLanguage,
  forceMobile = false,
  onToggleMobileMode,
}: TopNavProps) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const langMeta = getLanguageMeta(activeLanguage);
  const recommendedLang = getRecommendedLanguage(careerTrack);

  useEffect(() => {
    if (!langMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [langMenuOpen]);

  const compactContinueLabel =
    continueLabel === 'Treinar na Arena'
      ? 'Arena'
      : continueLabel === 'Começar Aula'
        ? 'Começar'
        : 'Continuar';

  return (
    <>
      <header
        className={`sticky top-0 z-40 ${
          forceMobile ? 'h-14' : 'h-14 md:h-16'
        } bg-[#0B0F19]/92 backdrop-blur-md border-b border-white/[0.08]`}
      >
        <div
          className={`${
            forceMobile ? 'px-3.5 gap-2' : 'max-w-[1360px] mx-auto px-3.5 sm:px-6 gap-2.5 sm:gap-6'
          } h-full flex items-center justify-between`}
        >
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => onSelectTab('trilha')}
            className={`${
              forceMobile ? 'text-base' : 'text-base sm:text-lg'
            } font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md`}
          >
            CodeForge <span className="text-cyan-400">Uni</span>
          </button>

          {/* Zone 2: Clean single-line desktop navigation links */}
          {!forceMobile && (
            <nav
              aria-label="Navegação principal"
              className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`relative py-2 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm ${
                      isActive ? 'text-white' : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-cyan-400" />
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Zone 3: Quick Language Switcher + Discreet Mobile Mode Toggle + Primary Action */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={langMenuOpen}
                aria-label={`Linguagem ativa: ${langMeta.name}. Clique para trocar.`}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 min-h-[38px] text-xs font-mono font-medium text-slate-200 hover:text-white bg-[#111827] hover:bg-[#172136] border border-white/10 hover:border-white/20 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <Code2 className={`w-3.5 h-3.5 shrink-0 ${langMeta.accentTextClass}`} />
                <span>{langMeta.shortLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {langMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Selecionar linguagem de programação"
                  className="absolute right-0 mt-2 w-[min(18rem,90vw)] rounded-xl bg-[#111827] border border-white/12 shadow-2xl p-2 space-y-1 z-50"
                >
                  <div className="px-2.5 py-1.5 text-[11px] font-medium text-slate-400 border-b border-white/[0.06] mb-1">
                    Linguagem desta conta
                  </div>
                  {PROGRAMMING_LANGUAGES.map((lang) => {
                    const isSelected = lang.id === activeLanguage;
                    const isRec = lang.id === recommendedLang;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onChangeLanguage(lang.id);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-lg transition-colors flex items-center justify-between gap-2 ${
                          isSelected
                            ? `${lang.accentBgClass} text-white`
                            : 'hover:bg-white/[0.05] text-slate-200'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{lang.name}</span>
                            <span className={`text-[11px] font-mono ${lang.accentTextClass}`}>
                              {lang.extension}
                            </span>
                            {isRec && (
                              <span className="text-[10px] font-medium text-cyan-300">
                                · Sugerida
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {lang.universityFocus}
                          </p>
                        </div>
                        {isSelected && <Check className={`w-4 h-4 shrink-0 ${lang.accentTextClass}`} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {onToggleMobileMode && (
              <button
                type="button"
                onClick={onToggleMobileMode}
                title={forceMobile ? 'Voltar ao layout automático' : 'Visualizar em Modo Celular'}
                aria-label={forceMobile ? 'Desativar Modo Celular' : 'Ativar Modo Celular'}
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 min-h-[38px] text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  forceMobile
                    ? 'bg-cyan-500/15 border-cyan-400/45 text-cyan-200'
                    : 'bg-[#111827] border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                }`}
              >
                {forceMobile ? (
                  <Monitor className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                )}
                {!forceMobile && <span className="hidden xl:inline">Modo Celular</span>}
              </button>
            )}

            <button
              type="button"
              onClick={onContinueLesson}
              className="px-3 sm:px-4 min-h-[38px] text-xs sm:text-sm font-semibold text-[#0B0F19] bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] rounded-lg transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]"
            >
              {forceMobile ? (
                compactContinueLabel
              ) : (
                <>
                  <span className="sm:hidden">{compactContinueLabel}</span>
                  <span className="hidden sm:inline">{continueLabel}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Dedicated Mobile Bottom Navigation with Safe Area Inset */}
      <nav
        aria-label="Navegação móvel"
        className={`${
          forceMobile
            ? 'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] border-x border-white/[0.08]'
            : 'md:hidden fixed bottom-0 inset-x-0'
        } z-40 bg-[#0B0F19]/96 backdrop-blur-md border-t border-white/[0.08] px-1.5 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]`}
      >
        <div className="grid grid-cols-5 items-center gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 min-h-[48px] rounded-xl text-[11px] font-medium transition-colors whitespace-nowrap px-1 ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate max-w-full leading-none">{item.mobileLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
