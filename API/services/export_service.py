import os
import pandas as pd
from datetime import datetime
from core.config import Config

class ExportService:
    @staticmethod
    def generate_excel(data: list, attributes: list) -> str:
        df = pd.DataFrame(data)
        for attr in attributes:
            if attr not in df.columns:
                df[attr] = "N/A"
        filename = f"comparativo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        filepath = os.path.join(Config.DOWNLOAD_FOLDER, filename)
        df.to_excel(filepath, index=False)
        return filename