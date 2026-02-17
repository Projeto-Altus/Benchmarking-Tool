import React, { useEffect, useState } from 'react';
import { X, Key, Link as LinkIcon, Sliders, LayoutDashboard, ExternalLink, Lightbulb } from 'lucide-react';
import './InstructionsModal.css';

const InstructionsModal = ({ isOpen, onClose, t }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const { guide } = t;

  return (
    <div className="instructions-overlay" onClick={onClose}>
      <div className={`instructions-content ${showContent ? 'active' : ''}`} onClick={e => e.stopPropagation()}>
        
        <div className="instructions-header">
          <div className="header-title-group">
            <div className="header-icon-badge">
              <Lightbulb size={20} />
            </div>
            <h2>{t.instructions}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="instructions-body">
          <div className="guide-hero">
            <h3>{guide.title}</h3>
            <p>{guide.intro}</p>
          </div>

          <div className="steps-container">
            
            <div className="guide-card full-width" style={{animationDelay: '0.1s'}}>
              <div className="guide-icon-box blue">
                <LayoutDashboard size={24} />
              </div>
              <div className="guide-content">
                <h4>{guide.dashboard?.title || 'Dashboard'}</h4>
                <p>{guide.dashboard?.text || 'Acompanhe métricas e histórico.'}</p>
              </div>
            </div>

            <div className="guide-card" style={{animationDelay: '0.2s'}}>
              <div className="guide-icon-box purple">
                <Key size={24} />
              </div>
              <div className="guide-content">
                <h4>{guide.step1.title}</h4>
                <p>{guide.step1.text}</p>
                <div className="sub-steps">
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="api-link-btn"
                  >
                    Google AI Studio <ExternalLink size={12} />
                  </a>
                  <ul>
                    <li>{guide.step1.list[1]}</li>
                    <li>{guide.step1.list[2]}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="guide-card" style={{animationDelay: '0.3s'}}>
              <div className="guide-icon-box green">
                <LinkIcon size={24} />
              </div>
              <div className="guide-content">
                <h4>{guide.step2.title}</h4>
                <p>{guide.step2.text}</p>
              </div>
            </div>

            <div className="guide-card full-width" style={{animationDelay: '0.4s'}}>
              <div className="guide-icon-box orange">
                <Sliders size={24} />
              </div>
              <div className="guide-content">
                <h4>{guide.step3.title}</h4>
                <p>{guide.step3.text}</p>
                <ul className="bullet-list">
                  {guide.step3.list.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
};

export default InstructionsModal;