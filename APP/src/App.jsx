import { useState, useEffect } from 'react';
import './App.css';

import Header from './components/Header/Header';
import ResultsDisplay from './components/ResultsDisplay/ResultsDisplay';
import InstructionsModal from './components/InstructionsModal/InstructionsModal';
import PasswordModal from './components/PasswordModal/PasswordModal';
import NotificationModal from './components/NotificationModal/NotificationModal';
import ConfigCard from './components/ConfigCard/ConfigCard'; 
import DataCard from './components/DataCard/DataCard'; 
import ReportView from './components/ReportView/ReportView'; 
import Dashboard from './components/Dashboard/Dashboard';
import WelcomeScreen from './components/WelcomeScreen/WelcomeScreen';

import notificationSound from './assets/sfx/notification.mp3';

import { RotateCcw } from 'lucide-react';
import { translations } from './constants/translations';
import { useBenchmarking } from './hooks/useBenchmarking';
import { exportConfig, importConfig } from './utils/fileHandler';
import { hasStoredApiKey, saveApiKey, loadApiKey } from './utils/cryptoUtils';
import { saveBenchmarkToHistory } from './utils/historyHandler';

const notifyUser = (t) => {
  if (document.visibilityState === 'visible') return;
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification("Altus Benchmarking", {
      body: t.analysisReady,
      icon: "/favicon.ico",
      silent: false
    });
  }
};

function App() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'pt');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const t = translations[lang];

  const [userName, setUserName] = useState(localStorage.getItem('altus_username') || '');
  const [currentView, setCurrentView] = useState(!localStorage.getItem('altus_username') ? 'welcome' : 'dashboard');
  const [showInstructions, setShowInstructions] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState("Notification" in window ? Notification.permission : 'denied');

  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState(localStorage.getItem('provider') || 'google');
  const [urlList, setUrlList] = useState([]);
  const [attrWithImportance, setAttrWithImportance] = useState([]);
  const [displayResults, setDisplayResults] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('altus_sound') !== 'false');
  
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalMode, setPasswordModalMode] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showApiKeyPassword, setShowApiKeyPassword] = useState(false);

  const { 
    generateBenchmark, 
    results: hookResults, 
    loading, 
    error, 
    statusMessage, 
    downloadLink, 
    clearResults 
  } = useBenchmarking();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('provider', provider);
  }, [provider]);

  useEffect(() => {
    localStorage.setItem('altus_sound', soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    setHasStoredKey(hasStoredApiKey());
  }, []);

  useEffect(() => {
    if (currentView === 'dashboard' && notificationStatus === 'default') {
      const timer = setTimeout(() => setShowNotifyModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [currentView, notificationStatus]);

  useEffect(() => {
    if (!loading && displayResults.length > 0) {
      notifyUser(t);
      if (soundEnabled) {
        new Audio(notificationSound).play().catch(() => {});
      }
      
      const originalTitle = document.title;
      document.title = `✅ ${t.analysisReady}`;
      const resetTitle = () => {
        document.title = originalTitle;
        window.removeEventListener('focus', resetTitle);
      };
      window.addEventListener('focus', resetTitle);
    }
  }, [loading, displayResults, t, soundEnabled]);

  useEffect(() => {
    if (hookResults && hookResults.length > 0 && urlList.length > 0 && attrWithImportance.length > 0) {
      setDisplayResults(hookResults);
      
      const sorted = [...hookResults].sort((a, b) => 
        (parseFloat(b.pontuacao_final) || 0) - (parseFloat(a.pontuacao_final) || 0)
      );
      const winner = sorted[0];

      saveBenchmarkToHistory({
        title: `Benchmark: ${winner.nome_produto?.substring(0, 20)}...`,
        winner: winner.nome_produto,
        winnerScore: winner.pontuacao_final || 0,
        itemCount: urlList.length,
        timestamp: new Date().toISOString(),
        fullData: { 
          urlList, 
          attrWithImportance, 
          results: hookResults 
        }
      });
    }
  }, [hookResults, urlList, attrWithImportance]);

  const handleRequestPermission = async () => {
    setShowNotifyModal(false);
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
    }
  };

  const handleHeaderNotifyClick = () => {
    if (notificationStatus === 'granted') {
      alert(t.notificationsRevoke);
    } else if (notificationStatus === 'denied') {
      alert(t.notificationsBlocked);
    } else {
      setShowNotifyModal(true);
    }
  };

  const handleWelcomeComplete = (name) => {
    setUserName(name);
    localStorage.setItem('altus_username', name);
    setCurrentView('dashboard');
  };

  const handleNewAnalysis = () => {
    clearResults();
    setDisplayResults([]);
    setUrlList([]);
    setAttrWithImportance([]);
    setCurrentView('analysis');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleLoadHistory = (historyItem) => {
    const data = historyItem.fullData;
    if (data) {
      setUrlList(data.urlList || []);
      setAttrWithImportance(data.attrWithImportance || []);
      setDisplayResults(data.results || []);
      setCurrentView('analysis');
    }
  };

  const toggleLang = () => setLang(prev => prev === 'pt' ? 'en' : 'pt');
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      alert(t.passwordModal?.errorEmpty || 'Digite uma API Key');
      return;
    }
    setPasswordModalMode('save');
    setShowPasswordModal(true);
  };

  const handleLoadApiKey = () => {
    setPasswordModalMode('load');
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (password) => {
    setPasswordLoading(true);
    try {
      if (passwordModalMode === 'save') {
        await saveApiKey(apiKey, password);
        setHasStoredKey(true);
      } else if (passwordModalMode === 'load') {
        const decryptedKey = await loadApiKey(password);
        if (decryptedKey) {
          setApiKey(decryptedKey);
        } else {
          throw new Error('Falha ao descriptografar');
        }
      }
      setShowPasswordModal(false);
    } catch (error) {
      console.error(error);
      alert(t.passwordModal?.errorGeneric || 'Erro na senha');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExport = () => {
    if (urlList.length === 0) return alert('Configure antes de exportar');
    exportConfig(urlList, attrWithImportance);
  };

  const handleImport = async () => {
    try {
      clearResults();
      setDisplayResults([]);
      const config = await importConfig();
      if (config.urls) setUrlList(config.urls);
      if (config.attributes) setAttrWithImportance(config.attributes);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGenerate = () => {
    generateBenchmark({ 
      apiKey, 
      urls: urlList, 
      attributes: attrWithImportance, 
      provider, 
      t 
    });
  };

  if (currentView === 'welcome') {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <div className="app-root">
      <Header 
        t={t} 
        lang={lang} 
        theme={theme} 
        toggleLang={toggleLang} 
        toggleTheme={toggleTheme} 
        onOpenInstructions={() => setShowInstructions(true)}
        showBack={currentView !== 'dashboard'} 
        onBack={handleBackToDashboard} 
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        notificationStatus={notificationStatus}
        onRequestNotification={handleHeaderNotifyClick}
      />

      <main className={currentView === 'analysis' ? 'main-grid' : ''}>
        {currentView === 'dashboard' && (
          <Dashboard 
            userName={userName}
            onNewAnalysis={handleNewAnalysis}
            onLoad={handleLoadHistory} 
            t={t}
          />
        )}

        {currentView === 'analysis' && (
          <>
            <div className="config-sidebar-wrapper">
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
              {displayResults.length > 0 && !loading && (
                <button className="btn-sidebar-reset" onClick={handleNewAnalysis}>
                  <RotateCcw size={16} /> 
                  {t.newAnalysis}
                </button>
              )}
            </div>

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
            />

            <ResultsDisplay 
              results={displayResults} 
              loading={loading} 
              statusMessage={statusMessage} 
              error={error} 
              downloadLink={downloadLink} 
              t={t} 
              attributes={attrWithImportance}
              onGenerate={handleGenerate}
              isDataValid={urlList.length > 0 && attrWithImportance.length > 0 && apiKey.length > 0}
              onGenerateReport={() => setCurrentView('report')} 
            />
          </>
        )}

        {currentView === 'report' && (
          <ReportView 
            results={displayResults} 
            attributes={attrWithImportance}
            onBack={() => setCurrentView('analysis')}
            t={t}
          />
        )}
      </main>

      <NotificationModal 
        isOpen={showNotifyModal} 
        onClose={() => setShowNotifyModal(false)} 
        onConfirm={handleRequestPermission} 
        t={t} 
      />

      <InstructionsModal 
        isOpen={showInstructions} 
        onClose={() => setShowInstructions(false)} 
        t={t} 
      />
      
      <PasswordModal 
        isOpen={showPasswordModal} 
        onConfirm={handlePasswordConfirm} 
        onCancel={() => setShowPasswordModal(false)} 
        mode={passwordModalMode}
        loading={passwordLoading}
        t={t} 
      />
    </div>
  );
}

export default App;