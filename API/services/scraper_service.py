import asyncio
import random
import os
import time
import validators
from urllib.parse import urlparse
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from core.config import Config
from core.exceptions import InvalidURLError, ScrapingTimeoutError

class ScraperService:
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ]

    @staticmethod
    def clean_url(url: str) -> str:
        return url.strip()

    @staticmethod
    async def save_debug(page, tag):
        try:
            timestamp = int(time.time())
            filename = f"debug_{timestamp}_{tag}.png"
            path_img = os.path.join(Config.DOWNLOAD_FOLDER, filename)
            await page.screenshot(path=path_img, full_page=True)
            print(f">>> [SCREENSHOT] Salvo: {filename}")
        except Exception as e:
            print(f">>> [ERRO SCREENSHOT] {str(e)}")

    @staticmethod
    def validate_url(url: str):
        if not url:
            raise InvalidURLError("URL vazia.")
        
        parsed = urlparse(url)
        if parsed.scheme not in ('http', 'https') or not parsed.netloc:
            raise InvalidURLError(f"Protocolo ou domínio inválido: {url}")
        
        if not validators.url(url):
             print(f">>> [AVISO] URL complexa detectada. Ignorando trava do validador para tentar o acesso.")

    @classmethod
    async def apply_stealth(cls, page):
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
            window.chrome = { runtime: {} };
            Object.defineProperty(navigator, 'languages', {get: () => ['pt-BR', 'pt', 'en-US', 'en']});
            Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
        """)

    @classmethod
    async def extract_content(cls, url: str, timeout: int = 30) -> str:
        current_url = cls.clean_url(url)
        print(f"\n{'='*60}\n[PROCESSO] Iniciando acesso: {current_url}")
        
        try:
            cls.validate_url(current_url)
        except InvalidURLError as e:
            print(f"[ABORTADO] {str(e)}")
            raise e

        last_error = None
        max_retries = 3

        for attempt in range(max_retries):
            print(f"[TENTATIVA {attempt + 1}/{max_retries}] Abrindo navegador...")
            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    headless=Config.HEADLESS,
                    args=[
                        "--disable-blink-features=AutomationControlled",
                        "--no-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-web-security"
                    ]
                )
                
                context = await browser.new_context(
                    user_agent=random.choice(cls.USER_AGENTS),
                    viewport={"width": 1920, "height": 1080}
                )
                
                page = await context.new_page()
                await cls.apply_stealth(page)
                
                if attempt == 0:
                    await page.route("**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,otf}", lambda route: route.abort())

                timeout_ms = timeout * 1000
                page.set_default_timeout(timeout_ms)

                try:
                    await page.goto(current_url, wait_until="domcontentloaded", timeout=timeout_ms)
                    
                    wait_time = 5 + (attempt * 2)
                    print(f"[AGUARDANDO] {wait_time}s para renderização completa...")
                    await asyncio.sleep(wait_time)
                    
                    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    await asyncio.sleep(2)

                    content = await page.inner_text("body")
                    char_count = len(content)
                    print(f"[INFO] {char_count} caracteres extraídos.")

                    await cls.save_debug(page, f"tentativa_{attempt}_final")

                    if char_count > 500 and "captcha" not in content.lower():
                        print(f"[SUCESSO] Scraping finalizado.")
                        await browser.close()
                        return content[:100000]
                    
                    if char_count < 200:
                        raise Exception("Conteúdo insuficiente (Página de bloqueio ou erro).")
                    
                    print(f"[AVISO] Conteúdo capturado pode estar incompleto.")
                    return content[:100000]

                except PlaywrightTimeout:
                    print(f"[TIMEOUT] A página demorou demais para responder.")
                    last_error = ScrapingTimeoutError(f"Timeout de {timeout}s")
                except Exception as e:
                    print(f"[ERRO TÉCNICO] {str(e)}")
                    last_error = e
                finally:
                    await browser.close()
            
            if attempt < max_retries - 1:
                delay = random.uniform(3, 6)
                print(f"[REPETIR] Nova tentativa em {delay:.1f}s...")
                await asyncio.sleep(delay)

        print(f"[FALHA] Não foi possível obter os dados de {current_url}")
        raise last_error