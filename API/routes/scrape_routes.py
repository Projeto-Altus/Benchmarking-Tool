from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from dtos.scraping_dto import ScrapeRequest
from services.scraper_service import ScraperService
from services.ai_service import AIService
from services.export_service import ExportService

scrape_bp = Blueprint('scrape', __name__)

@scrape_bp.route('/compare', methods=['POST'])
def compare_products():
    try:
        data = request.get_json()
        req = ScrapeRequest(**data)

        if not req.urls or not req.attributes:
            return jsonify({"error": "URLs e Atributos são obrigatórios"}), 400

        scraped_results = {}
        for url in req.urls:
            content = ScraperService.extract_content(url)
            scraped_results[url] = content

        prompt = AIService.build_prompt(scraped_results, req.attributes)
        ai_data = AIService.get_comparison_data(prompt, req.api_key)

        filename = ExportService.generate_excel(ai_data, req.attributes)

        download_url = f"/api/export/download/{filename}"

        return jsonify({
            "status": "success",
            "message": "Comparativo gerado.",
            "data": ai_data,
            "download_link": download_url
        })

    except ValidationError as e:
        return jsonify({"error": e.errors()}), 422
    except Exception as e:
        return jsonify({"error": str(e)}), 500