import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: 'CT Scanner',
        description: 'High-resolution computed tomography scanner',
        price: 250000,
        imageUrl: null,
      },
      {
        name: 'Digital Blood Pressure Monitor',
        description: 'Automatic digital BP monitor with memory',
        price: 450,
        imageUrl: null,
      },
      {
        name: 'Ultrasound Machine',
        description: 'Portable diagnostic ultrasound machine',
        price: 85000,
        imageUrl: null,
      },
    ],
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });