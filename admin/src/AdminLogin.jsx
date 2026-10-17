import { useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, Eye, EyeOff, KeyRound, LockKeyhole, Mail, RotateCcw } from 'lucide-react';

export default function AdminLogin({ onLogin }) {
  const [page, setPage] = useState('login');
  const [identity, setIdentity] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [securityKeyVisible, setSecurityKeyVisible] = useState(false);
  const [notice, setNotice] = useState('');

  function showResetPage() {
    setResetEmail(identity.includes('@') ? identity : '');
    setNotice('');
    setPage('reset');
  }

  function returnToLogin() {
    setNotice('');
    setPage('login');
  }

  function handleSubmit(event) {
    event.preventDefault();
    setNotice('');
    onLogin?.();
  }

  function handleResetSubmit(event) {
    event.preventDefault();
    setNotice('Reset link delivery will be available once admin authentication is connected.');
  }

  return (
    <main className="admin-login-page">
      <section className={`login-card${page === 'reset' ? ' login-card--reset' : ''}`} aria-labelledby="login-heading">
        {page === 'login' ? (
          <>
            <header className="brand-lockup">
              <img className="brand-logo" src="/logo.png" alt="Sprimax" />
              <p id="login-heading" className="brand-caption">Industrial Admin</p>
            </header>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label" htmlFor="admin-identity">Enterprise ID or Email</label>
                <div className="input-shell">
                  <Building2 className="input-icon" aria-hidden="true" />
                  <input
                    autoComplete="username"
                    className="login-input"
                    id="admin-identity"
                    name="identity"
                    onChange={(event) => setIdentity(event.target.value)}
                    placeholder="admin@forge-craft.local"
                    required
                    type="text"
                    value={identity}
                  />
                </div>
              </div>

              <div className="field-group">
                <div className="label-row">
                  <label className="field-label" htmlFor="security-key">Security Key</label>
                  <button className="text-button forgot-button" onClick={showResetPage} type="button">
                    Forgot Password?
                  </button>
                </div>
                <div className="input-shell">
                  <KeyRound className="input-icon" aria-hidden="true" />
                  <input
                    autoComplete="current-password"
                    className="login-input"
                    id="security-key"
                    name="securityKey"
                    placeholder="Security key"
                    required
                    type={securityKeyVisible ? 'text' : 'password'}
                  />
                  <button
                    aria-label={securityKeyVisible ? 'Hide security key' : 'Show security key'}
                    aria-pressed={securityKeyVisible}
                    className="visibility-button"
                    onClick={() => setSecurityKeyVisible((visible) => !visible)}
                    type="button"
                  >
                    {securityKeyVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <button className="login-submit" type="submit">
                <span>Secure Login</span>
                <ArrowRight aria-hidden="true" />
              </button>

              <p className="form-notice" aria-live="polite" role="status">{notice}</p>
            </form>

            <footer className="security-footer">
              <span className="footer-rule" aria-hidden="true" />
              <p className="security-note"><LockKeyhole aria-hidden="true" /> Secure admin access</p>
            </footer>
          </>
        ) : (
          <div className="reset-content">
            <header className="reset-header">
              <span className="reset-icon"><RotateCcw aria-hidden="true" /></span>
              <h1 id="login-heading" className="reset-title">Reset Your Password</h1>
              <p className="reset-description">
                Enter your administrator email address below to receive a secure reset link.
              </p>
            </header>

            <form className="reset-form-panel" onSubmit={handleResetSubmit}>
              <div className="field-group">
                <label className="field-label" htmlFor="reset-email">Email Address</label>
                <div className="input-shell">
                  <Mail className="input-icon" aria-hidden="true" />
                  <input
                    autoComplete="email"
                    className="login-input"
                    id="reset-email"
                    name="email"
                    onChange={(event) => setResetEmail(event.target.value)}
                    placeholder="admin@company.com"
                    required
                    type="email"
                    value={resetEmail}
                  />
                </div>
              </div>
              <button className="login-submit reset-submit" type="submit">Send Reset Link</button>
            </form>

            <p className="form-notice reset-notice" aria-live="polite" role="status">{notice}</p>

            <button className="text-button back-to-login" onClick={returnToLogin} type="button">
              <ArrowLeft aria-hidden="true" />
              <span>Back to Login</span>
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
