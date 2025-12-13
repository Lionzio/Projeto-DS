"""
Módulo Python para integrar o Google Gemini Developer API ao projeto Nexo Carreira.

Este módulo define uma função de alto nível `analyze_questionnaire` que recebe as
respostas de um questionário de preparação de carreira (cinco perguntas) e
retorna uma análise estruturada no formato JSON com base nos objetivos
profissionais descritos na quinta resposta. A função utiliza a API de texto
`generateContent` da Gemini (modelo **gemini‑2.5‑flash**) via requisições HTTP.

Requisitos:
  * Python 3.8+ e biblioteca `requests` instalada (`pip install requests`).
  * Uma chave de API válida para a Gemini Developer API. Defina esta chave na
    variável de ambiente ``GEMINI_API_KEY`` ou passe explicitamente via
    parâmetro ``api_key``.

Referências da documentação:
  * Todas as requisições à Gemini API devem incluir o cabeçalho
    ``x‑goog‑api‑key`` com sua chave【33839709218578†L120-L133】.
  * A rota padrão para gerar conteúdo com o modelo ``gemini-2.5-flash`` é
    ``https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent``【33839709218578†L120-L133】.

O retorno da API é um dicionário com a chave ``candidates``. Cada candidato
contém um campo ``content.parts[0].text`` que é o texto gerado. Neste caso,
o prompt instruirá o modelo a retornar um objeto JSON como string; o código
converte essa string em um objeto Python utilizando ``json.loads``.

"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Dict, Optional

import requests

__all__ = ["Questionnaire", "analyze_questionnaire", "GeminiAPIError"]


@dataclass
class Questionnaire:
    """Modela as respostas ao questionário.

    As respostas às perguntas 1–4 são características do candidato, enquanto
    ``objective`` (5ª pergunta) descreve os objetivos profissionais nos
    próximos dois anos. A análise utilizará este objetivo como base para
    identificar coerência entre competências e metas.
    """

    answer1: str
    answer2: str
    answer3: str
    answer4: str
    objective: str

    def to_prompt(self) -> str:
        """Constrói a parte do prompt relativa ao usuário.

        Retorna uma string que lista cada pergunta e sua respectiva resposta.
        Essa formatação facilita a compreensão do modelo ao separar as
        respostas de forma clara.
        """
        return (
            f"Objetivo profissional (base de requisitos): {self.objective}\n"
            f"1. Experiência/estágios/voluntariado: {self.answer1}\n"
            f"2. Habilidades técnicas: {self.answer2}\n"
            f"3. Competências comportamentais: {self.answer3}\n"
            f"4. Desafio enfrentado e aprendizado: {self.answer4}"
        )


class GeminiAPIError(Exception):
    """Erro levantado quando a chamada à API Gemini falha."""


def analyze_questionnaire(
    questionnaire: Questionnaire,
    *,
    api_key: Optional[str] = None,
    model: str = "gemini-2.5-flash",
) -> Dict[str, object]:
    """Envia as respostas do questionário para o modelo Gemini e retorna a análise.

    Parameters
    ----------
    questionnaire : Questionnaire
        Instância com as cinco respostas do candidato.
    api_key : Optional[str], default None
        Chave da API Gemini. Se não for fornecida, usa a variável de ambiente
        ``GEMINI_API_KEY``.
    model : str, default ``"gemini-2.5-flash"``
        Identificador do modelo a ser utilizado na requisição. Versões disponíveis
        incluem ``"gemini-pro"`` e variantes conforme a documentação oficial.

    Returns
    -------
    Dict[str, object]
        Um dicionário Python com chaves:
          - ``pontos_fortes``: lista de competências e habilidades em que o
            candidato se destaca.
          - ``pontos_a_melhorar``: lista de áreas que precisam de desenvolvimento.
          - ``recomendacoes``: lista de ações práticas para atingir o objetivo.
          - ``nivel``: string ``"iniciante"``, ``"intermediario"`` ou ``"pronto"``.
          - ``score``: inteiro de 0 a 100 indicando o nível de prontidão.
          - ``mensagem_motivacional``: mensagem encorajadora personalizada.

    Raises
    ------
    GeminiAPIError
        Se ocorrer um erro HTTP ou se a resposta da IA não puder ser analisada.
    """
    # Obtém a chave da API do ambiente caso não seja fornecida explicitamente.
    key = api_key or os.environ.get("GEMINI_API_KEY")
    if not key:
        raise GeminiAPIError(
            "Chave da API Gemini não encontrada. Defina a variável de ambiente "
            "GEMINI_API_KEY ou passe o argumento api_key."
        )

    # Monta prompts separados para a IA: um system_prompt e um user_prompt.
    system_prompt = (
        "Você é Nexo, um mentor de carreira que analisa respostas de um "
        "questionário e orienta jovens profissionais a alcançarem seus objetivos. "
        "Sua comunicação deve ser objetiva, construtiva e motivacional.\n\n"
        "Considere o objetivo profissional informado pelo candidato e suas "
        "competências atuais. Avalie se as habilidades e experiências atuais "
        "estão alinhadas com esse objetivo e retorne apenas um JSON conforme a "
        "estrutura a seguir:\n"
        "{\n"
        "  \"pontos_fortes\": [\"<competência1>\", \"<competência2>\", ...],\n"
        "  \"pontos_a_melhorar\": [\"<área1>\", \"<área2>\", ...],\n"
        "  \"recomendacoes\": [\"<sugestão1>\", \"<sugestão2>\", ...],\n"
        "  \"nivel\": \"iniciante\" | \"intermediario\" | \"pronto\",\n"
        "  \"score\": <0‑100>,\n"
        "  \"mensagem_motivacional\": \"<mensagem de incentivo>\"\n"
        "}\n\n"
        "Analise cuidadosamente as competências e o objetivo. Se faltar alguma "
        "habilidade essencial para alcançar o objetivo, indique-a em `pontos_a_melhorar` "
        "e proponha-a também nas recomendações. Sempre finalize com uma "
        "mensagem positiva."
    )

    user_prompt = questionnaire.to_prompt()

    # A API Gemini espera uma lista de Content objects dentro de 'contents'. Para
    # prompts simples, podemos enviar um único Content com todas as instruções.
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": system_prompt + "\n\n" + user_prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json"
        }

    }

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

    )
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": key,  # cabeçalho exigido【33839709218578†L120-L133】
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=60)
    except Exception as exc:
        raise GeminiAPIError(f"Falha na requisição à API Gemini: {exc}") from exc

    if resp.status_code == 429:
        raise GeminiAPIError(
            "Limite de requisições excedido. Aguarde alguns instantes e tente novamente."
        )
    if not resp.ok:
        raise GeminiAPIError(
            f"Erro da API Gemini (status {resp.status_code}): {resp.text}"
        )

    data = resp.json()
    # Extrai o texto gerado do primeiro candidato. Consultar doc. de response.
    try:
        ai_text = (
            data["candidates"][0]["content"]["parts"][0]["text"]
        )
    except (KeyError, IndexError) as exc:
        raise GeminiAPIError(
            f"Resposta inesperada da API: {json.dumps(data)[:500]}"
        ) from exc

    # Converte o texto JSON retornado em dicionário Python
    try:
        analysis = json.loads(ai_text)
    except json.JSONDecodeError as exc:
        raise GeminiAPIError(
            f"Falha ao decodificar JSON retornado pela IA: {ai_text}"
        ) from exc

    return analysis


if __name__ == "__main__":
    # Exemplo de uso: coleta respostas do usuário via input e imprime a análise.
    print("=== Nexo Carreira: Análise via Gemini ===")
    print("Preencha suas respostas. Ao final, a IA fornecerá um feedback estruturado.\n")
    answers = []
    questions = [
        "Descreva sua experiência profissional, estágios ou trabalhos voluntários (se tiver):",
        "Quais são suas principais habilidades técnicas? (ferramentas, softwares, idiomas):",
        "Como você descreveria suas principais competências comportamentais?:",
        "Conte sobre um desafio que você enfrentou e o que aprendeu com ele:",
        "Quais são seus objetivos profissionais para os próximos 2 anos?:",
    ]
    for q in questions:
        answers.append(input(q + " \n> "))
    qnr = Questionnaire(*answers)
    try:
        result = analyze_questionnaire(qnr)
        print("\nAnálise completa:")
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except GeminiAPIError as err:
        print(f"Erro ao analisar questionário: {err}")
