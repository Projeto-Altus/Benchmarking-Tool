import os
import pandas as pd
from datetime import datetime
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from core.config import Config

class ExportService:
    @staticmethod
    def generate_excel(data: list, attributes: list) -> str:
        df = pd.DataFrame(data)
        
        for attr in attributes:
            if attr not in df.columns:
                df[attr] = "N/A"
        
        if not os.path.exists(Config.DOWNLOAD_FOLDER):
            os.makedirs(Config.DOWNLOAD_FOLDER, exist_ok=True)

        filename = f"comparativo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        filepath = os.path.join(Config.DOWNLOAD_FOLDER, filename)
        
        df.to_excel(filepath, index=False, engine='openpyxl')

        wb = load_workbook(filepath)
        ws = wb.active

        header_fill = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")
        header_font = Font(color="FFFFFF", bold=True, size=11)
        link_font = Font(color="0563C1", underline="single")
        thin_border = Border(left=Side(style='thin'), right=Side(style='thin'), 
                             top=Side(style='thin'), bottom=Side(style='thin'))
        center_align = Alignment(horizontal='center', vertical='center')
        left_align = Alignment(horizontal='left', vertical='center')

        for col_idx, column_cells in enumerate(ws.columns, start=1):
            col_letter = get_column_letter(col_idx)
            header_cell = column_cells[0]
            header_text = str(header_cell.value) if header_cell.value else ""

            header_cell.fill = header_fill
            header_cell.font = header_font
            header_cell.alignment = center_align

            max_length = 0
            for cell in column_cells:
                try:
                    txt_len = len(str(cell.value))
                    if txt_len > max_length: max_length = txt_len
                except: pass
            
            adjusted_width = max_length + 2
            if adjusted_width > 50: adjusted_width = 50
            if adjusted_width < 15: adjusted_width = 15
            ws.column_dimensions[col_letter].width = adjusted_width

            for cell in column_cells[1:]:
                cell.border = thin_border
                cell.alignment = center_align

                val_str = str(cell.value).lower() if cell.value else ""

                if header_text == "url_origem" and cell.value:
                    long_url = cell.value
                    cell.value = "Ver Oferta 🔗"
                    cell.hyperlink = long_url
                    cell.font = link_font

                elif "preço" in header_text.lower() or "valor" in header_text.lower():
                    try:
                        if isinstance(cell.value, str):
                            clean_val = cell.value.replace("R$", "").replace(".", "").replace(",", ".").strip()
                            cell.value = float(clean_val)
                        cell.number_format = 'R$ #,##0.00'
                    except:
                        pass
                
                elif len(val_str) > 30:
                    cell.alignment = left_align

        wb.save(filepath)
        
        return filename