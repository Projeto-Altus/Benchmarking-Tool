import os

class Config:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DOWNLOAD_FOLDER = os.path.join(BASE_DIR, 'downloads')
    PLAYWRIGHT_TIMEOUT = 30000
    HEADLESS = True
    os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)