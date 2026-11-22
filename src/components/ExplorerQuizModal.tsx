import { useState } from 'react';
import { AlertCircle, CheckCircle2, Compass, Loader2, X } from 'lucide-react';
import { requestExplorerRecommendation } from '../services/aiProfessor';
import { CareerTrackId, ExplorerRecommendation } from '../types';

interface ExplorerQuizModalProps {
  studentName: string;
  goal: string;
  onClose: () => void;
  onAdoptTrack: (track: CareerTrackId) => void;
  onQuizCompleted: (recommendedTrack: CareerTrackId) => void;
}

const QUESTIONS = [
  {
    id: 'projetoSonho',
    prompt: 'Se você tivesse 1 mês livre para construir algo do zero, o que mais te animaria?',
    options: [
      'Um jogo 2D com inimigos inteligentes, física e sistema de fases.',
      'Um aplicativo web usado por milhares de pessoas no celular e computador.',
      'Um sistema que analisa dados reais e prevê padrões com Inteligência Artificial.',
      'Um motor ultra-rápido de algoritmos, banco de dados ou ferramenta para programadores.',
    ],
  },
  {
    id: 'tipoDesafio',
    prompt: 'Qual tipo de problema mais prende sua atenção?',
    options: [
      'Simular mundos, colisões, animações e regras de interação em tempo real.',
      'Conectar interface bonita, regras de negócio e experiência fluida do usuário.',
      'Descobrir tendências escondidas em tabelas, estatísticas e métricas.',
      'Otimizar código para rodar em milissegundos usando a estrutura de dados perfeita.',
    ],
  },
  {
    id: 'materiaFavorita',
    prompt: 'Qual assunto desperta mais curiosidade quando você pensa na faculdade?',
    options: [
      'Computação Gráfica, Física Aplicada e Design de Sistemas Interativos.',
      'Engenharia de Software, Arquitetura Web e Experiência do Usuário.',
      'Probabilidade, Estatística, Álgebra Linear e Machine Learning.',
      'Estruturas de Dados, Sistemas Operacionais, Compiladores e Redes.',
    ],
  },
  {
    id: 'estiloResultado',
    prompt: 'Como você prefere enxergar o resultado do seu código funcionando?',
    options: [
      'Na tela em movimento: personagens reagindo e mecânicas respondendo na hora.',
      'Em um produto digital prático que resolve problemas reais do dia a dia.',
      'Em gráficos claros, previsões precisas e respostas baseadas em evidência.',
      'Nos benchmarks de desempenho, logs limpos e testes passando com zero falhas.',
    ],
  },
];

export function ExplorerQuizModal({
  studentName,
  goal,
  onClose,
  onAdoptTrack,
  onQuizCompleted,
}: ExplorerQuizModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplorerRecommendation | null>(null);

  const allAnswered = QUESTIONS.every((q) => Boolean(answers[q.id]));

  const handleAnalyze = async () => {
    if (!allAnswered) return;
    setLoading(true);
    setError(null);
    try {
      const rec = await requestExplorerRecommendation({
        answers,
        studentName,
        goal,
      });
      setResult(rec);
      onQuizCompleted(rec.trilhaRecomendada);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao consultar o Professor I.A.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="explorer-modal-title"
    >
      <div className="w-[94vw] max-w-lg sm:max-w-2xl max-h-[90dvh] overflow-y-auto bg-[#111827] border border-white/10 rounded-2xl flex flex-col">
        <div className="sticky top-0 z-10 bg-[#111827] px-5 sm:px-6 py-4 sm:py-5 border-b border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Compass className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <h2 id="explorer-modal-title" className="text-base sm:text-lg font-bold text-white truncate">
                Diagnóstico do Modo Explorador
              </h2>
              <p className="text-xs text-slate-400">
                Análise vocacional com o Professor I.A. · +75 XP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar diagnóstico"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {!result ? (
            <>
              {QUESTIONS.map((q, qIdx) => (
                <div key={q.id} className="space-y-2.5">
                  <p className="text-sm font-semibold text-white">
                    {qIdx + 1}. {q.prompt}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt) => {
                      const selected = answers[q.id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                          className={`text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                            selected
                              ? 'bg-cyan-500/12 border-cyan-400 text-white'
                              : 'bg-[#0B0F19]/80 border-white/[0.07] text-slate-300 hover:border-white/20'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-sm text-rose-200">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-rose-300">Falha ao gerar recomendação</p>
                    <p className="text-xs text-rose-200/80 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[48px] w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white rounded-xl border border-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!allAnswered || loading}
                  onClick={handleAnalyze}
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[#0B0F19] bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Analisando perfil...' : 'Receber recomendação do Professor I.A.'}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-5">
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Trilha recomendada para {studentName}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{result.tituloTrilha}</h3>
                <p className="text-sm text-slate-200 leading-relaxed">{result.justificativa}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0B0F19] border border-white/[0.08]">
                  <p className="text-xs font-medium text-cyan-300 mb-2">Cursos universitários alinhados</p>
                  <ul className="space-y-1.5 text-sm text-slate-200">
                    {result.cursosUniversitarios.map((c) => (
                      <li key={c}>• {c}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0F19] border border-white/[0.08]">
                  <p className="text-xs font-medium text-purple-300 mb-2">Competências-chave</p>
                  <ul className="space-y-1.5 text-sm text-slate-200">
                    {result.habilidadesChave.map((h) => (
                      <li key={h}>• {h}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-white/[0.08]">
                <p className="text-xs font-medium text-slate-400 mb-1">Primeiro mini-projeto sugerido</p>
                <p className="text-sm text-slate-200 leading-relaxed">{result.primeiroProjetoSugerido}</p>
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[48px] w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white rounded-xl border border-white/10"
                >
                  Continuar no Modo Explorador
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAdoptTrack(result.trilhaRecomendada);
                    onClose();
                  }}
                  className="min-h-[48px] w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[#0B0F19] bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors"
                >
                  Ativar trilha {result.tituloTrilha}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
