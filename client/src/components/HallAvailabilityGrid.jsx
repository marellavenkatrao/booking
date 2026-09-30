import React, { useState, useEffect } from 'react';
import { hallApi } from '../services/api';
import { Calendar as CalendarIcon, Clock, Users, CheckCircle, AlertCircle, XCircle, MapPin, Sparkles, PlusCircle } from 'lucide-react';

export default function HallAvailabilityGrid({ onSelectHallToBook, refreshTrigger }) {
  const todayStr = new Date().toLocaleDateString('en-CA');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [loading, setLoading] = useState(false);
  const [hallsData, setHallsData] = useState([]);
  const [error, setError] = useState('');

  const fetchAvailability = async (date) => {
    setLoading(true);
    setError('');
    try {
      const res = await hallApi.getAvailability(date);
      setHallsData(res.data.availability || []);
    } catch (err) {
      console.error('Failed to load availability', err);
      setError('Could not fetch hall availability. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate, refreshTrigger]);

  const setQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="nec-card" style={{ marginBottom: '28px' }}>
      <div className="nec-card-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 className="card-title">
            <CalendarIcon size={22} color="#701a75" />
            <span>Seminar Hall Availability Matrix</span>
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '3px' }}>
            Check real-time occupancy for Block-2, Block-3, and Block-4 halls on any target date before placing a reservation request.
          </p>
        </div>

        {/* Date Selector and quick filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => setQuickDate(0)} 
              className={`btn btn-sm ${selectedDate === todayStr ? 'btn-primary' : 'btn-secondary'}`}
            >
              Today
            </button>
            <button 
              onClick={() => setQuickDate(1)} 
              className="btn btn-secondary btn-sm"
            >
              Tomorrow
            </button>
            <button 
              onClick={() => setQuickDate(2)} 
              className="btn btn-secondary btn-sm"
            >
              Day After
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px' }}>
            <CalendarIcon size={16} color="#475569" />
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 700,
                color: '#0f172a',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #f3f3f3', borderTop: '3px solid #701a75', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '10px', fontWeight: 600 }}>Checking live reservation status...</p>
        </div>
      ) : (
        <div className="halls-grid">
          {hallsData.map((hall) => {
            const fnStatus = hall.slots?.FN?.status;
            const anStatus = hall.slots?.AN?.status;
            const fnBooking = hall.slots?.FN?.booking;
            const anBooking = hall.slots?.AN?.booking;

            return (
              <div key={hall.hallId} className="hall-card">
                <div className="hall-card-banner">
                  <div>
                    <span className="hall-card-badge">{hall.code}</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.3px', margin: 0 }}>
                      {hall.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', opacity: 0.9, marginTop: '4px' }}>
                      <Users size={14} />
                      <span>Capacity: <strong>{hall.capacity} Seats</strong></span>
                      <span>•</span>
                      <span>{hall.block}</span>
                    </div>
                  </div>
                </div>

                <div className="hall-card-body">
                  {/* Coordinator attribution */}
                  <div className="coordinator-chip">
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '8px', 
                      background: '#fae8ff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#701a75',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      B{hall.code.replace('BLOCK-', '')}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        Designated Coordinator
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                        {hall.coordinatorName}
                      </div>
                    </div>
                  </div>

                  {/* Facilities list */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Facilities & Audio-Visual
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {hall.facilities?.slice(0, 4).map((f, i) => (
                        <span key={i} className="facility-pill">{f}</span>
                      ))}
                    </div>
                  </div>

                  {/* Slot status bars for selected date */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Schedule for {selectedDate}:</span>
                    </div>

                    <div className="availability-bar">
                      {/* Forenoon Slot */}
                      <div className={`slot-indicator ${fnStatus === 'AVAILABLE' ? 'free' : fnStatus === 'BOOKED' ? 'booked' : 'pending'}`}>
                        <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>FN (9:30-12:30)</div>
                        <div style={{ fontWeight: 800, marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                          {fnStatus === 'AVAILABLE' && <CheckCircle size={12} />}
                          {fnStatus === 'BOOKED' && <XCircle size={12} />}
                          {fnStatus === 'PENDING_APPROVAL' && <AlertCircle size={12} />}
                          {fnStatus === 'AVAILABLE' ? 'AVAILABLE' : fnStatus === 'BOOKED' ? 'BOOKED' : 'PENDING'}
                        </div>
                        {fnBooking && (
                          <div style={{ fontSize: '0.68rem', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={fnBooking.eventName}>
                            {fnBooking.department}
                          </div>
                        )}
                      </div>

                      {/* Afternoon Slot */}
                      <div className={`slot-indicator ${anStatus === 'AVAILABLE' ? 'free' : anStatus === 'BOOKED' ? 'booked' : 'pending'}`}>
                        <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>AN (1:30-4:30)</div>
                        <div style={{ fontWeight: 800, marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                          {anStatus === 'AVAILABLE' && <CheckCircle size={12} />}
                          {anStatus === 'BOOKED' && <XCircle size={12} />}
                          {anStatus === 'PENDING_APPROVAL' && <AlertCircle size={12} />}
                          {anStatus === 'AVAILABLE' ? 'AVAILABLE' : anStatus === 'BOOKED' ? 'BOOKED' : 'PENDING'}
                        </div>
                        {anBooking && (
                          <div style={{ fontSize: '0.68rem', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={anBooking.eventName}>
                            {anBooking.department}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Booking Action */}
                  <button
                    onClick={() => onSelectHallToBook && onSelectHallToBook(hall, selectedDate)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '10px' }}
                  >
                    <PlusCircle size={16} />
                    <span>Request Booking for {hall.code}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
