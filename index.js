const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'assets/app.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Remove a barra de menus superior
  mainWindow.setMenu(null);

  // Carrega o front-end React
  const indexPath = path.join(__dirname, 'APP/dist/index.html');
  mainWindow.loadFile(indexPath);

  // Configuração do Backend Sidecar
  const isPackaged = app.isPackaged;
  
  // Define o caminho do executável ou do script python
  const pythonPath = isPackaged 
    ? path.join(process.resourcesPath, 'backend', 'api_backend.exe') 
    : 'python';

  const pythonArgs = isPackaged ? [] : ['main_backend.py'];

  console.log(`Iniciando backend em: ${pythonPath}`);
  
  // Inicia o processo do backend
  pythonProcess = spawn(pythonPath, pythonArgs, {
    windowsHide: true // Esconde a janela do terminal do Python
  });

  // Log de erros para ajudar no seu debug em produção
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Erro no Python: ${data}`);
  });

  // Captura se o executável falhar ao abrir (ex: antivírus bloqueando)
  pythonProcess.on('error', (err) => {
    console.error('Falha ao iniciar o processo do backend:', err);
  });

  mainWindow.on('closed', () => {
    // Mata o processo Python ao fechar a janela principal
    if (pythonProcess) {
        pythonProcess.kill('SIGINT');
        pythonProcess = null;
    }
    mainWindow = null;
  });
}

// Inicialização do Electron
app.whenReady().then(createWindow);

// Garante o fechamento total no Windows
app.on('window-all-closed', () => {
  if (pythonProcess) {
      pythonProcess.kill('SIGINT');
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});