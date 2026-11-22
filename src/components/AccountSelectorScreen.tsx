import { useEffect, useRef, useState } from 'react';
import { ArrowRight, KeyRound, Lock, Monitor, Plus, ShieldCheck, Smartphone, Unlock, Upload, X } from 'lucide-react';
import heroCanvasImg from '../assets/images/codeforge_hero_canvas_1795049259385.jpg';
import { ALL_LESSONS } from '../data/curriculum';
import { getLanguageMeta } from '../data/languages';
import { getRankForXp, getTrackMeta } from '../data/tracks';
import {
  ActionResult,
  getAvatarColorStyle,
  getInitials,
  ImportAccountResult,
} from '../hooks/useCodeForgeStore';
import { LocalAccount } from '../types';

interface AccountSelectorScreenProps {
  accounts: LocalAccount[];
  onLogin: (id: string, pin?: string) => ActionResult;
  onCreateNew: () => void;
  onImportAccount: (rawJson: string) => ImportAccountResult;
  forceMobile?: boolean;
  onToggleMobileMode?: () => void;
}

export function AccountSelectorScreen({
  accounts,
  onLogin,
  onCreateNew,
  onImportAccount,
  forceMobile = false,
  onToggleMobileMode,
}: AccountSelectorScreenProps) {
  const [selectedLockedAccount, setSelectedLockedAccount] = useState<LocalAccount | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [heroLoaded, setHeroLoaded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectedLockedAccount && !accounts.some((a) => a.id === selectedLockedAccount.id)) {
      setSelectedLockedAccount(null);
      setPinInput('');
      setPinError(null);
    }
  }, [accounts, selectedLockedAccount]);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportError(null);
    try {
      const content = await file.text();
      const res = onImportAccount(content);
      if (!res.ok) {
        setImportError(res.error ?? 'Não foi possível restaurar o backup selecionado.');
      } else if (res.requiresPin && res.account) {
        setSelectedLockedAccount(res.account);
        setPinInput('');
        setPinError(null);
      }
    } catch {
      setImportError('Não foi possível ler o arquivo selecionado.');
    }
  };

  const handleSelectAccount = (account: LocalAccount) => {
    if (account.pin) {
      setSelectedLockedAccount(account);
      setPinInput('');
      setPinError(null);
      return;
    }
    onLogin(account.id);
  };

  const handleSubmitPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLockedAccount) return;
    const res = onLogin(selectedLockedAccount.id, pinInput);
    if (!res.ok) {
      setPinError(res.error ?? 'PIN incorreto.');
      setPinInput('');
    } else {
      setSelectedLockedAccount(null);
      setPinInput('');
      setPinError(null);
    }
  };

  return (
    <div
      className={`min-h-[100dvh] bg-[#0B0F19] text-slate-100 flex flex-col overflow-x-hidden overflow-y-auto pb-[env(safe-area-inset-bottom)] ${
        forceMobile ? 'max-w-[430px] mx-auto border-x border-white/[0.08] shadow-2xl' : ''
      }`}
    >
      <div
        className={`w-full mx-auto px-4 ${
          forceMobile ? 'py-6' : 'sm:px-6 py-6 sm:py-12 max-w-[1160px]'
        } flex-1 flex flex-col justify-start sm:justify-center`}
      >
        {/* Top Wordmark */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="text-lg sm:text-xl font-bold tracking-tight text-white">
            CodeForge <span className="text-cyan-400">Uni</span>
          </div>
          <div className="flex items-center gap-2.5">
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
            <p className="text-xs text-slate-400 tabular-nums">
              {accounts.length} {accounts.length === 1 ? 'conta local' : 'contas locais'}
            </p>
          </div>
        </div>

        {/* Hero Strip */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#111827] p-5 sm:p-8 mb-6 sm:mb-8">
          {heroLoaded ? (
            <img
              src={heroCanvasImg}
              alt="Visual algorítmico da CodeForge Uni"
              referrerPolicy="no-referrer"
              onError={() => setHeroLoaded(false)}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/60 via-[#0F172A] to-purple-950/50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/90 to-[#0B0F19]/60" />

          <div
            className={`relative z-10 flex flex-col ${
              forceMobile ? '' : 'md:flex-row md:items-center'
            } justify-between gap-5 sm:gap-6`}
          >
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-medium text-cyan-300">
                Múltiplas contas locais · Progresso 100% isolado
              </p>
              <h1 className={`${forceMobile ? 'text-2xl' : 'text-2xl sm:text-3xl'} font-bold text-white leading-tight`}>
                Quem vai programar agora?
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Escolha seu perfil para retomar exatamente de onde parou — trilha, XP, códigos salvos, conquistas e histórico com o Professor I.A. ficam separados por conta.
              </p>
            </div>

            <div
              className={`flex flex-col ${
                forceMobile ? 'w-full' : 'sm:flex-row sm:flex-wrap w-full md:w-auto'
              } items-stretch sm:items-center gap-2.5 shrink-0`}
            >
              <button
                type="button"
                onClick={onCreateNew}
                className={`inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 text-sm font-semibold text-[#0B0F19] bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] rounded-xl transition-all whitespace-nowrap ${
                  forceMobile ? 'w-full' : 'w-full sm:w-auto'
                }`}
              >
                <Plus className="w-4 h-4" />
                Criar nova conta
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportError(null);
                  fileInputRef.current?.click();
                }}
                className={`inline-flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 text-sm font-medium text-slate-200 hover:text-white bg-[#111827]/90 hover:bg-white/[0.08] border border-white/15 rounded-xl transition-colors ${
                  forceMobile ? 'w-full text-xs' : 'w-full sm:w-auto'
                }`}
              >
                <Upload className="w-4 h-4 shrink-0" />
                <span className="truncate">Importar conta de outro aparelho (.json)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
                aria-label="Restaurar arquivo de backup JSON"
              />
            </div>
          </div>
        </div>

        {importError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-xs text-rose-200">
            <span>{importError}</span>
            <button
              type="button"
              onClick={() => setImportError(null)}
              aria-label="Fechar aviso de erro"
              className="text-rose-300 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Account Cards Grid */}
        <div className={`grid grid-cols-1 ${forceMobile ? '' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4`}>
          {accounts.map((account) => {
            const avatarStyle = getAvatarColorStyle(account.avatarColor);
            const rank = getRankForXp(account.progress.xp);
            const track = getTrackMeta(account.profile.careerTrack);
            const langMeta = getLanguageMeta(account.profile.programmingLanguage);
            const completedSet = new Set(account.progress.completedLessonIds ?? []);
            const completedLessons = ALL_LESSONS.filter((l) => completedSet.has(l.id)).length;

            return (
              <button
                key={account.id}
                type="button"
                onClick={() => handleSelectAccount(account)}
                className="text-left p-5 rounded-2xl bg-[#111827] border border-white/[0.08] hover:border-cyan-400/50 transition-all flex flex-col justify-between gap-5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center font-display font-bold text-base shrink-0 ${avatarStyle.bgClass} ${avatarStyle.textClass} ${avatarStyle.borderClass}`}
                    >
                      {getInitials(account.name)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-white truncate">{account.name}</h2>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        Nível {rank.level} · {rank.title}
                      </p>
                    </div>
                  </div>

                  {account.pin ? (
                    <Lock
                      className="w-4 h-4 text-amber-300 shrink-0 mt-1"
                      aria-label="Conta protegida por PIN"
                    />
                  ) : (
                    <Unlock
                      className="w-4 h-4 text-slate-500 shrink-0 mt-1"
                      aria-label="Acesso direto sem PIN"
                    />
                  )}
                </div>

                <div className="space-y-2.5 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="truncate">
                      {track.shortName} ·{' '}
                      <span className={`font-mono ${langMeta.accentTextClass}`}>
                        {langMeta.name}
                      </span>
                    </span>
                    <span className="font-mono text-cyan-300 tabular-nums shrink-0">
                      {account.progress.xp} XP
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="tabular-nums">
                      {completedLessons}/{ALL_LESSONS.length} aulas · {account.progress.streakDays}{' '}
                      {account.progress.streakDays === 1 ? 'dia' : 'dias'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {account.pin ? 'Desbloquear' : 'Entrar'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PIN Unlock Modal */}
      {selectedLockedAccount && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pin-unlock-title"
        >
          <div className="w-[94vw] max-w-lg sm:max-w-sm max-h-[90dvh] overflow-y-auto bg-[#111827] border border-white/10 rounded-2xl">
            <div className="sticky top-0 z-10 bg-[#111827] px-5 py-4 border-b border-white/[0.08] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-amber-300 shrink-0" />
                <h2 id="pin-unlock-title" className="text-base font-bold text-white">
                  Desbloquear conta
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedLockedAccount(null);
                  setPinInput('');
                  setPinError(null);
                }}
                aria-label="Fechar janela de PIN"
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPin} className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const style = getAvatarColorStyle(selectedLockedAccount.avatarColor);
                  return (
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center font-display font-bold text-sm shrink-0 ${style.bgClass} ${style.textClass} ${style.borderClass}`}
                    >
                      {getInitials(selectedLockedAccount.name)}
                    </div>
                  );
                })()}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {selectedLockedAccount.name}
                  </p>
                  <p className="text-xs text-slate-400">Digite o PIN de 4 dígitos para continuar</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="unlock-pin-input" className="sr-only">
                  PIN de 4 dígitos
                </label>
                <input
                  id="unlock-pin-input"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPinInput(digits);
                    if (pinError) setPinError(null);
                  }}
                  placeholder="••••"
                  className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-[#0B0F19] border border-white/10 text-center font-mono text-2xl tracking-[0.5em] text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                />
                {pinError && <p className="text-xs text-rose-400">{pinError}</p>}
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLockedAccount(null);
                    setPinInput('');
                    setPinError(null);
                  }}
                  className="min-h-[48px] w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white border border-white/10 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pinInput.length !== 4}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[48px] w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[#0B0F19] bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 rounded-xl transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
