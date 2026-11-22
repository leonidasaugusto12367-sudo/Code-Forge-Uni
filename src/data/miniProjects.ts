import { MiniProjectDefinition, ProgrammingLanguage } from '../types';

export const BUILTIN_MINI_PROJECTS: MiniProjectDefinition[] = [
  {
    id: 'proj-robo',
    title: 'Controlador de Robô por Comandos',
    tagline: 'Robótica & Simulação 2D · 3 etapas guiadas',
    summary:
      'Construa o núcleo de navegação de um robô autônomo em grade 2D: sanitização de comandos, movimentação segura dentro dos limites da arena e telemetria de distância até a base.',
    xpReward: 260,
    blueprint: {
      entrada: 'String de comandos direcionais ("N", "S", "L", "O") e tamanho máximo da arena quadrada.',
      regras:
        'Ignorar comandos inválidos (case-insensitive), atualizar coordenadas (x, y) a partir de (0, 0) sem ultrapassar [0, limite] e calcular a distância Manhattan até a base.',
      saida: 'Comandos filtrados, posição final [x, y] garantida dentro da arena e distância total de retorno.',
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Sanitizador de Comandos',
        objective: 'Filtrar e normalizar apenas os comandos direcionais aceitos pelo robô.',
        prompt:
          'Etapa 1/3 — Implemente `filtrarComandosRobo(sequencia)` que recebe uma string e retorna uma NOVA string em MAIÚSCULAS contendo apenas os caracteres válidos: `"N"`, `"S"`, `"L"` ou `"O"` (ignorando espaços, números e letras inválidas).',
        functionName: 'filtrarComandosRobo',
        starterCodeByLanguage: {
          javascript: `function filtrarComandosRobo(sequencia) {
  // Converta para maiúsculas e mantenha apenas N, S, L e O
  
}`,
          python: `def filtrarComandosRobo(sequencia):
    # Converta para maiúsculas e mantenha apenas N, S, L e O
    pass`,
          java: `public class Solucao {
    public static String filtrarComandosRobo(String sequencia) {
        // Mantenha apenas N, S, L e O em maiúsculas
        return "";
    }
}`,
          csharp: `public static class Solucao {
    public static string FiltrarComandosRobo(string sequencia) {
        // Mantenha apenas N, S, L e O em maiúsculas
        return "";
    }
}`,
          cpp: `#include <string>

std::string filtrarComandosRobo(const std::string& sequencia) {
    // Mantenha apenas N, S, L e O em maiúsculas
    return "";
}`,
        },
        testCases: [
          { id: 'r1-t1', label: 'Sequência mista com minúsculas e ruído', input: ['nL2xSo!'], expected: 'NLSO' },
          { id: 'r1-t2', label: 'Apenas comandos válidos', input: ['NNLL'], expected: 'NNLL' },
          { id: 'r1-t3', label: 'Caso extremo: sem comandos válidos', input: ['123 XYZ'], expected: '', isEdgeCase: true },
          { id: 'r1-t4', label: 'Caso extremo: string vazia', input: [''], expected: '', isEdgeCase: true },
        ],
      },
      {
        stepNumber: 2,
        title: 'Motor de Posição na Arena',
        objective: 'Simular o deslocamento respeitando as paredes da arena [0, limite].',
        prompt:
          'Etapa 2/3 — Implemente `moverRobo(sequencia, limite)` iniciando em `[0, 0]`. Para cada comando válido (case-insensitive): `"N"` soma +1 em `y`, `"S"` subtrai 1 em `y`, `"L"` soma +1 em `x`, `"O"` subtrai 1 em `x`. Mantenha `x` e `y` sempre entre `0` e `limite` (se `limite < 0`, trate como `0`). Retorne `[x, y]`.',
        functionName: 'moverRobo',
        starterCodeByLanguage: {
          javascript: `function moverRobo(sequencia, limite) {
  // Parta de [0, 0], aplique N/S/L/O e trave cada passo em [0, Math.max(0, limite)]
  
}`,
          python: `def moverRobo(sequencia, limite):
    # Parta de [0, 0], aplique N/S/L/O e trave cada passo em [0, max(0, limite)]
    pass`,
          java: `public class Solucao {
    public static int[] moverRobo(String sequencia, int limite) {
        // Parta de [0, 0] e retorne new int[]{x, y} dentro de [0, max(0, limite)]
        return new int[]{0, 0};
    }
}`,
          csharp: `public static class Solucao {
    public static int[] MoverRobo(string sequencia, int limite) {
        // Parta de [0, 0] e retorne new int[] { x, y } dentro de [0, Math.Max(0, limite)]
        return new int[] { 0, 0 };
    }
}`,
          cpp: `#include <algorithm>
#include <string>
#include <vector>

std::vector<int> moverRobo(const std::string& sequencia, int limite) {
    // Parta de {0, 0} e retorne {x, y} dentro de [0, max(0, limite)]
    return {0, 0};
}`,
        },
        testCases: [
          { id: 'r2-t1', label: 'Deslocamento normal', input: ['NNLLL', 5], expected: [3, 2] },
          { id: 'r2-t2', label: 'Caso extremo: bate nas paredes (0 e limite)', input: ['OOOONNNNN', 3], expected: [0, 3], isEdgeCase: true },
          { id: 'r2-t3', label: 'Ignora ruído e minúsculas', input: ['l2n?s', 4], expected: [1, 0] },
          { id: 'r2-t4', label: 'Caso extremo: arena limite 0', input: ['NNLL', 0], expected: [0, 0], isEdgeCase: true },
        ],
      },
      {
        stepNumber: 3,
        title: 'Telemetria de Retorno à Base',
        objective: 'Consolidar a navegação calculando quantos passos faltam para voltar à origem.',
        prompt:
          'Etapa 3/3 — Implemente `distanciaAteBase(sequencia, limite)` que executa os mesmos movimentos de `moverRobo(sequencia, limite)` respeitando as paredes `[0, max(0, limite)]` e retorna a distância Manhattan (`Math.abs(x) + Math.abs(y)`) da posição final até a base `(0, 0)`.',
        functionName: 'distanciaAteBase',
        starterCodeByLanguage: {
          javascript: `function distanciaAteBase(sequencia, limite) {
  // Simule o percurso do robô respeitando [0, limite] e retorne |x| + |y|
  
}`,
          python: `def distanciaAteBase(sequencia, limite):
    # Simule o percurso do robô respeitando [0, limite] e retorne abs(x) + abs(y)
    pass`,
          java: `public class Solucao {
    public static int distanciaAteBase(String sequencia, int limite) {
        // Simule o percurso respeitando [0, limite] e retorne Math.abs(x) + Math.abs(y)
        return 0;
    }
}`,
          csharp: `public static class Solucao {
    public static int DistanciaAteBase(string sequencia, int limite) {
        // Simule o percurso respeitando [0, limite] e retorne Math.Abs(x) + Math.Abs(y)
        return 0;
    }
}`,
          cpp: `#include <algorithm>
#include <cmath>
#include <string>

int distanciaAteBase(const std::string& sequencia, int limite) {
    // Simule o percurso respeitando [0, limite] e retorne abs(x) + abs(y)
    return 0;
}`,
        },
        testCases: [
          { id: 'r3-t1', label: 'Distância após trajeto normal', input: ['NNLLL', 5], expected: 5 },
          { id: 'r3-t2', label: 'Retorno exato à origem', input: ['NNSSLO', 5], expected: 0, isEdgeCase: true },
          { id: 'r3-t3', label: 'Limitado pelas bordas da arena', input: ['NNNNLLLL', 2], expected: 4, isEdgeCase: true },
          { id: 'r3-t4', label: 'Sem comandos válidos', input: ['...', 5], expected: 0, isEdgeCase: true },
        ],
      },
    ],
  },
  {
    id: 'proj-rpg',
    title: 'Sistema de Inventário de RPG',
    tagline: 'Jogos Digitais & Coleções · 3 etapas guiadas',
    summary:
      'Desenvolva o motor de mochila de um RPG: cálculo de carga segura, filtragem por raridade e verificação de capacidade restante para loot.',
    xpReward: 270,
    blueprint: {
      entrada: 'Lista de itens `{ nome, peso, quantidade, raridade }` e capacidade máxima da mochila.',
      regras:
        'Ignorar itens com peso ou quantidade <= 0, filtrar raridades sem diferenciar maiúsculas/minúsculas e impedir capacidade livre negativa.',
      saida: 'Peso total atual, lista de itens filtrados por raridade e espaço livre disponível na mochila.',
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Calculadora de Peso da Mochila',
        objective: 'Somar com segurança o peso total de todos os itens válidos carregados.',
        prompt:
          'Etapa 1/3 — Implemente `pesoTotalMochila(itens)` onde cada item é `{ nome, peso, quantidade }`. Ignore itens com `peso <= 0` ou `quantidade <= 0`. Retorne a soma total de `peso * quantidade` arredondada em 2 casas decimais (`0` se vazio).',
        functionName: 'pesoTotalMochila',
        starterCodeByLanguage: {
          javascript: `function pesoTotalMochila(itens) {
  // Some peso * quantidade apenas para itens com peso > 0 e quantidade > 0
  
}`,
          python: `def pesoTotalMochila(itens):
    # Cada item é um dict {"nome", "peso", "quantidade"}; ignore valores <= 0
    pass`,
          java: `import java.util.*;

public class Solucao {
    public static double pesoTotalMochila(List<Map<String, Object>> itens) {
        // Some peso * quantidade apenas para itens válidos (arredondado em 2 casas)
        return 0.0;
    }
}`,
          csharp: `using System.Collections.Generic;

public class ItemRpg {
    public string nome { get; set; } = "";
    public double peso { get; set; }
    public int quantidade { get; set; }
}

public static class Solucao {
    public static double PesoTotalMochila(List<ItemRpg> itens) {
        // Some peso * quantidade apenas para itens válidos
        return 0.0;
    }
}`,
          cpp: `#include <cmath>
#include <string>
#include <vector>

struct ItemRpg {
    std::string nome;
    double peso;
    int quantidade;
};

double pesoTotalMochila(const std::vector<ItemRpg>& itens) {
    // Some peso * quantidade apenas para itens com peso > 0 e quantidade > 0
    return 0.0;
}`,
        },
        testCases: [
          {
            id: 'rpg1-t1',
            label: 'Mochila padrão',
            input: [[{ nome: 'Espada', peso: 4.5, quantidade: 1 }, { nome: 'Poção', peso: 0.5, quantidade: 4 }]],
            expected: 6.5,
          },
          {
            id: 'rpg1-t2',
            label: 'Ignora itens corrompidos/zero',
            input: [[{ nome: 'Bug', peso: -2, quantidade: 3 }, { nome: 'Flecha', peso: 0.2, quantidade: 0 }, { nome: 'Escudo', peso: 6, quantidade: 1 }]],
            expected: 6,
            isEdgeCase: true,
          },
          { id: 'rpg1-t3', label: 'Caso extremo: mochila vazia', input: [[]], expected: 0, isEdgeCase: true },
        ],
      },
      {
        stepNumber: 2,
        title: 'Filtro de Loot por Raridade',
        objective: 'Listar rapidamente os nomes dos itens de uma raridade específica.',
        prompt:
          'Etapa 2/3 — Implemente `filtrarPorRaridade(itens, raridadeAlvo)` onde cada item possui `{ nome, raridade, quantidade }`. Retorne um array com o `nome` dos itens cuja `raridade` coincida com `raridadeAlvo` (ignorando maiúsculas/minúsculas) e tenham `quantidade > 0`.',
        functionName: 'filtrarPorRaridade',
        starterCodeByLanguage: {
          javascript: `function filtrarPorRaridade(itens, raridadeAlvo) {
  // Retorne um array de nomes cujo item tem quantidade > 0 e raridade compatível
  
}`,
          python: `def filtrarPorRaridade(itens, raridadeAlvo):
    # Retorne lista de nomes com quantidade > 0 e raridade compatível (case-insensitive)
    pass`,
          java: `import java.util.*;

public class Solucao {
    public static List<String> filtrarPorRaridade(List<Map<String, Object>> itens, String raridadeAlvo) {
        // Retorne os nomes dos itens com quantidade > 0 e raridade igual (ignore case)
        return new ArrayList<>();
    }
}`,
          csharp: `using System.Collections.Generic;

public class ItemLoot {
    public string nome { get; set; } = "";
    public string raridade { get; set; } = "";
    public int quantidade { get; set; }
}

public static class Solucao {
    public static List<string> FiltrarPorRaridade(List<ItemLoot> itens, string raridadeAlvo) {
        // Retorne os nomes dos itens com quantidade > 0 e raridade compatível
        return new List<string>();
    }
}`,
          cpp: `#include <string>
#include <vector>

struct ItemLoot {
    std::string nome;
    std::string raridade;
    int quantidade;
};

std::vector<std::string> filtrarPorRaridade(const std::vector<ItemLoot>& itens, const std::string& raridadeAlvo) {
    // Retorne os nomes com quantidade > 0 e raridade compatível (ignore case)
    return {};
}`,
        },
        testCases: [
          {
            id: 'rpg2-t1',
            label: 'Filtra épicos ignorando maiúsculas',
            input: [
              [
                { nome: 'Cajado Solar', raridade: 'Epico', quantidade: 1 },
                { nome: 'Adaga', raridade: 'Comum', quantidade: 2 },
                { nome: 'Elmo Dragão', raridade: 'EPICO', quantidade: 1 },
              ],
              'epico',
            ],
            expected: ['Cajado Solar', 'Elmo Dragão'],
          },
          {
            id: 'rpg2-t2',
            label: 'Ignora itens com quantidade 0',
            input: [[{ nome: 'Anel Lendário', raridade: 'Lendario', quantidade: 0 }], 'lendario'],
            expected: [],
            isEdgeCase: true,
          },
          { id: 'rpg2-t3', label: 'Lista vazia', input: [[], 'comum'], expected: [], isEdgeCase: true },
        ],
      },
      {
        stepNumber: 3,
        title: 'Validador de Espaço Livre',
        objective: 'Verificar quanto de capacidade resta na mochila antes de coletar novo loot.',
        prompt:
          'Etapa 3/3 — Implemente `espacoRestanteMochila(itens, capacidadeMaxima)` onde cada item tem `{ peso, quantidade }`. Calcule o peso válido total (ignorando `peso <= 0` ou `quantidade <= 0`) e retorne `capacidadeMaxima - pesoTotal`, arredondado em 2 casas decimais e nunca menor que `0`.',
        functionName: 'espacoRestanteMochila',
        starterCodeByLanguage: {
          javascript: `function espacoRestanteMochila(itens, capacidadeMaxima) {
  // Calcule capacidadeMaxima - pesoValidoTotal, retornando no mínimo 0
  
}`,
          python: `def espacoRestanteMochila(itens, capacidadeMaxima):
    # Calcule capacidadeMaxima - peso válido total, retornando no mínimo 0
    pass`,
          java: `import java.util.*;

public class Solucao {
    public static double espacoRestanteMochila(List<Map<String, Object>> itens, double capacidadeMaxima) {
        // Retorne max(0, capacidadeMaxima - pesoTotal) arredondado em 2 casas
        return 0.0;
    }
}`,
          csharp: `using System.Collections.Generic;

public class ItemCarga {
    public double peso { get; set; }
    public int quantidade { get; set; }
}

public static class Solucao {
    public static double EspacoRestanteMochila(List<ItemCarga> itens, double capacidadeMaxima) {
        // Retorne max(0, capacidadeMaxima - pesoTotal) arredondado em 2 casas
        return 0.0;
    }
}`,
          cpp: `#include <algorithm>
#include <cmath>
#include <vector>

struct ItemCarga {
    double peso;
    int quantidade;
};

double espacoRestanteMochila(const std::vector<ItemCarga>& itens, double capacidadeMaxima) {
    // Retorne max(0.0, capacidadeMaxima - pesoTotal) arredondado em 2 casas
    return 0.0;
}`,
        },
        testCases: [
          {
            id: 'rpg3-t1',
            label: 'Espaço disponível normal',
            input: [[{ peso: 4.5, quantidade: 2 }, { peso: 1, quantidade: 3 }], 20],
            expected: 8,
          },
          {
            id: 'rpg3-t2',
            label: 'Caso extremo: sobrecarga trava em 0',
            input: [[{ peso: 15, quantidade: 2 }], 20],
            expected: 0,
            isEdgeCase: true,
          },
          {
            id: 'rpg3-t3',
            label: 'Caso extremo: capacidade negativa',
            input: [[], -10],
            expected: 0,
            isEdgeCase: true,
          },
        ],
      },
    ],
  },
  {
    id: 'proj-notas',
    title: 'Gerenciador de Notas Universitárias',
    tagline: 'Sistemas Acadêmicos · 3 etapas guiadas',
    summary:
      'Crie o motor de boletim acadêmico usado em faculdades: média ponderada segura, conversão para conceitos A–F e contabilização de aprovados da turma.',
    xpReward: 260,
    blueprint: {
      entrada: 'Lista de avaliações `{ nota, peso }` e médias finais de alunos.',
      regras:
        'Validar faixa de nota [0, 10] e peso > 0, evitar divisão por zero, mapear faixas oficiais de conceito (A/B/C/D/F) e contar aprovados (>= 6).',
      saida: 'Média ponderada precisa, conceito acadêmico final e total de estudantes aprovados.',
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Média Ponderada Segura',
        objective: 'Calcular média ponderada ignorando registros com peso inválido ou nota fora de [0, 10].',
        prompt:
          'Etapa 1/3 — Implemente `mediaPonderada(avaliacoes)` onde cada item é `{ nota, peso }`. Ignore entradas com `peso <= 0` ou `nota < 0` ou `nota > 10`. Retorne `soma(nota * peso) / soma(peso)` arredondada em 2 casas decimais (`0` se nenhuma avaliação for válida).',
        functionName: 'mediaPonderada',
        starterCodeByLanguage: {
          javascript: `function mediaPonderada(avaliacoes) {
  // Ignore pesos <= 0 e notas fora de [0, 10]; evite divisão por zero
  
}`,
          python: `def mediaPonderada(avaliacoes):
    # Ignore pesos <= 0 e notas fora de [0, 10]; retorne média arredondada em 2 casas
    pass`,
          java: `import java.util.*;

public class Solucao {
    public static double mediaPonderada(List<Map<String, Double>> avaliacoes) {
        // Ignore pesos <= 0 e notas fora de [0, 10]; evite divisão por zero
        return 0.0;
    }
}`,
          csharp: `using System.Collections.Generic;

public class Avaliacao {
    public double nota { get; set; }
    public double peso { get; set; }
}

public static class Solucao {
    public static double MediaPonderada(List<Avaliacao> avaliacoes) {
        // Ignore pesos <= 0 e notas fora de [0, 10]; retorne com 2 casas decimais
        return 0.0;
    }
}`,
          cpp: `#include <cmath>
#include <vector>

struct Avaliacao {
    double nota;
    double peso;
};

double mediaPonderada(const std::vector<Avaliacao>& avaliacoes) {
    // Ignore pesos <= 0 e notas fora de [0, 10]; retorne com 2 casas decimais
    return 0.0;
}`,
        },
        testCases: [
          {
            id: 'n1-t1',
            label: 'Provas com pesos 2 e 3',
            input: [[{ nota: 8, peso: 2 }, { nota: 9, peso: 3 }]],
            expected: 8.6,
          },
          {
            id: 'n1-t2',
            label: 'Ignora nota inválida > 10 e peso 0',
            input: [[{ nota: 12, peso: 2 }, { nota: 7, peso: 0 }, { nota: 6, peso: 1 }]],
            expected: 6,
            isEdgeCase: true,
          },
          { id: 'n1-t3', label: 'Caso extremo: lista vazia', input: [[]], expected: 0, isEdgeCase: true },
        ],
      },
      {
        stepNumber: 2,
        title: 'Conversor de Conceito (A–F)',
        objective: 'Transformar a média numérica no conceito universitário oficial.',
        prompt:
          'Etapa 2/3 — Implemente `conceitoAcademico(media)`:\n- Se `media < 0` ou `media > 10`, retorne `"INVALIDO"`.\n- `>= 9.0` -> `"A"`\n- `>= 7.5` -> `"B"`\n- `>= 6.0` -> `"C"`\n- `>= 5.0` -> `"D"`\n- Abaixo de `5.0` -> `"F"`.',
        functionName: 'conceitoAcademico',
        starterCodeByLanguage: {
          javascript: `function conceitoAcademico(media) {
  // Valide faixa [0, 10] primeiro e retorne "A", "B", "C", "D", "F" ou "INVALIDO"
  
}`,
          python: `def conceitoAcademico(media):
    # Valide faixa [0, 10] primeiro e retorne "A", "B", "C", "D", "F" ou "INVALIDO"
    pass`,
          java: `public class Solucao {
    public static String conceitoAcademico(double media) {
        // Retorne "A", "B", "C", "D", "F" ou "INVALIDO"
        return "";
    }
}`,
          csharp: `public static class Solucao {
    public static string ConceitoAcademico(double media) {
        // Retorne "A", "B", "C", "D", "F" ou "INVALIDO"
        return "";
    }
}`,
          cpp: `#include <string>

std::string conceitoAcademico(double media) {
    // Retorne "A", "B", "C", "D", "F" ou "INVALIDO"
    return "";
}`,
        },
        testCases: [
          { id: 'n2-t1', label: 'Conceito A (fronteira 9.0)', input: [9], expected: 'A', isEdgeCase: true },
          { id: 'n2-t2', label: 'Conceito B', input: [8.2], expected: 'B' },
          { id: 'n2-t3', label: 'Conceito C (fronteira 6.0)', input: [6], expected: 'C', isEdgeCase: true },
          { id: 'n2-t4', label: 'Conceito F', input: [4.9], expected: 'F' },
          { id: 'n2-t5', label: 'Caso extremo: nota > 10', input: [10.5], expected: 'INVALIDO', isEdgeCase: true },
        ],
      },
      {
        stepNumber: 3,
        title: 'Relatório de Aprovados da Turma',
        objective: 'Consolidar quantos alunos atingiram média de aprovação com validação de dados.',
        prompt:
          'Etapa 3/3 — Implemente `contarAprovados(medias)` que recebe uma lista de números e retorna quantas médias válidas (`>= 0` e `<= 10`) são maiores ou iguais a `6.0`. Ignore valores fora da faixa `[0, 10]`.',
        functionName: 'contarAprovados',
        starterCodeByLanguage: {
          javascript: `function contarAprovados(medias) {
  // Conte apenas médias no intervalo [6, 10]
  
}`,
          python: `def contarAprovados(medias):
    # Conte apenas médias no intervalo [6, 10]
    pass`,
          java: `import java.util.*;

public class Solucao {
    public static int contarAprovados(List<Double> medias) {
        // Conte apenas médias no intervalo [6.0, 10.0]
        return 0;
    }
}`,
          csharp: `using System.Collections.Generic;

public static class Solucao {
    public static int ContarAprovados(List<double> medias) {
        // Conte apenas médias no intervalo [6.0, 10.0]
        return 0;
    }
}`,
          cpp: `#include <vector>

int contarAprovados(const std::vector<double>& medias) {
    // Conte apenas médias no intervalo [6.0, 10.0]
    return 0;
}`,
        },
        testCases: [
          { id: 'n3-t1', label: 'Turma padrão', input: [[5.5, 6.0, 8.4, 9.5, 4.0]], expected: 3 },
          { id: 'n3-t2', label: 'Ignora notas corrompidas > 10 e negativas', input: [[-2, 11.5, 7.0, 10.0]], expected: 2, isEdgeCase: true },
          { id: 'n3-t3', label: 'Caso extremo: lista vazia', input: [[]], expected: 0, isEdgeCase: true },
        ],
      },
    ],
  },
];

export function getProjectStepStarterCode(
  step: MiniProjectDefinition['steps'][number],
  language: ProgrammingLanguage
): string {
  if (step.starterCodeByLanguage?.[language]) {
    return step.starterCodeByLanguage[language];
  }
  return step.starterCode ?? '';
}
