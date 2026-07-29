// client/src/components/ReportModal.jsx
import React from 'react';
import ReportGenerator from './ReportGenerator';
import './ReportModal.css';

const ReportModal = ({ isOpen, onClose, defaultReportType }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <ReportGenerator
          onClose={onClose}
          defaultReportType={defaultReportType}
          className="modal"
        />
      </div>
    </div>
  );
};

export default ReportModal;
