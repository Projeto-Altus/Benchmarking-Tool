import React, { useState } from 'react';
import { BookOpen, Globe, Sun, Moon, ChevronDown } from 'lucide-react';
import './Header.css';
import altusLogo from '../../assets/logo/altusLogo.png';

const Header = ({ t, lang, theme, toggleLang, toggleTheme, onOpenInstructions }) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  return (
    <header className="nav-container">
      <div className="nav-inner">
        {/* Lado Esquerdo: Logo e Título */}
        <div className="nav-left">
          <div className="logo-wrapper">
            <img src={altusLogo} alt="Altus Logo" className="logo-img" />
          </div>
          <div className="brand-divider" />
          <h1 className="app-headline">Benchmarking <span className="highlight">Pro</span></h1>
        </div>

        {/* Lado Direito: Ações */}
        <div className="nav-right">
          <button className="nav-action-btn" onClick={onOpenInstructions} title={t.instructions}>
            <BookOpen size={20} />
            <span className="btn-label">Guia de Uso</span>
          </button>

          <div className="vertical-divider" />

          <div className="lang-selector-container">
            <button className="nav-icon-btn" onClick={() => toggleLang()}>
              <Globe size={20} />
              <span className="lang-text">{lang.toUpperCase()}</span>
            </button>
          </div>

          <button className="nav-icon-btn theme-switcher" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;