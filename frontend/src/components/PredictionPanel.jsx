import React from 'react';

export default function PredictionPanel({ predictions }) {
  if (!predictions || predictions.length === 0) {
    return (
      <section style={{
        background: 'var(--surface)',
        borderLeft: '5px solid var(--secondary)',
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius)',
        opacity: 0.7,
      }}>
        <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
          <span>🔮</span> Predictive Alerts
        </h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>All zones stable — no congestion predicted</p>
      </section>
    );
  }

  return (
    <section style={{
      background: 'var(--surface)',
      borderLeft: '5px solid var(--medium)',
      padding: '1.25rem 1.5rem',
      borderRadius: 'var(--radius)',
      animation: 'fadeIn 0.4s ease-out',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05), 0 0 12px rgba(201,140,26,0.15)',
    }}>
      <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
        <span>🔮</span> Predictive Alerts
        <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
          {predictions.length} active
        </span>
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {predictions.map((p, i) => {
          const isHigh = p.severity === 'high';
          const borderColor = isHigh ? 'var(--high)' : 'var(--medium)';
          const bgColor = isHigh ? 'rgba(166,58,58,0.08)' : 'rgba(201,140,26,0.08)';

          return (
            <div key={p.zone} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: bgColor,
              border: `1px solid ${borderColor}`,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              animation: 'fadeIn 0.4s ease-out',
              animationDelay: `${i * 0.1}s`,
            }}>
              <div>
                <strong style={{ color: borderColor, fontSize: '0.95rem' }}>
                  {isHigh ? '🔥' : '⚠️'} {p.zone}
                  <span style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    background: borderColor,
                    color: 'white',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    verticalAlign: 'middle',
                  }}>
                    {isHigh ? 'Critical' : 'Rising'}
                  </span>
                </strong>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {p.prediction}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: borderColor }}>
                  {p.utilization}% 🔺
                </div>
                {p.confidence && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem', textTransform: 'uppercase' }}>
                    {p.confidence} conf.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
