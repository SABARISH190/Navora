import React from 'react';

export default function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <section aria-live="polite" aria-atomic="true" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {alerts.map((zone, index) => (
        <div key={zone.name} style={{
          background: 'rgba(166, 58, 58, 0.1)',
          border: '1px solid var(--high)',
          borderLeft: '5px solid var(--high)',
          color: 'var(--high)',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          fontWeight: 'bold',
          opacity: 0,
          animation: 'fadeIn 0.4s ease-out forwards',
          animationDelay: `${index * 0.15}s`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.25rem' }}>🚨</span>
          HIGH CROWD DETECTED AT {zone.name.toUpperCase()} ({(zone.utilization * 100).toFixed(0)}%)
        </div>
      ))}
    </section>
  );
}
