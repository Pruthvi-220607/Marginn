import fetch from 'node-fetch';

const runLoadTest = async () => {
  const NUM_REQUESTS = 50;
  console.log(`🚀 Firing ${NUM_REQUESTS} concurrent webhook requests to simulate a burst...`);

  const requests = Array.from({ length: NUM_REQUESTS }).map((_, i) => {
    return fetch('http://localhost:5000/api/webhooks/amazon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        AmazonOrderId: `AMZ-BURST-${Date.now()}-${i}`,
        BuyerInfo: { BuyerName: `Load Tester ${i}` },
        ShippingAddress: { AddressLine1: 'Test', City: 'City' },
        OrderItems: [{ SellerSKU: 'TEST-SKU', QuantityOrdered: 1 }]
      })
    });
  });

  const startTime = Date.now();
  const responses = await Promise.allSettled(requests);
  const endTime = Date.now();

  const success = responses.filter(r => r.status === 'fulfilled' && r.value.ok).length;
  const failed = NUM_REQUESTS - success;

  console.log(`\n📊 Load Test Results:`);
  console.log(`Time taken: ${endTime - startTime}ms`);
  console.log(`Successful Ingestions: ${success}`);
  console.log(`Failed Ingestions: ${failed}`);
  
  if (failed > 0) {
    console.error('⚠️ Some requests failed. SQLite might have locked, consider PostgreSQL for high concurrency production.');
  }
};

runLoadTest();
