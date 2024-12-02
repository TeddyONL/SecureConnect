import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import config from '../config';
import logger from './logger';
import { prisma } from './prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
}

export const socketHandler = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verify(token, config.jwt.accessSecret) as {
        id: string;
        role: string;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = user.id;
      socket.role = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      
      // Join admin room if applicable
      if (socket.role === 'admin' || socket.role === 'super_admin') {
        socket.join('admin');
      }
    }

    // Chat room events
    socket.on('joinChatRoom', (chatRoomId: string) => {
      socket.join(`chat:${chatRoomId}`);
    });

    socket.on('leaveChatRoom', (chatRoomId: string) => {
      socket.leave(`chat:${chatRoomId}`);
    });

    socket.on('typing', ({ chatRoomId, isTyping }: { chatRoomId: string; isTyping: boolean }) => {
      socket.to(`chat:${chatRoomId}`).emit('userTyping', {
        userId: socket.userId,
        isTyping,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error: ${error}`);
    });
  });

  return io;
};

// Event emitters
export const emitChatEvent = (event: string, data: any) => {
  const io = global.io as Server;
  if (io) {
    if (data.chatRoomId) {
      io.to(`chat:${data.chatRoomId}`).emit(`chat:${event}`, data);
    }
    if (data.receiverId) {
      io.to(`user:${data.receiverId}`).emit(`chat:${event}`, data);
    }
  }
};

// ... (keep existing event emitters)