import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NecLogo from '../assets/NecLogo';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* College Header */}
      <div style={{ background: '#ffffff', borderBottom: '2px solid #701a75', padding: '16px 24px', display: 'flex', justifyContent: 'center' }}>
        <NecLogo height={58} />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ maxWidth: '460px', width: '100%' }}>
          
          {/* Email/Password Login Form */}
          <div className="nec-card" style={{ padding: '36px', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <span style={{ 
                fontSize: '0.76rem', 
                fontWeight: 800, 
                color: '#701a75', 
                background: '#fae8ff', 
                padding: '4px 12px', 
                borderRadius: '9999px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px' 
              }}>
                Secure Portal Access
              </span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: '12px' }}>
                Faculty & Staff Sign In
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '6px', lineHeight: 1.45 }}>
                Enter your official college email address and password to access the portal.
              </p>
            </div>

            {error && (
              <div style={{ 
                background: '#fee2e2', 
                color: '#b91c1c', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                marginBottom: '20px', 
                fontSize: '0.86rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem', color: '#334155' }}>
                  Official College Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. csehod@nrtec.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    style={{ fontSize: '0.92rem', padding: '12px 14px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '22px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem', color: '#334155' }}>
                  Account Password *
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ fontSize: '0.92rem', padding: '12px 14px' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  padding: '13px', 
                  fontSize: '0.95rem', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                disabled={loading}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div style={{ 
              marginTop: '28px', 
              paddingTop: '20px', 
              borderTop: '1px solid #f1f5f9', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px', 
              fontSize: '0.78rem', 
              color: '#64748b' 
            }}>
              <ShieldCheck size={15} color="#16a34a" />
              <span>Authorized Faculty & Administrative Personnel Only</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
