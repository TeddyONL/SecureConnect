import request from 'supertest';
import { app } from '../lib/server';
import { prisma } from '../lib/prisma';
import { AuthService } from '../services/auth.service';

describe('Business API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const result = await AuthService.createUser('business@example.com', 'Password123!', 'Business Owner');
    authToken = result.accessToken;
    userId = result.user.id;
  });

  beforeEach(async () => {
    await prisma.business.deleteMany();
  });

  describe('POST /api/businesses', () => {
    it('should create a new business', async () => {
      const business = {
        name: 'Test Business',
        description: 'Test Description',
        category: 'Test Category',
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
          website: 'https://test.com'
        },
        operatingHours: Array(7).fill({
          day: 'monday',
          open: '09:00',
          close: '17:00',
          isClosed: false
        })
      };

      const res = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(business);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', business.name);
      expect(res.body).toHaveProperty('ownerId', userId);
    });
  });

  describe('GET /api/businesses', () => {
    it('should return list of businesses', async () => {
      const res = await request(app)
        .get('/api/businesses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.businesses)).toBe(true);
    });

    it('should filter businesses by category', async () => {
      const res = await request(app)
        .get('/api/businesses')
        .query({ category: 'Test Category' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.businesses)).toBe(true);
    });
  });
});