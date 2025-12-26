import json
from google import genai
from openai import OpenAI
from typing import List, Dict
from core.exceptions import InvalidAPIKeyError

class AIService:
    @staticmethod
    def verify_api_key(api_key: str, provider: str):
        if not api_key:
            raise InvalidAPIKeyError("A chave de API não foi fornecida.")
        try:
            if provider == "openai":
                client = OpenAI(api_key=api_key)
                client.models.list()
            elif provider == "google":
                client = genai.Client(api_key=api_key)
                next(iter(client.models.list()))
            else:
                raise InvalidAPIKeyError(f"Provedor '{provider}' não suportado.")
        except Exception:
            raise InvalidAPIKeyError(f"A chave de API fornecida é inválida para o provedor {provider}.")

    @staticmethod
    def build_prompt(scraped_data: Dict[str, str], attributes: List[str]) -> str:
        prompt = (
            "Você é um assistente de inteligência de mercado. "
            "Analise os textos crus extraídos de páginas web abaixo e extraia as informações solicitadas.\n\n"
            f"ATRIBUTOS PARA EXTRAIR: {', '.join(attributes)}\n\n"
            "--- REGRAS DE RESPOSTA ---\n"
            "1. Retorne APENAS um JSON válido.\n"
            "2. O formato deve ser uma LISTA de objetos.\n"
            "3. Cada objeto deve conter 'url_origem' e conter TODOS os atributos solicitados.\n"
            "4. Se a informação não existir, preencha com 'N/A'.\n"
            "5. Não utilize blocos de markdown, retorne apenas o texto do JSON puro.\n\n"
            "--- DADOS DOS SITES ---\n"
        )
        for url, content in scraped_data.items():
            prompt += f"\n>>> SITE (URL: {url}):\n{content[:50000]}\n"
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
            elif provider == "google":
                client = genai.Client(api_key=api_key)
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt
                )
                raw_text = response.text
            
            clean_text = raw_text.replace("```json", "").replace("```", "").strip()
            if not (clean_text.startswith("{") or clean_text.startswith("[")):
                import re
                match = re.search(r'(\{.*\}|\[.*\])', clean_text, re.DOTALL)
                if match:
                    clean_text = match.group(0)

            data = json.loads(clean_text)
            raw_list = []
            if isinstance(data, dict):
                if "result" in data: raw_list = data["result"]
                elif "data" in data: raw_list = data["data"]
                else: raw_list = [data]
            elif isinstance(data, list):
                raw_list = data

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