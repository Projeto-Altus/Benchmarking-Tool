import React, { useState } from 'react';
import { Eye, EyeOff, Lock, X, CheckCircle } from 'lucide-react';
import './PasswordModal.css';

export default function PasswordModal({ isOpen, onConfirm, onCancel, mode, loading, t }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const title = mode === 'save' ? t.passwordModal.titleSave : t.passwordModal.titleLoad;

  const handleConfirm = async () => {
    if (!password.trim()) {
      setError(t.passwordModal.errorEmpty);
      return;
    }

    try {
      setError('');
      await onConfirm(password);
      setPassword('');
    } catch (err) {
      setError(t.passwordModal.errorGeneric);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onCancel();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleConfirm();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pwd-modal-overlay" onClick={handleCancel}>
      <div className="pwd-modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="pwd-modal-header">
          <div className="pwd-header-title">
            <Lock size={18} className="pwd-icon" />
            <h3>{title}</h3>
          </div>
          <button className="pwd-close-btn" onClick={handleCancel}>
            <X size={18} />
          </button>
        </div>

        <div className="pwd-modal-body">
          <p className="pwd-instruction">{t.passwordModal.instruction}</p>
          
          <div className={`pwd-input-wrapper ${error ? 'has-error' : ''}`}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="pwd-input"
              placeholder={t.passwordModal.placeholder}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if(error) setError('');
              }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoFocus
            />
            <button
              className="btn-toggle-visibility"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              type="button"
              tabIndex="-1"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <div className="pwd-error-msg">{error}</div>}
        </div>

        <div className="pwd-modal-footer">
          <button
            className="btn-pwd-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            {t.passwordModal.cancel}
          </button>
          <button
            className="btn-pwd-confirm"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? t.passwordModal.processing : (
              <>
                <CheckCircle size={16} />
                {t.passwordModal.confirm}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}