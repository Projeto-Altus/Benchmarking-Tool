import os
import re
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
        
        if 'pontuacao_final' in df.columns:
            df['pontuacao_final'] = pd.to_numeric(df['pontuacao_final'], errors='coerce')
            df = df.sort_values(by='pontuacao_final', ascending=False)

        if 'nome_produto' in df.columns:
            df['nome_produto'] = df['nome_produto'].fillna("Produto Sem Nome")
            df.set_index('nome_produto', inplace=True)
        else:
            df.index = [f"Opção {i+1}" for i in range(len(df))]

        fixed_fields = ['pontuacao_final', 'motivo_escolha', 'url_origem']
        attr_fields = [attr.name for attr in attributes]
        
        for f in fixed_fields + attr_fields:
            if f not in df.columns: df[f] = "N/A"
            
        df = df[fixed_fields + attr_fields]
        
        df_t = df.T
        
        label_map = {
            'pontuacao_final': '🏆 Pontuação (0-100)',
            'motivo_escolha': '💡 Análise da IA',
            'url_origem': '🔗 Link da Oferta'
        }
        for attr in attributes:
            label_map[attr.name] = f"{attr.name} (Peso: {attr.importance})"
            
        df_t.rename(index=label_map, inplace=True)
        
        df_t.reset_index(inplace=True)
        df_t.rename(columns={'index': 'ESPECIFICAÇÕES'}, inplace=True)
        
        if not os.path.exists(Config.DOWNLOAD_FOLDER):
            os.makedirs(Config.DOWNLOAD_FOLDER, exist_ok=True)

        filename = f"comparativo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        filepath = os.path.join(Config.DOWNLOAD_FOLDER, filename)
        
        df_t.to_excel(filepath, index=False, engine='openpyxl')

        wb = load_workbook(filepath)
        ws = wb.active

        header_fill = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")
        label_fill = PatternFill(start_color="E7E6E6", end_color="E7E6E6", fill_type="solid") 
        winner_fill = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid") 
        
        header_font = Font(color="FFFFFF", bold=True, size=11)
        bold_font = Font(bold=True)
        link_font = Font(color="0563C1", underline="single")
        
        thin_border = Border(left=Side(style='thin'), right=Side(style='thin'), 
                             top=Side(style='thin'), bottom=Side(style='thin'))
        
        center_align = Alignment(horizontal='center', vertical='center', wrap_text=True)
        left_align = Alignment(horizontal='left', vertical='center', wrap_text=True)

        ws.column_dimensions['A'].width = 25
        for col_idx in range(2, ws.max_column + 1):
            col_letter = get_column_letter(col_idx)
            ws.column_dimensions[col_letter].width = 35

        for row in ws.iter_rows(min_row=1, max_row=ws.max_row, min_col=1, max_col=ws.max_column):
            for cell in row:
                cell.border = thin_border
                cell.alignment = center_align 

                if cell.row == 1:
                    cell.fill = header_fill
                    cell.font = header_font
                    continue

                if cell.column == 1:
                    cell.fill = label_fill
                    cell.font = bold_font
                    cell.alignment = left_align
                    continue

                if cell.column == 2:
                    cell.fill = winner_fill
                    if "Pontuação" in ws.cell(row=cell.row, column=1).value:
                        cell.font = bold_font

                row_label = str(ws.cell(row=cell.row, column=1).value).lower()
                val_str = str(cell.value)

                if "link" in row_label and cell.value and "http" in str(cell.value):
                    cell.hyperlink = cell.value
                    cell.value = "Ver Oferta 🔗"
                    cell.font = link_font
                
                elif ("preço" in row_label or "valor" in row_label) and cell.value != "N/A":
                    try:
                        if isinstance(cell.value, str):
                            clean_val = re.sub(r'[^\d.]', '', cell.value)
                            if clean_val:
                                cell.value = float(clean_val)
                        cell.number_format = 'R$ #,##0.00'
                    except: pass

                elif len(val_str) > 40:
                    cell.alignment = left_align

        wb.save(filepath)
        return filename