import request from 'supertest';
import { app } from '../lib/server';
import { prisma } from '../lib/prisma';
import { AuthService } from '../services/auth.service';
import { BusinessService } from '../services/business.service';

describe('Review API', () => {
  let authToken: string;
  let userId: string;
  let businessId: string;

  beforeAll(async () => {
    const authResult = await AuthService.createUser('reviewer@example.com', 'Password123!', 'Reviewer');
    authToken = authResult.accessToken;
    userId = authResult.user.id;

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
    await prisma.review.deleteMany();
  });

  describe('POST /api/reviews/business/:businessId', () => {
    it('should create a new review', async () => {
      const review = {
        rating: 5,
        content: 'Great business!',
        photos: ['https://example.com/photo.jpg']
      };

      const res = await request(app)
        .post(`/api/reviews/business/${businessId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(review);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('rating', review.rating);
      expect(res.body).toHaveProperty('content', review.content);
    });
  });

  describe('GET /api/reviews/business/:businessId', () => {
    it('should return business reviews', async () => {
      const res = await request(app)
        .get(`/api/reviews/business/${businessId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.reviews)).toBe(true);
    });
  });
});