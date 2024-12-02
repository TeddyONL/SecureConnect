import { Socket, io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling']
});

export const connectSocket = (userId: string, role: string) => {
  socket.auth = { userId, role };
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export const subscribeToAdminEvents = (callbacks: {
  onNewBusiness?: (business: any) => void;
  onNewReport?: (report: any) => void;
  onUserActivity?: (activity: any) => void;
  onStatsUpdate?: (stats: any) => void;
}) => {
  if (callbacks.onNewBusiness) {
    socket.on('admin:newBusiness', callbacks.onNewBusiness);
  }
  if (callbacks.onNewReport) {
    socket.on('admin:newReport', callbacks.onNewReport);
  }
  if (callbacks.onUserActivity) {
    socket.on('admin:userActivity', callbacks.onUserActivity);
  }
  if (callbacks.onStatsUpdate) {
    socket.on('admin:statsUpdate', callbacks.onStatsUpdate);
  }

  // Return cleanup function for React useEffect
  return () => {
    socket.off('admin:newBusiness');
    socket.off('admin:newReport');
    socket.off('admin:userActivity');
    socket.off('admin:statsUpdate');
  };
};

// Error handling
socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

// Connection status events
socket.on('connect', () => {
  console.log('Socket connected');
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Socket reconnected after', attemptNumber, 'attempts');
});
