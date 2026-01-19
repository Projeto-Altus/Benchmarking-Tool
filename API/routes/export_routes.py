from flask import Blueprint, send_from_directory, jsonify
from core.config import Config

export_bp = Blueprint('export', __name__)

@export_bp.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    try:
        return send_from_directory(Config.DOWNLOAD_FOLDER, filename, as_attachment=True)
    except Exception as e:
        return jsonify({"error": "Arquivo não encontrado."}), 404