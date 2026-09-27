import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Decoupled AI/Insights Module

export const getPricingSuggestions = async () => {
  const products = await prisma.product.findMany({ include: { supplier: true } });
  const suggestions = [];

  for (const p of products) {
    const currentMargin = ((p.sellPrice - p.costPrice) / p.sellPrice) * 100;
    // Suggest 20% margin minimum
    if (currentMargin < 20) {
      const suggestedPrice = p.costPrice / (1 - 0.20);
      suggestions.push({
        id: p.id,
        sku: p.sku,
        title: p.title,
        costPrice: p.costPrice,
        currentSellPrice: p.sellPrice,
        suggestedPrice: Math.ceil(suggestedPrice),
        reason: 'Below 20% target margin. Consider increasing price.'
      });
    } else if (currentMargin > 40 && p.stockQuantity > 50) {
      const suggestedPrice = p.costPrice / (1 - 0.35); // drop to 35% to boost velocity
      suggestions.push({
        id: p.id,
        sku: p.sku,
        title: p.title,
        costPrice: p.costPrice,
        currentSellPrice: p.sellPrice,
        suggestedPrice: Math.floor(suggestedPrice),
        reason: 'High margin but high stock. Consider slight drop to boost velocity.'
      });
    }
  }

  return suggestions;
};

export const getReorderAlerts = async () => {
  const products = await prisma.product.findMany({ include: { supplier: true } });
  
  // Calculate velocity from recent orders (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentItems = await prisma.orderLineItem.findMany({
    where: {
      order: { createdAt: { gte: sevenDaysAgo } }
    },
    include: { product: true }
  });

  const velocityMap: Record<string, number> = {};
  for (const item of recentItems) {
    velocityMap[item.productId] = (velocityMap[item.productId] || 0) + item.quantity;
  }

  const alerts = [];
  for (const p of products) {
    const weeklyVelocity = velocityMap[p.id] || 0;
    const dailyVelocity = weeklyVelocity / 7;
    let daysOfStock = Infinity;
    if (dailyVelocity > 0) {
      daysOfStock = p.stockQuantity / dailyVelocity;
    }

    if (daysOfStock <= 5 || p.stockQuantity <= p.lowStockThreshold) {
      alerts.push({
        id: p.id,
        sku: p.sku,
        title: p.title,
        supplierName: p.supplier.businessName,
        currentStock: p.stockQuantity,
        dailyVelocity: dailyVelocity.toFixed(2),
        daysOfStock: Math.floor(daysOfStock),
        critical: daysOfStock <= 2
      });
    }
  }

  return alerts.sort((a, b) => a.daysOfStock - b.daysOfStock);
};

export const getSupplierReliability = async () => {
  const suppliers = await prisma.supplier.findMany({
    include: { products: { include: { lineItems: { include: { order: true } } } } }
  });

  const reliability = [];

  for (const sup of suppliers) {
    let totalOrders = 0;
    let inTransitOrders = 0;
    let deliveredOrders = 0;
    let exceptions = 0;

    // We can infer reliability by the status of orders containing their products
    // In a real app, we'd measure time from SupplierNotified to InTransit
    for (const prod of sup.products) {
      for (const item of prod.lineItems) {
        totalOrders++;
        if (item.order.status === 'InTransit') inTransitOrders++;
        if (item.order.status === 'Delivered') deliveredOrders++;
        if (item.order.status === 'Exception' || item.order.status === 'RTO') exceptions++;
      }
    }

    let score = 10;
    if (totalOrders > 0) {
      const successRate = (inTransitOrders + deliveredOrders) / totalOrders;
      const exceptionRate = exceptions / totalOrders;
      score = 10 * successRate - (5 * exceptionRate);
      if (score < 0) score = 0;
    }

    reliability.push({
      id: sup.id,
      name: sup.businessName,
      score: score.toFixed(1),
      totalOrders,
      exceptions
    });
  }

  return reliability.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
};
