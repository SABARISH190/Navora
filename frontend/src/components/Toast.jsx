import React, { useState, useEffect, useRef } from 'react';

export default function Toast({ decision, alerts }) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const prevDecisionRef = useRef(null);
  const prevAlertsRef = useRef(0);

  useEffect(() => {
    // New AI Decision Check
    if (decision && decision !== prevDecisionRef.current) {
      setMessage("🧠 New AI Recommendation Generated");
      setShow(true);
      prevDecisionRef.current = decision;
    }
    // High Alert Check
    else if (alerts.length > prevAlertsRef.current) {
      setMessage("🚨 Critical Load Alert Triggered");
      setShow(true);
    }
    prevAlertsRef.current = alerts.length;

    let timer;
    if (show) {
       timer = setTimeout(() => setShow(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [decision, alerts, show]);

  if (!show) return null;

  return (
    <div role="alert" aria-live="assertive" style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      background: 'var(--primary)',
      color: 'white',
      padding: '1.25rem 1.5rem',
      borderRadius: 'var(--radius)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      zIndex: 9999,
      animation: 'slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      borderLeft: '4px solid var(--low)'
    }}>
      <strong style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem' }}>{message}</strong>
    </div>
  );
}
