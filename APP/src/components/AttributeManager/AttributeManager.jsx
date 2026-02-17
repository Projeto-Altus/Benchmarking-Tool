import React, { useState } from 'react';
import { Plus, X, SlidersHorizontal, Trash2, Scale } from 'lucide-react';
import './AttributeManager.css';

const AttributeManager = ({ attributes, setAttributes, loading, t }) => {
  const [input, setInput] = useState('');

  const addAttr = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setAttributes([...attributes, { name: trimmed, importance: 5 }]);
    setInput('');
  };

  const removeAttr = (index) => setAttributes(attributes.filter((_, i) => i !== index));
  const clearAttrs = () => setAttributes([]);

  const handleImportanceChange = (index, value) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) num = 0; 
    if (num > 10) num = 10;
    
    const newAttrs = [...attributes];
    newAttrs[index].importance = num;
    setAttributes(newAttrs);
  };

  const handleBlur = (index) => {
    const newAttrs = [...attributes];
    if (newAttrs[index].importance < 1) newAttrs[index].importance = 1;
    setAttributes(newAttrs);
  };

  return (
    <div className="attr-section">
      <label className="manager-label">
        <SlidersHorizontal size={14} className="label-icon" />
        {t.attrsLabel}
      </label>
      
      <div className="manager-input-group">
        <input 
          className="manager-input"
          value={input} 
          onChange={e => setInput(e.target.value)} 
          disabled={loading} 
          placeholder={t.attrPlaceholder}
          onKeyDown={(e) => e.key === 'Enter' && addAttr()}
        />
        <button className="btn-add" onClick={addAttr} disabled={loading || !input.trim()}>
          <Plus size={18} strokeWidth={3} />
        </button>
      </div>

      <div className="list-header-row">
        <div className="header-title">
          <span>{t.definedCriteria}</span>
          {attributes.length > 0 && <span className="count-badge">{attributes.length}</span>}
        </div>
        
        {attributes.length > 0 && (
          <button className="btn-clear-mini" onClick={clearAttrs} disabled={loading}>
            <Trash2 size={12} /> {t.clearAttrs}
          </button>
        )}
      </div>

      {attributes.length > 0 ? (
        <ul className="manager-list">
          {attributes.map((a, i) => (
            <li className="attr-item-card" key={i}>
              <span className="attr-text-content" title={a.name}>{a.name}</span>
              
              <div className="weight-control" title={t.weightTooltip}>
                <span className="weight-label">{t.weight}</span>
                <input 
                  type="number" 
                  min="1" max="10" 
                  value={a.importance} 
                  onChange={e => handleImportanceChange(i, e.target.value)} 
                  onBlur={() => handleBlur(i)}
                  className="weight-input"
                  disabled={loading}
                />
              </div>

              <button className="btn-remove-item" onClick={() => removeAttr(i)} disabled={loading}>
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-list-placeholder">
          <Scale size={24} />
          <span>{t.noAttributesDefined}</span>
        </div>
      )}
    </div>
  );
};

export default AttributeManager;