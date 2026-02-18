const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

app.setAppUserModelId("com.altus.benchmarking");

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

  mainWindow.setMenu(null);

  const indexPath = path.join(__dirname, 'APP/dist/index.html');
  mainWindow.loadFile(indexPath);

  const isPackaged = app.isPackaged;
  
  const pythonPath = isPackaged 
    ? path.join(process.resourcesPath, 'backend', 'api_backend.exe') 
    : 'python';

  const pythonArgs = isPackaged ? [] : ['main_backend.py'];

  console.log(`Iniciando backend em: ${pythonPath}`);
  
  pythonProcess = spawn(pythonPath, pythonArgs, {
    windowsHide: true 
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Erro no Python: ${data}`);
  });

  pythonProcess.on('error', (err) => {
    console.error('Falha ao iniciar o processo do backend:', err);
  });

  mainWindow.on('closed', () => {
    if (pythonProcess) {
        pythonProcess.kill('SIGINT');
        pythonProcess = null;
    }
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (pythonProcess) {
      pythonProcess.kill('SIGINT');
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});