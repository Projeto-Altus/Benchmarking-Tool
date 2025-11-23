import random
import time
from playwright.sync_api import sync_playwright
from core.config import Config


class ScraperService:

    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Linux; Android 11; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
    ]

    @staticmethod
    def human_sleep(a=0.3, b=1.7):
        time.sleep(random.uniform(a, b))

    @staticmethod
    def extract_content(url: str, retries: int = 3) -> str:
        print(f"[Scraper] Iniciando scraping: {url}")

        for attempt in range(1, retries + 1):
            try:
                with sync_playwright() as p:
                    browser = p.chromium.launch(
                        headless=Config.HEADLESS,
                        args=[
                            "--disable-blink-features=AutomationControlled",
                            "--disable-web-security",
                            "--disable-features=IsolateOrigins,site-per-process"
                        ]
                    )

                    user_agent = random.choice(ScraperService.USER_AGENTS)

                    context = browser.new_context(
                        user_agent=user_agent,
                        locale="pt-BR",
                        timezone_id="America/Sao_Paulo",
                        viewport={
                            "width": random.choice([1366, 1440, 1920]),
                            "height": random.choice([768, 900, 1080])
                        },
                        java_script_enabled=True,
                        color_scheme="light",
                        ignore_https_errors=True,
                    )

                    page = context.new_page()

                    page.set_extra_http_headers({
                        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                        "Referer": url,
                        "DNT": "1",
                        "Upgrade-Insecure-Requests": "1",
                        "Sec-Fetch-Site": "same-origin",
                        "Sec-Fetch-Mode": "navigate",
                        "Sec-Fetch-Dest": "document",
                    })

                    ScraperService.human_sleep()

                    page.goto(url, wait_until="networkidle", timeout=Config.PLAYWRIGHT_TIMEOUT)

                    ScraperService.human_sleep()

                    page.mouse.move(
                        random.randint(100, 800),
                        random.randint(100, 600)
                    )

                    ScraperService.human_sleep()

                    content = page.inner_text("body")
                    clean = " ".join(content.split())

                    browser.close()

                    return clean[:15000]

            except Exception as e:
                print(f"[Scraper] Tentativa {attempt}/{retries} falhou: {e}")

                if attempt < retries:
                    time.sleep(random.uniform(1.5, 3.2))
                else:
                    return f"Erro final ao acessar {url}: {str(e)}"
