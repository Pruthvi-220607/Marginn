import { PrismaClient } from '@prisma/client';
import { decrypt, logger } from './utils.js';

const prisma = new PrismaClient();

// Mock Notification to Slack/Email for errors
const sendAlert = (message: string) => {
  logger.error('PIPELINE_ALERT', message, { alertSent: true });
};

// 1. Shiprocket Supplier Pickup Registration
export const registerSupplierPickupLocation = async (supplier: any) => {
  logger.info('SHIPROCKET_REGISTER_PICKUP', { supplierId: supplier.id });
  try {
    await new Promise(r => setTimeout(r, 500));
    const pickupId = `SR-PICKUP-${supplier.id.substring(0, 8).toUpperCase()}`;
    logger.info('SHIPROCKET_PICKUP_REGISTERED', { supplierId: supplier.id, pickupId });
    return pickupId;
  } catch (err: any) {
    sendAlert(`Failed to register pickup location for supplier ${supplier.id}`);
    throw err;
  }
};

// 2. Order Fulfillment Pipeline
export const processOrderPipeline = async (orderId: string) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        lineItems: { include: { product: { include: { supplier: true } } } }
      }
    });

    if (!order) throw new Error(`Order ${orderId} not found`);
    if (order.status !== 'InventoryDeducted') {
      logger.info('PIPELINE_SKIPPED', { orderId, reason: `Status is ${order.status}` });
      return;
    }

    logger.info('PIPELINE_STARTED', { orderId: order.marketplaceOrderId });

    const primaryItem = order.lineItems[0];
    const supplier = primaryItem.product.supplier;

    if (!supplier.shiprocketPickupId) {
      throw new Error(`Supplier ${supplier.id} has no Shiprocket Pickup ID registered`);
    }

    // Decrypt PII securely in memory
    const customerName = decrypt(order.customerName) || 'Customer';
    const shippingAddress = decrypt(order.shippingAddress) || 'Address';
    const phone = decrypt(order.phone) || 'Phone';

    // Step A: Supplier Notification
    logger.info('SUPPLIER_NOTIFICATION_SENT', { supplierId: supplier.id });
    // Masked log for security - never log PII
    logger.info('WHATSAPP_SIMULATION', { maskedMessage: `Please ship ${primaryItem.quantity}x ${primaryItem.product.title} to ***. Use NEUTRAL PACKAGING.` });
    
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'SupplierNotified' }
    });
    logger.transition(order.id, 'InventoryDeducted', 'SupplierNotified');

    // Step B: Shiprocket Booking
    logger.info('SHIPROCKET_BOOKING_INITIATED', { pickupId: supplier.shiprocketPickupId });
    await new Promise(r => setTimeout(r, 800));
    const mockShiprocketOrderId = `SR-ORD-${Date.now()}`;
    
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'ShipmentBooked', shiprocketOrderId: mockShiprocketOrderId }
    });
    logger.transition(order.id, 'SupplierNotified', 'ShipmentBooked');

    // Step C: AWB Assignment
    logger.info('SHIPROCKET_AWB_ASSIGNMENT', { shiprocketOrderId: mockShiprocketOrderId });
    await new Promise(r => setTimeout(r, 800));
    const mockAwb = `AWB${Math.floor(Math.random() * 1000000000)}`;

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'AWBAssigned', awbNumber: mockAwb }
    });
    logger.transition(order.id, 'ShipmentBooked', 'AWBAssigned');

    // Step D: Marketplace Sync
    logger.info('MARKETPLACE_SYNC', { awb: mockAwb, marketplace: order.marketplace });
    await new Promise(r => setTimeout(r, 500));
    
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'InTransit' } 
    });
    logger.transition(order.id, 'AWBAssigned', 'InTransit');

    logger.info('PIPELINE_COMPLETED', { orderId: order.marketplaceOrderId });

  } catch (error: any) {
    sendAlert(`Order Pipeline Failed for ${orderId}: ${error.message}`);
    logger.error('PIPELINE_FAILED', error, { orderId });
  }
};
