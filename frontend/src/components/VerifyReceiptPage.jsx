import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function VerifyReceiptPage({ onBackToCareers }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') || '';
    const ref = params.get('ref') || '';

    if (!code && !ref) {
      setLoading(false);
      setError('No verification code or reference number provided.');
      return;
    }

    const query = new URLSearchParams();
    if (code) query.append('code', code);
    if (ref) query.append('ref', ref);

    fetch(`${API_BASE}/careers/verify-receipt?${query.toString()}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Receipt could not be verified.');
        return json;
      })
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => {
        setError(err.message || 'Verification failed.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '640px', margin: '60px auto', padding: '32px 24px', fontFamily: 'system-ui, sans-serif' }}>
      <button
        type="button"
        onClick={onBackToCareers}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: '#395F94',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={16} /> Return to Careers Portal
      </button>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <ShieldCheck size={28} color="#dc2626" />
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
              Sprimax Document Verification
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
              Official Certificate of Application Lodgement
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
            <Loader2 size={24} className="spinning" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0 }}>Verifying cryptographic signature with Sprimax registry...</p>
          </div>
        ) : error ? (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              padding: '16px',
              borderRadius: '6px',
              color: '#991B1B',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '6px' }}>
              <AlertCircle size={18} />
              <span>Invalid Receipt Record</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px' }}>{error}</p>
          </div>
        ) : data?.valid ? (
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                padding: '6px 12px',
                borderRadius: '4px',
                color: '#065F46',
                fontWeight: 700,
                fontSize: '12px',
                marginBottom: '20px',
              }}
            >
              <CheckCircle2 size={16} color="#059669" />
              <span>AUTHENTIC RECEIPT CONFIRMED</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  REFERENCE NUMBER:
                </span>
                <code style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                  {data.referenceNumber}
                </code>
              </div>

              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  POSITION APPLIED FOR:
                </span>
                <strong style={{ color: '#0F172A' }}>{data.jobTitle}</strong>
              </div>

              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  OPERATIONAL DIVISION:
                </span>
                <span style={{ color: '#334155' }}>{data.department}</span>
              </div>

              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  DATE OF SUBMISSION (UTC):
                </span>
                <span style={{ color: '#334155' }}>
                  {new Date(data.submittedAt).toUTCString()}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  REGISTRY STATUS:
                </span>
                <span style={{ color: '#059669', fontWeight: 700 }}>
                  {data.status || 'Lodged & Secured'}
                </span>
              </div>
            </div>

            <p style={{ marginTop: '24px', fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>
              Note: To protect candidate privacy, personal identifying information is omitted from this public verification check.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
