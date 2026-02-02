import React, { useState } from 'react';
import ResultCard from '../ResultsCard/ResultCard'
import './ResultsDisplay.css';

const ResultsDisplay = ({ results, loading, statusMessage, error, downloadLink, t, attributes }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortedResults = results ? [...results].sort((a, b) => {
    const scoreA = parseFloat(a.pontuacao_final) || 0;
    const scoreB = parseFloat(b.pontuacao_final) || 0;
    return scoreB - scoreA;
  }) : [];

  if (loading) {
    return (
      <aside className="card right-card">
        <h2 className="results-title">{t.results}</h2>
        <div className="results-body">
          <div className="spinner"></div>
        </div>
        <p className="results-sub">{statusMessage}</p>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="card right-card">
        <h2 className="results-title">{t.results}</h2>
        <div className="results-body">
          <div className="result-error-box"><strong>{t.error}:</strong> {error}</div>
        </div>
      </aside>
    );
  }

  if (!results || results.length === 0) {
    return (
      <aside className="card right-card">
        <h2 className="results-title">{t.results}</h2>
        <div className="results-body">
          <p className="no-data">{t.noResultsYet}</p>
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside className="card right-card">
        <h2 className="results-title">{t.results}</h2>
        <div className="results-body">
          <div className="success-view">
            <div className="check-icon-circle">
              <svg className="check-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="success-title">{t.analysisReady}</h3>
            <div className="action-buttons">
              <button className="btn btn-view-results" onClick={() => setIsModalOpen(true)}>
                {t.viewResults}
              </button>
              {downloadLink && (
                 <a href={downloadLink} className="btn btn-download-results" target="_blank" rel="noopener noreferrer">
                   {t.download}
                 </a>
              )}
            </div>
          </div>
        </div>
        <p className="results-sub">{statusMessage}</p>
      </aside>

      {isModalOpen && (
        <div className="results-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="results-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="rm-header">
              <span className="rm-title">{t.results} ({sortedResults.length})</span>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <div className="rm-body">
              <div className="results-grid">
                {sortedResults.map((r, i) => (
                  <ResultCard 
                    key={i} 
                    product={r} 
                    attributes={attributes} 
                    isWinner={i === 0}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResultsDisplay;