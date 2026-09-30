import React from 'react';
import { useAuth } from '../context/AuthContext';
import NecLogo from '../assets/NecLogo';
import { LogOut, User, Calendar, Coffee } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, switchRole, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* College Logo and Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <NecLogo />
        </div>

        {/* Right action items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Dual-Role Switcher for faculty holding both HOD & Coordinator roles (e.g. Dr S N Tirumala Rao, Dr. V. VENKATA RAO) */}
          {user && user.roles && user.roles.length > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f8fafc',
              borderRadius: '8px',
              padding: '3px',
              gap: '4px',
              border: '1.5px solid #cbd5e1'
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', padding: '0 6px', textTransform: 'uppercase' }}>
                Active View:
              </span>
              {user.roles.map((r) => {
                const isActive = user.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    style={{
                      border: 'none',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: isActive ? '#701a75' : 'transparent',
                      color: isActive ? '#ffffff' : '#475569',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                    title={`Switch to ${r === 'HOD' ? 'Department HOD Portal' : 'Seminar Hall Coordinator Console'}`}
                  >
                    {r === 'HOD' ? 'HOD Portal' : r === 'COORDINATOR' ? 'Coordinator Console' : r}
                  </button>
                );
              })}
            </div>
          )}

          {user && (
            <div className="user-profile-badge">
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: '#701a75', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                {user.name.charAt(0)}
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.1 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {user.email}
                </div>
              </div>

              <span className={`role-tag ${user.role.toLowerCase()}`}>
                {user.role}
              </span>
            </div>
          )}

          {user && (
            <button 
              onClick={logout} 
              className="btn btn-secondary btn-sm"
              title="Sign Out"
              style={{ color: '#ef4444', borderColor: '#fca5a5' }}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
