import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import './IconPicker.css';

// Curated list of high-utility industrial and technical icons
export const AVAILABLE_ICONS = [
  { name: 'AlertTriangle', label: 'Warning / Hazard', icon: Icons.AlertTriangle },
  { name: 'Shield', label: 'Protection / Structural', icon: Icons.Shield },
  { name: 'Flame', label: 'Thermal / Heat / Welding', icon: Icons.Flame },
  { name: 'Award', label: 'Accreditation / Badge', icon: Icons.Award },
  { name: 'CheckCircle', label: 'Compliance / Verified', icon: Icons.CheckCircle },
  { name: 'Zap', label: 'Energy / Arc / Electrical', icon: Icons.Zap },
  { name: 'Cpu', label: 'Automation / Tech', icon: Icons.Cpu },
  { name: 'Anchor', label: 'Marine / Offshore', icon: Icons.Anchor },
  { name: 'Wrench', label: 'Maintenance / Field', icon: Icons.Wrench },
  { name: 'Settings', label: 'Process / Calibration', icon: Icons.Settings },
  { name: 'Layers', label: 'Cladding / Multi-pass', icon: Icons.Layers },
  { name: 'Gauge', label: 'Pressure / Yield Metric', icon: Icons.Gauge },
  { name: 'Compass', label: 'Precision / Alignment', icon: Icons.Compass },
  { name: 'FileCheck', label: 'Test Report / Cert', icon: Icons.FileCheck },
  { name: 'Activity', label: 'Fatigue / Dynamic Load', icon: Icons.Activity },
  { name: 'Sparkles', label: 'High Integrity', icon: Icons.Sparkles },
  { name: 'Factory', label: 'Fabrication / Heavy Plant', icon: Icons.Factory },
  { name: 'Hammer', label: 'Impact / Toughness', icon: Icons.Hammer },
  { name: 'Boxes', label: 'Supply / Consumables', icon: Icons.Boxes },
  { name: 'Binary', label: 'Data / Heat-Traceability', icon: Icons.Binary },
  { name: 'ShieldCheck', label: 'Classification Society', icon: Icons.ShieldCheck },
  { name: 'HardHat', label: 'Safety / Standards', icon: Icons.HardHat },
  { name: 'Scale', label: 'Yield / Tensile Balance', icon: Icons.Scale },
  { name: 'Radio', label: 'NDT / Ultrasound / X-Ray', icon: Icons.Radio },
];

/**
 * Helper to render an icon dynamically by name
 */
export function DynamicIcon({ name, size = 18, className = '', color = 'currentColor', strokeWidth = 2 }) {
  const IconComponent = Icons[name] || Icons.HelpCircle;
  return <IconComponent size={size} className={className} color={color} strokeWidth={strokeWidth} />;
}

export default function IconPicker({
  value,
  onChange,
  label = 'Select Icon',
  allowClear = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return AVAILABLE_ICONS;
    const q = search.toLowerCase();
    return AVAILABLE_ICONS.filter(
      (item) => item.name.toLowerCase().includes(q) || item.label.toLowerCase().includes(q)
    );
  }, [search]);

  const selectedItem = AVAILABLE_ICONS.find((item) => item.name === value);

  return (
    <div className="icon-picker-container">
      {label && <label className="icon-picker-label">{label}</label>}

      <div className="icon-picker-trigger-wrap">
        <button
          type="button"
          className="icon-picker-trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <div className="icon-picker-selected-preview">
            {value ? (
              <>
                <span className="icon-badge">
                  <DynamicIcon name={value} size={16} color="#ff0804" />
                </span>
                <span className="icon-name-text">{selectedItem?.label || value}</span>
              </>
            ) : (
              <span className="icon-placeholder-text">Choose an icon...</span>
            )}
          </div>
          <Icons.ChevronDown size={14} className={`trigger-chevron ${isOpen ? 'open' : ''}`} />
        </button>

        {allowClear && value && (
          <button
            type="button"
            className="icon-picker-clear-btn"
            onClick={() => onChange('')}
            title="Clear icon"
          >
            <Icons.X size={13} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="icon-picker-dropdown">
          <div className="icon-picker-search-bar">
            <Icons.Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search icons (e.g. Shield, Warning)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="icon-picker-search-input"
              autoFocus
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearch('')}
              >
                <Icons.X size={12} />
              </button>
            )}
          </div>

          <div className="icon-picker-grid">
            {filteredIcons.map(({ name, label: itemLabel, icon: IconComponent }) => {
              const isSelected = value === name;
              return (
                <button
                  key={name}
                  type="button"
                  className={`icon-grid-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(name);
                    setIsOpen(false);
                  }}
                  title={itemLabel}
                >
                  <IconComponent size={20} className="grid-icon-svg" />
                  <span className="grid-icon-label">{name}</span>
                </button>
              );
            })}
            {filteredIcons.length === 0 && (
              <div className="icon-picker-empty">
                <span>No matching icons found</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
