import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { getState, getDecision, switchMode } from '../services/api';
import { connectSocket } from '../services/socket';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Core state
  const [zones, setZones] = useState([]);
  const [history, setHistory] = useState([]);
  const [decision, setDecision] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [mode, setMode] = useState(() => localStorage.getItem("navoraMode") || "simulation");
  const [predictions, setPredictions] = useState([]);

  // Phase B: Offline + Role state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [role, setRole] = useState(() => localStorage.getItem("navoraRole") || "organizer");
  const [syncPending, setSyncPending] = useState(false);
  const actionQueueRef = useRef([]);

  // --- OFFLINE ENGINE ---

  // Track browser online/offline status
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Persist state to localStorage on every zone update
  useEffect(() => {
    if (zones.length > 0) {
      localStorage.setItem("navora_state", JSON.stringify(zones));
    }
  }, [zones]);

  // Persist decision
  useEffect(() => {
    if (decision) {
      localStorage.setItem("navora_decision", JSON.stringify(decision));
    }
  }, [decision]);

  // Persist predictions
  useEffect(() => {
    if (predictions.length > 0) {
      localStorage.setItem("navora_predictions", JSON.stringify(predictions));
    }
  }, [predictions]);

  // Persist role
  useEffect(() => {
    localStorage.setItem("navoraRole", role);
  }, [role]);

  // --- ACTION QUEUE (offline-safe mutations) ---

  const queueAction = useCallback((action) => {
    actionQueueRef.current.push(action);
    localStorage.setItem("navora_actions", JSON.stringify(actionQueueRef.current));
    setSyncPending(true);
  }, []);

  const flushQueue = useCallback(async () => {
    const queue = actionQueueRef.current;
    if (queue.length === 0) return;

    const { default: axios } = await import('axios');
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001";
    // Remove trailing slash to avoid double slashes
    const baseUrl = API_BASE.replace(/\/$/, '');

    for (const action of queue) {
      try {
        await axios.post(`${baseUrl}${action.endpoint}`, action.payload);
      } catch (err) {
        console.error("Sync failed for action:", action, err);
        return; // Stop on first failure, retry later
      }
    }

    actionQueueRef.current = [];
    localStorage.removeItem("navora_actions");
    setSyncPending(false);
  }, []);

  // Sync queue when we come back online
  useEffect(() => {
    if (isOnline && isConnected) {
      flushQueue();
    }
  }, [isOnline, isConnected, flushQueue]);

  // --- INITIALIZATION ---

  useEffect(() => {
    // Load cached state as immediate fallback
    const cachedZones = localStorage.getItem("navora_state");
    const cachedDecision = localStorage.getItem("navora_decision");
    const cachedPredictions = localStorage.getItem("navora_predictions");
    const cachedActions = localStorage.getItem("navora_actions");

    if (cachedZones) {
      try { setZones(JSON.parse(cachedZones)); } catch(e) {}
    }
    if (cachedDecision) {
      try { setDecision(JSON.parse(cachedDecision)); } catch(e) {}
    }
    if (cachedPredictions) {
      try { setPredictions(JSON.parse(cachedPredictions)); } catch(e) {}
    }
    if (cachedActions) {
      try {
        actionQueueRef.current = JSON.parse(cachedActions);
        if (actionQueueRef.current.length > 0) setSyncPending(true);
      } catch(e) {}
    }

    // Mode persistence synchronization
    const savedMode = localStorage.getItem("navoraMode");
    if (savedMode && savedMode !== "simulation") {
      switchMode(savedMode).catch(err => console.error("Mode persistence sync failed:", err));
    }

    // Live fetch (overrides cache if backend is up)
    getState().then(res => {
      if(res.data && res.data.data) {
        setZones(Object.values(res.data.data));
        setHistory([{ timestamp: Date.now() / 1000, zones: res.data.data }]);
      }
    }).catch(err => console.error("Initial fetch failed:", err));

    // Kick off AI Decision Engine autonomously
    const aiPoller = setInterval(() => {
      getDecision().catch(err => console.error("AI polling failed", err));
    }, 15000);

    // Connect WebSocket
    const socket = connectSocket(
      (msg) => {
        if (msg.type === "state_update") {
          setZones(Object.values(msg.data));
          setHistory(prev => {
            const newHist = [...prev, { timestamp: msg.timestamp || (Date.now() / 1000), zones: msg.data }];
            return newHist.slice(-50);
          });
        } else if (msg.type === "ai_decision") {
          setDecision({ ...msg.data, timestamp: Date.now() });
        } else if (msg.type === "mode_update") {
          setMode(msg.mode);
          localStorage.setItem("navoraMode", msg.mode);
        } else if (msg.type === "prediction") {
          setPredictions(msg.data || []);
        }
      },
      () => setIsConnected(true),
      () => setIsConnected(false)
    );

    return () => {
      socket.close();
      clearInterval(aiPoller);
    };
  }, []);

  return (
    <AppContext.Provider value={{
      zones, history, decision, mode, isConnected, predictions,
      isOnline, role, setRole, syncPending, queueAction, setMode
    }}>
      {children}
    </AppContext.Provider>
  );
};
