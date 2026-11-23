import { useCallback, useEffect, useState } from 'react';
import { Lesson } from '../types';

export type VoiceRate = 0.85 | 0.9 | 1 | 1.15 | 1.25;

export interface VoicePreferences {
  autoSpeak: boolean;
  rate: number;
}

interface VoiceEngineSnapshot {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  activeSourceId: string | null;
  voiceName: string | null;
  preferences: VoicePreferences;
}

const VOICE_PREFS_STORAGE_KEY = 'codeforge-voice-prefs-v1';
const DEFAULT_PREFS: VoicePreferences = {
  autoSpeak: false,
  rate: 1,
};

function hasSpeechSupport(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.speechSynthesis !== 'undefined' &&
      typeof window.SpeechSynthesisUtterance !== 'undefined'
    );
  } catch {
    return false;
  }
}

function clampRate(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(0.7, Math.min(1.5, Math.round(value * 100) / 100));
}

function loadVoicePreferences(): VoicePreferences {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_PREFS;
    const raw = window.localStorage.getItem(VOICE_PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<VoicePreferences>;
    return {
      autoSpeak: Boolean(parsed.autoSpeak),
      rate: typeof parsed.rate === 'number' ? clampRate(parsed.rate) : 1,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function saveVoicePreferences(prefs: VoicePreferences): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(VOICE_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota or privacy mode errors
  }
}

/**
 * Selects the best natural Brazilian Portuguese voice available in the browser.
 * Prioritizes Google PT-BR, Microsoft Francisca/Antonio, Apple Luciana/Felipe,
 * then local pt-BR voices, and finally any Portuguese voice.
 */
export function selectBestPortugueseVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (!Array.isArray(voices) || voices.length === 0) return null;

  const scoreVoice = (voice: SpeechSynthesisVoice): number => {
    const lang = (voice.lang || '').toLowerCase().replace('_', '-');
    const name = (voice.name || '').toLowerCase();

    if (!lang.startsWith('pt')) return -1;

    let score = lang === 'pt-br' ? 100 : 40;

    // Top-tier natural PT-BR voices across Chrome, Edge, Windows, macOS, iOS & Android
    if (name.includes('google') && (lang === 'pt-br' || name.includes('brasil'))) {
      score += 80;
    }
    if (
      name.includes('francisca') ||
      name.includes('antonio') ||
      name.includes('antônio') ||
      name.includes('thalita') ||
      name.includes('leila') ||
      name.includes('brenda')
    ) {
      score += 75;
    }
    if (name.includes('natural') || name.includes('neural') || name.includes('online')) {
      score += 35;
    }
    if (name.includes('luciana') || name.includes('felipe') || name.includes('maria')) {
      score += 55;
    }
    if (name.includes('brasil') || name.includes('brazil')) {
      score += 20;
    }
    if (voice.localService) {
      score += 10;
    }

    return score;
  };

  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;

  for (const voice of voices) {
    const score = scoreVoice(voice);
    if (score > bestScore) {
      bestScore = score;
      best = voice;
    }
  }

  return bestScore >= 0 ? best : null;
}

/**
 * Translates common short inline programming tokens into natural Portuguese speech
 * so the voice never reads raw punctuation aloud.
 */
function translateInlineCodeForSpeech(rawSnippet: string): string {
  const trimmed = rawSnippet.trim();
  if (!trimmed) return '';

  // Long or complex code snippets shouldn't be spelled out
  const symbolCount = (trimmed.match(/[{}[\]();=<>/*+\\|]/g) || []).length;
  if (trimmed.length > 34 || symbolCount >= 4) {
    return 'o trecho de código na tela';
  }

  const exactMap: Record<string, string> = {
    'if': 'if',
    'else': 'else',
    'if/else': 'if e else',
    'elif': 'elif',
    'else if': 'else if',
    'return': 'return',
    'const': 'const',
    'let': 'let',
    'var': 'var',
    'for': 'laço for',
    'while': 'laço while',
    'true': 'verdadeiro',
    'false': 'falso',
    'null': 'nulo',
    'none': 'vazio',
    'undefined': 'indefinido',
    '===': 'igual a',
    '==': 'igual a',
    '!==': 'diferente de',
    '!=': 'diferente de',
    '>=': 'maior ou igual a',
    '<=': 'menor ou igual a',
    '>': 'maior que',
    '<': 'menor que',
    '&&': 'e',
    '||': 'ou',
    '=>': 'seta',
    'console.log()': 'comando de imprimir no console',
    'print()': 'comando print',
    'system.out.println()': 'comando de imprimir no console',
    'console.writeline()': 'comando de imprimir no console',
    'std::cout': 'comando de imprimir no console',
  };

  const lower = trimmed.toLowerCase();
  if (lower in exactMap) {
    return exactMap[lower];
  }

  // Clean simple function calls or variable names like somarPontos() -> somarPontos
  return trimmed
    .replace(/\(\)$/g, '')
    .replace(/===/g, ' igual a ')
    .replace(/!==/g, ' diferente de ')
    .replace(/==/g, ' igual a ')
    .replace(/!=/g, ' diferente de ')
    .replace(/>=/g, ' maior ou igual a ')
    .replace(/<=/g, ' menor ou igual a ')
    .replace(/&&/g, ' e ')
    .replace(/\|\|/g, ' ou ')
    .replace(/\+/g, ' mais ')
    .replace(/[{}[\];`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Cleans markdown, strips large code blocks, translates common inline symbols,
 * and normalizes whitespace for smooth Portuguese narration.
 */
export function prepareTextForSpeech(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText.replace(/\r\n/g, '\n');

  // 1. Replace fenced code blocks with a natural spoken cue
  text = text.replace(/```[\s\S]*?```/g, ' Acompanhe o exemplo de código na tela. ');

  // 2. Clean inline code segments smartly
  text = text.replace(/`([^`\n]+)`/g, (_match, inner: string) => {
    const spoken = translateInlineCodeForSpeech(inner);
    return spoken ? ` ${spoken} ` : ' ';
  });

  // 3. Convert markdown links [label](url) -> label and strip raw URLs
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1');
  text = text.replace(/https?:\/\/\S+/g, '');

  // 4. Remove markdown headings, blockquotes, bullets, bold/italic markers
  text = text.replace(/^\s*#{1,6}\s+/gm, '');
  text = text.replace(/^\s*>\s*/gm, '');
  text = text.replace(/^\s*[-*•]\s+/gm, '');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/\*([^*\n]+)\*/g, '$1');

  // 5. Translate remaining standalone programming symbols & arrows
  text = text
    .replace(/→|->|=>/g, ' resulta em ')
    .replace(/&ldquo;|&rdquo;|&quot;/g, '"')
    .replace(/·/g, ', ')
    .replace(/===/g, ' igual a ')
    .replace(/!==/g, ' diferente de ')
    .replace(/>=/g, ' maior ou igual a ')
    .replace(/<=/g, ' menor ou igual a ')
    .replace(/&&/g, ' e ')
    .replace(/\|\|/g, ' ou ')
    .replace(/O\(1\)/g, 'tempo constante')
    .replace(/O\(n\)/g, 'tempo linear')
    .replace(/O\(log n\)/gi, 'tempo logarítmico')
    .replace(/O\(n\^2\)|O\(n²\)/gi, 'tempo quadrático');

  // 6. Remove noisy non-spoken characters while keeping Portuguese accents & punctuation
  text = text.replace(/[{}[\]|~^\\#_<>]/g, ' ');

  // 7. Turn line breaks into sentence pauses and collapse whitespace
  text = text
    .replace(/\n+/g, '. ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([.!?])\s*([.!?])+/g, '$1 ')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

/**
 * Splits long text into short natural sentences (<= 175 chars) to prevent
 * Chrome and Android Web Speech synthesis from cutting off mid-narration.
 */
function splitIntoSpeechChunks(cleanText: string, maxChunkLength = 170): string[] {
  if (!cleanText) return [];

  const rawSentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];

  for (const sentence of rawSentences) {
    if (sentence.length <= maxChunkLength) {
      chunks.push(sentence);
      continue;
    }

    // Break longer sentences at commas/semicolons/colons first
    const clauses = sentence
      .split(/(?<=[,;:])\s+/)
      .map((c) => c.trim())
      .filter(Boolean);

    let buffer = '';
    for (const clause of clauses) {
      if (clause.length > maxChunkLength) {
        if (buffer) {
          chunks.push(buffer.trim());
          buffer = '';
        }
        // Hard word-wrap safety for very long clauses without punctuation
        const words = clause.split(/\s+/);
        let wordBuf = '';
        for (const word of words) {
          if ((wordBuf ? `${wordBuf} ${word}` : word).length > maxChunkLength && wordBuf) {
            chunks.push(wordBuf.trim());
            wordBuf = word;
          } else {
            wordBuf = wordBuf ? `${wordBuf} ${word}` : word;
          }
        }
        if (wordBuf) chunks.push(wordBuf.trim());
      } else if ((buffer ? `${buffer} ${clause}` : clause).length > maxChunkLength && buffer) {
        chunks.push(buffer.trim());
        buffer = clause;
      } else {
        buffer = buffer ? `${buffer} ${clause}` : clause;
      }
    }
    if (buffer) {
      chunks.push(buffer.trim());
    }
  }

  return chunks;
}

// ============================================================================
// Singleton Reactive Speech Controller (Shared across all components)
// ============================================================================

type Listener = () => void;

const listeners = new Set<Listener>();
let currentSessionId = 0;
let queueChunks: string[] = [];
let queueIndex = 0;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let selectedVoice: SpeechSynthesisVoice | null = null;
let voicesInitialized = false;
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;

let snapshot: VoiceEngineSnapshot = {
  isSupported: hasSpeechSupport(),
  isSpeaking: false,
  isPaused: false,
  activeSourceId: null,
  voiceName: null,
  preferences: loadVoicePreferences(),
};

function notifyListeners(): void {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // Never let a subscriber break voice playback
    }
  }
}

function updateSnapshot(patch: Partial<VoiceEngineSnapshot>): void {
  snapshot = { ...snapshot, ...patch };
  notifyListeners();
}

function clearKeepAlive(): void {
  if (keepAliveTimer !== null) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

function startKeepAlive(sessionId: number): void {
  clearKeepAlive();
  // Chrome desktop can silently pause utterances >14s; short chunks + gentle check prevents stalls
  keepAliveTimer = setInterval(() => {
    if (!hasSpeechSupport() || sessionId !== currentSessionId) {
      clearKeepAlive();
      return;
    }
    const synth = window.speechSynthesis;
    if (!snapshot.isPaused && synth.paused) {
      try {
        synth.resume();
      } catch {
        // Ignore resume errors
      }
    }
  }, 4000);
}

function refreshVoices(): void {
  if (!hasSpeechSupport()) return;
  try {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      selectedVoice = selectBestPortugueseVoice(voices);
      const nextName = selectedVoice?.name ?? null;
      if (snapshot.voiceName !== nextName) {
        updateSnapshot({ voiceName: nextName });
      }
    }
  } catch {
    // Ignore browser voice enumeration errors
  }
}

function ensureVoicesReady(): void {
  if (voicesInitialized || !hasSpeechSupport()) return;
  voicesInitialized = true;
  refreshVoices();
  try {
    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
    } else {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }
  } catch {
    // Fallback gracefully
  }
}

function playNextChunk(sessionId: number): void {
  if (!hasSpeechSupport() || sessionId !== currentSessionId) return;

  if (queueIndex >= queueChunks.length) {
    clearKeepAlive();
    activeUtterance = null;
    updateSnapshot({
      isSpeaking: false,
      isPaused: false,
      activeSourceId: null,
    });
    return;
  }

  const chunkText = queueChunks[queueIndex];
  queueIndex += 1;

  try {
    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.lang = selectedVoice?.lang || 'pt-BR';
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = clampRate(snapshot.preferences.rate);
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      if (sessionId !== currentSessionId) return;
      playNextChunk(sessionId);
    };

    utterance.onerror = (ev) => {
      if (sessionId !== currentSessionId) return;
      const errType = (ev as SpeechSynthesisErrorEvent)?.error;
      // Ignore expected interruptions triggered by stop() or a newer speak()
      if (errType === 'interrupted' || errType === 'canceled') return;
      clearKeepAlive();
      activeUtterance = null;
      updateSnapshot({
        isSpeaking: false,
        isPaused: false,
        activeSourceId: null,
      });
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch {
    clearKeepAlive();
    activeUtterance = null;
    updateSnapshot({
      isSpeaking: false,
      isPaused: false,
      activeSourceId: null,
    });
  }
}

export function isSpeechSupported(): boolean {
  return hasSpeechSupport();
}

export function getVoicePreferences(): VoicePreferences {
  return snapshot.preferences;
}

export function setVoicePreferences(patch: Partial<VoicePreferences>): void {
  const nextPrefs: VoicePreferences = {
    autoSpeak: patch.autoSpeak !== undefined ? Boolean(patch.autoSpeak) : snapshot.preferences.autoSpeak,
    rate: patch.rate !== undefined ? clampRate(patch.rate) : snapshot.preferences.rate,
  };
  saveVoicePreferences(nextPrefs);
  updateSnapshot({ preferences: nextPrefs });
}

/**
 * Unlocks speech synthesis synchronously during a user tap/click gesture
 * so mobile browsers allow automatic voice feedback after an async request finishes.
 */
export function primeSpeechOnUserGesture(): void {
  if (!hasSpeechSupport() || !snapshot.preferences.autoSpeak) return;
  if (snapshot.isSpeaking) return;
  ensureVoicesReady();
  try {
    const synth = window.speechSynthesis;
    const probe = new SpeechSynthesisUtterance(' ');
    probe.volume = 0;
    probe.lang = 'pt-BR';
    synth.speak(probe);
  } catch {
    // Silently ignore if browser blocks priming
  }
}

export function stopSpeech(): void {
  currentSessionId += 1;
  queueChunks = [];
  queueIndex = 0;
  activeUtterance = null;
  clearKeepAlive();

  if (hasSpeechSupport()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore cancel errors
    }
  }

  if (snapshot.isSpeaking || snapshot.isPaused || snapshot.activeSourceId !== null) {
    updateSnapshot({
      isSpeaking: false,
      isPaused: false,
      activeSourceId: null,
    });
  }
}

export function pauseSpeech(): void {
  if (!hasSpeechSupport() || !snapshot.isSpeaking || snapshot.isPaused) return;
  try {
    window.speechSynthesis.pause();
    updateSnapshot({ isPaused: true });
  } catch {
    // Some Android browsers don't support pause — fall back to clean stop
    stopSpeech();
  }
}

export function resumeSpeech(): void {
  if (!hasSpeechSupport() || !snapshot.isSpeaking || !snapshot.isPaused) return;
  try {
    window.speechSynthesis.resume();
    updateSnapshot({ isPaused: false });
  } catch {
    stopSpeech();
  }
}

export function speakText(rawText: string, sourceId?: string): boolean {
  if (!hasSpeechSupport()) return false;
  ensureVoicesReady();
  refreshVoices();

  const prepared = prepareTextForSpeech(rawText);
  if (!prepared) return false;

  const chunks = splitIntoSpeechChunks(prepared);
  if (chunks.length === 0) return false;

  // Cancel any active speech cleanly before starting the new queue
  currentSessionId += 1;
  const sessionId = currentSessionId;
  clearKeepAlive();

  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore cancel errors
  }

  queueChunks = chunks;
  queueIndex = 0;
  activeUtterance = null;

  updateSnapshot({
    isSpeaking: true,
    isPaused: false,
    activeSourceId: sourceId ?? 'default',
  });

  startKeepAlive(sessionId);

  // Small 30ms tick prevents a known Chrome quirk where speak() right after cancel() is dropped
  setTimeout(() => {
    if (sessionId !== currentSessionId) return;
    playNextChunk(sessionId);
  }, 30);

  return true;
}

/**
 * Builds a warm, step-by-step spoken walkthrough script for any lesson:
 * 1. Friendly welcome with student name
 * 2. Simple concept explanation without code symbol clutter
 * 3. Clear explanation of the challenge + first step to start typing
 */
export function buildLessonVoiceScript(params: {
  lesson: Lesson;
  studentName: string;
  languageName: string;
}): string {
  const { lesson, studentName, languageName } = params;
  const firstName = studentName.trim().split(/\s+/)[0] || 'estudante';

  const intro = `Olá, ${firstName}! Bem-vindo à aula ${lesson.order}: ${lesson.title}. Vamos estudar juntos em ${languageName}, sem pressa e passo a passo.`;

  const summary = lesson.summary ? `Nesta aula, ${lesson.summary}` : '';

  const theoryNarration = lesson.theoryBlocks
    .slice(0, 2)
    .map((block) => `${block.heading}. ${block.body}`)
    .join(' ');

  const challengePart = `Agora vamos para o desafio prático no editor: ${lesson.challenge.prompt}`;

  const firstStep =
    lesson.progressiveHints && lesson.progressiveHints[0]
      ? `Para dar o primeiro passo agora no editor: ${lesson.progressiveHints[0]}`
      : 'Comece lendo os comentários de passo a passo no editor e teste seu código clicando em Executar Testes.';

  const closing =
    'Se travar em qualquer linha, pode clicar em Ver exemplo parecido ou em Dica que eu te ajudo na hora!';

  return [intro, summary, theoryNarration, challengePart, firstStep, closing]
    .filter(Boolean)
    .join(' ');
}

export function useVoiceProfessor(options?: { stopOnUnmount?: boolean }) {
  const stopOnUnmount = options?.stopOnUnmount ?? false;
  const [state, setState] = useState<VoiceEngineSnapshot>(() => {
    ensureVoicesReady();
    return snapshot;
  });

  useEffect(() => {
    ensureVoicesReady();
    const handleChange = () => setState(snapshot);
    listeners.add(handleChange);
    setState(snapshot);

    return () => {
      listeners.delete(handleChange);
      if (stopOnUnmount) {
        stopSpeech();
      }
    };
  }, [stopOnUnmount]);

  const speak = useCallback((text: string, sourceId?: string) => {
    return speakText(text, sourceId);
  }, []);

  const pause = useCallback(() => {
    pauseSpeech();
  }, []);

  const resume = useCallback(() => {
    resumeSpeech();
  }, []);

  const stop = useCallback(() => {
    stopSpeech();
  }, []);

  const toggleSpeak = useCallback((text: string, sourceId: string) => {
    if (snapshot.isSpeaking && snapshot.activeSourceId === sourceId) {
      stopSpeech();
      return;
    }
    speakText(text, sourceId);
  }, []);

  const setRate = useCallback((rate: number) => {
    setVoicePreferences({ rate });
  }, []);

  const setAutoSpeak = useCallback((autoSpeak: boolean) => {
    setVoicePreferences({ autoSpeak });
    if (!autoSpeak && snapshot.isSpeaking) {
      stopSpeech();
    }
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    toggleSpeak,
    isSpeaking: state.isSpeaking,
    isPaused: state.isPaused,
    activeSourceId: state.activeSourceId,
    voiceName: state.voiceName,
    rate: state.preferences.rate,
    setRate,
    autoSpeak: state.preferences.autoSpeak,
    setAutoSpeak,
    isSupported: state.isSupported,
  };
}
