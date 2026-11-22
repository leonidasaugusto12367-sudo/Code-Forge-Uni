import { ProgrammingLanguage } from '../types';

export interface GlossaryTerm {
  id: string;
  term: string;
  category: 'Fundamentos' | 'Estruturas de Dados' | 'Complexidade' | 'Boas Práticas';
  semester: string;
  definition: string;
  whyItMatters: string;
  exampleCode: string;
  codeByLanguage: Record<ProgrammingLanguage, string>;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'big-o',
    term: 'Notação Big-O — O(1), O(log n), O(n), O(n²)',
    category: 'Complexidade',
    semester: '2º Semestre · Análise de Algoritmos',
    definition: 'Forma matemática de descrever como o tempo de execução ou uso de memória de um algoritmo cresce conforme o tamanho da entrada (n) aumenta.',
    whyItMatters: 'Permite prever se seu sistema vai responder em milissegundos ou travar quando passar de 100 para 1 milhão de usuários.',
    exampleCode: `// O(1): acesso direto por índice\nconst primeiro = lista[0];\n// O(n): percorre toda a lista\nconst soma = lista.reduce((a, b) => a + b, 0);`,
    codeByLanguage: {
      javascript: `// O(1): acesso direto por índice\nconst primeiro = lista[0];\n// O(n): percorre toda a lista\nconst soma = lista.reduce((a, b) => a + b, 0);`,
      python: `# O(1): acesso direto por índice\nprimeiro = lista[0]\n# O(n): percorre toda a lista\nsoma = sum(lista)`,
      java: `// O(1): acesso direto por índice\nint primeiro = lista[0];\n// O(n): percorre toda a lista\nint soma = 0;\nfor (int x : lista) soma += x;`,
      csharp: `// O(1): acesso direto por índice\nint primeiro = lista[0];\n// O(n): percorre toda a lista\nint soma = lista.Sum();`,
      cpp: `// O(1): acesso direto por índice\nint primeiro = lista[0];\n// O(n): percorre todo o vetor\nint soma = 0;\nfor (int x : lista) soma += x;`,
    },
  },
  {
    id: 'edge-case',
    term: 'Casos Extremos (Edge Cases)',
    category: 'Boas Práticas',
    semester: '1º Semestre · Engenharia de Software',
    definition: 'Entradas nos limites do domínio do problema: listas vazias, valor zero, números negativos, duplicatas, nulos ou tamanhos máximos.',
    whyItMatters: 'A maioria dos bugs em produção e das notas descontadas em provas universitárias acontece nos casos extremos, não no caminho feliz.',
    exampleCode: `if (!Array.isArray(lista) || lista.length === 0) {\n  return 0; // Proteção de fronteira\n}`,
    codeByLanguage: {
      javascript: `if (!Array.isArray(lista) || lista.length === 0) {\n  return 0; // Proteção de fronteira\n}`,
      python: `if not lista:\n    return 0  # Proteção contra lista vazia ou None`,
      java: `if (lista == null || lista.length == 0) {\n    return 0; // Proteção contra null e array vazio\n}`,
      csharp: `if (lista is null || lista.Length == 0) {\n    return 0; // Proteção de fronteira\n}`,
      cpp: `if (lista.empty()) {\n    return 0; // Proteção contra vetor vazio\n}`,
    },
  },
  {
    id: 'invariante',
    term: 'Invariante de Laço',
    category: 'Fundamentos',
    semester: '1º Semestre · Algoritmos I',
    definition: 'Uma propriedade lógica que permanece verdadeira antes, durante e depois de cada iteração de um laço.',
    whyItMatters: 'É a ferramenta usada na universidade para provar formalmente que um algoritmo como a Busca Binária está correto.',
    exampleCode: `// Invariante: se 'alvo' existe, está sempre dentro de [inicio, fim]\nwhile (inicio <= fim) { ... }`,
    codeByLanguage: {
      javascript: `// Invariante: se 'alvo' existe, está sempre dentro de [inicio, fim]\nwhile (inicio <= fim) {\n  const meio = Math.floor((inicio + fim) / 2);\n}`,
      python: `# Invariante: se 'alvo' existe, está sempre dentro de [inicio, fim]\nwhile inicio <= fim:\n    meio = (inicio + fim) // 2`,
      java: `// Invariante: se 'alvo' existe, está sempre dentro de [inicio, fim]\nwhile (inicio <= fim) {\n    int meio = inicio + (fim - inicio) / 2;\n}`,
      csharp: `// Invariante: se 'alvo' existe, está sempre dentro de [inicio, fim]\nwhile (inicio <= fim) {\n    int meio = inicio + (fim - inicio) / 2;\n}`,
      cpp: `// Invariante: se 'alvo' existe, está sempre dentro de [inicio, fim]\nwhile (inicio <= fim) {\n    int meio = inicio + (fim - inicio) / 2;\n}`,
    },
  },
  {
    id: 'escopo-lexico',
    term: 'Escopo Léxico (Block Scope)',
    category: 'Fundamentos',
    semester: '1º Semestre · Linguagens de Programação',
    definition: 'Regra que define onde uma variável existe e pode ser acessada, determinada pela posição física dos blocos no código-fonte.',
    whyItMatters: 'Confinar variáveis ao menor bloco possível evita colisões de nomes, vazamento de estado e efeitos colaterais.',
    exampleCode: `if (ativo) {\n  const taxa = 0.1; // Só existe dentro deste bloco\n}`,
    codeByLanguage: {
      javascript: `if (ativo) {\n  const taxa = 0.1; // Só existe dentro deste bloco\n}`,
      python: `def calcular_taxa(ativo):\n    taxa = 0.1 if ativo else 0.0  # Escopo local da função\n    return taxa`,
      java: `if (ativo) {\n    final double taxa = 0.1; // Só existe dentro deste bloco\n}`,
      csharp: `if (ativo) {\n    const double taxa = 0.1; // Só existe dentro deste bloco\n}`,
      cpp: `if (ativo) {\n    const double taxa = 0.1; // Destruída ao sair do bloco\n}`,
    },
  },
  {
    id: 'hash-table',
    term: 'Tabela Hash (Map / Dicionário)',
    category: 'Estruturas de Dados',
    semester: '2º Semestre · Estruturas de Dados I',
    definition: 'Estrutura que associa chaves a valores usando uma função hash, oferecendo busca e inserção em tempo médio constante O(1).',
    whyItMatters: 'Transforma algoritmos lentos de busca repetida O(n²) em soluções instantâneas O(n).',
    exampleCode: `const frequencia = new Map();\nfrequencia.set('espada', 3);\nfrequencia.get('espada'); // 3 em O(1)`,
    codeByLanguage: {
      javascript: `const frequencia = new Map();\nfrequencia.set('espada', 3);\nfrequencia.get('espada'); // 3 em O(1)`,
      python: `frequencia = {}\nfrequencia["espada"] = 3\nvalor = frequencia.get("espada", 0)  # 3 em O(1)`,
      java: `Map<String, Integer> frequencia = new HashMap<>();\nfrequencia.put("espada", 3);\nint qtd = frequencia.getOrDefault("espada", 0); // 3 em O(1)`,
      csharp: `var frequencia = new Dictionary<string, int>();\nfrequencia["espada"] = 3;\nint qtd = frequencia.GetValueOrDefault("espada", 0); // 3 em O(1)`,
      cpp: `std::unordered_map<std::string, int> frequencia;\nfrequencia["espada"] = 3;\nint qtd = frequencia["espada"]; // 3 em O(1) médio`,
    },
  },
  {
    id: 'pilha-lifo',
    term: 'Pilha (Stack — LIFO)',
    category: 'Estruturas de Dados',
    semester: '2º Semestre · Estruturas de Dados I',
    definition: 'Estrutura linear onde o último elemento inserido é o primeiro a sair (Last-In, First-Out).',
    whyItMatters: 'Governa a pilha de chamadas de funções (Call Stack), botões de Desfazer (Ctrl+Z) e analisadores de compiladores.',
    exampleCode: `const pilha = [];\npilha.push('abrir');\nconst topo = pilha.pop(); // 'abrir'`,
    codeByLanguage: {
      javascript: `const pilha = [];\npilha.push('abrir');\nconst topo = pilha.pop(); // 'abrir'`,
      python: `pilha = []\npilha.append("abrir")\ntopo = pilha.pop()  # "abrir"`,
      java: `Deque<String> pilha = new ArrayDeque<>();\npilha.push("abrir");\nString topo = pilha.pop(); // "abrir"`,
      csharp: `var pilha = new Stack<string>();\npilha.Push("abrir");\nstring topo = pilha.Pop(); // "abrir"`,
      cpp: `std::stack<std::string> pilha;\npilha.push("abrir");\nstd::string topo = pilha.top();\npilha.pop();`,
    },
  },
  {
    id: 'fila-fifo',
    term: 'Fila (Queue — FIFO)',
    category: 'Estruturas de Dados',
    semester: '2º Semestre · Estruturas de Dados I',
    definition: 'Estrutura linear onde o primeiro elemento a entrar é o primeiro a sair (First-In, First-Out).',
    whyItMatters: 'Essencial em busca em largura (BFS), filas de matchmaking em jogos online e processamento de requisições em servidores.',
    exampleCode: `const fila = ['req1', 'req2'];\nconst proxima = fila.shift(); // 'req1'`,
    codeByLanguage: {
      javascript: `const fila = ['req1', 'req2'];\nconst proxima = fila.shift(); // 'req1'`,
      python: `from collections import deque\nfila = deque(["req1", "req2"])\nproxima = fila.popleft()  # "req1" em O(1)`,
      java: `Queue<String> fila = new ArrayDeque<>();\nfila.offer("req1");\nString proxima = fila.poll(); // "req1" em O(1)`,
      csharp: `var fila = new Queue<string>();\nfila.Enqueue("req1");\nstring proxima = fila.Dequeue(); // "req1" em O(1)`,
      cpp: `std::queue<std::string> fila;\nfila.push("req1");\nstd::string proxima = fila.front();\nfila.pop();`,
    },
  },
  {
    id: 'recursao',
    term: 'Recursão & Caso Base',
    category: 'Fundamentos',
    semester: '2º Semestre · Algoritmos II',
    definition: 'Técnica em que uma função resolve um problema chamando a si mesma em instâncias menores até atingir um caso base trivial.',
    whyItMatters: 'Permite escrever algoritmos elegantes para árvores, pastas de arquivos, fractais e divisão e conquista.',
    exampleCode: `function contagem(n) {\n  if (n <= 0) return; // Caso base obrigatório\n  contagem(n - 1);\n}`,
    codeByLanguage: {
      javascript: `function contagem(n) {\n  if (n <= 0) return; // Caso base obrigatório\n  contagem(n - 1);\n}`,
      python: `def contagem(n):\n    if n <= 0:\n        return  # Caso base obrigatório\n    contagem(n - 1)`,
      java: `static void contagem(int n) {\n    if (n <= 0) return; // Caso base obrigatório\n    contagem(n - 1);\n}`,
      csharp: `static void Contagem(int n) {\n    if (n <= 0) return; // Caso base obrigatório\n    Contagem(n - 1);\n}`,
      cpp: `void contagem(int n) {\n    if (n <= 0) return; // Caso base obrigatório\n    contagem(n - 1);\n}`,
    },
  },
  {
    id: 'funcao-pura',
    term: 'Função Pura & Imutabilidade',
    category: 'Boas Práticas',
    semester: '2º Semestre · Engenharia de Software',
    definition: 'Função que depende exclusivamente de seus parâmetros e não altera nenhum estado externo ou argumento recebido.',
    whyItMatters: 'Facilita testes unitários, elimina efeitos colaterais misteriosos e é o pilar de arquiteturas modernas.',
    exampleCode: `// Pura: cria um novo array sem alterar 'itens'\nconst adicionar = (itens, novo) => [...itens, novo];`,
    codeByLanguage: {
      javascript: `// Pura: cria um novo array sem alterar 'itens'\nconst adicionar = (itens, novo) => [...itens, novo];`,
      python: `# Pura: cria nova lista sem modificar 'itens'\ndef adicionar(itens, novo):\n    return [*itens, novo]`,
      java: `// Pura: retorna nova lista sem alterar a original\nstatic List<String> adicionar(List<String> itens, String novo) {\n    List<String> copia = new ArrayList<>(itens);\n    copia.add(novo);\n    return copia;\n}`,
      csharp: `// Pura: retorna nova lista sem alterar 'itens'\nstatic List<string> Adicionar(IReadOnlyList<string> itens, string novo)\n    => new List<string>(itens) { novo };`,
      cpp: `// Pura: recebe por referência const e retorna nova cópia\nstd::vector<int> adicionar(const std::vector<int>& itens, int novo) {\n    auto copia = itens;\n    copia.push_back(novo);\n    return copia;\n}`,
    },
  },
  {
    id: 'clausula-guarda',
    term: 'Cláusula de Guarda (Guard Clause)',
    category: 'Boas Práticas',
    semester: '1º Semestre · Código Limpo',
    definition: 'Condicional no início da função que trata casos inválidos ou excepcionais retornando cedo, reduzindo aninhamento de `if/else`.',
    whyItMatters: 'Deixa o código plano, fácil de ler em Code Reviews e reduz drasticamente a carga cognitiva.',
    exampleCode: `function dividir(a, b) {\n  if (b === 0) return null; // Guarda\n  return a / b;\n}`,
    codeByLanguage: {
      javascript: `function dividir(a, b) {\n  if (b === 0) return null; // Guarda\n  return a / b;\n}`,
      python: `def dividir(a, b):\n    if b == 0:\n        return None  # Guarda\n    return a / b`,
      java: `static Double dividir(double a, double b) {\n    if (b == 0) return null; // Guarda\n    return a / b;\n}`,
      csharp: `static double? Dividir(double a, double b) {\n    if (b == 0) return null; // Guarda\n    return a / b;\n}`,
      cpp: `std::optional<double> dividir(double a, double b) {\n    if (b == 0.0) return std::nullopt; // Guarda\n    return a / b;\n}`,
    },
  },
  {
    id: 'busca-binaria',
    term: 'Busca Binária (Binary Search)',
    category: 'Complexidade',
    semester: '2º Semestre · Algoritmos & Estruturas',
    definition: 'Algoritmo que localiza um valor em uma lista ORDENADA dividindo o espaço de busca pela metade a cada comparação: O(log n).',
    whyItMatters: 'Em uma lista de 1.000.000 de itens, encontra qualquer elemento em no máximo 20 passos — contra até 1.000.000 da busca linear.',
    exampleCode: `const meio = Math.floor((inicio + fim) / 2);`,
    codeByLanguage: {
      javascript: `const meio = Math.floor((inicio + fim) / 2);`,
      python: `meio = (inicio + fim) // 2`,
      java: `int meio = inicio + (fim - inicio) / 2; // Evita overflow de int`,
      csharp: `int meio = inicio + (fim - inicio) / 2; // Evita overflow`,
      cpp: `int meio = inicio + (fim - inicio) / 2; // Evita overflow de int`,
    },
  },
  {
    id: 'coercao-estrita',
    term: 'Igualdade Estrita & Segurança de Tipos',
    category: 'Fundamentos',
    semester: '1º Semestre · Linguagens de Programação',
    definition: 'Comparar valor e tipo sem conversões implícitas evita que strings, booleanos e números sejam confundidos pelo runtime ou compilador.',
    whyItMatters: 'Previne bugs sutis de comparação implícita e prepara o raciocínio para linguagens fortemente tipadas da faculdade.',
    exampleCode: `0 === "0" // false (correto e previsível)\n0 == "0"  // true (evite!)`,
    codeByLanguage: {
      javascript: `0 === "0" // false (compara valor e tipo)\n0 == "0"  // true (coerção implícita — evite!)`,
      python: `0 == "0"        # False (Python não faz coerção implícita)\nint("0") == 0   # True (conversão explícita segura)`,
      java: `// Em Java, use .equals() para comparar conteúdo de Strings\n"abc".equals(texto); // Correto (nunca use == para Strings!)`,
      csharp: `// Tipagem estática impede comparar int com string sem conversão\nbool ok = int.TryParse("42", out int numero) && numero == 42;`,
      cpp: `// Em C++, evite comparações entre signed (int) e unsigned (size_t)\nbool igual = (static_cast<size_t>(indice) < lista.size());`,
    },
  },
];

export function getGlossaryExampleCode(term: GlossaryTerm, language: ProgrammingLanguage): string {
  return term.codeByLanguage[language] ?? term.exampleCode;
}
