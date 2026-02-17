import asyncio
import random
import os
import time
import shutil
from urllib.parse import urlparse
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from ..core.config import Config
from ..core.exceptions import InvalidURLError

SEMAPHORE = asyncio.Semaphore(3)

class ScraperService:
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    ]

    @staticmethod
    def clear_downloads_folder():
        folder = os.path.abspath(Config.DOWNLOAD_FOLDER)
        try:
            if os.path.exists(folder):
                shutil.rmtree(folder, ignore_errors=True)
            os.makedirs(folder, exist_ok=True)
            print(f">>> [LIMPEZA] Pasta preparada: {folder}")
        except Exception as e:
            print(f">>> [ERRO LIMPEZA] {e}")

    @staticmethod
    def clean_url(url: str) -> str:
        return url.strip() if url else ""

    @staticmethod
    def validate_url(url: str):
        if not url:
            raise InvalidURLError("URL vazia.")
        parsed = urlparse(url)
        if parsed.scheme not in ('http', 'https') or not parsed.netloc:
            raise InvalidURLError(f"URL inválida: {url}")

    @staticmethod
    async def save_debug(page, tag):
        try:
            if page.is_closed(): return
            folder = Config.DOWNLOAD_FOLDER
            os.makedirs(folder, exist_ok=True)
            filename = f"err_{int(time.time())}_{tag[:15]}.png"
            await page.screenshot(path=os.path.join(folder, filename))
        except:
            pass

    @classmethod
    async def extract_content(cls, url: str, timeout: int = 40) -> str:
        current_url = cls.clean_url(url)
        cls.validate_url(current_url)
        print(f"\n[INICIANDO] {current_url[:60]}")
        max_retries = 2
        last_error = "Não foi possível carregar o conteúdo."

        async with SEMAPHORE:
            for attempt in range(max_retries + 1):
                browser = None
                try:
                    async with async_playwright() as p:
                        browser = await p.chromium.launch(
                            headless=Config.HEADLESS,
                            args=[
                                "--no-sandbox",
                                "--disable-blink-features=AutomationControlled",
                                "--disable-web-security",
                                "--disable-features=IsolateOrigins,site-per-process",
                                "--blink-settings=primaryHoverAnimateFinished=true"
                            ]
                        )
                        context = await browser.new_context(
                            user_agent=random.choice(cls.USER_AGENTS),
                            viewport={"width": 1280, "height": 800},
                            locale="pt-BR",
                            extra_http_headers={"Accept-Language": "pt-BR,pt;q=0.9"}
                        )
                        page = await context.new_page()
                        await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
                        
                        timeout_ms = timeout * 1000
                        page.set_default_timeout(timeout_ms)

                        await page.goto(current_url, wait_until="domcontentloaded", timeout=timeout_ms)
                        await asyncio.sleep(random.uniform(5, 7))
                        
                        await page.mouse.wheel(0, 800)
                        await asyncio.sleep(2)

                        content = await page.inner_text("body")
                        if len(content.strip()) > 5000:
                            print(f"[SUCESSO] {len(content)} chars: {current_url[:30]}")
                            return content[:120000]
                        
                        last_error = f"Conteúdo insuficiente ({len(content)} chars)."
                        await cls.save_debug(page, f"fail_{attempt}")
                except Exception as e:
                    last_error = str(e)[:100]
                    print(f"[AVISO] Tentativa {attempt + 1}: {last_error}")
                finally:
                    if browser: await browser.close()

                if attempt < max_retries:
                    await asyncio.sleep(random.uniform(3, 5))

        return f"PRODUTO_INDISPONIVEL_ERRO: {last_error}"

    @classmethod
    async def scrape_batch(cls, urls: list, timeout: int = 45):
        cls.clear_downloads_folder()
        tasks = [cls.extract_content(url, timeout) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        final_results = []
        for res in results:
            if isinstance(res, Exception):
                final_results.append(f"ERRO_CRITICO_SISTEMA: {str(res)}")
            else:
                final_results.append(res)
        return final_results