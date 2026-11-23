import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import { AccountSelectorScreen } from './components/AccountSelectorScreen';
import { AccountSwitcherModal } from './components/AccountSwitcherModal';
import { AiProfessorLab } from './components/AiProfessorLab';
import { ExplorerQuizModal } from './components/ExplorerQuizModal';
import { GlossaryAndVisualizer } from './components/GlossaryAndVisualizer';
import { LessonWorkspace } from './components/LessonWorkspace';
import { OnboardingFlow } from './components/OnboardingFlow';
import { PracticeArena } from './components/PracticeArena';
import { ProfileView } from './components/ProfileView';
import { TopNav } from './components/TopNav';
import { TrackDashboard } from './components/TrackDashboard';
import { ALL_LESSONS, getLessonById } from './data/curriculum';
import { useCodeForgeStore } from './hooks/useCodeForgeStore';
import { AppTab } from './types';
import { stopSpeech } from './utils/voiceProfessor';

const MOBILE_MODE_STORAGE_KEY = 'codeforge-mobile-mode-v1';

export default function App() {
  const {
    accounts,
    activeAccount,
    activeAccountId,
    profile,
    progress,
    resetVersion,
    toast,
    dismissToast,
    createAccount,
    loginAccount,
    logoutAccount,
    switchAccount,
    updateAccountSecurity,
    deleteAccount,
    exportAccountJson,
    importAccountJson,
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
  } = useCodeForgeStore();

  const [activeTab, setActiveTab] = useState<AppTab>('trilha');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [explorerModalOpen, setExplorerModalOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MOBILE_MODE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(MOBILE_MODE_STORAGE_KEY, String(mobileViewMode));
    } catch {
      // Ignore storage quota errors
    }
  }, [mobileViewMode]);

  useEffect(() => {
    stopSpeech();
  }, [activeAccountId, activeTab, activeLessonId]);

  const toggleMobileViewMode = () => setMobileViewMode((prev) => !prev);

  const nextLesson = useMemo(() => {
    const completedSet = new Set(progress?.completedLessonIds ?? []);
    const experience = profile?.experienceLevel ?? profile?.initialLevel;
    if (completedSet.size === 0 && experience === 'intermediario') {
      const mod2Start = ALL_LESSONS.find((l) => l.id === 'm2-l1');
      if (mod2Start) return mod2Start;
    }
    return ALL_LESSONS.find((l) => !completedSet.has(l.id)) ?? null;
  }, [progress?.completedLessonIds, profile?.experienceLevel, profile?.initialLevel]);

  const completedValidCount = useMemo(() => {
    const completedSet = new Set(progress?.completedLessonIds ?? []);
    return ALL_LESSONS.filter((l) => completedSet.has(l.id)).length;
  }, [progress?.completedLessonIds]);

  const allLessonsCompleted = ALL_LESSONS.length > 0 && completedValidCount >= ALL_LESSONS.length;

  const activeLesson = activeLessonId ? getLessonById(activeLessonId) ?? null : null;

  const toastBanner = toast ? (
    <div
      role="status"
      aria-live="polite"
      className={`fixed ${
        mobileViewMode ? 'bottom-20 right-4 left-4 max-w-[398px] mx-auto' : 'bottom-20 md:bottom-6 right-4 sm:right-6 max-w-sm'
      } z-50 bg-[#131B2E] border border-cyan-400/40 rounded-xl p-4 shadow-xl flex items-start gap-3`}
    >
      {toast.tone === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
      ) : (
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.subtitle && (
          <p className="text-xs text-slate-300 mt-0.5">{toast.subtitle}</p>
        )}
      </div>
      <button
        type="button"
        onClick={dismissToast}
        aria-label="Fechar aviso"
        className="text-slate-400 hover:text-white p-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ) : null;

  // 1. Onboarding / Create New Account Flow
  if (creatingAccount || accounts.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-[#0B0F19] overflow-x-hidden">
        <OnboardingFlow
          existingAccountsCount={accounts.length}
          forceMobile={mobileViewMode}
          onToggleMobileMode={toggleMobileViewMode}
          onCancel={accounts.length > 0 ? () => setCreatingAccount(false) : undefined}
          onComplete={(data) => {
            createAccount(data);
            setCreatingAccount(false);
            setSwitcherOpen(false);
            setExplorerModalOpen(false);
            setActiveLessonId(null);
            setActiveTab('trilha');
          }}
        />
        {toastBanner}
      </div>
    );
  }

  // 2. Account Selection / Login Gate (when logged out)
  if (!activeAccount) {
    return (
      <div className="min-h-[100dvh] bg-[#0B0F19] overflow-x-hidden">
        <AccountSelectorScreen
          accounts={accounts}
          forceMobile={mobileViewMode}
          onToggleMobileMode={toggleMobileViewMode}
          onLogin={(id, pin) => {
            const res = loginAccount(id, pin);
            if (res.ok) {
              setActiveLessonId(null);
              setActiveTab('trilha');
            }
            return res;
          }}
          onCreateNew={() => setCreatingAccount(true)}
          onImportAccount={(rawJson) => {
            const res = importAccountJson(rawJson);
            if (res.ok && !res.requiresPin) {
              setActiveLessonId(null);
              setActiveTab('trilha');
            }
            return res;
          }}
        />
        {toastBanner}
      </div>
    );
  }

  const handleSelectTab = (tab: AppTab) => {
    stopSpeech();
    setActiveTab(tab);
    setActiveLessonId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLesson = (lessonId: string) => {
    stopSpeech();
    setActiveTab('trilha');
    setActiveLessonId(lessonId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    stopSpeech();
    setActiveLessonId(null);
    setActiveTab('trilha');
    setExplorerModalOpen(false);
    setSwitcherOpen(false);
    logoutAccount();
  };

  return (
    <div className="min-h-[100dvh] bg-[#0B0F19] text-slate-100 overflow-x-hidden">
      <div
        className={`min-h-[100dvh] flex flex-col overflow-x-hidden ${
          mobileViewMode
            ? 'max-w-[430px] mx-auto border-x border-white/[0.08] shadow-2xl relative'
            : ''
        }`}
      >
        <TopNav
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onContinueLesson={() =>
            nextLesson ? handleOpenLesson(nextLesson.id) : handleSelectTab('arena')
          }
          continueLabel={
            allLessonsCompleted || !nextLesson
              ? 'Treinar na Arena'
              : completedValidCount === 0
                ? 'Começar Aula'
                : 'Próxima Aula'
          }
          activeLanguage={profile.programmingLanguage}
          careerTrack={profile.careerTrack}
          onChangeLanguage={updateProgrammingLanguage}
          forceMobile={mobileViewMode}
          onToggleMobileMode={toggleMobileViewMode}
        />

        <main
          className={`flex-1 w-full mx-auto px-3.5 ${
            mobileViewMode
              ? 'pt-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))]'
              : 'max-w-[1360px] sm:px-6 pt-5 sm:pt-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-12'
          }`}
        >
          {activeTab === 'trilha' && activeLesson && (
            <LessonWorkspace
              key={`${activeAccount.id}-${activeLesson.id}-${profile.programmingLanguage}-${resetVersion}`}
              lesson={activeLesson}
              profile={profile}
              progress={progress}
              forceMobile={mobileViewMode}
              onBack={() => setActiveLessonId(null)}
              onSelectLesson={handleOpenLesson}
              onSaveCode={saveLessonCode}
              onLessonCompleted={markLessonComplete}
              onHintUsed={recordHintUsed}
              onReviewReceived={recordReviewReceived}
            />
          )}

          {activeTab === 'trilha' && !activeLesson && (
            <TrackDashboard
              key={activeAccount.id}
              profile={profile}
              progress={progress}
              nextLesson={nextLesson}
              accountsCount={accounts.length}
              onSelectLesson={handleOpenLesson}
              onOpenExplorerQuiz={() => setExplorerModalOpen(true)}
              onOpenArena={() => handleSelectTab('arena')}
              onOpenAccountSwitcher={() => setSwitcherOpen(true)}
              onLogout={handleLogout}
            />
          )}

          {activeTab === 'arena' && (
            <PracticeArena
              key={`${activeAccount.id}-${profile.programmingLanguage}-${resetVersion}`}
              profile={profile}
              progress={progress}
              forceMobile={mobileViewMode}
              onDebugCompleted={markDebugComplete}
              onAiChallengeCompleted={recordAiChallengeComplete}
              onExamPassed={markExamPassed}
              onProjectCompleted={saveCompletedProject}
              onHintUsed={recordHintUsed}
              onReviewReceived={recordReviewReceived}
            />
          )}

          {activeTab === 'professor' && (
            <AiProfessorLab
              key={`${activeAccount.id}-${resetVersion}`}
              accountId={activeAccount.id}
              profile={profile}
              initialMessages={progress.professorHistory ?? []}
              onMessagesChange={saveProfessorHistory}
            />
          )}

          {activeTab === 'glossario' && (
            <GlossaryAndVisualizer
              key={activeAccount.id}
              programmingLanguage={profile.programmingLanguage}
              favoriteTermIds={progress.favoriteGlossaryIds ?? []}
              onToggleFavorite={toggleGlossaryFavorite}
            />
          )}

          {activeTab === 'perfil' && (
            <ProfileView
              key={activeAccount.id}
              activeAccount={activeAccount}
              accountsCount={accounts.length}
              profile={profile}
              progress={progress}
              forceMobile={mobileViewMode}
              onToggleMobileMode={toggleMobileViewMode}
              onUpdateProfile={updateProfile}
              onChangeLanguage={updateProgrammingLanguage}
              onUpdateAccountSecurity={updateAccountSecurity}
              onOpenAccountSwitcher={() => setSwitcherOpen(true)}
              onCreateNewAccount={() => {
                setSwitcherOpen(false);
                setExplorerModalOpen(false);
                setCreatingAccount(true);
              }}
              onLogout={handleLogout}
              onDeleteAccount={(id, pin) => {
                const res = deleteAccount(id, pin);
                if (res.ok) {
                  setSwitcherOpen(false);
                  setExplorerModalOpen(false);
                  setActiveLessonId(null);
                  setActiveTab('trilha');
                }
                return res;
              }}
              onExportAccount={() => exportAccountJson(activeAccount.id)}
              onImportAccount={(rawJson) => {
                const res = importAccountJson(rawJson);
                if (res.ok && !res.requiresPin) {
                  setSwitcherOpen(false);
                  setExplorerModalOpen(false);
                  setActiveLessonId(null);
                  setActiveTab('trilha');
                }
                return res;
              }}
              onOpenExplorerQuiz={() => setExplorerModalOpen(true)}
              onResetProgress={() => {
                setActiveLessonId(null);
                resetActiveAccountProgress();
              }}
            />
          )}
        </main>

        {!mobileViewMode && (
          <footer className="hidden md:block border-t border-white/[0.06] py-6">
            <div className="max-w-[1360px] mx-auto px-6 flex items-center justify-between text-xs text-slate-500">
              <span>CodeForge Uni · Preparação em Programação e Ciência da Computação</span>
              <span>
                Sessão local de {profile.name} · {accounts.length}{' '}
                {accounts.length === 1 ? 'conta neste aparelho' : 'contas neste aparelho'}
              </span>
            </div>
          </footer>
        )}

        {explorerModalOpen && (
          <ExplorerQuizModal
            key={activeAccount.id}
            studentName={profile.name}
            goal={profile.goal}
            onClose={() => setExplorerModalOpen(false)}
            onAdoptTrack={(track) => updateProfile({ careerTrack: track })}
            onQuizCompleted={(track) => markExplorerQuizDone(track)}
          />
        )}

        {switcherOpen && (
          <AccountSwitcherModal
            accounts={accounts}
            activeAccountId={activeAccountId}
            onSwitch={(id, pin) => {
              const res = switchAccount(id, pin);
              if (res.ok) {
                setSwitcherOpen(false);
                setExplorerModalOpen(false);
                setActiveLessonId(null);
                setActiveTab('trilha');
              }
              return res;
            }}
            onLogout={handleLogout}
            onCreateNew={() => {
              setSwitcherOpen(false);
              setExplorerModalOpen(false);
              setCreatingAccount(true);
            }}
            onClose={() => setSwitcherOpen(false)}
          />
        )}

        {toastBanner}
      </div>
    </div>
  );
}
