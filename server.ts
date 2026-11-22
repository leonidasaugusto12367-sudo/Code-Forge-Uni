import 'dotenv/config';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';
const FALLBACK_MODEL_NAME = 'gemini-3.1-flash-lite';

type ServerProgrammingLanguage = 'javascript' | 'python' | 'java' | 'csharp' | 'cpp';

const LANGUAGE_INFO: Record<
  ServerProgrammingLanguage,
  { name: string; extension: string; fence: string; consoleCmd: string; idioms: string }
> = {
  javascript: {
    name: 'JavaScript (ES2022)',
    extension: '.js',
    fence: 'js',
    consoleCmd: 'console.log()',
    idioms: 'const/let, igualdade estrita (===), imutabilidade, funções puras, Map/Set e proteção contra NaN/undefined',
  },
  python: {
    name: 'Python 3',
    extension: '.py',
    fence: 'python',
    consoleCmd: 'print()',
    idioms: 'PEP 8, indentação limpa, divisão inteira (//), tratamento de None/tipos e uso idiomático de list/dict/set',
  },
  java: {
    name: 'Java 21',
    extension: '.java',
    fence: 'java',
    consoleCmd: 'System.out.println()',
    idioms: 'tipagem estática segura, proteção contra NullPointerException, StringBuilder/String.format e coleções (List, Map, ArrayDeque)',
  },
  csharp: {
    name: 'C# 12 (.NET)',
    extension: '.cs',
    fence: 'csharp',
    consoleCmd: 'Console.WriteLine()',
    idioms: 'convenções PascalCase/camelCase, tipos anuláveis (?), uso claro de LINQ/coleções (List, Dictionary, Stack) e tratamento de limites',
  },
  cpp: {
    name: 'C++20',
    extension: '.cpp',
    fence: 'cpp',
    consoleCmd: 'std::cout',
    idioms: 'passagem por referência const (&), STL (std::vector, std::string, std::unordered_map, std::stack) e ausência de acesso fora dos limites',
  },
};

function resolveLanguageInfo(rawLang: unknown) {
  const key = typeof rawLang === 'string' && rawLang in LANGUAGE_INFO
    ? (rawLang as ServerProgrammingLanguage)
    : 'javascript';
  return { id: key, ...LANGUAGE_INFO[key] };
}

const PROFESSOR_SYSTEM_INSTRUCTION = `
Você é o Professor Doutor da CodeForge Uni: Doutor em Ciência da Computação e Engenheiro de Software Sênior com vasta experiência em ensino universitário (CC, Engenharia de Software, Sistemas de Informação e Jogos Digitais) e indústria de tecnologia.

DIRETRIZES PEDAGÓGICAS INEGOCIÁVEIS:
1. Idioma exclusivo: Português do Brasil natural, claro, direto, respeitoso e motivador para jovens estudantes.
2. Rigor técnico absoluto: NUNCA invente sintaxe inexistente na linguagem escolhida pelo aluno (JavaScript, Python, Java, C# ou C++) e NUNCA simplifique conceitos a ponto de ensinar errado. Use terminologia correta da computação (escopo léxico, imutabilidade, complexidade assintótica Big-O, invariante de laço, caso base, casos extremos/edge cases) explicando sempre de forma acessível.
3. Método Socrático em dúvidas e erros: quando o aluno erra um exercício, explique a causa técnica exata do erro e faça uma pergunta orientadora inteligente que leve o aluno a descobrir a correção sozinho. NUNCA entregue o código final resolvido pronto quando o pedido for de dica socrática.
4. Code Review rigoroso: avalie sempre (a) Legibilidade e clareza estrutural, (b) Nomenclatura semântica de variáveis e funções, (c) Tratamento de casos extremos (entrada vazia, zero, negativos, limites, tipos), e (d) Eficiência algorítmica e complexidade (Big-O) respeitando os idiomas da linguagem escolhida.
5. Responda estritamente no formato JSON solicitado pelo schema, sem markdown extra fora das strings.
`.trim();

function getAiClient(): GoogleGenAI {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || '').trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const err = new Error('GEMINI_API_KEY não configurada no ambiente.');
    (err as Error & { statusCode?: number }).statusCode = 503;
    throw err;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface NormalizedHistoryItem {
  role: 'user' | 'model';
  text: string;
}

interface GeminiContentTurn {
  role: 'user' | 'model';
  parts: { text: string }[];
}

/**
 * Normalizes conversation history for the Gemini API:
 * - Maps 'assistant' -> 'model' and 'user' -> 'user'
 * - Removes empty entries
 * - Drops any leading 'model' turn (Gemini multi-turn must start with 'user')
 * - Enforces strict user/model alternation by merging/deduplicating consecutive same-role entries
 */
function normalizeGeminiHistory(rawHistory: unknown): NormalizedHistoryItem[] {
  if (!Array.isArray(rawHistory)) return [];

  const normalized: NormalizedHistoryItem[] = [];

  for (const entry of rawHistory) {
    if (!entry || typeof entry !== 'object') continue;
    const rawRole = String((entry as { role?: unknown }).role ?? '').toLowerCase();
    const rawText = typeof (entry as { text?: unknown }).text === 'string'
      ? (entry as { text: string }).text.trim()
      : '';

    if (!rawText) continue;

    const role: 'user' | 'model' =
      rawRole === 'assistant' || rawRole === 'model' ? 'model' : 'user';

    if (normalized.length === 0 && role === 'model') {
      continue;
    }

    const last = normalized[normalized.length - 1];
    if (last && last.role === role) {
      if (last.text !== rawText) {
        last.text = `${last.text}\n\n${rawText}`;
      }
    } else {
      normalized.push({ role, text: rawText });
    }
  }

  return normalized;
}

/**
 * Builds valid multi-turn Gemini `contents` guaranteeing that the final turn
 * is a single 'user' message without duplicating or having two consecutive 'user' turns.
 */
function buildMultiTurnContents(
  rawHistory: unknown,
  currentUserMessage: string
): GeminiContentTurn[] {
  const cleanedHistory = normalizeGeminiHistory(rawHistory);
  const currentText = currentUserMessage.trim();

  if (cleanedHistory.length > 0 && cleanedHistory[cleanedHistory.length - 1].role === 'user') {
    const lastUser = cleanedHistory[cleanedHistory.length - 1];
    if (lastUser.text !== currentText && !currentText.includes(lastUser.text)) {
      lastUser.text = `${lastUser.text}\n\n${currentText}`;
    } else {
      lastUser.text = currentText;
    }
  } else {
    cleanedHistory.push({ role: 'user', text: currentText });
  }

  return cleanedHistory.map((item) => ({
    role: item.role,
    parts: [{ text: item.text }],
  }));
}

/**
 * Safely strips markdown code fences and parses JSON from Gemini output.
 */
function safeParseGeminiJson<T>(rawText: string): { parsed: Partial<T> | null; cleanedText: string } {
  let cleaned = rawText.trim();

  // Strip ```json ... ``` or ``` ... ``` fences
  const fencedMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch && fencedMatch[1]) {
    cleaned = fencedMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(cleaned) as Partial<T>;
    if (parsed && typeof parsed === 'object') {
      return { parsed, cleanedText: cleaned };
    }
  } catch {
    // Try extracting the outermost JSON object if surrounded by extra text
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        const candidate = cleaned.slice(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(candidate) as Partial<T>;
        if (parsed && typeof parsed === 'object') {
          return { parsed, cleanedText: cleaned };
        }
      } catch {
        // Fall through to null parsed
      }
    }
  }

  return { parsed: null, cleanedText: cleaned };
}

function asNonEmptyString(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

function asOptionalString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asScore(value: unknown, fallback = 7): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(10, Math.round(n)));
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const valid = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    if (valid.length > 0) return valid;
  }
  return fallback;
}

function deepEqualServer(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;

  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return true;
    return Math.abs(a - b) < 1e-6;
  }

  if (typeof a !== typeof b || a === null || b === null) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqualServer(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const keysA = Object.keys(aObj);
    const keysB = Object.keys(bObj);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(bObj, key)) return false;
      if (!deepEqualServer(aObj[key], bObj[key])) return false;
    }
    return true;
  }

  return false;
}

function formatCodeWithLineNumbers(code: string): string {
  return code
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line, idx) => `${String(idx + 1).padStart(3, ' ')} | ${line}`)
    .join('\n');
}

/**
 * Deterministic pre-flight syntax guard for non-JS languages so obvious syntax mistakes
 * (unbalanced delimiters, Python mixed/broken indentation, Java/C#/C++ missing braces)
 * immediately return a clear error with line number before invoking the AI evaluator.
 */
function runPreFlightSyntaxCheck(
  lang: ServerProgrammingLanguage,
  rawCode: string
): string | null {
  const code = rawCode.replace(/\r\n/g, '\n');
  const lines = code.split('\n');

  // 1. Check balanced (), [], {} ignoring string literals and single-line comments
  const stack: { ch: string; line: number }[] = [];
  const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
  const closers: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    let inString: string | null = null;
    let escaped = false;

    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      const next = line[j + 1];

      if (inBlockComment) {
        if (ch === '*' && next === '/') {
          inBlockComment = false;
          j++;
        }
        continue;
      }

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === '\\') {
          escaped = true;
          continue;
        }
        if (ch === inString) {
          inString = null;
        }
        continue;
      }

      if (lang === 'python' && ch === '#') break;
      if (lang !== 'python' && ch === '/' && next === '/') break;
      if (lang !== 'python' && ch === '/' && next === '*') {
        inBlockComment = true;
        j++;
        continue;
      }

      if (ch === '"' || ch === "'") {
        inString = ch;
        continue;
      }

      if (pairs[ch]) {
        stack.push({ ch, line: lineNum });
      } else if (closers[ch]) {
        const top = stack.pop();
        if (!top || top.ch !== closers[ch]) {
          return `Erro de sintaxe na linha ${lineNum}: delimitador "${ch}" inesperado ou sem abertura correspondente.`;
        }
      }
    }
  }

  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    return `Erro de sintaxe na linha ${unclosed.line}: "${unclosed.ch}" não foi fechado com "${pairs[unclosed.ch]}".`;
  }

  // 2. Python-specific indentation check: block header ending with ':' must be followed by indented body
  if (lang === 'python') {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      if (/^(def|class|if|elif|else|for|while|try|except|finally|with)\b.*:\s*(#.*)?$/.test(trimmed)) {
        const headerIndent = line.length - line.trimStart().length;
        // Look ahead for next non-empty, non-comment line
        let foundNext = false;
        for (let k = i + 1; k < lines.length; k++) {
          const nextTrim = lines[k].trim();
          if (!nextTrim || nextTrim.startsWith('#')) continue;
          foundNext = true;
          const nextIndent = lines[k].length - lines[k].trimStart().length;
          if (nextIndent <= headerIndent) {
            return `IndentationError na linha ${k + 1}: esperado bloco indentado após "${trimmed}" (linha ${i + 1}).`;
          }
          break;
        }
        if (!foundNext) {
          return `IndentationError na linha ${i + 1}: esperado bloco indentado após "${trimmed}".`;
        }
      }
    }
  }

  return null;
}

async function callGeminiRaw(
  contents: string | GeminiContentTurn[],
  responseSchema: Record<string, unknown>,
  extraSystemInstruction?: string
): Promise<string> {
  const ai = getAiClient();
  const modelsToTry = [MODEL_NAME, FALLBACK_MODEL_NAME];
  let lastError: unknown;

  for (const model of modelsToTry) {
    const maxRetries = model === MODEL_NAME ? 2 : 1;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: extraSystemInstruction
              ? `${PROFESSOR_SYSTEM_INSTRUCTION}\n\n${extraSystemInstruction}`
              : PROFESSOR_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema,
          },
        });

        const rawText = (response.text ?? '').trim();
        if (!rawText) {
          throw new Error('O Professor I.A. retornou uma resposta vazia.');
        }
        return rawText;
      } catch (error) {
        lastError = error;
        const msg = error instanceof Error ? error.message : String(error);
        const isTransient =
          msg.includes('429') ||
          msg.includes('503') ||
          msg.includes('500') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('RESOURCE_EXHAUSTED');

        if (!isTransient) {
          throw error;
        }

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 600 * Math.pow(2, attempt)));
        }
      }
    }
  }

  throw lastError;
}

function handleApiError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : 'Erro inesperado ao consultar o Professor I.A.';
  const statusCode = (error as { statusCode?: number; status?: number })?.statusCode
    ?? (error as { status?: number })?.status
    ?? (message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED') ? 403 : 500);

  let userMessage = 'Não foi possível conectar ao Professor I.A. agora. Tente novamente em instantes.';
  if (message.includes('GEMINI_API_KEY') || message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED') || statusCode === 403) {
    userMessage = 'Verifique se a chave da API Gemini está configurada no painel Settings > Secrets do ambiente.';
  } else if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
    userMessage = 'Limite temporário de requisições da I.A. atingido. Aguarde alguns segundos e tente novamente.';
  } else if (message.includes('503') || message.includes('UNAVAILABLE')) {
    userMessage = 'O servidor do Professor I.A. está temporariamente com alta demanda. Aguarde alguns segundos e clique em Tentar novamente.';
  } else if (message.includes('404') || message.includes('NOT_FOUND')) {
    userMessage = 'Modelo de I.A. indisponível no momento. Tente novamente em instantes.';
  } else if (message.includes('400') || message.includes('INVALID_ARGUMENT')) {
    userMessage = 'Não foi possível processar o formato desta solicitação. Tente reenviar sua mensagem.';
  } else if (message.includes('interpretar a resposta')) {
    userMessage = message;
  }

  res.status(typeof statusCode === 'number' && statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
    error: userMessage,
    details: process.env.NODE_ENV === 'production' ? undefined : message,
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Ensure malformed JSON request bodies always return valid JSON error responses
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({ error: 'Corpo da requisição inválido. Tente enviar novamente.' });
      return;
    }
    next(err);
  });

  // Immediate health checks for Cloud Run readiness/liveness probes
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ ok: true, status: 'ok', service: 'CodeForge Uni' });
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ ok: true, status: 'ok', service: 'CodeForge Uni API' });
  });

  // 1. Socratic Hint endpoint (supports initial hint AND multi-turn Socratic replies)
  app.post('/api/ai/hint', async (req: Request, res: Response) => {
    try {
      const {
        lessonTitle,
        prompt,
        studentCode,
        failedTests,
        careerTrack,
        studentName,
        programmingLanguage,
        history,
        studentReply,
      } = req.body ?? {};

      if (!lessonTitle || typeof studentCode !== 'string') {
        res.status(400).json({ error: 'Dados insuficientes para gerar a dica socrática.' });
        return;
      }

      const langInfo = resolveLanguageInfo(programmingLanguage);

      const failedSummary = Array.isArray(failedTests) && failedTests.length > 0
        ? failedTests
            .map(
              (t: { label?: string; input?: unknown; expected?: unknown; actual?: unknown; error?: string }) =>
                `- Teste "${t.label ?? 'Caso'}": entrada=${JSON.stringify(t.input)}, esperado=${JSON.stringify(t.expected)}, obtido=${t.error ? `ERRO: ${t.error}` : JSON.stringify(t.actual)}`
            )
            .join('\n')
        : 'O aluno ainda não executou testes ou pediu orientação antes de finalizar.';

      const trimmedReply = typeof studentReply === 'string' ? studentReply.trim() : '';

      const currentTurnPrompt = trimmedReply
        ? `
Contexto do exercício: ${lessonTitle}
Linguagem escolhida pelo aluno: ${langInfo.name} (${langInfo.extension})
Código atual do aluno na IDE:
\`\`\`${langInfo.fence}
${studentCode}
\`\`\`
Testes com falha no momento:
${failedSummary}

Resposta ou nova dúvida do aluno sobre sua orientação anterior:
${trimmedReply}

Continue a orientação socrática em Português do Brasil específica para ${langInfo.name}, avaliando o raciocínio do aluno, corrigindo imprecisões conceituais e guiando o próximo passo sem entregar o código pronto.
`.trim()
        : `
Aluno: ${studentName || 'Estudante'}
Trilha de interesse: ${careerTrack || 'explorador'}
Linguagem de programação escolhida: ${langInfo.name} (${langInfo.extension})
Desafio: ${lessonTitle}
Enunciado: ${prompt}

Código atual do aluno (${langInfo.name}):
\`\`\`${langInfo.fence}
${studentCode}
\`\`\`

Resultados dos testes com falha:
${failedSummary}

Forneça uma orientação socrática rigorosa em Português do Brasil específica para ${langInfo.name}. NÃO forneça a solução completa pronta. Explique o erro técnico ou conceitual observado e faça uma pergunta que guie o estudante a corrigir o próprio código.
`.trim();

      const schema = {
        type: Type.OBJECT,
        properties: {
          diagnosticoTecnico: {
            type: Type.STRING,
            description: 'Explicação clara e tecnicamente precisa da causa do erro ou lacuna lógica atual.',
          },
          perguntaSocratica: {
            type: Type.STRING,
            description: 'Uma pergunta direta e instigante que leve o aluno a raciocinar sobre a correção.',
          },
          pistaDirecionada: {
            type: Type.STRING,
            description: 'Uma dica prática sem entregar o código pronto.',
          },
          conceitoAcademico: {
            type: Type.STRING,
            description: 'Nome e breve definição do conceito de Ciência da Computação envolvido.',
          },
          proximoPasso: {
            type: Type.STRING,
            description: 'Ação imediata sugerida para testar na IDE.',
          },
        },
        required: [
          'diagnosticoTecnico',
          'perguntaSocratica',
          'pistaDirecionada',
          'conceitoAcademico',
          'proximoPasso',
        ],
      };

      const multiTurnContents = buildMultiTurnContents(history, currentTurnPrompt);
      const rawText = await callGeminiRaw(multiTurnContents, schema);
      const { parsed, cleanedText } = safeParseGeminiJson<{
        diagnosticoTecnico: string;
        perguntaSocratica: string;
        pistaDirecionada: string;
        conceitoAcademico: string;
        proximoPasso: string;
      }>(rawText);

      res.json({
        diagnosticoTecnico: asNonEmptyString(
          parsed?.diagnosticoTecnico,
          cleanedText || 'Analise cuidadosamente como sua função trata os parâmetros de entrada e os casos extremos.'
        ),
        perguntaSocratica: asNonEmptyString(
          parsed?.perguntaSocratica,
          'O que sua função retorna exatamente quando recebe o primeiro caso de teste que falhou?'
        ),
        pistaDirecionada: asNonEmptyString(
          parsed?.pistaDirecionada,
          `Use ${langInfo.consoleCmd} nos valores intermediários e compare com o retorno esperado em cada teste.`
        ),
        conceitoAcademico: asNonEmptyString(
          parsed?.conceitoAcademico,
          'Rastreamento de Estado e Casos Extremos'
        ),
        proximoPasso: asNonEmptyString(
          parsed?.proximoPasso,
          'Ajuste uma condição por vez na IDE e clique em Executar Testes para validar sua hipótese.'
        ),
      });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // 2. Rigorous Code Review endpoint
  app.post('/api/ai/review', async (req: Request, res: Response) => {
    try {
      const {
        lessonTitle,
        prompt,
        studentCode,
        passedAllTests,
        careerTrack,
        studentName,
        programmingLanguage,
      } = req.body ?? {};
      if (!lessonTitle || typeof studentCode !== 'string') {
        res.status(400).json({ error: 'Código obrigatório para realizar o Code Review.' });
        return;
      }

      const langInfo = resolveLanguageInfo(programmingLanguage);

      const userPrompt = `
Aluno: ${studentName || 'Estudante'}
Trilha de carreira: ${careerTrack || 'explorador'}
Linguagem escolhida: ${langInfo.name} (${langInfo.extension})
Boas práticas específicas desta linguagem: ${langInfo.idioms}
Desafio: ${lessonTitle}
Enunciado: ${prompt}
Passou em todos os testes automatizados? ${passedAllTests ? 'SIM' : 'NÃO'}

Código submetido para Code Review (${langInfo.name}):
\`\`\`${langInfo.fence}
${studentCode}
\`\`\`

Faça um Code Review rigoroso de nível universitário e engenharia de software sênior em Português do Brasil para código escrito em ${langInfo.name}.
Avalie de 0 a 10:
- legibilidade (clareza, indentação, fluxo lógico e idioma de ${langInfo.name})
- nomenclatura (nomes semânticos seguindo as convenções de ${langInfo.name})
- casosExtremos (proteção contra entradas vazias, valores negativos, zero, limites e tipos)
- eficiencia (uso adequado de estruturas de dados de ${langInfo.name}, complexidade temporal/espacial Big-O)

Forneça a complexidade estimada (ex: "O(n) tempo · O(1) espaço"), pontos fortes reais, melhorias concretas (sem reescrever tudo à toa se já estiver bom) e um selo de qualidade.
`.trim();

      const schema = {
        type: Type.OBJECT,
        properties: {
          resumoGeral: { type: Type.STRING, description: 'Síntese técnica da qualidade do código.' },
          seloQualidade: {
            type: Type.STRING,
            description: 'Classificação curta: ex. "Em Evolução", "Sólido", "Nível Universitário" ou "Engenharia Limpa".',
          },
          complexidadeBigO: {
            type: Type.STRING,
            description: 'Análise concisa de tempo e espaço, ex: "Tempo O(n) · Espaço O(1)".',
          },
          notas: {
            type: Type.OBJECT,
            properties: {
              legibilidade: { type: Type.INTEGER },
              nomenclatura: { type: Type.INTEGER },
              casosExtremos: { type: Type.INTEGER },
              eficiencia: { type: Type.INTEGER },
            },
            required: ['legibilidade', 'nomenclatura', 'casosExtremos', 'eficiencia'],
          },
          pontosFortes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          sugestoesMelhoria: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          alertaCasosExtremos: {
            type: Type.STRING,
            description: 'Observação específica sobre edge cases tratados ou faltantes.',
          },
        },
        required: [
          'resumoGeral',
          'seloQualidade',
          'complexidadeBigO',
          'notas',
          'pontosFortes',
          'sugestoesMelhoria',
          'alertaCasosExtremos',
        ],
      };

      const rawText = await callGeminiRaw(userPrompt, schema);
      const { parsed, cleanedText } = safeParseGeminiJson<{
        resumoGeral: string;
        seloQualidade: string;
        complexidadeBigO: string;
        notas: {
          legibilidade: number;
          nomenclatura: number;
          casosExtremos: number;
          eficiencia: number;
        };
        pontosFortes: string[];
        sugestoesMelhoria: string[];
        alertaCasosExtremos: string;
      }>(rawText);

      res.json({
        resumoGeral: asNonEmptyString(
          parsed?.resumoGeral,
          cleanedText || 'Código analisado com foco em clareza, nomenclatura e robustez.'
        ),
        seloQualidade: asNonEmptyString(parsed?.seloQualidade, passedAllTests ? 'Sólido' : 'Em Evolução'),
        complexidadeBigO: asNonEmptyString(parsed?.complexidadeBigO, 'Análise assintótica compatível com o problema'),
        notas: {
          legibilidade: asScore(parsed?.notas?.legibilidade, 7),
          nomenclatura: asScore(parsed?.notas?.nomenclatura, 7),
          casosExtremos: asScore(parsed?.notas?.casosExtremos, passedAllTests ? 8 : 5),
          eficiencia: asScore(parsed?.notas?.eficiencia, 7),
        },
        pontosFortes: asStringArray(parsed?.pontosFortes, ['Estrutura inicial clara e aderente à assinatura solicitada.']),
        sugestoesMelhoria: asStringArray(parsed?.sugestoesMelhoria, ['Revise nomes de variáveis e valide entradas nos limites do domínio.']),
        alertaCasosExtremos: asNonEmptyString(
          parsed?.alertaCasosExtremos,
          'Verifique comportamento com entradas vazias, zero, negativos e limites extremos.'
        ),
      });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // 3. Socratic Professor Q&A Tutor endpoint (multi-turn with strict role normalization)
  app.post('/api/ai/tutor', async (req: Request, res: Response) => {
    try {
      const { question, codeSnippet, careerTrack, level, programmingLanguage, history } = req.body ?? {};
      const cleanQuestion = typeof question === 'string' ? question.trim() : '';
      const cleanCode = typeof codeSnippet === 'string' ? codeSnippet.trim() : '';

      if (!cleanQuestion && !cleanCode) {
        res.status(400).json({ error: 'Digite uma pergunta ou anexe um trecho de código para o Professor I.A.' });
        return;
      }

      const langInfo = resolveLanguageInfo(programmingLanguage);
      const effectiveQuestion = cleanQuestion || 'Analise este código e me ajude com minha resposta.';
      const currentUserMessage = cleanCode
        ? `${effectiveQuestion}\n\nTrecho de código anexado pelo aluno (${langInfo.name}):\n\`\`\`${langInfo.fence}\n${cleanCode}\n\`\`\``
        : effectiveQuestion;

      const contextInstruction = `
Contexto do aluno nesta conversa:
- Trilha escolhida: ${careerTrack || 'explorador'}
- Nível inicial: ${level || 'iniciante'}
- Linguagem de programação ativa do estudante: ${langInfo.name} (${langInfo.extension})

Responda com rigor acadêmico e didática clara em Português do Brasil. Sempre que incluir exemplos de código em \`exemploCodigo\`, escreva código 100% válido e idiomático em ${langInfo.name} (salvo se o aluno pedir explicitamente outra linguagem). Se o aluno estiver respondendo à sua pergunta socrática anterior, avalie a resposta dele com precisão, elogie o que acertou, corrija o que estiver impreciso e avance o raciocínio. Se o aluno pedir para fazer um exercício inteiro por ele, use o método socrático e explique o princípio técnico.
`.trim();

      const schema = {
        type: Type.OBJECT,
        properties: {
          explicacao: {
            type: Type.STRING,
            description: 'Explicação principal clara, rigorosa e estruturada em parágrafos curtos.',
          },
          analogiaPratica: {
            type: Type.STRING,
            description: 'Conexão prática com a área de interesse do aluno (jogos, web, dados ou sistemas).',
          },
          exemploCodigo: {
            type: Type.STRING,
            description: `Exemplo curto e 100% válido em ${langInfo.name} que ilustra o conceito (ou string vazia se não couber código).`,
          },
          perguntaVerificacao: {
            type: Type.STRING,
            description: 'Pergunta socrática rápida para confirmar se o aluno compreendeu o conceito.',
          },
          topicoRelacionado: {
            type: Type.STRING,
            description: 'Disciplina universitária relacionada (ex: Algoritmos I, Estruturas de Dados, Arquitetura de Software).',
          },
        },
        required: [
          'explicacao',
          'analogiaPratica',
          'exemploCodigo',
          'perguntaVerificacao',
          'topicoRelacionado',
        ],
      };

      const multiTurnContents = buildMultiTurnContents(history, currentUserMessage);
      const rawText = await callGeminiRaw(multiTurnContents, schema, contextInstruction);
      const { parsed, cleanedText } = safeParseGeminiJson<{
        explicacao: string;
        analogiaPratica: string;
        exemploCodigo: string;
        perguntaVerificacao: string;
        topicoRelacionado: string;
      }>(rawText);

      res.json({
        explicacao: asNonEmptyString(
          parsed?.explicacao,
          cleanedText || 'Vamos analisar esse conceito com calma passo a passo.'
        ),
        analogiaPratica: asNonEmptyString(
          parsed?.analogiaPratica,
          'Esse princípio aparece no dia a dia de projetos reais de software ao garantir previsibilidade e clareza.'
        ),
        exemploCodigo: asOptionalString(parsed?.exemploCodigo),
        perguntaVerificacao: asNonEmptyString(
          parsed?.perguntaVerificacao,
          'Como você aplicaria essa ideia com suas próprias palavras em um pequeno exemplo prático?'
        ),
        topicoRelacionado: asNonEmptyString(
          parsed?.topicoRelacionado,
          'Fundamentos de Ciência da Computação'
        ),
      });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // 4. Adaptive Challenge Generator endpoint
  app.post('/api/ai/generate-challenge', async (req: Request, res: Response) => {
    try {
      const { topic, difficulty, careerTrack, programmingLanguage } = req.body ?? {};
      const langInfo = resolveLanguageInfo(programmingLanguage);
      const signatureRule =
        langInfo.id === 'javascript'
          ? 'O código inicial deve declarar exatamente uma função nomeada em camelCase em JavaScript (ex: `function calcularPontuacao(eventos) {\n  // Escreva sua lógica aqui\n}`).'
          : langInfo.id === 'python'
            ? 'O código inicial deve declarar exatamente uma função em Python 3 com `def` (ex: `def calcularPontuacao(eventos):\n    # Escreva sua lógica aqui\n    pass`).'
            : langInfo.id === 'java'
              ? 'O código inicial deve declarar uma classe `public class Solucao` com um método `public static` correspondente a `funcaoAlvo` e tipos Java válidos.'
              : langInfo.id === 'csharp'
                ? 'O código inicial deve declarar `public static class Solucao` com um método `public static` correspondente a `funcaoAlvo` e tipos C# válidos.'
                : 'O código inicial deve incluir os headers STL necessários e declarar a função correspondente a `funcaoAlvo` em C++20 válido.';

      const userPrompt = `
Crie um desafio original de programação em ${langInfo.name} para a Arena da CodeForge Uni.
- Linguagem: ${langInfo.name} (${langInfo.extension})
- Tema: ${topic || 'Lógica e Estruturas de Dados'}
- Dificuldade: ${difficulty || 'intermediario'}
- Contexto de carreira: ${careerTrack || 'explorador'}

REGRAS ESTRITAS PARA TESTABILIDADE REAL:
1. ${signatureRule}
2. Crie exatamente 4 casos de teste determinísticos em \`testes\`, sendo pelo menos 2 casos extremos (ex: lista vazia, número zero, valor negativo ou limite).
3. Em cada teste:
   - \`entradaJson\` deve ser uma string JSON válida representando um ARRAY de argumentos a serem passados para a função (ex: \`"[[10, -5, 20]]"\` para uma função que recebe 1 lista/vetor, ou \`"[100, 25]"\` para uma função que recebe 2 números).
   - \`esperadoJson\` deve ser uma string JSON válida representando o retorno exato esperado (ex: \`"25"\`, \`"true"\`, \`"[1, 2]"\`).
4. Verifique mentalmente todos os 4 testes com sua própria implementação correta em ${langInfo.name} para garantir 100% de consistência matemática e sintática!
`.trim();

      const schema = {
        type: Type.OBJECT,
        properties: {
          titulo: { type: Type.STRING },
          descricao: { type: Type.STRING },
          contextoUniversitario: { type: Type.STRING },
          funcaoAlvo: { type: Type.STRING },
          codigoInicial: { type: Type.STRING },
          dicaInicial: { type: Type.STRING },
          xpRecompensa: { type: Type.INTEGER },
          testes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                rotulo: { type: Type.STRING },
                entradaJson: { type: Type.STRING },
                esperadoJson: { type: Type.STRING },
                ehCasoExtremo: { type: Type.BOOLEAN },
              },
              required: ['rotulo', 'entradaJson', 'esperadoJson', 'ehCasoExtremo'],
            },
          },
        },
        required: [
          'titulo',
          'descricao',
          'contextoUniversitario',
          'funcaoAlvo',
          'codigoInicial',
          'dicaInicial',
          'xpRecompensa',
          'testes',
        ],
      };

      const rawText = await callGeminiRaw(userPrompt, schema);
      const { parsed } = safeParseGeminiJson<{
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
      }>(rawText);

      if (!parsed || !Array.isArray(parsed.testes) || parsed.testes.length === 0) {
        throw new Error('Não foi possível interpretar a resposta estruturada do desafio. Tente gerar novamente.');
      }

      res.json({
        titulo: asNonEmptyString(parsed.titulo, `Desafio de ${topic || 'Algoritmos'}`),
        descricao: asNonEmptyString(parsed.descricao, 'Implemente a função solicitada tratando todos os casos extremos.'),
        contextoUniversitario: asNonEmptyString(
          parsed.contextoUniversitario,
          'Algoritmos e Estruturas de Dados · 1º/2º Semestre'
        ),
        funcaoAlvo: asNonEmptyString(parsed.funcaoAlvo, 'resolverDesafio'),
        codigoInicial: asNonEmptyString(parsed.codigoInicial, ''),
        dicaInicial: asNonEmptyString(
          parsed.dicaInicial,
          'Comece validando os casos extremos antes da lógica principal.'
        ),
        xpRecompensa: Math.min(200, Math.max(60, Number(parsed.xpRecompensa) || 90)),
        testes: parsed.testes,
      });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // 5. Explorer Mode Vocational Recommendation endpoint
  app.post('/api/ai/explorer-recommend', async (req: Request, res: Response) => {
    try {
      const { answers, studentName, goal } = req.body ?? {};
      const userPrompt = `
Você está orientando ${studentName || 'um estudante'} no Modo Explorador da CodeForge Uni.
Objetivo declarado: ${goal || 'chegar preparado na faculdade de tecnologia'}.
Respostas do estudante no diagnóstico vocacional de computação:
${JSON.stringify(answers, null, 2)}

Analise o perfil e recomende qual das 4 trilhas especializadas melhor combina com o estudante agora:
- "jogos" (Desenvolvimento de Jogos)
- "web" (Engenharia Web & Apps)
- "dados" (Ciência de Dados & I.A.)
- "sistemas" (Engenharia de Software & Sistemas)

Explique o porquê com base nas respostas, indique os cursos universitários mais alinhados e sugira o primeiro foco de estudo.
`.trim();

      const schema = {
        type: Type.OBJECT,
        properties: {
          trilhaRecomendada: {
            type: Type.STRING,
            description: 'Exatamente um destes IDs: "jogos", "web", "dados" ou "sistemas".',
          },
          tituloTrilha: { type: Type.STRING },
          justificativa: { type: Type.STRING },
          cursosUniversitarios: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          primeiroProjetoSugerido: { type: Type.STRING },
          habilidadesChave: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          'trilhaRecomendada',
          'tituloTrilha',
          'justificativa',
          'cursosUniversitarios',
          'primeiroProjetoSugerido',
          'habilidadesChave',
        ],
      };

      const rawText = await callGeminiRaw(userPrompt, schema);
      const { parsed } = safeParseGeminiJson<{
        trilhaRecomendada: string;
        tituloTrilha: string;
        justificativa: string;
        cursosUniversitarios: string[];
        primeiroProjetoSugerido: string;
        habilidadesChave: string[];
      }>(rawText);

      const validTracks = ['jogos', 'web', 'dados', 'sistemas'];
      const recommended =
        typeof parsed?.trilhaRecomendada === 'string' && validTracks.includes(parsed.trilhaRecomendada)
          ? parsed.trilhaRecomendada
          : 'sistemas';

      res.json({
        trilhaRecomendada: recommended,
        tituloTrilha: asNonEmptyString(parsed?.tituloTrilha, 'Engenharia de Software & Sistemas'),
        justificativa: asNonEmptyString(
          parsed?.justificativa,
          'Suas respostas indicam ótima afinidade com resolução estruturada de problemas e construção de sistemas sólidos.'
        ),
        cursosUniversitarios: asStringArray(parsed?.cursosUniversitarios, [
          'Ciência da Computação',
          'Engenharia de Software',
          'Sistemas de Informação',
        ]),
        primeiroProjetoSugerido: asNonEmptyString(
          parsed?.primeiroProjetoSugerido,
          'Crie um pequeno sistema com menu interativo e validação de regras de negócio.'
        ),
        habilidadesChave: asStringArray(parsed?.habilidadesChave, [
          'Lógica de Programação',
          'Estruturas de Dados',
          'Depuração e Testes',
        ]),
      });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // 6. Multi-Language Test Evaluator endpoint (Python, Java, C#, C++)
  app.post('/api/ai/evaluate-code', async (req: Request, res: Response) => {
    const startMs = Date.now();
    try {
      const {
        programmingLanguage,
        functionName,
        prompt,
        studentCode,
        testCases,
      } = req.body ?? {};

      if (typeof studentCode !== 'string' || !studentCode.trim()) {
        res.status(400).json({ error: 'Escreva seu código antes de executar os testes.' });
        return;
      }

      if (!Array.isArray(testCases) || testCases.length === 0) {
        res.status(400).json({ error: 'Nenhum caso de teste informado para avaliação.' });
        return;
      }

      const langInfo = resolveLanguageInfo(programmingLanguage);

      // Deterministic pre-flight syntax check before calling AI evaluator
      const preFlightErr = runPreFlightSyntaxCheck(langInfo.id, studentCode);
      if (preFlightErr) {
        res.json({
          success: false,
          allPassed: false,
          compileError: preFlightErr,
          logs: [],
          results: [],
          totalDurationMs: Math.max(1, Date.now() - startMs),
        });
        return;
      }

      const formattedTests = testCases.map(
        (t: { id?: string; label?: string; input?: unknown[]; expected?: unknown; isEdgeCase?: boolean }, idx: number) => ({
          id: t.id ?? `t${idx + 1}`,
          label: t.label ?? `Caso ${idx + 1}`,
          input: Array.isArray(t.input) ? t.input : [],
          expected: t.expected,
          isEdgeCase: Boolean(t.isEdgeCase),
        })
      );

      const numberedCode = formatCodeWithLineNumbers(studentCode);

      const evalPrompt = `
Atue como um compilador/interpretador RIGOROSO e executor determinístico de ${langInfo.name} (${langInfo.extension}).
Você deve analisar sintaxe linha por linha e simular a execução REAL do código abaixo contra cada caso de teste — NUNCA dê "passou" por boa vontade ou corrija erros de sintaxe mentalmente.

Função/método esperado (aceite a convenção camelCase ou PascalCase/snake_case equivalente em ${langInfo.name}): ${functionName}
Enunciado do desafio: ${prompt}

Código enviado pelo estudante (${langInfo.name}) COM NÚMEROS DE LINHA:
\`\`\`${langInfo.fence}
${numberedCode}
\`\`\`

Casos de teste (entrada como array JSON de argumentos -> saída esperada em JSON):
${JSON.stringify(formattedTests, null, 2)}

REGRAS DE COMPILAÇÃO E AVALIAÇÃO INEGOCIÁVEIS:
1. PRIMEIRO aja como compilador real de ${langInfo.name}. Verifique rigorosamente CADA LINHA:
   - Em Java, C# e C++: falta de ponto e vírgula (\`;\`) ao final de instruções, chaves/parênteses faltando, tipos incompatíveis, variável não declarada, retorno faltando em método não-void, ou sintaxe inválida DEVEM gerar erro de compilação imediato.
   - Em Python: erro de indentação (IndentationError), falta de dois-pontos (\`:\`) em \`def/if/elif/else/for/while\`, SyntaxError, NameError ou uso inválido de palavras-chave DEVEM gerar erro imediato.
   - Verifique se a função/método "${functionName}" (ou equivalente idiomático) existe.
2. Se houver QUALQUER erro de sintaxe, indentação, tipagem ou compilação:
   - Preencha \`compileError\` citando explicitamente o NÚMERO EXATO DA LINHA (ex: "Erro de compilação na linha 4: esperado ';' ao final da instrução.") em Português do Brasil.
   - Retorne \`results\` como array vazio \`[]\`. NUNCA execute testes se o código não compila!
3. Somente se o código compilar/interpretar 100% sem erros, execute mentalmente passo a passo cada um dos ${formattedTests.length} casos de teste, respeitando a semântica exata de ${langInfo.name} (divisão inteira vs float, off-by-one / IndexError / NullPointerException, loop infinito, valores None/null/pass, arredondamento e ordem).
4. Se o corpo da função for apenas \`pass\`, vazio ou retornar um valor placeholder fixo, avalie exatamente o valor que esse código retorna, marcando \`passed: false\` onde divergir de \`expected\`.
5. Capture qualquer saída impressa via ${langInfo.consoleCmd} em \`logs\`.
6. Em cada item de \`results\`, retorne \`id\` exatamente igual ao caso de teste, \`passed\` (booleano exato comparando o retorno real com \`expected\`), \`actualJson\` (representação JSON válida do retorno real obtido, ou \`"null"\`), e \`error\` (string vazia \`""\` se não houve erro em tempo de execução, ou a descrição do erro de execução).
`.trim();

      const schema = {
        type: Type.OBJECT,
        properties: {
          compileError: {
            type: Type.STRING,
            description: 'Erro de sintaxe/compilação com número da linha em PT-BR, ou string vazia "" se o código compilar sem erros.',
          },
          logs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `Linhas impressas via ${langInfo.consoleCmd}.`,
          },
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                passed: { type: Type.BOOLEAN },
                actualJson: { type: Type.STRING },
                error: { type: Type.STRING },
              },
              required: ['id', 'passed', 'actualJson', 'error'],
            },
          },
        },
        required: ['compileError', 'logs', 'results'],
      };

      const rawText = await callGeminiRaw(evalPrompt, schema);
      const { parsed } = safeParseGeminiJson<{
        compileError: string;
        logs: string[];
        results: { id: string; passed: boolean; actualJson: string; error: string }[];
      }>(rawText);

      const elapsed = Math.max(1, Date.now() - startMs);

      if (!parsed) {
        res.json({
          success: false,
          allPassed: false,
          compileError: `Não foi possível interpretar o resultado da compilação em ${langInfo.name}. Tente executar novamente.`,
          logs: [],
          results: [],
          totalDurationMs: elapsed,
        });
        return;
      }

      const compileError = asOptionalString(parsed.compileError);
      const logs = Array.isArray(parsed.logs)
        ? parsed.logs.filter((l): l is string => typeof l === 'string')
        : [];

      if (compileError) {
        res.json({
          success: false,
          allPassed: false,
          compileError,
          logs,
          results: [],
          totalDurationMs: elapsed,
        });
        return;
      }

      const rawResults = Array.isArray(parsed.results) ? parsed.results : [];
      if (rawResults.length === 0) {
        res.json({
          success: false,
          allPassed: false,
          compileError: `A avaliação em ${langInfo.name} não retornou resultados de teste válidos. Verifique a sintaxe e tente novamente.`,
          logs,
          results: [],
          totalDurationMs: elapsed,
        });
        return;
      }

      const mappedResults = formattedTests.map((tc, idx) => {
        const match = rawResults.find((r) => r.id === tc.id) ?? rawResults[idx];
        const runtimeErr = asOptionalString(match?.error);
        let actualVal: unknown = undefined;
        let hasValidActual = false;

        if (typeof match?.actualJson === 'string' && match.actualJson.trim().length > 0) {
          try {
            actualVal = JSON.parse(match.actualJson);
            hasValidActual = true;
          } catch {
            actualVal = match.actualJson;
            hasValidActual = false;
          }
        }

        // Server-side truth verification: never trust passed=true if actual != expected or runtimeErr exists
        const matchesExpected = hasValidActual && deepEqualServer(actualVal, tc.expected);
        const passed = Boolean(match?.passed) && !runtimeErr && matchesExpected;

        return {
          id: tc.id,
          label: tc.label,
          input: tc.input,
          expected: tc.expected,
          actual: actualVal,
          passed,
          isEdgeCase: tc.isEdgeCase,
          error: runtimeErr || undefined,
          durationMs: Math.max(1, Math.round(elapsed / formattedTests.length)),
        };
      });

      const allPassed =
        mappedResults.length === formattedTests.length && mappedResults.every((r) => r.passed);

      res.json({
        success: true,
        allPassed,
        logs,
        results: mappedResults,
        totalDurationMs: elapsed,
      });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // 7. Custom 3-Step Mini-Project Generator endpoint (Oficina de Projetos)
  app.post('/api/ai/generate-project', async (req: Request, res: Response) => {
    try {
      const { idea, programmingLanguage, careerTrack } = req.body ?? {};
      const cleanIdea = typeof idea === 'string' ? idea.trim() : '';

      if (cleanIdea.length < 4) {
        res.status(400).json({
          error: 'Descreva sua ideia de mini-sistema com pelo menos uma frase curta.',
        });
        return;
      }

      const langInfo = resolveLanguageInfo(programmingLanguage);
      const signatureRule =
        langInfo.id === 'javascript'
          ? 'Em cada etapa, `codigoInicial` deve declarar uma função nomeada em JavaScript (ex: `function nomeFuncao(param) {\n  // Sua lógica aqui\n}`).'
          : langInfo.id === 'python'
            ? 'Em cada etapa, `codigoInicial` deve declarar uma função em Python 3 com `def` (ex: `def nomeFuncao(param):\n    # Sua lógica aqui\n    pass`).'
            : langInfo.id === 'java'
              ? 'Em cada etapa, `codigoInicial` deve declarar `public class Solucao` com um método `public static` válido em Java 21.'
              : langInfo.id === 'csharp'
                ? 'Em cada etapa, `codigoInicial` deve declarar `public static class Solucao` com um método `public static` válido em C# 12.'
                : 'Em cada etapa, `codigoInicial` deve incluir os headers STL necessários e declarar a função correspondente em C++20 válido.';

      const userPrompt = `
Crie um mini-projeto prático guiado de EXATAMENTE 3 ETAPAS progressivas na linguagem ${langInfo.name} (${langInfo.extension}) baseado na ideia do estudante:
- Ideia do estudante: "${cleanIdea}"
- Trilha de carreira: ${careerTrack || 'explorador'}
- Linguagem obrigatória: ${langInfo.name} (${langInfo.extension})

REGRAS ESTRITAS:
1. Crie um Blueprint claro em Português do Brasil com \`entrada\`, \`regras\` e \`saida\`.
2. Crie EXATAMENTE 3 etapas em \`etapas\` (progressivas: Etapa 1 validação/base -> Etapa 2 regra principal -> Etapa 3 consolidação/relatório).
3. ${signatureRule}
4. Em cada etapa, crie 3 casos de teste determinísticos em \`testes\` (pelo menos 1 caso extremo):
   - \`entradaJson\` deve ser uma string JSON válida representando um ARRAY de argumentos (ex: \`"[[10, 20], 5]"\`).
   - \`esperadoJson\` deve ser uma string JSON válida representando o retorno exato esperado (ex: \`"35"\`, \`"true"\`, \`"[1, 2]"\`).
5. Verifique mentalmente todos os casos de teste para garantir 100% de precisão matemática e sintaxe válida em ${langInfo.name}.
`.trim();

      const schema = {
        type: Type.OBJECT,
        properties: {
          titulo: { type: Type.STRING },
          resumo: { type: Type.STRING },
          xpRecompensa: { type: Type.INTEGER },
          blueprint: {
            type: Type.OBJECT,
            properties: {
              entrada: { type: Type.STRING },
              regras: { type: Type.STRING },
              saida: { type: Type.STRING },
            },
            required: ['entrada', 'regras', 'saida'],
          },
          etapas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                titulo: { type: Type.STRING },
                objetivo: { type: Type.STRING },
                enunciado: { type: Type.STRING },
                funcaoAlvo: { type: Type.STRING },
                codigoInicial: { type: Type.STRING },
                testes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      rotulo: { type: Type.STRING },
                      entradaJson: { type: Type.STRING },
                      esperadoJson: { type: Type.STRING },
                      ehCasoExtremo: { type: Type.BOOLEAN },
                    },
                    required: ['rotulo', 'entradaJson', 'esperadoJson', 'ehCasoExtremo'],
                  },
                },
              },
              required: [
                'titulo',
                'objetivo',
                'enunciado',
                'funcaoAlvo',
                'codigoInicial',
                'testes',
              ],
            },
          },
        },
        required: ['titulo', 'resumo', 'xpRecompensa', 'blueprint', 'etapas'],
      };

      const rawText = await callGeminiRaw(userPrompt, schema);
      const { parsed } = safeParseGeminiJson<{
        titulo: string;
        resumo: string;
        xpRecompensa: number;
        blueprint: { entrada: string; regras: string; saida: string };
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
      }>(rawText);

      if (!parsed || !Array.isArray(parsed.etapas) || parsed.etapas.length < 3) {
        throw new Error(
          'Não foi possível estruturar as 3 etapas do seu mini-projeto. Tente reformular a ideia e gerar novamente.'
        );
      }

      const etapas = parsed.etapas.slice(0, 3).map((etapa, idx) => ({
        titulo: asNonEmptyString(etapa?.titulo, `Etapa ${idx + 1}`),
        objetivo: asNonEmptyString(etapa?.objetivo, 'Implementar a regra proposta para esta etapa.'),
        enunciado: asNonEmptyString(etapa?.enunciado, 'Implemente a função tratando os casos extremos.'),
        funcaoAlvo: asNonEmptyString(etapa?.funcaoAlvo, `etapa${idx + 1}`),
        codigoInicial: asNonEmptyString(etapa?.codigoInicial, ''),
        testes: Array.isArray(etapa?.testes) ? etapa.testes : [],
      }));

      res.json({
        titulo: asNonEmptyString(parsed.titulo, 'Mini-Projeto Personalizado'),
        resumo: asNonEmptyString(parsed.resumo, cleanIdea),
        xpRecompensa: Math.min(350, Math.max(200, Number(parsed.xpRecompensa) || 280)),
        blueprint: {
          entrada: asNonEmptyString(parsed.blueprint?.entrada, 'Dados fornecidos como parâmetros nas funções.'),
          regras: asNonEmptyString(parsed.blueprint?.regras, 'Validação de entradas, processamento limpo e proteção de casos extremos.'),
          saida: asNonEmptyString(parsed.blueprint?.saida, 'Resultado determinístico validado pelos testes automatizados.'),
        },
        etapas,
      });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // Fallback JSON error handlers for /api/* routes
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Rota da API não encontrada.' });
  });

  app.use('/api', (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    handleApiError(res, err);
  });

  // Production static serving (Cloud Run) vs Vite dev middleware
  const distPath = path.resolve(__dirname, 'dist');
  const distIndexPath = path.join(distPath, 'index.html');
  const hasDistBuild = fs.existsSync(distIndexPath);
  const isExplicitDev = process.env.NODE_ENV === 'development';
  const useStaticProd = process.env.NODE_ENV === 'production' || (hasDistBuild && !isExplicitDev);

  if (useStaticProd) {
    if (hasDistBuild) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(distIndexPath);
      });
    } else {
      app.get('*', (_req: Request, res: Response) => {
        res.status(200).send('CodeForge Uni server is running.');
      });
    }
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.error('Vite middleware unavailable, falling back to static dist:', viteErr);
      if (hasDistBuild) {
        app.use(express.static(distPath));
        app.get('*', (_req: Request, res: Response) => {
          res.sendFile(distIndexPath);
        });
      }
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `CodeForge Uni server listening on http://0.0.0.0:${PORT} (mode: ${useStaticProd ? 'production' : 'development'})`
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start CodeForge Uni server:', err);
  process.exit(1);
});
