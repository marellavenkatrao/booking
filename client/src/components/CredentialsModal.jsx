import React, { useState } from 'react';
import { X, Key, Shield, User, Copy, Check, Phone, Mail, Building2, ExternalLink } from 'lucide-react';

export default function CredentialsModal({ isOpen, onClose, onSelectEmail }) {
  const [copiedText, setCopiedText] = useState('');

  if (!isOpen) return null;

  const credentials = [
    {
      category: 'Seminar Hall Coordinators',
      description: 'Review and approve Seminar Hall reservations and issue official booking passes',
      list: [
        {
          name: 'Dr S N Tirumala Rao',
          role: 'Coordinator: Block-2 Seminar Hall (Ground Floor)',
          email: 'csehod@nrtec.in',
          phone: '8247394015',
          landline: '08647-239912',
          dept: 'CSE'
        },
        {
          name: 'Dr. V. VENKATA RAO',
          role: 'Coordinator: Block-3 Seminar Hall (First Floor)',
          email: 'ecehod@nrtec.in',
          phone: '9441127485',
          landline: '08647-239914',
          dept: 'ECE'
        },
        {
          name: 'Dr. D.Suneel',
          role: 'Coordinator: Block-4 Seminar Hall (Second Floor)',
          email: 'viceprincipal@nrtec.in',
          phone: '9441127485',
          landline: '',
          dept: 'Vice Principal'
        }
      ]
    },
    {
      category: 'Department HODs (Heads of Department)',
      description: 'Book seminar halls, request external examiner hospitality, and submit stationery requisitions',
      list: [
        {
          name: 'Dr S N Tirumala Rao',
          role: 'HOD Computer Science & Engineering (CSE)',
          email: 'csehod@nrtec.in',
          phone: '8247394015',
          landline: '08647-239912',
          dept: 'CSE'
        },
        {
          name: 'Dr. V. VENKATA RAO',
          role: 'HOD Electronics & Communication Engineering (ECE)',
          email: 'ecehod@nrtec.in',
          phone: '9441127485',
          landline: '08647-239914',
          dept: 'ECE'
        },
        {
          name: 'Dr. B. Venkata Siva',
          role: 'HOD Mechanical Engineering (MECH)',
          email: 'mechhod@nrtec.in',
          phone: '9692464540',
          landline: '',
          dept: 'MECH'
        },
        {
          name: 'Dr. P. Naga Sowjanya',
          role: 'HOD Civil Engineering (CIVIL)',
          email: 'civilhod@nrtec.in',
          phone: '',
          landline: '',
          dept: 'CIVIL'
        },
        {
          name: 'Dr. SHAIK MAHAMMAD SHAREEF',
          role: 'HOD Electrical & Electronics Engineering (EEE)',
          email: 'hodeee@nrtec.in',
          phone: '',
          landline: '',
          dept: 'EEE'
        },
        {
          name: 'Dr. B. Jhansi Rani',
          role: 'HOD Information Technology (IT)',
          email: 'ithod@nrtec.in',
          phone: '',
          landline: '',
          dept: 'IT'
        },
        {
          name: 'Dr. V.V.A.S. Lakshmi',
          role: 'HOD CSE - Emerging Technologies [CSE(ET)]',
          email: 'aicsdshod@nrtec.in',
          phone: '',
          landline: '',
          dept: 'CSE(ET)'
        },
        {
          name: 'Dr. S. Sivaram Prasad',
          role: 'HOD Management Studies (MBA & MCA)',
          email: 'mbahod@nrtec.in',
          phone: '',
          landline: '',
          dept: 'MBA&MCA'
        },
        {
          name: 'Dr. K. P. Lakshmi',
          role: 'HOD Basic Sciences & Humanities (BS&H)',
          email: 'bshhod@nrtec.in',
          phone: '',
          landline: '',
          dept: 'BS&H'
        }
      ]
    },
    {
      category: 'Administrative Officer (AO)',
      description: 'Approves guest house accommodation, VIP dining, transport, and stationery sanctions',
      list: [
        {
          name: 'Sri K. Srinivasa Rao',
          role: 'Administrative Officer (AO)',
          email: 'ao@nrtec.in',
          phone: '9440099887',
          landline: '',
          dept: 'Administrative Office'
        }
      ]
    }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2500);
  };

  const handleUseEmail = (email) => {
    if (onSelectEmail) {
      onSelectEmail(email);
      onClose();
    } else {
      copyToClipboard(email);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Key size={22} color="#701a75" />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>College Faculty & Coordinator Directory</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Official usernames (college emails) and contact details for HODs and Coordinators.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
          {/* Universal Password Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #faf5ff 0%, #fdf4ff 100%)',
            border: '1.5px solid #e879f9',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontWeight: 800, color: '#701a75', fontSize: '0.95rem' }}>
                Common Password for All Faculty Accounts:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <code style={{ background: '#ffffff', border: '1px solid #d946ef', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '1rem', color: '#a21caf' }}>
                  nec@123
                </code>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  (Use this password with any official email below)
                </span>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard('nec@123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '6px 12px', background: '#ffffff', borderColor: '#d946ef', color: '#701a75' }}
            >
              {copiedText === 'nec@123' ? <Check size={14} color="#15803d" /> : <Copy size={14} />}
              <span>{copiedText === 'nec@123' ? 'Password Copied!' : 'Copy Password'}</span>
            </button>
          </div>

          {credentials.map((cat, idx) => (
            <div key={idx} style={{ marginBottom: '24px' }}>
              <div style={{ borderBottom: '1.5px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                  {cat.category}
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0 }}>
                  {cat.description}
                </p>
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                {cat.list.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ minWidth: '240px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>{item.role}</div>
                      {(item.phone || item.landline) && (
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                          {item.phone && <span>Ph: <strong>{item.phone}</strong></span>}
                          {item.landline && <span>Landline: <strong>{item.landline}</strong></span>}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{ fontSize: '0.84rem', color: '#1e293b', background: '#ffffff', padding: '4px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                        {item.email}
                      </code>

                      {onSelectEmail ? (
                        <button
                          onClick={() => handleUseEmail(item.email)}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                          title="Fill this email in login form"
                        >
                          Use Email
                        </button>
                      ) : (
                        <button
                          onClick={() => copyToClipboard(item.email)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 8px' }}
                          title="Copy Email Address"
                        >
                          {copiedText === item.email ? <Check size={14} color="#15803d" /> : <Copy size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Narasaropeta Engineering College • Domain: nrtec.in
          </span>
          <button className="btn btn-primary" onClick={onClose}>
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
}
