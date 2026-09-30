import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Building2, Sparkles } from 'lucide-react';

export default function QuickRoleSwitcher() {
  const { user, demoAccounts, demoLogin } = useAuth();

  if (!demoAccounts || demoAccounts.length === 0) return null;

  // Filter key accounts with real emails
  const b2Coord = demoAccounts.find(u => u.email === 'csehod@nrtec.in');
  const b3Coord = demoAccounts.find(u => u.email === 'ecehod@nrtec.in');
  const b4Coord = demoAccounts.find(u => u.email === 'viceprincipal@nrtec.in');
  const hodMech = demoAccounts.find(u => u.email === 'mechhod@nrtec.in');
  const hodCivil = demoAccounts.find(u => u.email === 'civilhod@nrtec.in');
  const aoAccount = demoAccounts.find(u => u.email === 'ao@nrtec.in');

  const handleSwitch = async (account) => {
    if (!account) return;
    try {
      await demoLogin(account._id);
    } catch (err) {
      console.error('Failed to switch role', err);
    }
  };

  return (
    <div className="quick-switcher-banner no-print">
      <div className="quick-switcher-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#fde047" />
          <span style={{ fontWeight: 700, letterSpacing: '0.3px' }}>Faculty Fast Selector:</span>
        </div>

        <div className="switcher-pills">
          {b2Coord && (
            <button
              onClick={() => handleSwitch(b2Coord)}
              className={`switcher-btn ${user?.email === b2Coord.email ? 'active' : ''}`}
              title="CSE HOD & Block-2 Seminar Hall Coordinator"
            >
              <UserCheck size={13} />
              Dr S N Tirumala Rao (CSE / Block-2)
            </button>
          )}

          {b3Coord && (
            <button
              onClick={() => handleSwitch(b3Coord)}
              className={`switcher-btn ${user?.email === b3Coord.email ? 'active' : ''}`}
              title="ECE HOD & Block-3 Seminar Hall Coordinator"
            >
              <UserCheck size={13} />
              Dr. V. VENKATA RAO (ECE / Block-3)
            </button>
          )}

          {b4Coord && (
            <button
              onClick={() => handleSwitch(b4Coord)}
              className={`switcher-btn ${user?.email === b4Coord.email ? 'active' : ''}`}
              title="Vice Principal & Coordinator - Block-4 Seminar Hall"
            >
              <Building2 size={13} />
              Dr. D.Suneel (VP / Block-4)
            </button>
          )}

          {hodMech && (
            <button
              onClick={() => handleSwitch(hodMech)}
              className={`switcher-btn ${user?.email === hodMech.email ? 'active' : ''}`}
              title="HOD Mechanical Engineering"
            >
              <UserCheck size={13} />
              HOD MECH
            </button>
          )}

          {hodCivil && (
            <button
              onClick={() => handleSwitch(hodCivil)}
              className={`switcher-btn ${user?.email === hodCivil.email ? 'active' : ''}`}
              title="HOD Civil Engineering"
            >
              <UserCheck size={13} />
              HOD CIVIL
            </button>
          )}

          {aoAccount && (
            <button
              onClick={() => handleSwitch(aoAccount)}
              className={`switcher-btn ${user?.role === 'AO' ? 'active' : ''}`}
              title="Administrative Officer"
              style={{ borderColor: '#fde047' }}
            >
              <ShieldCheck size={13} color={user?.role === 'AO' ? '#713f12' : '#fde047'} />
              Sri K. Srinivasa Rao (AO)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
