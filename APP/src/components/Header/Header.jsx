import React from 'react';
import { 
  BookOpen, 
  Globe, 
  Sun, 
  Moon, 
  ArrowLeft, 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import './Header.css';
import altusLogo from '../../assets/logo/altusLogo.png';

const Header = ({ 
  t, lang, theme, toggleLang, toggleTheme, onOpenInstructions,
  showBack, onBack, soundEnabled, onToggleSound, 
  notificationStatus, onRequestNotification 
}) => {
  return (
    <header className="nav-container">
      <div className="nav-inner">
        
        <div className="nav-left">
          {showBack && (
            <button className="nav-back-icon" onClick={onBack} title={t.backToDashboard}>
              <ArrowLeft size={24} />
            </button>
          )}

          <div className="logo-wrapper">
            <img src={altusLogo} alt={t.logoAlt} className="logo-img" />
          </div>
          
          <div className="brand-divider" />
          
          <h1 className="app-headline">Benchmarking <span className="highlight">Pro</span></h1>
        </div>

        <div className="nav-right">
          <button 
            className="nav-icon-btn" 
            onClick={onToggleSound} 
            title={soundEnabled ? 'Mudar para mudo' : 'Ativar som'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} className="icon-disabled" />}
          </button>

          <button 
            className="nav-icon-btn" 
            onClick={onRequestNotification} 
            title={notificationStatus === 'granted' ? t.notificationsTitle : 'Ativar notificações'}
          >
            {notificationStatus === 'granted' ? (
              <Bell size={20} />
            ) : (
              <BellOff size={20} className="icon-disabled" />
            )}
          </button>

          <div className="vertical-divider" />

          <button className="nav-action-btn" onClick={onOpenInstructions} title={t.instructions}>
            <BookOpen size={20} />
            <span className="btn-label">{t.guideBtn}</span>
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