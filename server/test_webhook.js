import fetch from 'node-fetch'; // Requires node-fetch or native fetch in Node 18+

const run = async () => {
  try {
    console.log('🚀 Triggering Amazon Webhook (Phase 4 Simulation)...');
    
    const response = await fetch('http://localhost:5000/api/webhooks/amazon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        AmazonOrderId: `AMZ-TEST-${Date.now()}`,
        BuyerInfo: { BuyerName: 'John Doe Testing' },
        ShippingAddress: { AddressLine1: '123 Test Street', City: 'Mumbai', Phone: '9999999999' },
        OrderItems: [
          { SellerSKU: 'TEST-SKU', QuantityOrdered: 1 } // Will fail inventory check if SKU not found, but API will return 200
        ]
      })
    });

    console.log(`Server responded with: ${response.status} ${await response.text()}`);
  } catch (error) {
    console.error('Test Failed:', error);
  }
};

run();
