import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password', 12);

  // Create super admin
  await prisma.user.upsert({
    where: { email: 'super@test.com' },
    update: {},
    create: {
      email: 'super@test.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin',
    },
  });

  // Create admin
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  // Create support
  await prisma.user.upsert({
    where: { email: 'support@test.com' },
    update: {},
    create: {
      email: 'support@test.com',
      password: hashedPassword,
      name: 'Support User',
      role: 'admin',
    },
  });

  console.log('Database has been seeded with test users');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
