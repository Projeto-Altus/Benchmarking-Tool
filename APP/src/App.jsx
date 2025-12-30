import { useState, useEffect } from 'react';
import { useBenchmarking } from './hooks/useBenchmarking'; 
import './App.css';

const translations = {
  pt: {
    title: 'Ferramenta de Benchmarking',
    apiKey: 'Chave API (OpenAI)',
    import: 'Importar Dados',
    export: 'Baixar Relatório Excel',
    urlsLabel: 'URLS dos produtos',
    urlsCount: 'x URLS adicionadas',
    clearUrls: 'Limpar URLS',
    attrsLabel: 'Atributos para Análise',
    attrsCount: 'x atributos definidos',
    clearAttrs: 'Limpar atributos',
    generate: 'Gerar Benchmark',
    results: 'Resultados da Análise',
    analyzing: 'Enviando para IA e aguardando resposta...',
    finished: 'Análise concluída ✅',
    error: 'Erro na análise ❌',
    noUrls: '(nenhuma URL)',
    noAttrs: '(nenhum atributo)',
    langLabel: 'PT',
    downloadReady: 'Relatório pronto!'
  },
  en: {
    title: 'Benchmarking Tool',
    apiKey: 'API Key (OpenAI)',
    import: 'Import Data',
    export: 'Download Excel Report',
    urlsLabel: 'Product URLs',
    urlsCount: 'x URLs added',
    clearUrls: 'Clear URLs',
    attrsLabel: 'Analysis Attributes',
    attrsCount: 'x attributes defined',
    clearAttrs: 'Clear attributes',
    generate: 'Generate Benchmark',
    results: 'Analysis Results',
    analyzing: 'Sending to AI and waiting for response...',
    finished: 'Analysis completed ✅',
    error: 'Analysis error ❌',
    noUrls: '(no URLs)',
    noAttrs: '(no attributes)',
    langLabel: 'EN',
    downloadReady: 'Report ready!'
  }
};

function App() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'pt');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  const [apiKey, setApiKey]  // Estados de entrada
 = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlList, setUrlList] = useState([]);
  const [attrInput, setAttrInput] = useState('');
  const [attrList, setAttrList] = useState([]);

  const { 
    generateBenchmark, 
    results, 
    downloadLink, 
    loading, 
    error 
  } = useBenchmarking();

  const [analyzingText, setAnalyzingText] = useState('');

  useEffect(() => {
    if (loading) {
      setAnalyzingText(translations[lang].analyzing);
    } else if (error) {
      setAnalyzingText(`${translations[lang].error}: ${error}`);
    } else if (results) {
      setAnalyzingText(translations[lang].finished);
    } else {
      setAnalyzingText('');
    }
  }, [loading, error, results, lang]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleLang = () => setLang(lang === 'pt' ? 'en' : 'pt');
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const isValidUrl = (url) => {
    try { new URL(url); return true; } 
    catch { return false; }
  };

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if(!trimmed) return;
    if(!isValidUrl(trimmed)){
      alert('URL inválida!');
      return;
    }
    setUrlList([...urlList, trimmed]);
    setUrlInput('');
  };
  const removeUrl = (index) => setUrlList(urlList.filter((_,i)=>i!==index));
  const clearUrls = () => setUrlList([]);

  const addAttr = () => {
    const trimmed = attrInput.trim();
    if(!trimmed) return;
    setAttrList([...attrList, trimmed]);
    setAttrInput('');
  };
  const removeAttr = (index) => setAttrList(attrList.filter((_,i)=>i!==index));
  const clearAttrs = () => setAttrList([]);

  const handleGenerate = () => {
    if (urlList.length === 0) {
        alert("Adicione pelo menos uma URL.");
        return;
    }
    if (!apiKey) {
        alert("A Chave API é obrigatória.");
        return;
    }

    generateBenchmark({
      apiKey,
      urls: urlList,
      attributes: attrList
    });
  };

  const handleDownload = () => {
    if (downloadLink) {
      window.open(downloadLink, '_blank');
    }
  };

  const escapeHtml = (text) => {
    return String(text).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  };

  const truncateUrl = (url, maxLength = 60) => {
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength) + '...';
  };

  const renderResultContent = (content) => {
    if (typeof content === 'object') {
      return (
        <ul className="result-list-obj">
          {Object.entries(content).map(([key, val], k) => (
             <li key={k}><strong>{key}:</strong> {String(val)}</li>
          ))}
        </ul>
      );
    }
    return <p>{String(content)}</p>;
  };

  return (
    <div className="app-root">
      <header className="nav">
        <div className="nav-inner">
          <div className="nav-left">
            <div className="logo-pill">
              <span className="logo-text">Altus</span>
            </div>
          </div>
          <div className="nav-center">
            <div className="app-title">{translations[lang].title}</div>
          </div>
          <div className="nav-right">
            <button className="lang-toggle" onClick={toggleLang}>
              <span className={`toggle-track ${lang==='en'?'on':''}`}>
                <span className="toggle-thumb"></span>
              </span>
              <span className="lang-label">{translations[lang].langLabel}</span>
            </button>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme==='dark'?'🌙':'☀️'}
            </button>
          </div>
        </div>
      </header>

      <main className="main-grid">
        <section className="card left-card">
          <div className="left-inner">
            <div className="top-row">
              <input 
                className="api-key" 
                placeholder={translations[lang].apiKey} 
                disabled={loading}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
              />
              <div className="import-export">
                {downloadLink && (
                  <button className="btn small export" onClick={handleDownload} title={translations[lang].downloadReady}>
                    ⬇ XLSX
                  </button>
                )}
              </div>
            </div>

            <div className="section">
              <label className="label">{translations[lang].urlsLabel}</label>
              <div className="input-row">
                <input className="textarea" value={urlInput} onChange={e=>setUrlInput(e.target.value)} disabled={loading} placeholder="https://..."/>
                <button className="btn small" onClick={addUrl} disabled={loading}>+</button>
              </div>
              <div className="muted">{urlList.length} {translations[lang].urlsCount}</div>
              <ul>
                {urlList.map((u,i)=>(
                  <li key={i}>
                    <span title={u}>{escapeHtml(truncateUrl(u))}</span>
                    <button className="btn clear small" onClick={()=>removeUrl(i)} disabled={loading}>✖</button>
                  </li>
                ))}
              </ul>
              <div className="section-controls">
                <button className="btn clear small" onClick={clearUrls} disabled={loading}>{translations[lang].clearUrls}</button>
              </div>
            </div>

            <div className="section">
              <label className="label">{translations[lang].attrsLabel}</label>
              <div className="input-row">
                <input className="textarea" value={attrInput} onChange={e=>setAttrInput(e.target.value)} disabled={loading} placeholder="Ex: Preço, Material, Garantia"/>
                <button className="btn small" onClick={addAttr} disabled={loading}>+</button>
              </div>
              <div className="muted">{attrList.length} {translations[lang].attrsCount}</div>
              <ul>
                {attrList.map((a,i)=>(
                  <li key={i}>
                    {escapeHtml(a)} <button className="btn clear small" onClick={()=>removeAttr(i)} disabled={loading}>✖</button>
                  </li>
                ))}
              </ul>
              <div className="section-controls">
                <button className="btn clear small" onClick={clearAttrs} disabled={loading}>{translations[lang].clearAttrs}</button>
              </div>
            </div>
          </div>

          <div className="left-footer">
            <button className="btn generate" onClick={handleGenerate} disabled={loading}>
              {loading ? (lang==='pt'?'Processando...':'Processing...') : translations[lang].generate}
            </button>
          </div>
        </section>

        <aside className="card right-card">
          <h2 className="results-title">{translations[lang].results}</h2>
          <div className="results-body">
            {loading && <div className="spinner"></div>}
            
            {!loading && results && (
              <div className="results-content">
                {Object.entries(results).map(([url, data], i) => (
                  <div className="result-item" key={i}>
                    <div className="result-url" title={url}>{escapeHtml(truncateUrl(url))}</div>
                    <div className="result-data">
                        {renderResultContent(data)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!loading && !results && <p className="no-data">{translations[lang].noUrls}</p>}
          </div>
          <p className="results-sub" style={{marginTop: '10px'}}>{analyzingText}</p>
        </aside>
      </main>
    </div>
  );
}

export default App;