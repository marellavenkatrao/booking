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
  Filter, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Award
} from 'lucide-react';
import { 
  exportToCSV, 
  getCurrentMonthRange, 
  getLast30DaysRange, 
  getNext30DaysRange, 
  getCurrentSemesterRange 
} from '../utils/reportUtils';

export default function CoordinatorUsageReport({ user }) {
  const defaultDates = getCurrentMonthRange();
  const [fromDate, setFromDate] = useState(defaultDates.fromDate);
  const [toDate, setToDate] = useState(defaultDates.toDate);
  const [status, setStatus] = useState('ALL');
  const [selectedHall, setSelectedHall] = useState(user?.assignedHall?._id || 'ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [halls, setHalls] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  // Load available halls
  useEffect(() => {
    hallApi.getHalls()
      .then(res => setHalls(res.data.halls || []))
      .catch(err => console.error('Failed to load halls', err));
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getCoordinatorUsage({
        fromDate,
        toDate,
        hallId: selectedHall,
        status,
        department: selectedDept
      });
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to load coordinator usage report', err);
      alert('Error fetching department usage report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [fromDate, toDate, status, selectedHall, selectedDept]);

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
      alert('No booking records to export.');
      return;
    }
    const rows = reportData.bookings.map(b => ({
      'Booking Ref': b.bookingId,
      'Date': b.date,
      'Slot': b.slot,
      'Timings': `${b.startTime} - ${b.endTime}`,
      'Department': b.department,
      'HOD Name': b.hodName,
      'Hall Name': b.hallName,
      'Event Title': b.eventName,
      'Event Type': b.eventType,
      'Expected Audience': b.expectedAudience,
      'Status': b.status,
      'Pass Number': b.passNumber || 'N/A',
      'Coordinator Remarks': b.coordinatorRemarks || ''
    }));
    exportToCSV(rows, `NEC_SeminarHall_Department_Usage_Report_${fromDate}_to_${toDate}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const summary = reportData?.summary || {
    totalBookings: 0,
    totalApproved: 0,
    totalPending: 0,
    totalRejected: 0,
    totalAudience: 0,
    totalHours: 0,
    departmentsCount: 0,
    mostActiveDepartment: '—'
  };

  const deptStats = reportData?.departmentStats || [];
  const bookings = reportData?.bookings || [];

  return (
    <div className="report-container">
      {/* Printable Letterhead (visible only during print) */}
      <div className="print-only official-print-header" style={{ display: 'none', marginBottom: '20px', borderBottom: '2px solid #701a75', paddingBottom: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#701a75', textTransform: 'uppercase' }}>
            Narasaraopeta Engineering College (Autonomous)
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#334155' }}>
            Kotappakonda Road, Yellamanda (P.O), Narasaraopet, Palnadu Dist., A.P. - 522601
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
            Approved by AICTE, Permanently Affiliated to JNTUK, Accredited by NAAC with 'A+' Grade
          </div>
          <div style={{ margin: '12px 0 6px', padding: '6px', background: '#fdf2f8', border: '1px solid #fbcfe8', fontWeight: 800, fontSize: '1.1rem', color: '#831843' }}>
            SEMINAR HALL USAGE BY DEPARTMENTS REPORT
          </div>
          <div style={{ fontSize: '0.82rem', color: '#475569' }}>
            <strong>Reporting Period:</strong> {fromDate} to {toDate} &nbsp;|&nbsp; 
            <strong>Hall:</strong> {reportData?.targetHall?.name || (selectedHall === 'ALL' ? 'All Seminar Halls' : 'Designated Hall')} &nbsp;|&nbsp;
            <strong>Generated On:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Screen Report Header */}
      <div className="no-print" style={{ 
        background: '#ffffff', 
        borderRadius: '16px', 
        padding: '24px', 
        border: '1px solid var(--border-color)', 
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fae8ff', color: '#701a75', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800 }}>
              <BarChart3 size={14} />
              COORDINATOR ANALYTICS CONSOLE
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
              Department-Wise Seminar Hall Usage Report
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
              Comprehensive utilization audit showing reservation hours, audience attendance, and slot allocations across academic departments.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={fetchReport}
              disabled={loading}
              title="Refresh report data"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleExportCSV}
              title="Export report to CSV file"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>

            <button 
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              title="Print official report"
            >
              <Printer size={15} />
              <span>Print Official Report</span>
            </button>
          </div>
        </div>

        {/* Date Filter & Preset Controls */}
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Quick Date Presets:</span>
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
                Approval Status
              </label>
              <select 
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved Only</option>
                <option value="PENDING">Pending Only</option>
                <option value="REJECTED">Rejected Only</option>
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
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TOTAL REQUISITIONS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{summary.totalBookings}</div>
            <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600 }}>{summary.totalApproved} Confirmed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TOTAL UTILIZATION</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8' }}>{summary.totalHours} <span style={{ fontSize: '0.9rem' }}>Hours</span></div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Across slots booked</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#15803d' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>STUDENT & FACULTY AUDIENCE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>{summary.totalAudience.toLocaleString()}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Participants hosted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>PARTICIPATING DEPARTMENTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309' }}>{summary.departmentsCount}</div>
            <div style={{ fontSize: '0.72rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
              Top: {summary.mostActiveDepartment}
            </div>
          </div>
        </div>
      </div>

      {/* DEPARTMENT USAGE VISUAL BARS & SUMMARY TABLE */}
      <div className="nec-card" style={{ marginBottom: '24px' }}>
        <div className="nec-card-header">
          <div>
            <h3 className="card-title">
              <BarChart3 size={20} color="#701a75" />
              <span>Department Usage Breakdown & Share ({deptStats.length} Departments)</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Relative hall reservation distribution for dates {fromDate} to {toDate}
            </p>
          </div>
        </div>

        {deptStats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
            <p>No department usage records found for selected period ({fromDate} to {toDate}).</p>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Try selecting a wider date range like "This Month" or "Current Semester".</p>
          </div>
        ) : (
          <div>
            {/* Visual proportional bars */}
            <div className="no-print" style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
                Hall Usage Share by Department (%)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {deptStats.map(d => (
                  <div key={d.department}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>{d.department}</span>
                      <span style={{ color: '#701a75', fontWeight: 800 }}>{d.totalBookings} Events ({d.sharePercentage}%)</span>
                    </div>
                    <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${Math.max(d.sharePercentage, 5)}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #701a75 0%, #a21caf 100%)', 
                          borderRadius: '9999px' 
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Summary Table */}
            <div className="table-responsive">
              <table className="nec-table">
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>Total Requests</th>
                    <th>Approved</th>
                    <th>Pending</th>
                    <th>Rejected</th>
                    <th>Slots Utilized</th>
                    <th>Total Hours</th>
                    <th>Audience</th>
                    <th>Usage Share</th>
                  </tr>
                </thead>
                <tbody>
                  {deptStats.map(d => (
                    <tr key={d.department}>
                      <td style={{ fontWeight: 800, color: '#0f172a' }}>{d.department}</td>
                      <td>
                        <span style={{ fontWeight: 800 }}>{d.totalBookings}</span>
                      </td>
                      <td>
                        <span style={{ color: '#15803d', fontWeight: 800 }}>{d.approvedCount}</span>
                      </td>
                      <td>
                        <span style={{ color: '#b45309', fontWeight: 700 }}>{d.pendingCount}</span>
                      </td>
                      <td>
                        <span style={{ color: '#b91c1c' }}>{d.rejectedCount}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        FN: {d.slots.FN || 0} • AN: {d.slots.AN || 0} • Full: {d.slots.FULL_DAY || 0}
                      </td>
                      <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{d.totalHours} hrs</td>
                      <td>{d.totalAudience.toLocaleString()}</td>
                      <td>
                        <span style={{ 
                          background: '#fae8ff', 
                          color: '#701a75', 
                          padding: '3px 8px', 
                          borderRadius: '9999px', 
                          fontWeight: 800, 
                          fontSize: '0.78rem' 
                        }}>
                          {d.sharePercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED BOOKINGS LOG */}
      <div className="nec-card">
        <div className="nec-card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 className="card-title">
              <Calendar size={20} color="#701a75" />
              <span>Itemized Reservation Log ({bookings.length} Bookings)</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Full chronological log of seminar hall reservations within selected date range
            </p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
            <p>No individual booking records found matching filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="nec-table">
              <thead>
                <tr>
                  <th>Date & Slot</th>
                  <th>Booking ID</th>
                  <th>Department & HOD</th>
                  <th>Hall</th>
                  <th>Event Name & Category</th>
                  <th>Audience</th>
                  <th>Status</th>
                  <th>Pass Number</th>
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
                            <div style={{ fontWeight: 800, color: '#1e3a8a' }}>
                              {b.fromDate} to {b.toDate}
                            </div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6d28d9', background: '#ede9fe', padding: '1px 6px', borderRadius: '4px' }}>
                              Multi-Day
                            </span>
                          </div>
                        ) : (
                          <div style={{ fontWeight: 800, color: '#1e3a8a' }}>{b.fromDate || b.date}</div>
                        )}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#701a75', fontWeight: 700 }}>
                        {b.slot === 'FN' ? 'Forenoon (FN)' : b.slot === 'AN' ? 'Afternoon (AN)' : 'Full Day'}
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        {b.bookingId}
                      </code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{b.department}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.hodName}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{b.hallName}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{b.eventName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{b.eventType}</div>
                    </td>
                    <td>{b.expectedAudience}</td>
                    <td>
                      <span className={`status-badge ${b.status?.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.passNumber ? (
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d' }}>
                          {b.passNumber}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
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

      {/* Official Printable Signatures Block (visible only in print) */}
      <div className="print-only" style={{ display: 'none', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '45px' }}></div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', borderTop: '1px dashed #475569', paddingTop: '4px', minWidth: '180px' }}>
              Prepared By / Assistant
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '45px' }}></div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#701a75', borderTop: '1px dashed #475569', paddingTop: '4px', minWidth: '220px' }}>
              {user?.name || 'Seminar Hall Coordinator'}
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Coordinator - {reportData?.targetHall?.name || 'Seminar Halls'}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '45px' }}></div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', borderTop: '1px dashed #475569', paddingTop: '4px', minWidth: '180px' }}>
              Principal / Dean
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>NEC Autonomous</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
