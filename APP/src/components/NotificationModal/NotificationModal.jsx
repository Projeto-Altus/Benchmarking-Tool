import React from 'react';
import { Bell, X, Check } from 'lucide-react';
import './NotificationModal.css';

const NotificationModal = ({ isOpen, onClose, onConfirm, t }) => {
  if (!isOpen) return null;

  return (
    <div className="notify-overlay" onClick={onClose}>
      <div className="notify-card" onClick={(e) => e.stopPropagation()}>
        <button className="notify-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
        
        <div className="notify-icon-container">
          <Bell size={32} />
        </div>
        
        <h3 className="notify-title">{t.notificationsTitle}</h3>
        <p className="notify-description">{t.notificationsDesc}</p>
        
        <div className="notify-button-group">
          <button className="btn-notify-secondary" onClick={onClose}>
            {t.notificationsDeny}
          </button>
          <button className="btn-notify-primary" onClick={onConfirm}>
            <Check size={16} /> {t.notificationsAllow}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;