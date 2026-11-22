import { CodeRunResult, TestCase, TestExecutionItem } from '../types';

const MAX_LOOP_ITERATIONS = 50000;
const DEFAULT_WORKER_TIMEOUT_MS = 2500;

/**
 * Injects a loop iteration counter guard into braced `for`, `while`, and `do` loops
 * as a fast first-line educational guard. The Web Worker timeout below serves as
 * the guaranteed hard kill-switch for braceless loops (e.g. `while (true);`),
 * nested-condition loops, or heavy CPU recursion.
 */
function instrumentLoops(code: string): string {
  const guardDecl = `let __cfLoops = 0; const __cfCheck = () => { if (++__cfLoops > ${MAX_LOOP_ITERATIONS}) { throw new Error("Loop infinito detectado (mais de ${MAX_LOOP_ITERATIONS.toLocaleString('pt-BR')} iterações). Verifique a condição de parada e o incremento do laço."); } };\n`;

  const instrumented = code
    .replace(/\b(for\s*\([^)]*\)\s*\{)/g, '$1 __cfCheck();')
    .replace(/\b(while\s*\([^)]*\)\s*\{)/g, '$1 __cfCheck();')
    .replace(/\b(do\s*\{)/g, '$1 __cfCheck();');

  return `${guardDecl}${instrumented}`;
}

function deepEqual(a: unknown, b: unknown): boolean {
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
      if (!deepEqual(a[i], b[i])) return false;
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
      if (!deepEqual(aObj[key], bObj[key])) return false;
    }
    return true;
  }

  return false;
}

function cloneArgs(args: unknown[]): unknown[] {
  try {
    return JSON.parse(JSON.stringify(args));
  } catch {
    return [...args];
  }
}

function formatLogArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

/**
 * Synchronous fallback used only if the browser environment does not support Blob Web Workers.
 */
export function runJavaScriptChallenge(
  studentCode: string,
  functionName: string,
  testCases: TestCase[]
): CodeRunResult {
  const logs: string[] = [];
  const startTotal = performance.now();

  const safeConsole = {
    log: (...args: unknown[]) => {
      if (logs.length < 40) {
        logs.push(args.map(formatLogArg).join(' '));
      }
    },
    warn: (...args: unknown[]) => {
      if (logs.length < 40) {
        logs.push(`[aviso] ${args.map(formatLogArg).join(' ')}`);
      }
    },
    error: (...args: unknown[]) => {
      if (logs.length < 40) {
        logs.push(`[erro] ${args.map(formatLogArg).join(' ')}`);
      }
    },
  };

  let targetFn: ((...args: unknown[]) => unknown) | undefined;

  try {
    const safeCode = instrumentLoops(studentCode);
    const factory = new Function(
      'console',
      `"use strict";\n${safeCode}\nreturn typeof ${functionName} === 'function' ? ${functionName} : undefined;`
    );
    targetFn = factory(safeConsole) as ((...args: unknown[]) => unknown) | undefined;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      allPassed: false,
      compileError: `Erro de sintaxe ou inicialização: ${message}`,
      logs,
      results: [],
      totalDurationMs: Math.round((performance.now() - startTotal) * 100) / 100,
    };
  }

  if (typeof targetFn !== 'function') {
    return {
      success: false,
      allPassed: false,
      compileError: `A função obrigatória "${functionName}" não foi encontrada. Mantenha a assinatura original da função.`,
      logs,
      results: [],
      totalDurationMs: Math.round((performance.now() - startTotal) * 100) / 100,
    };
  }

  const results: TestExecutionItem[] = testCases.map((tc) => {
    const t0 = performance.now();
    try {
      const clonedInput = cloneArgs(tc.input);
      const actual = targetFn!(...clonedInput);
      const passed = deepEqual(actual, tc.expected);
      return {
        id: tc.id,
        label: tc.label,
        input: tc.input,
        expected: tc.expected,
        actual,
        passed,
        isEdgeCase: tc.isEdgeCase,
        durationMs: Math.round((performance.now() - t0) * 100) / 100,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        id: tc.id,
        label: tc.label,
        input: tc.input,
        expected: tc.expected,
        passed: false,
        isEdgeCase: tc.isEdgeCase,
        error: message,
        durationMs: Math.round((performance.now() - t0) * 100) / 100,
      };
    }
  });

  const allPassed = results.length > 0 && results.every((r) => r.passed);

  return {
    success: true,
    allPassed,
    logs,
    results,
    totalDurationMs: Math.round((performance.now() - startTotal) * 100) / 100,
  };
}

/**
 * Self-contained Web Worker script source. Runs student code in an isolated thread
 * with strict timeout termination so `while (true) {}`, `while (true);`, `for (;;);`,
 * or runaway recursion can NEVER freeze the browser UI.
 */
const WORKER_SCRIPT = `
const MAX_LOOP_ITERATIONS = ${MAX_LOOP_ITERATIONS};

function instrumentLoops(code) {
  const guardDecl = 'let __cfLoops = 0; const __cfCheck = () => { if (++__cfLoops > ' + MAX_LOOP_ITERATIONS + ') { throw new Error("Loop infinito detectado (mais de 50.000 iterações). Verifique a condição de parada e o incremento do laço."); } };\\n';
  const instrumented = code
    .replace(/\\b(for\\s*\\([^)]*\\)\\s*\\{)/g, '$1 __cfCheck();')
    .replace(/\\b(while\\s*\\([^)]*\\)\\s*\\{)/g, '$1 __cfCheck();')
    .replace(/\\b(do\\s*\\{)/g, '$1 __cfCheck();');
  return guardDecl + instrumented;
}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return true;
    return Math.abs(a - b) < 1e-6;
  }
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
}

function cloneArgs(args) {
  try {
    return JSON.parse(JSON.stringify(args));
  } catch {
    return Array.isArray(args) ? args.slice() : [];
  }
}

function sanitizeForPostMessage(val) {
  if (val === undefined) return undefined;
  if (typeof val === 'function') return '[Function]';
  if (typeof val === 'symbol') return String(val);
  try {
    return JSON.parse(JSON.stringify(val));
  } catch {
    return String(val);
  }
}

function formatLogArg(arg) {
  if (typeof arg === 'string') return arg;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

self.onmessage = function(event) {
  const { studentCode, functionName, testCases } = event.data;
  const logs = [];
  const startTotal = performance.now();

  const safeConsole = {
    log: (...args) => { if (logs.length < 40) logs.push(args.map(formatLogArg).join(' ')); },
    warn: (...args) => { if (logs.length < 40) logs.push('[aviso] ' + args.map(formatLogArg).join(' ')); },
    error: (...args) => { if (logs.length < 40) logs.push('[erro] ' + args.map(formatLogArg).join(' ')); },
  };

  let targetFn;
  try {
    // First validate raw syntax without instrumentation so syntax error messages stay clean
    new Function('"use strict";\\n' + studentCode);
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    self.postMessage({
      success: false,
      allPassed: false,
      compileError: 'Erro de sintaxe em JavaScript: ' + message,
      logs,
      results: [],
      totalDurationMs: Math.round((performance.now() - startTotal) * 100) / 100,
    });
    return;
  }

  try {
    const safeCode = instrumentLoops(studentCode);
    const factory = new Function(
      'console',
      '"use strict";\\n' + safeCode + '\\nreturn typeof ' + functionName + ' === "function" ? ' + functionName + ' : undefined;'
    );
    targetFn = factory(safeConsole);
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    self.postMessage({
      success: false,
      allPassed: false,
      compileError: 'Erro de inicialização em JavaScript: ' + message,
      logs,
      results: [],
      totalDurationMs: Math.round((performance.now() - startTotal) * 100) / 100,
    });
    return;
  }

  if (typeof targetFn !== 'function') {
    self.postMessage({
      success: false,
      allPassed: false,
      compileError: 'A função obrigatória "' + functionName + '" não foi encontrada. Mantenha a assinatura original da função.',
      logs,
      results: [],
      totalDurationMs: Math.round((performance.now() - startTotal) * 100) / 100,
    });
    return;
  }

  const results = testCases.map((tc) => {
    const t0 = performance.now();
    try {
      const clonedInput = cloneArgs(tc.input);
      const actual = targetFn(...clonedInput);
      const passed = deepEqual(actual, tc.expected);
      return {
        id: tc.id,
        label: tc.label,
        input: tc.input,
        expected: tc.expected,
        actual: sanitizeForPostMessage(actual),
        passed,
        isEdgeCase: tc.isEdgeCase,
        durationMs: Math.round((performance.now() - t0) * 100) / 100,
      };
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      return {
        id: tc.id,
        label: tc.label,
        input: tc.input,
        expected: tc.expected,
        passed: false,
        isEdgeCase: tc.isEdgeCase,
        error: message,
        durationMs: Math.round((performance.now() - t0) * 100) / 100,
      };
    }
  });

  const allPassed = results.length > 0 && results.every((r) => r.passed);
  self.postMessage({
    success: true,
    allPassed,
    logs,
    results,
    totalDurationMs: Math.round((performance.now() - startTotal) * 100) / 100,
  });
};
`;

/**
 * Executes JavaScript student code inside an isolated Web Worker with a strict timeout.
 * Guarantees infinite loops (`while (true) {}`, `while (true);`, `for (;;);`, etc.)
 * are forcefully terminated via `worker.terminate()` without freezing the browser tab.
 */
export function runJavaScriptChallengeAsync(
  studentCode: string,
  functionName: string,
  testCases: TestCase[],
  timeoutMs = DEFAULT_WORKER_TIMEOUT_MS
): Promise<CodeRunResult> {
  if (typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined') {
    return Promise.resolve(runJavaScriptChallenge(studentCode, functionName, testCases));
  }

  return new Promise<CodeRunResult>((resolve) => {
    const startTotal = performance.now();
    let settled = false;
    let worker: Worker | null = null;
    let workerUrl: string | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      if (worker) {
        try {
          worker.terminate();
        } catch {
          // Ignore termination errors
        }
        worker = null;
      }
      if (workerUrl) {
        try {
          URL.revokeObjectURL(workerUrl);
        } catch {
          // Ignore revoke errors
        }
        workerUrl = null;
      }
    };

    const finish = (result: CodeRunResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    try {
      const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
      workerUrl = URL.createObjectURL(blob);
      worker = new Worker(workerUrl);

      timerId = setTimeout(() => {
        const seconds = (timeoutMs / 1000).toFixed(1).replace('.', ',');
        finish({
          success: false,
          allPassed: false,
          compileError: `Tempo limite excedido (${seconds}s): possível loop infinito detectado (ex: while (true) sem condição de saída ou recursão infinita). A execução foi interrompida com segurança sem travar o navegador.`,
          logs: [],
          results: [],
          totalDurationMs: Math.round((performance.now() - startTotal) * 100) / 100,
        });
      }, timeoutMs);

      worker.onmessage = (event: MessageEvent<CodeRunResult>) => {
        finish(event.data);
      };

      worker.onerror = (event: ErrorEvent) => {
        finish({
          success: false,
          allPassed: false,
          compileError: `Erro de execução no sandbox JavaScript: ${event.message || 'Falha inesperada ao executar o código.'}`,
          logs: [],
          results: [],
          totalDurationMs: Math.round((performance.now() - startTotal) * 100) / 100,
        });
      };

      worker.postMessage({
        studentCode,
        functionName,
        testCases,
      });
    } catch {
      cleanup();
      finish(runJavaScriptChallenge(studentCode, functionName, testCases));
    }
  });
}
