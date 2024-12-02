import { Request, Response } from 'express';
import { ChatService } from '../services/chat.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middlewares/auth';
import { emitChatEvent } from '../lib/socket';

export class ChatController {
  static initializeChat = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Not authenticated');

    const { businessId } = req.params;
    const chatRoom = await ChatService.initializeChat(userId, businessId);
    
    res.status(201).json(chatRoom);
  });

  static getChatRooms = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Not authenticated');

    const chatRooms = await ChatService.getChatRooms(userId);
    res.json(chatRooms);
  });

  static getChatMessages = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Not authenticated');

    const { chatRoomId } = req.params;
    const { page = '1', limit = '50' } = req.query;

    const messages = await ChatService.getChatMessages(
      chatRoomId,
      userId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(messages);
  });

  static sendMessage = catchAsync(async (req: AuthRequest, res: Response) => {
    const senderId = req.user?.id;
    if (!senderId) throw new ApiError(401, 'Not authenticated');

    const { chatRoomId } = req.params;
    const { content, receiverId } = req.body;

    const message = await ChatService.sendMessage({
      senderId,
      receiverId,
      chatRoomId,
      content,
    });

    // Emit socket event for real-time updates
    emitChatEvent('newMessage', message);

    res.status(201).json(message);
  });

  static markMessagesAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Not authenticated');

    const { chatRoomId } = req.params;
    await ChatService.markMessagesAsRead(chatRoomId, userId);

    res.status(200).json({ success: true });
  });
}