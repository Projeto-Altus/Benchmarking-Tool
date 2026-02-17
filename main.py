import eel
import os
import sys
import threading
import asyncio

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

def resource_path(relative_path):
    base_path = getattr(sys, '_MEIPASS', os.path.abspath("."))
    return os.path.join(base_path, relative_path)

WEB_FOLDER = resource_path('APP/dist')
sys.path.append(resource_path('.'))
sys.path.append(resource_path('API'))

try:
    from API.app import create_app
except Exception as e:
    sys.exit(1)

def run_flask():
    app = create_app()
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)

def on_close(page, sockets):
    os._exit(0)

threading.Thread(target=run_flask, daemon=True).start()

eel.init(WEB_FOLDER)

if __name__ == '__main__':
    eel.start(
        'index.html', 
        mode='chrome',
        port=54321, 
        cmdline_args=[
            '--start-maximized', 
            '--app=http://localhost:54321/index.html', 
            '--new-window', 
            '--disable-extensions'
        ],
        close_callback=on_close
    )