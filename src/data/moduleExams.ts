import { ModuleExam } from '../types';

export const MODULE_EXAMS: ModuleExam[] = [
  {
    moduleId: 'mod-1',
    moduleNumber: '01',
    moduleTitle: 'Fundamentos da Computação & Variáveis',
    universityTag: 'Prova Prática · Módulo 01',
    title: 'Conversor de Energia & Saturação Segura',
    summary: 'Teste domínio de variáveis, aritmética inteira/decimal e proteção de limites sem ajuda.',
    xpReward: 180,
    prompt:
      'Implemente `calcularBateriaRestante(cargaInicial, consumoPorHora, horas)` que calcula quanto resta de bateria (em %) após `horas` de uso.\n- Se `horas <= 0` ou `consumoPorHora <= 0`, nenhum consumo ocorre.\n- A carga resultante deve ser arredondada para o inteiro mais próximo e mantida estritamente no intervalo [0, 100] (nunca menor que 0, nunca maior que 100).',
    functionName: 'calcularBateriaRestante',
    edgeCasesToWatch: [
      'Consumo maior que a carga inicial deve retornar 0, nunca negativo.',
      'Horas zero ou negativas devem preservar a carga inicial (limitada entre 0 e 100).',
      'Carga inicial acima de 100 deve ser saturada em 100.',
    ],
    starterCodeByLanguage: {
      javascript: `function calcularBateriaRestante(cargaInicial, consumoPorHora, horas) {
  // Resolva sem ajuda da I.A.: calcule a carga restante no intervalo [0, 100]
  
}`,
      python: `def calcularBateriaRestante(cargaInicial, consumoPorHora, horas):
    # Resolva sem ajuda da I.A.: calcule a carga restante inteira no intervalo [0, 100]
    pass`,
      java: `public class Solucao {
    public static int calcularBateriaRestante(double cargaInicial, double consumoPorHora, double horas) {
        // Resolva sem ajuda da I.A.: retorne o inteiro restante em [0, 100]
        return 0;
    }
}`,
      csharp: `public static class Solucao {
    public static int CalcularBateriaRestante(double cargaInicial, double consumoPorHora, double horas) {
        // Resolva sem ajuda da I.A.: retorne o inteiro restante em [0, 100]
        return 0;
    }
}`,
      cpp: `#include <algorithm>
#include <cmath>

int calcularBateriaRestante(double cargaInicial, double consumoPorHora, double horas) {
    // Resolva sem ajuda da I.A.: retorne o inteiro restante em [0, 100]
    return 0;
}`,
    },
    testCases: [
      { id: 'ex1-t1', label: 'Consumo padrão', input: [100, 15, 3], expected: 55 },
      { id: 'ex1-t2', label: 'Caso extremo: bateria zerada', input: [40, 25, 4], expected: 0, isEdgeCase: true },
      { id: 'ex1-t3', label: 'Caso extremo: horas negativas', input: [80, 10, -2], expected: 80, isEdgeCase: true },
      { id: 'ex1-t4', label: 'Caso extremo: carga inicial > 100', input: [130, 0, 5], expected: 100, isEdgeCase: true },
      { id: 'ex1-t5', label: 'Arredondamento decimal', input: [90, 7.5, 3], expected: 68 },
    ],
  },
  {
    moduleId: 'mod-2',
    moduleNumber: '02',
    moduleTitle: 'Lógica Booleana & Estruturas Condicionais',
    universityTag: 'Prova Prática · Módulo 02',
    title: 'Classificador de Tarifa Universitária',
    summary: 'Valide cláusulas de guarda, precedência lógica e fronteiras exatas.',
    xpReward: 200,
    prompt:
      'Implemente `calcularTarifa(idade, estudante)` que retorna o preço do ingresso:\n1. Se `idade < 0` ou `idade > 130`, retorne `-1` (idade inválida).\n2. Se `idade < 6` ou `idade >= 65`, retorne `0` (gratuito).\n3. Se `estudante === true` ou `idade <= 17`, retorne `15` (meia-entrada).\n4. Caso contrário, retorne `30` (inteira).',
    functionName: 'calcularTarifa',
    edgeCasesToWatch: [
      'Idade 65 deve ser gratuita (0), mesmo se estudante for true.',
      'Idade 5 é gratuita (0); idade 6 paga 15 (pois <= 17).',
      'Idade negativa ou > 130 deve retornar -1.',
    ],
    starterCodeByLanguage: {
      javascript: `function calcularTarifa(idade, estudante) {
  // Use cláusulas de guarda na ordem correta de prioridade
  
}`,
      python: `def calcularTarifa(idade, estudante):
    # Use cláusulas de guarda na ordem correta de prioridade
    pass`,
      java: `public class Solucao {
    public static int calcularTarifa(int idade, boolean estudante) {
        // Use cláusulas de guarda na ordem correta de prioridade
        return 0;
    }
}`,
      csharp: `public static class Solucao {
    public static int CalcularTarifa(int idade, bool estudante) {
        // Use cláusulas de guarda na ordem correta de prioridade
        return 0;
    }
}`,
      cpp: `int calcularTarifa(int idade, bool estudante) {
    // Use cláusulas de guarda na ordem correta de prioridade
    return 0;
}`,
    },
    testCases: [
      { id: 'ex2-t1', label: 'Adulto não estudante', input: [28, false], expected: 30 },
      { id: 'ex2-t2', label: 'Estudante universitário', input: [21, true], expected: 15 },
      { id: 'ex2-t3', label: 'Caso extremo: idoso 65 anos estudante', input: [65, true], expected: 0, isEdgeCase: true },
      { id: 'ex2-t4', label: 'Caso extremo: fronteira 6 anos', input: [6, false], expected: 15, isEdgeCase: true },
      { id: 'ex2-t5', label: 'Caso extremo: idade negativa', input: [-1, true], expected: -1, isEdgeCase: true },
    ],
  },
  {
    moduleId: 'mod-3',
    moduleNumber: '03',
    moduleTitle: 'Laços de Repetição & Invariantes',
    universityTag: 'Prova Prática · Módulo 03',
    title: 'Simulador de Escalada com Recuo',
    summary: 'Garanta invariante de laço e terminação sem risco de loop infinito.',
    xpReward: 220,
    prompt:
      'Um robô precisa subir um muro de altura `alturaMuro` metros. A cada dia ele sobe `sobeDia` metros; se atingir ou ultrapassar `alturaMuro`, ele vence naquele mesmo dia e NÃO escorrega. Caso contrário, durante a noite ele escorrega `escorregaNoite` metros.\nImplemente `diasParaSubir(alturaMuro, sobeDia, escorregaNoite)`:\n- Se `alturaMuro <= 0`, retorne `0`.\n- Se for impossível chegar ao topo (ex: `sobeDia <= 0`, ou não alcança no 1º dia e `sobeDia <= escorregaNoite`), retorne `-1`.',
    functionName: 'diasParaSubir',
    edgeCasesToWatch: [
      'Se sobeDia >= alturaMuro, termina em 1 dia mesmo que escorregaNoite seja maior.',
      'Se sobeDia <= escorregaNoite e não vencer no 1º dia, retorne -1.',
      'Altura <= 0 retorna 0.',
    ],
    starterCodeByLanguage: {
      javascript: `function diasParaSubir(alturaMuro, sobeDia, escorregaNoite) {
  // Trate casos impossíveis antes do laço para garantir terminação
  
}`,
      python: `def diasParaSubir(alturaMuro, sobeDia, escorregaNoite):
    # Trate casos impossíveis antes do laço para garantir terminação
    pass`,
      java: `public class Solucao {
    public static int diasParaSubir(int alturaMuro, int sobeDia, int escorregaNoite) {
        // Trate casos impossíveis antes do laço para garantir terminação
        return 0;
    }
}`,
      csharp: `public static class Solucao {
    public static int DiasParaSubir(int alturaMuro, int sobeDia, int escorregaNoite) {
        // Trate casos impossíveis antes do laço para garantir terminação
        return 0;
    }
}`,
      cpp: `int diasParaSubir(int alturaMuro, int sobeDia, int escorregaNoite) {
    // Trate casos impossíveis antes do laço para garantir terminação
    return 0;
}`,
    },
    testCases: [
      { id: 'ex3-t1', label: 'Subida padrão', input: [10, 4, 2], expected: 4 },
      { id: 'ex3-t2', label: 'Caso extremo: alcança no 1º dia', input: [5, 6, 10], expected: 1, isEdgeCase: true },
      { id: 'ex3-t3', label: 'Caso extremo: impossível (sem progresso líquido)', input: [12, 3, 3], expected: -1, isEdgeCase: true },
      { id: 'ex3-t4', label: 'Caso extremo: altura zero', input: [0, 3, 1], expected: 0, isEdgeCase: true },
      { id: 'ex3-t5', label: 'Último salto exato', input: [7, 3, 1], expected: 3 },
    ],
  },
  {
    moduleId: 'mod-4',
    moduleNumber: '04',
    moduleTitle: 'Funções, Escopo & Modularização',
    universityTag: 'Prova Prática · Módulo 04',
    title: 'Filtragem Pura e Ranking de Pontuações',
    summary: 'Escreva uma função pura sem mutar a lista original de entrada.',
    xpReward: 240,
    prompt:
      'Implemente `topPontuacoes(pontos, limite)` que recebe uma lista de números `pontos` e um inteiro `limite`.\n- Considere apenas pontuações válidas (`>= 0`).\n- Retorne uma NOVA lista contendo até `limite` maiores pontuações em ordem DECRESCENTE, sem alterar o array original.\n- Se `pontos` for vazio ou `limite <= 0`, retorne `[]`.',
    functionName: 'topPontuacoes',
    edgeCasesToWatch: [
      'Limite maior que a quantidade de elementos válidos retorna todos os válidos ordenados.',
      'Pontuações negativas devem ser ignoradas (0 é válido).',
      'Limite <= 0 ou lista vazia retorna [].',
    ],
    starterCodeByLanguage: {
      javascript: `function topPontuacoes(pontos, limite) {
  // Função pura: não modifique o array 'pontos' original
  
}`,
      python: `def topPontuacoes(pontos, limite):
    # Função pura: não modifique a lista 'pontos' original
    pass`,
      java: `import java.util.*;

public class Solucao {
    public static List<Integer> topPontuacoes(List<Integer> pontos, int limite) {
        // Função pura: não modifique a lista 'pontos' original
        return new ArrayList<>();
    }
}`,
      csharp: `using System.Collections.Generic;
using System.Linq;

public static class Solucao {
    public static List<int> TopPontuacoes(List<int> pontos, int limite) {
        // Função pura: não modifique a lista 'pontos' original
        return new List<int>();
    }
}`,
      cpp: `#include <algorithm>
#include <vector>

std::vector<int> topPontuacoes(const std::vector<int>& pontos, int limite) {
    // Função pura: retorne até 'limite' maiores valores >= 0 em ordem decrescente
    return {};
}`,
    },
    testCases: [
      { id: 'ex4-t1', label: 'Top 3 padrão', input: [[12, 45, 7, 89, 45], 3], expected: [89, 45, 45] },
      { id: 'ex4-t2', label: 'Ignora negativos e inclui zero', input: [[-5, 0, -2, 10], 5], expected: [10, 0], isEdgeCase: true },
      { id: 'ex4-t3', label: 'Caso extremo: limite zero', input: [[10, 20], 0], expected: [], isEdgeCase: true },
      { id: 'ex4-t4', label: 'Caso extremo: lista vazia', input: [[], 3], expected: [], isEdgeCase: true },
    ],
  },
  {
    moduleId: 'mod-5',
    moduleNumber: '05',
    moduleTitle: 'Estruturas de Dados: Mapas, Conjuntos & Busca',
    universityTag: 'Prova Prática · Módulo 05',
    title: 'Par de Soma Alvo em O(n) (Two Sum)',
    summary: 'Resolva o clássico problema universitário de Tabela Hash em tempo linear.',
    xpReward: 260,
    prompt:
      'Implemente `existeParComSoma(numeros, alvo)` que retorna `true` se existirem DOIS elementos em índices DIFERENTES cuja soma seja exatamente `alvo`, e `false` caso contrário.\nResolva usando um conjunto (`Set` / `HashSet`) ou mapa em tempo linear O(n).',
    functionName: 'existeParComSoma',
    edgeCasesToWatch: [
      'Não pode usar o mesmo elemento duas vezes (ex: [5] com alvo 10 -> false).',
      'Dois elementos iguais em índices diferentes (ex: [5, 5] com alvo 10 -> true).',
      'Lista vazia ou com 1 elemento sempre retorna false.',
    ],
    starterCodeByLanguage: {
      javascript: `function existeParComSoma(numeros, alvo) {
  // Use um Set para resolver em O(n) verificando o complemento (alvo - num)
  
}`,
      python: `def existeParComSoma(numeros, alvo):
    # Use um set() para resolver em O(n) verificando o complemento (alvo - num)
    pass`,
      java: `import java.util.*;

public class Solucao {
    public static boolean existeParComSoma(int[] numeros, int alvo) {
        // Use um HashSet para resolver em O(n)
        return false;
    }
}`,
      csharp: `using System.Collections.Generic;

public static class Solucao {
    public static bool ExisteParComSoma(int[] numeros, int alvo) {
        // Use um HashSet<int> para resolver em O(n)
        return false;
    }
}`,
      cpp: `#include <unordered_set>
#include <vector>

bool existeParComSoma(const std::vector<int>& numeros, int alvo) {
    // Use std::unordered_set<int> para resolver em O(n)
    return false;
}`,
    },
    testCases: [
      { id: 'ex5-t1', label: 'Par existente padrão', input: [[2, 7, 11, 15], 9], expected: true },
      { id: 'ex5-t2', label: 'Caso extremo: não reutiliza o mesmo índice', input: [[5, 1, 2], 10], expected: false, isEdgeCase: true },
      { id: 'ex5-t3', label: 'Caso extremo: valores duplicados válidos', input: [[5, 3, 5], 10], expected: true, isEdgeCase: true },
      { id: 'ex5-t4', label: 'Números negativos', input: [[-4, 1, 7, -3], 4], expected: true },
      { id: 'ex5-t5', label: 'Caso extremo: lista vazia', input: [[], 0], expected: false, isEdgeCase: true },
    ],
  },
  {
    moduleId: 'mod-6',
    moduleNumber: '06',
    moduleTitle: 'Algoritmos Intermediários & Nível Universitário',
    universityTag: 'Prova Prática · Módulo 06',
    title: 'Profundidade Máxima de Parênteses',
    summary: 'Combine validação de pilha com rastreamento de profundidade de aninhamento.',
    xpReward: 300,
    prompt:
      'Implemente `profundidadeMaxima(expressao)` que recebe uma string contendo parênteses `(` e `)` (além de outros caracteres que devem ser ignorados) e retorna a profundidade máxima de aninhamento válida.\n- Se os parênteses estiverem desbalanceados (fechou sem abrir ou sobrou aberto no final), retorne `-1`.\n- Se não houver parênteses (ex: `""` ou `"a+b"`), retorne `0`.',
    functionName: 'profundidadeMaxima',
    edgeCasesToWatch: [
      'Expressão inválida como ")(" ou "(()" deve retornar -1.',
      'Expressão sem parênteses retorna 0.',
      '"(a+(b*(c)))" tem profundidade máxima 3.',
    ],
    starterCodeByLanguage: {
      javascript: `function profundidadeMaxima(expressao) {
  // Rastreie profundidade atual e máxima; retorne -1 se desbalanceado
  
}`,
      python: `def profundidadeMaxima(expressao):
    # Rastreie profundidade atual e máxima; retorne -1 se desbalanceado
    pass`,
      java: `public class Solucao {
    public static int profundidadeMaxima(String expressao) {
        // Rastreie profundidade atual e máxima; retorne -1 se desbalanceado
        return 0;
    }
}`,
      csharp: `public static class Solucao {
    public static int ProfundidadeMaxima(string expressao) {
        // Rastreie profundidade atual e máxima; retorne -1 se desbalanceado
        return 0;
    }
}`,
      cpp: `#include <string>

int profundidadeMaxima(const std::string& expressao) {
    // Rastreie profundidade atual e máxima; retorne -1 se desbalanceado
    return 0;
}`,
    },
    testCases: [
      { id: 'ex6-t1', label: 'Aninhamento triplo', input: ['(a+(b*(c)))'], expected: 3 },
      { id: 'ex6-t2', label: 'Grupos paralelos', input: ['(1+2) + ((3*4))'], expected: 2 },
      { id: 'ex6-t3', label: 'Caso extremo: sem parênteses', input: ['42 + x'], expected: 0, isEdgeCase: true },
      { id: 'ex6-t4', label: 'Caso extremo: fechamento sem abertura', input: [')('], expected: -1, isEdgeCase: true },
      { id: 'ex6-t5', label: 'Caso extremo: abertura não fechada', input: ['((a+b)'], expected: -1, isEdgeCase: true },
    ],
  },
];

export function getExamByModuleId(moduleId: string): ModuleExam | undefined {
  return MODULE_EXAMS.find((exam) => exam.moduleId === moduleId);
}
