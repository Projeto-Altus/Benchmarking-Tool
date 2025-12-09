import random
import time
import os
import validators
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
from core.config import Config
from core.exceptions import InvalidURLError, ScrapingTimeoutError

class ScraperService:
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ]

    @staticmethod
    def save_debug(page, tag):
        try:
            timestamp = int(time.time())
            filename = f"debug_{timestamp}_{tag}"
            path_img = os.path.join(Config.DOWNLOAD_FOLDER, f"{filename}.png")
            page.screenshot(path=path_img, full_page=True)
        except Exception:
            pass

    @staticmethod
    def validate_url(url: str):
        if not url:
            raise InvalidURLError("URL vazia.")
        
        if not validators.url(url):
             raise InvalidURLError(f"URL mal formatada: {url}")
        
        parsed = urlparse(url)
        if parsed.scheme not in ('http', 'https'):
            raise InvalidURLError(f"Protocolo inválido (apenas http/https): {url}")
            
        if not parsed.netloc:
            raise InvalidURLError(f"Domínio não encontrado: {url}")

    @staticmethod
    def human_sleep(a=1.0, b=2.5):
        time.sleep(random.uniform(a, b))

    @staticmethod
    def extract_content(url: str, timeout: int = 30) -> str:
        ScraperService.validate_url(url)

        browser = None
        page = None
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=Config.HEADLESS,
                    args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
                )

                context = browser.new_context(
                    user_agent=random.choice(ScraperService.USER_AGENTS),
                    viewport={"width": 1920, "height": 1080}
                )

                page = context.new_page()
                
                timeout_ms = timeout * 1000 
                page.set_default_timeout(timeout_ms)
                page.set_default_navigation_timeout(timeout_ms)

                try:
                    page.goto(url, wait_until="domcontentloaded")
                except PlaywrightTimeout:
                    ScraperService.save_debug(page, "timeout")
                    raise ScrapingTimeoutError(f"Timeout de {timeout}s atingido ao carregar {url}")

                try:
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    ScraperService.human_sleep(1, 2)
                except:
                    pass

                content = page.inner_text("body")
                
                if len(content) < 200:
                    ScraperService.save_debug(page, "blocked")
                    raise Exception("Conteúdo insuficiente ou bloqueio detectado.")

                return content[:100000]

        except ScrapingTimeoutError as e:
            raise e
        except Exception as e:
            if page:
                ScraperService.save_debug(page, "error")
            raise Exception(f"Erro sistêmico no scraping: {str(e)}")
        finally:
            if browser:
                try: browser.close()
                except: pass