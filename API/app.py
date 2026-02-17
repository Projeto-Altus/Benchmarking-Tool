from flask import Flask, jsonify
from flask_cors import CORS
from routes.scrape_routes import scrape_bp
from routes.export_routes import export_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(scrape_bp, url_prefix="/api/scrape")
    app.register_blueprint(export_bp, url_prefix="/api/export")

    @app.route("/", methods=['GET'])
    def index():
        return jsonify({
            "message": "Benchmarking Tool API is running.",
            "endpoints": {
                "scrape": "POST /api/scrape",
                "download": "GET /api/export/download/<filename>"
            }
        })

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)