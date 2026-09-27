import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reset() {
  await prisma.seller.updateMany({
    data: {
      amazonConnected: false,
      amazonAccessToken: null,
      amazonRefreshToken: null,
      flipkartConnected: false,
      flipkartAccessToken: null,
      flipkartRefreshToken: null
    }
  });
  console.log("Database connection states reset successfully.");
}

reset()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
