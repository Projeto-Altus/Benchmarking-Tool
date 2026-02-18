# =================================================================
# Altus Benchmarking Pro - Script de Build Automatizado (Local)
# =================================================================

Write-Host ">>> [1/5] Iniciando Build do Frontend (React)..." -ForegroundColor Cyan
cd APP
npm install
npm run build
cd ..

Write-Host "`n>>> [2/5] Configurando Ambiente Python e Playwright..." -ForegroundColor Cyan
.\venv_altus\Scripts\Activate.ps1
pip install -r requirements.txt
pip install pyinstaller

$env:PLAYWRIGHT_BROWSERS_PATH="resources/playwright"
Write-Host "Baixando Chromium (900MB)... Isso pode demorar." -ForegroundColor Yellow
python -m playwright install chromium

Write-Host "`n>>> [3/5] Compilando Backend com PyInstaller..." -ForegroundColor Cyan
python -m PyInstaller --noconfirm --onefile --noconsole --name api_backend --paths "." main_backend.py

Write-Host "`n>>> [4/5] Organizando Binários para o Electron..." -ForegroundColor Cyan
if (!(Test-Path "resources/backend")) { New-Item -ItemType Directory -Path "resources/backend" }
copy dist\api_backend.exe resources\backend\api_backend.exe

Write-Host "`n>>> [5/5] Gerando Instalador Final (Electron)..." -ForegroundColor Cyan
npm install
npm run build

Write-Host "`n=========================================================" -ForegroundColor Green
Write-Host " BUILD CONCLUÍDO COM SUCESSO! " -ForegroundColor Green
Write-Host " O instalador está em: .\APP\dist_electron\" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green