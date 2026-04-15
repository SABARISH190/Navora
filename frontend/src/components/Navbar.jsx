import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { switchMode } from '../services/api';
import navoraLogo from '../assets/navora-logo.png';

export default function Navbar({ isConnected }) {
  const { mode, isOnline, role, setRole, syncPending } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const handleModeSwitch = async (newMode) => {
    if (newMode === mode || loading || !isOnline) return;
    setLoading(true);
    try {
      await switchMode(newMode);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const badgeColor = mode === 'simulation' ? 'var(--medium)' : 'var(--low)';

  // Connection status logic
  let statusDot, statusText;
  if (!isOnline) {
    statusDot = 'var(--high)';
    statusText = '⚠️ Offline';
  } else if (!isConnected) {
    statusDot = 'var(--medium)';
    statusText = 'Reconnecting...';
  } else {
    statusDot = 'var(--low)';
    statusText = syncPending ? '🔄 Syncing...' : 'Live Data';
  }

  return (
    <nav className="nav-container" style={{
      background: 'var(--primary)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      flexWrap: 'wrap',
      gap: '0.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src={navoraLogo} alt="Navora Logo" height="36" />
        <h1 className="nav-title" style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '1px' }}>Navora</h1>
        <span key={mode} style={{
          background: badgeColor,
          padding: '0.3rem 0.7rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          color: 'white',
          animation: 'fadeIn 0.3s ease'
        }}>
          {mode === 'simulation' ? '🧪 Simulation' : '⚡ Real-Time'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Role Toggle */}
        <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', padding: '2px' }}>
          <button
            onClick={() => setRole("user")}
            style={{
              background: role === 'user' ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: 'white',
              border: 'none',
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: role === 'user' ? 'bold' : 'normal',
            }}
          >👤 User</button>
          <button
            onClick={() => setRole("organizer")}
            style={{
              background: role === 'organizer' ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: 'white',
              border: 'none',
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: role === 'organizer' ? 'bold' : 'normal',
            }}
          >🧑‍💼 Organizer</button>
        </div>

        {/* Mode Buttons */}
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={() => handleModeSwitch("simulation")}
            disabled={loading || !isOnline}
            title="Demo Mode"
            style={{
              background: mode === 'simulation' ? 'var(--accent)' : 'transparent',
              color: 'white',
              border: '1px solid var(--accent)',
              padding: '0.3rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              opacity: (loading || !isOnline) ? 0.5 : 1,
              fontWeight: mode === 'simulation' ? 'bold' : 'normal',
            }}
          >Simulation</button>
          <button
            onClick={() => handleModeSwitch("realtime")}
            disabled={loading || !isOnline}
            title="Live Input Mode"
            style={{
              background: mode === 'realtime' ? 'var(--accent)' : 'transparent',
              color: 'white',
              border: '1px solid var(--accent)',
              padding: '0.3rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              opacity: (loading || !isOnline) ? 0.5 : 1,
              fontWeight: mode === 'realtime' ? 'bold' : 'normal',
            }}
          >Real-Time</button>
        </div>

        {/* Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{
            display: 'inline-block',
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            backgroundColor: statusDot,
            boxShadow: `0 0 6px ${statusDot}`,
            transition: 'background-color 0.3s ease',
          }}></span>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{statusText}</span>
        </div>
      </div>
    </nav>
  )
}
