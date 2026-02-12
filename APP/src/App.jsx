import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header/Header';
import ResultsDisplay from './components/ResultsDisplay/ResultsDisplay';
import InstructionsModal from './components/InstructionsModal/InstructionsModal';
import PasswordModal from './components/PasswordModal/PasswordModal';
import ConfigCard from './components/ConfigCard/ConfigCard'; 
import DataCard from './components/DataCard/DataCard'; 
import ReportView from './components/ReportView/ReportView'; 
import Dashboard from './components/Dashboard/Dashboard';
import WelcomeScreen from './components/WelcomeScreen/WelcomeScreen';

import { translations } from './constants/translations';
import { useBenchmarking } from './hooks/useBenchmarking';
import { exportConfig, importConfig } from './utils/fileHandler';
import { hasStoredApiKey, saveApiKey, loadApiKey } from './utils/cryptoUtils';
import { saveBenchmarkToHistory } from './utils/historyHandler';

function App() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'pt');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showInstructions, setShowInstructions] = useState(false);
  const t = translations[lang];

  const [userName, setUserName] = useState(localStorage.getItem('altus_username') || '');
  const [showWelcome, setShowWelcome] = useState(!localStorage.getItem('altus_username'));

  const [currentScreen, setCurrentScreen] = useState('dashboard');

  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState(localStorage.getItem('provider') || 'google');
  const [urlList, setUrlList] = useState([]);
  const [attrWithImportance, setAttrWithImportance] = useState([]);
  const [displayResults, setDisplayResults] = useState([]);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalMode, setPasswordModalMode] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showApiKeyPassword, setShowApiKeyPassword] = useState(false);

  const { generateBenchmark, results: hookResults, loading, error, statusMessage, downloadLink, clearResults } = useBenchmarking();

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('provider', provider); }, [provider]);
  useEffect(() => { setHasStoredKey(hasStoredApiKey()); }, []);

  useEffect(() => {
    if (hookResults && hookResults.length > 0 && urlList.length > 0 && attrWithImportance.length > 0) {
      setDisplayResults(hookResults); 
      const sorted = [...hookResults].sort((a, b) => (parseFloat(b.pontuacao_final) || 0) - (parseFloat(a.pontuacao_final) || 0));
      const winner = sorted[0];
      saveBenchmarkToHistory({
        title: `Benchmark ${winner.nome_produto?.substring(0, 20)}...`,
        winner: winner.nome_produto,
        winnerScore: winner.pontuacao_final || 0,
        itemCount: urlList.length,
        fullData: { urlList, attrWithImportance, results: hookResults }
      });
    }
  }, [hookResults, urlList, attrWithImportance]);

  const handleWelcomeComplete = (name) => {
    setUserName(name);
    localStorage.setItem('altus_username', name);
    setShowWelcome(false);
  };

  const handleLoadHistory = (historyItem) => {
    const data = historyItem.fullData;
    if (data) {
      setUrlList(data.urlList || []);
      setAttrWithImportance(data.attrWithImportance || []);
      setDisplayResults(data.results || []); 
      setCurrentScreen('analysis'); 
    }
  };

  const toggleLang = () => setLang(prev => prev === 'pt' ? 'en' : 'pt');
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const handleSaveApiKey = () => { if (!apiKey.trim()) { alert('Digite uma API Key'); return; } setPasswordModalMode('save'); setShowPasswordModal(true); };
  const handleLoadApiKey = () => { setPasswordModalMode('load'); setShowPasswordModal(true); };
  
  const handlePasswordConfirm = async (password) => {
    setPasswordLoading(true);
    try {
      if (passwordModalMode === 'save') { await saveApiKey(apiKey, password); setHasStoredKey(true); }
      else if (passwordModalMode === 'load') { const decryptedKey = await loadApiKey(password); setApiKey(decryptedKey); }
      setShowPasswordModal(false);
    } catch (error) { alert('Erro na senha.'); } finally { setPasswordLoading(false); }
  };

  const handleExport = () => { if (urlList.length === 0) return alert('Configure antes de exportar'); exportConfig(urlList, attrWithImportance); };
  
  const handleImport = async () => { 
    try { 
      clearResults();
      setDisplayResults([]); 
      
      const config = await importConfig(); 
      setUrlList(config.urls); 
      setAttrWithImportance(config.attributes); 
    } catch (error) { 
      alert(error.message); 
    } 
  };

  const handleGenerate = () => { generateBenchmark({ apiKey, urls: urlList, attributes: attrWithImportance, provider, t }); };
  const handleOpenReport = () => { setCurrentScreen('report'); };

  return (
    <div className="app-root">
      {showWelcome ? (
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      ) : (
        <>
          <Header 
            t={t} 
            lang={lang} 
            theme={theme} 
            toggleLang={toggleLang} 
            toggleTheme={toggleTheme} 
            onOpenInstructions={() => setShowInstructions(true)}
            showBack={currentScreen !== 'dashboard'} 
            onBack={() => {
              // Limpa tudo ao voltar para o dashboard
              clearResults();
              setDisplayResults([]); 
              setCurrentScreen('dashboard');
            }} 
          />

          <main className={currentScreen === 'report' ? '' : (currentScreen === 'dashboard' ? '' : 'main-grid')}>
            
            {currentScreen === 'dashboard' && (
              <Dashboard 
                userName={userName}
                onNewAnalysis={() => {
                  // Limpa tudo ao iniciar nova análise
                  clearResults();
                  setUrlList([]);
                  setAttrWithImportance([]);
                  setDisplayResults([]);
                  setCurrentScreen('analysis');
                }}
                onLoad={handleLoadHistory} 
                t={t}
              />
            )}

            {currentScreen === 'analysis' && (
              <>
                <ConfigCard 
                  t={t}
                  loading={loading}
                  provider={provider}
                  setProvider={setProvider}
                  apiKey={apiKey}
                  setApiKey={setApiKey}
                  showApiKeyPassword={showApiKeyPassword}
                  setShowApiKeyPassword={setShowApiKeyPassword}
                  hasStoredKey={hasStoredKey}
                  onSaveKey={handleSaveApiKey}
                  onLoadKey={handleLoadApiKey}
                />

                <DataCard 
                  t={t}
                  loading={loading}
                  lang={lang}
                  urlList={urlList}
                  setUrlList={setUrlList}
                  attrWithImportance={attrWithImportance}
                  setAttrWithImportance={setAttrWithImportance}
                  onImport={handleImport}
                  onExport={handleExport}
                  onGenerate={handleGenerate}
                  apiKey={apiKey}
                />

                <ResultsDisplay 
                  results={displayResults} 
                  loading={loading} 
                  statusMessage={statusMessage} 
                  error={error} 
                  downloadLink={downloadLink} 
                  t={t} 
                  attributes={attrWithImportance}
                  onGenerateReport={handleOpenReport} 
                />
              </>
            )}

            {currentScreen === 'report' && (
              <ReportView 
                results={displayResults} 
                attributes={attrWithImportance}
                onBack={() => setCurrentScreen('analysis')}
                t={t}
              />
            )}
          
          </main>

          <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} t={t} />
          <PasswordModal 
            isOpen={showPasswordModal} 
            onConfirm={handlePasswordConfirm} 
            onCancel={() => setShowPasswordModal(false)} 
            mode={passwordModalMode} 
            loading={passwordLoading}
            t={t} 
          />
        </>
      )}
    </div>
  );
}

export default App;