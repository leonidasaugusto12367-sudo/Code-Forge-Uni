import { CurriculumModule, Lesson } from '../types';

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 'mod-1',
    number: '01',
    title: 'Fundamentos da Computação & Variáveis',
    subtitle: 'Memória, tipos primitivos, imutabilidade com const e operações aritméticas precisas.',
    universityEquivalent: 'Introdução à Programação (1º Semestre)',
    lessons: [
      {
        id: 'm1-l1',
        moduleId: 'mod-1',
        order: 1,
        title: 'Variáveis, Tipos e Limites Seguros',
        summary: 'Entenda como valores vivem em memória e aprenda a proteger cálculos contra limites inválidos.',
        estimatedMinutes: 8,
        xpReward: 100,
        universityTag: 'Tipos Primitivos & Saturação',
        theoryBlocks: [
          {
            heading: 'const vs let: disciplina desde a primeira linha',
            body: 'Na engenharia de software profissional, toda variável começa como `const` (valor que não muda de referência). Só usamos `let` quando há reatribuição explícita, como acumuladores ou contadores. Evite `var`, pois seu escopo de função causa bugs difíceis de rastrear.',
            codeExample: `const vidaMaxima = 100;\nlet vidaAtual = 80;\nvidaAtual = vidaAtual - 25; // 55`,
          },
          {
            heading: 'Protegendo fronteiras (Clamping)',
            body: 'Programas reais nunca confiam que uma conta ficará no intervalo seguro. Em jogos, a vida não pode cair abaixo de 0; em finanças, um desconto não pode gerar preço negativo. Usar `Math.max(0, valor)` e `Math.min(maximo, valor)` garante invariantes numéricas.',
            codeExample: `const resultadoSeguro = Math.max(0, Math.min(100, valorCalculado));`,
          },
        ],
        trackContext: {
          explorador: 'Você vai implementar um cálculo com trava de limites — técnica usada desde barras de vida em jogos até limites de crédito em sistemas bancários.',
          jogos: 'No motor do jogo, quando um personagem recebe dano maior que sua vida restante, o HP precisa travar em 0 (nunca ficar negativo) e, ao curar, não pode ultrapassar o HP máximo.',
          web: 'Em um sistema de assinatura, créditos restantes após consumo nunca podem ficar negativos nem ultrapassar o teto do plano contratado.',
          dados: 'Na pré-normalização de sensores, leituras fora da faixa física válida precisam ser saturadas (clamping) entre 0 e o limite máximo.',
          sistemas: 'Em alocadores de recursos e cotas de servidor, o saldo disponível deve respeitar estritamente o intervalo fechado [0, limiteMaximo].',
        },
        conceptQuiz: {
          question: 'Por que engenheiros de software preferem declarar variáveis com `const` por padrão em JavaScript?',
          options: [
            'Porque `const` deixa o código 10x mais rápido no processador.',
            'Porque impede reatribuições acidentais, deixando claro quais valores mudam ao longo do algoritmo.',
            'Porque `let` não funciona dentro de funções.',
          ],
          correctIndex: 1,
          explanation: 'Correto! `const` expressa intenção imutável na ligação da variável, prevenindo efeitos colaterais acidentais durante a manutenção do código.',
        },
        challenge: {
          prompt: 'Implemente a função `aplicarVariacao(valorAtual, delta, limiteMaximo)` que soma `delta` (positivo ou negativo) a `valorAtual`, garantindo que o resultado final nunca seja menor que `0` e nunca ultrapasse `limiteMaximo`.',
          functionName: 'aplicarVariacao',
          starterCode: `function aplicarVariacao(valorAtual, delta, limiteMaximo) {
  // Calcule o novo valor somando valorAtual + delta
  // Garanta que o retorno fique sempre no intervalo [0, limiteMaximo]
  
}`,
          edgeCasesToWatch: [
            'Delta negativo maior que valorAtual deve retornar 0, nunca número negativo.',
            'Soma acima de limiteMaximo deve retornar exatamente limiteMaximo.',
            'Delta igual a 0 deve preservar valorAtual (respeitando os limites).',
          ],
          testCases: [
            { id: 't1', label: 'Dano/redução normal', input: [80, -30, 100], expected: 50 },
            { id: 't2', label: 'Cura/acréscimo normal', input: [40, 25, 100], expected: 65 },
            { id: 't3', label: 'Caso extremo: abaixo de zero', input: [20, -90, 100], expected: 0, isEdgeCase: true },
            { id: 't4', label: 'Caso extremo: acima do limite máximo', input: [90, 50, 100], expected: 100, isEdgeCase: true },
            { id: 't5', label: 'Caso extremo: limite máximo zero', input: [0, 15, 0], expected: 0, isEdgeCase: true },
          ],
        },
      },
      {
        id: 'm1-l2',
        moduleId: 'mod-1',
        order: 2,
        title: 'Aritmética, Módulo (%) e Conversão de Unidades',
        summary: 'Domine divisão inteira (`Math.floor`) e operador módulo (`%`) para decompor tempo, índices e ciclos.',
        estimatedMinutes: 9,
        xpReward: 110,
        universityTag: 'Aritmética Modular',
        theoryBlocks: [
          {
            heading: 'Divisão inteira e resto da divisão (%)',
            body: 'Na computação, o operador `%` (módulo) retorna o resto da divisão inteira. Ele é essencial para converter segundos em minutos, distribuir itens em grades 2D, implementar filas circulares e tabelas hash.',
            codeExample: `const totalSegundos = 135;\nconst minutos = Math.floor(totalSegundos / 60); // 2\nconst segundosRestantes = totalSegundos % 60;   // 15`,
          },
          {
            heading: 'Formatação previsível com padStart',
            body: 'Quando precisamos exibir `02:05` em vez de `2:5`, convertemos o número para texto (`String(n)`) e aplicamos `.padStart(2, "0")`.',
            codeExample: `const formatado = String(5).padStart(2, "0"); // "05"`,
          },
        ],
        trackContext: {
          explorador: 'Você vai transformar um total bruto de segundos em formato cronômetro `MM:SS`, lidando com entradas inválidas.',
          jogos: 'Todo cronômetro de partida, tempo de recarga (cooldown) de habilidade ou speedrun converte segundos brutos em `MM:SS`.',
          web: 'Players de vídeo, podcasts e temporizadores de pagamento Pix precisam converter durações em segundos para um texto legível.',
          dados: 'Pipelines de telemetria registram durações em segundos inteiros e formatam relatórios de latência e sessão para dashboards.',
          sistemas: 'Logs de uptime e profilers de benchmark dependem de aritmética modular limpa e validação defensiva contra números negativos.',
        },
        conceptQuiz: {
          question: 'Qual é o resultado da expressão `125 % 60` em JavaScript?',
          options: ['2', '5', '2.08'],
          correctIndex: 1,
          explanation: 'Exato! 60 cabe 2 vezes em 125 (120), sobrando exatamente 5 de resto.',
        },
        challenge: {
          prompt: 'Implemente `formatarCronometro(totalSegundos)` que recebe um número inteiro de segundos e retorna uma string no formato `"MM:SS"` com dois dígitos mínimos nos minutos e exatamente dois dígitos nos segundos. Se `totalSegundos` for negativo ou não finito, retorne `"00:00"`.',
          functionName: 'formatarCronometro',
          starterCode: `function formatarCronometro(totalSegundos) {
  // Valide se totalSegundos é negativo ou inválido
  // Calcule minutos inteiros e segundos restantes
  // Retorne no formato "MM:SS"
  
}`,
          edgeCasesToWatch: [
            'Segundos negativos (ex: -10) devem retornar "00:00".',
            'Zero segundos deve retornar "00:00".',
            'Valores acima de 1 hora (ex: 3665s -> "61:05") devem manter todos os minutos sem truncar.',
          ],
          testCases: [
            { id: 't1', label: 'Tempo padrão (135s)', input: [135], expected: '02:15' },
            { id: 't2', label: 'Abaixo de 1 minuto (9s)', input: [9], expected: '00:09' },
            { id: 't3', label: 'Caso extremo: zero', input: [0], expected: '00:00', isEdgeCase: true },
            { id: 't4', label: 'Caso extremo: negativo', input: [-45], expected: '00:00', isEdgeCase: true },
            { id: 't5', label: 'Caso extremo: mais de 60 minutos', input: [3665], expected: '61:05', isEdgeCase: true },
          ],
        },
      },
    ],
  },
  {
    id: 'mod-2',
    number: '02',
    title: 'Lógica Booleana & Estruturas Condicionais',
    subtitle: 'Tabelas-verdade, igualdade estrita (===), cláusulas de guarda e tomada de decisão sem ambiguidade.',
    universityEquivalent: 'Lógica para Computação (1º Semestre)',
    lessons: [
      {
        id: 'm2-l1',
        moduleId: 'mod-2',
        order: 3,
        title: 'Operadores Lógicos e Cláusulas de Guarda',
        summary: 'Escreva regras de decisão limpas, evitando pirâmides de `if` aninhados e bugs de precedência.',
        estimatedMinutes: 10,
        xpReward: 120,
        universityTag: 'Álgebra Booleana & Guard Clauses',
        theoryBlocks: [
          {
            heading: 'Igualdade estrita (===) sempre',
            body: 'Em JavaScript, `==` realiza coerção implícita de tipos (fazendo `"0" == false` ser `true`). Em código profissional, use SEMPRE `===` e `!==` para comparar valor e tipo simultaneamente.',
            codeExample: `0 === false  // false (seguro)\n0 == false   // true (armadilha clássica!)`,
          },
          {
            heading: 'Cláusulas de Guarda (Early Return)',
            body: 'Em vez de aninhar vários `if/else`, rejeite primeiro os casos inválidos ou prioritários e retorne imediatamente. O fluxo principal fica plano e muito mais fácil de auditar.',
            codeExample: `if (nota < 0 || nota > 10) return "invalida";\nif (frequencia < 75) return "reprovado_falta";`,
          },
        ],
        trackContext: {
          explorador: 'Você vai construir um motor de decisão com múltiplas regras e prioridades — exatamente como sistemas reais avaliam permissões e status.',
          jogos: 'Sistemas de conquista e desbloqueio de fase combinam pré-requisitos booleanos (chefe derrotado, nível mínimo e energia suficiente).',
          web: 'Regras de aprovação de cadastro, controle de acesso (RBAC) e validação de cupons dependem de cláusulas de guarda claras.',
          dados: 'Árvores de decisão e classificadores baseados em regras filtram registros inválidos antes de categorizar observações.',
          sistemas: 'Políticas de firewall e validadores de contrato exigem ordem determinística de avaliação e cobertura total dos ramos lógicos.',
        },
        conceptQuiz: {
          question: 'Se `a = true`, `b = false` e `c = true`, qual o valor de `a && (b || !c)`?',
          options: ['true', 'false', 'undefined'],
          correctIndex: 1,
          explanation: 'Correto! `!c` é `false`, logo `(b || !c)` é `(false || false)` = `false`. Por fim, `true && false` resulta em `false`.',
        },
        challenge: {
          prompt: 'Implemente `avaliarAprovacao(nota, frequencia)` seguindo regras universitárias rigorosas:\n1. Se `nota < 0 || nota > 10 || frequencia < 0 || frequencia > 100`, retorne `"dados_invalidos"`.\n2. Se `frequencia < 75`, retorne `"reprovado_falta"` (mesmo com nota alta!).\n3. Se `nota >= 7`, retorne `"aprovado"`.\n4. Se `nota >= 5`, retorne `"recuperacao"`.\n5. Caso contrário, retorne `"reprovado_nota"`.',
          functionName: 'avaliarAprovacao',
          starterCode: `function avaliarAprovacao(nota, frequencia) {
  // Use cláusulas de guarda para validar os limites primeiro
  
}`,
          edgeCasesToWatch: [
            'Nota 10 com frequência 74% ainda deve retornar "reprovado_falta".',
            'Limites exatos: nota 7.0 com 75% é "aprovado"; nota 5.0 com 75% é "recuperacao".',
            'Nota negativa ou frequência acima de 100 devem retornar "dados_invalidos".',
          ],
          testCases: [
            { id: 't1', label: 'Aprovado padrão', input: [8.5, 90], expected: 'aprovado' },
            { id: 't2', label: 'Recuperação no limite exato', input: [5, 75], expected: 'recuperacao', isEdgeCase: true },
            { id: 't3', label: 'Reprovado por falta com nota 10', input: [10, 74], expected: 'reprovado_falta', isEdgeCase: true },
            { id: 't4', label: 'Reprovado por nota', input: [4.9, 100], expected: 'reprovado_nota' },
            { id: 't5', label: 'Caso extremo: dados fora da faixa', input: [11, 80], expected: 'dados_invalidos', isEdgeCase: true },
          ],
        },
      },
      {
        id: 'm2-l2',
        moduleId: 'mod-2',
        order: 4,
        title: 'Detecção de Colisão & Intervalos Geométricos',
        summary: 'Aplique lógica booleana sobre coordenadas numéricas para testar interseções de intervalos e retângulos.',
        estimatedMinutes: 11,
        xpReward: 130,
        universityTag: 'Geometria Computacional Básica',
        theoryBlocks: [
          {
            heading: 'Teorema da Separação em 2D (AABB)',
            body: 'Para testar se dois retângulos alinhados aos eixos (Axis-Aligned Bounding Boxes) colidem, é muito mais simples pensar quando eles NÃO colidem: um está totalmente à esquerda, à direita, acima ou abaixo do outro. Negando isso, obtemos a condição exata de colisão!',
            codeExample: `const sobrepoeX = a.x < b.x + b.largura && a.x + a.largura > b.x;\nconst sobrepoeY = a.y < b.y + b.altura && a.y + a.altura > b.y;\nconst colidiu = sobrepoeX && sobrepoeY;`,
          },
        ],
        trackContext: {
          explorador: 'Interseção de caixas (AABB) é uma das expressões booleanas mais elegantes da computação: serve para jogos, interfaces e calendários.',
          jogos: 'Esta é literalmente a função central de colisão entre hitboxes de personagem, projéteis e plataformas em motores 2D.',
          web: 'Bibliotecas de arrastar-e-soltar (drag & drop), seleção por área e verificação de conflito de horários usam exatamente essa lógica.',
          dados: 'Consultas espaciais em mapas (bounding boxes) filtram milhões de coordenadas antes de cálculos caros de distância.',
          sistemas: 'Detecção de sobreposição de faixas de memória e intervalos de lock usa exatamente o mesmo predicado matemático.',
        },
        conceptQuiz: {
          question: 'Se dois retângulos apenas encostam nas bordas (`a.x + a.largura === b.x`), usando `<` e `>` estritos, qual é o resultado?',
          options: [
            'Colisão verdadeira (true).',
            'Colisão falsa (false), pois não há área interna sobreposta.',
            'Erro de execução.',
          ],
          correctIndex: 1,
          explanation: 'Exato! Com desigualdade estrita (`<` e `>`), bordas tangentes não contam como invasão de área — evitando que personagens travem em paredes adjacentes.',
        },
        challenge: {
          prompt: 'Implemente `verificarColisaoAABB(a, b)` onde `a` e `b` são objetos `{ x, y, largura, altura }`. Retorne `true` se houver sobreposição de área interna entre os retângulos e `false` caso contrário. Se qualquer `largura` ou `altura` for `<= 0`, retorne `false`.',
          functionName: 'verificarColisaoAABB',
          starterCode: `function verificarColisaoAABB(a, b) {
  // Valide dimensões positivas primeiro
  // Verifique sobreposição simultânea nos eixos X e Y
  
}`,
          edgeCasesToWatch: [
            'Retângulos que apenas encostam a borda (ex: x=0, largura=10 e x=10, largura=10) devem retornar false.',
            'Retângulo com largura ou altura zero/negativa não tem área e deve retornar false.',
            'Um retângulo completamente dentro do outro deve retornar true.',
          ],
          testCases: [
            {
              id: 't1',
              label: 'Sobreposição parcial',
              input: [{ x: 0, y: 0, largura: 10, altura: 10 }, { x: 5, y: 5, largura: 10, altura: 10 }],
              expected: true,
            },
            {
              id: 't2',
              label: 'Separados no eixo X',
              input: [{ x: 0, y: 0, largura: 10, altura: 10 }, { x: 15, y: 0, largura: 10, altura: 10 }],
              expected: false,
            },
            {
              id: 't3',
              label: 'Caso extremo: bordas tangentes',
              input: [{ x: 0, y: 0, largura: 10, altura: 10 }, { x: 10, y: 0, largura: 10, altura: 10 }],
              expected: false,
              isEdgeCase: true,
            },
            {
              id: 't4',
              label: 'Caso extremo: hitbox com largura zero',
              input: [{ x: 0, y: 0, largura: 0, altura: 10 }, { x: 0, y: 0, largura: 10, altura: 10 }],
              expected: false,
              isEdgeCase: true,
            },
          ],
        },
      },
    ],
  },
  {
    id: 'mod-3',
    number: '03',
    title: 'Laços de Repetição & Invariantes',
    subtitle: 'Iteração controlada com for/while, acumuladores seguros e prevenção de loops infinitos.',
    universityEquivalent: 'Algoritmos I — Iteração (1º Semestre)',
    lessons: [
      {
        id: 'm3-l1',
        moduleId: 'mod-3',
        order: 5,
        title: 'Acumuladores e Limpeza de Dados em Laços',
        summary: 'Percorra coleções filtrando ruídos e calculando agregações sem dividir por zero.',
        estimatedMinutes: 10,
        xpReward: 130,
        universityTag: 'Iteração & Acumuladores',
        theoryBlocks: [
          {
            heading: 'Anatomia de um acumulador seguro',
            body: 'Ao calcular médias ou somatórios, separamos dois estados: o acumulador (`soma`) e o contador de elementos válidos (`validos`). Antes de dividir, verificamos sempre se `validos === 0` para evitar `NaN`!',
            codeExample: `let soma = 0;\nlet validos = 0;\nfor (const valor of leituras) {\n  if (valor >= 0) {\n    soma += valor;\n    validos++;\n  }\n}\nconst media = validos === 0 ? 0 : soma / validos;`,
          },
        ],
        trackContext: {
          explorador: 'Filtrar e agregar sequências de números é a operação mais frequente em toda a programação prática.',
          jogos: 'Calcular a média de FPS ignorando frames pausados ou somar o XP ganho apenas em missões concluídas.',
          web: 'Calcular a nota média de avaliações de um produto ignorando entradas nulas ou corrompidas.',
          dados: 'Limpeza de outliers negativos em séries temporais antes de calcular a média aritmética da amostra.',
          sistemas: 'Agregação de latência de requisições HTTP válidas para métricas de SLA.',
        },
        conceptQuiz: {
          question: 'O que acontece em JavaScript se você dividir `0 / 0` ao tentar calcular a média de um array vazio?',
          options: [
            'Retorna 0 automaticamente.',
            'Retorna `NaN` (Not a Number), podendo corromper cálculos seguintes.',
            'Lança uma exceção fatal que fecha o navegador.',
          ],
          correctIndex: 1,
          explanation: 'Correto! Em IEEE 754 (padrão de ponto flutuante usado pelo JS), `0 / 0` produz `NaN`, que se propaga silenciosamente. Por isso sempre checamos o denominador antes.',
        },
        challenge: {
          prompt: 'Implemente `mediaValoresValidos(valores)` que recebe um array de números, ignora todos os valores negativos (`< 0`) ou não finitos (`!Number.isFinite(v)`), e retorna a média aritmética dos valores válidos arredondada para 2 casas decimais (`Number(media.toFixed(2))`). Se o array estiver vazio ou não houver valores válidos, retorne `0`.',
          functionName: 'mediaValoresValidos',
          starterCode: `function mediaValoresValidos(valores) {
  // Inicialize soma e contador de válidos
  // Percorra o array ignorando valores < 0 ou não finitos
  // Evite divisão por zero e arredonde para 2 casas decimais
  
}`,
          edgeCasesToWatch: [
            'Array vazio [] deve retornar 0.',
            'Array apenas com negativos [-5, -10] deve retornar 0.',
            'O valor 0 é válido (>= 0) e DEVE entrar na contagem do denominador!',
          ],
          testCases: [
            { id: 't1', label: 'Amostra mista com negativos', input: [[10, -5, 20, 30]], expected: 20 },
            { id: 't2', label: 'Amostra com zero válido', input: [[0, 10, 20]], expected: 10, isEdgeCase: true },
            { id: 't3', label: 'Caso extremo: array vazio', input: [[]], expected: 0, isEdgeCase: true },
            { id: 't4', label: 'Caso extremo: todos inválidos', input: [[-1, -20, -3]], expected: 0, isEdgeCase: true },
            { id: 't5', label: 'Arredondamento de dízima', input: [[1, 2, 2]], expected: 1.67 },
          ],
        },
      },
      {
        id: 'm3-l2',
        moduleId: 'mod-3',
        order: 6,
        title: 'Laço While e Simulação Passo a Passo',
        summary: 'Use `while` quando o número de iterações não é conhecido de antemão e prove que o laço sempre termina.',
        estimatedMinutes: 12,
        xpReward: 140,
        universityTag: 'Terminação & Invariante de Laço',
        theoryBlocks: [
          {
            heading: 'A prova de terminação do while',
            body: 'Na Ciência da Computação, todo laço `while` precisa de uma variante decrescente (algo que se aproxima garantidamente da condição de parada a cada iteração). Se a taxa de progresso for menor ou igual a zero, o laço jamais termina!',
            codeExample: `let passos = 0;\nwhile (atual < meta) {\n  atual += ganhoPorPasso;\n  passos++;\n}`,
          },
        ],
        trackContext: {
          explorador: 'Simular quantos ciclos um processo leva até atingir uma meta exige cuidado redobrado com casos onde a meta nunca seria alcançada.',
          jogos: 'Calcular em quantos turnos um herói derrota um chefe considerando regeneração do inimigo a cada turno.',
          web: 'Calcular em quantos meses uma meta de economia é atingida com aportes mensais e taxa de manutenção.',
          dados: 'Simular quantas épocas de treinamento um modelo leva para reduzir o erro abaixo de um limiar.',
          sistemas: 'Calcular quantos lotes são necessários para drenar uma fila que recebe novos eventos continuamente.',
        },
        conceptQuiz: {
          question: 'Se um inimigo tem 100 de vida, você causa 10 de dano por turno e ele regenera 10 de vida após sobreviver ao turno, o que ocorre em um `while (vida > 0)` sem proteção?',
          options: [
            'Termina em 10 turnos.',
            'Loop infinito! A variante nunca diminui.',
            'O JavaScript para automaticamente após 100 turnos.',
          ],
          correctIndex: 1,
          explanation: 'Perfeito! Se `dano <= regeneracao` e o primeiro golpe já não elimina o inimigo, a vida nunca chega a 0. Sempre trate esse caso extremo retornando `-1`!',
        },
        challenge: {
          prompt: 'Implemente `turnosParaVencer(vidaChefe, danoTurno, regeneracaoTurno)` que retorna o número mínimo de turnos para `vidaChefe <= 0`. A cada turno: primeiro aplica-se `danoTurno`; se `vidaChefe <= 0`, a luta acaba imediatamente (o chefe não regenera!). Caso contrário, ele recupera `regeneracaoTurno`. Se `vidaChefe <= 0` inicialmente, retorne `0`. Se for impossível vencer (ex: `danoTurno <= 0`, ou o chefe não morre no 1º turno e `danoTurno <= regeneracaoTurno`), retorne `-1`.',
          functionName: 'turnosParaVencer',
          starterCode: `function turnosParaVencer(vidaChefe, danoTurno, regeneracaoTurno) {
  // Trate casos extremos primeiro para garantir terminação!
  
}`,
          edgeCasesToWatch: [
            'Se danoTurno >= vidaChefe, vence em exatamente 1 turno (mesmo se regeneracaoTurno for gigante!).',
            'Se não vencer no 1º turno e danoTurno <= regeneracaoTurno, retorne -1.',
            'Se vidaChefe <= 0 inicialmente, retorne 0.',
          ],
          testCases: [
            { id: 't1', label: 'Batalha normal', input: [100, 30, 10], expected: 5 },
            { id: 't2', label: 'Caso extremo: golpe único letal', input: [50, 60, 100], expected: 1, isEdgeCase: true },
            { id: 't3', label: 'Caso extremo: impossível vencer (evita loop infinito)', input: [100, 15, 15], expected: -1, isEdgeCase: true },
            { id: 't4', label: 'Caso extremo: chefe já derrotado', input: [0, 20, 5], expected: 0, isEdgeCase: true },
            { id: 't5', label: 'Caso extremo: dano zero', input: [50, 0, 0], expected: -1, isEdgeCase: true },
          ],
        },
      },
    ],
  },
  {
    id: 'mod-4',
    number: '04',
    title: 'Funções, Escopo & Modularização',
    subtitle: 'Funções puras, decomposição de problemas, imutabilidade e contratos de entrada/saída.',
    universityEquivalent: 'Programação Modular (1º/2º Semestre)',
    lessons: [
      {
        id: 'm4-l1',
        moduleId: 'mod-4',
        order: 7,
        title: 'Funções Puras e Composição de Regras',
        summary: 'Projete funções determinísticas que não alteram dados externos e podem ser combinadas com segurança.',
        estimatedMinutes: 10,
        xpReward: 150,
        universityTag: 'Funções Puras & Determinismo',
        theoryBlocks: [
          {
            heading: 'O que torna uma função pura?',
            body: 'Uma função pura (1) sempre produz a mesma saída para as mesmas entradas e (2) não causa efeitos colaterais (não modifica arrays ou objetos recebidos por parâmetro). Isso torna testes automatizados e depuração trivialmente confiáveis.',
            codeExample: `// Evite mutar o array recebido:\n// itens.sort() -> MUTA o original!\n// Prefira criar cópia:\nconst copia = [...itens].sort((a, b) => a - b);`,
          },
        ],
        trackContext: {
          explorador: 'Escrever funções puras e validar senhas/entradas é um dos hábitos que mais separa programadores iniciantes de engenheiros profissionais.',
          jogos: 'Validar nomes de guilda, códigos de sala multiplayer e estados de save sem corromper o objeto principal do jogo.',
          web: 'Validadores de senha forte e sanitizadores de formulários rodam tanto no frontend quanto no backend como funções puras.',
          dados: 'Funções de transformação pura garantem que reprocessar um dataset produza resultados 100% reprodutíveis.',
          sistemas: 'Contratos puros facilitam paralelismo, cache (memoização) e testes unitários determinísticos.',
        },
        conceptQuiz: {
          question: 'Por que modificar (mutar) um array recebido como parâmetro dentro de uma função pode gerar bugs graves?',
          options: [
            'Porque o JavaScript não permite alterar arrays dentro de funções.',
            'Porque arrays são passados por referência: alterar o parâmetro modifica silenciosamente os dados de quem chamou a função.',
            'Porque isso duplica o uso de memória RAM.',
          ],
          correctIndex: 1,
          explanation: 'Excelente! Objetos e arrays em JS são manipulados por referência. Criar uma cópia ou retornar um novo resultado preserva a previsibilidade do sistema.',
        },
        challenge: {
          prompt: 'Implemente `validarSenhaForte(senha)` que retorna `true` somente se `senha` for uma string com:\n- Pelo menos 8 caracteres\n- Pelo menos 1 letra maiúscula (`A-Z`)\n- Pelo menos 1 letra minúscula (`a-z`)\n- Pelo menos 1 dígito numérico (`0-9`)\n- Sem espaços em branco.\nPara qualquer entrada que não seja string ou descumpra qualquer critério, retorne `false`.',
          functionName: 'validarSenhaForte',
          starterCode: `function validarSenhaForte(senha) {
  // Verifique primeiro se typeof senha === 'string'
  // Valide comprimento mínimo, ausência de espaços e classes de caracteres
  
}`,
          edgeCasesToWatch: [
            'String vazia "" ou tipo não-string (null, 12345678) deve retornar false.',
            'Senha com espaço no meio ("Abcd 1234") deve retornar false.',
            'Exatamente 8 caracteres atendendo todos os critérios deve retornar true.',
          ],
          testCases: [
            { id: 't1', label: 'Senha forte válida', input: ['CodeForge2026'], expected: true },
            { id: 't2', label: 'Curta demais (7 chars)', input: ['Abc1234'], expected: false, isEdgeCase: true },
            { id: 't3', label: 'Sem maiúscula', input: ['codeforge2026'], expected: false },
            { id: 't4', label: 'Caso extremo: contém espaço', input: ['Code 2026'], expected: false, isEdgeCase: true },
            { id: 't5', label: 'Caso extremo: entrada null', input: [null], expected: false, isEdgeCase: true },
          ],
        },
      },
      {
        id: 'm4-l2',
        moduleId: 'mod-4',
        order: 8,
        title: 'Transformação Imutável de Coleções',
        summary: 'Aplique descontos e filtros em listas de objetos retornando novas estruturas sem mutar a entrada.',
        estimatedMinutes: 12,
        xpReward: 160,
        universityTag: 'Imutabilidade & Higher-Order Functions',
        theoryBlocks: [
          {
            heading: 'Compondo filter, map e reduce com clareza',
            body: 'Funções de ordem superior como `filter`, `map` e `reduce` expressam O QUÊ queremos calcular sem espalhar índices manuais. Ainda assim, sempre garanta que o custo total permaneça linear $O(n)$ e que objetos internos não sejam mutados.',
            codeExample: `const total = itens\n  .filter((item) => item.ativo)\n  .reduce((acc, item) => acc + item.preco * item.qtd, 0);`,
          },
        ],
        trackContext: {
          explorador: 'Processar listas de objetos (itens com preço, peso ou pontuação) é o pão com manteiga de qualquer sistema real.',
          jogos: 'Calcular o peso total da mochila ou o valor de venda de itens equipáveis no inventário.',
          web: 'Calcular o subtotal real de um carrinho de compras com desconto percentual condicional.',
          dados: 'Somar o faturamento ponderado de transações válidas em uma janela de tempo.',
          sistemas: 'Consolidar consumo de recursos por processo sem alterar os registros originais de auditoria.',
        },
        conceptQuiz: {
          question: 'Qual o segundo argumento recomendado ao chamar `array.reduce(callback, valorInicial)`?',
          options: [
            'Não precisa passar, o JS sempre adivinha 0.',
            'Sempre passar o `valorInicial` explícito (ex: `0`), pois chamar `.reduce()` em um array vazio sem valor inicial lança TypeError!',
            'Sempre passar o tamanho do array.',
          ],
          correctIndex: 1,
          explanation: 'Na mosca! Chamar `[].reduce((a, b) => a + b)` sem valor inicial causa erro em tempo de execução. Passar `0` protege o caso extremo de lista vazia.',
        },
        challenge: {
          prompt: 'Implemente `calcularTotalCarrinho(itens, descontoPercentual)` onde `itens` é um array de objetos `{ preco, quantidade }`. Ignore itens com `preco <= 0` ou `quantidade <= 0`. Aplique `descontoPercentual` (limitado entre 0 e 100; se negativo, trate como 0; se > 100, trate como 100) sobre o subtotal e retorne o total arredondado para 2 casas decimais.',
          functionName: 'calcularTotalCarrinho',
          starterCode: `function calcularTotalCarrinho(itens, descontoPercentual = 0) {
  // Trate array vazio ou inválido
  // Some preco * quantidade apenas dos itens válidos
  // Aplique o desconto saturado entre 0 e 100 e arredonde para 2 casas
  
}`,
          edgeCasesToWatch: [
            'Array vazio [] deve retornar 0.',
            'Itens com quantidade 0 ou preço negativo devem ser ignorados.',
            'Desconto negativo deve ser tratado como 0%; desconto acima de 100% deve resultar em 0.',
          ],
          testCases: [
            {
              id: 't1',
              label: 'Carrinho padrão com 10% de desconto',
              input: [[{ preco: 50, quantidade: 2 }, { preco: 25, quantidade: 1 }], 10],
              expected: 112.5,
            },
            {
              id: 't2',
              label: 'Ignora itens inválidos',
              input: [[{ preco: -10, quantidade: 3 }, { preco: 40, quantidade: 0 }, { preco: 30, quantidade: 2 }], 0],
              expected: 60,
              isEdgeCase: true,
            },
            {
              id: 't3',
              label: 'Caso extremo: carrinho vazio',
              input: [[], 20],
              expected: 0,
              isEdgeCase: true,
            },
            {
              id: 't4',
              label: 'Caso extremo: desconto acima de 100%',
              input: [[{ preco: 100, quantidade: 1 }], 150],
              expected: 0,
              isEdgeCase: true,
            },
          ],
        },
      },
    ],
  },
  {
    id: 'mod-5',
    number: '05',
    title: 'Estruturas de Dados: Mapas, Conjuntos & Busca',
    subtitle: 'Tabelas hash (Map/Set), contagem de frequência em O(n) e Busca Binária em O(log n).',
    universityEquivalent: 'Estruturas de Dados I (2º Semestre)',
    lessons: [
      {
        id: 'm5-l1',
        moduleId: 'mod-5',
        order: 9,
        title: 'Mapas de Frequência (Hash Tables) em O(n)',
        summary: 'Substitua laços aninhados lentos $O(n^2)$ por dicionários/Map em tempo linear $O(n)$.',
        estimatedMinutes: 12,
        xpReward: 175,
        universityTag: 'Tabelas Hash & Complexidade O(n)',
        theoryBlocks: [
          {
            heading: 'Por que Hash Maps mudam o jogo na faculdade?',
            body: 'Procurar um elemento em um array leva até $n$ passos ($O(n)$). Em um `Map` ou objeto hash, consultar ou atualizar uma chave leva em média tempo constante $O(1)$. Assim, contar frequências ou achar o primeiro elemento único cai de $O(n^2)$ para $O(n)$!',
            codeExample: `const contagem = new Map();\nfor (const item of lista) {\n  contagem.set(item, (contagem.get(item) ?? 0) + 1);\n}`,
          },
        ],
        trackContext: {
          explorador: 'Tabelas de frequência são o alicerce de problemas clássicos de entrevistas técnicas e disciplinas de Estruturas de Dados.',
          jogos: 'Empilhar itens iguais no inventário (ex: 12 poções, 3 flechas) ou detectar qual habilidade foi mais usada numa partida.',
          web: 'Contar cliques por rota, identificar tags mais populares ou detectar requisições repetidas.',
          dados: 'Construir histogramas de categorias e encontrar a moda estatística de um conjunto de amostras.',
          sistemas: 'Detectar códigos de erro mais frequentes em arquivos de log com milhões de linhas em passagem única.',
        },
        conceptQuiz: {
          question: 'Qual é a complexidade de tempo para construir um mapa de frequência percorrendo um array de `n` elementos uma única vez?',
          options: ['O(1)', 'O(n)', 'O(n²)'],
          correctIndex: 1,
          explanation: 'Correto! Percorremos os `n` elementos uma vez, fazendo inserções/atualizações de custo médio O(1) em cada passo -> O(n).',
        },
        challenge: {
          prompt: 'Implemente `itemMaisFrequente(lista)` que recebe um array de strings ou números e retorna o elemento que aparece mais vezes. Em caso de empate na frequência máxima, retorne o que apareceu PRIMEIRO no array. Se o array estiver vazio, retorne `null`.',
          functionName: 'itemMaisFrequente',
          starterCode: `function itemMaisFrequente(lista) {
  // Use um Map para contar ocorrências em O(n)
  // Em caso de empate, mantenha o primeiro que apareceu na lista
  
}`,
          edgeCasesToWatch: [
            'Array vazio [] deve retornar null.',
            'Empate de frequência (ex: ["a", "b", "b", "a"]) deve retornar "a", pois apareceu primeiro.',
            'Array com 1 único elemento deve retornar esse elemento.',
          ],
          testCases: [
            { id: 't1', label: 'Vencedor claro', input: [['pocao', 'espada', 'pocao', 'escudo', 'pocao']], expected: 'pocao' },
            { id: 't2', label: 'Empate favorece quem apareceu antes', input: [['a', 'b', 'b', 'a']], expected: 'a', isEdgeCase: true },
            { id: 't3', label: 'Caso extremo: array vazio', input: [[]], expected: null, isEdgeCase: true },
            { id: 't4', label: 'Números com único elemento', input: [[42]], expected: 42, isEdgeCase: true },
          ],
        },
      },
      {
        id: 'm5-l2',
        moduleId: 'mod-5',
        order: 10,
        title: 'Busca Binária: Dividir para Conquistar',
        summary: 'Encontre um alvo em 1 milhão de itens ordenados usando no máximo 20 comparações ($O(\\log n)$).',
        estimatedMinutes: 14,
        xpReward: 190,
        universityTag: 'Busca Binária — O(log n)',
        theoryBlocks: [
          {
            heading: 'A invariante dos ponteiros inicio e fim',
            body: 'Na Busca Binária, mantemos um intervalo `[inicio, fim]` onde o alvo ainda pode existir. Testamos o índice `meio = Math.floor((inicio + fim) / 2)`. Se `lista[meio] < alvo`, descartamos toda a metade esquerda fazendo `inicio = meio + 1`. Se for maior, `fim = meio - 1`.',
            codeExample: `let inicio = 0;\nlet fim = ordenado.length - 1;\nwhile (inicio <= fim) {\n  const meio = Math.floor((inicio + fim) / 2);\n  if (ordenado[meio] === alvo) return meio;\n  if (ordenado[meio] < alvo) inicio = meio + 1;\n  else fim = meio - 1;\n}\nreturn -1;`,
          },
        ],
        trackContext: {
          explorador: 'Busca Binária é o primeiro grande divisor de águas em Ciência da Computação — teste depois o nosso simulador visual na aba Glossário!',
          jogos: 'Encontrar rapidamente a faixa de nível correspondente ao XP acumulado em tabelas gigantes de progressão.',
          web: 'Localizar registros ordenados por timestamp ou ID em índices de bancos de dados.',
          dados: 'Encontrar percentis e quantis rapidamente em vetores numéricos ordenados.',
          sistemas: 'O comando `git bisect` usa exatamente Busca Binária para achar em segundos qual commit introduziu um bug!',
        },
        conceptQuiz: {
          question: 'Qual é a pré-condição obrigatória para que a Busca Binária funcione corretamente?',
          options: [
            'O array precisa ter tamanho par.',
            'O array precisa estar previamente ordenado.',
            'O array só pode conter números positivos.',
          ],
          correctIndex: 1,
          explanation: 'Exato! Sem ordenação, descartar metade do array não é matematicamente válido.',
        },
        challenge: {
          prompt: 'Implemente `buscaBinaria(numerosOrdenados, alvo)` sem usar `.indexOf()` ou `.includes()`. Retorne o índice do `alvo` no array ordenado em ordem crescente, ou `-1` se o alvo não existir.',
          functionName: 'buscaBinaria',
          starterCode: `function buscaBinaria(numerosOrdenados, alvo) {
  // Implemente com ponteiros inicio e fim em O(log n)
  
}`,
          edgeCasesToWatch: [
            'Array vazio [] deve retornar -1.',
            'Alvo na primeira posição (índice 0) ou na última posição (length - 1).',
            'Use `inicio <= fim` (e não `<`) para não falhar quando resta 1 elemento.',
          ],
          testCases: [
            { id: 't1', label: 'Alvo no meio', input: [[2, 5, 8, 12, 16, 23, 38], 12], expected: 3 },
            { id: 't2', label: 'Alvo na última posição', input: [[1, 3, 5, 7, 9], 9], expected: 4, isEdgeCase: true },
            { id: 't3', label: 'Alvo na primeira posição', input: [[-10, -2, 0, 4], -10], expected: 0, isEdgeCase: true },
            { id: 't4', label: 'Alvo inexistente', input: [[1, 4, 6, 8], 5], expected: -1 },
            { id: 't5', label: 'Caso extremo: array vazio', input: [[], 7], expected: -1, isEdgeCase: true },
          ],
        },
      },
    ],
  },
  {
    id: 'mod-6',
    number: '06',
    title: 'Algoritmos Intermediários & Nível Universitário',
    subtitle: 'Pilhas (LIFO), validação de estruturas aninhadas, recursão segura e análise assintótica.',
    universityEquivalent: 'Estruturas de Dados II & Análise de Algoritmos',
    lessons: [
      {
        id: 'm6-l1',
        moduleId: 'mod-6',
        order: 11,
        title: 'Pilhas (Stack) e Validação de Expressões',
        summary: 'Use a estrutura LIFO (Last-In, First-Out) para construir o núcleo sintático de um compilador.',
        estimatedMinutes: 14,
        xpReward: 200,
        universityTag: 'Pilha (LIFO) & Compiladores',
        theoryBlocks: [
          {
            heading: 'Como compiladores validam parênteses, colchetes e chaves',
            body: 'Toda vez que encontramos um símbolo de abertura `(`, `[` ou `{`, empilhamos (`push`). Quando encontramos um fechamento `)`, `]` ou `}`, desempilhamos (`pop`) e verificamos se ele corresponde exatamente ao último símbolo aberto. Ao final, a pilha precisa estar vazia!',
            codeExample: `const pilha = [];\nconst pares = { ')': '(', ']': '[', '}': '{' };`,
          },
        ],
        trackContext: {
          explorador: 'Este é um dos problemas mais famosos da Ciência da Computação — cai em provas de Estruturas de Dados e entrevistas das maiores empresas de tecnologia.',
          jogos: 'Interpretar scripts de diálogo aninhados e gerenciar pilhas de telas/menus (Pause -> Opções -> Áudio).',
          web: 'Validar sintaxe de JSON, tags HTML aninhadas e histórico de ações Desfazer (Undo).',
          dados: 'Avaliar fórmulas matemáticas e expressões de consulta com precedência de parênteses.',
          sistemas: 'É literalmente a base da pilha de chamadas (Call Stack) e analisadores sintáticos (parsers) de compiladores.',
        },
        conceptQuiz: {
          question: 'Por que apenas contar a quantidade de `(` e `)` não basta para validar a expressão `"([)]"`?',
          options: [
            'Porque a contagem não verifica a ORDEM de aninhamento (o último aberto deve ser o primeiro fechado).',
            'Porque strings não podem ter colchetes e parênteses juntos.',
            'Porque contar é mais lento que usar pilha.',
          ],
          correctIndex: 0,
          explanation: 'Brilhante! Em `"([)]"`, as contagens batem, mas `)` tenta fechar `[` antes do `]` fechar. A pilha (LIFO) captura exatamente essa violação.',
        },
        challenge: {
          prompt: 'Implemente `delimitadoresBalanceados(expressao)` que verifica se todos os caracteres `( )`, `[ ]` e `{ }` em uma string estão corretamente abertos e fechados na ordem certa. Ignore quaisquer outros caracteres (letras, números, operadores). Uma string vazia ou sem delimitadores é considerada balanceada (`true`).',
          functionName: 'delimitadoresBalanceados',
          starterCode: `function delimitadoresBalanceados(expressao) {
  // Use uma pilha (array com push/pop) e um mapa de correspondência
  
}`,
          edgeCasesToWatch: [
            'Fechamento sem abertura prévia (ex: ")(" ou "]") deve retornar false.',
            'Abertura sem fechamento no final (ex: "((a+b)") deixa a pilha não-vazia -> false.',
            'String vazia "" deve retornar true.',
          ],
          testCases: [
            { id: 't1', label: 'Expressão matemática válida', input: ['fn(a[0] + {b: 1})'], expected: true },
            { id: 't2', label: 'Ordem cruzada inválida', input: ['([)]'], expected: false, isEdgeCase: true },
            { id: 't3', label: 'Fechamento antes da abertura', input: [')('], expected: false, isEdgeCase: true },
            { id: 't4', label: 'Abertura sobrando no final', input: ['{ [ ( ) ]'], expected: false, isEdgeCase: true },
            { id: 't5', label: 'Caso extremo: string vazia', input: [''], expected: true, isEdgeCase: true },
          ],
        },
      },
      {
        id: 'm6-l2',
        moduleId: 'mod-6',
        order: 12,
        title: 'Recursão, Caso Base e Estruturas Aninhadas',
        summary: 'Pense recursivamente para percorrer estruturas em árvore de profundidade arbitrária sem estouro de pilha.',
        estimatedMinutes: 15,
        xpReward: 220,
        universityTag: 'Recursão & Árvores',
        theoryBlocks: [
          {
            heading: 'As duas leis da recursão correta',
            body: 'Toda função recursiva precisa de (1) um **caso base** claro que retorna imediatamente sem chamar a si mesma, e (2) um **passo recursivo** que reduz o problema em direção ao caso base. Sem caso base, ocorre `Maximum call stack size exceeded` (Stack Overflow).',
            codeExample: `function somarArvore(no) {\n  if (typeof no === 'number') return no; // Caso base\n  let total = 0;\n  for (const filho of no) total += somarArvore(filho);\n  return total;\n}`,
          },
        ],
        trackContext: {
          explorador: 'Recursão desbloqueia árvores, grafos e algoritmos de divisão e conquista (MergeSort, QuickSort) que você verá logo nos primeiros anos de faculdade.',
          jogos: 'Percorrer grafos de cena (Scene Graph: personagem -> braço -> mão -> espada) ou árvores de habilidades.',
          web: 'Renderizar comentários aninhados, menus multinível e percorrer a árvore do DOM.',
          dados: 'Percorrer árvores de decisão e documentos JSON hierárquicos de profundidade desconhecida.',
          sistemas: 'Calcular o tamanho total de diretórios e subdiretórios em um sistema de arquivos.',
        },
        conceptQuiz: {
          question: 'O que causa o erro `RangeError: Maximum call stack size exceeded` em uma função recursiva?',
          options: [
            'Usar `const` dentro da função recursiva.',
            'Ausência de um caso base alcançável ou passo recursivo que não reduz o problema.',
            'Passar um array vazio como argumento.',
          ],
          correctIndex: 1,
          explanation: 'Exatamente! Cada chamada recursiva empilha um novo frame na Call Stack. Sem convergir ao caso base, a memória da pilha esgota.',
        },
        challenge: {
          prompt: 'Implemente `somarAninhado(estrutura)` usando recursão (sem usar `.flat(Infinity)`). A `estrutura` é um array que pode conter números ou outros arrays aninhados em qualquer profundidade. Retorne a soma total de todos os números válidos encontrados. Arrays vazios somam `0`.',
          functionName: 'somarAninhado',
          starterCode: `function somarAninhado(estrutura) {
  // Se não for array, trate o caso base
  // Se for array, some recursivamente cada elemento
  
}`,
          edgeCasesToWatch: [
            'Arrays profundamente vazios como [[], [[]]] devem retornar 0.',
            'Números negativos dentro de subarrays devem ser somados normalmente.',
            'Profundidade arbitrária (ex: [1, [2, [3, [4]]]] -> 10).',
          ],
          testCases: [
            { id: 't1', label: 'Aninhamento simples', input: [[1, [2, 3], 4]], expected: 10 },
            { id: 't2', label: 'Aninhamento profundo', input: [[1, [2, [3, [4, 5]]]]], expected: 15 },
            { id: 't3', label: 'Com valores negativos', input: [[10, [-3, [-2, 5]]]], expected: 10, isEdgeCase: true },
            { id: 't4', label: 'Caso extremo: subarrays vazios', input: [[[], [[]], []]], expected: 0, isEdgeCase: true },
          ],
        },
      },
    ],
  },
];

export const ALL_LESSONS: Lesson[] = CURRICULUM_MODULES.flatMap((m) => m.lessons);

export function getLessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}
