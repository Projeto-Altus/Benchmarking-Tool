import React from 'react';
import { Eye, EyeOff, Save, Download, Cpu, KeyRound, ShieldCheck, Settings } from 'lucide-react';
import './ConfigCard.css';

const ConfigCard = ({ 
  t, loading, provider, setProvider, apiKey, setApiKey, 
  showApiKeyPassword, setShowApiKeyPassword, hasStoredKey, 
  onSaveKey, onLoadKey 
}) => {
  return (
    <section className="card config-card">
      <div className="config-header">
        <h3 className="config-title">
          <Settings size={18} /> {t.configTitle}
        </h3>
      </div>

      <div className="config-inner">
        <div className="config-group">
          <label className="config-label">
            <Cpu size={14} className="label-icon" /> {t.aiProvider}
          </label>
          <div className="select-wrapper">
            <select 
              className="config-field" 
              value={provider} 
              onChange={(e) => setProvider(e.target.value)}
              disabled={loading}
            >
              <option value="openai">OpenAI (GPT-4)</option>
              <option value="deepseek">DeepSeek</option>
              <option value="google">Google Gemini</option>
            </select>
          </div>
        </div>

        <div className="config-group">
          <div className="label-row">
            <label className="config-label">
              <KeyRound size={14} className="label-icon" /> {t.apiKey}
            </label>
            {hasStoredKey && (
              <span className="secure-tag" title={t.secureKeyTooltip}>
                <ShieldCheck size={12} /> {t.secure}
              </span>
            )}
          </div>

          <div className="api-input-container">
            <input 
              className="config-field with-actions" 
              placeholder={t.apiKey || "sk-..."} 
              disabled={loading} 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type={showApiKeyPassword ? 'text' : 'password'}
            />
            
            <div className="input-actions">
              <button 
                className="icon-action-btn" 
                onClick={() => setShowApiKeyPassword(!showApiKeyPassword)} 
                title={showApiKeyPassword ? t.hide : t.show}
                type="button"
              >
                {showApiKeyPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>

              <div className="divider-vertical"></div>

              <button 
                className="icon-action-btn" 
                onClick={onSaveKey} 
                disabled={!apiKey.trim()} 
                title={t.saveAndEncrypt}
                type="button"
              >
                <Save size={16} />
              </button>

              <button 
                className="icon-action-btn" 
                onClick={onLoadKey} 
                disabled={!hasStoredKey} 
                title={t.loadSavedKey}
                type="button"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
          
          <p className="helper-text">
            {hasStoredKey 
              ? t.helperKeySaved 
              : t.helperKeyInsert}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ConfigCard;