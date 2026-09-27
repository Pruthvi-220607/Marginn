import { PrismaClient } from '@prisma/client';
import { encrypt } from './src/utils.js';

const prisma = new PrismaClient();

async function injectToken() {
  const refreshToken = 'Atzr|IwEBIO2hpS_R9RrIn-8A57N1pi3txAd85Ul9RTzirkoV0yh9tTJ0OZke0lQuXTSE142Yz0JJbR1j0jhvPJXdjUFYdeFonLqmpIhq7VxQcNjayHgw4Odi95n88QvAJGBZQ2iSNXuP4UdLXO5BSFtXx3tBk_IZeD_Cz5uIQBiP51lZjpzQHP_Oq6EmGOV66lpd6nLqYZujBHcjbULeGgO5YRPmnQ745zzTJuyU3_7qJFWeTfLUNyQXAlXkkejdY3gGXOnc4nw00MpwnSTSPB4-0LWOoGpLi3Z5UnO_0z0SBYfUj8Z3yMMn6oicQL64DyYYzeUSuao';
  
  let seller = await prisma.seller.findFirst();
  if (!seller) {
    seller = await prisma.seller.create({
      data: { businessName: 'My Brand Store' }
    });
  }

  const mockAccessToken = 'Atza|mock_access_token_12345';
  
  await prisma.seller.update({
    where: { id: seller.id },
    data: {
      amazonConnected: true,
      amazonRefreshToken: encrypt(refreshToken),
      amazonAccessToken: encrypt(mockAccessToken),
      amazonTokenExpiry: new Date(Date.now() + 3600 * 1000),
      amazonSellerId: 'REAL_SELLER_ACCOUNT'
    }
  });

  console.log("Token successfully injected and account connected!");
}

injectToken()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
