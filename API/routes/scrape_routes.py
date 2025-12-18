import asyncio
from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from dtos.scraping_dto import ScrapeRequest
from services.scraper_service import ScraperService
from services.ai_service import AIService
from services.export_service import ExportService
from core.exceptions import InvalidAPIKeyError, InvalidURLError, ScrapingTimeoutError

scrape_bp = Blueprint('scrape', __name__)

@scrape_bp.route('/', methods=['POST'])
def compare_products():
    try:
        data = request.get_json()
        req = ScrapeRequest(**data)
        provider = req.provider.lower() if req.provider else "openai"

        try:
            AIService.verify_api_key(req.api_key, provider)
        except InvalidAPIKeyError as e:
            return jsonify({
                "status": "error",
                "message": "Falha na Autenticação da API",
                "details": str(e)
            }), 401

        valid_urls = []
        errors = []
        for url in req.urls:
            try:
                ScraperService.validate_url(url)
                valid_urls.append(url)
            except InvalidURLError as e:
                errors.append(f"URL ignorada ({url}): {str(e)}")

        if not valid_urls:
            return jsonify({
                "status": "error",
                "message": "Nenhuma URL válida fornecida.",
                "details": errors
            }), 400

        async def run_tasks(urls):
            tasks = [ScraperService.extract_content(url) for url in urls]
            return await asyncio.gather(*tasks, return_exceptions=True)

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        results = loop.run_until_complete(run_tasks(valid_urls))
        loop.close()

        scraped_results = {}
        for url, res in zip(valid_urls, results):
            if isinstance(res, Exception):
                scraped_results[url] = f"ERRO: {str(res)}"
            else:
                scraped_results[url] = res

        prompt = AIService.build_prompt(scraped_results, req.attributes)
        ai_data = AIService.get_comparison_data(
            prompt=prompt, 
            api_key=req.api_key, 
            provider=provider
        )

        filename = ExportService.generate_excel(ai_data, req.attributes)
        download_url = f"/api/export/download/{filename}"

        return jsonify({
            "status": "success",
            "message": "Processamento concluído.",
            "url_errors": errors,
            "data": ai_data,
            "download_link": download_url
        })

    except ValidationError as e:
        return jsonify({"error": "Erro de validação de dados", "details": e.errors()}), 422
    except Exception as e:
        return jsonify({"error": "Erro interno do servidor", "details": str(e)}), 500