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

async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35000);

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
      throw new Error(
        typeof payload?.error === 'string' && payload.error.trim().length > 0
          ? payload.error
          : `Erro ao consultar o Professor I.A. (${response.status}). Tente novamente.`
      );
    }
    return payload as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('O Professor I.A. demorou mais do que o esperado para responder. Tente novamente.');
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
  history?: ConversationTurnInput[];
  studentReply?: string;
}): Promise<SocraticHintResponse> {
  const data = await postJson<Partial<SocraticHintResponse>>('/api/ai/hint', {
    lessonTitle: params.lessonTitle,
    prompt: params.prompt,
    studentCode: params.studentCode,
    failedTests: params.failedTests.map((t) => ({
      label: t.label,
      input: t.input,
      expected: t.expected,
      actual: t.actual,
      error: t.error,
    })),
    careerTrack: params.careerTrack,
    studentName: params.studentName,
    programmingLanguage: params.programmingLanguage,
    history: normalizeHistoryForApi(params.history),
    studentReply: params.studentReply?.trim() || undefined,
  });

  return {
    diagnosticoTecnico:
      typeof data.diagnosticoTecnico === 'string' && data.diagnosticoTecnico.trim()
        ? data.diagnosticoTecnico.trim()
        : 'Analise como sua função está tratando os valores recebidos nos casos que falharam.',
    perguntaSocratica:
      typeof data.perguntaSocratica === 'string' && data.perguntaSocratica.trim()
        ? data.perguntaSocratica.trim()
        : 'Qual linha do seu código produz um valor diferente do esperado no primeiro teste com falha?',
    pistaDirecionada:
      typeof data.pistaDirecionada === 'string' && data.pistaDirecionada.trim()
        ? data.pistaDirecionada.trim()
        : 'Inspecione o fluxo passo a passo para confirmar o valor de cada variável.',
    conceitoAcademico:
      typeof data.conceitoAcademico === 'string' && data.conceitoAcademico.trim()
        ? data.conceitoAcademico.trim()
        : 'Depuração e Casos Extremos',
    proximoPasso:
      typeof data.proximoPasso === 'string' && data.proximoPasso.trim()
        ? data.proximoPasso.trim()
        : 'Ajuste sua lógica na IDE e clique em Executar Testes para validar.',
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
}): Promise<CodeReviewResponse> {
  return postJson<CodeReviewResponse>('/api/ai/review', params);
}

export async function askProfessorTutor(params: {
  question: string;
  codeSnippet?: string;
  careerTrack: CareerTrackId;
  level: InitialLevel;
  programmingLanguage: ProgrammingLanguage;
  history: ConversationTurnInput[];
}): Promise<TutorResponse> {
  const data = await postJson<Partial<TutorResponse>>('/api/ai/tutor', {
    question: params.question,
    codeSnippet: params.codeSnippet,
    careerTrack: params.careerTrack,
    level: params.level,
    programmingLanguage: params.programmingLanguage,
    history: normalizeHistoryForApi(params.history),
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
