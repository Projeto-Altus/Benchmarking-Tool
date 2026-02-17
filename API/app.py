import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from .routes.scrape_routes import scrape_bp
from .routes.export_routes import export_bp
from .routes.notification_routes import notification_bp


def create_app():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    dist_path = os.path.join(base_dir, 'APP', 'dist')

    app = Flask(
        __name__,
        static_folder=dist_path,
        static_url_path=''
    )

    CORS(app)
    app.url_map.strict_slashes = False

    app.register_blueprint(scrape_bp, url_prefix="/api/scrape")
    app.register_blueprint(export_bp, url_prefix="/api/export")
    app.register_blueprint(notification_bp, url_prefix="/api")

    @app.route('/')
    def serve_index():
        return send_from_directory(dist_path, 'index.html')

    @app.route('/<path:path>')
    def serve_static(path):
        file_path = os.path.join(dist_path, path)
        if os.path.exists(file_path):
            return send_from_directory(dist_path, path)
        return send_from_directory(dist_path, 'index.html')

    return app
