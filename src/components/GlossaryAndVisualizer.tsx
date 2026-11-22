import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Pause, Play, RotateCcw, Search, StepForward } from 'lucide-react';
import { getGlossaryExampleCode, GLOSSARY_TERMS, GlossaryTerm } from '../data/glossary';
import { getLanguageMeta } from '../data/languages';
import { ProgrammingLanguage } from '../types';

const SORTED_ARRAY = [4, 9, 14, 19, 23, 28, 34, 41, 47, 52, 60, 68, 75, 83, 91, 99];

interface BinaryStep {
  low: number;
  high: number;
  mid: number;
  found: boolean;
}

function buildBinarySteps(arr: number[], target: number): BinaryStep[] {
  const steps: BinaryStep[] = [];
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const found = arr[mid] === target;
    steps.push({ low, high, mid, found });
    if (found) break;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return steps;
}

function buildLinearSteps(arr: number[], target: number): number[] {
  const visited: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    visited.push(i);
    if (arr[i] === target) break;
  }
  return visited;
}

type CategoryFilter = 'Todos' | 'Favoritos' | GlossaryTerm['category'];

const CATEGORIES: CategoryFilter[] = [
  'Todos',
  'Favoritos',
  'Fundamentos',
  'Estruturas de Dados',
  'Complexidade',
  'Boas Práticas',
];

interface GlossaryAndVisualizerProps {
  programmingLanguage?: ProgrammingLanguage;
  favoriteTermIds?: string[];
  onToggleFavorite?: (termId: string) => void;
}

export function GlossaryAndVisualizer({
  programmingLanguage = 'javascript',
  favoriteTermIds = [],
  onToggleFavorite,
}: GlossaryAndVisualizerProps) {
  const langMeta = getLanguageMeta(programmingLanguage);
  // Interactive Simulator State (Linear O(n) vs Binary O(log n))
  const [targetIndex, setTargetIndex] = useState(12); // value 75
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Glossary Search & Filter State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('Todos');

  const targetValue = SORTED_ARRAY[targetIndex];
  const binarySteps = useMemo(() => buildBinarySteps(SORTED_ARRAY, targetValue), [targetValue]);
  const linearSteps = useMemo(() => buildLinearSteps(SORTED_ARRAY, targetValue), [targetValue]);
  const maxSteps = Math.max(binarySteps.length, linearSteps.length);

  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [targetIndex]);

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= maxSteps - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setStepIdx((s) => Math.min(maxSteps - 1, s + 1));
    }, 650);
    return () => clearTimeout(timer);
  }, [playing, stepIdx, maxSteps]);

  const currentBinaryStep = binarySteps[Math.min(stepIdx, binarySteps.length - 1)];
  const binaryComparisons = Math.min(stepIdx + 1, binarySteps.length);
  const binaryDone = stepIdx >= binarySteps.length - 1;

  const linearCurrentIndex = linearSteps[Math.min(stepIdx, linearSteps.length - 1)];
  const linearComparisons = Math.min(stepIdx + 1, linearSteps.length);
  const linearDone = stepIdx >= linearSteps.length - 1;

  const filteredTerms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GLOSSARY_TERMS.filter((item) => {
      const matchesCat =
        category === 'Todos'
          ? true
          : category === 'Favoritos'
            ? favoriteTermIds.includes(item.id)
            : item.category === category;
      const matchesSearch =
        !q ||
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.whyItMatters.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [search, category, favoriteTermIds]);

  return (
    <div className="space-y-10">
      {/* Interactive Algorithm Visualizer Section */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#111827] border border-white/[0.08] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-cyan-300">
              Simulador Interativo · Análise de Algoritmos
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Busca Linear O(n) vs. Busca Binária O(log n)
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Escolha um número alvo no vetor ordenado de 16 elementos e compare passo a passo quantas comparações cada algoritmo precisa fazer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (stepIdx >= maxSteps - 1) setStepIdx(0);
                setPlaying((p) => !p);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0B0F19] bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap"
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {playing ? 'Pausar' : 'Simular'}
            </button>

            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setStepIdx((s) => Math.min(maxSteps - 1, s + 1));
              }}
              disabled={stepIdx >= maxSteps - 1}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap"
            >
              <StepForward className="w-3.5 h-3.5" />
              Próximo passo
            </button>

            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setStepIdx(0);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar
            </button>
          </div>
        </div>

        {/* Target Value Slider */}
        <div className="p-4 rounded-xl bg-[#0B0F19] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm">
            <label htmlFor="target-slider" className="font-medium text-slate-300 whitespace-nowrap">
              Valor alvo no vetor:
            </label>
            <span className="font-mono font-bold text-cyan-300 text-base tabular-nums">
              {targetValue}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              (índice {targetIndex})
            </span>
          </div>
          <input
            id="target-slider"
            type="range"
            min={0}
            max={SORTED_ARRAY.length - 1}
            value={targetIndex}
            onChange={(e) => setTargetIndex(Number(e.target.value))}
            className="w-full sm:w-72 accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Dual Side-by-Side Comparison Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Binary Search Panel */}
          <div className="p-5 rounded-xl bg-[#0B0F19] border border-cyan-500/25 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-white">Busca Binária · O(log n)</h2>
                <p className="text-xs text-slate-400">
                  Intervalo ativo: [{currentBinaryStep.low} .. {currentBinaryStep.high}] · Meio: {currentBinaryStep.mid}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Comparações</p>
                <p className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
                  {binaryComparisons} {binaryDone ? '· Encontrado' : '· Buscando'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {SORTED_ARRAY.map((val, idx) => {
                const isMid = idx === currentBinaryStep.mid;
                const isFound = isMid && currentBinaryStep.found;
                const inRange = idx >= currentBinaryStep.low && idx <= currentBinaryStep.high;
                return (
                  <div
                    key={val}
                    className={`p-2 rounded-lg border text-center font-mono transition-colors ${
                      isFound
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                        : isMid
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 font-bold'
                        : inRange
                        ? 'bg-[#131B2E] border-white/15 text-slate-200'
                        : 'bg-[#090D16] border-white/[0.04] text-slate-600'
                    }`}
                  >
                    <div className="text-xs tabular-nums">{val}</div>
                    <div className="text-[10px] opacity-60 tabular-nums">[{idx}]</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Linear Search Panel */}
          <div className="p-5 rounded-xl bg-[#0B0F19] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-white">Busca Linear · O(n)</h2>
                <p className="text-xs text-slate-400">
                  Inspecionando índice {linearCurrentIndex} sequencialmente
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Comparações</p>
                <p className="text-lg font-bold font-mono text-purple-300 tabular-nums">
                  {linearComparisons} {linearDone ? '· Encontrado' : '· Buscando'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {SORTED_ARRAY.map((val, idx) => {
                const isCurrent = idx === linearCurrentIndex;
                const isFound = isCurrent && val === targetValue;
                const visited = idx < linearCurrentIndex;
                return (
                  <div
                    key={val}
                    className={`p-2 rounded-lg border text-center font-mono transition-colors ${
                      isFound
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                        : isCurrent
                        ? 'bg-purple-500/20 border-purple-400 text-purple-100 font-bold'
                        : visited
                        ? 'bg-white/[0.03] border-white/[0.05] text-slate-500'
                        : 'bg-[#131B2E] border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="text-xs tabular-nums">{val}</div>
                    <div className="text-[10px] opacity-60 tabular-nums">[{idx}]</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Searchable University CS Glossary */}
      <section className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Glossário Universitário de Computação</h2>
            <p className="text-sm text-slate-400 mt-1">
              Termos técnicos essenciais do 1º e 2º semestre explicados sem enrolação com exemplos em{' '}
              <strong className={langMeta.accentTextClass}>
                {langMeta.name} ({langMeta.extension})
              </strong>
              .
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conceito (ex: Big-O, pilha)..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-[#111827] border border-white/10 text-base sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            const suffix = cat === 'Favoritos' ? ` (${favoriteTermIds.length})` : '';
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap tabular-nums ${
                  active
                    ? 'bg-cyan-400 text-[#0B0F19] font-semibold'
                    : 'bg-[#111827] border border-white/[0.08] text-slate-300 hover:text-white'
                }`}
              >
                {cat}{suffix}
              </button>
            );
          })}
        </div>

        {filteredTerms.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#111827] border border-white/[0.08] text-center text-sm text-slate-400">
            {category === 'Favoritos'
              ? 'Você ainda não salvou nenhum termo nos favoritos desta conta. Clique no ícone de marcador em qualquer card.'
              : `Nenhum conceito encontrado para "${search}". Tente outro termo ou limpe o filtro.`}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTerms.map((item) => {
              const isFav = favoriteTermIds.includes(item.id);
              return (
                <article
                  key={item.id}
                  className="p-6 rounded-2xl bg-[#111827] border border-white/[0.08] flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-cyan-300 font-medium">
                        {item.category} · {item.semester}
                      </p>
                      {onToggleFavorite && (
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(item.id)}
                          aria-label={isFav ? `Remover ${item.term} dos favoritos` : `Salvar ${item.term} nos favoritos`}
                          className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                            isFav
                              ? 'text-cyan-300 bg-cyan-500/15'
                              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white">{item.term}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{item.definition}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong className="text-slate-200">Por que importa:</strong> {item.whyItMatters}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#090D16] border border-white/[0.06] overflow-hidden">
                    <div className="px-3.5 py-1.5 border-b border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Exemplo prático</span>
                      <span className={langMeta.accentTextClass}>
                        {langMeta.name} ({langMeta.extension})
                      </span>
                    </div>
                    <pre className="p-3.5 font-mono text-xs text-emerald-200 overflow-x-auto leading-relaxed">
                      <code>{getGlossaryExampleCode(item, programmingLanguage)}</code>
                    </pre>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
