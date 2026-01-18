import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header/Header';
import UrlManager from './components/UrlManager/UrlManager';
import AttributeManager from './components/AttributeManager/AttributeManager';
import ResultsDisplay from './components/ResultsDisplay/ResultsDisplay';
import InstructionsModal from './components/InstructionsModal/InstructionsModal';
import { translations } from './constants/translations';
import { useBenchmarking } from './hooks/useBenchmarking';

function App() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'pt');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showInstructions, setShowInstructions] = useState(false);
  const t = translations[lang];

  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState(localStorage.getItem('provider') || 'google');
  const [urlList, setUrlList] = useState([]);
  const [attrWithImportance, setAttrWithImportance] = useState([]);

  const { 
    generateBenchmark, 
    results, 
    loading, 
    error, 
    statusMessage, 
    downloadLink 
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

  const toggleLang = () => setLang(prev => prev === 'pt' ? 'en' : 'pt');
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleGenerate = () => {
    generateBenchmark({
      apiKey,
      urls: urlList,
      attributes: attrWithImportance,
      provider,
      t 
    });
  };

  return (
    <div className="app-root">
      <Header 
        t={t} 
        lang={lang} 
        theme={theme} 
        toggleLang={toggleLang} 
        toggleTheme={toggleTheme}
        onOpenInstructions={() => setShowInstructions(true)}
      />

      <main className="main-grid">
        <section className="card left-card">
          <div className="left-inner">
            <div className="top-row">
              <input 
                className="input-field" 
                placeholder={t.apiKey} 
                disabled={loading} 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
              />
              <select 
                className="input-field" 
                value={provider} 
                onChange={(e) => setProvider(e.target.value)}
                disabled={loading}
                style={{ width: '120px', marginLeft: '8px' }}
              >
                <option value="openai">OpenAI</option>
                <option value="deepseek">DeepSeek</option>
                <option value="google">Gemini</option>
              </select>
            </div>
            <div className="import-export">
              <button className="btn small import" disabled={loading}>{t.import}</button>
              <button className="btn small export" disabled={loading}>{t.export}</button>
            </div>

            <UrlManager 
              urls={urlList} 
              setUrls={setUrlList} 
              loading={loading} 
              t={t} 
            />

            <AttributeManager 
              attributes={attrWithImportance} 
              setAttributes={setAttrWithImportance} 
              loading={loading} 
              t={t} 
            />
          </div>

          <div className="left-footer">
            <button 
              className="btn generate" 
              onClick={handleGenerate} 
              disabled={loading || urlList.length === 0 || attrWithImportance.length === 0 || !apiKey}
            >
              {loading ? (lang === 'pt' ? 'Gerando...' : 'Generating...') : t.generate}
            </button>
          </div>
        </section>

        <ResultsDisplay 
          results={results} 
          loading={loading} 
          statusMessage={statusMessage} 
          error={error}
          downloadLink={downloadLink}
          t={t}
          attributes={attrWithImportance}
        />
      </main>

      <InstructionsModal 
        isOpen={showInstructions} 
        onClose={() => setShowInstructions(false)} 
        content={t.instructionsContent}
        t={t}
      />
    </div>
  );
}

export default App;