import React from 'react';

export default function AIPanel({ decision }) {
  if (!decision) {
    return (
      <section aria-live="polite" style={{
        background: 'var(--surface)',
        borderLeft: '5px solid var(--accent)',
        padding: '1.5rem',
        borderRadius: 'var(--radius)',
        opacity: 0.7,
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05), 0 0 12px rgba(217,130,43,0.1)',
      }}>
        <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
          <span>🧠</span> AI Decision Engine
        </h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Awaiting intelligent analysis…</p>
      </section>
    );
  }

  return (
    <section aria-live="polite" style={{
      background: 'var(--surface)',
      borderLeft: '5px solid var(--accent)',
      padding: '1.5rem',
      borderRadius: 'var(--radius)',
      animation: 'fadeIn 0.5s ease-out',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05), 0 0 12px rgba(217,130,43,0.2)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
          <span>🧠</span> AI Decision Analysis
        </h3>
        {decision.timestamp && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
            Last updated: {new Date(decision.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
          </span>
        )}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="ai-panel-grid">
          <div style={{ background: 'rgba(255,255,255,0.4)', padding: '1rem', borderRadius: '8px' }}>
            <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Recommended User Action</strong>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary)' }}>{decision.user_action}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.4)', padding: '1rem', borderRadius: '8px' }}>
            <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Organizer Intervention</strong>
            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary)' }}>{decision.organizer_action}</span>
          </div>
        </div>
        
        <div style={{ padding: '0 0.25rem' }}>
          <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Reasoning Context</strong>
          <span style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>{decision.reason}</span>
        </div>
        
        <div style={{ padding: '0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Model Confidence:</strong>
          <span style={{ 
            fontWeight: 'bold', 
            color: decision.confidence === 'high' ? 'var(--low)' : (decision.confidence === 'medium' ? 'var(--medium)' : 'var(--high)'),
            textTransform: 'uppercase',
            fontSize: '0.9rem'
          }}>
            {decision.confidence}
          </span>
        </div>
      </div>
    </section>
  );
}
