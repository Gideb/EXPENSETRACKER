// client/src/components/ReportGenerator.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ReportGenerator.css';

const ReportGenerator = ({ onClose, defaultReportType = 'financial', className = '' }) => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState(defaultReportType);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReport = async () => {
    // Validate dates
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get('/api/reports/pdf', {
        params: {
          startDate,
          endDate,
          reportType,
        },
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `${reportType}_report_${startDate}_to_${endDate}.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Close modal if provided
      if (onClose) onClose();
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { value: 'financial', label: '📊 Financial Summary' },
    { value: 'income', label: '💰 Income Report' },
    { value: 'expense', label: '💳 Expense Report' },
    { value: 'transactions', label: '📋 Transaction Report' },
  ];

  return (
    <div className={`report-generator ${className}`}>
      <div className="report-header">
        <h2>Generate Report</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="reportType">Report Type</label>
        <select
          id="reportType"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          disabled={loading}
        >
          {reportTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={loading}
            max={endDate}
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading}
            min={startDate}
          />
        </div>
      </div>

      <div className="quick-dates">
        <span>Quick select:</span>
        <button
          onClick={() => {
            const today = new Date();
            const start = new Date(today);
            start.setDate(today.getDate() - 7);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
          }}
          disabled={loading}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const start = new Date(today);
            start.setDate(today.getDate() - 30);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
          }}
          disabled={loading}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const start = new Date(today);
            start.setMonth(today.getMonth() - 3);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
          }}
          disabled={loading}
        >
          Last 3 Months
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const start = new Date(today);
            start.setFullYear(today.getFullYear() - 1);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
          }}
          disabled={loading}
        >
          Last Year
        </button>
      </div>

      <button className="generate-btn" onClick={handleGenerateReport} disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span>
            Generating...
          </>
        ) : (
          '📄 Generate PDF Report'
        )}
      </button>
    </div>
  );
};

export default ReportGenerator;
