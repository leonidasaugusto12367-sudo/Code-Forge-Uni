import { useEffect, useState } from 'react';
import { Check, KeyRound, Lock, LogOut, Plus, ShieldCheck, X } from 'lucide-react';
import { getLanguageMeta } from '../data/languages';
import { getRankForXp, getTrackMeta } from '../data/tracks';
import { ActionResult, getAvatarColorStyle, getInitials } from '../hooks/useCodeForgeStore';
import { LocalAccount } from '../types';

interface AccountSwitcherModalProps {
  accounts: LocalAccount[];
  activeAccountId: string | null;
  onSwitch: (id: string, pin?: string) => ActionResult;
  onLogout: () => void;
  onCreateNew: () => void;
  onClose: () => void;
}

export function AccountSwitcherModal({
  accounts,
  activeAccountId,
  onSwitch,
  onLogout,
  onCreateNew,
  onClose,
}: AccountSwitcherModalProps) {
  const [pendingAccount, setPendingAccount] = useState<LocalAccount | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    if (pendingAccount && !accounts.some((a) => a.id === pendingAccount.id)) {
      setPendingAccount(null);
      setPinInput('');
      setPinError(null);
    }
  }, [accounts, pendingAccount]);

  const handlePickAccount = (account: LocalAccount) => {
    if (account.id === activeAccountId) {
      onClose();
      return;
    }
    if (account.pin) {
      setPendingAccount(account);
      setPinInput('');
      setPinError(null);
      return;
    }
    const res = onSwitch(account.id);
    if (res.ok) onClose();
  };

  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingAccount) return;
    const res = onSwitch(pendingAccount.id, pinInput);
    if (!res.ok) {
      setPinError(res.error ?? 'PIN incorreto.');
      setPinInput('');
    } else {
      setPendingAccount(null);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="switcher-modal-title"
    >
      <div className="w-[94vw] max-w-lg max-h-[90dvh] overflow-y-auto bg-[#111827] border border-white/10 rounded-2xl flex flex-col">
        <div className="sticky top-0 z-10 bg-[#111827] px-5 py-4 border-b border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h2 id="switcher-modal-title" className="text-base font-bold text-white truncate">
              Contas neste dispositivo
            </h2>
            <p className="text-xs text-slate-400">
              Alterne entre perfis mantendo todo o progresso separado
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar seletor de contas"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {pendingAccount ? (
            <form onSubmit={handleConfirmPin} className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0B0F19] border border-white/[0.08]">
                <KeyRound className="w-4 h-4 text-amber-300 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{pendingAccount.name}</p>
                  <p className="text-xs text-slate-400">Informe o PIN de 4 dígitos para alternar</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                    if (pinError) setPinError(null);
                  }}
                  placeholder="••••"
                  className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-[#0B0F19] border border-white/10 text-center font-mono text-2xl tracking-[0.5em] text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                />
                {pinError && <p className="text-xs text-rose-400">{pinError}</p>}
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setPendingAccount(null);
                    setPinInput('');
                    setPinError(null);
                  }}
                  className="min-h-[48px] w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white border border-white/10 rounded-xl"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={pinInput.length !== 4}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[48px] w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[#0B0F19] bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 rounded-xl transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Desbloquear e trocar
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-2.5">
                {accounts.map((acc) => {
                  const isActive = acc.id === activeAccountId;
                  const style = getAvatarColorStyle(acc.avatarColor);
                  const rank = getRankForXp(acc.progress.xp);
                  const track = getTrackMeta(acc.profile.careerTrack);
                  const langMeta = getLanguageMeta(acc.profile.programmingLanguage);

                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handlePickAccount(acc)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 min-h-[60px] ${
                        isActive
                          ? 'bg-cyan-500/10 border-cyan-400/60'
                          : 'bg-[#0B0F19] border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center font-display font-bold text-xs shrink-0 ${style.bgClass} ${style.textClass} ${style.borderClass}`}
                        >
                          {getInitials(acc.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{acc.name}</p>
                          <p className="text-xs text-slate-400 truncate tabular-nums">
                            {track.shortName} ·{' '}
                            <span className={`font-mono ${langMeta.accentTextClass}`}>
                              {langMeta.shortLabel}
                            </span>{' '}
                            · Nível {rank.level} · {acc.progress.xp} XP
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {acc.pin && (
                          <Lock className="w-3.5 h-3.5 text-amber-300" aria-label="Protegida por PIN" />
                        )}
                        {isActive && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCreateNew();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[48px] w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-[#0B0F19] bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nova conta
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[48px] w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair da conta
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
