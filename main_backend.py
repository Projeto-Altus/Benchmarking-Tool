import os
import sys

if getattr(sys, 'frozen', False):
    backend_dir = os.path.dirname(sys.executable)
    playwright_path = os.path.abspath(os.path.join(backend_dir, '..', 'playwright'))
    
    os.environ['PLAYWRIGHT_BROWSERS_PATH'] = playwright_path

from API.app import create_app

sys.path.append(os.path.abspath("."))
sys.path.append(os.path.abspath("API"))

app = create_app()

if __name__ == '__main__':
    print(">>> [SISTEMA] Motor Altus ligado na porta 5000")
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)