import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Flag,
  HelpCircle,
  Keyboard,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  Send,
  ShieldAlert,
  Square,
  Terminal,
  Volume2,
  XCircle,
} from 'lucide-react';
import {
  evaluateMultiLanguageCode,
  requestCodeReview,
  requestSocraticHint,
} from '../services/aiProfessor';
import { getLanguageMeta } from '../data/languages';
import {
  CareerTrackId,
  CodeReviewResponse,
  CodeRunResult,
  InitialLevel,
  ProgrammingLanguage,
  SocraticHintResponse,
  TestCase,
} from '../types';
import { runJavaScriptChallengeAsync } from '../utils/codeRunner';
import {
  primeSpeechOnUserGesture,
  stopSpeech,
  useVoiceProfessor,
} from '../utils/voiceProfessor';

interface CodeEditorPanelProps {
  challengeTitle: string;
  challengePrompt: string;
  functionName: string;
  starterCode: string;
  code: string;
  onCodeChange: (newCode: string) => void;
  testCases: TestCase[];
  careerTrack: CareerTrackId;
  programmingLanguage: ProgrammingLanguage;
  studentName: string;
  experienceLevel?: InitialLevel;
  moduleId?: string;
  lessonOrder?: number;
  progressiveHints?: [string, string, string];
  progressiveHintTemplate?: string;
  examMode?: boolean;
  mobileSection?: 'all' | 'editor' | 'output';
  forceMobile?: boolean;
  onRequestMobileOutputTab?: () => void;
  onExamSubmitted?: (passedAll: boolean, elapsedSeconds: number) => void;
  onAllTestsPassed?: () => void;
  onHintUsed?: () => void;
  onReviewReceived?: () => void;
}

interface QuickSymbolItem {
  label: string;
  insert: string;
  /** If defined, wraps selection or places cursor between open & close */
  pair?: [string, string];
  ariaLabel: string;
}

const QUICK_SYMBOLS: QuickSymbolItem[] = [
  { label: '{ }', insert: '{}', pair: ['{', '}'], ariaLabel: 'Inserir chaves' },
  { label: '( )', insert: '()', pair: ['(', ')'], ariaLabel: 'Inserir parênteses' },
  { label: '[ ]', insert: '[]', pair: ['[', ']'], ariaLabel: 'Inserir colchetes' },
  { label: ';', insert: ';', ariaLabel: 'Inserir ponto e vírgula' },
  { label: '=', insert: '=', ariaLabel: 'Inserir igual' },
  { label: '==', insert: '==', ariaLabel: 'Inserir igualdade dupla' },
  { label: '!=', insert: '!=', ariaLabel: 'Inserir diferente' },
  { label: '"', insert: '"', ariaLabel: 'Inserir aspas duplas' },
  { label: "'", insert: "'", ariaLabel: 'Inserir aspas simples' },
  { label: '<', insert: '<', ariaLabel: 'Inserir menor que' },
  { label: '>', insert: '>', ariaLabel: 'Inserir maior que' },
  { label: '=>', insert: '=>', ariaLabel: 'Inserir seta' },
  { label: 'Tab', insert: '  ', ariaLabel: 'Inserir 2 espaços' },
];

function formatElapsedTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

interface HintThreadEntry {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  hint?: SocraticHintResponse;
  hidden?: boolean;
}

function formatValue(val: unknown): string {
  if (val === undefined) return 'undefined';
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

interface LocalPedagogicalHint {
  diagnostico: string;
  pergunta: string;
  proximoPasso: string;
}

function buildLocalPedagogicalHint(params: {
  code: string;
  starterCode: string;
  functionName: string;
  runResult: CodeRunResult | null;
  langName: string;
  consoleCommand: string;
}): LocalPedagogicalHint {
  const { code, starterCode, functionName, runResult, langName, consoleCommand } = params;
  const trimmedCode = code.trim();

  if (!trimmedCode || trimmedCode === starterCode.trim()) {
    return {
      diagnostico:
        'Seu editor ainda está igual ao código inicial da aula. O primeiro passo é transformar as regras do enunciado em instruções dentro da função.',
      pergunta: `Quais são as entradas que a função "${functionName}" recebe e o que ela precisa retornar em um caso simples?`,
      proximoPasso:
        'Comece tratando o caso mais simples ou o caso extremo (ex.: valor 0, negativo ou lista vazia) e clique em "Executar Testes".',
    };
  }

  if (runResult?.compileError) {
    return {
      diagnostico: `Antes da lógica, existe um erro de sintaxe/execução em ${langName}: ${runResult.compileError}`,
      pergunta:
        'Todas as chaves { }, parênteses ( ), aspas e nomes de variáveis/função estão escritos e fechados corretamente na linha indicada?',
      proximoPasso: `Corrija a linha apontada no erro de execução, confirme se a função "${functionName}" manteve a assinatura correta e execute os testes novamente.`,
    };
  }

  const failedTests = runResult ? runResult.results.filter((r) => !r.passed) : [];
  if (failedTests.length === 0) {
    if (runResult && runResult.allPassed) {
      return {
        diagnostico: 'Todos os testes já passaram! Se quiser melhorar ainda mais, revise nomes de variáveis e casos extremos.',
        pergunta: 'Seu código continuaria claro e seguro se recebesse entradas maiores ou valores inesperados?',
        proximoPasso: 'Revise a legibilidade da solução e clique em "Tentar novamente" quando quiser o feedback da I.A.',
      };
    }

    return {
      diagnostico: `Ainda não há resultados de teste registrados em ${langName} para apontar exatamente qual caso divergiu.`,
      pergunta: `Se você testar mentalmente a função "${functionName}" com a primeira entrada do enunciado, qual valor ela retorna linha por linha?`,
      proximoPasso: `Clique em "Executar Testes" primeiro e use ${consoleCommand} para inspecionar os valores intermediários.`,
    };
  }

  const firstFail = failedTests[0];
  const expectedStr = formatValue(firstFail.expected);
  const actualStr = firstFail.error ? `Erro: ${firstFail.error}` : formatValue(firstFail.actual);
  const inputStr = firstFail.input.map(formatValue).join(', ');

  if (firstFail.error) {
    return {
      diagnostico: `O teste "${firstFail.label}" (${functionName}(${inputStr})) disparou um erro em tempo de execução: ${firstFail.error}.`,
      pergunta:
        'Você está acessando algum índice fora do limite, variável indefinida ou operando em um tipo diferente do esperado?',
      proximoPasso: `Adicione uma proteção antes dessa operação (ou imprima os valores com ${consoleCommand}) e reexecute os testes.`,
    };
  }

  if (firstFail.actual === undefined || firstFail.actual === null) {
    return {
      diagnostico: `No teste "${firstFail.label}", sua função retornou ${actualStr}, mas o esperado era ${expectedStr}. Isso normalmente indica que faltou um comando "return" em algum caminho do código.`,
      pergunta:
        'Todos os caminhos (if / else e o final da função) devolvem explicitamente o resultado com return em vez de apenas imprimir no console?',
      proximoPasso: `Confira se há um "return" devolvendo o resultado final calculado e rode "Executar Testes".`,
    };
  }

  if (typeof firstFail.expected !== typeof firstFail.actual) {
    return {
      diagnostico: `Divergência de tipo no teste "${firstFail.label}": o esperado era ${expectedStr} (${typeof firstFail.expected}), mas seu código devolveu ${actualStr} (${typeof firstFail.actual}).`,
      pergunta:
        'Você retornou texto em vez de número (ou vice-versa), ou um objeto/lista com formato diferente do pedido no enunciado?',
      proximoPasso: `Ajuste o tipo do valor retornado para corresponder exatamente a ${expectedStr} e valide novamente nos testes.`,
    };
  }

  if (firstFail.isEdgeCase) {
    return {
      diagnostico: `Seu código falhou no caso extremo "${firstFail.label}": com entrada (${inputStr}), retornou ${actualStr} em vez de ${expectedStr}.`,
      pergunta:
        'O que acontece na sua condição ou laço quando a entrada é vazia, zero, negativa ou está exatamente na fronteira (< vs <=)?',
      proximoPasso: `Trate esse caso extremo explicitamente logo no início da função ou revise os operadores de comparação e clique em "Executar Testes".`,
    };
  }

  if (
    typeof firstFail.expected === 'number' &&
    typeof firstFail.actual === 'number' &&
    Math.abs(firstFail.expected - firstFail.actual) === 1
  ) {
    return {
      diagnostico: `Quase lá! No teste "${firstFail.label}" (${inputStr}), o retorno foi ${actualStr} e o esperado era ${expectedStr} (diferença de 1 — clássico erro de fronteira / off-by-one).`,
      pergunta:
        'Seu laço ou comparação deveria usar "<" ou "<=" (ou começar em 0 vs 1)?',
      proximoPasso: `Inspecione os limites do laço/condição com ${consoleCommand} para verificar a primeira e a última iteração.`,
    };
  }

  return {
    diagnostico: `No teste "${firstFail.label}", para entrada (${inputStr}), sua função retornou ${actualStr}, mas o esperado era ${expectedStr} (${failedTests.length} teste(s) falhando no total).`,
    pergunta: `Em qual linha o valor calculado dentro de "${functionName}" começa a divergir de ${expectedStr}?`,
    proximoPasso: `Use ${consoleCommand} para observar as variáveis intermediárias com a entrada (${inputStr}) e ajuste a lógica passo a passo.`,
  };
}

export function CodeEditorPanel({
  challengeTitle,
  challengePrompt,
  functionName,
  starterCode,
  code,
  onCodeChange,
  testCases,
  careerTrack,
  programmingLanguage,
  studentName,
  experienceLevel = 'zero',
  moduleId,
  lessonOrder,
  progressiveHints,
  progressiveHintTemplate,
  examMode = false,
  mobileSection = 'all',
  forceMobile = false,
  onRequestMobileOutputTab,
  onExamSubmitted,
  onAllTestsPassed,
  onHintUsed,
  onReviewReceived,
}: CodeEditorPanelProps) {
  const [fontSize, setFontSize] = useState<'sm' | 'base'>('sm');
  const [showDesktopSymbols, setShowDesktopSymbols] = useState(false);
  const [examElapsedSeconds, setExamElapsedSeconds] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);

  const [runLoading, setRunLoading] = useState(false);
  const [runResult, setRunResult] = useState<CodeRunResult | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);
  const [localFallbackHint, setLocalFallbackHint] = useState<LocalPedagogicalHint | null>(null);
  const [progressiveHintLevel, setProgressiveHintLevel] = useState<0 | 1 | 2 | 3>(0);
  const [hintThread, setHintThread] = useState<HintThreadEntry[]>([]);
  const [hintReplyInput, setHintReplyInput] = useState('');
  const [lastFailedHintReply, setLastFailedHintReply] = useState<string | undefined>(undefined);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<CodeReviewResponse | null>(null);

  const [activeOutputTab, setActiveOutputTab] = useState<'tests' | 'console' | 'ai'>('tests');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const aiPanelEndRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(true);
  const runSeqRef = useRef(0);

  const voice = useVoiceProfessor({ stopOnUnmount: true });
  const firstName = useMemo(
    () => studentName.trim().split(/\s+/)[0] || 'estudante',
    [studentName]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      runSeqRef.current += 1;
    };
  }, []);

  // Exam mode live elapsed timer (pauses automatically when delivered)
  useEffect(() => {
    if (!examMode || examSubmitted) return;
    const interval = setInterval(() => {
      setExamElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [examMode, examSubmitted]);

  const langMeta = getLanguageMeta(programmingLanguage);
  const lineCount = useMemo(() => Math.max(12, code.split('\n').length), [code]);

  useEffect(() => {
    if (
      activeOutputTab === 'ai' &&
      (hintThread.length > 0 || hintLoading || hintError || progressiveHintLevel > 0)
    ) {
      aiPanelEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeOutputTab, hintThread.length, hintLoading, hintError, progressiveHintLevel]);

  const handleInsertSymbol = (sym: QuickSymbolItem) => {
    const el = textareaRef.current;
    const start = el ? el.selectionStart : code.length;
    const end = el ? el.selectionEnd : code.length;
    const selected = code.slice(start, end);

    let nextCode: string;
    let nextCursorStart: number;
    let nextCursorEnd: number;

    if (sym.pair) {
      const [open, close] = sym.pair;
      nextCode = `${code.slice(0, start)}${open}${selected}${close}${code.slice(end)}`;
      nextCursorStart = start + open.length;
      nextCursorEnd = start + open.length + selected.length;
    } else {
      nextCode = `${code.slice(0, start)}${sym.insert}${code.slice(end)}`;
      nextCursorStart = start + sym.insert.length;
      nextCursorEnd = nextCursorStart;
    }

    onCodeChange(nextCode);

    requestAnimationFrame(() => {
      const target = textareaRef.current;
      if (target) {
        target.focus();
        target.setSelectionRange(nextCursorStart, nextCursorEnd);
      }
    });
  };

  const handleRunTests = async () => {
    if (runLoading) return;
    primeSpeechOnUserGesture();
    const seq = ++runSeqRef.current;
    setActiveOutputTab('tests');
    onRequestMobileOutputTab?.();
    setRunLoading(true);

    try {
      const res =
        programmingLanguage === 'javascript'
          ? await runJavaScriptChallengeAsync(code, functionName, testCases)
          : await evaluateMultiLanguageCode({
              programmingLanguage,
              functionName,
              prompt: challengePrompt,
              studentCode: code,
              testCases,
            });

      if (!mountedRef.current || seq !== runSeqRef.current) return;

      setRunResult(res);
      if (res.success && !res.compileError && res.allPassed && res.results.length > 0) {
        if (examMode && !examSubmitted) {
          setExamSubmitted(true);
          onExamSubmitted?.(true, examElapsedSeconds);
        }
        onAllTestsPassed?.();
        if (voice.autoSpeak && voice.isSupported && !examMode) {
          voice.speak(
            `Parabéns, ${firstName}! Todos os ${res.results.length} testes passaram! Excelente trabalho, você já pode seguir para a próxima aula.`,
            'test-run-feedback'
          );
        }
      } else if (voice.autoSpeak && voice.isSupported && !examMode) {
        if (res.compileError) {
          voice.speak(
            `Calma, ${firstName}, apareceu um pequeno erro de escrita no código. Veja a mensagem em vermelho na tela ou clique em Dica para eu te ajudar passo a passo.`,
            'test-run-feedback'
          );
        } else if (res.results.length > 0) {
          const passedNow = res.results.filter((r) => r.passed).length;
          const remaining = res.results.length - passedNow;
          voice.speak(
            `Quase lá, ${firstName}! ${passedNow} de ${res.results.length} testes passaram. Falta ajustar ${
              remaining === 1 ? 'apenas 1 teste' : `${remaining} testes`
            }. Sem pressa, dê uma olhada no caso em vermelho ou clique em Dica para resolvermos juntos.`,
            'test-run-feedback'
          );
        }
      }
    } catch (err) {
      if (!mountedRef.current || seq !== runSeqRef.current) return;
      setRunResult({
        success: false,
        allPassed: false,
        compileError:
          err instanceof Error
            ? err.message
            : `Não foi possível executar os testes em ${langMeta.name}. Tente novamente.`,
        logs: [],
        results: [],
        totalDurationMs: 0,
      });
    } finally {
      if (mountedRef.current && seq === runSeqRef.current) {
        setRunLoading(false);
      }
    }
  };

  const handleDeliverExam = () => {
    if (!examMode || examSubmitted) return;
    const passedAll = Boolean(
      runResult && runResult.success && !runResult.compileError && runResult.allPassed
    );
    setExamSubmitted(true);
    onExamSubmitted?.(passedAll, examElapsedSeconds);
  };

  const handleReset = () => {
    stopSpeech();
    onCodeChange(starterCode);
    setRunResult(null);
    setHintThread([]);
    setHintReplyInput('');
    setLastFailedHintReply(undefined);
    setReviewData(null);
    setHintError(null);
    setLocalFallbackHint(null);
    setProgressiveHintLevel(0);
    setReviewError(null);
    if (examMode) {
      setExamElapsedSeconds(0);
      setExamSubmitted(false);
      setActiveOutputTab('tests');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunTests();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const indent = programmingLanguage === 'python' || programmingLanguage === 'java' || programmingLanguage === 'csharp' ? '    ' : '  ';
      const updated = `${code.slice(0, start)}${indent}${code.slice(end)}`;
      onCodeChange(updated);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + indent.length;
          textareaRef.current.selectionEnd = start + indent.length;
        }
      });
    }
  };

  const handleAskHint = async (replyOverride?: string) => {
    if (hintLoading || examMode) return;
    primeSpeechOnUserGesture();

    const rawReply = replyOverride !== undefined ? replyOverride : '';
    const trimmedReply = rawReply.trim();
    const isFollowUp = trimmedReply.length > 0;

    setHintLoading(true);
    setHintError(null);
    setLocalFallbackHint(null);
    setLastFailedHintReply(undefined);
    setActiveOutputTab('ai');
    onRequestMobileOutputTab?.();

    // For JS, run sandboxed Web Worker check; for other languages, reuse last runResult if available
    let latestRun = runResult;
    if (programmingLanguage === 'javascript') {
      latestRun = await runJavaScriptChallengeAsync(code, functionName, testCases);
      if (!mountedRef.current) return;
      setRunResult(latestRun);
    }
    const failedTests = latestRun ? latestRun.results.filter((r) => !r.passed) : [];

    // Send ONLY prior conversation history (never duplicating the current reply)
    const priorHistory = hintThread.map((entry) => ({
      role: entry.role,
      text: entry.text,
    }));

    const pendingUserId = isFollowUp ? Date.now() : null;
    if (isFollowUp && pendingUserId !== null) {
      setHintThread((prev) => [
        ...prev,
        { id: pendingUserId, role: 'user', text: trimmedReply },
      ]);
      setHintReplyInput('');
    }

    try {
      const hint = await requestSocraticHint({
        lessonTitle: challengeTitle,
        prompt: challengePrompt,
        studentCode: code,
        failedTests,
        careerTrack,
        programmingLanguage,
        experienceLevel,
        moduleId,
        lessonOrder,
        studentName,
        history: priorHistory,
        studentReply: isFollowUp ? trimmedReply : undefined,
      });

      if (!mountedRef.current) return;

      const assistantEntryId = Date.now() + 1;
      const assistantSummary = `${hint.diagnosticoTecnico}\nPergunta socrática: ${hint.perguntaSocratica}\nPista: ${hint.pistaDirecionada}`;
      setHintThread((prev) => [
        ...prev,
        ...(!isFollowUp
          ? [
              {
                id: Date.now(),
                role: 'user' as const,
                text: `Pedi uma dica socrática para o desafio "${challengeTitle}" em ${langMeta.name} com meu código atual:\n\`\`\`${langMeta.codeFence}\n${code}\n\`\`\``,
                hidden: true,
              },
            ]
          : []),
        {
          id: assistantEntryId,
          role: 'assistant',
          text: assistantSummary,
          hint,
        },
      ]);
      onHintUsed?.();

      if (voice.autoSpeak && voice.isSupported) {
        voice.speak(
          `${hint.diagnosticoTecnico}. ${hint.perguntaSocratica}. Dica prática: ${hint.pistaDirecionada}. Próximo passo: ${hint.proximoPasso}`,
          `ai-hint-${assistantEntryId}`
        );
      }
    } catch (err) {
      if (!mountedRef.current) return;
      if (isFollowUp && pendingUserId !== null) {
        setHintThread((prev) => prev.filter((item) => item.id !== pendingUserId));
        setHintReplyInput(rawReply);
        setLastFailedHintReply(rawReply);
      }
      setHintError(err instanceof Error ? err.message : 'A I.A. não respondeu agora.');
      const computedLocal = buildLocalPedagogicalHint({
        code,
        starterCode,
        functionName,
        runResult: latestRun,
        langName: langMeta.name,
        consoleCommand: langMeta.consoleCommand,
      });
      setLocalFallbackHint(computedLocal);
      setProgressiveHintLevel((prev) => (prev === 0 ? 1 : prev));

      if (voice.autoSpeak && voice.isSupported) {
        const level1Text = progressiveHints?.[0] ?? computedLocal.diagnostico;
        voice.speak(`Dica da aula: ${level1Text}`, 'progressive-hint');
      }
    } finally {
      if (mountedRef.current) {
        setHintLoading(false);
      }
    }
  };

  const handleOpenProgressiveHint = () => {
    setActiveOutputTab('ai');
    onRequestMobileOutputTab?.();
    const computedLocal = buildLocalPedagogicalHint({
      code,
      starterCode,
      functionName,
      runResult,
      langName: langMeta.name,
      consoleCommand: langMeta.consoleCommand,
    });
    setLocalFallbackHint(computedLocal);
    const nextLevel: 1 | 2 | 3 = progressiveHintLevel === 0 ? 1 : progressiveHintLevel;
    setProgressiveHintLevel(nextLevel);
    if (voice.autoSpeak && voice.isSupported) {
      const spokenText = progressiveHints?.[nextLevel - 1] ?? computedLocal.diagnostico;
      voice.speak(`Dica nível ${nextLevel}: ${spokenText}`, 'progressive-hint');
    }
  };

  const handleRequestReview = async () => {
    if (reviewLoading) return;
    if (examMode && !examSubmitted) return;

    setReviewLoading(true);
    setReviewError(null);
    setActiveOutputTab('ai');
    onRequestMobileOutputTab?.();

    let latestRun = runResult;
    if (programmingLanguage === 'javascript') {
      latestRun = await runJavaScriptChallengeAsync(code, functionName, testCases);
      if (!mountedRef.current) return;
      setRunResult(latestRun);
    }

    try {
      const review = await requestCodeReview({
        lessonTitle: challengeTitle,
        prompt: challengePrompt,
        studentCode: code,
        passedAllTests: Boolean(latestRun?.allPassed),
        careerTrack,
        programmingLanguage,
        experienceLevel,
        moduleId,
        lessonOrder,
        studentName,
      });
      if (!mountedRef.current) return;
      setReviewData(review);
      onReviewReceived?.();
    } catch (err) {
      if (!mountedRef.current) return;
      setReviewError(err instanceof Error ? err.message : 'Erro ao realizar o Code Review.');
    } finally {
      if (mountedRef.current) {
        setReviewLoading(false);
      }
    }
  };

  const passedCount = runResult ? runResult.results.filter((r) => r.passed).length : 0;
  const aiTabAvailable = !examMode || examSubmitted;
  const editorVisibilityClass =
    mobileSection === 'output'
      ? forceMobile
        ? 'hidden'
        : 'hidden lg:block'
      : 'block';
  const outputVisibilityClass =
    mobileSection === 'editor'
      ? forceMobile
        ? 'hidden'
        : 'hidden lg:block'
      : 'block';

  return (
    <div className="flex flex-col bg-[#111827] border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* Exam Mode Discreet Top Banner */}
      {examMode && (
        <div className="px-4 py-2.5 border-b border-amber-400/25 bg-amber-500/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-200 font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Modo Prova · Sem ajuda da I.A.</span>
            {examSubmitted && (
              <span className="text-emerald-300 font-medium">
                · Prova entregue (Code Review liberado)
              </span>
            )}
          </div>
          <div className="inline-flex items-center gap-1.5 font-mono text-amber-100 bg-[#0B0F19]/80 border border-amber-400/30 px-2.5 py-1 rounded-md tabular-nums">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>{formatElapsedTime(examElapsedSeconds)}</span>
          </div>
        </div>
      )}

      {/* Editor Zone (Hidden on mobile when Console / I.A. tab is selected) */}
      <div className={editorVisibilityClass}>
        {/* Editor Header */}
        <div className="px-3.5 sm:px-4 py-3 border-b border-white/[0.08] bg-[#0E1424] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 min-w-0">
            <span className="font-mono text-slate-200 font-medium truncate">
              {functionName}{langMeta.extension}
            </span>
            <span aria-hidden="true">·</span>
            <span className={`font-medium ${langMeta.accentTextClass}`}>{langMeta.shortLabel}</span>
            {!forceMobile && (
              <>
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">Ctrl+Enter para executar</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {!forceMobile && (
              <button
                type="button"
                onClick={() => setShowDesktopSymbols((v) => !v)}
                className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  showDesktopSymbols
                    ? 'text-cyan-200 bg-cyan-500/15 border border-cyan-400/35'
                    : 'text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
                }`}
                title="Alternar barra de símbolos rápidos"
              >
                <Keyboard className="w-3.5 h-3.5" />
                Símbolos
              </button>
            )}
            <button
              type="button"
              onClick={() => setFontSize((f) => (f === 'sm' ? 'base' : 'sm'))}
              className="px-2.5 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-md transition-colors"
              title="Alternar tamanho da fonte"
            >
              {fontSize === 'sm' ? 'A+' : 'A-'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Quick Symbols Bar (always visible below lg or in Modo Celular; toggleable on desktop) */}
        <div
          className={`${
            forceMobile || showDesktopSymbols ? 'flex' : 'flex lg:hidden'
          } items-center gap-1.5 px-3 py-2 border-b border-white/[0.06] bg-[#0B101D] overflow-x-auto`}
          aria-label="Barra de símbolos rápidos de programação"
        >
          {QUICK_SYMBOLS.map((sym) => (
            <button
              key={sym.label}
              type="button"
              aria-label={sym.ariaLabel}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleInsertSymbol(sym)}
              className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#151E33] hover:bg-cyan-500/20 active:bg-cyan-500/30 border border-white/[0.08] hover:border-cyan-400/40 font-mono text-xs font-semibold text-cyan-100 whitespace-nowrap shrink-0 transition-colors select-none"
            >
              {sym.label}
            </button>
          ))}
        </div>

        {/* Code Textarea with Line Numbers */}
        <div className="relative flex bg-[#090D16] min-h-[280px] max-h-[440px] overflow-auto">
          <div
            aria-hidden="true"
            className={`select-none py-4 px-2.5 sm:px-3 text-right font-mono text-slate-600 bg-[#0B0F19] border-r border-white/[0.06] tabular-nums leading-6 ${
              fontSize === 'sm' ? 'text-xs' : 'text-sm'
            }`}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            aria-label={`Editor de código para ${functionName}`}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className={`code-editor flex-1 w-full py-4 px-3.5 sm:px-4 bg-transparent text-slate-100 focus:outline-none resize-none leading-6 whitespace-pre overflow-x-auto ${
              forceMobile
                ? 'text-base'
                : fontSize === 'sm'
                  ? 'text-base sm:text-[13px]'
                  : 'text-base sm:text-[15px]'
            }`}
            rows={Math.max(12, Math.min(20, lineCount + 1))}
          />
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="px-3.5 sm:px-4 py-3 border-y border-white/[0.08] bg-[#0E1424] flex flex-wrap items-center justify-between gap-2.5">
        <div className={`flex flex-wrap items-center gap-2 ${forceMobile ? 'w-full' : 'w-full sm:w-auto'}`}>
          <button
            type="button"
            disabled={runLoading}
            onClick={handleRunTests}
            className={`inline-flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[38px] px-4 py-2 text-sm font-semibold text-[#0B0F19] bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 active:scale-[0.98] rounded-xl sm:rounded-lg transition-all whitespace-nowrap ${
              forceMobile ? 'flex-1' : 'flex-1 sm:flex-none'
            }`}
          >
            {runLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            {runLoading ? `Executando (${langMeta.shortLabel})...` : 'Executar Testes'}
          </button>

          {examMode && !examSubmitted && (
            <button
              type="button"
              disabled={runLoading}
              onClick={handleDeliverExam}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[38px] px-3.5 py-2 text-xs font-semibold text-amber-100 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 disabled:opacity-50 rounded-xl sm:rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Flag className="w-3.5 h-3.5" />
              Entregar Prova
            </button>
          )}
        </div>

        <div className={`flex flex-wrap items-center gap-2 ${forceMobile ? 'w-full' : 'w-full sm:w-auto'}`}>
          {!examMode && (
            <button
              type="button"
              disabled={hintLoading}
              onClick={() => handleAskHint()}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[42px] sm:min-h-[38px] px-3.5 py-2 text-xs font-semibold text-cyan-200 bg-cyan-500/12 hover:bg-cyan-500/20 border border-cyan-400/30 disabled:opacity-50 rounded-xl sm:rounded-lg transition-colors whitespace-nowrap ${
                forceMobile ? 'flex-1' : 'flex-1 sm:flex-none'
              }`}
            >
              {hintLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HelpCircle className="w-3.5 h-3.5" />}
              Dica Socrática (I.A.)
            </button>
          )}

          {(!examMode || examSubmitted) && (
            <button
              type="button"
              disabled={reviewLoading}
              onClick={handleRequestReview}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[42px] sm:min-h-[38px] px-3.5 py-2 text-xs font-semibold text-purple-200 bg-purple-500/12 hover:bg-purple-500/20 border border-purple-400/30 disabled:opacity-50 rounded-xl sm:rounded-lg transition-colors whitespace-nowrap ${
                forceMobile ? 'flex-1' : 'flex-1 sm:flex-none'
              }`}
            >
              {reviewLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ClipboardCheck className="w-3.5 h-3.5" />}
              Code Review (I.A.)
            </button>
          )}

          {examMode && !examSubmitted && (
            <span className="text-[11px] text-slate-400">
              Code Review liberado após entregar
            </span>
          )}
        </div>
      </div>

      {/* Output Zone (Hidden on mobile when Editor tab is selected) */}
      <div className={outputVisibilityClass}>
      {/* Output Tabs (Interactive Filter Control) */}
      <div className="px-3.5 sm:px-4 pt-3 bg-[#0D1322] border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveOutputTab('tests')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeOutputTab === 'tests'
              ? 'border-cyan-400 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Testes Automatizados{runResult ? ` (${passedCount}/${runResult.results.length})` : ` (${testCases.length})`}
        </button>
        <button
          type="button"
          onClick={() => setActiveOutputTab('console')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeOutputTab === 'console'
              ? 'border-cyan-400 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Console{runResult && runResult.logs.length > 0 ? ` (${runResult.logs.length})` : ''}
        </button>
        {aiTabAvailable && (
          <button
            type="button"
            onClick={() => setActiveOutputTab('ai')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeOutputTab === 'ai'
                ? 'border-purple-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {examMode ? 'Code Review Pós-Prova' : 'Dicas & Professor I.A.'}
            {(hintThread.length > 0 || reviewData || progressiveHintLevel > 0) ? ' (Pronto)' : ''}
          </button>
        )}
      </div>

      {/* Output Body */}
      <div className="p-4 bg-[#0D1322] min-h-[220px] space-y-3">
        {activeOutputTab === 'tests' && (
          <>
            {runLoading && (
              <div className="p-5 rounded-xl bg-[#0B0F19] border border-cyan-500/25 flex items-center gap-3 text-sm text-slate-200">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />
                <span>
                  Compilando e validando seu código em {langMeta.name} contra os {testCases.length} casos de teste...
                </span>
              </div>
            )}

            {!runLoading && !runResult && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Clique em <strong className="text-slate-200">Executar Testes</strong> para validar sua solução em{' '}
                  <strong className="text-slate-200">{langMeta.name}</strong> nos {testCases.length} cenários abaixo (incluindo casos extremos):
                </p>
                <div className="space-y-2">
                  {testCases.map((tc) => (
                    <div
                      key={tc.id}
                      className="p-3 rounded-xl bg-[#0B0F19] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-medium text-slate-200">{tc.label}</span>
                        {tc.isEdgeCase && (
                          <span className="text-amber-300 ml-2">· Caso extremo</span>
                        )}
                      </div>
                      <div className="font-mono text-slate-400 truncate">
                        {functionName}({tc.input.map(formatValue).join(', ')}) → {formatValue(tc.expected)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!runLoading && runResult?.compileError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-rose-300">Falha na execução ({langMeta.name})</p>
                  <p className="text-xs font-mono text-rose-200 whitespace-pre-wrap">{runResult.compileError}</p>
                </div>
              </div>
            )}

            {!runLoading && runResult && !runResult.compileError && (
              <div className="space-y-3">
                <div
                  className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${
                    runResult.allPassed
                      ? 'bg-emerald-500/10 border-emerald-400/35 text-emerald-200'
                      : 'bg-amber-500/10 border-amber-400/35 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-sm font-semibold">
                    {runResult.allPassed ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>Todos os {runResult.results.length} testes passaram!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                        <span>
                          {passedCount} de {runResult.results.length} testes passaram — revise os casos em vermelho.
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-xs font-mono tabular-nums opacity-80">
                    {runResult.totalDurationMs} ms
                  </span>
                </div>

                <div className="space-y-2">
                  {runResult.results.map((r) => (
                    <div
                      key={r.id}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                        r.passed
                          ? 'bg-[#0B0F19] border-emerald-500/20'
                          : 'bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-medium">
                          {r.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span className={r.passed ? 'text-slate-100' : 'text-rose-200'}>
                            {r.label}
                          </span>
                          <span className={r.passed ? 'text-emerald-400' : 'text-rose-400'}>
                            · {r.passed ? 'Passou' : 'Falhou'}
                          </span>
                          {r.isEdgeCase && (
                            <span className="text-amber-300">· Caso extremo</span>
                          )}
                        </div>
                        <span className="font-mono text-slate-500 tabular-nums">{r.durationMs} ms</span>
                      </div>

                      <div className="font-mono text-[11px] text-slate-400 grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                        <div className="truncate">
                          <span className="text-slate-500">Entrada:</span> {r.input.map(formatValue).join(', ')}
                        </div>
                        <div className="truncate">
                          <span className="text-slate-500">Esperado:</span>{' '}
                          <span className="text-emerald-300">{formatValue(r.expected)}</span>
                        </div>
                        <div className="truncate">
                          <span className="text-slate-500">Obtido:</span>{' '}
                          <span className={r.passed ? 'text-emerald-300' : 'text-rose-300'}>
                            {r.error ? `Erro: ${r.error}` : formatValue(r.actual)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeOutputTab === 'console' && (
          <div className="p-3.5 rounded-xl bg-[#090D16] border border-white/[0.06] font-mono text-xs min-h-[160px] space-y-1.5">
            <div className="flex items-center gap-2 text-slate-500 pb-2 border-b border-white/[0.06]">
              <Terminal className="w-3.5 h-3.5" />
              <span>Saída de {langMeta.consoleCommand}</span>
            </div>
            {!runResult || runResult.logs.length === 0 ? (
              <p className="text-slate-500 pt-2">
                Nenhuma saída registrada. Use {langMeta.consoleCommand} no seu código em {langMeta.name} para inspecionar variáveis passo a passo.
              </p>
            ) : (
              runResult.logs.map((line, i) => (
                <div key={i} className="text-cyan-200 break-words">
                  {line}
                </div>
              ))
            )}
          </div>
        )}

        {activeOutputTab === 'ai' && (
          <div className="space-y-4">
            {/* Multi-turn Socratic Hint Thread */}
            {hintThread.length > 0 && (
              <div className="space-y-3">
                {hintThread.filter((entry) => !entry.hidden).map((entry) =>
                  entry.role === 'user' ? (
                    <div
                      key={entry.id}
                      className="p-3.5 rounded-xl bg-[#161F34] border border-white/10 ml-4 text-xs text-slate-100 space-y-1"
                    >
                      <p className="font-semibold text-slate-300">{studentName}</p>
                      <p className="whitespace-pre-line leading-relaxed">{entry.text}</p>
                    </div>
                  ) : (
                    entry.hint && (
                      <div
                        key={entry.id}
                        className="p-4 rounded-xl bg-[#0B0F19] border border-cyan-500/25 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-cyan-300 font-medium">
                          <span>Orientação Socrática · Professor I.A.</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">{entry.hint.conceitoAcademico}</span>
                            {voice.isSupported && (() => {
                              const srcId = `ai-hint-${entry.id}`;
                              const speakingThis =
                                voice.isSpeaking && voice.activeSourceId === srcId;
                              const spokenPayload = `${entry.hint!.diagnosticoTecnico}. ${entry.hint!.perguntaSocratica}. Dica prática: ${entry.hint!.pistaDirecionada}. Próximo passo: ${entry.hint!.proximoPasso}`;
                              return (
                                <button
                                  type="button"
                                  onClick={() => voice.toggleSpeak(spokenPayload, srcId)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors ${
                                    speakingThis
                                      ? 'bg-rose-500/15 border-rose-400/40 text-rose-200'
                                      : 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-400/30 text-cyan-200'
                                  }`}
                                >
                                  {speakingThis ? (
                                    <Square className="w-3 h-3 fill-current" />
                                  ) : (
                                    <Volume2 className="w-3.5 h-3.5" />
                                  )}
                                  {speakingThis ? 'Parar' : 'Ouvir'}
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          {entry.hint.diagnosticoTecnico}
                        </p>
                        <div className="p-3.5 rounded-lg bg-cyan-500/8 border border-cyan-400/20">
                          <p className="text-xs font-semibold text-cyan-300 mb-1">
                            Pergunta para você refletir
                          </p>
                          <p className="text-sm text-white leading-relaxed">
                            {entry.hint.perguntaSocratica}
                          </p>
                        </div>
                        <div className="text-xs text-slate-300 space-y-1">
                          <p>
                            <strong className="text-slate-100">Pista técnica:</strong>{' '}
                            {entry.hint.pistaDirecionada}
                          </p>
                          <p>
                            <strong className="text-slate-100">Próximo passo:</strong>{' '}
                            {entry.hint.proximoPasso}
                          </p>
                        </div>
                      </div>
                    )
                  )
                )}

                {/* Follow-up Reply Box to answer the Professor's Socratic question */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (hintReplyInput.trim()) {
                      handleAskHint(hintReplyInput);
                    }
                  }}
                  className="flex flex-col sm:flex-row gap-2 pt-1"
                >
                  <input
                    type="text"
                    value={hintReplyInput}
                    onChange={(e) => setHintReplyInput(e.target.value)}
                    placeholder="Responda ao Professor ou conte o que você tentou..."
                    className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-base sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    disabled={!hintReplyInput.trim() || hintLoading}
                    className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 text-xs font-semibold text-[#0B0F19] bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Responder
                  </button>
                </form>

                {progressiveHintLevel === 0 && (
                  <button
                    type="button"
                    onClick={handleOpenProgressiveHint}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    Quero também a dica passo a passo da aula (Nível 1, 2 e 3)
                  </button>
                )}
              </div>
            )}

            {(hintLoading || reviewLoading) && (
              <div className="p-5 rounded-xl bg-[#0B0F19] border border-white/[0.08] flex items-center gap-3 text-sm text-slate-300">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />
                <span>
                  {reviewLoading
                    ? 'Professor I.A. analisando legibilidade, clareza e casos especiais do seu código...'
                    : 'Professor I.A. lendo seu código para preparar uma dica sob medida (máx. 15s)...'}
                </span>
              </div>
            )}

            {/* Bulletproof Progressive Local Hints (Auto-shown on AI fallback OR on demand) */}
            {(progressiveHintLevel > 0 || hintError) && (() => {
              const effectiveLevel = progressiveHintLevel > 0 ? progressiveHintLevel : 1;
              const fallback3Hints: [string, string, string] = progressiveHints ?? [
                localFallbackHint?.diagnostico ??
                  `Releia o enunciado de "${challengeTitle}" e confira o que a função "${functionName}" recebe de entrada e o que deve devolver.`,
                localFallbackHint
                  ? `${localFallbackHint.pergunta} ${localFallbackHint.proximoPasso}`
                  : `Resolva primeiro o caso mais simples passo a passo, guardando o resultado em uma variável antes do return.`,
                `Confira se a função "${functionName}" devolve explicitamente o valor esperado com return em todos os caminhos e teste com ${langMeta.consoleCommand} para ver cada valor.`,
              ];
              const failedNow = runResult ? runResult.results.filter((r) => !r.passed) : [];

              return (
                <div className="space-y-3">
                  {/* Discreet honest notice when AI couldn't respond — NEVER a dead-end red wall */}
                  {hintError && (
                    <div className="p-3.5 rounded-xl bg-slate-800/70 border border-amber-400/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-200">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-amber-200">
                          Professor I.A. indisponível no momento — ativamos a Dica Guiada da Aula para você não travar!
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Motivo: {hintError}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={hintLoading}
                        onClick={() => handleAskHint(lastFailedHintReply)}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-100 font-semibold whitespace-nowrap shrink-0 self-start sm:self-center transition-colors"
                      >
                        Tentar I.A. novamente
                      </button>
                    </div>
                  )}

                  {/* Failed tests or compile error quick diagnosis */}
                  {(runResult?.compileError || failedNow.length > 0) && (
                    <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-white/[0.08] space-y-1.5 text-xs">
                      <p className="font-semibold text-slate-200">
                        O que os testes mostraram agora:
                      </p>
                      {runResult?.compileError ? (
                        <p className="font-mono text-rose-300 whitespace-pre-wrap leading-relaxed">
                          {runResult.compileError}
                        </p>
                      ) : (
                        <ul className="space-y-1 text-slate-300 font-mono text-[11px]">
                          {failedNow.slice(0, 3).map((t) => (
                            <li key={t.id}>
                              • {t.label}: esperado{' '}
                              <span className="text-emerald-300">{formatValue(t.expected)}</span>, veio{' '}
                              <span className="text-rose-300">
                                {t.error ? `Erro (${t.error})` : formatValue(t.actual)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Interactive 3-Level Progressive Hint Card */}
                  <div className="p-4 rounded-xl bg-amber-500/[0.07] border border-amber-400/35 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-amber-300">
                        <Lightbulb className="w-4 h-4 shrink-0" />
                        Dica Guiada da Aula · Nível {effectiveLevel} de 3
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          Instantânea · Funciona sempre
                        </span>
                        {voice.isSupported && (() => {
                          const srcId = 'progressive-hint';
                          const speakingThis =
                            voice.isSpeaking && voice.activeSourceId === srcId;
                          const spokenLevelText = `Dica guiada nível ${effectiveLevel}. ${fallback3Hints[effectiveLevel - 1]}`;
                          return (
                            <button
                              type="button"
                              onClick={() => voice.toggleSpeak(spokenLevelText, srcId)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors ${
                                speakingThis
                                  ? 'bg-rose-500/15 border-rose-400/40 text-rose-200'
                                  : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-400/35 text-amber-200'
                              }`}
                            >
                              {speakingThis ? (
                                <Square className="w-3 h-3 fill-current" />
                              ) : (
                                <Volume2 className="w-3.5 h-3.5" />
                              )}
                              {speakingThis ? 'Parar' : 'Ouvir'}
                            </button>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Level 1 */}
                    <div className="p-3 rounded-lg bg-[#0B0F19]/85 border border-white/[0.07] space-y-1">
                      <p className="text-[11px] font-semibold text-cyan-300">
                        Nível 1 · Empurrãozinho suave
                      </p>
                      <p className="text-sm text-slate-100 leading-relaxed">
                        {fallback3Hints[0]}
                      </p>
                      {localFallbackHint && progressiveHints && (
                        <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                          Análise do seu código atual: {localFallbackHint.diagnostico}
                        </p>
                      )}
                    </div>

                    {/* Level 2 */}
                    {effectiveLevel >= 2 && (
                      <div className="p-3 rounded-lg bg-[#0B0F19]/85 border border-amber-400/25 space-y-1">
                        <p className="text-[11px] font-semibold text-amber-300">
                          Nível 2 · Passo a passo do que escrever
                        </p>
                        <p className="text-sm text-slate-100 leading-relaxed">
                          {fallback3Hints[1]}
                        </p>
                      </div>
                    )}

                    {/* Level 3 */}
                    {effectiveLevel >= 3 && (
                      <div className="p-3 rounded-lg bg-[#0B0F19]/85 border border-emerald-400/30 space-y-2">
                        <p className="text-[11px] font-semibold text-emerald-300">
                          Nível 3 · Molde quase pronto (complete os espaços!)
                        </p>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {fallback3Hints[2]}
                        </p>
                        {progressiveHintTemplate && (
                          <pre className="p-3 rounded-lg bg-[#080C15] border border-white/[0.08] font-mono text-xs text-emerald-200 overflow-x-auto leading-relaxed">
                            <code>{progressiveHintTemplate}</code>
                          </pre>
                        )}
                      </div>
                    )}

                    {/* Progressive escalation button */}
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                      {effectiveLevel < 3 ? (
                        <button
                          type="button"
                          onClick={() => {
                            const nextLvl: 2 | 3 = effectiveLevel < 2 ? 2 : 3;
                            setProgressiveHintLevel(nextLvl);
                            if (voice.autoSpeak && voice.isSupported) {
                              voice.speak(
                                `Dica nível ${nextLvl}. ${fallback3Hints[nextLvl - 1]}`,
                                'progressive-hint'
                              );
                            }
                          }}
                          className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#0B0F19] font-semibold text-xs transition-colors"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          {effectiveLevel === 1
                            ? 'Quero uma dica mais fácil (Passo a passo)'
                            : 'Quero uma dica mais fácil (Ver molde do código)'}
                        </button>
                      ) : (
                        <p className="text-[11px] text-emerald-300 font-medium">
                          Complete o molde acima no editor e clique em &ldquo;Executar Testes&rdquo; para testar!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {reviewError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-3 text-xs text-rose-200">
                <div>
                  <p className="font-semibold text-rose-300">Não foi possível concluir o Code Review</p>
                  <p className="mt-1">{reviewError}</p>
                </div>
                <button
                  type="button"
                  disabled={reviewLoading}
                  onClick={handleRequestReview}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 font-medium shrink-0"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {reviewData && !reviewLoading && (
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-purple-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-purple-300">
                      Code Review · {reviewData.seloQualidade}
                    </p>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{reviewData.complexidadeBigO}</p>
                  </div>
                  {voice.isSupported && (() => {
                    const srcId = 'code-review-card';
                    const speakingThis =
                      voice.isSpeaking && voice.activeSourceId === srcId;
                    const reviewSpeech = [
                      `Resultado do Code Review: ${reviewData.seloQualidade}.`,
                      reviewData.resumoGeral,
                      reviewData.pontosFortes.length > 0
                        ? `Pontos fortes: ${reviewData.pontosFortes.join('. ')}.`
                        : '',
                      reviewData.sugestoesMelhoria.length > 0
                        ? `Sugestões de melhoria: ${reviewData.sugestoesMelhoria.join('. ')}.`
                        : '',
                      `Sobre casos especiais: ${reviewData.alertaCasosExtremos}`,
                    ]
                      .filter(Boolean)
                      .join(' ');
                    return (
                      <button
                        type="button"
                        onClick={() => voice.toggleSpeak(reviewSpeech, srcId)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-semibold transition-colors ${
                          speakingThis
                            ? 'bg-rose-500/15 border-rose-400/40 text-rose-200'
                            : 'bg-purple-500/12 hover:bg-purple-500/20 border-purple-400/35 text-purple-200'
                        }`}
                      >
                        {speakingThis ? (
                          <Square className="w-3 h-3 fill-current" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                        {speakingThis ? 'Parar' : 'Ouvir'}
                      </button>
                    );
                  })()}
                </div>

                <p className="text-sm text-slate-200 leading-relaxed">{reviewData.resumoGeral}</p>

                {/* 4 Rubric Scores */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: 'Legibilidade', val: reviewData.notas.legibilidade },
                    { label: 'Nomenclatura', val: reviewData.notas.nomenclatura },
                    { label: 'Casos Especiais', val: reviewData.notas.casosExtremos },
                    { label: 'Eficiência', val: reviewData.notas.eficiencia },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-3 rounded-lg bg-[#111827] border border-white/[0.06]"
                    >
                      <p className="text-[11px] text-slate-400">{item.label}</p>
                      <p className="text-lg font-bold font-mono text-white tabular-nums mt-0.5">
                        {item.val}<span className="text-xs text-slate-500">/10</span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-emerald-300">Pontos fortes</p>
                    <ul className="space-y-1 text-slate-300">
                      {reviewData.pontosFortes.map((p, idx) => (
                        <li key={idx}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-semibold text-amber-300">Sugestões de melhoria</p>
                    <ul className="space-y-1 text-slate-300">
                      {reviewData.sugestoesMelhoria.map((s, idx) => (
                        <li key={idx}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300">
                  <strong className="text-slate-100">Cuidado com casos especiais:</strong>{' '}
                  {reviewData.alertaCasosExtremos}
                </div>
              </div>
            )}

            {!hintLoading &&
              !reviewLoading &&
              hintThread.length === 0 &&
              !reviewData &&
              !hintError &&
              !reviewError &&
              progressiveHintLevel === 0 && (
                <div className="p-5 rounded-xl bg-[#0B0F19] border border-white/[0.06] text-xs text-slate-400 space-y-3">
                  <p className="text-slate-200 font-medium text-sm">Precisa de uma mãozinha?</p>
                  <p className="leading-relaxed">
                    Travou em algum passo? Clique em <strong className="text-cyan-300">Dica Socrática (I.A.)</strong> para receber uma orientação adaptada ao seu código — ou abra agora a <strong className="text-amber-300">Dica Guiada da Aula</strong> com 3 níveis progressivos.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {!examMode && (
                      <button
                        type="button"
                        onClick={handleOpenProgressiveHint}
                        className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-2 rounded-lg bg-amber-500/12 hover:bg-amber-500/20 border border-amber-400/35 text-amber-200 font-semibold transition-colors"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        Ver Dica Guiada (Nível 1, 2 e 3)
                      </button>
                    )}
                  </div>
                </div>
              )}

            <div ref={aiPanelEndRef} />
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
