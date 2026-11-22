import { DebugChallenge } from '../types';

export const DEBUG_CHALLENGES: DebugChallenge[] = [
  {
    id: 'dbg-off-by-one',
    title: 'O Clássico Erro Off-by-One',
    category: 'Laços & Índices',
    difficulty: 'Iniciante',
    xpReward: 95,
    symptom: 'A função `somarTodos(numeros)` retorna `NaN` para qualquer array preenchido!',
    academicConcept: 'Limites de índice em vetores base-0 (0 até length - 1)',
    functionName: 'somarTodos',
    buggyCode: `function somarTodos(numeros) {
  let soma = 0;
  for (let i = 0; i <= numeros.length; i++) {
    soma += numeros[i];
  }
  return soma;
}`,
    testCases: [
      { id: 'd1', label: 'Soma básica', input: [[2, 4, 6]], expected: 12 },
      { id: 'd2', label: 'Um elemento', input: [[10]], expected: 10, isEdgeCase: true },
      { id: 'd3', label: 'Array vazio', input: [[]], expected: 0, isEdgeCase: true },
    ],
  },
  {
    id: 'dbg-mutation',
    title: 'Mutação Silenciosa de Ranking',
    category: 'Imutabilidade',
    difficulty: 'Intermediário',
    xpReward: 120,
    symptom: 'A função `obterTop3(pontuacoes)` retorna as 3 maiores pontuações, mas está ordenando em ordem alfabética (fazendo 100 ficar atrás de 20) e ainda mutando o array original!',
    academicConcept: 'Comparador numérico em Array.prototype.sort() e cópia defensiva',
    functionName: 'obterTop3',
    buggyCode: `function obterTop3(pontuacoes) {
  const ordenado = pontuacoes.sort().reverse();
  return ordenado.slice(0, 3);
}`,
    testCases: [
      { id: 'd1', label: 'Números com dígitos diferentes', input: [[5, 100, 20, 80, 3]], expected: [100, 80, 20] },
      { id: 'd2', label: 'Menos de 3 elementos', input: [[12, 4]], expected: [12, 4], isEdgeCase: true },
      { id: 'd3', label: 'Números negativos', input: [[-10, -2, -50, -1]], expected: [-1, -2, -10], isEdgeCase: true },
      { id: 'd4', label: 'Array vazio', input: [[]], expected: [], isEdgeCase: true },
    ],
  },
  {
    id: 'dbg-max-negatives',
    title: 'O Maior Número Que Não Existe',
    category: 'Casos Extremos',
    difficulty: 'Iniciante',
    xpReward: 100,
    symptom: 'A função `encontrarMaior(valores)` funciona com números positivos, mas retorna `0` erroneamente quando todos os números da lista são negativos!',
    academicConcept: 'Inicialização de invariante de máximo com primeiro elemento',
    functionName: 'encontrarMaior',
    buggyCode: `function encontrarMaior(valores) {
  if (valores.length === 0) return null;
  let maior = 0;
  for (const n of valores) {
    if (n > maior) {
      maior = n;
    }
  }
  return maior;
}`,
    testCases: [
      { id: 'd1', label: 'Valores positivos', input: [[3, 15, 7, 2]], expected: 15 },
      { id: 'd2', label: 'Todos negativos', input: [[-15, -3, -40, -9]], expected: -3, isEdgeCase: true },
      { id: 'd3', label: 'Array vazio', input: [[]], expected: null, isEdgeCase: true },
    ],
  },
  {
    id: 'dbg-falsy-zero',
    title: 'A Armadilha do Zero Falsy',
    category: 'Tipos & Coerção',
    difficulty: 'Intermediário',
    xpReward: 115,
    symptom: 'A função `aplicarTaxa(valor, taxa)` deveria usar taxa padrão `10` apenas quando `taxa` for `undefined` ou `null`, mas quando o cliente tem isenção (`taxa = 0`), ela cobra 10% mesmo assim!',
    academicConcept: 'Operador Nullish Coalescing (??) vs OR lógico (||)',
    functionName: 'aplicarTaxa',
    buggyCode: `function aplicarTaxa(valor, taxa) {
  const taxaFinal = taxa || 10;
  return Number((valor * (1 + taxaFinal / 100)).toFixed(2));
}`,
    testCases: [
      { id: 'd1', label: 'Taxa informada (20%)', input: [100, 20], expected: 120 },
      { id: 'd2', label: 'Taxa omitida (usa padrão 10%)', input: [100, undefined], expected: 110 },
      { id: 'd3', label: 'Caso extremo: isenção (taxa 0%)', input: [100, 0], expected: 100, isEdgeCase: true },
      { id: 'd4', label: 'Taxa null (usa padrão 10%)', input: [50, null], expected: 55, isEdgeCase: true },
    ],
  },
  {
    id: 'dbg-recursion-base',
    title: 'Estouro de Pilha no Fatorial',
    category: 'Recursão',
    difficulty: 'Universitário',
    xpReward: 140,
    symptom: 'A função `fatorial(n)` entra em recursão infinita para `n = 0` e para números negativos! Ela deve retornar `1` para `0` e `null` para números negativos ou não inteiros.',
    academicConcept: 'Caso base completo e validação de domínio em recursão',
    functionName: 'fatorial',
    buggyCode: `function fatorial(n) {
  if (n === 1) return 1;
  return n * fatorial(n - 1);
}`,
    testCases: [
      { id: 'd1', label: 'Fatorial de 5', input: [5], expected: 120 },
      { id: 'd2', label: 'Caso extremo: fatorial de 0', input: [0], expected: 1, isEdgeCase: true },
      { id: 'd3', label: 'Caso extremo: negativo', input: [-3], expected: null, isEdgeCase: true },
      { id: 'd4', label: 'Caso extremo: decimal', input: [2.5], expected: null, isEdgeCase: true },
    ],
  },
  {
    id: 'dbg-palindrome-clean',
    title: 'Palíndromo Sensível Demais',
    category: 'Strings & Normalização',
    difficulty: 'Intermediário',
    xpReward: 125,
    symptom: 'A função `ehPalindromo(texto)` falha quando há letras maiúsculas ou espaços (como `"Ame a ema"`). Normalize minúsculas e ignore espaços antes de comparar.',
    academicConcept: 'Normalização de entrada e ponteiros duplos (Two Pointers)',
    functionName: 'ehPalindromo',
    buggyCode: `function ehPalindromo(texto) {
  const invertido = texto.split('').reverse().join('');
  return texto === invertido;
}`,
    testCases: [
      { id: 'd1', label: 'Palavra simples', input: ['radar'], expected: true },
      { id: 'd2', label: 'Frase com maiúsculas e espaços', input: ['Ame a ema'], expected: true, isEdgeCase: true },
      { id: 'd3', label: 'Não palíndromo', input: ['CodeForge'], expected: false },
      { id: 'd4', label: 'String vazia', input: [''], expected: true, isEdgeCase: true },
    ],
  },
];
