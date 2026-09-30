import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingApi, hallApi } from '../services/api';
import BookingPassModal from '../components/BookingPassModal';
import CoordinatorUsageReport from '../components/CoordinatorUsageReport';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Calendar, 
  AlertCircle, 
  Printer, 
  Check, 
  X, 
  MessageSquare,
  ShieldAlert,
  BarChart3,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('reservations'); // 'reservations' | 'departmentReport'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [remarksState, setRemarksState] = useState({});
  const [viewingPass, setViewingPass] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [successToast, setSuccessToast] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getAll();
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load coordinator bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionLoading(bookingId);
    try {
      const remarks = remarksState[bookingId] || (newStatus === 'APPROVED' ? 'Approved by Seminar Hall Coordinator.' : 'Slot unavailable.');
      const res = await bookingApi.updateStatus(bookingId, newStatus, remarks);
      
      if (newStatus === 'APPROVED') {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
        setSuccessToast(res.data?.message || 'Official Seminar Hall Pass generated and delivered directly to the HOD login!');
        setTimeout(() => setSuccessToast(''), 7000);
      }
      
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter bookings
  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const approvedBookings = bookings.filter(b => b.status === 'APPROVED');
  const rejectedBookings = bookings.filter(b => b.status === 'REJECTED');

  const displayedBookings = filterStatus === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  const hallName = user?.assignedHall?.name || (
    user?.email === 'csehod@nrtec.in' || user?.name?.toLowerCase().includes('tirumala') ? 'Block-2 Seminar Hall' :
    user?.email === 'ecehod@nrtec.in' || user?.name?.toLowerCase().includes('venkata') ? 'Block-3 Seminar Hall' :
    user?.email === 'viceprincipal@nrtec.in' || user?.name?.toLowerCase().includes('suneel') || user?.name?.toLowerCase().includes('sunil') ? 'Block-4 Seminar Hall' : 'Assigned Seminar Hall'
  );

  return (
    <div>
      {/* Coordinator Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #4a044e 0%, #701a75 100%)', 
        borderRadius: '16px', 
        padding: '24px 28px', 
        color: '#ffffff', 
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#fde047', color: '#713f12', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800 }}>
              COORDINATOR CONSOLE
            </span>
            <span style={{ opacity: 0.9, fontSize: '0.86rem' }}>{hallName}</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '6px' }}>
            {user?.name}
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.9rem', maxWidth: '650px', marginTop: '4px' }}>
            Review, evaluate and approve departmental reservation requisitions for <strong>{hallName}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8 }}>Action Required</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fde047' }}>
              {pendingBookings.length} Pending {pendingBookings.length === 1 ? 'Request' : 'Requests'}
            </div>
          </div>

          <button
            className="btn"
            onClick={() => setActiveTab('departmentReport')}
            style={{ 
              background: activeTab === 'departmentReport' ? '#ffffff' : '#fde047', 
              color: activeTab === 'departmentReport' ? '#701a75' : '#713f12', 
              fontWeight: 800, 
              border: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}
          >
            <BarChart3 size={16} />
            Department Usage Report
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-nav no-print" style={{ marginBottom: '24px' }}>
        <button 
          className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservations')}
        >
          <Building2 size={18} />
          <span>Seminar Hall Reservations ({bookings.length})</span>
          {pendingBookings.length > 0 && (
            <span style={{ background: '#fef08a', color: '#854d0e', padding: '1px 7px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800, marginLeft: '4px' }}>
              {pendingBookings.length} pending
            </span>
          )}
        </button>

        <button 
          className={`tab-btn ${activeTab === 'departmentReport' ? 'active' : ''}`}
          onClick={() => setActiveTab('departmentReport')}
        >
          <BarChart3 size={18} />
          <span>📊 Department Usage Report (From & To Dates)</span>
        </button>
      </div>

      {/* Report Tab View */}
      {activeTab === 'departmentReport' && (
        <CoordinatorUsageReport user={user} />
      )}

      {/* Reservations Tab View */}
      {activeTab === 'reservations' && (
        <>
          {/* Pass Dispatched Toast Banner */}
          {successToast && (
            <div style={{
              background: '#f0fdf4',
              border: '2px solid #86efac',
              borderRadius: '12px',
              padding: '14px 18px',
              color: '#15803d',
              fontWeight: 800,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <CheckCircle size={20} />
              <span>{successToast}</span>
            </div>
          )}

          {/* Stats row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>PENDING REQUISITIONS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309' }}>{pendingBookings.length}</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Awaiting your decision</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#15803d' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>APPROVED RESERVATIONS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>{approvedBookings.length}</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Confirmed on calendar</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#b91c1c' }}>
            <XCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>REJECTED REQUESTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b91c1c' }}>{rejectedBookings.length}</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Declined / Clashed</div>
          </div>
        </div>
      </div>

      {/* PENDING APPROVALS QUEUE (Highlight) */}
      {pendingBookings.length > 0 && (
        <div className="nec-card" style={{ border: '2px solid #fde047', background: '#fffdf5', marginBottom: '28px' }}>
          <div className="nec-card-header" style={{ borderColor: '#fef08a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={22} color="#b45309" />
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#854d0e' }}>
                  Pending Requisitions Requiring Coordinator Approval ({pendingBookings.length})
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#a16207' }}>
                  Verify slot availability, equipment requirements, and record coordinator decision.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {pendingBookings.map((b) => (
              <div 
                key={b._id} 
                style={{ 
                  background: '#ffffff', 
                  border: '1.5px solid #e2e8f0', 
                  borderRadius: '12px', 
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#701a75', background: '#fae8ff', padding: '3px 8px', borderRadius: '4px' }}>
                      {b.bookingId}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                      {b.eventName}
                    </h3>
                    <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '2px' }}>
                      Requested by <strong>{b.hodName}</strong> ({b.department})
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a' }}>
                      <Calendar size={16} />
                      <span>
                        {(b.isMultiDay || (b.fromDate && b.toDate && b.fromDate !== b.toDate)) 
                          ? `${b.fromDate} to ${b.toDate}` 
                          : (b.fromDate || b.date)}
                      </span>
                    </div>
                    {b.isMultiDay && (
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6d28d9' }}>
                        Multi-Day Booking ({Math.max(1, Math.round((new Date(b.toDate) - new Date(b.fromDate)) / (1000 * 60 * 60 * 24)) + 1)} Days)
                      </div>
                    )}
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#701a75', marginTop: '2px' }}>
                      Slot: {b.slot === 'FN' ? 'Forenoon (09:30 AM - 12:30 PM)' : b.slot === 'AN' ? 'Afternoon (01:30 PM - 04:30 PM)' : 'Full Day'}
                    </div>
                  </div>
                </div>

                {/* Event parameters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.84rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Category:</span> <strong>{b.eventType}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Expected Audience:</span> <strong>{b.expectedAudience} Persons</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Chief Guest:</span> <strong>{b.chiefGuest || 'Internal'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>AV Needs:</span>{' '}
                    <span>
                      {b.requirements?.projector && 'Projector • '}
                      {b.requirements?.soundSystem && 'Sound • '}
                      {b.requirements?.airConditioning && 'AC • '}
                      {b.requirements?.podiumMic && 'Mic'}
                    </span>
                  </div>
                </div>

                {b.requirements?.specialArrangements && (
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '14px', background: '#eff6ff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                    <strong>Special Arrangements:</strong> {b.requirements.specialArrangements}
                  </div>
                )}

                {/* Coordinator Action Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Coordinator Remarks (e.g. Approved. Audio engineer notified.)"
                      value={remarksState[b._id] || ''}
                      onChange={(e) => setRemarksState({ ...remarksState, [b._id]: e.target.value })}
                      style={{ fontSize: '0.85rem', padding: '7px 12px' }}
                    />
                  </div>

                  <button
                    className="btn btn-success"
                    onClick={() => handleUpdateStatus(b._id, 'APPROVED')}
                    disabled={actionLoading === b._id}
                    title="Approve booking and immediately dispatch official pass to HOD login"
                  >
                    <Check size={16} />
                    Approve & Send Pass to HOD
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => handleUpdateStatus(b._id, 'REJECTED')}
                    disabled={actionLoading === b._id}
                  >
                    <X size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL RESERVATIONS HISTORY */}
      <div className="nec-card">
        <div className="nec-card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 className="card-title">
              <Building2 size={20} color="#701a75" />
              <span>{hallName} Schedule & History</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Complete record of all requests submitted by Department HODs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'APPROVED', 'PENDING', 'CANCELLED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {displayedBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <p>No bookings found matching filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="nec-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Department & HOD</th>
                  <th>Event Name</th>
                  <th>Date & Slot</th>
                  <th>Audience</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedBookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <code>{b.bookingId}</code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{b.department}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.hodName}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{b.eventName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{b.eventType}</div>
                    </td>
                    <td>
                      <div>
                        {(b.isMultiDay || (b.fromDate && b.toDate && b.fromDate !== b.toDate)) ? (
                          <div>
                            <div style={{ fontWeight: 800, color: '#1e3a8a' }}>
                              {b.fromDate} to {b.toDate}
                            </div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6d28d9', background: '#ede9fe', padding: '1px 6px', borderRadius: '4px' }}>
                              Multi-Day
                            </span>
                          </div>
                        ) : (
                          <div style={{ fontWeight: 700 }}>{b.fromDate || b.date}</div>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#1e40af' }}>{b.slot}</div>
                    </td>
                    <td>{b.expectedAudience}</td>
                    <td>
                      <span className={`status-badge ${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#475569', maxWidth: '200px' }}>
                      {b.status === 'CANCELLED' ? (
                        <div>
                          <span style={{ color: '#dc2626', fontWeight: 700 }}>Cancelled by Dept</span>
                          {b.cancellationReason && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                              "{b.cancellationReason}"
                            </div>
                          )}
                        </div>
                      ) : (
                        b.coordinatorRemarks || '—'
                      )}
                    </td>
                    <td>
                      {b.status === 'APPROVED' ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setViewingPass(b)}
                          title="Print Approved Pass"
                        >
                          <Printer size={13} />
                          Pass
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      <BookingPassModal
        isOpen={Boolean(viewingPass)}
        onClose={() => setViewingPass(null)}
        booking={viewingPass}
      />
    </div>
  );
}
