import asyncio
import random
import os
import time
import validators
import traceback
from urllib.parse import urlparse
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from core.config import Config
from core.exceptions import InvalidURLError, ScrapingTimeoutError

SEMAPHORE = asyncio.Semaphore(3)

class ScraperService:
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ]

    @staticmethod
    def clean_url(url: str) -> str:
        return url.strip()

    @staticmethod
    def validate_url(url: str):
        """Valida se a URL está bem formatada"""
        if not url:
            raise InvalidURLError("URL vazia.")
        
        parsed = urlparse(url)
        if parsed.scheme not in ('http', 'https') or not parsed.netloc:
            raise InvalidURLError(f"Protocolo ou domínio inválido: {url}")
        
        if not validators.url(url):
             print(f">>> [AVISO] URL complexa detectada: {url[:30]}...")

    @staticmethod
    async def save_debug(page, tag):
        """Salva screenshot garantindo que a pasta existe"""
        try:
            folder = Config.DOWNLOAD_FOLDER
            if not os.path.exists(folder):
                os.makedirs(folder, exist_ok=True)

            timestamp = int(time.time())
            safe_tag = "".join([c if c.isalnum() else "_" for c in tag])[-50:]
            filename = f"debug_{timestamp}_{safe_tag}.png"
            path_img = os.path.join(folder, filename)
            
            await page.screenshot(path=path_img, full_page=True)
            print(f">>> [SCREENSHOT] Salvo: {filename}")
        except Exception as e:
            print(f">>> [ERRO SCREENSHOT] Não foi possível salvar: {str(e)}")

    @classmethod
    async def apply_stealth(cls, page):
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
            window.chrome = { runtime: {} };
        """)

    @classmethod
    async def extract_content(cls, url: str, timeout: int = 40) -> str:
        current_url = cls.clean_url(url)
        print(f"\n{'='*60}\n[PROCESSO] Iniciando: {current_url}")
        
        try:
            cls.validate_url(current_url)
        except InvalidURLError as e:
            print(f"[ABORTADO] URL Inválida: {str(e)}")
            raise e

        last_error = None
        max_retries = 3

        async with SEMAPHORE:
            for attempt in range(max_retries):
                print(f"[TENTATIVA {attempt + 1}/{max_retries}] Abrindo navegador para {current_url[:30]}...")
                
                browser = None
                try:
                    async with async_playwright() as p:
                        browser = await p.chromium.launch(
                            headless=Config.HEADLESS,
                            args=["--no-sandbox", "--disable-dev-shm-usage"]
                        )
                        
                        context = await browser.new_context(
                            user_agent=random.choice(cls.USER_AGENTS),
                            viewport={"width": 1920, "height": 1080}
                        )
                        page = await context.new_page()
                        await cls.apply_stealth(page)

                        try:
                            timeout_ms = timeout * 1000
                            page.set_default_timeout(timeout_ms)
                            
                            response = await page.goto(current_url, wait_until="domcontentloaded", timeout=timeout_ms)
                            print(f"[DEBUG] Navegação OK (Status: {response.status if response else 'N/A'}). Renderizando...")
                            
                            await asyncio.sleep(5)
                            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                            await asyncio.sleep(2)
                            
                            content = await page.inner_text("body")
                            char_count = len(content)
                            print(f"[INFO] {char_count} caracteres extraídos.")

                            await cls.save_debug(page, f"SUCESSO_{current_url}")

                            if char_count > 200:
                                await browser.close()
                                return content[:100000]
                            
                            print("[AVISO] Página vazia.")
                            raise Exception("Conteúdo vazio")

                        except Exception as e_inner:
                            print(f"[ERRO NA NAVEGAÇÃO] {str(e_inner)}")
                            await cls.save_debug(page, f"ERRO_{current_url}")
                            raise e_inner

                except PlaywrightTimeout:
                    print(f"[TIMEOUT] A página demorou demais.")
                    last_error = ScrapingTimeoutError(f"Timeout de {timeout}s")
                except Exception as e:
                    print(f"[ERRO CRÍTICO] {str(e)}")
                    last_error = e
                finally:
                    if browser:
                        await browser.close()
                
                if attempt < max_retries - 1:
                    wait_retry = random.uniform(3, 6)
                    print(f"[REPETIR] Aguardando {wait_retry:.1f}s...")
                    await asyncio.sleep(wait_retry)

            print(f"[FALHA FINAL] Desistindo de {current_url}")
            return ""