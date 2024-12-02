import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { auth } from '../middlewares/auth';

const router = Router();

router.post('/business/:businessId', auth, ChatController.initializeChat);
router.get('/rooms', auth, ChatController.getChatRooms);
router.get('/rooms/:chatRoomId/messages', auth, ChatController.getChatMessages);
router.post('/rooms/:chatRoomId/messages', auth, ChatController.sendMessage);
router.post('/rooms/:chatRoomId/read', auth, ChatController.markMessagesAsRead);

export default router;