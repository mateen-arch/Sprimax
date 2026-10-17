import { useState } from 'react';
import {
  Calendar,
  CheckSquare,
  Download,
  FileSpreadsheet,
  FileText,
  Square,
  X,
  Sparkles,
} from 'lucide-react';
import './CreateReportModal.css';

const REPORT_TYPES = [
  { id: 'Enquiry Summary', label: 'Enquiry Summary', desc: 'Detailed log of client enquiries, response metrics, and leads' },
  { id: 'Catalogue Summary', label: 'Catalogue Summary', desc: 'Active category inventory, listings, and asset completeness' },
  { id: 'Full Business Report', label: 'Full Business Report', desc: 'Comprehensive 3-page overview of metrics, catalogue, and operational audit' },
];

const DATE_RANGES = [
  'Today',
  'Last 7 days',
  'Last 30 days',
  'This month',
  'Custom range',
];

const SECTION_OPTIONS = [
  { id: 'metrics', label: 'Executive Metrics & Performance KPIs', defaultChecked: true },
  { id: 'status', label: 'Enquiry Status Breakdown & Action Insight', defaultChecked: true },
  { id: 'type', label: 'Classification by Enquiry Type', defaultChecked: true },
  { id: 'log', label: 'Master Enquiry Chronological Log Table', defaultChecked: true },
  { id: 'topProducts', label: 'Top Requested Products & Regional Demand', defaultChecked: true },
  { id: 'catalogue', label: 'Catalogue Category Breakdown & Inventory', defaultChecked: true },
  { id: 'downloads', label: 'Technical Datasheet (TDS) Download Stats', defaultChecked: true },
  { id: 'actionItems', label: 'Auto-Generated Operational Action Items', defaultChecked: true },
];

export default function CreateReportModal({
  isOpen,
  onClose,
  onGenerate,
  liveMetrics = {},
}) {
  const [reportType, setReportType] = useState('Enquiry Summary');
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [format, setFormat] = useState('PDF'); // 'PDF' | 'Excel'
  const [selectedSections, setSelectedSections] = useState(
    SECTION_OPTIONS.reduce((acc, sec) => ({ ...acc, [sec.id]: sec.defaultChecked }), {})
  );
  const [generating, setGenerating] = useState(false);

  if (!isOpen) return null;

  const toggleSection = (id) => {
    setSelectedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAllSections = (checked) => {
    setSelectedSections(
      SECTION_OPTIONS.reduce((acc, sec) => ({ ...acc, [sec.id]: checked }), {})
    );
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerate({
        reportType,
        dateRange,
        customStart,
        customEnd,
        format,
        sections: selectedSections,
      });
      onClose();
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="report-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="report-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="report-modal-header">
          <div className="report-modal-title-lockup">
            <div className="report-modal-icon-badge">
              <FileText aria-hidden="true" />
            </div>
            <div>
              <h2 className="report-modal-title">Generate SPRIMAX Report</h2>
              <p className="report-modal-subtitle">
                Create executive reports extracted directly from live database records.
              </p>
            </div>
          </div>
          <button
            aria-label="Close modal"
            className="report-modal-close"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
        </header>

        {/* Body */}
        <div className="report-modal-body">
          {/* 1. Report Type */}
          <div className="report-field-group">
            <label className="report-field-label">Report Type</label>
            <div className="report-type-options">
              {REPORT_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`report-type-card${reportType === type.id ? ' report-type-card--selected' : ''}`}
                  onClick={() => setReportType(type.id)}
                  type="button"
                >
                  <strong className="report-type-card-title">{type.label}</strong>
                  <span className="report-type-card-desc">{type.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Date Range & Format row */}
          <div className="report-two-cols">
            <div className="report-field-group">
              <label className="report-field-label" htmlFor="report-date-range">
                Date Range
              </label>
              <select
                id="report-date-range"
                className="report-select"
                onChange={(e) => setDateRange(e.target.value)}
                value={dateRange}
              >
                {DATE_RANGES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {dateRange === 'Custom range' && (
                <div className="report-custom-date-inputs">
                  <label className="custom-date-field">
                    <span>From</span>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="report-date-input"
                    />
                  </label>
                  <label className="custom-date-field">
                    <span>To</span>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="report-date-input"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="report-field-group">
              <label className="report-field-label">Export Format</label>
              <div className="report-format-toggle">
                <button
                  className={`report-format-btn${format === 'PDF' ? ' active' : ''}`}
                  onClick={() => setFormat('PDF')}
                  type="button"
                >
                  <FileText aria-hidden="true" />
                  <span>PDF Document (A4 Portrait)</span>
                </button>
                <button
                  className={`report-format-btn${format === 'Excel' ? ' active' : ''}`}
                  onClick={() => setFormat('Excel')}
                  type="button"
                >
                  <FileSpreadsheet aria-hidden="true" />
                  <span>Excel Spreadsheet (.xlsx)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Include Sections */}
          <div className="report-field-group">
            <div className="report-sections-header">
              <label className="report-field-label">Include Report Sections</label>
              <div className="report-sections-quick-actions">
                <button
                  className="text-link-btn"
                  onClick={() => selectAllSections(true)}
                  type="button"
                >
                  Select all
                </button>
                <span>•</span>
                <button
                  className="text-link-btn"
                  onClick={() => selectAllSections(false)}
                  type="button"
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className="report-sections-grid">
              {SECTION_OPTIONS.map((sec) => {
                const checked = Boolean(selectedSections[sec.id]);
                return (
                  <label
                    key={sec.id}
                    className={`report-checkbox-item${checked ? ' checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSection(sec.id)}
                    />
                    <span className="checkbox-box">
                      {checked ? <CheckSquare className="check-icon" /> : <Square className="uncheck-icon" />}
                    </span>
                    <span className="checkbox-label-text">{sec.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Real-time stats preview footer pill */}
          <div className="report-live-pill">
            <Sparkles aria-hidden="true" className="sparkle-icon" />
            <span>
              Real-time DB figures synced: {liveMetrics.productsCount || 0} Products • {liveMetrics.categoriesCount || 0} Categories • {liveMetrics.enquiriesCount || 0} Enquiries
            </span>
          </div>
        </div>

        {/* Footer */}
        <footer className="report-modal-footer">
          <button
            className="report-btn-cancel"
            onClick={onClose}
            type="button"
            disabled={generating}
          >
            Cancel
          </button>
          <button
            className="report-btn-generate"
            onClick={handleGenerate}
            type="button"
            disabled={generating}
          >
            <Download aria-hidden="true" />
            <span>{generating ? 'Compiling Live Report...' : 'Generate & Download'}</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
