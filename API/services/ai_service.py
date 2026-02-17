import json
import re
from google import genai
from openai import OpenAI
from typing import List, Dict
from ..core.exceptions import InvalidAPIKeyError

class AIService:
    @staticmethod
    def verify_api_key(api_key: str, provider: str):
        if not api_key:
            raise InvalidAPIKeyError("A chave de API não foi fornecida.")
        try:
            if provider == "openai":
                client = OpenAI(api_key=api_key)
                client.models.list()
            elif provider == "deepseek":
                client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
                client.models.list()
            elif provider == "google":
                client = genai.Client(api_key=api_key)
                next(iter(client.models.list()))
            else:
                raise InvalidAPIKeyError(f"Provedor '{provider}' não suportado.")
        except Exception:
            raise InvalidAPIKeyError(f"A chave de API fornecida é inválida para o provedor {provider}.")

    @staticmethod
    def build_prompt(scraped_data: Dict[str, str], attributes: List[object]) -> str:
        attrs_formatted = "\n".join([f"- {attr.name} (Peso: {attr.importance}/10)" for attr in attributes])
        attr_names = ", ".join([attr.name for attr in attributes])

        prompt = (
            "Você é um assistente especialista em compras e análise técnica.\n"
            "Sua tarefa é analisar os dados brutos de scraping, extrair informações precisas e ranquear os produtos.\n\n"
            
            f"--- ATRIBUTOS E PESOS (IMPORTÂNCIA) ---\n"
            f"{attrs_formatted}\n\n"
            
            "--- REGRAS DE EXTRAÇÃO E CONFIABILIDADE ---\n"
            "1. PRIORIDADE TOTAL: Extraia os dados técnicos diretamente do conteúdo fornecido.\n"
            "2. AUTOCOMPLETAR: Se um atributo NÃO estiver no site, use seu conhecimento e adicione '(est.)' ao valor. Ex: '5000 mAh (est.)'.\n"
            "3. STATUS DE CONFIABILIDADE: 'high' (fiel), 'medium' (alguns campos estimados), 'low' (fallback total).\n\n"
            
            "--- REGRAS DO CAMPO 'motivo_escolha' ---\n"
            "Escreva uma análise técnica e fluida sobre o produto. \n"
            "- FOCO: Justifique a nota baseada nos atributos mais fortes e na comparação com os rivais da lista.\n"
            "- ADENDO DE CONFIABILIDADE: Apenas se houver falha significativa no scraping ou muitos dados estimados, inclua uma breve explicação dentro do texto sobre a necessidade de estimar os dados para manter a análise justa.\n"
            "- Evite frases robóticas como 'Extração completa'. Fale como um consultor de tecnologia.\n\n"
            
            "--- LÓGICA DE PONTUAÇÃO (0-100) ---\n"
            "1. NOTA BASE: Primeiro, calcule a pontuação técnica real do produto baseada nos pesos dos atributos (como se a extração fosse perfeita).\n"
            "2. APLICAÇÃO DE PENALIDADE (SOBRE A NOTA BASE):\n"
            "   - Se 'reliability_score' é 'high': Penalidade 0%. (Manter Nota Base).\n"
            "   - Se 'reliability_score' é 'medium': Aplique uma dedução única de 10% sobre a Nota Base.\n"
            "   - Se 'generated_by_ai' é true ('low'): Aplique uma dedução única de 30% sobre a Nota Base.\n"
            "3. O campo 'pontuacao_final' deve ser o resultado final desse cálculo. Evite penalidades duplas.\n\n"
            
            "--- REGRAS DE RESPOSTA (JSON) ---\n"
            "1. Retorne APENAS um JSON válido.\n"
            "2. NÃO COLOQUE NOTAS (0-10) nos campos de atributos. Use VALORES REAIS.\n"
            "3. Defina 'generated_by_ai': true APENAS em casos de Fallback Total (scraping vazio/bloqueado).\n"
            f"4. Campos obrigatórios: 'url_origem', 'nome_produto', 'pontuacao_final', 'motivo_escolha', 'generated_by_ai', 'reliability_score' e os atributos: {attr_names}.\n\n"
            
            "--- DADOS DOS SITES ---\n"
        )

        for url, content in scraped_data.items():
            prompt += f"\n>>> PRODUTO (URL: {url}):\n{content[:40000]}\n"
        return prompt

    @staticmethod
    def get_comparison_data(prompt: str, api_key: str, provider: str = "openai") -> List[Dict]:
        try:
            raw_text = ""
            if provider == "openai":
                client = OpenAI(api_key=api_key)
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a helpful data extraction assistant that outputs only valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2,
                    response_format={"type": "json_object"}
                )
                raw_text = response.choices[0].message.content
            elif provider == "deepseek":
                client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
                response = client.chat.completions.create(
                    model="deepseek-chat",
                    messages=[
                        {"role": "system", "content": "You are a helpful data extraction assistant that outputs only valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2
                )
                raw_text = response.choices[0].message.content
            elif provider == "google":
                client = genai.Client(api_key=api_key)
                response = client.models.generate_content(
                    model='gemini-2.5-flash', 
                    contents=prompt
                )
                raw_text = response.text
            
            clean_text = raw_text.replace("```json", "").replace("```", "").strip()
            if not (clean_text.startswith("{") or clean_text.startswith("[")):
                match = re.search(r'(\{.*\}|\[.*\])', clean_text, re.DOTALL)
                if match: clean_text = match.group(0)

            data = json.loads(clean_text)
            raw_list = []
            if isinstance(data, dict):
                raw_list = data.get("result", data.get("data", data.get("products", [data])))
            elif isinstance(data, list):
                raw_list = data
            
            if isinstance(raw_list, dict): raw_list = [raw_list]

            merged_data = {}
            for item in raw_list:
                url = item.get("url_origem")
                if not url: continue
                if url not in merged_data:
                    merged_data[url] = item
                else:
                    merged_data[url].update(item)

            return list(merged_data.values())
        except Exception as e:
            return [{"error": f"Erro na comunicação com a IA: {str(e)}"}]