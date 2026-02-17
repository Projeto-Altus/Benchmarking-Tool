import os
import sys
from API.app import create_app

sys.path.append(os.path.abspath("."))
sys.path.append(os.path.abspath("API"))

app = create_app()

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)