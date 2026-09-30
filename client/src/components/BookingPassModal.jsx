import React from 'react';
import { X, Printer, CheckCircle, MapPin, Calendar, Clock, Users, Building2, QrCode } from 'lucide-react';
import NecLogo from '../assets/NecLogo';

export default function BookingPassModal({ isOpen, onClose, booking }) {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="#701a75" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Seminar Hall Booking Pass</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} />
              Print Pass
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          <div className="official-slip">
            {/* Letterhead */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #701a75', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                <NecLogo showSubtext={false} />
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e3a8a', letterSpacing: '1px' }}>
                (AUTONOMOUS) • APPROVED BY AICTE • AFFILIATED TO JNTUK
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Kotappakonda Road, Yellamanda (P.O), Narasaraopet, Palnadu Dist., A.P. - 522601
              </div>
              <div style={{ 
                marginTop: '10px', 
                background: '#701a75', 
                color: '#ffffff', 
                padding: '4px 14px', 
                borderRadius: '4px',
                fontSize: '0.86rem', 
                fontWeight: 800,
                letterSpacing: '0.5px',
                display: 'inline-block'
              }}>
                OFFICIAL SEMINAR HALL RESERVATION SANCTION SLIP
              </div>
            </div>

            {/* Reference info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <strong>Official Pass No:</strong>{' '}
                <code style={{ background: '#fdf4ff', border: '1px solid #d946ef', color: '#701a75', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                  {booking.passNumber || booking.bookingId || 'NEC-SH-PASS'}
                </code>
              </div>
              <div>
                <strong>Dispatched to HOD:</strong> {booking.hodName} ({booking.department})
              </div>
              <div style={{ width: '100%', fontSize: '0.76rem', color: '#15803d', fontWeight: 600 }}>
                ✓ Transmitted directly to HOD login upon approval by Coordinator {booking.coordinator?.name || booking.coordinatorName}
              </div>
            </div>

            {/* Main Pass Data */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', marginBottom: '16px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 4px', color: '#64748b', width: '38%' }}>Seminar Hall Allotted:</td>
                  <td style={{ padding: '8px 4px', fontWeight: 800, color: '#701a75', fontSize: '0.98rem' }}>
                    {booking.hallName || booking.hall?.name}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 4px', color: '#64748b' }}>Event Title:</td>
                  <td style={{ padding: '8px 4px', fontWeight: 700, color: '#0f172a' }}>
                    {booking.eventName}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 4px', color: '#64748b' }}>Requisition Department:</td>
                  <td style={{ padding: '8px 4px', fontWeight: 600 }}>
                    {booking.department} (HOD: {booking.hodName})
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 4px', color: '#64748b' }}>Reservation Date & Slot:</td>
                  <td style={{ padding: '8px 4px', fontWeight: 700, color: '#1e3a8a' }}>
                    {(booking.isMultiDay || (booking.fromDate && booking.toDate && booking.fromDate !== booking.toDate))
                      ? `${booking.fromDate} to ${booking.toDate}`
                      : (booking.fromDate || booking.date)} ({booking.slot === 'FN' ? 'Forenoon 09:30 AM - 12:30 PM' : booking.slot === 'AN' ? 'Afternoon 01:30 PM - 04:30 PM' : 'Full Day 09:30 AM - 04:30 PM'})
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 4px', color: '#64748b' }}>Chief Guest / Speaker:</td>
                  <td style={{ padding: '8px 4px' }}>
                    {booking.chiefGuest || 'Internal Department Resource Person'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 4px', color: '#64748b' }}>Expected Attendees:</td>
                  <td style={{ padding: '8px 4px' }}>
                    {booking.expectedAudience} Students & Faculty
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 4px', color: '#64748b' }}>Coordinator Remarks:</td>
                  <td style={{ padding: '8px 4px', fontStyle: 'italic', color: booking.status === 'CANCELLED' ? '#dc2626' : '#15803d' }}>
                    {booking.status === 'CANCELLED' 
                      ? `Cancelled: ${booking.cancellationReason || 'Booking cancelled by Department'}` 
                      : `"${booking.coordinatorRemarks || 'Approved by Seminar Hall Coordinator.'}"`}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Stamp and Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '30px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}>
              <div>
                <div className="official-stamp" style={booking.status === 'CANCELLED' ? { color: '#dc2626', borderColor: '#dc2626' } : {}}>
                  {booking.status === 'CANCELLED' ? '✕ CANCELLED' : '✓ SANCTIONED & CONFIRMED'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                  System Verified • NEC Central Scheduler
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  {booking.coordinator?.name || booking.coordinatorName || 'Seminar Hall Coordinator'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Faculty In-Charge / Coordinator
                </div>
                <div style={{ fontSize: '0.72rem', color: '#701a75', fontWeight: 700 }}>
                  {booking.hallName || 'Seminar Hall'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer no-print">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            Print Official Pass
          </button>
        </div>
      </div>
    </div>
  );
}
