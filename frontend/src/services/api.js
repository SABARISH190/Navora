import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8001"
});

export const getState = () => API.get("/state");
export const getDecision = () => API.get("/decision");
export const triggerEvent = (zone) => API.post(`/event/${zone}`);
export const switchMode = (mode) => API.post("/mode", { mode });

export const postGateEntry = (zone, count) => API.post("/gate-entry", { zone, count });
export const postBluetoothUpdate = (zone, count) => API.post("/bluetooth-update", { zone, count });
export const postZoneAdjust = (zone, count) => API.post("/zone-adjust", { zone, count });
