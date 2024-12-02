import request from 'supertest';
import { app } from '../lib/server';
import { prisma } from '../lib/prisma';
import { AuthService } from '../services/auth.service';
import { BusinessService } from '../services/business.service';

describe('Chat API', () => {
  let userToken: string;
  let userId: string;
  let businessId: string;
  let chatRoomId: string;

  beforeAll(async () => {
    const userResult = await AuthService.createUser('user@example.com', 'Password123!', 'User');
    userToken = userResult.accessToken;
    userId = userResult.user.id;

    const business = await BusinessService.createBusiness({
      name: 'Test Business',
      description: 'Test Description',
      category: 'Test Category',
      ownerId: userId,
      location: {
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        latitude: 0,
        longitude: 0
      },
      contact: {
        phone: '+1234567890',
        email: 'business@test.com',
      },
      operatingHours: []
    });
    businessId = business.id;
  });

  beforeEach(async () => {
    await prisma.message.deleteMany();
    await prisma.chatRoom.deleteMany();
  });

  describe('POST /api/chat/business/:businessId', () => {
    it('should initialize a chat room', async () => {
      const res = await request(app)
        .post(`/api/chat/business/${businessId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      chatRoomId = res.body.id;
    });
  });

  describe('POST /api/chat/rooms/:chatRoomId/messages', () => {
    it('should send a message', async () => {
      const message = {
        content: 'Hello!',
        receiverId: userId
      };

      const res = await request(app)
        .post(`/api/chat/rooms/${chatRoomId}/messages`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(message);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('content', message.content);
    });
  });
});