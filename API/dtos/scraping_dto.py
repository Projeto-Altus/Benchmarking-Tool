from typing import List, Optional
from pydantic import BaseModel

class ScrapeRequest(BaseModel):
    urls: List[str]
    attributes: List[str]
    api_key: Optional[str] = None
    provider: Optional[str] = "openai"