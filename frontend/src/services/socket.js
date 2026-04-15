export const connectSocket = (onMessage, onConnect, onDisconnect) => {
  let socket = null;
  let retryTimer = null;

  const connect = () => {
    if (socket && socket.readyState !== WebSocket.CLOSED) return;

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const wsUrl = API_URL.replace("http://", "ws://").replace("https://", "wss://");
    socket = new WebSocket(`${wsUrl}/ws`);

    socket.onopen = () => {
      console.log("WebSocket Connected");
      if (onConnect) onConnect();
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket Disconnected. Reconnecting in 3s...");
      if (onDisconnect) onDisconnect();
      retryTimer = setTimeout(connect, 3000);
    };
    
    socket.onerror = (err) => {
      console.error("WebSocket Error:", err);
      socket.close();
    };
  };

  connect();

  return {
    close: () => {
      if (retryTimer) clearTimeout(retryTimer);
      if (socket) {
        socket.onclose = null; // Prevent reconnect
        socket.close();
      }
    }
  };
};
