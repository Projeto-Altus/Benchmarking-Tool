import React, { useState } from 'react';
import './ResultCard.css';

const ResultCard = ({ product, attributes, isWinner }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const escapeHtml = (text) => text ? String(text).replace(/[&<>"']/g, m => ({ 
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' 
  })[m]) : '';
  
  const formatValue = (val) => {
    const text = String(val || 'Não especificado');
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
      
      {isWinner && (
        <div className="winner-crown-wrapper">
          <svg className="minimal-crown-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 17H5V15L3 7L8 11L12 3L16 11L21 7L19 15V17Z" />
            <rect x="5" y="18" width="14" height="2" rx="1" />
          </svg>
        </div>
      )}

      <div className="card-inner-content">
        {isTotalFallback && (
          <div className="ai-fallback-patch">
            <span className="sparkle-mini">✦</span> DADOS ESTIMADOS POR IA
          </div>
        )}

        <div className="card-header-row">
          <div className="product-info-group">
            <h4 className="product-name-text">{escapeHtml(product.nome_produto || 'Produto Sem Nome')}</h4>
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
                <svg className="ai-sparkle-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                </svg>
                <span className="ai-label-blue">IA:</span>
              </div>
              {reason}
            </div>
            {isLongText && (
              <div className="expand-trigger-container">
                <span className="expand-link-text" onClick={() => setIsExpanded(!isExpanded)}>
                  {isExpanded ? 'Ocultar resumo ↑' : 'Ler resumo completo ↓'}
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
                    <span className="info-icon-tag" title="Informação estimada pela IA">i</span>
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