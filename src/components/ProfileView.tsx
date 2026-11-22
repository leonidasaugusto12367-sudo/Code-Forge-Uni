import { useEffect, useRef, useState } from 'react';
import {
  Award,
  Check,
  Code2,
  Compass,
  Copy,
  Download,
  Eye,
  EyeOff,
  FolderGit2,
  KeyRound,
  Lock,
  LogOut,
  Monitor,
  Plus,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { ALL_LESSONS, CURRICULUM_MODULES } from '../data/curriculum';
import {
  getLanguageMeta,
  getRecommendationReason,
  getRecommendedLanguage,
  PROGRAMMING_LANGUAGES,
} from '../data/languages';
import { ACHIEVEMENTS, CAREER_TRACKS, getRankForXp } from '../data/tracks';
import {
  ACCOUNT_AVATAR_COLORS,
  ActionResult,
  ExportAccountResult,
  getAvatarColorStyle,
  getInitials,
  ImportAccountResult,
} from '../hooks/useCodeForgeStore';
import {
  AccountAvatarColor,
  CareerTrackId,
  InitialLevel,
  LocalAccount,
  ProgrammingLanguage,
  StudentProfile,
  StudentProgress,
} from '../types';

interface ProfileViewProps {
  activeAccount: LocalAccount;
  accountsCount: number;
  profile: StudentProfile;
  progress: StudentProgress;
  forceMobile?: boolean;
  onToggleMobileMode?: () => void;
  onUpdateProfile: (patch: Partial<Omit<StudentProfile, 'onboardingComplete' | 'createdAt'>>) => void;
  onChangeLanguage: (lang: ProgrammingLanguage) => void;
  onUpdateAccountSecurity: (patch: {
    avatarColor?: AccountAvatarColor;
    pin?: string | null;
    currentPin?: string;
  }) => ActionResult;
  onOpenAccountSwitcher: () => void;
  onCreateNewAccount: () => void;
  onLogout: () => void;
  onDeleteAccount: (id: string, pin?: string) => ActionResult;
  onExportAccount: () => ExportAccountResult;
  onImportAccount: (rawJson: string) => ImportAccountResult;
  onOpenExplorerQuiz: () => void;
  onResetProgress: () => void;
}

export function ProfileView({
  activeAccount,
  accountsCount,
  profile,
  progress,
  forceMobile = false,
  onToggleMobileMode,
  onUpdateProfile,
  onChangeLanguage,
  onUpdateAccountSecurity,
  onOpenAccountSwitcher,
  onCreateNewAccount,
  onLogout,
  onDeleteAccount,
  onExportAccount,
  onImportAccount,
  onOpenExplorerQuiz,
  onResetProgress,
}: ProfileViewProps) {
  const [nameInput, setNameInput] = useState(profile.name);
  const [goalInput, setGoalInput] = useState(profile.goal);
  const [confirmingReset, setConfirmingReset] = useState(false);

  // PIN Security Editor State
  const [pinMode, setPinMode] = useState<'idle' | 'set' | 'remove'>('idle');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinFeedback, setPinFeedback] = useState<string | null>(null);

  // Delete Account Confirmation State
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePinInput, setDeletePinInput] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Backup / Restore feedback
  const [backupError, setBackupError] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement | null>(null);

  // Portfolio viewer & clipboard state
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [copiedProjectId, setCopiedProjectId] = useState<string | null>(null);

  useEffect(() => {
    setNameInput(profile.name);
    setGoalInput(profile.goal);
  }, [profile.name, profile.goal]);

  const rank = getRankForXp(progress.xp);
  const avatarStyle = getAvatarColorStyle(activeAccount.avatarColor);
  const hasPin = Boolean(activeAccount.pin);
  const activeLangMeta = getLanguageMeta(profile.programmingLanguage);
  const recommendedLang = getRecommendedLanguage(profile.careerTrack);
  const completedLessonsSet = new Set(progress.completedLessonIds ?? []);
  const completedValidLessonsCount = ALL_LESSONS.filter((l) => completedLessonsSet.has(l.id)).length;
  const completedProjects = progress.completedProjects ?? [];
  const passedExamIds = progress.passedExamModuleIds ?? [];

  const handleExportBackup = () => {
    setBackupError(null);
    const res = onExportAccount();
    if (!res.ok) {
      setBackupError(res.error ?? 'Não foi possível exportar o backup desta conta.');
    }
  };

  const handleCopyProjectCode = async (projectId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedProjectId(projectId);
      setTimeout(() => {
        setCopiedProjectId((prev) => (prev === projectId ? null : prev));
      }, 2200);
    } catch {
      // Clipboard API fallback when restricted by browser permissions
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopiedProjectId(projectId);
        setTimeout(() => {
          setCopiedProjectId((prev) => (prev === projectId ? null : prev));
        }, 2200);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handleImportBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBackupError(null);
    try {
      const text = await file.text();
      const res = onImportAccount(text);
      if (!res.ok) {
        setBackupError(res.error ?? 'Arquivo de backup inválido.');
      }
    } catch {
      setBackupError('Não foi possível ler o arquivo selecionado.');
    }
  };

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim().length < 2) return;
    onUpdateProfile({
      name: nameInput.trim(),
      goal: goalInput.trim() || profile.goal,
    });
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinFeedback(null);
    const res = onUpdateAccountSecurity({
      pin: newPinInput,
      currentPin: hasPin ? currentPinInput : undefined,
    });
    if (!res.ok) {
      setPinFeedback(res.error ?? 'Não foi possível salvar o PIN.');
      return;
    }
    setPinMode('idle');
    setCurrentPinInput('');
    setNewPinInput('');
  };

  const handleRemovePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinFeedback(null);
    const res = onUpdateAccountSecurity({
      pin: null,
      currentPin: currentPinInput,
    });
    if (!res.ok) {
      setPinFeedback(res.error ?? 'PIN atual incorreto.');
      return;
    }
    setPinMode('idle');
    setCurrentPinInput('');
    setNewPinInput('');
  };

  const handleConfirmDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    const res = onDeleteAccount(activeAccount.id, hasPin ? deletePinInput : undefined);
    if (!res.ok) {
      setDeleteError(res.error ?? 'Não foi possível excluir a conta.');
      return;
    }
    setConfirmingDelete(false);
    setDeletePinInput('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Summary */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#111827] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-display font-bold text-lg shrink-0 ${avatarStyle.bgClass} ${avatarStyle.textClass} ${avatarStyle.borderClass}`}
          >
            {getInitials(profile.name)}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-cyan-300">
              Nível {rank.level} · {rank.title} · {activeLangMeta.name} ({activeLangMeta.extension}) · {hasPin ? 'Protegida por PIN' : 'Acesso direto'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{profile.name}</h1>
            <p className="text-sm text-slate-400">{profile.goal}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
          <div>
            <p className="text-xs text-slate-400">XP Total</p>
            <p className="text-xl font-bold font-mono text-cyan-300 tabular-nums">{progress.xp}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Aulas</p>
            <p className="text-xl font-bold font-mono text-white tabular-nums">
              {completedValidLessonsCount}/{ALL_LESSONS.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Code Reviews</p>
            <p className="text-xl font-bold font-mono text-purple-300 tabular-nums">
              {progress.reviewsReceivedCount}
            </p>
          </div>
        </div>
      </section>

      {/* Multi-Account Switcher & PIN Security Section */}
      <section className="p-6 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Contas neste dispositivo & Segurança</h2>
            <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
              {accountsCount} {accountsCount === 1 ? 'conta local cadastrada' : 'contas locais cadastradas'} · Progresso 100% isolado por estudante
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onToggleMobileMode && (
              <button
                type="button"
                onClick={onToggleMobileMode}
                className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                  forceMobile
                    ? 'text-cyan-100 bg-cyan-500/20 border-cyan-400/50'
                    : 'text-slate-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border-white/10'
                }`}
              >
                {forceMobile ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                {forceMobile ? 'Voltar ao Modo Auto' : 'Modo Celular'}
              </button>
            )}
            <button
              type="button"
              onClick={onOpenAccountSwitcher}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-cyan-100 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/35 rounded-lg transition-colors whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5" />
              Trocar de conta
            </button>
            <button
              type="button"
              onClick={onCreateNewAccount}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova conta
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/25 rounded-lg transition-colors whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair da conta
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 border-t border-white/[0.06]">
          {/* Avatar Color Picker */}
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-semibold text-slate-200">Cor do avatar desta conta</p>
            <div className="flex flex-wrap items-center gap-2.5">
              {ACCOUNT_AVATAR_COLORS.map((c) => {
                const active = activeAccount.avatarColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onUpdateAccountSecurity({ avatarColor: c.id })}
                    aria-label={`Selecionar cor ${c.label}`}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${c.bgClass} ${c.textClass} ${
                      active
                        ? `${c.borderClass} ring-2 ring-white/40`
                        : 'border-white/10 opacity-75 hover:opacity-100'
                    }`}
                  >
                    {active && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional 4-Digit PIN Management */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <KeyRound className="w-4 h-4 text-amber-300" />
                <span>Proteção por PIN (4 dígitos)</span>
                <span className={hasPin ? 'text-emerald-400 font-normal' : 'text-slate-400 font-normal'}>
                  · {hasPin ? 'Ativo' : 'Desativado'}
                </span>
              </div>

              {pinMode === 'idle' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPinMode('set');
                      setCurrentPinInput('');
                      setNewPinInput('');
                      setPinFeedback(null);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-cyan-200 bg-cyan-500/12 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-lg transition-colors"
                  >
                    {hasPin ? 'Alterar PIN' : 'Definir PIN'}
                  </button>
                  {hasPin && (
                    <button
                      type="button"
                      onClick={() => {
                        setPinMode('remove');
                        setCurrentPinInput('');
                        setPinFeedback(null);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white border border-white/10 rounded-lg transition-colors"
                    >
                      Remover PIN
                    </button>
                  )}
                </div>
              )}
            </div>

            {pinMode === 'idle' && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {hasPin
                  ? 'Ao trocar de conta ou entrar neste aparelho, os 4 dígitos serão solicitados para proteger seu progresso.'
                  : 'Opcional: adicione um PIN numérico de 4 dígitos se outras pessoas também usarem este dispositivo.'}
              </p>
            )}

            {pinMode === 'set' && (
              <form
                onSubmit={handleSavePin}
                className="p-4 rounded-xl bg-[#0B0F19] border border-white/[0.08] space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hasPin && (
                    <div className="space-y-1">
                      <label htmlFor="current-pin" className="block text-xs text-slate-400">
                        PIN atual
                      </label>
                      <input
                        id="current-pin"
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={currentPinInput}
                        onChange={(e) => {
                          setCurrentPinInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                          setPinFeedback(null);
                        }}
                        placeholder="••••"
                        className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#111827] border border-white/10 font-mono text-base sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label htmlFor="new-pin" className="block text-xs text-slate-400">
                      Novo PIN (4 dígitos)
                    </label>
                    <input
                      id="new-pin"
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={newPinInput}
                      onChange={(e) => {
                        setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                        setPinFeedback(null);
                      }}
                      placeholder="Ex: 1234"
                      className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#111827] border border-white/10 font-mono text-base sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {pinFeedback && <p className="text-xs text-rose-400">{pinFeedback}</p>}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPinMode('idle');
                      setPinFeedback(null);
                    }}
                    className="px-3 py-2 text-xs text-slate-300 hover:text-white border border-white/10 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={newPinInput.length !== 4 || (hasPin && currentPinInput.length !== 4)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B0F19] bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 rounded-lg transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Salvar PIN
                  </button>
                </div>
              </form>
            )}

            {pinMode === 'remove' && (
              <form
                onSubmit={handleRemovePin}
                className="p-4 rounded-xl bg-[#0B0F19] border border-white/[0.08] space-y-3"
              >
                <div className="space-y-1">
                  <label htmlFor="remove-pin-input" className="block text-xs text-slate-300">
                    Confirme seu PIN atual para desativar a proteção:
                  </label>
                  <input
                    id="remove-pin-input"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={currentPinInput}
                    onChange={(e) => {
                      setCurrentPinInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                      setPinFeedback(null);
                    }}
                    placeholder="••••"
                    className="w-full sm:w-48 min-h-[44px] px-3 py-2 rounded-lg bg-[#111827] border border-white/10 font-mono text-base sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                {pinFeedback && <p className="text-xs text-rose-400">{pinFeedback}</p>}
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPinMode('idle');
                      setPinFeedback(null);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-300 hover:text-white border border-white/10 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={currentPinInput.length !== 4}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 rounded-lg transition-colors"
                  >
                    Remover PIN
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Backup & Restore Account JSON */}
        <div className="pt-5 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-200">Backup e restauração da conta (.json)</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Salve um arquivo com todo o progresso de {profile.name} (XP, códigos por linguagem, conquistas e histórico) ou restaure outro perfil neste aparelho.
            </p>
            {backupError && <p className="text-xs text-rose-400 mt-1.5">{backupError}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-200 bg-emerald-500/12 hover:bg-emerald-500/20 border border-emerald-400/30 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Backup (.json)
            </button>
            <button
              type="button"
              onClick={() => {
                setBackupError(null);
                importFileRef.current?.click();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-lg transition-colors whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              Importar Conta (.json)
            </button>
            <input
              ref={importFileRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportBackupFile}
              className="hidden"
              aria-label="Importar backup de conta em JSON"
            />
          </div>
        </div>
      </section>

      {/* Programming Language Switcher */}
      <section className="p-6 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className={`w-4 h-4 ${activeLangMeta.accentTextClass}`} />
              <h2 className="text-lg font-bold text-white">Linguagem de Programação</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Salva apenas na conta de {profile.name}. A IDE, os desafios da Arena e o Professor Doutor I.A. se adaptam imediatamente.
            </p>
          </div>
          <span className={`text-xs font-mono font-semibold ${activeLangMeta.accentTextClass} shrink-0`}>
            Ativa: {activeLangMeta.runtimeLabel}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-white/[0.06] text-xs text-slate-300 leading-relaxed">
          <strong className="text-cyan-300">Recomendação para sua trilha:</strong>{' '}
          {getRecommendationReason(profile.careerTrack)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROGRAMMING_LANGUAGES.map((lang) => {
            const active = profile.programmingLanguage === lang.id;
            const isRecommended = recommendedLang === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => onChangeLanguage(lang.id)}
                className={`text-left p-4 rounded-xl border transition-colors space-y-1.5 flex flex-col justify-between ${
                  active
                    ? `${lang.accentBgClass} ${lang.accentBorderClass} text-white`
                    : 'bg-[#0B0F19] border-white/[0.08] text-slate-300 hover:border-white/20'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{lang.name}</span>
                      <span className={`text-xs font-mono ${lang.accentTextClass}`}>
                        {lang.extension}
                      </span>
                    </div>
                    {active && <Check className={`w-4 h-4 shrink-0 ${lang.accentTextClass}`} />}
                  </div>
                  {isRecommended && (
                    <p className="text-[11px] font-medium text-cyan-300">
                      Recomendada para sua trilha
                    </p>
                  )}
                  <p className="text-xs text-slate-400 leading-relaxed">{lang.tagline}</p>
                </div>
                <p className="text-[11px] text-slate-500 pt-2 border-t border-white/[0.06]">
                  {lang.universityFocus}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Track Switcher */}
      <section className="p-6 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Área de Interesse & Trilha</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Troque a qualquer momento. Todas as aulas e respostas do Professor I.A. se adaptam imediatamente.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenExplorerQuiz}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-cyan-200 bg-cyan-500/12 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <Compass className="w-4 h-4" />
            Diagnóstico do Modo Explorador
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CAREER_TRACKS.map((track) => {
            const active = profile.careerTrack === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => onUpdateProfile({ careerTrack: track.id as CareerTrackId })}
                className={`text-left p-4 rounded-xl border transition-colors space-y-1.5 ${
                  active
                    ? 'bg-cyan-500/12 border-cyan-400 text-white'
                    : 'bg-[#0B0F19] border-white/[0.08] text-slate-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white">{track.name}</span>
                  {active && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{track.tagline}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Edit Personal Info & Level */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSaveIdentity}
          className="lg:col-span-6 p-6 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-4"
        >
          <h2 className="text-lg font-bold text-white">Dados do estudante</h2>

          <div className="space-y-1.5">
            <label htmlFor="profile-name" className="block text-xs font-medium text-slate-300">
              Nome
            </label>
            <input
              id="profile-name"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-base sm:text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-goal" className="block text-xs font-medium text-slate-300">
              Objetivo principal
            </label>
            <input
              id="profile-goal"
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-base sm:text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-300">Nível declarado</p>
            <div className="grid grid-cols-2 gap-2.5">
              {(
                [
                  { id: 'zero', label: 'Nunca programei' },
                  { id: 'basico', label: 'Básico de lógica' },
                ] as { id: InitialLevel; label: string }[]
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onUpdateProfile({ initialLevel: lvl.id })}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    profile.initialLevel === lvl.id
                      ? 'bg-purple-500/15 border-purple-400 text-white'
                      : 'bg-[#0B0F19] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 text-sm font-semibold text-[#0B0F19] bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors"
          >
            Salvar alterações
          </button>
        </form>

        {/* Module Mastery Breakdown */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-white">Domínio por módulo</h2>
            <span className="text-xs font-mono text-emerald-300 tabular-nums">
              Provas: {passedExamIds.length}/{CURRICULUM_MODULES.length}
            </span>
          </div>
          <div className="space-y-3.5">
            {CURRICULUM_MODULES.map((mod) => {
              const done = mod.lessons.filter((l) =>
                progress.completedLessonIds.includes(l.id)
              ).length;
              const pct = Math.round((done / mod.lessons.length) * 100);
              const passedExam = passedExamIds.includes(mod.id);
              return (
                <div key={mod.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-200 font-medium truncate">
                      {mod.number}. {mod.title}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {passedExam && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300">
                          <ShieldCheck className="w-3 h-3" />
                          Prova OK
                        </span>
                      )}
                      <span className="font-mono text-slate-400 tabular-nums">
                        {done}/{mod.lessons.length} ({pct}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-transform duration-300 origin-left"
                      style={{ transform: `scaleX(${pct / 100})` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portfolio of Completed Mini-Projects */}
      <section className="p-6 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Portfólio de Projetos</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Projetos completos construídos na Oficina de Projetos da Arena e salvos na conta de {profile.name}.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums shrink-0">
            {completedProjects.length}{' '}
            {completedProjects.length === 1 ? 'projeto concluído' : 'projetos concluídos'}
          </span>
        </div>

        {completedProjects.length === 0 ? (
          <div className="p-5 rounded-xl bg-[#0B0F19] border border-white/[0.06] text-xs text-slate-400 leading-relaxed">
            Você ainda não finalizou nenhum mini-projeto. Acesse a aba <strong className="text-white">Arena</strong> &rarr; <strong className="text-emerald-300">Oficina de Projetos</strong> para construir um projeto guiado em 3 etapas ou criar um com sua própria ideia.
          </div>
        ) : (
          <div className="space-y-3">
            {completedProjects.map((proj) => {
              const projLang = getLanguageMeta(proj.language);
              const isExpanded = expandedProjectId === proj.id;
              const isCopied = copiedProjectId === proj.id;
              const formattedDate = (() => {
                const d = new Date(proj.completedAt);
                return Number.isNaN(d.getTime())
                  ? ''
                  : d.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    });
              })();

              return (
                <div
                  key={`${proj.id}-${proj.completedAt}`}
                  className="rounded-xl bg-[#0B0F19] border border-white/[0.08] overflow-hidden"
                >
                  <div className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`font-mono font-semibold ${projLang.accentTextClass}`}>
                          {projLang.name} ({projLang.extension})
                        </span>
                        {formattedDate && (
                          <span className="text-slate-500">· Concluído em {formattedDate}</span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white">{proj.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{proj.summary}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedProjectId(isExpanded ? null : proj.id)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-200 bg-cyan-500/12 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-lg transition-colors whitespace-nowrap"
                      >
                        {isExpanded ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        {isExpanded ? 'Ocultar código' : 'Ver código'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyProjectCode(proj.id, proj.code)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-lg transition-colors whitespace-nowrap"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {isCopied ? 'Copiado!' : 'Copiar código'}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-white/[0.06] bg-[#080C15] p-4 overflow-x-auto">
                      <pre className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre">
                        <code>{proj.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Achievements Gallery */}
      <section className="p-6 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-white">Conquistas Universitárias</h2>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {progress.unlockedBadges.length} de {ACHIEVEMENTS.length} desbloqueadas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {ACHIEVEMENTS.map((badge) => {
            const unlocked = progress.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border space-y-2 ${
                  unlocked
                    ? 'bg-emerald-500/8 border-emerald-400/35'
                    : 'bg-[#0B0F19]/70 border-white/[0.06] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {unlocked ? (
                    <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <span className={`text-[11px] font-medium ${unlocked ? 'text-emerald-300' : 'text-slate-500'}`}>
                    {unlocked ? 'Desbloqueada' : 'Bloqueada'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">{badge.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Safe In-App Reset & Account Deletion Zone */}
      <section className="p-5 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Reiniciar progresso desta conta</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Zera apenas o XP, aulas e histórico de {profile.name}, sem afetar outras contas salvas no aparelho.
            </p>
          </div>

          {!confirmingReset ? (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:bg-amber-500/10 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar progresso
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white border border-white/10 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingReset(false);
                  onResetProgress();
                }}
                className="px-3.5 py-2 text-xs font-semibold text-[#0B0F19] bg-amber-400 hover:bg-amber-300 rounded-lg"
              >
                Confirmar reinício
              </button>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-rose-300">Excluir conta deste dispositivo</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Remove permanentemente o perfil de {profile.name} e todos os seus dados locais.
            </p>
          </div>

          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => {
                setConfirmingDelete(true);
                setDeletePinInput('');
                setDeleteError(null);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-300 hover:text-rose-200 border border-rose-500/30 hover:bg-rose-500/10 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Excluir conta
            </button>
          ) : (
            <form onSubmit={handleConfirmDeleteAccount} className="flex flex-wrap items-center gap-2">
              {hasPin && (
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={deletePinInput}
                  onChange={(e) => {
                    setDeletePinInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                    setDeleteError(null);
                  }}
                  placeholder="PIN atual"
                  className="w-32 min-h-[42px] px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-white/15 font-mono text-base sm:text-xs text-white focus:outline-none focus:border-rose-400"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setConfirmingDelete(false);
                  setDeleteError(null);
                }}
                className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white border border-white/10 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={hasPin && deletePinInput.length !== 4}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 rounded-lg"
              >
                Confirmar exclusão
              </button>
            </form>
          )}
        </div>
        {deleteError && <p className="text-xs text-rose-400">{deleteError}</p>}
      </section>
    </div>
  );
}
