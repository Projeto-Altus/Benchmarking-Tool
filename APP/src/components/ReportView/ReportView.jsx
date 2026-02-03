import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Download, Calendar, User, FileText, CheckCircle } from 'lucide-react';
import './ReportView.css';

const ReportView = ({ results, attributes, onBack, t }) => {
  const [analystName, setAnalystName] = useState('Equipe de Compras');
  const [notes, setNotes] = useState('Com base na análise técnica e nos pesos atribuídos, o produto vencedor apresenta o melhor equilíbrio entre custo e benefício para o cenário atual da empresa.');
  
  const sortedResults = [...results].sort((a, b) => b.pontuacao_final - a.pontuacao_final);
  const winner = sortedResults[0];
  const currentDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-container-wrapper">
      
      <div className="report-toolbar">
        <button className="btn-back-report" onClick={onBack}>
          <ArrowLeft size={18} /> Voltar para Análise
        </button>
        <div className="toolbar-actions">
          <div className="input-group-toolbar">
            <User size={14} />
            <input 
              type="text" 
              value={analystName} 
              onChange={(e) => setAnalystName(e.target.value)} 
              placeholder="Nome do Analista"
            />
          </div>
          <button className="btn-print-action" onClick={handlePrint}>
            <Printer size={18} /> Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      <div className="report-sheet">
        
        <header className="report-header">
          <div className="brand-area">
            <h1 className="brand-title">Altus <span className="brand-subtitle">Benchmarking Pro</span></h1>
            <span className="report-tag">RELATÓRIO EXECUTIVO</span>
          </div>
          <div className="meta-data">
            <div className="meta-item"><Calendar size={14} /> {currentDate}</div>
          </div>
        </header>

        <section className="winner-highlight-section">
          <div className="winner-badge-print">🏆 MELHOR ESCOLHA</div>
          <h2 className="winner-title">{winner.nome_produto}</h2>
          <p className="winner-reason">
            <strong>Parecer da IA:</strong> {winner.motivo_escolha}
          </p>
          
          <div className="winner-metrics">
            <div className="metric-box">
              <span className="metric-label">Pontuação Global</span>
              <span className="metric-value score-high">{Math.round(winner.pontuacao_final)}/100</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Preço Encontrado</span>
              <span className="metric-value">{winner.preco || 'Sob Consulta'}</span>
            </div>
          </div>
        </section>

        <section className="comparative-chart-section">
          <h3 className="section-heading">Ranking Comparativo</h3>
          <div className="chart-container">
            {sortedResults.map((item, idx) => {
              const score = Math.round(item.pontuacao_final);
              const barColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
              
              return (
                <div key={idx} className="chart-row">
                  <div className="chart-label">
                    {idx + 1}. {item.nome_produto.substring(0, 40)}...
                  </div>
                  <div className="chart-bar-area">
                    <div 
                      className="chart-bar-fill" 
                      style={{ width: `${score}%`, backgroundColor: barColor }}
                    ></div>
                  </div>
                  <div className="chart-score">{score}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="tech-table-section">
          <h3 className="section-heading">Matriz Técnica Detalhada</h3>
          <table className="tech-table">
            <thead>
              <tr>
                <th>Critério / Atributo</th>
                {sortedResults.slice(0, 3).map((r, i) => (
                  <th key={i} className={i === 0 ? 'col-winner' : ''}>
                    {i === 0 && <CheckCircle size={12} style={{marginRight: 4}} />}
                    {r.nome_produto.substring(0, 20)}...
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attributes.map((attr, i) => (
                <tr key={i}>
                  <td className="attr-col">
                    {attr.name} <span className="weight-tag">Peso {attr.importance}</span>
                  </td>
                  {sortedResults.slice(0, 3).map((r, j) => (
                    <td key={j} className={j === 0 ? 'col-winner-cell' : ''}>
                      {String(r[attr.name] || '-').replace('(est.)', '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {sortedResults.length > 3 && <p className="table-footer-note">* Exibindo apenas os top 3 para clareza.</p>}
        </section>

        <section className="analyst-notes-section">
          <h3 className="section-heading">Conclusão do Analista</h3>
          <textarea 
            className="notes-textarea" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
          />
        </section>

        <footer className="report-footer">
          <div className="signature-line">
            <span>Assinatura do Responsável</span>
            <strong>{analystName}</strong>
          </div>
          <div className="system-stamp">
            Gerado via Altus Benchmarking Pro • {currentDate}
          </div>
        </footer>

      </div>
    </div>
  );
};

export default ReportView;