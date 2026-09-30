import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import HodDashboard from './pages/HodDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import AoDashboard from './pages/AoDashboard';
import { MapPin, Phone, Mail, Globe, Sparkles } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #701a75', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '12px', fontWeight: 700, color: '#701a75' }}>Loading NEC Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      {/* College Header / Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Role-Specific Main Dashboard View */}
      <main className="main-content">
        {user.role === 'HOD' && <HodDashboard />}
        {user.role === 'COORDINATOR' && <CoordinatorDashboard />}
        {user.role === 'AO' && <AoDashboard />}
      </main>

      {/* College Institutional Footer */}
      <footer className="no-print" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '24px 20px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem', color: '#64748b' }}>
          <div>
            <strong style={{ color: '#701a75' }}>Narasaropeta Engineering College (Autonomous)</strong>
            <div>Kotappakonda Road, Yellamanda (P.O), Narasaraopet, Palnadu Dist., Andhra Pradesh - 522601</div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Approved by AICTE</span>
            <span>•</span>
            <span>Permanently Affiliated to JNTUK</span>
            <span>•</span>
            <span>Accredited with 'A+' Grade by NAAC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
