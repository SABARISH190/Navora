export const connectSocket = (onMessage, onConnect, onDisconnect) => {
  let socket = null;
  let retryTimer = null;
  let retryCount = 0;
  const maxRetries = 5;

  const connect = () => {
    if (socket && socket.readyState !== WebSocket.CLOSED) return;

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
    const WS_URL = API_URL.replace("https", "wss").replace("http", "ws") + "/ws";
    
    console.log("Attempting WebSocket connection to:", WS_URL);
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("WebSocket Connected");
      retryCount = 0;
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
      
      if (retryCount < maxRetries) {
        retryCount++;
        retryTimer = setTimeout(connect, 3000);
      } else {
        console.log("Max WebSocket retries reached. Switching to polling mode.");
        // Fallback to polling if WebSocket fails consistently
        startPolling(onMessage);
      }
    };
    
    socket.onerror = (err) => {
      console.error("WebSocket Error:", err);
      socket.close();
    };
  };

  // Fallback polling mechanism
  let pollingInterval = null;
  const startPolling = (onMessage) => {
    if (pollingInterval) return;
    
    console.log("Starting fallback polling mode");
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
    
    const poll = async () => {
      try {
        const response = await fetch(`${API_URL}/state`);
        const data = await response.json();
        if (data.data && onMessage) {
          onMessage({ type: "state_update", data: data.data, timestamp: Date.now() / 1000 });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    poll(); // Initial poll
    pollingInterval = setInterval(poll, 5000); // Poll every 5 seconds
  };

  connect();

  return {
    close: () => {
      if (retryTimer) clearTimeout(retryTimer);
      if (pollingInterval) clearInterval(pollingInterval);
      if (socket) {
        socket.onclose = null; // Prevent reconnect
        socket.close();
      }
    }
  };
};
