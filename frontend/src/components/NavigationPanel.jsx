import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:8001";

export default function NavigationPanel({ zones }) {
  const [navData, setNavData] = useState([]);

  useEffect(() => {
    if (!zones || zones.length === 0) return;

    const fetchNav = async () => {
      try {
        const res = await axios.get(`${API_BASE}/intelligence`);
        if (res.data && res.data.data) {
          setNavData(res.data.data.navigation || []);
        }
      } catch (err) {
        console.error("Navigation fetch failed:", err);
      }
    };

    fetchNav();
    const interval = setInterval(fetchNav, 10000);
    return () => clearInterval(interval);
  }, [zones]);

  if (navData.length === 0) return null;

  return (
    <section style={{
      background: 'var(--surface)',
      borderLeft: '5px solid var(--secondary)',
      padding: '1.25rem 1.5rem',
      borderRadius: 'var(--radius)',
      animation: 'fadeIn 0.4s ease-out',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    }}>
      <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
        <span>🧭</span> Navigation Recommendations
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
        {navData.map((nav) => (
          <div key={nav.from} style={{
            background: 'rgba(255,255,255,0.4)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <span style={{ fontSize: '1.4rem' }}>
              {nav.from === nav.to ? '✅' : '➡️'}
            </span>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>{nav.from}</strong>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {nav.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
