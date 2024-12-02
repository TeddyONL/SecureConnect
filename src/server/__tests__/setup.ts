import { prisma } from '../lib/prisma';
import { config } from 'dotenv';

config({ path: '.env.test' });

beforeAll(async () => {
  // Clear test database
  await prisma.$connect();
  await prisma.message.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.review.deleteMany();
  await prisma.businessClaim.deleteMany();
  await prisma.business.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});