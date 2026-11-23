import { CurriculumModule, Lesson } from '../types';

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 'mod-1',
    number: '01',
    title: 'Primeiros Passos: Variáveis, Contas e Decisões',
    subtitle: 'Comece do zero absoluto: caixinhas de memória, somas simples, textos e sua primeira decisão com if/else.',
    universityEquivalent: 'Base Inicial · Zero Absoluto ao 1º Semestre',
    lessons: [
      {
        id: 'm1-b1',
        moduleId: 'mod-1',
        order: 1,
        title: 'Variáveis: Suas Primeiras Caixinhas',
        summary: 'Entenda o que é uma variável (uma caixinha com etiqueta) e faça sua primeira soma devolvendo o resultado.',
        estimatedMinutes: 5,
        xpReward: 80,
        universityTag: 'Variáveis & Soma Simples',
        difficultyTag: 'Bem fácil',
        theoryBlocks: [
          {
            heading: 'O que é uma variável? Pense numa caixinha com etiqueta',
            body: 'Na programação, uma variável é como uma caixinha guardada na memória do computador. Você cola uma etiqueta nela (o nome, como `pontos`) e coloca um valor lá dentro (como `100`). Quando precisar desse valor, basta chamar o nome da etiqueta!',
            codeExample: `const pontos = 100;\nconst bonus = 50;\nconst total = pontos + bonus; // guarda 150 dentro da caixinha "total"`,
          },
          {
            heading: 'Como uma função devolve a resposta (return)',
            body: 'Uma função funciona como uma mini calculadora: ela recebe valores de entrada nos parênteses, faz uma conta lá dentro e devolve a resposta final usando a palavra `return`. Sem `return`, o computador calcula mas não entrega o resultado para fora!',
            codeExample: `function dobrarNumero(valor) {\n  const resultado = valor * 2;\n  return resultado; // devolve o resultado calculado\n}`,
          },
        ],
        similarExample: {
          title: 'Exemplo parecido: somar moedas de uma fase',
          explanation: 'Veja como uma função recebe duas caixinhas (`moedasIniciais` e `moedasAchadas`), soma as duas e devolve o resultado:',
          codeByLanguage: {
            javascript: `function somarMoedas(moedasIniciais, moedasAchadas) {\n  const total = moedasIniciais + moedasAchadas;\n  return total;\n}`,
            python: `def somarMoedas(moedas_iniciais, moedas_achadas):\n    total = moedas_iniciais + moedas_achadas\n    return total`,
            java: `public class Solucao {\n    public static int somarMoedas(int moedasIniciais, int moedasAchadas) {\n        int total = moedasIniciais + moedasAchadas;\n        return total;\n    }\n}`,
            csharp: `public static class Solucao\n{\n    public static int SomarMoedas(int moedasIniciais, int moedasAchadas)\n    {\n        int total = moedasIniciais + moedasAchadas;\n        return total;\n    }\n}`,
            cpp: `int somarMoedas(int moedasIniciais, int moedasAchadas) {\n    int total = moedasIniciais + moedasAchadas;\n    return total;\n}`,
          },
        },
        progressiveHints: [
          'Pense assim: a função já recebe dois números prontos nos parênteses (`pontosAtuais` e `pontosGanhos`). Você só precisa juntar os dois com o sinal `+` e devolver o resultado.',
          'Passo a passo: na linha 1 dentro da função, crie uma variável chamada `total` recebendo `pontosAtuais + pontosGanhos`. Na linha 2, escreva `return total;` para entregar a resposta.',
          `function somarPontos(pontosAtuais, pontosGanhos) {\n  const total = ___ + ___;\n  return ___;\n}`,
        ],
        progressiveHintTemplateByLanguage: {
          python: `def somarPontos(pontos_atuais, pontos_ganhos):\n    total = ___ + ___\n    return ___`,
          java: `public class Solucao {\n    public static int somarPontos(int pontosAtuais, int pontosGanhos) {\n        int total = ___ + ___;\n        return ___;\n    }\n}`,
          csharp: `public static class Solucao\n{\n    public static int SomarPontos(int pontosAtuais, int pontosGanhos)\n    {\n        int total = ___ + ___;\n        return ___;\n    }\n}`,
          cpp: `int somarPontos(int pontosAtuais, int pontosGanhos) {\n    int total = ___ + ___;\n    return ___;\n}`,
        },
        trackContext: {
          explorador: 'Todo programa — de jogos a aplicativos de banco — começa guardando valores em variáveis e fazendo contas simples.',
          jogos: 'Em qualquer jogo, quando o jogador coleta uma estrela ou vence um inimigo, o computador soma os pontos antigos com os pontos novos.',
          web: 'Em lojas e aplicativos, somar itens no carrinho ou curtidas em uma foto funciona exatamente com essa mesma ideia.',
          dados: 'Antes de gráficos complexos, analisar dados começa somando valores simples guardados em variáveis.',
          sistemas: 'Sistemas reais somam contadores o tempo todo: mensagens enviadas, tarefas concluídas e pontos acumulados.',
        },
        conceptQuiz: {
          question: 'Para que serve a palavra `return` no final de uma função?',
          options: [
            'Para apagar todas as variáveis do computador.',
            'Para devolver o resultado calculado para quem chamou a função.',
            'Para repetir o código várias vezes.',
          ],
          correctIndex: 1,
          explanation: 'Isso mesmo! `return` entrega a resposta final da função para fora, permitindo que os testes verifiquem seu resultado.',
        },
        challenge: {
          prompt: 'Complete a função `somarPontos(pontosAtuais, pontosGanhos)` para somar os pontos que o jogador já tinha com os pontos novos que ele acabou de ganhar, e devolver o total.',
          functionName: 'somarPontos',
          starterCode: `function somarPontos(pontosAtuais, pontosGanhos) {
  // Passo 1: Crie uma variável chamada "total" somando pontosAtuais + pontosGanhos
  
  // Passo 2: Devolva o valor de "total" usando return
  
}`,
          edgeCasesToWatch: [
            'Se o jogador ganhar 0 pontos (ex: 50 + 0), o resultado continua sendo 50.',
            'Se começar com 0 pontos (ex: 0 + 25), o resultado deve ser 25.',
          ],
          testCases: [
            { id: 't1', label: 'Soma básica de pontos', input: [100, 50], expected: 150 },
            { id: 't2', label: 'Ganhando poucos pontos', input: [10, 5], expected: 15 },
            { id: 't3', label: 'Começando do zero', input: [0, 40], expected: 40, isEdgeCase: true },
            { id: 't4', label: 'Sem ganhar novos pontos (0)', input: [80, 0], expected: 80, isEdgeCase: true },
          ],
        },
      },
      {
        id: 'm1-b2',
        moduleId: 'mod-1',
        order: 2,
        title: 'Guardando Texto e Números com const e let',
        summary: 'Aprenda a diferença entre `const` e `let`, misture texto com números e acompanhe um exemplo guiado linha por linha.',
        estimatedMinutes: 6,
        xpReward: 90,
        universityTag: 'const, let & Textos',
        difficultyTag: 'Fácil',
        theoryBlocks: [
          {
            heading: 'const (etiqueta fixa) vs let (etiqueta que pode mudar)',
            body: 'Use `const` quando o valor da caixinha não vai ser trocado depois (como o nome do jogador). Use `let` quando você pretende atualizar o valor dentro da mesma caixinha (como um placar que sobe durante a partida).',
            codeExample: `const jogador = "Ana";   // texto sempre fica entre aspas\nlet pontuacao = 100;     // número não usa aspas\npontuacao = pontuacao + 20; // agora vale 120!`,
          },
          {
            heading: 'Exemplo guiado linha por linha: juntando texto e número',
            body: 'Podemos montar frases prontas combinando texto com variáveis! Em JavaScript, você pode usar crases (`...`) com `${variavel}` ou somar pedaços de texto com `+`:',
            codeExample: `// Linha 1: recebemos o nome e os valores\nconst nome = "Lucas";\n// Linha 2: calculamos o total\nlet nivel = 1;\nnivel = nivel + 2; // agora vale 3\n// Linha 3: montamos a frase final\nconst mensagem = \`\${nome} está no nível \${nivel}\`;\n// Resultado: "Lucas está no nível 3"`,
          },
        ],
        similarExample: {
          title: 'Exemplo parecido: montar etiqueta de nível do herói',
          explanation: 'Veja como calculamos o novo nível usando `let` e devolvemos uma frase formatada com nome e número:',
          codeByLanguage: {
            javascript: `function criarResumoNivel(heroi, nivelAtual, subiu) {\n  let novoNivel = nivelAtual;\n  novoNivel = novoNivel + subiu;\n  return \`\${heroi} - Nível \${novoNivel}\`;\n}`,
            python: `def criarResumoNivel(heroi, nivel_atual, subiu):\n    novo_nivel = nivel_atual + subiu\n    return f"{heroi} - Nível {novo_nivel}"`,
            java: `public class Solucao {\n    public static String criarResumoNivel(String heroi, int nivelAtual, int subiu) {\n        int novoNivel = nivelAtual + subiu;\n        return heroi + " - Nível " + novoNivel;\n    }\n}`,
            csharp: `public static class Solucao\n{\n    public static string CriarResumoNivel(string heroi, int nivelAtual, int subiu)\n    {\n        int novoNivel = nivelAtual + subiu;\n        return $"{heroi} - Nível {novoNivel}";\n    }\n}`,
            cpp: `#include <string>\n\nstd::string criarResumoNivel(const std::string& heroi, int nivelAtual, int subiu) {\n    int novoNivel = nivelAtual + subiu;\n    return heroi + " - Nível " + std::to_string(novoNivel);\n}`,
          },
        },
        progressiveHints: [
          'Primeiro some `pontosIniciais` com `bonus` e guarde em uma variável (ex: `total`). Depois junte o `nome`, dois-pontos com espaço `": "`, o `total` e `" pontos"`.',
          'Linha 1: `let total = pontosIniciais + bonus;`\nLinha 2: `const etiqueta = nome + ": " + total + " pontos";` (atenção aos espaços depois de `:` e antes de `pontos`!)\nLinha 3: `return etiqueta;`',
          `function criarEtiquetaJogador(nome, pontosIniciais, bonus) {\n  let total = ___ + ___;\n  const etiqueta = ___ + ": " + ___ + " pontos";\n  return ___;\n}`,
        ],
        progressiveHintTemplateByLanguage: {
          python: `def criarEtiquetaJogador(nome, pontos_iniciais, bonus):\n    total = ___ + ___\n    etiqueta = f"{___}: {___} pontos"\n    return ___`,
          java: `public class Solucao {\n    public static String criarEtiquetaJogador(String nome, int pontosIniciais, int bonus) {\n        int total = ___ + ___;\n        String etiqueta = ___ + ": " + ___ + " pontos";\n        return ___;\n    }\n}`,
          csharp: `public static class Solucao\n{\n    public static string CriarEtiquetaJogador(string nome, int pontosIniciais, int bonus)\n    {\n        int total = ___ + ___;\n        string etiqueta = $"{___}: {___} pontos";\n        return ___;\n    }\n}`,
          cpp: `#include <string>\n\nstd::string criarEtiquetaJogador(const std::string& nome, int pontosIniciais, int bonus) {\n    int total = ___ + ___;\n    std::string etiqueta = ___ + ": " + std::to_string(___) + " pontos";\n    return ___;\n}`,
        },
        trackContext: {
          explorador: 'Mostrar textos com dados reais (como nome + pontuação) é a base de todas as telas que você usa no celular e no computador.',
          jogos: 'O placar no topo da tela junta o apelido do jogador com o total de pontos atualizados.',
          web: 'Saudar um usuário com "Olá, Marina — 3 mensagens" usa exatamente essa combinação de texto e número.',
          dados: 'Relatórios automáticos montam resumos legíveis combinando o nome da métrica com o número calculado.',
          sistemas: 'Mensagens de status e etiquetas de identificação juntam texto fixo com números dinâmicos.',
        },
        conceptQuiz: {
          question: 'Qual é a diferença principal entre `const` e `let`?',
          options: [
            '`const` só guarda textos e `let` só guarda números.',
            '`const` guarda um valor que não vamos trocar; `let` permite atualizar o valor depois.',
            'Não existe diferença nenhuma entre os dois.',
          ],
          correctIndex: 1,
          explanation: 'Perfeito! Começamos usando `const` por padrão e escolhemos `let` quando precisamos mudar o valor da variável ao longo do código.',
        },
        challenge: {
          prompt: 'Implemente `criarEtiquetaJogador(nome, pontosIniciais, bonus)`.\nSome `pontosIniciais + bonus` e devolva um texto exatamente no formato:\n`"Nome: Total pontos"`\n\nExemplo: se `nome = "Lucas"`, `pontosIniciais = 100` e `bonus = 50`, o retorno deve ser `"Lucas: 150 pontos"`.',
          functionName: 'criarEtiquetaJogador',
          starterCode: `function criarEtiquetaJogador(nome, pontosIniciais, bonus) {
  // Passo 1: Crie uma variável (let ou const) "total" somando pontosIniciais + bonus
  
  // Passo 2: Monte o texto no formato: nome + ": " + total + " pontos"
  
  // Passo 3: Devolva (return) o texto pronto
  
}`,
          edgeCasesToWatch: [
            'Preste atenção nos espaços exatos: ": " (dois-pontos e espaço) e " pontos" (espaço antes da palavra pontos).',
            'Se o bônus for 0, o total continua sendo pontosIniciais (ex: "Ana: 80 pontos").',
          ],
          testCases: [
            { id: 't1', label: 'Jogador com bônus', input: ['Lucas', 100, 50], expected: 'Lucas: 150 pontos' },
            { id: 't2', label: 'Jogadora sem bônus (0)', input: ['Ana', 80, 0], expected: 'Ana: 80 pontos', isEdgeCase: true },
            { id: 't3', label: 'Começando do zero', input: ['Rafa', 0, 25], expected: 'Rafa: 25 pontos', isEdgeCase: true },
          ],
        },
      },
      {
        id: 'm1-b3',
        moduleId: 'mod-1',
        order: 3,
        title: 'Sua Primeira Decisão com if e else',
        summary: 'Ensine o computador a escolher entre dois caminhos usando `if` ("se") e `else` ("senão").',
        estimatedMinutes: 7,
        xpReward: 100,
        universityTag: 'Decisões com if / else',
        difficultyTag: 'Fácil → Médio',
        theoryBlocks: [
          {
            heading: 'Como o computador toma decisões?',
            body: 'Na vida real você pensa: "SE eu tiver dinheiro suficiente, EU compro o lanche; SENÃO, eu guardo para depois." Em código, escrevemos exatamente isso usando `if` (se) e `else` (senão)!',
            codeExample: `if (energia >= 10) {\n  return "Pode correr";\n} else {\n  return "Precisa descansar";\n}`,
          },
          {
            heading: 'Sinais de comparação mais usados',
            body: 'Dentro dos parênteses do `if`, fazemos uma pergunta que só pode ser verdadeira ou falsa:\n• `>=` significa "maior ou igual a"\n• `>` significa "maior que"\n• `<` significa "menor que"\n• `===` significa "exatamente igual a"',
            codeExample: `100 >= 100 // verdadeiro! (100 é igual a 100)\n80 >= 100  // falso! (80 é menor que 100)`,
          },
        ],
        similarExample: {
          title: 'Exemplo parecido: verificar idade para entrar em um evento',
          explanation: 'Veja como o `if` testa se a idade é maior ou igual ao mínimo exigido e devolve um texto diferente para cada caso:',
          codeByLanguage: {
            javascript: `function verificarEntrada(idade, idadeMinima) {\n  if (idade >= idadeMinima) {\n    return "Entrada permitida";\n  } else {\n    return "Entrada bloqueada";\n  }\n}`,
            python: `def verificarEntrada(idade, idade_minima):\n    if idade >= idade_minima:\n        return "Entrada permitida"\n    else:\n        return "Entrada bloqueada"`,
            java: `public class Solucao {\n    public static String verificarEntrada(int idade, int idadeMinima) {\n        if (idade >= idadeMinima) {\n            return "Entrada permitida";\n        } else {\n            return "Entrada bloqueada";\n        }\n    }\n}`,
            csharp: `public static class Solucao\n{\n    public static string VerificarEntrada(int idade, int idadeMinima)\n    {\n        if (idade >= idadeMinima)\n        {\n            return "Entrada permitida";\n        }\n        else\n        {\n            return "Entrada bloqueada";\n        }\n    }\n}`,
            cpp: `#include <string>\n\nstd::string verificarEntrada(int idade, int idadeMinima) {\n    if (idade >= idadeMinima) {\n        return "Entrada permitida";\n    } else {\n        return "Entrada bloqueada";\n    }\n}`,
          },
        },
        progressiveHints: [
          'Faça uma pergunta simples: quando o jogador consegue comprar? Quando `moedasDoJogador` for maior OU igual (`>=`) a `precoDoItem`!',
          'Passo 1: escreva `if (moedasDoJogador >= precoDoItem) { return "Compra liberada"; }`\nPasso 2: logo depois, escreva `else { return "Moedas insuficientes"; }` — confira se as letras maiúsculas estão iguais ao enunciado.',
          `function podeComprarItem(moedasDoJogador, precoDoItem) {\n  if (___ >= ___) {\n    return "Compra liberada";\n  } else {\n    return "___";\n  }\n}`,
        ],
        progressiveHintTemplateByLanguage: {
          python: `def podeComprarItem(moedas_do_jogador, preco_do_item):\n    if ___ >= ___:\n        return "Compra liberada"\n    else:\n        return "___"`,
          java: `public class Solucao {\n    public static String podeComprarItem(int moedasDoJogador, int precoDoItem) {\n        if (___ >= ___) {\n            return "Compra liberada";\n        } else {\n            return "___";\n        }\n    }\n}`,
          csharp: `public static class Solucao\n{\n    public static string PodeComprarItem(int moedasDoJogador, int precoDoItem)\n    {\n        if (___ >= ___)\n        {\n            return "Compra liberada";\n        }\n        else\n        {\n            return "___";\n        }\n    }\n}`,
          cpp: `#include <string>\n\nstd::string podeComprarItem(int moedasDoJogador, int precoDoItem) {\n    if (___ >= ___) {\n        return "Compra liberada";\n    } else {\n        return "___";\n    }\n}`,
        },
        trackContext: {
          explorador: 'Quase toda regra inteligente de um aplicativo é feita com `if` e `else` escolhendo o que fazer em cada situação.',
          jogos: 'A loja dentro do jogo sempre checa se você tem moedas suficientes antes de liberar uma espada ou skin.',
          web: 'Quando você faz um pagamento ou tenta acessar uma área VIP, o sistema decide com `if/else` se libera ou bloqueia.',
          dados: 'Separar resultados em "Acima da meta" ou "Abaixo da meta" começa com uma decisão simples de `if/else`.',
          sistemas: 'Permissões de usuário e avisos de bateria fraca são construídos exatamente com decisões `if/else`.',
        },
        conceptQuiz: {
          question: 'Se um item custa 100 moedas e você tem exatamente 100 moedas, qual operador permite comprar?',
          options: [
            '`>` (maior que)',
            '`>=` (maior ou igual a)',
            '`<` (menor que)',
          ],
          correctIndex: 1,
          explanation: 'Na mosca! Com `>=`, 100 é maior ou igual a 100, então a compra é liberada mesmo com o valor exato.',
        },
        challenge: {
          prompt: 'Complete a função `podeComprarItem(moedasDoJogador, precoDoItem)`.\n• Se `moedasDoJogador` for maior ou igual (`>=`) a `precoDoItem`, devolva `"Compra liberada"`.\n• Caso contrário (`else`), devolva `"Moedas insuficientes"`.',
          functionName: 'podeComprarItem',
          starterCode: `function podeComprarItem(moedasDoJogador, precoDoItem) {
  // Passo 1: Use if para verificar se moedasDoJogador >= precoDoItem
  //   Se sim, devolva "Compra liberada"
  
  // Passo 2: Use else para devolver "Moedas insuficientes"
  
}`,
          edgeCasesToWatch: [
            'Se tiver o valor exato (ex: 50 moedas para item de 50), deve liberar a compra ("Compra liberada").',
            'Se faltar apenas 1 moeda (ex: 49 para item de 50), deve retornar "Moedas insuficientes".',
            'Respeite letras maiúsculas e minúsculas exatamente como pedido.',
          ],
          testCases: [
            { id: 't1', label: 'Sobram moedas', input: [200, 120], expected: 'Compra liberada' },
            { id: 't2', label: 'Valor exato na conta', input: [50, 50], expected: 'Compra liberada', isEdgeCase: true },
            { id: 't3', label: 'Faltam moedas', input: [30, 100], expected: 'Moedas insuficientes' },
            { id: 't4', label: 'Faltando apenas 1 moeda', input: [49, 50], expected: 'Moedas insuficientes', isEdgeCase: true },
          ],
        },
      },
      {
        id: 'm1-l1',
        moduleId: 'mod-1',
        order: 4,
        title: 'Protegendo Limites: Mínimo 0 e Máximo',
        summary: 'Combine soma + `if` para impedir que a vida de um personagem fique negativa ou ultrapasse o limite máximo.',
        estimatedMinutes: 8,
        xpReward: 110,
        universityTag: 'Limites Seguros (Mínimo e Máximo)',
        difficultyTag: 'Médio',
        theoryBlocks: [
          {
            heading: 'Por que precisamos travar valores mínimos e máximos?',
            body: 'Imagine um personagem com 20 de vida que leva 50 de dano. Na conta pura, `20 + (-50)` dá `-30`. Mas no jogo a vida deve parar em `0`! Do mesmo jeito, se ele tem 90 de vida e ganha +40 de cura, a vida deve parar no máximo (ex: `100`).',
            codeExample: `let novaVida = vidaAtual + mudanca;\nif (novaVida < 0) {\n  return 0;\n}\nif (novaVida > vidaMaxima) {\n  return vidaMaxima;\n}\nreturn novaVida;`,
          },
          {
            heading: 'Dica: um jeito ainda mais curto (opcional)',
            body: 'Depois que você entender o jeito com `if`, saiba que também existe um atalho pronto chamado `Math.max` e `Math.min` — mas usar dois `if` simples já resolve 100% e fica super claro de ler!',
            codeExample: `const resultadoSeguro = Math.max(0, Math.min(100, novaVida));`,
          },
        ],
        similarExample: {
          title: 'Exemplo parecido: ajustar o volume de uma caixa de som',
          explanation: 'O volume não pode ficar abaixo de 0 nem passar do `volumeMaximo`. Veja como fica limpo com 2 verificações `if`:',
          codeByLanguage: {
            javascript: `function ajustarVolume(volumeAtual, mudanca, volumeMaximo) {\n  const novoVolume = volumeAtual + mudanca;\n  if (novoVolume < 0) return 0;\n  if (novoVolume > volumeMaximo) return volumeMaximo;\n  return novoVolume;\n}`,
            python: `def ajustarVolume(volume_atual, mudanca, volume_maximo):\n    novo_volume = volume_atual + mudanca\n    if novo_volume < 0:\n        return 0\n    if novo_volume > volume_maximo:\n        return volume_maximo\n    return novo_volume`,
            java: `public class Solucao {\n    public static double ajustarVolume(double volumeAtual, double mudanca, double volumeMaximo) {\n        double novoVolume = volumeAtual + mudanca;\n        if (novoVolume < 0) return 0;\n        if (novoVolume > volumeMaximo) return volumeMaximo;\n        return novoVolume;\n    }\n}`,
            csharp: `public static class Solucao\n{\n    public static double AjustarVolume(double volumeAtual, double mudanca, double volumeMaximo)\n    {\n        double novoVolume = volumeAtual + mudanca;\n        if (novoVolume < 0) return 0;\n        if (novoVolume > volumeMaximo) return volumeMaximo;\n        return novoVolume;\n    }\n}`,
            cpp: `double ajustarVolume(double volumeAtual, double mudanca, double volumeMaximo) {\n    double novoVolume = volumeAtual + mudanca;\n    if (novoVolume < 0) return 0;\n    if (novoVolume > volumeMaximo) return volumeMaximo;\n    return novoVolume;\n}`,
          },
        },
        progressiveHints: [
          'Primeiro calcule o resultado normal: `const novoValor = valorAtual + delta;`. Depois pense: o que fazer se `novoValor` ficou menor que `0`? E se passou de `limiteMaximo`?',
          'Passo 1: `const novoValor = valorAtual + delta;`\nPasso 2: `if (novoValor < 0) return 0;`\nPasso 3: `if (novoValor > limiteMaximo) return limiteMaximo;`\nPasso 4: `return novoValor;`',
          `function aplicarVariacao(valorAtual, delta, limiteMaximo) {\n  const novoValor = ___ + ___;\n  if (novoValor < 0) return ___;\n  if (novoValor > ___) return ___;\n  return ___;\n}`,
        ],
        progressiveHintTemplateByLanguage: {
          python: `def aplicarVariacao(valor_atual, delta, limite_maximo):\n    novo_valor = ___ + ___\n    if novo_valor < 0:\n        return ___\n    if novo_valor > ___:\n        return ___\n    return ___`,
          java: `public class Solucao {\n    public static double aplicarVariacao(double valorAtual, double delta, double limiteMaximo) {\n        double novoValor = ___ + ___;\n        if (novoValor < 0) return ___;\n        if (novoValor > ___) return ___;\n        return ___;\n    }\n}`,
          csharp: `public static class Solucao\n{\n    public static double AplicarVariacao(double valorAtual, double delta, double limiteMaximo)\n    {\n        double novoValor = ___ + ___;\n        if (novoValor < 0) return ___;\n        if (novoValor > ___) return ___;\n        return ___;\n    }\n}`,
          cpp: `double aplicarVariacao(double valorAtual, double delta, double limiteMaximo) {\n    double novoValor = ___ + ___;\n    if (novoValor < 0) return ___;\n    if (novoValor > ___) return ___;\n    return ___;\n}`,
        },
        trackContext: {
          explorador: 'Travar valores entre um mínimo e um máximo evita bugs clássicos em barras de vida, brilho de tela e saldo de créditos.',
          jogos: 'Quando um personagem leva muito dano, a vida trava em 0; quando bebe uma poção forte, a vida trava no HP máximo.',
          web: 'Em um plano com créditos mensais, o saldo nunca pode ficar abaixo de 0 nem passar do limite do plano.',
          dados: 'Quando medimos uma nota ou porcentagem, garantir que fique entre 0 e o teto máximo evita números absurdos no gráfico.',
          sistemas: 'Controles de volume, bateria (0% a 100%) e limites de uso sempre aplicam travas de mínimo e máximo.',
        },
        conceptQuiz: {
          question: 'Se um personagem tem 20 de vida, leva -50 de dano e o limite mínimo é 0, o que a função deve devolver?',
          options: ['-30', '0', '20'],
          correctIndex: 1,
          explanation: 'Certo! Mesmo que `20 + (-50)` dê `-30`, nossa regra trava o valor em `0` para nunca ficar negativo.',
        },
        challenge: {
          prompt: 'Implemente `aplicarVariacao(valorAtual, delta, limiteMaximo)`.\nEla soma `valorAtual + delta` (o `delta` pode ser positivo para ganhar ou negativo para perder), mas garante duas regras:\n• Se o resultado for menor que `0`, devolva `0`.\n• Se o resultado for maior que `limiteMaximo`, devolva `limiteMaximo`.',
          functionName: 'aplicarVariacao',
          starterCode: `function aplicarVariacao(valorAtual, delta, limiteMaximo) {
  // Passo 1: Crie uma variável "novoValor" com valorAtual + delta
  
  // Passo 2: Se novoValor for menor que 0, devolva 0
  
  // Passo 3: Se novoValor for maior que limiteMaximo, devolva limiteMaximo
  
  // Passo 4: Caso contrário, devolva novoValor
  
}`,
          edgeCasesToWatch: [
            'Delta negativo maior que valorAtual deve retornar 0, nunca número negativo.',
            'Soma acima de limiteMaximo deve retornar exatamente limiteMaximo.',
            'Se limiteMaximo for 0, o resultado nunca pode passar de 0.',
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
    ],
  },
  {
    id: 'mod-2',
    number: '02',
    title: 'Contas Úteis & Condições Compostas',
    subtitle: 'Resto da divisão (%), várias regras com if/else if na ordem certa e lógica com coordenadas.',
    universityEquivalent: 'Lógica para Computação (1º Semestre)',
    lessons: [
      {
        id: 'm1-l2',
        moduleId: 'mod-2',
        order: 5,
        title: 'Divisão Inteira, Resto (%) e Cronômetro',
        summary: 'Transforme segundos em minutos e segundos (`MM:SS`) usando divisão inteira e o operador resto (`%`).',
        estimatedMinutes: 9,
        xpReward: 115,
        universityTag: 'Aritmética Modular',
        difficultyTag: 'Médio',
        theoryBlocks: [
          {
            heading: 'O operador % (resto da divisão)',
            body: 'Quando você divide 135 segundos por 60, cabem 2 minutos inteiros (120 segundos) e sobram 15 segundos. Em código, `Math.floor(135 / 60)` dá `2` e `135 % 60` dá o resto `15`!',
            codeExample: `const totalSegundos = 135;\nconst minutos = Math.floor(totalSegundos / 60); // 2\nconst segundos = totalSegundos % 60;            // 15`,
          },
          {
            heading: 'Colocando o zero na frente ("02:05")',
            body: 'Para transformar `5` em `"05"`, convertemos o número para texto com `String(5)` e usamos `.padStart(2, "0")`, que completa com `"0"` à esquerda até ter 2 dígitos.',
            codeExample: `const mm = String(minutos).padStart(2, "0");  // "02"\nconst ss = String(segundos).padStart(2, "0"); // "15"\nconst texto = \`\${mm}:\${ss}\`; // "02:15"`,
          },
        ],
        similarExample: {
          title: 'Exemplo parecido: converter minutos em "HHh MMm"',
          explanation: 'Veja como dividir por 60 e pegar o resto com `%` para separar horas e minutos:',
          codeByLanguage: {
            javascript: `function formatarHoras(totalMinutos) {\n  if (totalMinutos < 0) return "00h 00m";\n  const horas = Math.floor(totalMinutos / 60);\n  const mins = totalMinutos % 60;\n  const hh = String(horas).padStart(2, "0");\n  const mm = String(mins).padStart(2, "0");\n  return \`\${hh}h \${mm}m\`;\n}`,
            python: `def formatarHoras(total_minutos):\n    if total_minutos < 0:\n        return "00h 00m"\n    horas = total_minutos // 60\n    mins = total_minutos % 60\n    return f"{horas:02d}h {mins:02d}m"`,
            java: `public class Solucao {\n    public static String formatarHoras(int totalMinutos) {\n        if (totalMinutos < 0) return "00h 00m";\n        int horas = totalMinutos / 60;\n        int mins = totalMinutos % 60;\n        return String.format("%02dh %02dm", horas, mins);\n    }\n}`,
            csharp: `public static class Solucao\n{\n    public static string FormatarHoras(int totalMinutos)\n    {\n        if (totalMinutos < 0) return "00h 00m";\n        int horas = totalMinutos / 60;\n        int mins = totalMinutos % 60;\n        return $"{horas:D2}h {mins:D2}m";\n    }\n}`,
            cpp: `#include <string>\n\nstd::string formatarHoras(int totalMinutos) {\n    if (totalMinutos < 0) return "00h 00m";\n    int horas = totalMinutos / 60;\n    int mins = totalMinutos % 60;\n    std::string hh = (horas < 10 ? "0" : "") + std::to_string(horas);\n    std::string mm = (mins < 10 ? "0" : "") + std::to_string(mins);\n    return hh + "h " + mm + "m";\n}`,
          },
        },
        progressiveHints: [
          'Primeiro proteja números inválidos ou negativos devolvendo `"00:00"`. Depois pense em como separar os minutos inteiros (`/ 60`) dos segundos que sobraram (`% 60`).',
          'Passo 1: `if (!Number.isFinite(totalSegundos) || totalSegundos < 0) return "00:00";`\nPasso 2: `const minutos = Math.floor(totalSegundos / 60);` e `const segundos = totalSegundos % 60;`\nPasso 3: Use `String(...).padStart(2, "0")` nos dois e devolva `` `${mm}:${ss}` ``.',
          `function formatarCronometro(totalSegundos) {\n  if (!Number.isFinite(totalSegundos) || totalSegundos < 0) return "00:00";\n  const minutos = Math.floor(___ / 60);\n  const segundos = ___ % 60;\n  const mm = String(minutos).padStart(2, "0");\n  const ss = String(segundos).padStart(2, "0");\n  return \`\${mm}:\${ss}\`;\n}`,
        ],
        progressiveHintTemplateByLanguage: {
          python: `def formatarCronometro(total_segundos):\n    if total_segundos < 0:\n        return "00:00"\n    minutos = ___ // 60\n    segundos = ___ % 60\n    return f"{minutos:02d}:{segundos:02d}"`,
          java: `public class Solucao {\n    public static String formatarCronometro(int totalSegundos) {\n        if (totalSegundos < 0) return "00:00";\n        int minutos = ___ / 60;\n        int segundos = ___ % 60;\n        return String.format("%02d:%02d", minutos, segundos);\n    }\n}`,
          csharp: `public static class Solucao\n{\n    public static string FormatarCronometro(int totalSegundos)\n    {\n        if (totalSegundos < 0) return "00:00";\n        int minutos = ___ / 60;\n        int segundos = ___ % 60;\n        return $"{minutos:D2}:{segundos:D2}";\n    }\n}`,
          cpp: `#include <string>\n\nstd::string formatarCronometro(int totalSegundos) {\n    if (totalSegundos < 0) return "00:00";\n    int minutos = ___ / 60;\n    int segundos = ___ % 60;\n    std::string mm = (minutos < 10 ? "0" : "") + std::to_string(minutos);\n    std::string ss = (segundos < 10 ? "0" : "") + std::to_string(segundos);\n    return mm + ":" + ss;\n}`,
        },
        trackContext: {
          explorador: 'Você vai transformar um total de segundos em formato cronômetro `MM:SS`, cuidando também de entradas negativas.',
          jogos: 'Todo cronômetro de partida, recarga de habilidade (cooldown) ou speedrun converte segundos em `MM:SS`.',
          web: 'Players de vídeo, música e temporizadores de pagamento Pix convertem segundos em texto legível.',
          dados: 'Relatórios de duração de chamadas ou vídeos sempre formatam segundos brutos em minutos e segundos.',
          sistemas: 'Contadores de tempo ligado (uptime) e benchmarks dependem de divisão inteira e resto `%`.',
        },
        conceptQuiz: {
          question: 'Qual é o resultado de `125 % 60` (o resto da divisão de 125 por 60)?',
          options: ['2', '5', '2.08'],
          correctIndex: 1,
          explanation: 'Exato! 60 cabe 2 vezes em 125 (dá 120), sobrando exatamente 5 de resto.',
        },
        challenge: {
          prompt: 'Implemente `formatarCronometro(totalSegundos)` que recebe um número inteiro de segundos e retorna uma string no formato `"MM:SS"` com dois dígitos mínimos nos minutos e dois dígitos nos segundos. Se `totalSegundos` for negativo ou inválido, retorne `"00:00"`.',
          functionName: 'formatarCronometro',
          starterCode: `function formatarCronometro(totalSegundos) {
  // Passo 1: Se totalSegundos for negativo ou não finito, retorne "00:00"
  
  // Passo 2: Calcule minutos inteiros (Math.floor) e segundos restantes (%)
  
  // Passo 3: Formate com 2 dígitos usando padStart e retorne "MM:SS"
  
}`,
          edgeCasesToWatch: [
            'Segundos negativos (ex: -10) devem retornar "00:00".',
            'Zero segundos deve retornar "00:00".',
            'Valores acima de 1 hora (ex: 3665s -> "61:05") devem manter todos os minutos.',
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
      {
        id: 'm2-l1',
        moduleId: 'mod-2',
        order: 6,
        title: 'Operadores Lógicos e Regras na Ordem Certa',
        summary: 'Combine condições com E (`&&`) / OU (`||`) e verifique regras prioritárias primeiro para evitar código confuso.',
        estimatedMinutes: 10,
        xpReward: 120,
        universityTag: 'Álgebra Booleana & Guard Clauses',
        difficultyTag: 'Médio',
        theoryBlocks: [
          {
            heading: 'Combinando perguntas com && (E) e || (OU)',
            body: 'Às vezes precisamos checar mais de uma condição ao mesmo tempo. Use `||` quando basta UMA condição ser verdadeira (ex: `nota < 0 || nota > 10`) e `&&` quando TODAS precisam ser verdadeiras.',
            codeExample: `if (nota < 0 || nota > 10) {\n  return "dados_invalidos";\n}`,
          },
          {
            heading: 'Verifique os bloqueios primeiro (Cláusulas de Guarda)',
            body: 'Em vez de colocar vários `if` dentro de outros `if`, cheque primeiro o que invalida ou reprova direto e já faça `return`. Assim o resto do código fica limpo, reto e fácil de ler!',
            codeExample: `if (nota < 0 || nota > 10) return "dados_invalidos";\nif (frequencia < 75) return "reprovado_falta";`,
          },
        ],
        similarExample: {
          title: 'Exemplo parecido: classificar pedido de empréstimo',
          explanation: 'Repare na ordem: primeiro validamos erro de entrada, depois a regra que reprova direto, e só por último aprovamos:',
          codeByLanguage: {
            javascript: `function avaliarCredito(score, idade) {\n  if (score < 0 || idade < 0) return "invalido";\n  if (idade < 18) return "negado_idade";\n  if (score >= 700) return "aprovado";\n  return "em_analise";\n}`,
            python: `def avaliarCredito(score, idade):\n    if score < 0 or idade < 0:\n        return "invalido"\n    if idade < 18:\n        return "negado_idade"\n    if score >= 700:\n        return "aprovado"\n    return "em_analise"`,
            java: `public class Solucao {\n    public static String avaliarCredito(int score, int idade) {\n        if (score < 0 || idade < 0) return "invalido";\n        if (idade < 18) return "negado_idade";\n        if (score >= 700) return "aprovado";\n        return "em_analise";\n    }\n}`,
            csharp: `public static class Solucao\n{\n    public static string AvaliarCredito(int score, int idade)\n    {\n        if (score < 0 || idade < 0) return "invalido";\n        if (idade < 18) return "negado_idade";\n        if (score >= 700) return "aprovado";\n        return "em_analise";\n    }\n}`,
            cpp: `#include <string>\n\nstd::string avaliarCredito(int score, int idade) {\n    if (score < 0 || idade < 0) return "invalido";\n    if (idade < 18) return "negado_idade";\n    if (score >= 700) return "aprovado";\n    return "em_analise";\n}`,
          },
        },
        progressiveHints: [
          'Siga exatamente a ordem numerada do enunciado (1 → 2 → 3 → 4 → 5). Se você testar `nota >= 7` antes de `frequencia < 75`, quem tirou 10 mas faltou demais passaria errado!',
          'Escreva um `if` por regra com `return` imediato:\n1) `nota < 0 || nota > 10 || frequencia < 0 || frequencia > 100` -> `"dados_invalidos"`\n2) `frequencia < 75` -> `"reprovado_falta"`\n3) `nota >= 7` -> `"aprovado"`\n4) `nota >= 5` -> `"recuperacao"`\n5) No final, `return "reprovado_nota";`',
          `function avaliarAprovacao(nota, frequencia) {\n  if (nota < 0 || nota > 10 || frequencia < 0 || frequencia > 100) return "dados_invalidos";\n  if (___ < 75) return "reprovado_falta";\n  if (___ >= 7) return "aprovado";\n  if (___ >= 5) return "recuperacao";\n  return "___";\n}`,
        ],
        progressiveHintTemplateByLanguage: {
          python: `def avaliarAprovacao(nota, frequencia):\n    if nota < 0 or nota > 10 or frequencia < 0 or frequencia > 100:\n        return "dados_invalidos"\n    if ___ < 75:\n        return "reprovado_falta"\n    if ___ >= 7:\n        return "aprovado"\n    if ___ >= 5:\n        return "recuperacao"\n    return "___"`,
        },
        trackContext: {
          explorador: 'Você vai construir um motor de decisão com várias regras e prioridades — exatamente como sistemas reais avaliam aprovações.',
          jogos: 'Desbloquear fases e conquistas combina várias condições: nível mínimo, chefe derrotado e energia suficiente.',
          web: 'Regras de cadastro, permissões de conta e validação de cupons usam exatamente essa ordem de verificações.',
          dados: 'Classificadores baseados em regras filtram dados inválidos antes de separar cada categoria.',
          sistemas: 'Regras de acesso e segurança exigem ordem clara de checagem para nunca deixar brechas.',
        },
        conceptQuiz: {
          question: 'Se `a = true`, `b = false` e `c = true`, qual o valor de `a && (b || !c)`?',
          options: ['true', 'false', 'undefined'],
          correctIndex: 1,
          explanation: 'Correto! `!c` vira `false`, então `(false || false)` é `false`. Por fim, `true && false` resulta em `false`.',
        },
        challenge: {
          prompt: 'Implemente `avaliarAprovacao(nota, frequencia)` seguindo estas regras na ordem exata:\n1. Se `nota < 0 || nota > 10 || frequencia < 0 || frequencia > 100`, retorne `"dados_invalidos"`.\n2. Se `frequencia < 75`, retorne `"reprovado_falta"` (mesmo com nota alta!).\n3. Se `nota >= 7`, retorne `"aprovado"`.\n4. Se `nota >= 5`, retorne `"recuperacao"`.\n5. Caso contrário, retorne `"reprovado_nota"`.',
          functionName: 'avaliarAprovacao',
          starterCode: `function avaliarAprovacao(nota, frequencia) {
  // Passo 1: Valide se nota ou frequencia estão fora da faixa permitida
  
  // Passo 2: Verifique se frequencia < 75
  
  // Passo 3: Verifique nota >= 7, depois nota >= 5, e por fim reprovado_nota
  
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
        order: 7,
        title: 'Detecção de Colisão & Intervalos 2D',
        summary: 'Use lógica booleana com coordenadas `(x, y)` para descobrir se dois retângulos encostam ou se sobrepõem.',
        estimatedMinutes: 11,
        xpReward: 130,
        universityTag: 'Geometria Computacional Básica',
        difficultyTag: 'Intermediário',
        theoryBlocks: [
          {
            heading: 'Como descobrir se duas caixas se sobrepõem (AABB)',
            body: 'Cada retângulo tem uma posição `(x, y)` e um tamanho (`largura`, `altura`). Eles só colidem se houver invasão ao mesmo tempo na horizontal (eixo X) E na vertical (eixo Y).',
            codeExample: `const sobrepoeX = a.x < b.x + b.largura && a.x + a.largura > b.x;\nconst sobrepoeY = a.y < b.y + b.altura && a.y + a.altura > b.y;\nconst colidiu = sobrepoeX && sobrepoeY;`,
          },
        ],
        similarExample: {
          title: 'Exemplo parecido: checar se dois horários se cruzam (1D)',
          explanation: 'Em 1 dimensão (como dois eventos na agenda), dois intervalos `[inicioA, fimA]` e `[inicioB, fimB]` se cruzam quando:',
          codeByLanguage: {
            javascript: `function horariosConflitam(inicioA, fimA, inicioB, fimB) {\n  if (fimA <= inicioA || fimB <= inicioB) return false;\n  return inicioA < fimB && fimA > inicioB;\n}`,
            python: `def horariosConflitam(inicio_a, fim_a, inicio_b, fim_b):\n    if fim_a <= inicio_a or fim_b <= inicio_b:\n        return False\n    return inicio_a < fim_b and fim_a > inicio_b`,
            java: `public class Solucao {\n    public static boolean horariosConflitam(int inicioA, int fimA, int inicioB, int fimB) {\n        if (fimA <= inicioA || fimB <= inicioB) return false;\n        return inicioA < fimB && fimA > inicioB;\n    }\n}`,
            csharp: `public static class Solucao\n{\n    public static bool HorariosConflitam(int inicioA, int fimA, int inicioB, int fimB)\n    {\n        if (fimA <= inicioA || fimB <= inicioB) return false;\n        return inicioA < fimB && fimA > inicioB;\n    }\n}`,
            cpp: `bool horariosConflitam(int inicioA, int fimA, int inicioB, int fimB) {\n    if (fimA <= inicioA || fimB <= inicioB) return false;\n    return inicioA < fimB && fimA > inicioB;\n}`,
          },
        },
        progressiveHints: [
          'Primeiro garanta que `a` e `b` têm `largura > 0` e `altura > 0` (se algum for `<= 0`, já retorne `false`). Depois compare os eixos X e Y separadamente.',
          'Crie `sobrepoeX = a.x < b.x + b.largura && a.x + a.largura > b.x` e faça o mesmo para `y` e `altura` em `sobrepoeY`. Por fim retorne `sobrepoeX && sobrepoeY`.',
          `function verificarColisaoAABB(a, b) {\n  if (a.largura <= 0 || a.altura <= 0 || b.largura <= 0 || b.altura <= 0) return false;\n  const sobrepoeX = a.x < b.x + b.largura && a.x + a.largura > b.x;\n  const sobrepoeY = a.y < ___ + ___ && a.y + ___ > ___;\n  return sobrepoeX && sobrepoeY;\n}`,
        ],
        progressiveHintTemplateByLanguage: {
          python: `def verificarColisaoAABB(a, b):\n    if a["largura"] <= 0 or a["altura"] <= 0 or b["largura"] <= 0 or b["altura"] <= 0:\n        return False\n    sobrepoe_x = a["x"] < b["x"] + b["largura"] and a["x"] + a["largura"] > b["x"]\n    sobrepoe_y = a["y"] < ___ and ___ > b["y"]\n    return sobrepoe_x and sobrepoe_y`,
        },
        trackContext: {
          explorador: 'Interseção de caixas (AABB) é usada em jogos, interfaces de arrastar-e-soltar e agendas.',
          jogos: 'Esta é a função central de colisão entre hitboxes de personagens, tiros e plataformas em jogos 2D.',
          web: 'Recursos de arrastar-e-soltar (drag & drop) e verificação de horários conflitantes usam essa mesma lógica.',
          dados: 'Filtros em mapas digitais (caixas delimitadoras) usam essa conta para localizar pontos rapidamente.',
          sistemas: 'Verificar sobreposição de faixas de memória ou reservas usa exatamente a mesma fórmula.',
        },
        conceptQuiz: {
          question: 'Se dois retângulos apenas encostam nas bordas (`a.x + a.largura === b.x`), usando `<` e `>` estritos, qual é o resultado?',
          options: [
            'Colisão verdadeira (true).',
            'Colisão falsa (false), pois não há área interna sobreposta.',
            'Erro de execução.',
          ],
          correctIndex: 1,
          explanation: 'Exato! Com `<` e `>`, bordas apenas encostando não contam como invasão de área — evitando que personagens travem nas paredes.',
        },
        challenge: {
          prompt: 'Implemente `verificarColisaoAABB(a, b)` onde `a` e `b` são objetos `{ x, y, largura, altura }`. Retorne `true` se houver sobreposição de área interna entre os retângulos e `false` caso contrário. Se qualquer `largura` ou `altura` for `<= 0`, retorne `false`.',
          functionName: 'verificarColisaoAABB',
          starterCode: `function verificarColisaoAABB(a, b) {
  // Passo 1: Se alguma largura ou altura for <= 0, retorne false
  
  // Passo 2: Verifique sobreposição no eixo X e no eixo Y
  
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
    title: 'Laços de Repetição: for e while',
    subtitle: 'Percorra listas com `for`, use acumuladores seguros e controle repetições com `while` sem loops infinitos.',
    universityEquivalent: 'Algoritmos I — Iteração (1º Semestre)',
    lessons: [
      {
        id: 'm3-l1',
        moduleId: 'mod-3',
        order: 8,
        title: 'Acumuladores e Limpeza de Dados em Laços',
        summary: 'Percorra listas ignorando valores inválidos e calculando a média com segurança (sem dividir por zero).',
        estimatedMinutes: 10,
        xpReward: 130,
        universityTag: 'Iteração & Acumuladores',
        difficultyTag: 'Intermediário',
        theoryBlocks: [
          {
            heading: 'Anatomia de um acumulador seguro',
            body: 'Para calcular uma média, guardamos duas caixinhas com `let`: `soma` (começa em 0) e `validos` (quantos números entraram na conta). Antes de dividir `soma / validos`, sempre conferimos se `validos === 0` para não dividir por zero!',
            codeExample: `let soma = 0;\nlet validos = 0;\nfor (const valor of leituras) {\n  if (valor >= 0) {\n    soma += valor;\n    validos++;\n  }\n}\nconst media = validos === 0 ? 0 : soma / validos;`,
          },
        ],
        similarExample: {
          title: 'Exemplo parecido: somar apenas notas maiores ou iguais a 7',
          explanation: 'Veja como percorrer uma lista com `for`, filtrar o que interessa e acumular o resultado:',
          codeByLanguage: {
            javascript: `function somarNotasBoas(notas) {\n  let soma = 0;\n  for (const nota of notas) {\n    if (nota >= 7) {\n      soma += nota;\n    }\n  }\n  return soma;\n}`,
            python: `def somarNotasBoas(notas):\n    soma = 0\n    for nota in notas:\n        if nota >= 7:\n            soma += nota\n    return soma`,
            java: `public class Solucao {\n    public static double somarNotasBoas(double[] notas) {\n        double soma = 0;\n        for (double nota : notas) {\n            if (nota >= 7) soma += nota;\n        }\n        return soma;\n    }\n}`,
            csharp: `public static class Solucao\n{\n    public static double SomarNotasBoas(double[] notas)\n    {\n        double soma = 0;\n        foreach (double nota in notas)\n        {\n            if (nota >= 7) soma += nota;\n        }\n        return soma;\n    }\n}`,
            cpp: `#include <vector>\n\ndouble somarNotasBoas(const std::vector<double>& notas) {\n    double soma = 0;\n    for (double nota : notas) {\n        if (nota >= 7) soma += nota;\n    }\n    return soma;\n}`,
          },
        },
        progressiveHints: [
          'Crie `let soma = 0;` e `let validos = 0;`. Depois percorra cada número `v` de `valores` e só some se `Number.isFinite(v) && v >= 0`.',
          'Depois do laço `for`: se `validos === 0`, retorne `0`. Caso contrário, calcule `const media = soma / validos;` e devolva `Number(media.toFixed(2))`.',
          `function mediaValoresValidos(valores) {\n  let soma = 0;\n  let validos = 0;\n  for (const v of valores) {\n    if (Number.isFinite(v) && v >= 0) {\n      soma += ___;\n      validos++;\n    }\n  }\n  if (validos === 0) return 0;\n  return Number((___ / ___).toFixed(2));\n}`,
        ],
        progressiveHintTemplateByLanguage: {
          python: `import math\n\ndef mediaValoresValidos(valores):\n    soma = 0\n    validos = 0\n    for v in valores:\n        if math.isfinite(v) and v >= 0:\n            soma += ___\n            validos += 1\n    if validos == 0:\n        return 0\n    return round(___ / ___, 2)`,
        },
        trackContext: {
          explorador: 'Filtrar e somar itens de uma lista é uma das tarefas mais comuns em toda a programação.',
          jogos: 'Calcular a média de FPS ignorando momentos pausados ou somar XP só das missões válidas.',
          web: 'Calcular a nota média de avaliações de um produto ignorando entradas vazias ou corrompidas.',
          dados: 'Limpar números negativos inválidos antes de calcular a média de um conjunto de dados.',
          sistemas: 'Calcular o tempo médio de resposta de requisições bem-sucedidas em um servidor.',
        },
        conceptQuiz: {
          question: 'O que acontece em JavaScript se você dividir `0 / 0` ao tentar calcular a média de uma lista vazia?',
          options: [
            'Retorna 0 automaticamente.',
            'Retorna `NaN` (Not a Number), que pode quebrar contas seguintes.',
            'Fecha o navegador imediatamente.',
          ],
          correctIndex: 1,
          explanation: 'Correto! `0 / 0` produz `NaN`. Por isso sempre verificamos `if (validos === 0) return 0;` antes de dividir.',
        },
        challenge: {
          prompt: 'Implemente `mediaValoresValidos(valores)` que recebe um array de números, ignora todos os valores negativos (`< 0`) ou não finitos (`!Number.isFinite(v)`), e retorna a média aritmética dos valores válidos arredondada para 2 casas decimais (`Number(media.toFixed(2))`). Se o array estiver vazio ou não houver valores válidos, retorne `0`.',
          functionName: 'mediaValoresValidos',
          starterCode: `function mediaValoresValidos(valores) {
  // Passo 1: Inicialize let soma = 0 e let validos = 0
  
  // Passo 2: Percorra "valores" ignorando v < 0 ou !Number.isFinite(v)
  
  // Passo 3: Se validos === 0 retorne 0; senão retorne a média com 2 casas
  
}`,
          edgeCasesToWatch: [
            'Array vazio [] deve retornar 0.',
            'Array apenas com negativos [-5, -10] deve retornar 0.',
            'O valor 0 é válido (>= 0) e DEVE entrar na contagem!',
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
        order: 9,
        title: 'Laço While e Simulação Passo a Passo',
        summary: 'Use `while` quando não sabemos de antemão quantas rodadas vão acontecer e garanta que o laço sempre termine.',
        estimatedMinutes: 12,
        xpReward: 140,
        universityTag: 'Terminação & Invariante de Laço',
        difficultyTag: 'Intermediário',
        theoryBlocks: [
          {
            heading: 'Como evitar que o while rode para sempre (loop infinito)',
            body: 'Um laço `while` repete enquanto uma condição for verdadeira. Para garantir que ele sempre acabe, verifique antes se o progresso real por rodada é positivo — senão, devolva `-1` indicando que é impossível vencer!',
            codeExample: `let passos = 0;\nwhile (atual < meta) {\n  atual += ganhoPorPasso;\n  passos++;\n}`,
          },
        ],
        similarExample: {
          title: 'Exemplo parecido: quantos dias para encher um tanque',
          explanation: 'Primeiro tratamos os casos que impedem o laço de acabar; depois simulamos dia por dia:',
          codeByLanguage: {
            javascript: `function diasParaEncher(faltaLitros, entraDia, vazaNoite) {\n  if (faltaLitros <= 0) return 0;\n  if (entraDia <= 0) return -1;\n  if (entraDia >= faltaLitros) return 1;\n  if (entraDia <= vazaNoite) return -1;\n  let dias = 0;\n  let restante = faltaLitros;\n  while (restante > 0) {\n    dias++;\n    restante -= entraDia;\n    if (restante <= 0) break;\n    restante += vazaNoite;\n  }\n  return dias;\n}`,
            python: `def diasParaEncher(falta_litros, entra_dia, vaza_noite):\n    if falta_litros <= 0:\n        return 0\n    if entra_dia <= 0:\n        return -1\n    if entra_dia >= falta_litros:\n        return 1\n    if entra_dia <= vaza_noite:\n        return -1\n    dias = 0\n    restante = falta_litros\n    while restante > 0:\n        dias += 1\n        restante -= entra_dia\n        if restante <= 0:\n            break\n        restante += vaza_noite\n    return dias`,
            java: `public class Solucao {\n    public static int diasParaEncher(int faltaLitros, int entraDia, int vazaNoite) {\n        if (faltaLitros <= 0) return 0;\n        if (entraDia <= 0) return -1;\n        if (entraDia >= faltaLitros) return 1;\n        if (entraDia <= vazaNoite) return -1;\n        int dias = 0, restante = faltaLitros;\n        while (restante > 0) {\n            dias++;\n            restante -= entraDia;\n            if (restante <= 0) break;\n            restante += vazaNoite;\n        }\n        return dias;\n    }\n}`,
            csharp: `public static class Solucao\n{\n    public static int DiasParaEncher(int faltaLitros, int entraDia, int vazaNoite)\n    {\n        if (faltaLitros <= 0) return 0;\n        if (entraDia <= 0) return -1;\n        if (entraDia >= faltaLitros) return 1;\n        if (entraDia <= vazaNoite) return -1;\n        int dias = 0, restante = faltaLitros;\n        while (restante > 0)\n        {\n            dias++;\n            restante -= entraDia;\n            if (restante <= 0) break;\n            restante += vazaNoite;\n        }\n        return dias;\n    }\n}`,
            cpp: `int diasParaEncher(int faltaLitros, int entraDia, int vazaNoite) {\n    if (faltaLitros <= 0) return 0;\n    if (entraDia <= 0) return -1;\n    if (entraDia >= faltaLitros) return 1;\n    if (entraDia <= vazaNoite) return -1;\n    int dias = 0, restante = faltaLitros;\n    while (restante > 0) {\n        dias++;\n        restante -= entraDia;\n        if (restante <= 0) break;\n        restante += vazaNoite;\n    }\n    return dias;\n}`,
          },
        },
        progressiveHints: [
          'Antes de abrir o `while`, trate os casos rápidos: vida já <= 0 retorna `0`; dano <= 0 retorna `-1`; dano >= vidaChefe vence no turno `1`; senão, se `danoTurno <= regeneracaoTurno`, é impossível vencer (`-1`).',
          'Dentro do `while (vida > 0)`: aumente `turnos++`, subtraia `vida -= danoTurno`, confira `if (vida <= 0) break;` e só depois some `vida += regeneracaoTurno`.',
          `function turnosParaVencer(vidaChefe, danoTurno, regeneracaoTurno) {\n  if (vidaChefe <= 0) return 0;\n  if (danoTurno <= 0) return -1;\n  if (danoTurno >= vidaChefe) return 1;\n  if (danoTurno <= regeneracaoTurno) return -1;\n  let turnos = 0;\n  let vida = vidaChefe;\n  while (vida > 0) {\n    turnos++;\n    vida -= ___;\n    if (vida <= 0) break;\n    vida += ___;\n  }\n  return turnos;\n}`,
        ],
        progressiveHintTemplateByLanguage: {
          python: `def turnosParaVencer(vida_chefe, dano_turno, regeneracao_turno):\n    if vida_chefe <= 0: return 0\n    if dano_turno <= 0: return -1\n    if dano_turno >= vida_chefe: return 1\n    if dano_turno <= regeneracao_turno: return -1\n    turnos = 0\n    vida = vida_chefe\n    while vida > 0:\n        turnos += 1\n        vida -= ___\n        if vida <= 0: break\n        vida += ___\n    return turnos`,
        },
        trackContext: {
          explorador: 'Simular quantas rodadas um processo leva até acabar exige cuidado para nunca criar um laço infinito.',
          jogos: 'Calcular em quantos turnos um herói derrota um chefe que regenera vida após cada turno.',
          web: 'Calcular em quantos meses uma meta financeira é atingida considerando aportes e taxas.',
          dados: 'Simular quantas rodadas de treino um modelo leva para baixar o erro até a meta.',
          sistemas: 'Calcular quantos lotes são necessários para esvaziar uma fila que recebe novos pedidos.',
        },
        conceptQuiz: {
          question: 'Se um inimigo tem 100 de vida, você causa 10 de dano por turno e ele regenera 10 de vida após sobreviver, o que ocorre num `while (vida > 0)` sem proteção?',
          options: [
            'Termina em 10 turnos.',
            'Loop infinito! A vida nunca diminui de verdade.',
            'O JavaScript para automaticamente após 100 turnos.',
          ],
          correctIndex: 1,
          explanation: 'Perfeito! Se `dano <= regeneracao` e o primeiro golpe não vence a luta, a vida nunca chega a 0. Sempre retorne `-1` nesse caso!',
        },
        challenge: {
          prompt: 'Implemente `turnosParaVencer(vidaChefe, danoTurno, regeneracaoTurno)` que retorna o número mínimo de turnos para `vidaChefe <= 0`. A cada turno: primeiro aplica-se `danoTurno`; se `vidaChefe <= 0`, a luta acaba imediatamente (o chefe não regenera!). Caso contrário, ele recupera `regeneracaoTurno`. Se `vidaChefe <= 0` inicialmente, retorne `0`. Se for impossível vencer (`danoTurno <= 0`, ou não morre no 1º turno e `danoTurno <= regeneracaoTurno`), retorne `-1`.',
          functionName: 'turnosParaVencer',
          starterCode: `function turnosParaVencer(vidaChefe, danoTurno, regeneracaoTurno) {
  // Passo 1: Trate vidaChefe <= 0, danoTurno <= 0, golpe letal no 1º turno e caso impossível (-1)
  
  // Passo 2: Simule turno a turno com while (vida > 0)
  
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
    subtitle: 'Funções puras, validação de strings, listas de objetos e imutabilidade no dia a dia.',
    universityEquivalent: 'Programação Modular (1º/2º Semestre)',
    lessons: [
      {
        id: 'm4-l1',
        moduleId: 'mod-4',
        order: 10,
        title: 'Funções Puras e Validação de Senha',
        summary: 'Projete funções determinísticas que validam regras de texto sem efeitos colaterais.',
        estimatedMinutes: 10,
        xpReward: 150,
        universityTag: 'Funções Puras & Determinismo',
        difficultyTag: 'Intermediário',
        theoryBlocks: [
          {
            heading: 'O que torna uma função pura?',
            body: 'Uma função pura (1) sempre produz a mesma saída para as mesmas entradas e (2) não modifica dados externos recebidos por parâmetro. Isso torna testes automatizados e depuração muito mais confiáveis.',
            codeExample: `// Evite mutar o array recebido:\n// itens.sort() -> MUTA o original!\n// Prefira criar cópia:\nconst copia = [...itens].sort((a, b) => a - b);`,
          },
        ],
        similarExample: {
          title: 'Exemplo parecido: validar nome de usuário simples',
          explanation: 'Checamos primeiro se o valor é texto (`typeof`), depois o tamanho mínimo, sem espaços e se tem pelo menos uma letra:',
          codeByLanguage: {
            javascript: `function validarUsuario(user) {\n  if (typeof user !== 'string') return false;\n  if (user.length < 4 || user.includes(' ')) return false;\n  return /[a-zA-Z]/.test(user);\n}`,
            python: `def validarUsuario(user):\n    if not isinstance(user, str):\n        return False\n    if len(user) < 4 or " " in user:\n        return False\n    return any(ch.isalpha() for ch in user)`,
            java: `public class Solucao {\n    public static boolean validarUsuario(String user) {\n        if (user == null || user.length() < 4 || user.contains(" ")) return false;\n        return user.chars().anyMatch(Character::isLetter);\n    }\n}`,
            csharp: `using System.Linq;\n\npublic static class Solucao\n{\n    public static bool ValidarUsuario(string? user)\n    {\n        if (string.IsNullOrEmpty(user) || user.Length < 4 || user.Contains(' ')) return false;\n        return user.Any(char.IsLetter);\n    }\n}`,
            cpp: `#include <string>\n#include <cctype>\n\nbool validarUsuario(const std::string& user) {\n    if (user.size() < 4 || user.find(' ') != std::string::npos) return false;\n    for (unsigned char c : user) if (std::isalpha(c)) return true;\n    return false;\n}`,
          },
        },
        progressiveHints: [
          'Primeiro garanta `typeof senha === "string"`. Depois verifique cada regra: tamanho >= 8, sem espaço, tem maiúscula, tem minúscula e tem número.',
          'Em JavaScript você pode testar cada regra com expressões simples: `/[A-Z]/.test(senha)`, `/[a-z]/.test(senha)`, `/[0-9]/.test(senha)` e `!/\\s/.test(senha)`.',
          `function validarSenhaForte(senha) {\n  if (typeof senha !== 'string') return false;\n  if (senha.length < 8 || /\\s/.test(senha)) return false;\n  const temMaiuscula = /[A-Z]/.test(___);\n  const temMinuscula = /[a-z]/.test(___);\n  const temNumero = /[0-9]/.test(___);\n  return temMaiuscula && temMinuscula && temNumero;\n}`,
        ],
        progressiveHintTemplateByLanguage: {
          python: `def validarSenhaForte(senha):\n    if not isinstance(senha, str) or len(senha) < 8 or any(c.isspace() for c in senha):\n        return False\n    tem_maiuscula = any(c.isupper() for c in ___)\n    tem_minuscula = any(c.islower() for c in ___)\n    tem_numero = any(c.isdigit() for c in ___)\n    return tem_maiuscula and tem_minuscula and tem_numero`,
        },
        trackContext: {
          explorador: 'Escrever funções puras e validar senhas é um dos hábitos mais valorizados na engenharia de software.',
          jogos: 'Validar nomes de guilda, códigos de sala multiplayer e saves sem corromper os dados do jogo.',
          web: 'Validadores de senha forte e formulários rodam tanto no frontend quanto no servidor como funções puras.',
          dados: 'Funções puras garantem que reprocessar um conjunto de dados gere sempre o mesmo resultado.',
          sistemas: 'Contratos puros facilitam testes unitários confiáveis e manutenção sem surpresas.',
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
  // Passo 1: Verifique primeiro se typeof senha === 'string'
  
  // Passo 2: Valide tamanho >= 8, ausência de espaços, maiúscula, minúscula e número
  
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
        order: 11,
        title: 'Transformação Imutável de Coleções',
        summary: 'Aplique descontos e filtros em listas de objetos retornando o total sem mutar os itens originais.',
        estimatedMinutes: 12,
        xpReward: 160,
        universityTag: 'Imutabilidade & Higher-Order Functions',
        difficultyTag: 'Intermediário',
        theoryBlocks: [
          {
            heading: 'Compondo filter, map e reduce com clareza',
            body: 'Funções de ordem superior como `filter`, `map` e `reduce` expressam O QUÊ queremos calcular sem espalhar índices manuais, mantendo o custo linear O(n) e preservando o array original intacto.',
            codeExample: `const total = itens\n  .filter((item) => item.ativo)\n  .reduce((acc, item) => acc + item.preco * item.qtd, 0);`,
          },
        ],
        similarExample: {
          title: 'Exemplo parecido: calcular peso total da mochila',
          explanation: 'Percorremos uma lista de objetos `{ peso, qtd }`, ignorando itens inválidos e somando `peso * qtd`:',
          codeByLanguage: {
            javascript: `function calcularPesoMochila(itens) {\n  if (!Array.isArray(itens)) return 0;\n  let total = 0;\n  for (const item of itens) {\n    if (item && item.peso > 0 && item.qtd > 0) {\n      total += item.peso * item.qtd;\n    }\n  }\n  return Number(total.toFixed(2));\n}`,
            python: `def calcularPesoMochila(itens):\n    total = 0\n    for item in itens:\n        if item["peso"] > 0 and item["qtd"] > 0:\n            total += item["peso"] * item["qtd"]\n    return round(total, 2)`,
            java: `import java.util.List;\n\npublic class Solucao {\n    public static double calcularPesoMochila(List<Item> itens) {\n        double total = 0;\n        for (Item item : itens) {\n            if (item.peso > 0 && item.qtd > 0) total += item.peso * item.qtd;\n        }\n        return Math.round(total * 100.0) / 100.0;\n    }\n}`,
            csharp: `using System;\nusing System.Collections.Generic;\n\npublic static class Solucao\n{\n    public static double CalcularPesoMochila(List<Item> itens)\n    {\n        double total = 0;\n        foreach (var item in itens)\n            if (item.Peso > 0 && item.Qtd > 0) total += item.Peso * item.Qtd;\n        return Math.Round(total, 2);\n    }\n}`,
            cpp: `#include <vector>\n#include <cmath>\n\ndouble calcularPesoMochila(const std::vector<Item>& itens) {\n    double total = 0;\n    for (const auto& item : itens) {\n        if (item.peso > 0 && item.qtd > 0) total += item.peso * item.qtd;\n    }\n    return std::round(total * 100.0) / 100.0;\n}`,
          },
        },
        progressiveHints: [
          'Divida em 2 partes: (1) some `item.preco * item.quantidade` apenas dos itens onde `preco > 0` e `quantidade > 0`; (2) trave o desconto entre 0 e 100 e aplique sobre o subtotal.',
          'Passo 1: `let subtotal = 0;` e percorra `itens`.\nPasso 2: `const desc = Math.max(0, Math.min(100, descontoPercentual));`\nPasso 3: `const total = subtotal * (1 - desc / 100);` e retorne `Number(total.toFixed(2))`.',
          `function calcularTotalCarrinho(itens, descontoPercentual = 0) {\n  if (!Array.isArray(itens) || itens.length === 0) return 0;\n  let subtotal = 0;\n  for (const item of itens) {\n    if (item && item.preco > 0 && item.quantidade > 0) {\n      subtotal += ___ * ___;\n    }\n  }\n  const desc = Math.max(0, Math.min(100, descontoPercentual));\n  return Number((subtotal * (1 - desc / 100)).toFixed(2));\n}`,
        ],
        progressiveHintTemplateByLanguage: {
          python: `def calcularTotalCarrinho(itens, desconto_percentual=0):\n    subtotal = 0\n    for item in itens:\n        if item["preco"] > 0 and item["quantidade"] > 0:\n            subtotal += ___ * ___\n    desc = max(0, min(100, desconto_percentual))\n    return round(subtotal * (1 - desc / 100), 2)`,
        },
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
          explanation: 'Na mosca! Chamar `[].reduce((a, b) => a + b)` sem valor inicial causa erro em tempo de execução. Passar `0` protege o caso de lista vazia.',
        },
        challenge: {
          prompt: 'Implemente `calcularTotalCarrinho(itens, descontoPercentual)` onde `itens` é um array de objetos `{ preco, quantidade }`. Ignore itens com `preco <= 0` ou `quantidade <= 0`. Aplique `descontoPercentual` (limitado entre 0 e 100; se negativo, trate como 0; se > 100, trate como 100) sobre o subtotal e retorne o total arredondado para 2 casas decimais.',
          functionName: 'calcularTotalCarrinho',
          starterCode: `function calcularTotalCarrinho(itens, descontoPercentual = 0) {
  // Passo 1: Trate array vazio ou inválido
  
  // Passo 2: Some preco * quantidade apenas dos itens válidos
  
  // Passo 3: Aplique o desconto limitado entre 0 e 100 e arredonde para 2 casas
  
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
        order: 12,
        title: 'Mapas de Frequência (Hash Tables) em O(n)',
        summary: 'Substitua laços aninhados lentos O(n²) por dicionários/Map em tempo linear O(n).',
        estimatedMinutes: 12,
        xpReward: 175,
        universityTag: 'Tabelas Hash & Complexidade O(n)',
        difficultyTag: 'Universitário',
        theoryBlocks: [
          {
            heading: 'Por que Hash Maps mudam o jogo na faculdade?',
            body: 'Procurar um elemento em um array leva até n passos — O(n). Em um `Map` (ou dicionário), consultar ou atualizar uma chave leva em média tempo constante O(1). Assim, contar frequências cai de O(n²) para O(n)!',
            codeExample: `const contagem = new Map();\nfor (const item of lista) {\n  contagem.set(item, (contagem.get(item) ?? 0) + 1);\n}`,
          },
        ],
        similarExample: {
          title: 'Exemplo parecido: contar quantas vezes cada letra aparece',
          explanation: 'Usamos um `Map` / `dict` para guardar a contagem de cada chave em uma única passada:',
          codeByLanguage: {
            javascript: `function contarOcorrencias(lista) {\n  const mapa = new Map();\n  for (const x of lista) {\n    mapa.set(x, (mapa.get(x) ?? 0) + 1);\n  }\n  return mapa;\n}`,
            python: `def contarOcorrencias(lista):\n    mapa = {}\n    for x in lista:\n        mapa[x] = mapa.get(x, 0) + 1\n    return mapa`,
            java: `import java.util.*;\n\npublic class Solucao {\n    public static Map<String, Integer> contarOcorrencias(List<String> lista) {\n        Map<String, Integer> mapa = new LinkedHashMap<>();\n        for (String x : lista) mapa.put(x, mapa.getOrDefault(x, 0) + 1);\n        return mapa;\n    }\n}`,
            csharp: `using System.Collections.Generic;\n\npublic static class Solucao\n{\n    public static Dictionary<string, int> ContarOcorrencias(List<string> lista)\n    {\n        var mapa = new Dictionary<string, int>();\n        foreach (var x in lista) mapa[x] = mapa.GetValueOrDefault(x, 0) + 1;\n        return mapa;\n    }\n}`,
            cpp: `#include <vector>\n#include <string>\n#include <unordered_map>\n\nstd::unordered_map<std::string, int> contarOcorrencias(const std::vector<std::string>& lista) {\n    std::unordered_map<std::string, int> mapa;\n    for (const auto& x : lista) mapa[x]++;\n    return mapa;\n}`,
          },
        },
        progressiveHints: [
          'Primeiro trate lista vazia retornando `null`. Depois crie um `Map` para contar quantas vezes cada item aparece. Por fim percorra a lista (ou as entradas do `Map`, que preservam a ordem de inserção) procurando a maior contagem estritamente maior (`>`).',
          'Usando `if (qtd > maiorQtd)` (com `>` estrito, sem `>=`), em caso de empate o primeiro elemento inserido no `Map` permanece como vencedor automaticamente!',
          `function itemMaisFrequente(lista) {\n  if (!Array.isArray(lista) || lista.length === 0) return null;\n  const mapa = new Map();\n  for (const item of lista) {\n    mapa.set(item, (mapa.get(item) ?? 0) + 1);\n  }\n  let vencedor = null;\n  let maiorQtd = 0;\n  for (const [item, qtd] of mapa.entries()) {\n    if (qtd > ___) {\n      maiorQtd = ___;\n      vencedor = ___;\n    }\n  }\n  return vencedor;\n}`,
        ],
        progressiveHintTemplateByLanguage: {
          python: `def itemMaisFrequente(lista):\n    if not lista:\n        return None\n    mapa = {}\n    for item in lista:\n        mapa[item] = mapa.get(item, 0) + 1\n    vencedor = None\n    maior_qtd = 0\n    for item, qtd in mapa.items():\n        if qtd > ___:\n            maior_qtd = ___\n            vencedor = ___\n    return vencedor`,
        },
        trackContext: {
          explorador: 'Tabelas de frequência são o alicerce de problemas clássicos de entrevistas técnicas e Estruturas de Dados.',
          jogos: 'Empilhar itens iguais no inventário (12 poções, 3 flechas) ou detectar qual habilidade foi mais usada.',
          web: 'Contar cliques por rota, tags mais populares ou detectar acessos repetidos.',
          dados: 'Construir histogramas de categorias e encontrar a moda estatística de uma amostra.',
          sistemas: 'Detectar códigos de erro mais frequentes em logs com milhões de linhas em passagem única.',
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
  // Passo 1: Se lista estiver vazia, retorne null
  
  // Passo 2: Use um Map para contar ocorrências em O(n)
  
  // Passo 3: Encontre o item com maior contagem preservando o primeiro em caso de empate
  
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
        order: 13,
        title: 'Busca Binária: Dividir para Conquistar',
        summary: 'Encontre um alvo em 1 milhão de itens ordenados usando no máximo 20 comparações — O(log n).',
        estimatedMinutes: 14,
        xpReward: 190,
        universityTag: 'Busca Binária — O(log n)',
        difficultyTag: 'Universitário',
        theoryBlocks: [
          {
            heading: 'A invariante dos ponteiros inicio e fim',
            body: 'Na Busca Binária, mantemos um intervalo `[inicio, fim]` onde o alvo ainda pode existir. Testamos o índice `meio = Math.floor((inicio + fim) / 2)`. Se `lista[meio] < alvo`, descartamos toda a metade esquerda fazendo `inicio = meio + 1`. Se for maior, `fim = meio - 1`.',
            codeExample: `let inicio = 0;\nlet fim = ordenado.length - 1;\nwhile (inicio <= fim) {\n  const meio = Math.floor((inicio + fim) / 2);\n  if (ordenado[meio] === alvo) return meio;\n  if (ordenado[meio] < alvo) inicio = meio + 1;\n  else fim = meio - 1;\n}\nreturn -1;`,
          },
        ],
        similarExample: {
          title: 'Exemplo parecido: adivinhar um número secreto entre 1 e 100',
          explanation: 'A cada chute no meio, eliminamos metade dos números restantes até encontrar o alvo:',
          codeByLanguage: {
            javascript: `function contarChutesBinarios(min, max, secreto) {\n  let inicio = min, fim = max, chutes = 0;\n  while (inicio <= fim) {\n    chutes++;\n    const meio = Math.floor((inicio + fim) / 2);\n    if (meio === secreto) return chutes;\n    if (meio < secreto) inicio = meio + 1;\n    else fim = meio - 1;\n  }\n  return -1;\n}`,
            python: `def contarChutesBinarios(min_v, max_v, secreto):\n    inicio, fim, chutes = min_v, max_v, 0\n    while inicio <= fim:\n        chutes += 1\n        meio = (inicio + fim) // 2\n        if meio == secreto: return chutes\n        if meio < secreto: inicio = meio + 1\n        else: fim = meio - 1\n    return -1`,
            java: `public class Solucao {\n    public static int contarChutesBinarios(int min, int max, int secreto) {\n        int inicio = min, fim = max, chutes = 0;\n        while (inicio <= fim) {\n            chutes++;\n            int meio = inicio + (fim - inicio) / 2;\n            if (meio == secreto) return chutes;\n            if (meio < secreto) inicio = meio + 1;\n            else fim = meio - 1;\n        }\n        return -1;\n    }\n}`,
            csharp: `public static class Solucao\n{\n    public static int ContarChutesBinarios(int min, int max, int secreto)\n    {\n        int inicio = min, fim = max, chutes = 0;\n        while (inicio <= fim)\n        {\n            chutes++;\n            int meio = inicio + (fim - inicio) / 2;\n            if (meio == secreto) return chutes;\n            if (meio < secreto) inicio = meio + 1;\n            else fim = meio - 1;\n        }\n        return -1;\n    }\n}`,
            cpp: `int contarChutesBinarios(int minV, int maxV, int secreto) {\n    int inicio = minV, fim = maxV, chutes = 0;\n    while (inicio <= fim) {\n        chutes++;\n        int meio = inicio + (fim - inicio) / 2;\n        if (meio == secreto) return chutes;\n        if (meio < secreto) inicio = meio + 1;\n        else fim = meio - 1;\n    }\n    return -1;\n}`,
          },
        },
        progressiveHints: [
          'Comece com `let inicio = 0;` e `let fim = numerosOrdenados.length - 1;`. Enquanto `inicio <= fim`, olhe para o elemento do meio.',
          'Se `numerosOrdenados[meio] === alvo`, retorne `meio`. Se for menor que `alvo`, mova `inicio = meio + 1`; senão mova `fim = meio - 1`. Se sair do `while`, retorne `-1`.',
          `function buscaBinaria(numerosOrdenados, alvo) {\n  let inicio = 0;\n  let fim = numerosOrdenados.length - 1;\n  while (inicio <= fim) {\n    const meio = Math.floor((inicio + fim) / 2);\n    if (numerosOrdenados[meio] === ___) return meio;\n    if (numerosOrdenados[meio] < ___) inicio = meio + 1;\n    else fim = ___ - 1;\n  }\n  return -1;\n}`,
        ],
        progressiveHintTemplateByLanguage: {
          python: `def buscaBinaria(numeros_ordenados, alvo):\n    inicio = 0\n    fim = len(numeros_ordenados) - 1\n    while inicio <= fim:\n        meio = (inicio + fim) // 2\n        if numeros_ordenados[meio] == ___: return meio\n        if numeros_ordenados[meio] < ___: inicio = meio + 1\n        else: fim = ___ - 1\n    return -1`,
        },
        trackContext: {
          explorador: 'Busca Binária é o primeiro grande divisor de águas em Ciência da Computação — teste depois o simulador visual na aba Glossário!',
          jogos: 'Encontrar rapidamente a faixa de nível correspondente ao XP acumulado em tabelas gigantes.',
          web: 'Localizar registros ordenados por data ou ID em índices de bancos de dados.',
          dados: 'Encontrar percentis e quantis rapidamente em vetores numéricos ordenados.',
          sistemas: 'O comando `git bisect` usa exatamente Busca Binária para achar em segundos qual commit gerou um bug!',
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
  // Passo 1: Defina let inicio = 0 e let fim = numerosOrdenados.length - 1
  
  // Passo 2: Enquanto inicio <= fim, compare o elemento do meio com alvo
  
  // Passo 3: Se não encontrar, retorne -1
  
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
        order: 14,
        title: 'Pilhas (Stack) e Validação de Expressões',
        summary: 'Use a estrutura LIFO (Last-In, First-Out) para construir o núcleo sintático de um compilador.',
        estimatedMinutes: 14,
        xpReward: 200,
        universityTag: 'Pilha (LIFO) & Compiladores',
        difficultyTag: 'Universitário',
        theoryBlocks: [
          {
            heading: 'Como compiladores validam parênteses, colchetes e chaves',
            body: 'Toda vez que encontramos um símbolo de abertura `(`, `[` ou `{`, empilhamos (`push`). Quando encontramos um fechamento `)`, `]` ou `}`, desempilhamos (`pop`) e verificamos se ele corresponde exatamente ao último símbolo aberto. Ao final, a pilha precisa estar vazia!',
            codeExample: `const pilha = [];\nconst pares = { ')': '(', ']': '[', '}': '{' };`,
          },
        ],
        similarExample: {
          title: 'Exemplo parecido: validar apenas parênteses "(" e ")" com pilha',
          explanation: 'Empilhamos cada `"("` e desempilhamos ao encontrar `")"`. Se a pilha estiver vazia na hora do `")"`, retorna `false`:',
          codeByLanguage: {
            javascript: `function parentesesValidos(texto) {\n  const pilha = [];\n  for (const ch of texto) {\n    if (ch === '(') pilha.push(ch);\n    else if (ch === ')') {\n      if (pilha.length === 0) return false;\n      pilha.pop();\n    }\n  }\n  return pilha.length === 0;\n}`,
            python: `def parentesesValidos(texto):\n    pilha = []\n    for ch in texto:\n        if ch == '(':\n            pilha.append(ch)\n        elif ch == ')':\n            if not pilha:\n                return False\n            pilha.pop()\n    return len(pilha) == 0`,
            java: `import java.util.*;\n\npublic class Solucao {\n    public static boolean parentesesValidos(String texto) {\n        Deque<Character> pilha = new ArrayDeque<>();\n        for (char ch : texto.toCharArray()) {\n            if (ch == '(') pilha.push(ch);\n            else if (ch == ')') {\n                if (pilha.isEmpty()) return false;\n                pilha.pop();\n            }\n        }\n        return pilha.isEmpty();\n    }\n}`,
            csharp: `using System.Collections.Generic;\n\npublic static class Solucao\n{\n    public static bool ParentesesValidos(string texto)\n    {\n        var pilha = new Stack<char>();\n        foreach (char ch in texto)\n        {\n            if (ch == '(') pilha.Push(ch);\n            else if (ch == ')')\n            {\n                if (pilha.Count == 0) return false;\n                pilha.Pop();\n            }\n        }\n        return pilha.Count == 0;\n    }\n}`,
            cpp: `#include <string>\n#include <stack>\n\nbool parentesesValidos(const std::string& texto) {\n    std::stack<char> pilha;\n    for (char ch : texto) {\n        if (ch == '(') pilha.push(ch);\n        else if (ch == ')') {\n            if (pilha.empty()) return false;\n            pilha.pop();\n        }\n    }\n    return pilha.empty();\n}`,
          },
        },
        progressiveHints: [
          'Crie uma `pilha = []` e um mapa `pares = { ")": "(", "]": "[", "}": "{" }`. Ao ler cada caractere da string, ignore letras/números; empilhe aberturas e confira fechamentos.',
          'Quando encontrar `)`, `]` ou `}`, chame `pilha.pop()` e compare com `pares[ch]`. Se forem diferentes (ou se a pilha estava vazia), retorne `false` imediatamente. No final, retorne `pilha.length === 0`.',
          `function delimitadoresBalanceados(expressao) {\n  const pilha = [];\n  const pares = { ')': '(', ']': '[', '}': '{' };\n  for (const ch of expressao) {\n    if (ch === '(' || ch === '[' || ch === '{') {\n      pilha.push(ch);\n    } else if (pares[ch]) {\n      if (pilha.pop() !== ___) return false;\n    }\n  }\n  return pilha.length === ___;\n}`,
        ],
        progressiveHintTemplateByLanguage: {
          python: `def delimitadoresBalanceados(expressao):\n    pilha = []\n    pares = {')': '(', ']': '[', '}': '{'}\n    for ch in expressao:\n        if ch in '([{':\n            pilha.append(ch)\n        elif ch in pares:\n            if not pilha or pilha.pop() != ___:\n                return False\n    return len(pilha) == ___`,
        },
        trackContext: {
          explorador: 'Este é um dos problemas mais famosos da Ciência da Computação — cai em provas de Estruturas de Dados e entrevistas técnicas.',
          jogos: 'Interpretar scripts de diálogo aninhados e gerenciar pilhas de telas/menus (Pause -> Opções -> Áudio).',
          web: 'Validar sintaxe de JSON, tags HTML aninhadas e histórico de ações Desfazer (Undo).',
          dados: 'Avaliar fórmulas matemáticas e expressões de consulta com precedência de parênteses.',
          sistemas: 'É a base da pilha de chamadas (Call Stack) e analisadores sintáticos (parsers) de compiladores.',
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
  // Passo 1: Crie uma pilha [] e um mapa de correspondência { ')': '(', ']': '[', '}': '{' }
  
  // Passo 2: Percorra cada caractere empilhando aberturas e validando fechamentos
  
  // Passo 3: Retorne true apenas se a pilha terminar vazia
  
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
        order: 15,
        title: 'Recursão, Caso Base e Estruturas Aninhadas',
        summary: 'Pense recursivamente para percorrer estruturas em árvore de profundidade arbitrária sem estouro de pilha.',
        estimatedMinutes: 15,
        xpReward: 220,
        universityTag: 'Recursão & Árvores',
        difficultyTag: 'Universitário',
        theoryBlocks: [
          {
            heading: 'As duas leis da recursão correta',
            body: 'Toda função recursiva precisa de (1) um **caso base** claro que retorna imediatamente sem chamar a si mesma, e (2) um **passo recursivo** que reduz o problema em direção ao caso base. Sem caso base, ocorre Stack Overflow.',
            codeExample: `function somarArvore(no) {\n  if (typeof no === 'number') return no; // Caso base\n  let total = 0;\n  for (const filho of no) total += somarArvore(filho);\n  return total;\n}`,
          },
        ],
        similarExample: {
          title: 'Exemplo parecido: contar quantos números existem em listas dentro de listas',
          explanation: 'Se o item é número, vale `1` (caso base). Se é uma lista, somamos a contagem recursiva de cada elemento:',
          codeByLanguage: {
            javascript: `function contarNumeros(no) {\n  if (typeof no === 'number') return 1;\n  if (!Array.isArray(no)) return 0;\n  let total = 0;\n  for (const item of no) {\n    total += contarNumeros(item);\n  }\n  return total;\n}`,
            python: `def contarNumeros(no):\n    if isinstance(no, (int, float)):\n        return 1\n    if not isinstance(no, list):\n        return 0\n    total = 0\n    for item in no:\n        total += contarNumeros(item)\n    return total`,
            java: `import java.util.List;\n\npublic class Solucao {\n    public static int contarNumeros(Object no) {\n        if (no instanceof Number) return 1;\n        if (!(no instanceof List<?> lista)) return 0;\n        int total = 0;\n        for (Object item : lista) total += contarNumeros(item);\n        return total;\n    }\n}`,
            csharp: `using System.Collections;\n\npublic static class Solucao\n{\n    public static int ContarNumeros(object no)\n    {\n        if (no is int or double) return 1;\n        if (no is not IEnumerable lista || no is string) return 0;\n        int total = 0;\n        foreach (var item in lista) total += ContarNumeros(item);\n        return total;\n    }\n}`,
            cpp: `int contarNumeros(const No& no) {\n    if (std::holds_alternative<double>(no.valor)) return 1;\n    int total = 0;\n    for (const auto& filho : std::get<std::vector<No>>(no.valor)) total += contarNumeros(filho);\n    return total;\n}`,
          },
        },
        progressiveHints: [
          'Pense nos 2 casos: se `estrutura` for um número válido, ela mesma já é a soma (caso base!). Se for um array, percorra cada elemento e some `somarAninhado(item)`.',
          'Passo 1: `if (typeof estrutura === "number" && Number.isFinite(estrutura)) return estrutura;`\nPasso 2: `if (!Array.isArray(estrutura)) return 0;`\nPasso 3: `let total = 0; for (const item of estrutura) { total += somarAninhado(item); } return total;`',
          `function somarAninhado(estrutura) {\n  if (typeof estrutura === 'number' && Number.isFinite(estrutura)) return ___;\n  if (!Array.isArray(estrutura)) return 0;\n  let total = 0;\n  for (const item of estrutura) {\n    total += somarAninhado(___);\n  }\n  return total;\n}`,
        ],
        progressiveHintTemplateByLanguage: {
          python: `def somarAninhado(estrutura):\n    if isinstance(estrutura, (int, float)):\n        return ___\n    if not isinstance(estrutura, list):\n        return 0\n    total = 0\n    for item in estrutura:\n        total += somarAninhado(___)\n    return total`,
        },
        trackContext: {
          explorador: 'Recursão desbloqueia árvores, grafos e algoritmos de dividir para conquistar usados em toda a graduação.',
          jogos: 'Percorrer hierarquias de objetos na cena (Scene Graph) e árvores de comportamento de I.A.',
          web: 'Renderizar árvores de comentários, pastas aninhadas e componentes recursivos na interface.',
          dados: 'Navegar em árvores de decisão e estruturas JSON hierárquicas de profundidade variável.',
          sistemas: 'Percorrer sistemas de arquivos (diretórios dentro de diretórios) e árvores sintáticas de compiladores.',
        },
        conceptQuiz: {
          question: 'O que acontece se uma função recursiva nunca atingir seu caso base?',
          options: [
            'Ela retorna 0 silenciosamente.',
            'Estoura a pilha de chamadas (Stack Overflow / Maximum call stack size exceeded).',
            'O computador pula automaticamente para o próximo argumento.',
          ],
          correctIndex: 1,
          explanation: 'Exatamente! Cada chamada recursiva empilha um novo frame na Call Stack. Sem convergir ao caso base, a memória da pilha esgota.',
        },
        challenge: {
          prompt: 'Implemente `somarAninhado(estrutura)` usando recursão (sem usar `.flat(Infinity)`). A `estrutura` é um array que pode conter números ou outros arrays aninhados em qualquer profundidade. Retorne a soma total de todos os números válidos encontrados. Arrays vazios somam `0`.',
          functionName: 'somarAninhado',
          starterCode: `function somarAninhado(estrutura) {
  // Passo 1: Caso base — se estrutura for número finito, retorne ele
  
  // Passo 2: Se não for array, retorne 0
  
  // Passo 3: Some recursivamente somarAninhado(item) para cada item do array
  
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
