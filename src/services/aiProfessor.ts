import {
  CareerTrackId,
  CodeReviewResponse,
  CodeRunResult,
  ExplorerRecommendation,
  GeneratedChallenge,
  InitialLevel,
  MiniProjectDefinition,
  MiniProjectStep,
  ProgrammingLanguage,
  SocraticHintResponse,
  TestCase,
  TestExecutionItem,
  TutorResponse,
} from '../types';

export interface ConversationTurnInput {
  role: 'user' | 'assistant' | 'model';
  text: string;
}

export function normalizeHistoryForApi(
  history?: ConversationTurnInput[]
): { role: 'user' | 'model'; text: string }[] {
  if (!Array.isArray(history)) return [];

  const result: { role: 'user' | 'model'; text: string }[] = [];

  for (const item of history) {
    if (!item || typeof item.text !== 'string') continue;
    const text = item.text.trim();
    if (!text) continue;

    const role: 'user' | 'model' =
      item.role === 'assistant' || item.role === 'model' ? 'model' : 'user';

    if (result.length === 0 && role === 'model') continue;

    const prev = result[result.length - 1];
    if (prev && prev.role === role) {
      if (prev.text !== text) {
        prev.text = `${prev.text}\n\n${text}`;
      }
    } else {
      result.push({ role, text });
    }
  }

  return result;
}

const CLIENT_TIMEOUT_MS = 35000;
const HINT_CLIENT_TIMEOUT_MS = 15000;

function truncateClientText(text: string | undefined, maxChars: number): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars)}…`;
}

function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  if (err && typeof err === 'object' && 'name' in err && (err as { name?: unknown }).name === 'AbortError') {
    return true;
  }
  return false;
}

async function postJson<T>(
  url: string,
  body: Record<string, unknown>,
  timeoutMs: number = CLIENT_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const rawBody = await response.text();
    let payload: Record<string, unknown> = {};
    if (rawBody.trim()) {
      try {
        payload = JSON.parse(rawBody) as Record<string, unknown>;
      } catch {
        payload = {};
      }
    }

    if (!response.ok) {
      if (typeof payload?.error === 'string' && payload.error.trim().length > 0) {
        throw new Error(payload.error.trim());
      }
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error(
          `O servidor está acordando ou temporariamente indisponível (HTTP ${response.status}).`
        );
      }
      throw new Error(`Erro ao consultar o Professor I.A. (HTTP ${response.status}).`);
    }
    return payload as T;
  } catch (err) {
    if (isAbortError(err)) {
      const secs = Math.max(1, Math.round(timeoutMs / 1000));
      throw new Error(
        `A I.A. demorou mais de ${secs} segundos para responder agora.`
      );
    }
    if (err instanceof TypeError) {
      throw new Error(
        'Não foi possível conectar ao servidor da CodeForge Uni. Verifique sua conexão com a internet.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function evaluateMultiLanguageCode(params: {
  programmingLanguage: ProgrammingLanguage;
  functionName: string;
  prompt: string;
  studentCode: string;
  testCases: TestCase[];
}): Promise<CodeRunResult> {
  return postJson<CodeRunResult>('/api/ai/evaluate-code', {
    programmingLanguage: params.programmingLanguage,
    functionName: params.functionName,
    prompt: params.prompt,
    studentCode: params.studentCode,
    testCases: params.testCases,
  });
}

export async function requestSocraticHint(params: {
  lessonTitle: string;
  prompt: string;
  studentCode: string;
  failedTests: TestExecutionItem[];
  careerTrack: CareerTrackId;
  studentName: string;
  programmingLanguage: ProgrammingLanguage;
  experienceLevel?: InitialLevel;
  moduleId?: string;
  lessonOrder?: number;
  history?: ConversationTurnInput[];
  studentReply?: string;
}): Promise<SocraticHintResponse> {
  const data = await postJson<Partial<SocraticHintResponse>>(
    '/api/ai/hint',
    {
      lessonTitle: truncateClientText(params.lessonTitle, 140),
      prompt: truncateClientText(params.prompt, 500),
      studentCode: truncateClientText(params.studentCode, 3500),
      failedTests: params.failedTests.slice(0, 4).map((t) => ({
        label: truncateClientText(t.label, 60),
        input: t.input,
        expected: t.expected,
        actual: t.actual,
        error: t.error ? truncateClientText(t.error, 140) : undefined,
      })),
      careerTrack: params.careerTrack,
      studentName: truncateClientText(params.studentName, 60),
      programmingLanguage: params.programmingLanguage,
      experienceLevel: params.experienceLevel ?? 'zero',
      moduleId: params.moduleId,
      lessonOrder: params.lessonOrder,
      history: normalizeHistoryForApi(params.history).slice(-6),
      studentReply: params.studentReply?.trim()
        ? truncateClientText(params.studentReply, 800)
        : undefined,
    },
    HINT_CLIENT_TIMEOUT_MS
  );

  return {
    diagnosticoTecnico:
      typeof data.diagnosticoTecnico === 'string' && data.diagnosticoTecnico.trim()
        ? data.diagnosticoTecnico.trim()
        : 'Vamos olhar com calma o que sua função está devolvendo nos casos que falharam.',
    perguntaSocratica:
      typeof data.perguntaSocratica === 'string' && data.perguntaSocratica.trim()
        ? data.perguntaSocratica.trim()
        : 'Qual linha do seu código produz um valor diferente do esperado no primeiro teste?',
    pistaDirecionada:
      typeof data.pistaDirecionada === 'string' && data.pistaDirecionada.trim()
        ? data.pistaDirecionada.trim()
        : 'Confira cada variável passo a passo e veja se o return devolve exatamente o pedido.',
    conceitoAcademico:
      typeof data.conceitoAcademico === 'string' && data.conceitoAcademico.trim()
        ? data.conceitoAcademico.trim()
        : 'Passo a passo da lógica',
    proximoPasso:
      typeof data.proximoPasso === 'string' && data.proximoPasso.trim()
        ? data.proximoPasso.trim()
        : 'Faça um pequeno ajuste no editor e clique em Executar Testes para conferir.',
  };
}

export async function requestCodeReview(params: {
  lessonTitle: string;
  prompt: string;
  studentCode: string;
  passedAllTests: boolean;
  careerTrack: CareerTrackId;
  studentName: string;
  programmingLanguage: ProgrammingLanguage;
  experienceLevel?: InitialLevel;
  moduleId?: string;
  lessonOrder?: number;
}): Promise<CodeReviewResponse> {
  return postJson<CodeReviewResponse>('/api/ai/review', {
    ...params,
    experienceLevel: params.experienceLevel ?? 'zero',
  });
}

export async function askProfessorTutor(params: {
  question: string;
  codeSnippet?: string;
  careerTrack: CareerTrackId;
  level: InitialLevel;
  experienceLevel?: InitialLevel;
  programmingLanguage: ProgrammingLanguage;
  history: ConversationTurnInput[];
}): Promise<TutorResponse> {
  const effectiveLevel = params.experienceLevel ?? params.level;
  const data = await postJson<Partial<TutorResponse>>('/api/ai/tutor', {
    question: truncateClientText(params.question, 1200),
    codeSnippet: params.codeSnippet ? truncateClientText(params.codeSnippet, 3800) : undefined,
    careerTrack: params.careerTrack,
    level: effectiveLevel,
    experienceLevel: effectiveLevel,
    programmingLanguage: params.programmingLanguage,
    history: normalizeHistoryForApi(params.history).slice(-8),
  });

  return {
    explicacao:
      typeof data.explicacao === 'string' && data.explicacao.trim()
        ? data.explicacao.trim()
        : 'Vamos analisar esse ponto passo a passo com foco na lógica subjacente.',
    analogiaPratica:
      typeof data.analogiaPratica === 'string' && data.analogiaPratica.trim()
        ? data.analogiaPratica.trim()
        : 'Esse conceito é aplicado diretamente em sistemas reais para manter o código previsível.',
    exemploCodigo: typeof data.exemploCodigo === 'string' ? data.exemploCodigo.trim() : '',
    perguntaVerificacao:
      typeof data.perguntaVerificacao === 'string' && data.perguntaVerificacao.trim()
        ? data.perguntaVerificacao.trim()
        : 'Como você testaria esse raciocínio em um pequeno caso prático?',
    topicoRelacionado:
      typeof data.topicoRelacionado === 'string' && data.topicoRelacionado.trim()
        ? data.topicoRelacionado.trim()
        : 'Fundamentos de Ciência da Computação',
  };
}

interface RawGeneratedChallenge {
  titulo: string;
  descricao: string;
  contextoUniversitario: string;
  funcaoAlvo: string;
  codigoInicial: string;
  dicaInicial: string;
  xpRecompensa: number;
  testes: {
    rotulo: string;
    entradaJson: string;
    esperadoJson: string;
    ehCasoExtremo: boolean;
  }[];
}

export async function generateAdaptiveChallenge(params: {
  topic: string;
  difficulty: 'iniciante' | 'intermediario' | 'universitario';
  careerTrack: CareerTrackId;
  programmingLanguage: ProgrammingLanguage;
}): Promise<GeneratedChallenge> {
  const raw = await postJson<RawGeneratedChallenge>('/api/ai/generate-challenge', params);

  const parsedTests: TestCase[] = (raw.testes ?? [])
    .map((t, idx) => {
      try {
        const parsedInput = JSON.parse(t.entradaJson);
        const inputArray = Array.isArray(parsedInput) ? parsedInput : [parsedInput];
        const expected = JSON.parse(t.esperadoJson);
        return {
          id: `ai-test-${idx + 1}`,
          label: t.rotulo || `Caso ${idx + 1}`,
          input: inputArray,
          expected,
          isEdgeCase: Boolean(t.ehCasoExtremo),
        } as TestCase;
      } catch {
        return null;
      }
    })
    .filter((item): item is TestCase => item !== null);

  if (parsedTests.length === 0) {
    throw new Error('Os casos de teste gerados não puderam ser validados. Tente gerar novamente.');
  }

  return {
    id: `ai-${Date.now()}`,
    titulo: raw.titulo,
    descricao: raw.descricao,
    contextoUniversitario: raw.contextoUniversitario,
    funcaoAlvo: raw.funcaoAlvo,
    codigoInicial: raw.codigoInicial,
    dicaInicial: raw.dicaInicial,
    xpRecompensa: Math.min(200, Math.max(60, Number(raw.xpRecompensa) || 90)),
    testes: parsedTests,
  };
}

export async function requestExplorerRecommendation(params: {
  answers: Record<string, string>;
  studentName: string;
  goal: string;
}): Promise<ExplorerRecommendation> {
  const res = await postJson<ExplorerRecommendation>('/api/ai/explorer-recommend', params);
  const validTracks = ['jogos', 'web', 'dados', 'sistemas'] as const;
  const track = validTracks.includes(res.trilhaRecomendada) ? res.trilhaRecomendada : 'sistemas';
  return {
    ...res,
    trilhaRecomendada: track,
  };
}

interface RawGeneratedProject {
  titulo: string;
  resumo: string;
  xpRecompensa: number;
  blueprint: {
    entrada: string;
    regras: string;
    saida: string;
  };
  etapas: {
    titulo: string;
    objetivo: string;
    enunciado: string;
    funcaoAlvo: string;
    codigoInicial: string;
    testes: {
      rotulo: string;
      entradaJson: string;
      esperadoJson: string;
      ehCasoExtremo: boolean;
    }[];
  }[];
}

export async function generateCustomMiniProject(params: {
  idea: string;
  careerTrack: CareerTrackId;
  programmingLanguage: ProgrammingLanguage;
}): Promise<MiniProjectDefinition> {
  const raw = await postJson<RawGeneratedProject>('/api/ai/generate-project', params);
  const rawSteps = Array.isArray(raw.etapas) ? raw.etapas.slice(0, 3) : [];

  if (rawSteps.length < 3) {
    throw new Error('O projeto gerado não retornou 3 etapas completas. Tente novamente.');
  }

  const steps: MiniProjectStep[] = rawSteps.map((etapa, stepIdx) => {
    const parsedTests: TestCase[] = (etapa.testes ?? [])
      .map((t, testIdx) => {
        try {
          const parsedInput = JSON.parse(t.entradaJson);
          const inputArray = Array.isArray(parsedInput) ? parsedInput : [parsedInput];
          const expected = JSON.parse(t.esperadoJson);
          return {
            id: `proj-step${stepIdx + 1}-t${testIdx + 1}`,
            label: t.rotulo || `Caso ${testIdx + 1}`,
            input: inputArray,
            expected,
            isEdgeCase: Boolean(t.ehCasoExtremo),
          } as TestCase;
        } catch {
          return null;
        }
      })
      .filter((item): item is TestCase => item !== null);

    if (parsedTests.length === 0) {
      throw new Error(`Os casos de teste da etapa ${stepIdx + 1} não puderam ser validados. Tente gerar novamente.`);
    }

    return {
      stepNumber: (stepIdx + 1) as 1 | 2 | 3,
      title: etapa.titulo || `Etapa ${stepIdx + 1}`,
      objective: etapa.objetivo || 'Implementar esta etapa do projeto.',
      prompt: etapa.enunciado || 'Implemente a função solicitada.',
      functionName: etapa.funcaoAlvo || `etapa${stepIdx + 1}`,
      starterCode: etapa.codigoInicial || '',
      testCases: parsedTests,
    };
  });

  return {
    id: `custom-proj-${Date.now()}`,
    title: raw.titulo || 'Projeto Personalizado',
    tagline: 'Projeto autoral gerado com I.A. · 3 etapas guiadas',
    summary: raw.resumo || params.idea,
    xpReward: Math.min(350, Math.max(200, Number(raw.xpRecompensa) || 280)),
    isCustomAi: true,
    blueprint: {
      entrada: raw.blueprint?.entrada || 'Parâmetros de entrada definidos nas funções.',
      regras: raw.blueprint?.regras || 'Regras de negócio com validação de casos extremos.',
      saida: raw.blueprint?.saida || 'Retornos determinísticos validados pelos testes.',
    },
    steps,
  };
}
