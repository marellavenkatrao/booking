import React, { useState, useEffect } from 'react';
import { reportApi, hallApi } from '../services/api';
import { 
  Building2, 
  Calendar, 
  Users, 
  Clock, 
  Printer, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Layers,
  FileText
} from 'lucide-react';
import { 
  exportToCSV, 
  getCurrentMonthRange, 
  getLast30DaysRange, 
  getNext30DaysRange, 
  getCurrentSemesterRange 
} from '../utils/reportUtils';

export default function HodHallUsageReport({ user }) {
  const defaultDates = getCurrentMonthRange();
  const [fromDate, setFromDate] = useState(defaultDates.fromDate);
  const [toDate, setToDate] = useState(defaultDates.toDate);
  const [selectedHall, setSelectedHall] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [halls, setHalls] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    hallApi.getHalls()
      .then(res => setHalls(res.data.halls || []))
      .catch(err => console.error('Failed to load halls', err));
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getHodHallUsage({
        fromDate,
        toDate,
        hallId: selectedHall,
        status
      });
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to load HOD hall usage report', err);
      alert('Error fetching hall usage report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [fromDate, toDate, selectedHall, status]);

  const handlePreset = (type) => {
    let range;
    if (type === 'month') range = getCurrentMonthRange();
    else if (type === 'last30') range = getLast30DaysRange();
    else if (type === 'next30') range = getNext30DaysRange();
    else if (type === 'semester') range = getCurrentSemesterRange();
    
    if (range) {
      setFromDate(range.fromDate);
      setToDate(range.toDate);
    }
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.bookings || !reportData.bookings.length) {
      alert('No hall booking records to export.');
      return;
    }
    const rows = reportData.bookings.map(b => ({
      'Booking Ref': b.bookingId,
      'Date': b.date,
      'Slot': b.slot,
      'Seminar Hall': b.hallName,
      'Event Title': b.eventName,
      'Event Type': b.eventType,
      'Expected Audience': b.expectedAudience,
      'Status': b.status,
      'Official Pass Number': b.passNumber || 'N/A',
      'Timings': `${b.startTime} - ${b.endTime}`,
      'Coordinator Remarks': b.coordinatorRemarks || ''
    }));
    exportToCSV(rows, `NEC_HOD_Hall_Usage_Report_${fromDate}_to_${toDate}`);
  };

  const summary = reportData?.summary || {
    totalBookings: 0,
    approvedPasses: 0,
    pendingBookings: 0,
    rejectedBookings: 0,
    totalAudience: 0,
    totalHours: 0,
    hallsUtilizedCount: 0
  };

  const hallStats = reportData?.hallStats || [];
  const bookings = reportData?.bookings || [];

  return (
    <div className="report-container">
      {/* Printable Header */}
      <div className="print-only official-print-header" style={{ display: 'none', marginBottom: '20px', borderBottom: '2px solid #701a75', paddingBottom: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#701a75', textTransform: 'uppercase' }}>
            Narasaraopeta Engineering College (Autonomous)
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#334155' }}>
            Department of {user?.department || 'Engineering'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
            Accredited by NAAC with 'A+' Grade | Approved by AICTE | Permanently Affiliated to JNTUK
          </div>
          <div style={{ margin: '12px 0 6px', padding: '6px', background: '#f5f3ff', border: '1px solid #ddd6fe', fontWeight: 800, fontSize: '1.05rem', color: '#5b21b6' }}>
            SEMINAR HALL RESERVATION & UTILIZATION REPORT
          </div>
          <div style={{ fontSize: '0.82rem', color: '#475569' }}>
            <strong>Period:</strong> {fromDate} to {toDate} &nbsp;|&nbsp; 
            <strong>HOD:</strong> {user?.name} &nbsp;|&nbsp;
            <strong>Department:</strong> {user?.department}
          </div>
        </div>
      </div>

      {/* Screen Filter Bar */}
      <div className="no-print" style={{ 
        background: '#ffffff', 
        borderRadius: '16px', 
        padding: '24px', 
        border: '1px solid var(--border-color)', 
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800 }}>
              <Building2 size={14} />
              DEPARTMENT USAGE REPORT
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
              Seminar Hall Usage & Utilization Report
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
              Detailed usage record of different campus seminar halls (Block-2, Block-3, Block-4) by {user?.department} in specified dates.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={fetchReport}
              disabled={loading}
              title="Refresh report"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleExportCSV}
              title="Export report to CSV"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            <button 
              className="btn btn-primary btn-sm"
              onClick={() => window.print()}
              title="Print official report"
            >
              <Printer size={15} />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Quick Presets:</span>
            <button 
              type="button" 
              className="btn btn-sm btn-secondary"
              onClick={() => handlePreset('month')}
              style={{ padding: '3px 10px', fontSize: '0.75rem' }}
            >
              This Month
            </button>
            <button 
              type="button" 
              className="btn btn-sm btn-secondary"
              onClick={() => handlePreset('last30')}
              style={{ padding: '3px 10px', fontSize: '0.75rem' }}
            >
              Last 30 Days
            </button>
            <button 
              type="button" 
              className="btn btn-sm btn-secondary"
              onClick={() => handlePreset('next30')}
              style={{ padding: '3px 10px', fontSize: '0.75rem' }}
            >
              Next 30 Days
            </button>
            <button 
              type="button" 
              className="btn btn-sm btn-secondary"
              onClick={() => handlePreset('semester')}
              style={{ padding: '3px 10px', fontSize: '0.75rem' }}
            >
              Current Semester
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                From Date
              </label>
              <input 
                type="date"
                className="form-input"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                To Date
              </label>
              <input 
                type="date"
                className="form-input"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Seminar Hall
              </label>
              <select 
                className="form-input"
                value={selectedHall}
                onChange={(e) => setSelectedHall(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Seminar Halls</option>
                {halls.map(h => (
                  <option key={h._id} value={h._id}>{h.name} ({h.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Pass Status
              </label>
              <select 
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved / Confirmed</option>
                <option value="PENDING">Pending Coordinator Review</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fdf2f8', color: '#701a75' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>DEPARTMENT RESERVATIONS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{summary.totalBookings}</div>
            <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600 }}>{summary.approvedPasses} Approved Passes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>ACADEMIC HOURS USED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8' }}>{summary.totalHours} <span style={{ fontSize: '0.9rem' }}>Hours</span></div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Events & Workshops</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#15803d' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>STUDENT & FACULTY REACH</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>{summary.totalAudience.toLocaleString()}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Attendees accommodated</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>SEMINAR HALLS UTILIZED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309' }}>{summary.hallsUtilizedCount}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Across campus blocks</div>
          </div>
        </div>
      </div>

      {/* HALL-WISE USAGE COMPARISON */}
      <div className="nec-card" style={{ marginBottom: '24px' }}>
        <div className="nec-card-header">
          <div>
            <h3 className="card-title">
              <Layers size={20} color="#701a75" />
              <span>Usage Across Different Seminar Halls</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Distribution of your department's bookings between Block-2, Block-3, and Block-4 Seminar Halls
            </p>
          </div>
        </div>

        {hallStats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
            <p>No hall reservations found for the selected period.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {hallStats.map(h => (
              <div 
                key={h.hallName}
                style={{ 
                  background: '#f8fafc', 
                  border: '1.5px solid #e2e8f0', 
                  borderRadius: '12px', 
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#701a75', background: '#fae8ff', padding: '2px 8px', borderRadius: '4px' }}>
                      {h.hallCode || 'HALL'}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803d' }}>
                      {h.sharePercentage}% of your bookings
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    {h.hallName}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    Seating Capacity: {h.capacity} seats
                  </div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                    <div style={{ background: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>EVENTS</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{h.totalBookings}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>APPROVED</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d' }}>{h.approvedCount}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>HOURS</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1d4ed8' }}>{h.totalHours}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAILED RESERVATION TABLE */}
      <div className="nec-card">
        <div className="nec-card-header">
          <div>
            <h3 className="card-title">
              <Calendar size={20} color="#701a75" />
              <span>Itemized Seminar Hall Reservations ({bookings.length} Records)</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Full chronological log of bookings submitted by your department
            </p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
            <p>No bookings matching the filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="nec-table">
              <thead>
                <tr>
                  <th>Date & Slot</th>
                  <th>Seminar Hall</th>
                  <th>Event Name & Type</th>
                  <th>Booking Ref</th>
                  <th>Audience</th>
                  <th>Pass Number</th>
                  <th>Status</th>
                  <th>Coordinator Remarks</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td>
                      <div>
                        {(b.isMultiDay || (b.fromDate && b.toDate && b.fromDate !== b.toDate)) ? (
                          <div>
                            <div style={{ fontWeight: 800, color: '#1e293b' }}>
                              {b.fromDate} to {b.toDate}
                            </div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6d28d9', background: '#ede9fe', padding: '1px 6px', borderRadius: '4px' }}>
                              Multi-Day
                            </span>
                          </div>
                        ) : (
                          <div style={{ fontWeight: 800, color: '#1e293b' }}>{b.fromDate || b.date}</div>
                        )}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#701a75', fontWeight: 700 }}>
                        {b.slot === 'FN' ? 'Forenoon (FN)' : b.slot === 'AN' ? 'Afternoon (AN)' : 'Full Day'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      {b.hallName}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{b.eventName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{b.eventType}</div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        {b.bookingId}
                      </code>
                    </td>
                    <td>{b.expectedAudience}</td>
                    <td>
                      {b.passNumber ? (
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} />
                          {b.passNumber}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${b.status?.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#475569', maxWidth: '200px' }}>
                      {b.coordinatorRemarks || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print Signature Block */}
      <div className="print-only" style={{ display: 'none', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '45px' }}></div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', borderTop: '1px dashed #475569', paddingTop: '4px', minWidth: '180px' }}>
              Department Coordinator
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '45px' }}></div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#701a75', borderTop: '1px dashed #475569', paddingTop: '4px', minWidth: '220px' }}>
              {user?.name}
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Head of Department ({user?.department})</div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '45px' }}></div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', borderTop: '1px dashed #475569', paddingTop: '4px', minWidth: '180px' }}>
              Principal
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>NEC Autonomous</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
