import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';
import ZoneCard from '../components/ZoneCard';
import ZoneChart from '../components/ZoneChart';
import AIPanel from '../components/AIPanel';
import AlertBanner from '../components/AlertBanner';
import ComparisonChart from '../components/ComparisonChart';
import PredictionPanel from '../components/PredictionPanel';
import NavigationPanel from '../components/NavigationPanel';
import Toast from '../components/Toast';

export default function Dashboard() {
  const { zones, decision, history, isConnected, predictions, role, isOnline } = useContext(AppContext);
  const alerts = zones.filter(z => {
    if (z.utilization <= 0.85) return false;
    if (history.length < 2) return false;
    const prevTick = history[history.length - 2];
    const prevZone = prevTick.zones[z.name];
    return prevZone && prevZone.utilization > 0.85;
  });

  // Critical zones: >90% utilization
  const criticalZones = zones.filter(z => z.utilization > 0.9);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar isConnected={isConnected} />
      
      <main className="main-container">
        <Toast decision={decision} alerts={alerts} />

        {/* Offline Banner */}
        {!isOnline && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(166,58,58,0.12), rgba(201,140,26,0.12))',
            border: '1px solid var(--high)',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'fadeIn 0.4s ease-out',
          }}>
            <span style={{ fontSize: '1.3rem' }}>📡</span>
            <div>
              <strong style={{ color: 'var(--high)', fontSize: '0.9rem' }}>Offline Mode Active</strong>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Showing cached data. Changes will sync when connection is restored.
              </p>
            </div>
          </div>
        )}

        {/* Critical Zone Alert */}
        {criticalZones.length > 0 && (
          <div style={{
            background: 'rgba(166,58,58,0.08)',
            border: '1px solid var(--high)',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.3s ease-out',
          }}>
            <span style={{ fontSize: '1.2rem' }}>🚨</span>
            <strong style={{ color: 'var(--high)', fontSize: '0.9rem' }}>
              Critical Zone{criticalZones.length > 1 ? 's' : ''}:{' '}
              {criticalZones.map(z => z.name).join(', ')}
            </strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
              Capacity near limit — immediate action required
            </span>
          </div>
        )}

        {/* AI Panel — visible to both roles */}
        <AIPanel decision={decision} />
        <AlertBanner alerts={alerts} />

        {/* Predictions — visible to both */}
        <PredictionPanel predictions={predictions} />

        {/* Navigation — user-focused (hidden for organizer) */}
        {role === 'user' && <NavigationPanel zones={zones} />}
        
        <section aria-label="Live Zone Metrics">
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)', marginTop: 0 }}>Live Zones Overview</h2>
        
        {zones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'fadeIn 1s ease-out' }}>📡</div>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', margin: 0 }}>Connecting to live crowd intelligence...</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem', opacity: 0.7 }}>Establishing WebSocket link to backend engine</p>
          </div>
        ) : (
          <div className="responsive-grid">
            {zones.map(zone => (
              <ZoneCard key={zone.name} data={zone} history={history} role={role} />
            ))}
          </div>
        )}
        </section>

        {zones.length > 0 && (
          <section aria-label="Ranking and Trajectory Context">
            <ComparisonChart zones={zones} />
            {/* Trajectory charts — organizer detail view */}
            {role === 'organizer' && (
              <div style={{ marginTop: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Trajectory Analytics</h2>
              <div className="chart-grid">
                {zones.map(zone => (
                  <ZoneChart key={`${zone.name}-chart`} zoneName={zone.name} history={history} />
                ))}
              </div>
            </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
