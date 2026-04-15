import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { postGateEntry, postZoneAdjust, postBluetoothUpdate } from '../services/api';
import StatusBadge from './StatusBadge';

export default function ZoneCard({ data, history, role }) {
  const { mode, isOnline, queueAction } = useContext(AppContext);
  const getStatus = (utilization) => {
    if (utilization < 0.4) return 'low';
    if (utilization < 0.75) return 'medium';
    return 'high';
  };

  const status = getStatus(data.utilization);

  let trend = null;
  if (history && history.length >= 2) {
    const current = data.utilization;
    const prevTick = history[history.length - 2];
    const prevZone = prevTick.zones[data.name];
    if (prevZone) {
      if (current > prevZone.utilization) trend = '🔺 Rising';
      else if (current < prevZone.utilization) trend = '🔻 Falling';
    }
  }

  // Offline-safe action handler
  const safeAction = (apiCall, endpoint, payload) => {
    if (isOnline) {
      apiCall().catch(console.error);
    } else {
      queueAction({ endpoint, payload });
    }
  };

  // Show controls only in realtime mode AND for organizer role
  const showControls = mode === 'realtime' && role === 'organizer';

  return (
    <section className="zone-card" aria-label={`Statistics for ${data.name}`} style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      padding: '1.5rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {data.name} 
          {data.utilization > 0.90 && <span style={{fontSize: '0.75rem', color: 'var(--high)', fontWeight: 'bold', marginLeft: '0.3rem', letterSpacing:'0.5px'}}>🔥 Peak Load</span>}
        </h2>
        <StatusBadge status={status} />
      </header>

      <div className="zone-card-stats">
        <div>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Crowd Density</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{Math.floor(data.crowd_density)} <span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>/ {data.capacity}</span></p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Queue Time</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{data.queue_time} min</p>
        </div>
      </div>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Utilization</p>
          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 'bold' }}>
            {Math.round(data.utilization * 100)}%
            {trend && <span style={{marginLeft: '0.4rem', fontSize: '0.75rem'}}>{trend}</span>}
          </p>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${Math.min(100, data.utilization * 100)}%`, 
            background: `var(--${status})`,
            transition: 'width 0.5s ease'
          }}></div>
        </div>
      </div>

      {showControls && (
        <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border, rgba(0,0,0,0.1))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Gate: {data.gate_count || 0}</span>
            <span>BT: {data.bluetooth_count || 0}</span>
            <span>Manual: {data.manual_adjustment > 0 ? `+${data.manual_adjustment}` : data.manual_adjustment || 0}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => safeAction(
                () => postGateEntry(data.name, 1),
                '/gate-entry', { zone: data.name, count: 1 }
              )}
              style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--accent)', background: 'transparent', color: 'var(--text)' }}>
              +1 Entry
            </button>
            <button 
              onClick={() => safeAction(
                () => postZoneAdjust(data.name, 5),
                '/zone-adjust', { zone: data.name, count: 5 }
              )}
              style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--accent)', background: 'transparent', color: 'var(--text)' }}>
              +5 Adjust
            </button>
            <button 
              onClick={() => {
                const count = Math.floor(Math.random() * 40) + 10;
                safeAction(
                  () => postBluetoothUpdate(data.name, count),
                  '/bluetooth-update', { zone: data.name, count }
                );
              }}
              style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--accent)', background: 'var(--accent)', color: 'white', fontWeight: 'bold' }}>
              Scan BT
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
