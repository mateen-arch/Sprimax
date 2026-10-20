import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadImageApi, deleteImageApi } from '../api/upload.js';
import './ImageUploader.css';

/**
 * Reusable Admin Image Uploader Component
 *
 * @param {string|Object} value - Current image URL string or object { url, public_id, ... }
 * @param {Function} onChange - Callback when image changes: (url, details) => void
 * @param {string} [publicId] - Optional Cloudinary public_id if tracked separately
 * @param {Function} [onPublicIdChange] - Optional callback when public_id changes
 * @param {string} [altText] - Current alt text value
 * @param {Function} [onAltChange] - Callback when alt text changes
 * @param {string} [folder] - Target Cloudinary folder (default: 'sprimax/general')
 * @param {string} [label] - Field label (e.g., 'Banner Image')
 * @param {string} [helpText] - Hint text (e.g., '16:9 ratio, max 5MB')
 * @param {boolean} [showAltInput] - Whether to show the Alt text input below the image
 * @param {boolean} [requiredAlt] - Whether Alt text is required
 * @param {Function} [onUploadStart] - Callback when upload begins (e.g. to disable parent save button)
 * @param {Function} [onUploadEnd] - Callback when upload ends: (success) => void
 */
export default function ImageUploader({
  value,
  onChange,
  publicId,
  onPublicIdChange,
  altText,
  onAltChange,
  folder = 'sprimax/general',
  label,
  helpText = 'JPG, PNG, WebP or SVG up to 5MB',
  showAltInput = false,
  requiredAlt = false,
  onUploadStart,
  onUploadEnd,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  // Extract current URL & public_id
  const currentUrl = typeof value === 'object' && value !== null ? value.url || value.secure_url : value || '';
  const currentPublicId = publicId || (typeof value === 'object' && value !== null ? value.public_id : '');

  const handleFileProcess = async (file) => {
    if (!file) return;

    setErrorMessage('');
    setIsUploading(true);
    setUploadProgress(0);
    if (onUploadStart) onUploadStart();

    const previousPublicId = currentPublicId;

    try {
      const data = await uploadImageApi(file, {
        folder,
        onProgress: (percent) => setUploadProgress(percent),
      });

      // Best-effort removal of previous asset if replaced
      if (previousPublicId && previousPublicId !== data.public_id) {
        deleteImageApi(previousPublicId).catch(() => {});
      }

      if (onChange) {
        onChange(data.secure_url, data);
      }
      if (onPublicIdChange && data.public_id) {
        onPublicIdChange(data.public_id);
      }

      if (onUploadEnd) onUploadEnd(true);
    } catch (err) {
      setErrorMessage(err.message || 'Upload failed');
      if (onUploadEnd) onUploadEnd(false);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFileProcess(droppedFiles[0]);
    }
  };

  const handleRemove = () => {
    const assetToDelete = currentPublicId;
    if (assetToDelete) {
      deleteImageApi(assetToDelete).catch(() => {});
    }

    if (onChange) onChange('', null);
    if (onPublicIdChange) onPublicIdChange('');
    if (onAltChange && requiredAlt) onAltChange('');
    setErrorMessage('');
  };

  return (
    <div className="image-uploader-wrapper">
      {(label || helpText) && (
        <div className="image-uploader-header">
          {label && <label className="image-uploader-label">{label}</label>}
          {helpText && <span className="image-uploader-hint">{helpText}</span>}
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileProcess(e.target.files[0]);
          }
        }}
        disabled={isUploading}
      />

      {/* Upload State / Dropzone / Preview */}
      {currentUrl && !isUploading ? (
        /* Preview Card */
        <div className="image-uploader-preview-container">
          <div className="image-uploader-preview-media">
            <img
              src={currentUrl}
              alt={altText || 'Uploaded asset preview'}
              className="image-uploader-preview-img"
            />
          </div>

          <div className="image-uploader-actions">
            <div className="image-uploader-meta" title={currentUrl}>
              <CheckCircle size={14} color="#16a34a" />
              <span>Stored in Cloudinary</span>
            </div>

            <div className="image-uploader-btn-group">
              <button
                type="button"
                className="btn-uploader-replace"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Replace image"
              >
                <RefreshCw size={13} />
                <span>Replace</span>
              </button>
              <button
                type="button"
                className="btn-uploader-remove"
                onClick={handleRemove}
                disabled={isUploading}
                title="Remove image"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Optional Alt Text Field */}
          {showAltInput && (
            <div className="image-uploader-alt-row">
              <label className="image-uploader-alt-label">
                Alt Text {requiredAlt && <span style={{ color: '#ef4444' }}>*</span>}
              </label>
              <input
                type="text"
                className="image-uploader-alt-input"
                placeholder="Describe image for accessibility & SEO..."
                value={altText || ''}
                onChange={(e) => onAltChange && onAltChange(e.target.value)}
              />
            </div>
          )}
        </div>
      ) : (
        /* Dropzone / Upload in Progress */
        <div
          className={`image-uploader-dropzone ${isDragging ? 'dragging' : ''} ${errorMessage ? 'has-error' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!isUploading) fileInputRef.current?.click();
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
        >
          {isUploading ? (
            <div className="image-uploader-progress-wrap">
              <UploadCloud className="image-uploader-icon" style={{ animation: 'bounce 1s infinite' }} />
              <div className="image-uploader-progress-bar-bg">
                <div
                  className="image-uploader-progress-bar-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="image-uploader-progress-text">
                Uploading to Cloudinary... {uploadProgress}%
              </span>
            </div>
          ) : (
            <>
              <UploadCloud className="image-uploader-icon" />
              <div className="image-uploader-prompt">
                Drag and drop image here, or <span>browse files</span>
              </div>
              <div className="image-uploader-subtext">
                Direct Cloudinary upload • JPG, PNG, WebP up to 5MB
              </div>
            </>
          )}
        </div>
      )}

      {/* Error message toast / inline display */}
      {errorMessage && (
        <div className="image-uploader-error">
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
