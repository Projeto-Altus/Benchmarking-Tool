import React from 'react';
import { 
  BookOpen, 
  Globe, 
  Sun, 
  Moon, 
  ArrowLeft, 
  Bell, 
  BellOff
} from 'lucide-react';
import './Header.css';
import altusLogo from '../../assets/logo/altusLogo.png';

const Header = ({ 
  t, lang, theme, toggleLang, toggleTheme, onOpenInstructions,
  showBack, onBack, 
  notificationStatus, onRequestNotification
}) => {
  return (
    <header className="nav-container title-bar-draggable">
      <div className="nav-inner">
        <div className="nav-left">
          {showBack && (
            <button className="nav-back-icon no-drag" onClick={onBack} title={t.backToDashboard}>
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="logo-wrapper">
            <img src={altusLogo} alt={t.logoAlt} className="logo-img" />
          </div>
          <div className="brand-divider" />
          <h1 className="app-headline">Benchmarking <span className="highlight">Pro</span></h1>
        </div>

        <div className="nav-right no-drag">
          <button className="nav-action-btn" onClick={onOpenInstructions}>
            <BookOpen size={18} />
            <span className="btn-label">{t.guideBtn}</span>
          </button>

          <div className="vertical-divider" />

          <button className="nav-icon-btn" onClick={() => toggleLang()} title={t.changeLang}>
            <Globe size={18} />
            <span className="lang-text">{lang.toUpperCase()}</span>
          </button>

          <button className="nav-icon-btn theme-switcher" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button 
            className="nav-icon-btn" 
            onClick={onRequestNotification} 
            title={notificationStatus === 'granted' ? t.notificationsTitle : 'Ativar notificações'}
          >
            {notificationStatus === 'granted' ? <Bell size={18} /> : <BellOff size={18} className="icon-disabled" />}
          </button>

        </div>
      </div>
    </header>
  );
};

export default Header;