import { ProgrammingLanguage } from '../types';

type NonJsLanguage = Exclude<ProgrammingLanguage, 'javascript'>;

const LESSON_TEMPLATES: Record<string, Record<NonJsLanguage, string>> = {
  'm1-b1': {
    python: `def somarPontos(pontos_atuais, pontos_ganhos):
    # Passo 1: Crie uma variável "total" somando pontos_atuais + pontos_ganhos
    # Passo 2: Devolva o resultado usando return total
    pass`,
    java: `public class Solucao {
    public static int somarPontos(int pontosAtuais, int pontosGanhos) {
        // Passo 1: Crie uma variável "total" somando pontosAtuais + pontosGanhos
        // Passo 2: Devolva o resultado usando return total;
        return 0;
    }
}`,
    csharp: `public static class Solucao
{
    public static int SomarPontos(int pontosAtuais, int pontosGanhos)
    {
        // Passo 1: Crie uma variável "total" somando pontosAtuais + pontosGanhos
        // Passo 2: Devolva o resultado usando return total;
        return 0;
    }
}`,
    cpp: `int somarPontos(int pontosAtuais, int pontosGanhos) {
    // Passo 1: Crie uma variável "total" somando pontosAtuais + pontosGanhos
    // Passo 2: Devolva o resultado usando return total;
    return 0;
}`,
  },
  'm1-b2': {
    python: `def criarEtiquetaJogador(nome, pontos_iniciais, bonus):
    # Passo 1: Crie uma variável "total" com pontos_iniciais + bonus
    # Passo 2: Monte o texto no formato: f"{nome}: {total} pontos"
    # Passo 3: Devolva o texto montado com return
    pass`,
    java: `public class Solucao {
    public static String criarEtiquetaJogador(String nome, int pontosIniciais, int bonus) {
        // Passo 1: Crie uma variável int total = pontosIniciais + bonus;
        // Passo 2: Monte o texto: nome + ": " + total + " pontos"
        // Passo 3: Devolva o texto usando return
        return "";
    }
}`,
    csharp: `public static class Solucao
{
    public static string CriarEtiquetaJogador(string nome, int pontosIniciais, int bonus)
    {
        // Passo 1: Crie uma variável int total = pontosIniciais + bonus;
        // Passo 2: Monte o texto: $"{nome}: {total} pontos"
        // Passo 3: Devolva o texto usando return
        return "";
    }
}`,
    cpp: `#include <string>

std::string criarEtiquetaJogador(const std::string& nome, int pontosIniciais, int bonus) {
    // Passo 1: Crie int total = pontosIniciais + bonus;
    // Passo 2: Monte o texto: nome + ": " + std::to_string(total) + " pontos"
    // Passo 3: Devolva o texto usando return
    return "";
}`,
  },
  'm1-b3': {
    python: `def podeComprarItem(moedas_do_jogador, preco_do_item):
    # Passo 1: Use if para verificar se moedas_do_jogador >= preco_do_item
    #   Se for verdade, retorne "Compra liberada"
    # Passo 2: Use else para retornar "Moedas insuficientes"
    pass`,
    java: `public class Solucao {
    public static String podeComprarItem(int moedasDoJogador, int precoDoItem) {
        // Passo 1: Use if (moedasDoJogador >= precoDoItem) para retornar "Compra liberada"
        // Passo 2: Use else para retornar "Moedas insuficientes"
        return "";
    }
}`,
    csharp: `public static class Solucao
{
    public static string PodeComprarItem(int moedasDoJogador, int precoDoItem)
    {
        // Passo 1: Use if (moedasDoJogador >= precoDoItem) para retornar "Compra liberada"
        // Passo 2: Use else para retornar "Moedas insuficientes"
        return "";
    }
}`,
    cpp: `#include <string>

std::string podeComprarItem(int moedasDoJogador, int precoDoItem) {
    // Passo 1: Use if (moedasDoJogador >= precoDoItem) para retornar "Compra liberada"
    // Passo 2: Use else para retornar "Moedas insuficientes"
    return "";
}`,
  },
  'm1-l1': {
    python: `def aplicarVariacao(valor_atual, delta, limite_maximo):
    # Passo 1: Calcule novo_valor = valor_atual + delta
    # Passo 2: Se novo_valor < 0, devolva 0
    # Passo 3: Se novo_valor > limite_maximo, devolva limite_maximo
    # Passo 4: Caso contrário, devolva novo_valor
    pass`,
    java: `public class Solucao {
    public static double aplicarVariacao(double valorAtual, double delta, double limiteMaximo) {
        // Passo 1: Calcule double novoValor = valorAtual + delta;
        // Passo 2: Se novoValor < 0, retorne 0
        // Passo 3: Se novoValor > limiteMaximo, retorne limiteMaximo
        // Passo 4: Caso contrário, retorne novoValor
        return 0;
    }
}`,
    csharp: `public static class Solucao
{
    public static double AplicarVariacao(double valorAtual, double delta, double limiteMaximo)
    {
        // Passo 1: Calcule double novoValor = valorAtual + delta;
        // Passo 2: Se novoValor < 0, retorne 0
        // Passo 3: Se novoValor > limiteMaximo, retorne limiteMaximo
        // Passo 4: Caso contrário, retorne novoValor
        return 0;
    }
}`,
    cpp: `#include <algorithm>

double aplicarVariacao(double valorAtual, double delta, double limiteMaximo) {
    // Passo 1: Calcule double novoValor = valorAtual + delta;
    // Passo 2: Se novoValor < 0, retorne 0
    // Passo 3: Se novoValor > limiteMaximo, retorne limiteMaximo
    // Passo 4: Caso contrário, retorne novoValor
    return 0;
}`,
  },
  'm1-l2': {
    python: `def formatarCronometro(total_segundos):
    # Passo 1: Se total_segundos < 0, retorne "00:00"
    # Passo 2: Calcule minutos = total_segundos // 60 e segundos = total_segundos % 60
    # Passo 3: Retorne no formato "MM:SS" (ex: f"{minutos:02d}:{segundos:02d}")
    pass`,
    java: `public class Solucao {
    public static String formatarCronometro(int totalSegundos) {
        // Passo 1: Se totalSegundos < 0, retorne "00:00"
        // Passo 2: Calcule minutos = totalSegundos / 60 e segundos = totalSegundos % 60
        // Passo 3: Retorne String.format("%02d:%02d", minutos, segundos)
        return "00:00";
    }
}`,
    csharp: `public static class Solucao
{
    public static string FormatarCronometro(int totalSegundos)
    {
        // Passo 1: Se totalSegundos < 0, retorne "00:00"
        // Passo 2: Calcule minutos = totalSegundos / 60 e segundos = totalSegundos % 60
        // Passo 3: Retorne $"{minutos:D2}:{segundos:D2}"
        return "00:00";
    }
}`,
    cpp: `#include <string>

std::string formatarCronometro(int totalSegundos) {
    // Passo 1: Se totalSegundos < 0, retorne "00:00"
    // Passo 2: Calcule minutos = totalSegundos / 60 e segundos = totalSegundos % 60
    // Passo 3: Monte e retorne a string no formato "MM:SS"
    return "00:00";
}`,
  },
  'm2-l1': {
    python: `def avaliarAprovacao(nota, frequencia):
    # Use cláusulas de guarda para validar os limites primeiro
    # Retorne "dados_invalidos", "reprovado_falta", "aprovado", "recuperacao" ou "reprovado_nota"
    pass`,
    java: `public class Solucao {
    public static String avaliarAprovacao(double nota, double frequencia) {
        // Use cláusulas de guarda para validar os limites primeiro
        return "";
    }
}`,
    csharp: `public static class Solucao
{
    public static string AvaliarAprovacao(double nota, double frequencia)
    {
        // Use cláusulas de guarda para validar os limites primeiro
        return "";
    }
}`,
    cpp: `#include <string>

std::string avaliarAprovacao(double nota, double frequencia) {
    // Use cláusulas de guarda para validar os limites primeiro
    return "";
}`,
  },
  'm2-l2': {
    python: `def verificarColisaoAABB(a, b):
    # a e b são dicionários: {"x": ..., "y": ..., "largura": ..., "altura": ...}
    # Valide dimensões positivas primeiro
    # Verifique sobreposição simultânea nos eixos X e Y
    pass`,
    java: `public class Solucao {
    // Considere class Retangulo { double x, y, largura, altura; }
    public static boolean verificarColisaoAABB(Retangulo a, Retangulo b) {
        // Valide dimensões positivas primeiro
        // Verifique sobreposição simultânea nos eixos X e Y
        return false;
    }
}`,
    csharp: `public static class Solucao
{
    // Considere record Retangulo(double X, double Y, double Largura, double Altura);
    public static bool VerificarColisaoAABB(Retangulo a, Retangulo b)
    {
        // Valide dimensões positivas primeiro
        // Verifique sobreposição simultânea nos eixos X e Y
        return false;
    }
}`,
    cpp: `struct Retangulo {
    double x;
    double y;
    double largura;
    double altura;
};

bool verificarColisaoAABB(const Retangulo& a, const Retangulo& b) {
    // Valide dimensões positivas primeiro
    // Verifique sobreposição simultânea nos eixos X e Y
    return false;
}`,
  },
  'm3-l1': {
    python: `import math

def mediaValoresValidos(valores):
    # Inicialize soma e contador de válidos
    # Ignore valores < 0 ou não finitos
    # Evite divisão por zero e arredonde com round(media, 2)
    pass`,
    java: `public class Solucao {
    public static double mediaValoresValidos(double[] valores) {
        // Inicialize soma e contador de válidos
        // Ignore valores < 0 ou não finitos (Double.isFinite)
        // Evite divisão por zero e arredonde para 2 casas decimais
        return 0;
    }
}`,
    csharp: `using System;

public static class Solucao
{
    public static double MediaValoresValidos(double[] valores)
    {
        // Inicialize soma e contador de válidos
        // Ignore valores < 0 ou não finitos (double.IsFinite)
        // Evite divisão por zero e arredonde com Math.Round(media, 2)
        return 0;
    }
}`,
    cpp: `#include <vector>
#include <cmath>

double mediaValoresValidos(const std::vector<double>& valores) {
    // Inicialize soma e contador de válidos
    // Ignore valores < 0 ou não finitos (std::isfinite)
    // Evite divisão por zero e arredonde para 2 casas decimais
    return 0;
}`,
  },
  'm3-l2': {
    python: `def turnosParaVencer(vida_chefe, dano_turno, regeneracao_turno):
    # Trate casos extremos primeiro para garantir terminação do while!
    pass`,
    java: `public class Solucao {
    public static int turnosParaVencer(int vidaChefe, int danoTurno, int regeneracaoTurno) {
        // Trate casos extremos primeiro para garantir terminação do while!
        return -1;
    }
}`,
    csharp: `public static class Solucao
{
    public static int TurnosParaVencer(int vidaChefe, int danoTurno, int regeneracaoTurno)
    {
        // Trate casos extremos primeiro para garantir terminação do while!
        return -1;
    }
}`,
    cpp: `int turnosParaVencer(int vidaChefe, int danoTurno, int regeneracaoTurno) {
    // Trate casos extremos primeiro para garantir terminação do while!
    return -1;
}`,
  },
  'm4-l1': {
    python: `def validarSenhaForte(senha):
    # Verifique se isinstance(senha, str)
    # Valide comprimento >= 8, ausência de espaços, maiúscula, minúscula e dígito
    pass`,
    java: `public class Solucao {
    public static boolean validarSenhaForte(String senha) {
        // Verifique se senha != null e comprimento >= 8
        // Valide ausência de espaços, maiúscula, minúscula e dígito
        return false;
    }
}`,
    csharp: `public static class Solucao
{
    public static bool ValidarSenhaForte(string? senha)
    {
        // Verifique se senha != null e comprimento >= 8
        // Valide ausência de espaços, maiúscula, minúscula e dígito
        return false;
    }
}`,
    cpp: `#include <string>
#include <cctype>

bool validarSenhaForte(const std::string& senha) {
    // Valide comprimento >= 8, ausência de espaços, maiúscula, minúscula e dígito
    return false;
}`,
  },
  'm4-l2': {
    python: `def calcularTotalCarrinho(itens, desconto_percentual=0):
    # itens é uma lista de dicts: [{"preco": ..., "quantidade": ...}]
    # Ignore itens com preco <= 0 ou quantidade <= 0
    # Sature desconto_percentual entre 0 e 100 e arredonde com round(..., 2)
    pass`,
    java: `import java.util.List;

public class Solucao {
    // Considere class Item { double preco; int quantidade; }
    public static double calcularTotalCarrinho(List<Item> itens, double descontoPercentual) {
        // Ignore itens inválidos, sature o desconto entre 0 e 100 e arredonde para 2 casas
        return 0;
    }
}`,
    csharp: `using System;
using System.Collections.Generic;

public static class Solucao
{
    // Considere record Item(double Preco, int Quantidade);
    public static double CalcularTotalCarrinho(List<Item> itens, double descontoPercentual = 0)
    {
        // Ignore itens inválidos, sature o desconto entre 0 e 100 e arredonde para 2 casas
        return 0;
    }
}`,
    cpp: `#include <vector>
#include <cmath>

struct Item {
    double preco;
    int quantidade;
};

double calcularTotalCarrinho(const std::vector<Item>& itens, double descontoPercentual = 0) {
    // Ignore itens inválidos, sature o desconto entre 0 e 100 e arredonde para 2 casas
    return 0;
}`,
  },
  'm5-l1': {
    python: `def itemMaisFrequente(lista):
    # Use um dicionário (dict) para contar ocorrências em O(n)
    # Em caso de empate, mantenha o primeiro que apareceu na lista
    pass`,
    java: `import java.util.*;

public class Solucao {
    public static Object itemMaisFrequente(List<Object> lista) {
        // Use um HashMap/LinkedHashMap para contar ocorrências em O(n)
        // Em caso de empate, mantenha o primeiro que apareceu na lista
        return null;
    }
}`,
    csharp: `using System.Collections.Generic;

public static class Solucao
{
    public static object? ItemMaisFrequente(List<object> lista)
    {
        // Use um Dictionary para contar ocorrências em O(n)
        // Em caso de empate, mantenha o primeiro que apareceu na lista
        return null;
    }
}`,
    cpp: `#include <vector>
#include <string>
#include <unordered_map>
#include <optional>

std::optional<std::string> itemMaisFrequente(const std::vector<std::string>& lista) {
    // Use std::unordered_map para contar ocorrências em O(n)
    // Em caso de empate, mantenha o primeiro que apareceu na lista
    return std::nullopt;
}`,
  },
  'm5-l2': {
    python: `def buscaBinaria(numeros_ordenados, alvo):
    # Implemente com ponteiros inicio e fim em O(log n)
    pass`,
    java: `public class Solucao {
    public static int buscaBinaria(int[] numerosOrdenados, int alvo) {
        // Implemente com ponteiros inicio e fim em O(log n)
        return -1;
    }
}`,
    csharp: `public static class Solucao
{
    public static int BuscaBinaria(int[] numerosOrdenados, int alvo)
    {
        // Implemente com ponteiros inicio e fim em O(log n)
        return -1;
    }
}`,
    cpp: `#include <vector>

int buscaBinaria(const std::vector<int>& numerosOrdenados, int alvo) {
    // Implemente com ponteiros inicio e fim em O(log n)
    return -1;
}`,
  },
  'm6-l1': {
    python: `def delimitadoresBalanceados(expressao):
    # Use uma pilha (list com append/pop) e um dicionário de correspondência
    pass`,
    java: `import java.util.*;

public class Solucao {
    public static boolean delimitadoresBalanceados(String expressao) {
        // Use uma pilha (ArrayDeque<Character>) e verifique o fechamento na ordem LIFO
        return false;
    }
}`,
    csharp: `using System.Collections.Generic;

public static class Solucao
{
    public static bool DelimitadoresBalanceados(string expressao)
    {
        // Use uma Stack<char> e verifique o fechamento na ordem LIFO
        return false;
    }
}`,
    cpp: `#include <string>
#include <stack>

bool delimitadoresBalanceados(const std::string& expressao) {
    // Use std::stack<char> e verifique o fechamento na ordem LIFO
    return false;
}`,
  },
  'm6-l2': {
    python: `def somarAninhado(estrutura):
    # Se não for lista, trate o caso base (int/float)
    # Se for lista, some recursivamente cada elemento
    pass`,
    java: `import java.util.List;

public class Solucao {
    public static double somarAninhado(Object estrutura) {
        // Se for Number, retorne seu valor (caso base)
        // Se for List<?>, some recursivamente cada elemento
        return 0;
    }
}`,
    csharp: `using System.Collections;

public static class Solucao
{
    public static double SomarAninhado(object estrutura)
    {
        // Se for número, retorne seu valor (caso base)
        // Se for coleção (IEnumerable), some recursivamente cada elemento
        return 0;
    }
}`,
    cpp: `#include <variant>
#include <vector>

struct No {
    std::variant<double, std::vector<No>> valor;
};

double somarAninhado(const No& estrutura) {
    // Trate o caso base (double) e o passo recursivo (std::vector<No>)
    return 0;
}`,
  },
};

const DEBUG_TEMPLATES: Record<string, Record<NonJsLanguage, string>> = {
  'dbg-off-by-one': {
    python: `def somarTodos(numeros):
    soma = 0
    for i in range(len(numeros) + 1):
        soma += numeros[i]
    return soma`,
    java: `public class Solucao {
    public static int somarTodos(int[] numeros) {
        int soma = 0;
        for (int i = 0; i <= numeros.length; i++) {
            soma += numeros[i];
        }
        return soma;
    }
}`,
    csharp: `public static class Solucao
{
    public static int SomarTodos(int[] numeros)
    {
        int soma = 0;
        for (int i = 0; i <= numeros.Length; i++)
        {
            soma += numeros[i];
        }
        return soma;
    }
}`,
    cpp: `#include <vector>

int somarTodos(const std::vector<int>& numeros) {
    int soma = 0;
    for (size_t i = 0; i <= numeros.size(); i++) {
        soma += numeros[i];
    }
    return soma;
}`,
  },
  'dbg-mutation': {
    python: `def obterTop3(pontuacoes):
    # Bug: converte para string ao ordenar e muta a lista recebida
    pontuacoes.sort(key=str, reverse=True)
    return pontuacoes[:3]`,
    java: `import java.util.*;

public class Solucao {
    public static List<Integer> obterTop3(List<Integer> pontuacoes) {
        // Bug: ordena lexicograficamente como String e muta a lista recebida
        pontuacoes.sort((a, b) -> String.valueOf(b).compareTo(String.valueOf(a)));
        return pontuacoes.subList(0, Math.min(3, pontuacoes.size()));
    }
}`,
    csharp: `using System.Collections.Generic;
using System.Linq;

public static class Solucao
{
    public static List<int> ObterTop3(List<int> pontuacoes)
    {
        // Bug: ordena como texto e muta a lista original
        pontuacoes.Sort((a, b) => string.Compare(b.ToString(), a.ToString()));
        return pontuacoes.Take(3).ToList();
    }
}`,
    cpp: `#include <vector>
#include <algorithm>
#include <string>

std::vector<int> obterTop3(std::vector<int>& pontuacoes) {
    // Bug: ordena como texto e muta o vetor original
    std::sort(pontuacoes.begin(), pontuacoes.end(), [](int a, int b) {
        return std::to_string(a) > std::to_string(b);
    });
    if (pontuacoes.size() > 3) pontuacoes.resize(3);
    return pontuacoes;
}`,
  },
  'dbg-max-negatives': {
    python: `def encontrarMaior(valores):
    if len(valores) == 0:
        return None
    maior = 0
    for n in valores:
        if n > maior:
            maior = n
    return maior`,
    java: `public class Solucao {
    public static Integer encontrarMaior(int[] valores) {
        if (valores.length == 0) return null;
        int maior = 0;
        for (int n : valores) {
            if (n > maior) {
                maior = n;
            }
        }
        return maior;
    }
}`,
    csharp: `public static class Solucao
{
    public static int? EncontrarMaior(int[] valores)
    {
        if (valores.Length == 0) return null;
        int maior = 0;
        foreach (int n in valores)
        {
            if (n > maior)
            {
                maior = n;
            }
        }
        return maior;
    }
}`,
    cpp: `#include <vector>
#include <optional>

std::optional<int> encontrarMaior(const std::vector<int>& valores) {
    if (valores.empty()) return std::nullopt;
    int maior = 0;
    for (int n : valores) {
        if (n > maior) {
            maior = n;
        }
    }
    return maior;
}`,
  },
  'dbg-falsy-zero': {
    python: `def aplicarTaxa(valor, taxa=None):
    taxa_final = taxa or 10
    return round(valor * (1 + taxa_final / 100), 2)`,
    java: `public class Solucao {
    public static double aplicarTaxa(double valor, Double taxa) {
        double taxaFinal = (taxa == null || taxa == 0) ? 10.0 : taxa;
        return Math.round(valor * (1 + taxaFinal / 100.0) * 100.0) / 100.0;
    }
}`,
    csharp: `using System;

public static class Solucao
{
    public static double AplicarTaxa(double valor, double? taxa)
    {
        double taxaFinal = (taxa == null || taxa == 0) ? 10.0 : taxa.Value;
        return Math.Round(valor * (1 + taxaFinal / 100.0), 2);
    }
}`,
    cpp: `#include <optional>
#include <cmath>

double aplicarTaxa(double valor, std::optional<double> taxa) {
    double taxaFinal = (!taxa.has_value() || taxa.value() == 0) ? 10.0 : taxa.value();
    return std::round(valor * (1.0 + taxaFinal / 100.0) * 100.0) / 100.0;
}`,
  },
  'dbg-recursion-base': {
    python: `def fatorial(n):
    if n == 1:
        return 1
    return n * fatorial(n - 1)`,
    java: `public class Solucao {
    public static Long fatorial(double n) {
        if (n == 1) return 1L;
        return (long) n * fatorial(n - 1);
    }
}`,
    csharp: `public static class Solucao
{
    public static long? Fatorial(double n)
    {
        if (n == 1) return 1;
        return (long)n * Fatorial(n - 1);
    }
}`,
    cpp: `#include <optional>

std::optional<long long> fatorial(double n) {
    if (n == 1) return 1;
    return static_cast<long long>(n) * fatorial(n - 1).value();
}`,
  },
  'dbg-palindrome-clean': {
    python: `def ehPalindromo(texto):
    invertido = texto[::-1]
    return texto == invertido`,
    java: `public class Solucao {
    public static boolean ehPalindromo(String texto) {
        String invertido = new StringBuilder(texto).reverse().toString();
        return texto.equals(invertido);
    }
}`,
    csharp: `using System;

public static class Solucao
{
    public static bool EhPalindromo(string texto)
    {
        char[] arr = texto.ToCharArray();
        Array.Reverse(arr);
        string invertido = new string(arr);
        return texto == invertido;
    }
}`,
    cpp: `#include <string>
#include <algorithm>

bool ehPalindromo(const std::string& texto) {
    std::string invertido = texto;
    std::reverse(invertido.begin(), invertido.end());
    return texto == invertido;
}`,
  },
};

export function getLessonStarterCode(
  lessonId: string,
  jsFallback: string,
  language: ProgrammingLanguage
): string {
  if (language === 'javascript') return jsFallback;
  return LESSON_TEMPLATES[lessonId]?.[language] ?? jsFallback;
}

export function getDebugBuggyCode(
  debugId: string,
  jsFallback: string,
  language: ProgrammingLanguage
): string {
  if (language === 'javascript') return jsFallback;
  return DEBUG_TEMPLATES[debugId]?.[language] ?? jsFallback;
}
