export const connectSocket = (onMessage, onConnect, onDisconnect) => {
  let pollingInterval = null;
  
  // Use polling by default for better compatibility with Render.com
  const startPolling = (onMessage) => {
    if (pollingInterval) return;
    
    console.log("Starting polling mode for real-time updates");
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
    
    const poll = async () => {
      try {
        // Remove trailing slash and add /state
        const baseUrl = API_URL.replace(/\/$/, '');
        const response = await fetch(`${baseUrl}/state`);
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
    
    // Simulate connection callback
    if (onConnect) onConnect();
  };

  startPolling(onMessage);

  return {
    close: () => {
      if (pollingInterval) clearInterval(pollingInterval);
    }
  };
};
