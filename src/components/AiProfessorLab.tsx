import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Code2,
  Loader2,
  RotateCcw,
  Send,
  Square,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import professorEmblem from '../assets/images/professor_ai_emblem_1795049260003.jpg';
import { getLanguageMeta } from '../data/languages';
import { getTrackMeta } from '../data/tracks';
import { askProfessorTutor } from '../services/aiProfessor';
import { InitialLevel, ProgrammingLanguage, SavedTutorMessage, StudentProfile, TutorResponse } from '../types';
import {
  primeSpeechOnUserGesture,
  stopSpeech,
  useVoiceProfessor,
} from '../utils/voiceProfessor';

interface AiProfessorLabProps {
  accountId: string;
  profile: StudentProfile;
  initialMessages?: SavedTutorMessage[];
  onMessagesChange?: (messages: SavedTutorMessage[], accountId?: string) => void;
}

interface PendingRetryPayload {
  questionText: string;
  codeText: string;
  isSuggested: boolean;
}

const DEFAULT_CODE_ONLY_PROMPT = 'Analise este código e me ajude com minha resposta.';

function getSuggestedQuestions(
  lang: ProgrammingLanguage,
  experienceLevel: InitialLevel
): string[] {
  if (experienceLevel === 'zero' || experienceLevel === 'basico') {
    const beginnerLangQuestion: Record<ProgrammingLanguage, string> = {
      javascript: 'Qual a diferença entre const e let na prática, com um exemplo simples?',
      python: 'Como funcionam variáveis e texto (f-string) em Python bem passo a passo?',
      java: 'Por que no Java preciso dizer se a caixinha guarda int ou String?',
      csharp: 'Como criar variáveis e juntar texto com número em C# de um jeito fácil?',
      cpp: 'Como declarar números e textos em C++ sem me perder nos símbolos?',
    };

    return [
      'O que é uma variável na programação? Me explica com um exemplo bem simples do dia a dia.',
      beginnerLangQuestion[lang],
      'Como funciona o if e o else usando um exemplo de jogo ou compra em loja?',
      'Para que serve o comando return no final de uma função?',
    ];
  }

  const languageSpecificQuestion: Record<ProgrammingLanguage, string> = {
    javascript: 'Qual a diferença real entre usar const, let e var no JavaScript moderno?',
    python: 'Quando devo usar lista, tupla, dicionário ou conjunto (set) em Python?',
    java: 'Como funcionam referências, tipos primitivos e NullPointerException no Java?',
    csharp: 'Qual a diferença entre struct e class em C# e quando usar cada um em jogos Unity?',
    cpp: 'Por que passar std::vector por referência const (&) em C++ evita cópias caras de memória?',
  };

  return [
    'Por que notação Big-O cai tanto em Ciência da Computação e como entender O(n) vs O(log n)?',
    languageSpecificQuestion[lang],
    'Como sei quando devo usar uma Pilha (Stack), Fila (Queue) ou Tabela Hash (Map)?',
    'O que preciso dominar antes do 1º semestre de Engenharia de Software ou Jogos Digitais?',
  ];
}

function buildTutorSpeechText(text: string, structured?: TutorResponse): string {
  if (!structured) return text;
  return [
    structured.explicacao,
    structured.analogiaPratica ? `Na prática: ${structured.analogiaPratica}` : '',
    structured.exemploCodigo && structured.exemploCodigo.trim().length > 0
      ? 'Acompanhe o exemplo de código na tela.'
      : '',
    structured.perguntaVerificacao ? `Para conferir: ${structured.perguntaVerificacao}` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function AiProfessorLab({
  accountId,
  profile,
  initialMessages = [],
  onMessagesChange,
}: AiProfessorLabProps) {
  const [messages, setMessages] = useState<SavedTutorMessage[]>(initialMessages);
  const [question, setQuestion] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedPayload, setLastFailedPayload] = useState<PendingRetryPayload | null>(null);
  const [emblemLoaded, setEmblemLoaded] = useState(true);

  const feedEndRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(true);
  const voice = useVoiceProfessor({ stopOnUnmount: true });
  const trackMeta = getTrackMeta(profile.careerTrack);
  const langMeta = getLanguageMeta(profile.programmingLanguage);
  const experienceLevel: InitialLevel = profile.experienceLevel ?? profile.initialLevel;
  const suggestedQuestions = getSuggestedQuestions(profile.programmingLanguage, experienceLevel);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0 || loading || error) {
      feedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length, loading, error]);

  const handleSend = async (customPrompt?: string, retryOverride?: PendingRetryPayload) => {
    if (loading) return;
    primeSpeechOnUserGesture();

    const rawQuestion = retryOverride
      ? retryOverride.questionText
      : customPrompt !== undefined
        ? customPrompt
        : question;
    const rawCode = retryOverride
      ? retryOverride.codeText
      : customPrompt !== undefined
        ? ''
        : codeSnippet;

    const trimmedQuestion = rawQuestion.trim();
    const attachedCode = rawCode.trim();

    if (!trimmedQuestion && !attachedCode) return;

    const effectiveQuestion = trimmedQuestion || DEFAULT_CODE_ONLY_PROMPT;
    const isSuggested = retryOverride ? retryOverride.isSuggested : customPrompt !== undefined;

    // Capture ONLY the prior history before appending the current message
    const baseMessages = messages;
    const priorHistory = baseMessages.map((m) => ({
      role: m.role,
      text: m.codeSnippet
        ? `${m.text}\n\n\`\`\`${langMeta.codeFence}\n${m.codeSnippet}\n\`\`\``
        : m.text,
    }));

    const userMsg: SavedTutorMessage = {
      id: Date.now(),
      role: 'user',
      text: effectiveQuestion,
      codeSnippet: attachedCode || undefined,
    };

    const withUser = [...baseMessages, userMsg];
    setMessages(withUser);
    if (!isSuggested) {
      setQuestion('');
      setCodeSnippet('');
    }
    setLoading(true);
    setError(null);
    setLastFailedPayload(null);

    try {
      const response = await askProfessorTutor({
        question: effectiveQuestion,
        codeSnippet: attachedCode || undefined,
        careerTrack: profile.careerTrack,
        level: experienceLevel,
        experienceLevel,
        programmingLanguage: profile.programmingLanguage,
        history: priorHistory,
      });

      if (!mountedRef.current) return;

      const assistantMsg: SavedTutorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: response.explicacao,
        structured: response,
      };
      const nextMessages = [...withUser, assistantMsg];
      setMessages(nextMessages);
      onMessagesChange?.(nextMessages, accountId);

      if (voice.autoSpeak && voice.isSupported) {
        voice.speak(
          buildTutorSpeechText(assistantMsg.text, assistantMsg.structured),
          `tutor-msg-${assistantMsg.id}`
        );
      }
    } catch (err) {
      if (!mountedRef.current) return;
      // Remove pending user message so history stays valid and restore user inputs
      setMessages(baseMessages);
      if (!isSuggested) {
        setQuestion(rawQuestion);
        setCodeSnippet(rawCode);
        if (attachedCode) setShowCodeBox(true);
      }
      setLastFailedPayload({
        questionText: rawQuestion,
        codeText: rawCode,
        isSuggested,
      });
      setError(err instanceof Error ? err.message : 'Erro ao consultar o Professor I.A.');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const canSubmit = Boolean(question.trim() || codeSnippet.trim()) && !loading;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Professor Header */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-cyan-400/30 bg-[#0B0F19] shrink-0 flex items-center justify-center">
            {emblemLoaded ? (
              <img
                src={professorEmblem}
                alt="Emblema acadêmico do Professor Doutor I.A. da CodeForge Uni"
                referrerPolicy="no-referrer"
                onError={() => setEmblemLoaded(false)}
                className="w-full h-full object-cover"
              />
            ) : (
              <Code2 className="w-7 h-7 text-cyan-400" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-cyan-300">
              Plantão Socrático · Trilha {trackMeta.name} · Linguagem {langMeta.name} ({langMeta.extension})
            </p>
            <h1 className="text-2xl font-bold text-white">Professor I.A.</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              {experienceLevel === 'zero' || experienceLevel === 'basico'
                ? `Pergunte qualquer coisa sem medo! Explicações simples, com analogias do dia a dia e exemplos curtos em ${langMeta.name} no seu ritmo.`
                : `Tire dúvidas sobre algoritmos, complexidade, arquitetura ou cole um trecho de código em ${langMeta.name} para receber orientação guiada.`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {voice.isSupported && (
            <button
              type="button"
              role="switch"
              aria-checked={voice.autoSpeak}
              onClick={() => voice.setAutoSpeak(!voice.autoSpeak)}
              className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                voice.autoSpeak
                  ? 'bg-emerald-500/15 border-emerald-400/45 text-emerald-200'
                  : 'bg-[#0B0F19] border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              {voice.autoSpeak ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span>Ler respostas em voz alta</span>
              <span
                className={`font-mono text-[11px] ${
                  voice.autoSpeak ? 'text-emerald-300' : 'text-slate-500'
                }`}
              >
                {voice.autoSpeak ? 'ON' : 'OFF'}
              </span>
            </button>
          )}

          {messages.length > 0 && !loading && (
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                setMessages([]);
                onMessagesChange?.([], accountId);
                setError(null);
                setLastFailedPayload(null);
              }}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-medium text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Nova conversa
            </button>
          )}
        </div>
      </div>

      {/* Suggested Starter Prompts */}
      {messages.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              type="button"
              disabled={loading}
              onClick={() => handleSend(q)}
              className="text-left p-4 rounded-xl bg-[#111827] border border-white/[0.08] hover:border-cyan-400/50 disabled:opacity-50 text-sm text-slate-200 hover:text-white transition-colors leading-relaxed"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Conversation Feed */}
      {messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-2xl p-5 border ${
                msg.role === 'user'
                  ? 'bg-[#161F34] border-white/10 ml-0 sm:ml-12'
                  : 'bg-[#111827] border-cyan-500/20 mr-0 sm:mr-6'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                <span className={msg.role === 'user' ? 'text-slate-300 font-semibold' : 'text-cyan-300 font-semibold'}>
                  {msg.role === 'user' ? profile.name : 'Professor I.A.'}
                </span>
                <div className="flex items-center gap-2">
                  {msg.structured?.topicoRelacionado && (
                    <span className="text-slate-400">{msg.structured.topicoRelacionado}</span>
                  )}
                  {msg.role === 'assistant' && voice.isSupported && (() => {
                    const srcId = `tutor-msg-${msg.id}`;
                    const speakingThis = voice.isSpeaking && voice.activeSourceId === srcId;
                    const spokenText = buildTutorSpeechText(msg.text, msg.structured);
                    return (
                      <button
                        type="button"
                        onClick={() => voice.toggleSpeak(spokenText, srcId)}
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

              <p className="text-sm text-slate-100 whitespace-pre-line leading-relaxed">{msg.text}</p>

              {msg.codeSnippet && (
                <pre className="mt-3 p-3.5 rounded-xl bg-[#090D16] border border-white/[0.07] font-mono text-xs text-slate-200 overflow-x-auto">
                  <code>{msg.codeSnippet}</code>
                </pre>
              )}

              {msg.structured && (
                <div className="mt-4 space-y-3 pt-4 border-t border-white/[0.06]">
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-purple-300">Conexão prática ({trackMeta.shortName}):</strong>{' '}
                    {msg.structured.analogiaPratica}
                  </div>

                  {msg.structured.exemploCodigo && msg.structured.exemploCodigo.trim().length > 0 && (
                    <pre className="p-3.5 rounded-xl bg-[#090D16] border border-white/[0.07] font-mono text-xs text-cyan-200 overflow-x-auto leading-relaxed">
                      <code>{msg.structured.exemploCodigo}</code>
                    </pre>
                  )}

                  <div className="p-3.5 rounded-xl bg-cyan-500/8 border border-cyan-400/20 text-xs">
                    <p className="font-semibold text-cyan-300 mb-1">Verificação socrática</p>
                    <p className="text-slate-100 text-sm leading-relaxed">
                      {msg.structured.perguntaVerificacao}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="p-4 rounded-xl bg-[#111827] border border-white/[0.08] flex items-center gap-3 text-sm text-slate-300">
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
          <span>Professor Doutor I.A. elaborando resposta rigorosa...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-rose-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-300">Não foi possível enviar sua pergunta</p>
              <p className="text-xs text-rose-200/80 mt-0.5">{error}</p>
            </div>
          </div>
          {lastFailedPayload && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSend(undefined, lastFailedPayload)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-100 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Tentar novamente
            </button>
          )}
        </div>
      )}

      <div ref={feedEndRef} />

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-3"
      >
        <textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escreva sua dúvida ou responda ao Professor (Enter envia · Shift+Enter quebra linha)..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-base sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 resize-y"
        />

        {showCodeBox && (
          <textarea
            rows={5}
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder={`Cole aqui o trecho de código em ${langMeta.name} (${langMeta.extension}) que deseja analisar...`}
            spellCheck={false}
            className="code-editor w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-base sm:text-xs text-cyan-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-400 resize-y"
          />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => setShowCodeBox((v) => !v)}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[38px] w-full sm:w-auto px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl sm:rounded-lg transition-colors"
          >
            <Code2 className="w-4 h-4" />
            {showCodeBox ? 'Ocultar bloco de código' : 'Anexar trecho de código'}
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[42px] w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[#0B0F19] bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
            Perguntar ao Professor
          </button>
        </div>
      </form>
    </div>
  );
}
