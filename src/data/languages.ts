import { CareerTrackId, ProgrammingLanguage, ProgrammingLanguageMeta } from '../types';

export const PROGRAMMING_LANGUAGES: ProgrammingLanguageMeta[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    shortLabel: 'JS',
    extension: '.js',
    runtimeLabel: 'JavaScript ES2022',
    tagline: 'Padrão da web, aplicativos e protótipos rápidos com execução nativa instantânea no navegador.',
    universityFocus: 'Desenvolvimento Web, Full-Stack e Prototipação Rápida',
    consoleCommand: 'console.log()',
    codeFence: 'js',
    executionMode: 'native',
    accentTextClass: 'text-amber-300',
    accentBgClass: 'bg-amber-500/15',
    accentBorderClass: 'border-amber-400/50',
  },
  {
    id: 'python',
    name: 'Python',
    shortLabel: 'Python',
    extension: '.py',
    runtimeLabel: 'Python 3.12',
    tagline: 'Sintaxe limpa e legível, excelente para o 1º semestre da faculdade, Ciência de Dados, I.A. e automação.',
    universityFocus: 'Introdução à Computação, I.A. e Ciência de Dados',
    consoleCommand: 'print()',
    codeFence: 'python',
    executionMode: 'ai_evaluator',
    accentTextClass: 'text-cyan-300',
    accentBgClass: 'bg-cyan-500/15',
    accentBorderClass: 'border-cyan-400/50',
  },
  {
    id: 'java',
    name: 'Java',
    shortLabel: 'Java',
    extension: '.java',
    runtimeLabel: 'Java 21 LTS',
    tagline: 'Muito cobrada em faculdades (POO e Estruturas de Dados) e amplamente usada em sistemas corporativos.',
    universityFocus: 'Programação Orientada a Objetos, Back-end e Estruturas de Dados',
    consoleCommand: 'System.out.println()',
    codeFence: 'java',
    executionMode: 'ai_evaluator',
    accentTextClass: 'text-rose-300',
    accentBgClass: 'bg-rose-500/15',
    accentBorderClass: 'border-rose-400/50',
  },
  {
    id: 'csharp',
    name: 'C#',
    shortLabel: 'C#',
    extension: '.cs',
    runtimeLabel: 'C# 12 · .NET',
    tagline: 'Principal linguagem da engine Unity para desenvolvimento de jogos digitais, APIs e sistemas corporativos.',
    universityFocus: 'Jogos Digitais (Unity), POO e Engenharia de Software (.NET)',
    consoleCommand: 'Console.WriteLine()',
    codeFence: 'csharp',
    executionMode: 'ai_evaluator',
    accentTextClass: 'text-purple-300',
    accentBgClass: 'bg-purple-500/15',
    accentBorderClass: 'border-purple-400/50',
  },
  {
    id: 'cpp',
    name: 'C++',
    shortLabel: 'C++',
    extension: '.cpp',
    runtimeLabel: 'C++20',
    tagline: 'Usada em jogos AAA (Unreal), robótica, alto desempenho, maratonas de programação e disciplinas base de CC.',
    universityFocus: 'Algoritmos, Estruturas de Dados, Robótica e Jogos AAA',
    consoleCommand: 'std::cout',
    codeFence: 'cpp',
    executionMode: 'ai_evaluator',
    accentTextClass: 'text-emerald-300',
    accentBgClass: 'bg-emerald-500/15',
    accentBorderClass: 'border-emerald-400/50',
  },
];

const VALID_LANGUAGES = new Set<string>(PROGRAMMING_LANGUAGES.map((l) => l.id));

export function isValidProgrammingLanguage(value: unknown): value is ProgrammingLanguage {
  return typeof value === 'string' && VALID_LANGUAGES.has(value);
}

export function getLanguageMeta(lang: ProgrammingLanguage): ProgrammingLanguageMeta {
  return PROGRAMMING_LANGUAGES.find((item) => item.id === lang) ?? PROGRAMMING_LANGUAGES[0];
}

export function getRecommendedLanguage(careerTrack: CareerTrackId): ProgrammingLanguage {
  switch (careerTrack) {
    case 'explorador':
    case 'dados':
      return 'python';
    case 'web':
      return 'javascript';
    case 'jogos':
      return 'csharp';
    case 'sistemas':
      return 'java';
    default:
      return 'javascript';
  }
}

export function getRecommendationReason(careerTrack: CareerTrackId): string {
  switch (careerTrack) {
    case 'explorador':
      return 'Python tem a curva inicial mais clara para dominar lógica no 1º semestre antes de escolher uma especialidade.';
    case 'dados':
      return 'Python é o padrão mundial em Ciência de Dados, Machine Learning, automação e pesquisa acadêmica.';
    case 'web':
      return 'JavaScript é a linguagem nativa da web e permite executar e testar seu código instantaneamente no navegador.';
    case 'jogos':
      return 'C# é a linguagem oficial da engine Unity e combina tipagem forte com produtividade para criar jogos reais.';
    case 'sistemas':
      return 'Java é referência em Engenharia de Software, POO, Estruturas de Dados universitárias e back-end corporativo (e C++ é ótima alternativa para baixo nível).';
    default:
      return 'JavaScript permite execução nativa instantânea direto no navegador.';
  }
}
