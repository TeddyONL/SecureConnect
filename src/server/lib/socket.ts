import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config';
import logger from './logger';
import { prisma } from '../config/database';

declare global {
  var io: Server;
}

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

      const decoded = jwt.verify(token, config.jwt.accessSecret) as {
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
  if (global.io) {
    if (data.chatRoomId) {
      global.io.to(`chat:${data.chatRoomId}`).emit(`chat:${event}`, data);
    }
    if (data.receiverId) {
      global.io.to(`user:${data.receiverId}`).emit(`chat:${event}`, data);
    }
  }
};

export const emitAdminEvent = (event: string, data: any) => {
  if (global.io) {
    global.io.to('admin').emit(`admin:${event}`, data);
  }
};

export const emitBusinessEvent = (businessId: string, event: string, data: any) => {
  if (global.io) {
    global.io.to(`business:${businessId}`).emit(`business:${event}`, data);
  }
};

export const emitReviewEvent = (businessId: string, event: string, data: any) => {
  if (global.io) {
    // Emit to business owner and admins
    global.io.to(`business:${businessId}`).to('admin').emit(`review:${event}`, {
      ...data,
      businessId,
    });
  }
};
