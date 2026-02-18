import React from 'react';
import { Download, Upload, Database } from 'lucide-react';
import UrlManager from '../UrlManager/UrlManager';
import AttributeManager from '../AttributeManager/AttributeManager';
import './DataCard.css';

const DataCard = ({ 
  t, loading, urlList, setUrlList, 
  attrWithImportance, setAttrWithImportance, 
  onImport, onExport
}) => {
  return (
    <section className="card data-card">
      <div className="data-inner">
        <div className="data-header">
          <h3 className="data-title">
             <Database size={18} /> {t.benchmarkData}
          </h3>
          <div className="data-actions">
            <button className="action-icon-btn" onClick={onImport} disabled={loading}>
              <Download size={14} /> {t.import}
            </button>
            <div className="divider-vertical"></div>
            <button className="action-icon-btn" onClick={onExport} disabled={loading}>
              <Upload size={14} /> {t.export}
            </button>
          </div>
        </div>

        <div className="data-content">
          <div className="manager-wrapper">
            <UrlManager urls={urlList} setUrls={setUrlList} loading={loading} t={t} />
          </div>
          <div className="section-divider"></div>
          <div className="manager-wrapper">
            <AttributeManager attributes={attrWithImportance} setAttributes={setAttrWithImportance} loading={loading} t={t} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataCard;