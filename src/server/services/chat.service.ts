import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { Prisma } from '@prisma/client';

export class ChatService {
  static async initializeChat(userId: string, businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { owner: true },
    });

    if (!business) {
      throw new ApiError(404, 'Business not found');
    }

    // Check if chat room already exists
    const existingChatRoom = await prisma.chatRoom.findFirst({
      where: {
        businessId,
        users: {
          some: { id: userId },
        },
      },
    });

    if (existingChatRoom) {
      return existingChatRoom;
    }

    // Create new chat room
    return prisma.chatRoom.create({
      data: {
        businessId,
        users: {
          connect: [
            { id: userId },
            { id: business.ownerId },
          ],
        },
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  static async getChatRooms(userId: string) {
    return prisma.chatRoom.findMany({
      where: {
        users: {
          some: { id: userId },
        },
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });
  }

  static async getChatMessages(
    chatRoomId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        id: chatRoomId,
        users: {
          some: { id: userId },
        },
      },
    });

    if (!chatRoom) {
      throw new ApiError(404, 'Chat room not found');
    }

    return prisma.message.findMany({
      where: { chatRoomId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  static async sendMessage(data: {
    senderId: string;
    receiverId: string;
    chatRoomId: string;
    content: string;
  }) {
    const { senderId, receiverId, chatRoomId, content } = data;

    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        id: chatRoomId,
        users: {
          some: { id: senderId },
        },
      },
    });

    if (!chatRoom) {
      throw new ApiError(404, 'Chat room not found');
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        chatRoomId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update chat room's last message timestamp
    await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  static async markMessagesAsRead(chatRoomId: string, userId: string) {
    await prisma.message.updateMany({
      where: {
        chatRoomId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        updatedAt: new Date(),
      },
    });
  }
}
