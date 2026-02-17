import React, { useState } from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import './ResultCard.css';

const ResultCard = ({ product, attributes, isWinner, t }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const escapeHtml = (text) => text ? String(text).replace(/[&<>"']/g, m => ({ 
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' 
  })[m]) : '';
  
  const formatValue = (val) => {
    const text = String(val || t.resultCard.notSpecified);
    const isEstimated = text.toLowerCase().includes('(est.)');
    const cleanText = text.replace(/\(est\.\)/gi, '').trim();
    return { cleanText, isEstimated };
  };

  const reason = product.motivo_escolha || '';
  const isLongText = reason.length > 150;
  const isTotalFallback = product.generated_by_ai === true; 
  const score = parseFloat(product.pontuacao_final) || 0;

  return (
    <div className={`premium-product-card ${isTotalFallback ? 'is-total-fallback' : ''} ${isWinner ? 'is-winner-card' : ''}`}>
      <div className="card-inner-content">
        
        {(isWinner || isTotalFallback) && (
          <div className="card-patches-wrapper">
            {isWinner && (
              <div className="winner-patch-geometric">
                <Trophy size={12} strokeWidth={3} className="sparkle-mini" /> 
                {t.resultCard.bestChoice}
              </div>
            )}
            
            {isTotalFallback && (
              <div className="ai-fallback-patch">
                <Sparkles size={12} strokeWidth={3} className="sparkle-mini" /> 
                {t.resultCard.aiEstimatedData}
              </div>
            )}
          </div>
        )}

        <div className="card-header-row">
          <div className="product-info-group">
            <h4 className="product-name-text">{escapeHtml(product.nome_produto || t.resultCard.unnamedProduct)}</h4>
            <a href={product.url_origem} target="_blank" rel="noopener noreferrer" className="product-url-link">
              {escapeHtml(product.url_origem).substring(0, 35)}... 🔗
            </a>
          </div>
          <div className={`score-badge-minimal ${score >= 70 ? 'sh' : score >= 40 ? 'sm' : 'sl'}`}>
            {score.toFixed(0)}
          </div>
        </div>

        {reason && (
          <div className="ai-summary-container">
            <div className={`ai-summary-text ${isExpanded ? 'is-open' : 'is-clamped'}`}>
              <div className="ai-badge-inline">
                <Sparkles className="ai-sparkle-icon" />
                <span className="ai-label-blue">{t.resultCard.aiLabel}:</span>
              </div>
              {reason}
            </div>
            {isLongText && (
              <div className="expand-trigger-container">
                <span className="expand-link-text" onClick={() => setIsExpanded(!isExpanded)}>
                  {isExpanded ? t.resultCard.hideSummary : t.resultCard.showSummary}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="specs-list-container">
          {attributes && attributes.map((attr, j) => {
            const { cleanText, isEstimated } = formatValue(product[attr.name]);
            return (
              <div className="spec-item-row" key={j}>
                <span className="spec-name-label">{attr.name}</span>
                <span className={`spec-value-text ${isEstimated ? 'text-orange-bold' : ''}`}>
                  {cleanText} 
                  {isEstimated && (
                    <span className="info-icon-tag" title={t.resultCard.aiEstimatedInfo}>i</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;