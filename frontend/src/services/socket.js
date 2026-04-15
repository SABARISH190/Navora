export const connectSocket = (onMessage, onConnect, onDisconnect) => {
  let socket = null;
  let retryTimer = null;

  const connect = () => {
    if (socket && socket.readyState !== WebSocket.CLOSED) return;

    socket = new WebSocket("ws://localhost:8001/ws");

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
