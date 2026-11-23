import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getLanguageMeta,
  getRecommendedLanguage,
  isValidProgrammingLanguage,
} from '../data/languages';
import { ACHIEVEMENTS } from '../data/tracks';
import {
  AccountAvatarColor,
  CareerTrackId,
  CompletedProject,
  InitialLevel,
  LocalAccount,
  MultiAccountStorage,
  ProgrammingLanguage,
  SavedTutorMessage,
  StudentProfile,
  StudentProgress,
} from '../types';

const MULTI_ACCOUNT_KEY = 'codeforge_uni_accounts_v2';
const LEGACY_PROFILE_KEY = 'codeforge_uni_profile_v1';
const LEGACY_PROGRESS_KEY = 'codeforge_uni_progress_v1';

const VALID_TRACKS = new Set<CareerTrackId>(['explorador', 'jogos', 'web', 'dados', 'sistemas']);
const VALID_LEVELS = new Set<InitialLevel>(['zero', 'basico', 'intermediario']);

export const ACCOUNT_AVATAR_COLORS: {
  id: AccountAvatarColor;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}[] = [
  { id: 'cyan', label: 'Ciano', bgClass: 'bg-cyan-500/20', textClass: 'text-cyan-300', borderClass: 'border-cyan-400/50' },
  { id: 'purple', label: 'Roxo', bgClass: 'bg-purple-500/20', textClass: 'text-purple-300', borderClass: 'border-purple-400/50' },
  { id: 'emerald', label: 'Esmeralda', bgClass: 'bg-emerald-500/20', textClass: 'text-emerald-300', borderClass: 'border-emerald-400/50' },
  { id: 'amber', label: 'Âmbar', bgClass: 'bg-amber-500/20', textClass: 'text-amber-300', borderClass: 'border-amber-400/50' },
  { id: 'rose', label: 'Rosa', bgClass: 'bg-rose-500/20', textClass: 'text-rose-300', borderClass: 'border-rose-400/50' },
  { id: 'indigo', label: 'Índigo', bgClass: 'bg-indigo-500/20', textClass: 'text-indigo-300', borderClass: 'border-indigo-400/50' },
];

export function getLessonCodeStorageKey(
  lessonId: string,
  language: ProgrammingLanguage
): string {
  return `${lessonId}::${language}`;
}

/**
 * Loads saved code strictly isolated by lesson + language.
 * Falls back to legacy bare `lessonId` key ONLY for JavaScript so JS code
 * never leaks into Python, Java, C#, or C++ editors.
 */
export function getSavedLessonCode(
  savedCodeByLesson: Record<string, string> | undefined,
  lessonId: string,
  language: ProgrammingLanguage
): string | undefined {
  if (!savedCodeByLesson) return undefined;
  const compositeKey = getLessonCodeStorageKey(lessonId, language);
  if (typeof savedCodeByLesson[compositeKey] === 'string') {
    return savedCodeByLesson[compositeKey];
  }
  if (language === 'javascript' && typeof savedCodeByLesson[lessonId] === 'string') {
    return savedCodeByLesson[lessonId];
  }
  return undefined;
}

export function getAvatarColorStyle(color: AccountAvatarColor) {
  return ACCOUNT_AVATAR_COLORS.find((c) => c.id === color) ?? ACCOUNT_AVATAR_COLORS[0];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CF';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function todayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(`${dateA}T00:00:00`).getTime();
  const b = new Date(`${dateB}T00:00:00`).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function generateAccountId(): string {
  return `acc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

function uniqueStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of value) {
    if (typeof item === 'string' && item.trim().length > 0 && !seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}

function safeNonNegativeInt(value: unknown, fallback = 0): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}

function sanitizeSavedCodeMap(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k === 'string' && k.length > 0 && typeof v === 'string') {
      result[k] = v;
    }
  }
  return result;
}

function sanitizeProfessorHistory(raw: unknown): SavedTutorMessage[] {
  if (!Array.isArray(raw)) return [];
  const clean: SavedTutorMessage[] = [];
  for (let i = 0; i < raw.length; i++) {
    const entry = raw[i];
    if (!entry || typeof entry !== 'object') continue;
    const rec = entry as Partial<SavedTutorMessage>;
    if ((rec.role !== 'user' && rec.role !== 'assistant') || typeof rec.text !== 'string') {
      continue;
    }
    const text = rec.text.trim();
    if (!text) continue;
    clean.push({
      id: typeof rec.id === 'number' && Number.isFinite(rec.id) ? rec.id : Date.now() + i,
      role: rec.role,
      text,
      codeSnippet: typeof rec.codeSnippet === 'string' && rec.codeSnippet.trim() ? rec.codeSnippet : undefined,
      structured:
        rec.structured && typeof rec.structured === 'object' && typeof rec.structured.explicacao === 'string'
          ? rec.structured
          : undefined,
    });
  }
  return clean.slice(-30);
}

function createDefaultProfile(overrides?: Partial<StudentProfile>): StudentProfile {
  const safeLanguage: ProgrammingLanguage = isValidProgrammingLanguage(overrides?.programmingLanguage)
    ? overrides.programmingLanguage
    : 'javascript';
  const safeTrack: CareerTrackId =
    typeof overrides?.careerTrack === 'string' && VALID_TRACKS.has(overrides.careerTrack as CareerTrackId)
      ? (overrides.careerTrack as CareerTrackId)
      : 'explorador';
  const rawLevel = overrides?.experienceLevel ?? overrides?.initialLevel;
  const safeLevel: InitialLevel =
    typeof rawLevel === 'string' && VALID_LEVELS.has(rawLevel as InitialLevel)
      ? (rawLevel as InitialLevel)
      : 'zero';

  return {
    name: typeof overrides?.name === 'string' ? overrides.name : '',
    goal:
      typeof overrides?.goal === 'string' && overrides.goal.trim().length > 0
        ? overrides.goal.trim()
        : 'Entrar na faculdade de tecnologia preparado e avançado',
    initialLevel: safeLevel,
    experienceLevel: safeLevel,
    careerTrack: safeTrack,
    programmingLanguage: safeLanguage,
    onboardingComplete: Boolean(overrides?.onboardingComplete),
    createdAt: typeof overrides?.createdAt === 'string' && overrides.createdAt ? overrides.createdAt : todayIsoDate(),
  };
}

function sanitizeCompletedProjects(raw: unknown): CompletedProject[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const clean: CompletedProject[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Partial<CompletedProject>;
    if (typeof rec.id !== 'string' || !rec.id.trim() || seen.has(rec.id)) continue;
    seen.add(rec.id);
    clean.push({
      id: rec.id.trim(),
      title: typeof rec.title === 'string' && rec.title.trim() ? rec.title.trim() : 'Mini-Projeto',
      language: isValidProgrammingLanguage(rec.language) ? rec.language : 'javascript',
      summary: typeof rec.summary === 'string' ? rec.summary.trim() : '',
      code: typeof rec.code === 'string' ? rec.code : '',
      completedAt:
        typeof rec.completedAt === 'string' && rec.completedAt
          ? rec.completedAt
          : new Date().toISOString(),
    });
  }
  return clean;
}

function createDefaultProgress(overrides?: Partial<StudentProgress>): StudentProgress {
  return {
    xp: safeNonNegativeInt(overrides?.xp, 0),
    streakDays: Math.max(1, safeNonNegativeInt(overrides?.streakDays, 1)),
    lastActiveDate:
      typeof overrides?.lastActiveDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(overrides.lastActiveDate)
        ? overrides.lastActiveDate
        : todayIsoDate(),
    completedLessonIds: uniqueStringArray(overrides?.completedLessonIds),
    completedDebugIds: uniqueStringArray(overrides?.completedDebugIds),
    completedAiChallengesCount: safeNonNegativeInt(overrides?.completedAiChallengesCount, 0),
    reviewsReceivedCount: safeNonNegativeInt(overrides?.reviewsReceivedCount, 0),
    hintsUsedCount: safeNonNegativeInt(overrides?.hintsUsedCount, 0),
    explorerQuizDone: Boolean(overrides?.explorerQuizDone),
    savedCodeByLesson: sanitizeSavedCodeMap(overrides?.savedCodeByLesson),
    unlockedBadges: uniqueStringArray(overrides?.unlockedBadges),
    favoriteGlossaryIds: uniqueStringArray(overrides?.favoriteGlossaryIds),
    professorHistory: sanitizeProfessorHistory(overrides?.professorHistory),
    passedExamModuleIds: uniqueStringArray(overrides?.passedExamModuleIds),
    completedProjects: sanitizeCompletedProjects(overrides?.completedProjects),
  };
}

function refreshStreak(progress: StudentProgress): StudentProgress {
  const today = todayIsoDate();
  if (!progress.lastActiveDate) {
    return { ...progress, lastActiveDate: today, streakDays: 1 };
  }
  const diff = daysBetween(progress.lastActiveDate, today);
  if (diff === 1) {
    return { ...progress, lastActiveDate: today, streakDays: progress.streakDays + 1 };
  }
  if (diff > 1) {
    return { ...progress, lastActiveDate: today, streakDays: 1 };
  }
  return progress;
}

function normalizeAccount(raw: Partial<LocalAccount>): LocalAccount {
  const createdAt =
    (typeof raw.createdAt === 'string' && raw.createdAt) ||
    (typeof raw.profile?.createdAt === 'string' && raw.profile.createdAt) ||
    todayIsoDate();
  const safeName =
    (typeof raw.profile?.name === 'string' && raw.profile.name.trim()) ||
    (typeof raw.name === 'string' && raw.name.trim()) ||
    'Estudante';

  const profile = createDefaultProfile({
    ...raw.profile,
    name: safeName,
    onboardingComplete: true,
    createdAt,
  });
  const progress = createDefaultProgress(raw.progress);
  const validColor = ACCOUNT_AVATAR_COLORS.some((c) => c.id === raw.avatarColor)
    ? (raw.avatarColor as AccountAvatarColor)
    : 'cyan';

  return {
    id: typeof raw.id === 'string' && raw.id.trim().length > 0 ? raw.id.trim() : generateAccountId(),
    name: profile.name,
    avatarColor: validColor,
    pin: typeof raw.pin === 'string' && isValidPin(raw.pin) ? raw.pin : undefined,
    createdAt,
    lastActiveAt:
      typeof raw.lastActiveAt === 'string' && raw.lastActiveAt
        ? raw.lastActiveAt
        : new Date().toISOString(),
    profile,
    progress,
  };
}

function loadMultiAccountStorage(): MultiAccountStorage {
  try {
    const rawMulti = localStorage.getItem(MULTI_ACCOUNT_KEY);
    if (rawMulti) {
      const parsed = JSON.parse(rawMulti) as Partial<MultiAccountStorage>;
      const accounts = Array.isArray(parsed.accounts)
        ? parsed.accounts.map((acc) => normalizeAccount(acc))
        : [];
      const activeExists =
        typeof parsed.activeAccountId === 'string' &&
        accounts.some((a) => a.id === parsed.activeAccountId);

      const activeAccountId = activeExists ? (parsed.activeAccountId as string) : null;
      const updatedAccounts = accounts.map((acc) =>
        acc.id === activeAccountId
          ? { ...acc, progress: refreshStreak(acc.progress), lastActiveAt: new Date().toISOString() }
          : acc
      );

      return { accounts: updatedAccounts, activeAccountId };
    }

    // Automatic migration from legacy single-account localStorage format
    const legacyProfileRaw = localStorage.getItem(LEGACY_PROFILE_KEY);
    const legacyProgressRaw = localStorage.getItem(LEGACY_PROGRESS_KEY);

    if (legacyProfileRaw || legacyProgressRaw) {
      const legacyProfile = legacyProfileRaw
        ? createDefaultProfile(JSON.parse(legacyProfileRaw))
        : createDefaultProfile();
      const legacyProgress = legacyProgressRaw
        ? refreshStreak(createDefaultProgress(JSON.parse(legacyProgressRaw)))
        : createDefaultProgress();

      const hasLegacyData =
        legacyProfile.onboardingComplete ||
        legacyProfile.name.trim().length > 0 ||
        legacyProgress.xp > 0 ||
        legacyProgress.completedLessonIds.length > 0;

      if (hasLegacyData) {
        const migratedId = generateAccountId();
        const migratedName = legacyProfile.name.trim() || 'Estudante';
        const migratedAccount: LocalAccount = {
          id: migratedId,
          name: migratedName,
          avatarColor: 'cyan',
          createdAt: legacyProfile.createdAt || todayIsoDate(),
          lastActiveAt: new Date().toISOString(),
          profile: {
            ...legacyProfile,
            name: migratedName,
            onboardingComplete: true,
          },
          progress: legacyProgress,
        };

        const migratedStorage: MultiAccountStorage = {
          accounts: [migratedAccount],
          activeAccountId: migratedId,
        };
        localStorage.setItem(MULTI_ACCOUNT_KEY, JSON.stringify(migratedStorage));
        return migratedStorage;
      }
    }
  } catch {
    // Fallback cleanly if storage is corrupted or unavailable
  }

  return { accounts: [], activeAccountId: null };
}

export interface ToastNotice {
  id: number;
  title: string;
  subtitle?: string;
  tone: 'success' | 'info';
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export interface ExportAccountResult extends ActionResult {
  json?: string;
  filename?: string;
}

export interface ImportAccountResult extends ActionResult {
  account?: LocalAccount;
  requiresPin?: boolean;
}

function slugifyFilename(name: string): string {
  const cleaned = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'estudante';
}

export function useCodeForgeStore() {
  const [storage, setStorage] = useState<MultiAccountStorage>(() => loadMultiAccountStorage());
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const [resetVersion, setResetVersion] = useState(0);

  // Ref keeps latest storage accessible synchronously for pure notice calculation & exports
  const storageRef = useRef(storage);
  storageRef.current = storage;

  const showToast = useCallback(
    (title: string, subtitle?: string, tone: 'success' | 'info' = 'success') => {
      setToast({ id: Date.now() + Math.random(), title, subtitle, tone });
    },
    []
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    try {
      localStorage.setItem(MULTI_ACCOUNT_KEY, JSON.stringify(storage));
    } catch {
      // Ignore storage quota errors
    }
  }, [storage]);

  const activeAccount = useMemo<LocalAccount | null>(() => {
    if (!storage.activeAccountId) return null;
    return storage.accounts.find((a) => a.id === storage.activeAccountId) ?? null;
  }, [storage]);

  const profile = useMemo<StudentProfile>(
    () => activeAccount?.profile ?? createDefaultProfile(),
    [activeAccount]
  );

  const progress = useMemo<StudentProgress>(
    () => activeAccount?.progress ?? createDefaultProgress(),
    [activeAccount]
  );

  const mutateActiveAccount = useCallback(
    (mutator: (account: LocalAccount) => LocalAccount, expectedAccountId?: string) => {
      setStorage((prev) => {
        const targetId = expectedAccountId ?? prev.activeAccountId;
        if (!targetId) return prev;
        if (expectedAccountId && !prev.accounts.some((a) => a.id === expectedAccountId)) {
          return prev;
        }
        return {
          ...prev,
          accounts: prev.accounts.map((acc) => (acc.id === targetId ? mutator(acc) : acc)),
        };
      });
    },
    []
  );

  const applyProgressUpdate = useCallback(
    (
      updater: (prev: StudentProgress) => StudentProgress,
      notice?: { title: string; subtitle?: string }
    ) => {
      const currentSnap = storageRef.current;
      const currentActive = currentSnap.activeAccountId
        ? currentSnap.accounts.find((a) => a.id === currentSnap.activeAccountId) ?? null
        : null;

      if (!currentActive) return;

      // Compute newly unlocked badge purely against snapshot so toast never drops under React batching
      const previewNext = updater(currentActive.progress);
      const previewUnlocked = ACHIEVEMENTS.filter(
        (badge) => !previewNext.unlockedBadges.includes(badge.id) && badge.check(previewNext)
      );

      setStorage((prev) => {
        if (!prev.activeAccountId) return prev;
        const accounts = prev.accounts.map((acc) => {
          if (acc.id !== prev.activeAccountId) return acc;
          const nextBase = updater(acc.progress);
          const newlyUnlocked: string[] = [];
          for (const badge of ACHIEVEMENTS) {
            if (!nextBase.unlockedBadges.includes(badge.id) && badge.check(nextBase)) {
              newlyUnlocked.push(badge.id);
            }
          }
          const nextProgress: StudentProgress = {
            ...nextBase,
            lastActiveDate: todayIsoDate(),
            unlockedBadges:
              newlyUnlocked.length > 0
                ? [...nextBase.unlockedBadges, ...newlyUnlocked]
                : nextBase.unlockedBadges,
          };

          return {
            ...acc,
            lastActiveAt: new Date().toISOString(),
            progress: nextProgress,
          };
        });

        return { ...prev, accounts };
      });

      if (previewUnlocked.length > 0) {
        const firstBadge = previewUnlocked[0];
        showToast(
          `Conquista desbloqueada: ${firstBadge.title}`,
          notice?.title ?? firstBadge.description,
          'success'
        );
      } else if (notice) {
        showToast(notice.title, notice.subtitle, 'success');
      }
    },
    [showToast]
  );

  const createAccount = useCallback(
    (data: {
      name: string;
      goal: string;
      initialLevel: InitialLevel;
      careerTrack: CareerTrackId;
      programmingLanguage?: ProgrammingLanguage;
      avatarColor?: AccountAvatarColor;
      pin?: string;
    }): LocalAccount => {
      const cleanName = data.name.trim() || 'Estudante';
      const cleanPin = data.pin && isValidPin(data.pin.trim()) ? data.pin.trim() : undefined;
      const color: AccountAvatarColor =
        data.avatarColor ??
        ACCOUNT_AVATAR_COLORS[storageRef.current.accounts.length % ACCOUNT_AVATAR_COLORS.length].id;
      const chosenLanguage: ProgrammingLanguage = isValidProgrammingLanguage(data.programmingLanguage)
        ? data.programmingLanguage
        : getRecommendedLanguage(data.careerTrack);
      const langMeta = getLanguageMeta(chosenLanguage);

      const nowIso = new Date().toISOString();
      const today = todayIsoDate();

      const newAccount: LocalAccount = {
        id: generateAccountId(),
        name: cleanName,
        avatarColor: color,
        pin: cleanPin,
        createdAt: today,
        lastActiveAt: nowIso,
        profile: createDefaultProfile({
          name: cleanName,
          goal: data.goal,
          initialLevel: data.initialLevel,
          experienceLevel: data.initialLevel,
          careerTrack: data.careerTrack,
          programmingLanguage: chosenLanguage,
          onboardingComplete: true,
          createdAt: today,
        }),
        progress: createDefaultProgress(),
      };

      setStorage((prev) => ({
        accounts: [...prev.accounts, newAccount],
        activeAccountId: newAccount.id,
      }));

      showToast(
        `Bem-vindo(a), ${cleanName}`,
        cleanPin
          ? `Conta criada com PIN e ambiente em ${langMeta.name} (${langMeta.extension}).`
          : `Conta local criada em ${langMeta.name} (${langMeta.extension}).`,
        'info'
      );

      return newAccount;
    },
    [showToast]
  );

  const loginAccount = useCallback(
    (id: string, pin?: string): ActionResult => {
      const target = storageRef.current.accounts.find((a) => a.id === id);
      if (!target) {
        return { ok: false, error: 'Conta não encontrada neste dispositivo.' };
      }

      if (target.pin) {
        const entered = (pin ?? '').trim();
        if (!entered) {
          return { ok: false, error: 'Informe o PIN de 4 dígitos para entrar nesta conta.' };
        }
        if (entered !== target.pin) {
          return { ok: false, error: 'PIN incorreto. Verifique os 4 dígitos e tente novamente.' };
        }
      }

      setStorage((prev) => ({
        activeAccountId: target.id,
        accounts: prev.accounts.map((acc) =>
          acc.id === target.id
            ? {
                ...acc,
                lastActiveAt: new Date().toISOString(),
                progress: refreshStreak(acc.progress),
              }
            : acc
        ),
      }));

      showToast(`Sessão ativa: ${target.name}`, 'Seu progresso isolado foi carregado.', 'info');
      return { ok: true };
    },
    [showToast]
  );

  const switchAccount = useCallback(
    (id: string, pin?: string): ActionResult => {
      if (id === storageRef.current.activeAccountId) {
        return { ok: true };
      }
      return loginAccount(id, pin);
    },
    [loginAccount]
  );

  const logoutAccount = useCallback(() => {
    const previousName = activeAccount?.name;
    setStorage((prev) => ({
      ...prev,
      activeAccountId: null,
    }));
    showToast(
      'Sessão encerrada',
      previousName
        ? `O progresso de ${previousName} continua salvo com segurança neste aparelho.`
        : 'Selecione outra conta ou crie um novo perfil.',
      'info'
    );
  }, [activeAccount?.name, showToast]);

  const updateAccountSecurity = useCallback(
    (patch: {
      avatarColor?: AccountAvatarColor;
      pin?: string | null;
      currentPin?: string;
    }): ActionResult => {
      if (!activeAccount) {
        return { ok: false, error: 'Nenhuma conta ativa no momento.' };
      }

      if (patch.pin !== undefined && activeAccount.pin) {
        if ((patch.currentPin ?? '').trim() !== activeAccount.pin) {
          return { ok: false, error: 'PIN atual incorreto.' };
        }
      }

      let nextPin = activeAccount.pin;
      if (patch.pin === null) {
        nextPin = undefined;
      } else if (typeof patch.pin === 'string') {
        const cleaned = patch.pin.trim();
        if (!isValidPin(cleaned)) {
          return { ok: false, error: 'O PIN deve conter exatamente 4 dígitos numéricos.' };
        }
        nextPin = cleaned;
      }

      mutateActiveAccount((acc) => ({
        ...acc,
        avatarColor: patch.avatarColor ?? acc.avatarColor,
        pin: nextPin,
        lastActiveAt: new Date().toISOString(),
      }));

      if (patch.pin === null) {
        showToast('PIN removido', 'Esta conta agora permite acesso direto sem senha.', 'info');
      } else if (typeof patch.pin === 'string') {
        showToast('PIN salvo com segurança', 'Sua conta neste aparelho agora exige os 4 dígitos.', 'success');
      } else if (patch.avatarColor) {
        showToast('Avatar atualizado', 'Cor do perfil alterada com sucesso.', 'info');
      }

      return { ok: true };
    },
    [activeAccount, mutateActiveAccount, showToast]
  );

  const deleteAccount = useCallback(
    (id: string, pin?: string): ActionResult => {
      const target = storageRef.current.accounts.find((a) => a.id === id);
      if (!target) {
        return { ok: false, error: 'Conta não encontrada.' };
      }
      if (target.pin && (pin ?? '').trim() !== target.pin) {
        return { ok: false, error: 'Informe o PIN correto para confirmar a exclusão da conta.' };
      }

      setStorage((prev) => ({
        accounts: prev.accounts.filter((a) => a.id !== id),
        activeAccountId: prev.activeAccountId === id ? null : prev.activeAccountId,
      }));

      showToast('Conta removida', `O perfil "${target.name}" foi excluído deste dispositivo.`, 'info');
      return { ok: true };
    },
    [showToast]
  );

  const exportAccountJson = useCallback(
    (accountId?: string): ExportAccountResult => {
      const snap = storageRef.current;
      const targetId = accountId ?? snap.activeAccountId;
      const target = targetId ? snap.accounts.find((a) => a.id === targetId) : null;

      if (!target) {
        return { ok: false, error: 'Nenhuma conta disponível para exportar backup.' };
      }

      const payload = {
        format: 'codeforge-uni-account-backup',
        version: 1,
        exportedAt: new Date().toISOString(),
        account: target,
      };

      const filename = `codeforge-backup-${slugifyFilename(target.name)}.json`;
      const json = JSON.stringify(payload, null, 2);

      if (typeof document !== 'undefined' && typeof URL !== 'undefined') {
        try {
          const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } catch {
          return { ok: false, error: 'Não foi possível iniciar o download do arquivo de backup.' };
        }
      }

      showToast(
        'Backup exportado',
        `Arquivo ${filename} baixado com todo o progresso de ${target.name}.`,
        'success'
      );

      return {
        ok: true,
        json,
        filename,
      };
    },
    [showToast]
  );

  const importAccountJson = useCallback(
    (rawJson: string): ImportAccountResult => {
      if (typeof rawJson !== 'string' || !rawJson.trim()) {
        return { ok: false, error: 'O arquivo selecionado está vazio.' };
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawJson);
      } catch {
        return { ok: false, error: 'Arquivo JSON inválido. Selecione um backup válido do CodeForge Uni.' };
      }

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { ok: false, error: 'Formato de backup não reconhecido.' };
      }

      const record = parsed as Record<string, unknown>;
      let candidateAccount: Partial<LocalAccount> | null = null;

      if (
        record.format === 'codeforge-uni-account-backup' &&
        record.account &&
        typeof record.account === 'object' &&
        !Array.isArray(record.account)
      ) {
        candidateAccount = record.account as Partial<LocalAccount>;
      } else if (
        (record.profile && typeof record.profile === 'object') ||
        (typeof record.name === 'string' && record.progress && typeof record.progress === 'object')
      ) {
        candidateAccount = record as Partial<LocalAccount>;
      }

      if (!candidateAccount) {
        return {
          ok: false,
          error: 'Este arquivo não contém uma conta válida do CodeForge Uni.',
        };
      }

      const normalized = normalizeAccount(candidateAccount);
      const existingIds = new Set(storageRef.current.accounts.map((a) => a.id));
      const finalAccount: LocalAccount = {
        ...normalized,
        id: existingIds.has(normalized.id) ? generateAccountId() : normalized.id,
        lastActiveAt: new Date().toISOString(),
        progress: refreshStreak(normalized.progress),
      };

      const requiresPin = Boolean(finalAccount.pin);

      setStorage((prev) => ({
        accounts: [...prev.accounts, finalAccount],
        // If account has no PIN, log straight into it; if protected by PIN, keep selector safe so PIN is verified
        activeAccountId: requiresPin ? prev.activeAccountId : finalAccount.id,
      }));

      showToast(
        `Conta restaurada: ${finalAccount.name}`,
        requiresPin
          ? 'Backup importado com PIN ativo. Selecione a conta e digite o PIN para entrar.'
          : 'Backup importado com sucesso e sessão ativada.',
        'success'
      );

      return { ok: true, account: finalAccount, requiresPin };
    },
    [showToast]
  );

  const completeOnboarding = useCallback(
    (data: {
      name: string;
      goal: string;
      initialLevel: InitialLevel;
      careerTrack: CareerTrackId;
      programmingLanguage?: ProgrammingLanguage;
      avatarColor?: AccountAvatarColor;
      pin?: string;
    }) => {
      createAccount(data);
    },
    [createAccount]
  );

  const updateProfile = useCallback(
    (patch: Partial<Omit<StudentProfile, 'onboardingComplete' | 'createdAt'>>) => {
      mutateActiveAccount((acc) => {
        const nextName =
          typeof patch.name === 'string' && patch.name.trim().length > 0
            ? patch.name.trim()
            : acc.profile.name;
        const nextLang = isValidProgrammingLanguage(patch.programmingLanguage)
          ? patch.programmingLanguage
          : acc.profile.programmingLanguage;
        const rawNextLevel = patch.experienceLevel ?? patch.initialLevel;
        const nextLevel: InitialLevel =
          typeof rawNextLevel === 'string' && VALID_LEVELS.has(rawNextLevel as InitialLevel)
            ? (rawNextLevel as InitialLevel)
            : acc.profile.initialLevel;
        return {
          ...acc,
          name: nextName,
          lastActiveAt: new Date().toISOString(),
          profile: {
            ...acc.profile,
            ...patch,
            name: nextName,
            initialLevel: nextLevel,
            experienceLevel: nextLevel,
            programmingLanguage: nextLang,
          },
        };
      });
      showToast('Perfil atualizado', 'Os exemplos das aulas já se adaptam à sua escolha.', 'info');
    },
    [mutateActiveAccount, showToast]
  );

  const updateProgrammingLanguage = useCallback(
    (lang: ProgrammingLanguage) => {
      if (!isValidProgrammingLanguage(lang) || !activeAccount) return;
      if (activeAccount.profile.programmingLanguage === lang) return;

      const meta = getLanguageMeta(lang);
      mutateActiveAccount((acc) => ({
        ...acc,
        lastActiveAt: new Date().toISOString(),
        profile: {
          ...acc.profile,
          programmingLanguage: lang,
        },
      }));
      showToast(
        `Linguagem alterada para ${meta.name} (${meta.extension})`,
        `A IDE, a Arena, o Glossário e o Professor I.A. de ${activeAccount.name} agora usam ${meta.runtimeLabel}.`,
        'info'
      );
    },
    [activeAccount, mutateActiveAccount, showToast]
  );

  const saveLessonCode = useCallback(
    (lessonId: string, code: string, language?: ProgrammingLanguage) => {
      mutateActiveAccount((acc) => {
        const effectiveLang =
          language && isValidProgrammingLanguage(language)
            ? language
            : acc.profile.programmingLanguage;
        const compositeKey = getLessonCodeStorageKey(lessonId, effectiveLang);
        return {
          ...acc,
          lastActiveAt: new Date().toISOString(),
          progress: {
            ...acc.progress,
            savedCodeByLesson: {
              ...acc.progress.savedCodeByLesson,
              [compositeKey]: code,
            },
          },
        };
      });
    },
    [mutateActiveAccount]
  );

  const saveProfessorHistory = useCallback(
    (messages: SavedTutorMessage[], expectedAccountId?: string) => {
      mutateActiveAccount(
        (acc) => ({
          ...acc,
          lastActiveAt: new Date().toISOString(),
          progress: {
            ...acc.progress,
            professorHistory: messages.slice(-30),
          },
        }),
        expectedAccountId
      );
    },
    [mutateActiveAccount]
  );

  const toggleGlossaryFavorite = useCallback(
    (termId: string) => {
      mutateActiveAccount((acc) => {
        const current = acc.progress.favoriteGlossaryIds ?? [];
        const exists = current.includes(termId);
        return {
          ...acc,
          lastActiveAt: new Date().toISOString(),
          progress: {
            ...acc.progress,
            favoriteGlossaryIds: exists
              ? current.filter((id) => id !== termId)
              : [...current, termId],
          },
        };
      });
    },
    [mutateActiveAccount]
  );

  const markLessonComplete = useCallback(
    (lessonId: string, xpReward: number, lessonTitle: string) => {
      const currentCompleted = storageRef.current.accounts.find(
        (a) => a.id === storageRef.current.activeAccountId
      )?.progress.completedLessonIds;
      const alreadyDone = currentCompleted?.includes(lessonId);

      applyProgressUpdate(
        (prev) => {
          if (prev.completedLessonIds.includes(lessonId)) return prev;
          return {
            ...prev,
            xp: prev.xp + xpReward,
            completedLessonIds: [...prev.completedLessonIds, lessonId],
          };
        },
        alreadyDone
          ? undefined
          : {
              title: `Aula concluída (+${xpReward} XP)`,
              subtitle: lessonTitle,
            }
      );
    },
    [applyProgressUpdate]
  );

  const markDebugComplete = useCallback(
    (debugId: string, xpReward: number, title: string) => {
      const currentDone = storageRef.current.accounts.find(
        (a) => a.id === storageRef.current.activeAccountId
      )?.progress.completedDebugIds;
      const alreadyDone = currentDone?.includes(debugId);

      applyProgressUpdate(
        (prev) => {
          if (prev.completedDebugIds.includes(debugId)) return prev;
          return {
            ...prev,
            xp: prev.xp + xpReward,
            completedDebugIds: [...prev.completedDebugIds, debugId],
          };
        },
        alreadyDone
          ? undefined
          : {
              title: `Bug eliminado (+${xpReward} XP)`,
              subtitle: title,
            }
      );
    },
    [applyProgressUpdate]
  );

  const recordAiChallengeComplete = useCallback(
    (xpReward: number, title: string) => {
      applyProgressUpdate(
        (prev) => ({
          ...prev,
          xp: prev.xp + xpReward,
          completedAiChallengesCount: prev.completedAiChallengesCount + 1,
        }),
        {
          title: `Desafio da Forja resolvido (+${xpReward} XP)`,
          subtitle: title,
        }
      );
    },
    [applyProgressUpdate]
  );

  const recordHintUsed = useCallback(() => {
    applyProgressUpdate((prev) => ({
      ...prev,
      hintsUsedCount: prev.hintsUsedCount + 1,
    }));
  }, [applyProgressUpdate]);

  const recordReviewReceived = useCallback(() => {
    applyProgressUpdate((prev) => ({
      ...prev,
      xp: prev.xp + 25,
      reviewsReceivedCount: prev.reviewsReceivedCount + 1,
    }));
  }, [applyProgressUpdate]);

  const markExplorerQuizDone = useCallback(
    (recommendedTrack?: CareerTrackId) => {
      applyProgressUpdate(
        (prev) => ({
          ...prev,
          xp: prev.explorerQuizDone ? prev.xp : prev.xp + 75,
          explorerQuizDone: true,
        }),
        {
          title: 'Diagnóstico do Modo Explorador concluído',
          subtitle: recommendedTrack ? 'Sua trilha recomendada já pode ser ativada.' : undefined,
        }
      );
    },
    [applyProgressUpdate]
  );

  const markExamPassed = useCallback(
    (moduleId: string, xpReward: number, moduleTitle: string) => {
      const currentPassed = storageRef.current.accounts.find(
        (a) => a.id === storageRef.current.activeAccountId
      )?.progress.passedExamModuleIds;
      const alreadyPassed = currentPassed?.includes(moduleId);

      applyProgressUpdate(
        (prev) => {
          const existing = prev.passedExamModuleIds ?? [];
          if (existing.includes(moduleId)) return prev;
          return {
            ...prev,
            xp: prev.xp + xpReward,
            passedExamModuleIds: [...existing, moduleId],
          };
        },
        alreadyPassed
          ? {
              title: 'Simulado concluído com 100%',
              subtitle: `${moduleTitle} (módulo já aprovado anteriormente).`,
            }
          : {
              title: `Aprovado em Prova (+${xpReward} XP)`,
              subtitle: `${moduleTitle} · Selo desbloqueado na sua Trilha!`,
            }
      );
    },
    [applyProgressUpdate]
  );

  const saveCompletedProject = useCallback(
    (project: CompletedProject, xpReward: number) => {
      const existingProjects = storageRef.current.accounts.find(
        (a) => a.id === storageRef.current.activeAccountId
      )?.progress.completedProjects;
      const alreadySaved = existingProjects?.some((p) => p.id === project.id);

      applyProgressUpdate(
        (prev) => {
          const list = prev.completedProjects ?? [];
          const exists = list.some((p) => p.id === project.id);
          const nextList = exists
            ? list.map((p) => (p.id === project.id ? project : p))
            : [project, ...list];
          return {
            ...prev,
            xp: exists ? prev.xp : prev.xp + xpReward,
            completedProjects: nextList,
          };
        },
        alreadySaved
          ? {
              title: 'Projeto atualizado no Portfólio',
              subtitle: project.title,
            }
          : {
              title: `Mini-Projeto concluído (+${xpReward} XP)`,
              subtitle: `"${project.title}" salvo no seu Portfólio no Perfil.`,
            }
      );
    },
    [applyProgressUpdate]
  );

  const resetActiveAccountProgress = useCallback(() => {
    if (!activeAccount) return;
    mutateActiveAccount((acc) => ({
      ...acc,
      lastActiveAt: new Date().toISOString(),
      progress: createDefaultProgress(),
    }));
    setResetVersion((v) => v + 1);
    showToast(
      'Progresso reiniciado',
      `Apenas o progresso de ${activeAccount.name} foi zerado. As outras contas permanecem intactas.`,
      'info'
    );
  }, [activeAccount, mutateActiveAccount, showToast]);

  return {
    accounts: storage.accounts,
    activeAccount,
    activeAccountId: storage.activeAccountId,
    profile,
    progress,
    resetVersion,
    toast,
    dismissToast: () => setToast(null),
    createAccount,
    loginAccount,
    logoutAccount,
    switchAccount,
    updateAccountSecurity,
    deleteAccount,
    exportAccountJson,
    importAccountJson,
    completeOnboarding,
    updateProfile,
    updateProgrammingLanguage,
    saveLessonCode,
    saveProfessorHistory,
    toggleGlossaryFavorite,
    markLessonComplete,
    markDebugComplete,
    recordAiChallengeComplete,
    recordHintUsed,
    recordReviewReceived,
    markExplorerQuizDone,
    markExamPassed,
    saveCompletedProject,
    resetActiveAccountProgress,
  };
}
