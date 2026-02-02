from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class AttributeItem(BaseModel):
    name: str
    importance: int

class ScrapeRequest(BaseModel):
    urls: List[str]
    attributes: List[AttributeItem]
    api_key: Optional[str] = None
    provider: Optional[str] = "google"

class ProductComparisonResult(BaseModel):
    url_origem: str
    nome_produto: str
    pontuacao_final: float
    motivo_escolha: str
    generated_by_ai: bool
    reliability_score: str
    atributos: Dict[str, Any]