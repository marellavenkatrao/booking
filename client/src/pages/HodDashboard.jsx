import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingApi, examinerApi, stationaryApi } from '../services/api';
import HallAvailabilityGrid from '../components/HallAvailabilityGrid';
import BookingModal from '../components/BookingModal';
import HospitalityModal from '../components/HospitalityModal';
import BookingPassModal from '../components/BookingPassModal';
import SanctionOrderModal from '../components/SanctionOrderModal';
import StationaryRequisitionModal from '../components/StationaryRequisitionModal';
import StationaryVoucherModal from '../components/StationaryVoucherModal';
import HodHallUsageReport from '../components/HodHallUsageReport';
import HodExaminerSanctionsReport from '../components/HodExaminerSanctionsReport';
import { 
  Building2, 
  Utensils, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Printer, 
  PlusCircle, 
  UserCheck, 
  Bed, 
  Coffee,
  FileText,
  Package,
  Trash2,
  BarChart3,
  Ban
} from 'lucide-react';

export default function HodDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('halls'); // 'halls' | 'examiners' | 'hallReport' | 'examinerReport'
  
  // Data state
  const [bookings, setBookings] = useState([]);
  const [examinerRequests, setExaminerRequests] = useState([]);
  const [stationaryRequests, setStationaryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [hospitalityModalOpen, setHospitalityModalOpen] = useState(false);
  const [stationaryModalOpen, setStationaryModalOpen] = useState(false);
  const [preselectedHall, setPreselectedHall] = useState(null);
  const [preselectedDate, setPreselectedDate] = useState('');
  
  // Printable slips
  const [viewingBookingPass, setViewingBookingPass] = useState(null);
  const [viewingSanctionOrder, setViewingSanctionOrder] = useState(null);
  const [viewingStationaryVoucher, setViewingStationaryVoucher] = useState(null);

  // Cancellation facility state for Department HOD
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelToast, setCancelToast] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, examinerRes, stationaryRes] = await Promise.all([
        bookingApi.getAll(),
        examinerApi.getAll(),
        stationaryApi.getAll()
      ]);
      setBookings(bookingsRes.data.bookings || []);
      setExaminerRequests(examinerRes.data.requests || []);
      setStationaryRequests(stationaryRes.data.requests || []);
    } catch (err) {
      console.error('Failed to load HOD data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey, user]);

  const handleBookFromGrid = (hall, date) => {
    setPreselectedHall(hall);
    setPreselectedDate(date);
    setBookingModalOpen(true);
  };

  // Stats calculation
  const approvedBookings = bookings.filter(b => b.status === 'APPROVED');
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
  const approvedExaminers = examinerRequests.filter(r => r.status === 'APPROVED').length;
  const pendingExaminers = examinerRequests.filter(r => r.status === 'PENDING').length;
  const approvedStationary = stationaryRequests.filter(r => ['APPROVED', 'ISSUED'].includes(r.status)).length;
  const pendingStationary = stationaryRequests.filter(r => r.status === 'PENDING').length;

  const handleOpenPass = async (booking) => {
    setViewingBookingPass(booking);
    try {
      await bookingApi.acknowledgePass(booking._id);
    } catch (e) {
      // non-blocking
    }
  };

  const handleInitiateCancel = (booking) => {
    setCancellingBooking(booking);
    setCancellationReason('');
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setCancelLoading(true);
    try {
      await bookingApi.cancel(cancellingBooking._id, cancellationReason);
      setCancelToast(`Booking for "${cancellingBooking.eventName}" has been cancelled successfully.`);
      setCancellingBooking(null);
      setCancellationReason('');
      await fetchData();
      setRefreshKey(k => k + 1);
      setTimeout(() => setCancelToast(''), 6000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div>
      {/* Cancellation Toast */}
      {cancelToast && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #f87171',
          color: '#991b1b',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ban size={18} />
            <span>{cancelToast}</span>
          </div>
          <button 
            onClick={() => setCancelToast('')}
            style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #701a75 0%, #4a044e 100%)', 
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
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800 }}>
              HOD PORTAL
            </span>
            <span style={{ opacity: 0.8, fontSize: '0.85rem' }}>{user?.department}</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '6px' }}>
            Welcome, {user?.name}
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.9rem', maxWidth: '650px', marginTop: '4px' }}>
            Manage seminar hall reservations with designated coordinators and submit external examiner accommodation and hospitality requisitions to the Administrative Officer (AO).
          </p>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn" 
            onClick={() => {
              setPreselectedHall(null);
              setBookingModalOpen(true);
            }}
            style={{ background: '#fde047', color: '#713f12', fontWeight: 800 }}
          >
            <PlusCircle size={16} />
            Book Seminar Hall
          </button>

          <button 
            className="btn" 
            onClick={() => setHospitalityModalOpen(true)}
            style={{ background: '#ffffff', color: '#701a75', fontWeight: 800 }}
          >
            <Utensils size={16} />
            AO Examiner Requisition
          </button>

          <button 
            className="btn" 
            onClick={() => setStationaryModalOpen(true)}
            style={{ background: '#1e3a8a', color: '#ffffff', fontWeight: 800, border: '1px solid #60a5fa' }}
          >
            <Package size={16} />
            AO Stationary Requisition
          </button>

          <button 
            className="btn" 
            onClick={() => setActiveTab('hallReport')}
            style={{ 
              background: activeTab === 'hallReport' ? '#ffffff' : '#f5f3ff', 
              color: '#6b21a8', 
              fontWeight: 800, 
              border: '1px solid #d8b4fe' 
            }}
            title="View report for usage of different seminar halls in given from and to dates"
          >
            <BarChart3 size={16} />
            📊 Hall Usage Report
          </button>

          <button 
            className="btn" 
            onClick={() => setActiveTab('examinerReport')}
            style={{ 
              background: activeTab === 'examinerReport' ? '#ffffff' : '#fffbeb', 
              color: '#92400e', 
              fontWeight: 800, 
              border: '1px solid #fde68a' 
            }}
            title="View report for external examiner hospitality & accommodation sanctions"
          >
            <Utensils size={16} />
            📑 Examiner Sanctions Report
          </button>
        </div>
      </div>

      {/* Coordinator Approved Pass Delivered Alert Banner */}
      {approvedBookings.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '2px solid #86efac',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: '#15803d', color: '#ffffff', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#166534', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Official Seminar Hall Passes Delivered to Your Login!</span>
                <span style={{ background: '#15803d', color: 'white', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '9999px', fontWeight: 800 }}>
                  {approvedBookings.length} {approvedBookings.length === 1 ? 'Pass' : 'Passes'} Sent
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#14532d', marginTop: '3px' }}>
                Seminar hall coordinator(s) have approved your booking request(s) and transmitted the official reservation sanction slip(s) to your login.
              </div>
            </div>
          </div>
          <button
            className="btn btn-success btn-sm"
            onClick={() => setActiveTab('passes')}
            style={{ fontWeight: 800 }}
          >
            View Delivered Passes ({approvedBookings.length})
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fce7f3', color: '#701a75' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>SEMINAR HALL BOOKINGS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{bookings.length}</div>
            <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>{approvedBookings.length} Confirmed • {pendingBookings} Pending</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Utensils size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>AO EXAMINER REQUESTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{examinerRequests.length}</div>
            <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>{approvedExaminers} Sanctioned • {pendingExaminers} Pending</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#e0e7ff', color: '#3730a3' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>COLLEGE SEMINAR HALLS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>3 Halls</div>
            <div style={{ fontSize: '0.74rem', color: '#475569' }}>Block-2, Block-3, Block-4</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>STATIONERY INDENTS (AO)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0369a1' }}>{stationaryRequests.length}</div>
            <div style={{ fontSize: '0.74rem', color: '#0369a1', fontWeight: 600 }}>{approvedStationary} Sanctioned • {pendingStationary} Pending</div>
          </div>
        </div>
      </div>

      {/* Interactive Hall Availability Matrix */}
      <HallAvailabilityGrid 
        onSelectHallToBook={handleBookFromGrid}
        refreshTrigger={refreshKey}
      />

      {/* Tabs navigation for Requests & Reports */}
      <div className="nec-card">
        <div className="tabs-nav no-print" style={{ flexWrap: 'wrap' }}>
          <button 
            className={`tab-btn ${activeTab === 'passes' ? 'active' : ''}`}
            onClick={() => setActiveTab('passes')}
          >
            <FileText size={18} />
            Delivered Passes ({approvedBookings.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'halls' ? 'active' : ''}`}
            onClick={() => setActiveTab('halls')}
          >
            <Building2 size={18} />
            Hall Bookings ({bookings.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'examiners' ? 'active' : ''}`}
            onClick={() => setActiveTab('examiners')}
          >
            <Utensils size={18} />
            AO Examiner Requisitions ({examinerRequests.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stationary' ? 'active' : ''}`}
            onClick={() => setActiveTab('stationary')}
          >
            <Package size={18} />
            AO Stationery ({stationaryRequests.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'hallReport' ? 'active' : ''}`}
            onClick={() => setActiveTab('hallReport')}
            style={{ fontWeight: activeTab === 'hallReport' ? 800 : 600 }}
          >
            <BarChart3 size={18} />
            📊 Hall Usage Report (From & To Dates)
          </button>
          <button 
            className={`tab-btn ${activeTab === 'examinerReport' ? 'active' : ''}`}
            onClick={() => setActiveTab('examinerReport')}
            style={{ fontWeight: activeTab === 'examinerReport' ? 800 : 600 }}
          >
            <Utensils size={18} />
            📑 Examiner Sanctions Report
          </button>
        </div>

        {/* Tab 0: Delivered Passes from Coordinators */}
        {activeTab === 'passes' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#166534' }}>
                Delivered Official Seminar Hall Passes
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                These official passes were generated and transmitted directly to your login upon approval by the respective Seminar Hall Coordinators.
              </p>
            </div>

            {approvedBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <FileText size={42} strokeWidth={1.5} style={{ opacity: 0.4, marginBottom: '8px' }} />
                <p style={{ fontWeight: 600 }}>No approved passes delivered yet.</p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Once a Coordinator (Dr S N Tirumala Rao, Dr. V. VENKATA RAO, or Dr. D.Suneel) approves your booking, the pass appears here automatically.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {approvedBookings.map((b) => (
                  <div 
                    key={b._id}
                    style={{
                      border: '2px solid #86efac',
                      borderRadius: '12px',
                      background: '#ffffff',
                      padding: '18px',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fdf4ff', border: '1px solid #e879f9', color: '#701a75', padding: '2px 8px', borderRadius: '4px' }}>
                          {b.passNumber || b.bookingId}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700, background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                          ✓ PASS DELIVERED
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                        {b.eventName}
                      </h4>

                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#701a75', marginBottom: '8px' }}>
                        {b.hallName}
                      </div>

                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '12px' }}>
                        <div>
                          <strong>Date:</strong>{' '}
                          {(b.isMultiDay || (b.fromDate && b.toDate && b.fromDate !== b.toDate)) 
                            ? `${b.fromDate} to ${b.toDate} (Multi-Day)` 
                            : (b.fromDate || b.date)}{' '}
                          ({b.slot === 'FN' ? 'Forenoon 09:30 AM - 12:30 PM' : b.slot === 'AN' ? 'Afternoon 01:30 PM - 04:30 PM' : 'Full Day'})
                        </div>
                        <div style={{ marginTop: '3px' }}><strong>Approved By:</strong> {b.coordinator?.name || b.coordinatorName || 'Hall Coordinator'}</div>
                        <div style={{ marginTop: '3px', color: '#166534', fontStyle: 'italic' }}>"{b.coordinatorRemarks || 'Approved by coordinator.'}"</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleOpenPass(b)}
                        style={{ flex: 1, padding: '9px', fontWeight: 700 }}
                      >
                        <Printer size={15} />
                        View & Print Pass
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleInitiateCancel(b)}
                        style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontWeight: 700, padding: '9px 12px' }}
                        title="Cancel this confirmed booking"
                      >
                        <Ban size={15} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 1: All Hall Requests */}
        {activeTab === 'halls' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                All Department Seminar Hall Requisitions & Status
              </h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setPreselectedHall(null);
                  setBookingModalOpen(true);
                }}
              >
                <PlusCircle size={14} />
                New Hall Booking
              </button>
            </div>

            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <Building2 size={40} strokeWidth={1.5} style={{ opacity: 0.5, marginBottom: '8px' }} />
                <p style={{ fontWeight: 600 }}>No seminar hall bookings placed yet.</p>
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ marginTop: '10px' }}
                  onClick={() => setBookingModalOpen(true)}
                >
                  Place First Booking
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="nec-table">
                  <thead>
                    <tr>
                      <th>Booking Ref</th>
                      <th>Hall & Coordinator</th>
                      <th>Event Details</th>
                      <th>Date & Slot</th>
                      <th>Audience</th>
                      <th>Approval Status</th>
                      <th>Coordinator Remarks</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>
                          <code style={{ fontWeight: 700, color: '#701a75' }}>
                            {booking.bookingId || 'NEC-SH'}
                          </code>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{booking.hallName}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            Coord: {booking.coordinator?.name || booking.coordinatorName || 'Assigned Coordinator'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{booking.eventName}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {booking.eventType} {booking.chiefGuest && `• Guest: ${booking.chiefGuest}`}
                          </div>
                        </td>
                        <td>
                          <div>
                            {(booking.isMultiDay || (booking.fromDate && booking.toDate && booking.fromDate !== booking.toDate)) ? (
                              <div>
                                <div style={{ fontWeight: 800, color: '#1e3a8a' }}>
                                  {booking.fromDate} to {booking.toDate}
                                </div>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6d28d9', background: '#ede9fe', padding: '1px 6px', borderRadius: '4px' }}>
                                  Multi-Day Event
                                </span>
                              </div>
                            ) : (
                              <div style={{ fontWeight: 700 }}>{booking.fromDate || booking.date}</div>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '2px' }}>
                            {booking.slot === 'FN' ? 'Forenoon (9:30 - 12:30)' : booking.slot === 'AN' ? 'Afternoon (1:30 - 4:30)' : 'Full Day'}
                          </div>
                        </td>
                        <td>{booking.expectedAudience}</td>
                        <td>
                          <span className={`status-badge ${booking.status.toLowerCase()}`}>
                            {booking.status === 'APPROVED' && <CheckCircle size={12} />}
                            {booking.status === 'PENDING' && <AlertCircle size={12} />}
                            {booking.status === 'CANCELLED' && <Ban size={12} />}
                            {booking.status === 'REJECTED' && <XCircle size={12} />}
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#475569', maxWidth: '200px' }}>
                          {booking.status === 'CANCELLED' ? (
                            <div>
                              <span style={{ color: '#dc2626', fontWeight: 700 }}>Cancelled by Dept</span>
                              {booking.cancellationReason && (
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                                  "{booking.cancellationReason}"
                                </div>
                              )}
                            </div>
                          ) : (
                            booking.coordinatorRemarks || 'Awaiting coordinator review'
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {booking.status === 'APPROVED' && (
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => setViewingBookingPass(booking)}
                                title="Print / View Official Sanction Pass"
                              >
                                <Printer size={13} />
                                Pass
                              </button>
                            )}
                            {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                              <button
                                className="btn btn-sm"
                                style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontWeight: 700 }}
                                onClick={() => handleInitiateCancel(booking)}
                                title="Cancel this booking requisition"
                              >
                                <Ban size={13} />
                                Cancel
                              </button>
                            )}
                            {booking.status === 'CANCELLED' && (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Cancelled</span>
                            )}
                            {booking.status === 'REJECTED' && (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Rejected</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: External Examiner Requisitions Table */}
        {activeTab === 'examiners' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                External Examiner Accommodation & Hospitality Requisitions (to AO)
              </h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setHospitalityModalOpen(true)}
              >
                <PlusCircle size={14} />
                New AO Requisition
              </button>
            </div>

            {examinerRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <Utensils size={40} strokeWidth={1.5} style={{ opacity: 0.5, marginBottom: '8px' }} />
                <p style={{ fontWeight: 600 }}>No examiner requisitions submitted to AO yet.</p>
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ marginTop: '10px' }}
                  onClick={() => setHospitalityModalOpen(true)}
                >
                  Create AO Requisition
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="nec-table">
                  <thead>
                    <tr>
                      <th>Requisition No</th>
                      <th>Subject & Purpose</th>
                      <th>External Examiner(s)</th>
                      <th>Dates</th>
                      <th>Accommodation</th>
                      <th>Refreshments</th>
                      <th>AO Approval</th>
                      <th>Order Slip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examinerRequests.map((req) => (
                      <tr key={req._id}>
                        <td>
                          <code style={{ fontWeight: 700, color: '#1e3a8a' }}>
                            {req.requisitionNo}
                          </code>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{req.examSubject}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{req.purpose}</div>
                        </td>
                        <td>
                          {req.examiners?.map((ex, i) => (
                            <div key={i} style={{ fontSize: '0.82rem' }}>
                              <strong>{ex.name}</strong>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{ex.institution}</div>
                            </div>
                          ))}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{req.examDateFrom}</div>
                          {req.examDateTo !== req.examDateFrom && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>to {req.examDateTo}</div>
                          )}
                        </td>
                        <td>
                          {req.accommodation?.required ? (
                            <div>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e40af' }}>
                                {req.accommodation.roomType}
                              </span>
                              <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>
                                {req.accommodation.allocatedRoom}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Not Required</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.78rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {req.food?.breakfast?.required && <span>✓ Breakfast ({req.food.breakfast.count})</span>}
                            {req.food?.morningTea?.required && <span>✓ Morning Tea ({req.food.morningTea.count})</span>}
                            {req.food?.lunch?.required && (
                              <span style={{ fontWeight: 700, color: '#c2410c' }}>
                                ✓ Lunch ({req.food.lunch.count} meals)
                              </span>
                            )}
                            {req.food?.eveningTea?.required && <span>✓ Evening Tea ({req.food.eveningTea.count})</span>}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${req.status.toLowerCase()}`}>
                            {req.status === 'APPROVED' && <CheckCircle size={12} />}
                            {req.status === 'PENDING' && <AlertCircle size={12} />}
                            {req.status === 'REJECTED' && <XCircle size={12} />}
                            {req.status}
                          </span>
                          {req.aoRemarks && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', maxWidth: '160px' }}>
                              AO: {req.aoRemarks}
                            </div>
                          )}
                        </td>
                        <td>
                          {req.status === 'APPROVED' ? (
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => setViewingSanctionOrder(req)}
                              title="Print Sanction Order"
                            >
                              <Printer size={13} />
                              Sanction
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Awaiting AO</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Department Stationary Requisitions (AO) */}
        {activeTab === 'stationary' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Department Stationery Requisitions to AO
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                  Place and track stationery indent requisitions to the Administrative Officer for A4 paper, staplers, pencils, markers, registers, and office supplies.
                </p>
              </div>

              <button 
                className="btn btn-sm"
                onClick={() => setStationaryModalOpen(true)}
                style={{ 
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', 
                  color: '#ffffff', 
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <PlusCircle size={15} />
                New Stationary Requisition
              </button>
            </div>

            {stationaryRequests.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Package size={42} strokeWidth={1.5} style={{ opacity: 0.5, marginBottom: '8px', color: '#1e3a8a' }} />
                <p style={{ fontWeight: 600 }}>No stationery requisitions submitted to AO yet.</p>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                  Need A4 sheets, staplers, pencils, markers, or registers for exams or laboratory records?
                </p>
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ marginTop: '12px' }}
                  onClick={() => setStationaryModalOpen(true)}
                >
                  Create AO Stationary Requisition
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="nec-table">
                  <thead>
                    <tr>
                      <th>Requisition No</th>
                      <th>Purpose & Urgency</th>
                      <th>Stationery Items Indented</th>
                      <th>Needed By</th>
                      <th>AO Status</th>
                      <th>Store Order Slip</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stationaryRequests.map((req) => (
                      <tr key={req._id}>
                        <td>
                          <code style={{ fontWeight: 800, color: '#1e3a8a' }}>
                            {req.requisitionNo}
                          </code>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{req.purpose}</div>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 800, 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginTop: '2px',
                            color: req.urgency === 'EXAM_CRITICAL' ? '#991b1b' : req.urgency === 'URGENT' ? '#92400e' : '#166534',
                            background: req.urgency === 'EXAM_CRITICAL' ? '#fee2e2' : req.urgency === 'URGENT' ? '#fef3c7' : '#dcfce7'
                          }}>
                            {req.urgency}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {req.items?.slice(0, 3).map((item, i) => (
                              <div key={i} style={{ fontSize: '0.8rem' }}>
                                <strong>{item.itemName}</strong>:{' '}
                                <span style={{ color: '#1e3a8a', fontWeight: 700 }}>
                                  {item.quantityRequested} {item.unit}
                                </span>
                              </div>
                            ))}
                            {req.items?.length > 3 && (
                              <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>
                                + {req.items.length - 3} more items...
                              </div>
                            )}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{req.requiredByDate}</div>
                        </td>

                        <td>
                          <span className={`status-badge ${req.status.toLowerCase()}`}>
                            {req.status === 'APPROVED' && <CheckCircle size={12} />}
                            {req.status === 'ISSUED' && <CheckCircle size={12} />}
                            {req.status === 'PENDING' && <AlertCircle size={12} />}
                            {req.status === 'REJECTED' && <XCircle size={12} />}
                            {req.status}
                          </span>
                          {req.aoRemarks && (
                            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px', maxWidth: '170px' }}>
                              AO: {req.aoRemarks}
                            </div>
                          )}
                        </td>

                        <td>
                          {['APPROVED', 'ISSUED'].includes(req.status) ? (
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => setViewingStationaryVoucher(req)}
                              title="Print Official Stationery Sanction Order"
                              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                              <Printer size={13} />
                              Sanction Slip
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Awaiting AO</span>
                          )}
                        </td>

                        <td>
                          {req.status === 'PENDING' ? (
                            <button
                              className="btn btn-sm"
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to cancel this stationary requisition?')) {
                                  try {
                                    await stationaryApi.delete(req._id);
                                    setRefreshKey(k => k + 1);
                                  } catch (err) {
                                    alert(err.response?.data?.message || 'Failed to cancel requisition');
                                  }
                                }
                              }}
                              style={{ color: '#ef4444', border: '1px solid #fecaca', background: '#fef2f2', padding: '4px 8px', fontSize: '0.75rem' }}
                              title="Cancel Requisition"
                            >
                              <Trash2 size={13} />
                              Cancel
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setViewingStationaryVoucher(req)}
                              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                            >
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Seminar Hall Usage Report */}
        {activeTab === 'hallReport' && (
          <div style={{ marginTop: '10px' }}>
            <HodHallUsageReport user={user} />
          </div>
        )}

        {/* Tab 5: External Examiner Sanctions Report */}
        {activeTab === 'examinerReport' && (
          <div style={{ marginTop: '10px' }}>
            <HodExaminerSanctionsReport user={user} />
          </div>
        )}
      </div>

      {/* Modals */}
      <BookingModal 
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedHall={preselectedHall}
        preselectedDate={preselectedDate}
        onSuccess={() => {
          setRefreshKey(k => k + 1);
          setActiveTab('halls');
        }}
      />

      <HospitalityModal 
        isOpen={hospitalityModalOpen}
        onClose={() => setHospitalityModalOpen(false)}
        onSuccess={() => {
          setRefreshKey(k => k + 1);
          setActiveTab('examiners');
        }}
      />

      <StationaryRequisitionModal 
        isOpen={stationaryModalOpen}
        onClose={() => setStationaryModalOpen(false)}
        onSuccess={() => {
          setRefreshKey(k => k + 1);
          setActiveTab('stationary');
        }}
      />

      <BookingPassModal 
        isOpen={Boolean(viewingBookingPass)}
        onClose={() => setViewingBookingPass(null)}
        booking={viewingBookingPass}
      />

      <SanctionOrderModal 
        isOpen={Boolean(viewingSanctionOrder)}
        onClose={() => setViewingSanctionOrder(null)}
        request={viewingSanctionOrder}
      />

      <StationaryVoucherModal 
        isOpen={Boolean(viewingStationaryVoucher)}
        onClose={() => setViewingStationaryVoucher(null)}
        request={viewingStationaryVoucher}
      />

      {/* Department Cancellation Modal */}
      {cancellingBooking && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ background: '#fee2e2', padding: '16px 20px', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#ef4444', color: '#ffffff', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ban size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#991b1b' }}>
                    Cancel Seminar Hall Booking
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: '#b91c1c' }}>
                    Department Cancellation Request
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setCancellingBooking(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontSize: '1.2rem', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '14px' }}>
                Are you sure you want to cancel the booking requisition for <strong>"{cancellingBooking.eventName}"</strong>?
              </p>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: '4px' }}>
                  <strong style={{ color: '#475569' }}>Hall:</strong> <span style={{ fontWeight: 700, color: '#0f172a' }}>{cancellingBooking.hallName}</span>
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong style={{ color: '#475569' }}>Reservation Date(s):</strong> <span style={{ fontWeight: 700, color: '#1e40af' }}>
                    {(cancellingBooking.isMultiDay || (cancellingBooking.fromDate && cancellingBooking.toDate && cancellingBooking.fromDate !== cancellingBooking.toDate))
                      ? `${cancellingBooking.fromDate} to ${cancellingBooking.toDate}`
                      : (cancellingBooking.fromDate || cancellingBooking.date)}
                  </span>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Slot:</strong> <span>{cancellingBooking.slot === 'FN' ? 'Forenoon (09:30 AM - 12:30 PM)' : cancellingBooking.slot === 'AN' ? 'Afternoon (01:30 PM - 04:30 PM)' : 'Full Day'}</span>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Reason for Cancellation (optional):
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g., Guest speaker rescheduled, event postponed, alternative department arrangement..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCancellingBooking(null)}
                  disabled={cancelLoading}
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmCancel}
                  disabled={cancelLoading}
                  style={{ background: '#dc2626', fontWeight: 800 }}
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
