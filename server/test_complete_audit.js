const http = require('http');

async function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runAudit() {
  console.log('--- STARTING COMPREHENSIVE PLATFORM AUDIT ---');

  // Test 1: Health check
  const health = await request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('1. Health Check:', health.data.status, '| Mode:', health.data.databaseMode);
  if (health.data.status !== 'ONLINE') throw new Error('Health check failed');

  // Test 2: Root SPA Serving
  const root = await request({ hostname: 'localhost', port: 5000, path: '/', method: 'GET' });
  const isHtml = typeof root.data === 'string' && root.data.toLowerCase().includes('<!doctype html>') && root.data.includes('KaryaSetu');
  console.log('2. Root Production SPA Served:', isHtml);
  if (!isHtml) {
    console.log('Root response was:', root.data.slice(0, 200));
    throw new Error('Root does not serve HTML');
  }

  // Test 3: Admin Registration & Cooperative creation
  const adminRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'District Chairman Shinde',
    phone: '+91 94220 ' + Math.floor(10000 + Math.random() * 90000),
    role: 'admin',
    cooperativeName: 'Pune South District Multi-Trade Sahakari',
    regNumber: 'MH/PNE/CS/LAB/2026/' + Math.floor(1000 + Math.random() * 9000)
  });
  console.log('3. Admin Registered & Coop Created:', adminRes.data.success, '| Coop ID:', adminRes.data.user.cooperativeId);
  if (!adminRes.data.success) throw new Error('Admin registration failed');

  // Test 4: Dispute Creation & Resolution
  const disputeRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/disputes',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    bookingId: 'bk_audit_101',
    customerName: 'Suresh Raina',
    customerPhone: '+91 98221 00001',
    serviceCategory: 'Electrical',
    issueType: 'QUALITY_OF_WORK',
    description: 'Switchboard loose connection needs check'
  });
  console.log('4a. Dispute Created:', disputeRes.data.success, '| ID:', disputeRes.data.data._id);
  if (!disputeRes.data.success) throw new Error('Dispute creation failed');

  const disputeId = disputeRes.data.data._id;
  const resolveRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/disputes/${disputeId}/resolve`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    resolution: 'Resolved amicably. Shramik revisits with certified tester.'
  });
  console.log('4b. Dispute Resolved:', resolveRes.data.data.status === 'RESOLVED');
  if (resolveRes.data.data.status !== 'RESOLVED') throw new Error('Dispute resolution failed');

  // Test 5: Welfare Claim & Ledger
  const claimRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/welfare/claim',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    workerId: 'wrk_audit_1',
    workerName: 'Tukaram Kadam',
    cooperativeName: 'Pune South District Multi-Trade Sahakari',
    type: 'ANNUAL_HEALTH_CAMP',
    title: 'Preventive Health Checkup',
    amount: 1500
  });
  console.log('5a. Welfare Claim Disbursed:', claimRes.data.success, '| Amount:', claimRes.data.data.amount);
  if (!claimRes.data.success) throw new Error('Welfare claim failed');

  const ledgerRes = await request({ hostname: 'localhost', port: 5000, path: '/api/welfare/ledger', method: 'GET' });
  console.log('5b. Welfare Ledger Count:', ledgerRes.data.count, '| Total Corpus INR:', ledgerRes.data.totalCorpus);

  // Test 6: Institutional Contract
  const contractRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/contracts',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    clientName: 'Amanora Park Town RWA',
    clientType: 'Housing Society',
    address: 'Hadapsar, Pune',
    contractTitle: 'Facility Operations SLA',
    durationMonths: 12,
    monthlyBudget: 60000
  });
  console.log('6. Institutional Contract Created:', contractRes.data.success, '| Title:', contractRes.data.data.contractTitle);
  if (!contractRes.data.success) throw new Error('Contract creation failed');

  // Test 7: Nearby Workers Geo-Matching
  const matchRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/matching/nearby-workers',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    serviceCategory: 'Electrical',
    address: 'Kothrud, Pune'
  });
  console.log('7. Geo-Matching Workers:', matchRes.data.success, '| Matched count:', matchRes.data.count);
  if (!matchRes.data.success) throw new Error('Matching failed');

  // Test 8: Payment Verification & Escrow Settle (Verify Endpoint)
  // Create a booking first
  const bRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/bookings',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    customerName: 'Rohit Sharma',
    customerPhone: '+91 99887 77665',
    address: 'Baner, Pune',
    serviceCategory: 'Electrical',
    subTrade: 'Inverter Wiring',
    estimatedAmount: 1200
  });
  const testBk = bRes.data.booking;

  // Move to IN_PROGRESS
  await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${testBk._id}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, { status: 'IN_PROGRESS' });

  // Call /api/payments/verify
  const payVerifyRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/payments/verify',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    bookingId: testBk._id,
    razorpay_order_id: 'order_test_9988',
    razorpay_payment_id: 'pay_test_audit_8899',
    razorpay_signature: 'TEST_VERIFIED',
    amount: 1200,
    paymentMethod: 'UPI_RAZORPAY'
  });

  console.log('8. Payment /verify Result:', {
    success: payVerifyRes.data.success,
    invoiceNumber: payVerifyRes.data.invoice?.invoiceNumber,
    workerPayout: payVerifyRes.data.invoice?.worker?.payout,
    welfareDeposit: payVerifyRes.data.invoice?.cooperative?.welfareDeposit
  });
  if (!payVerifyRes.data.success) throw new Error('Payment verification failed');

  // Verify booking status is COMPLETED
  const updatedBkRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${testBk._id}`,
    method: 'GET'
  });
  console.log('8b. Booking Status Post-Payment:', updatedBkRes.data.data.status, '| PaymentStatus:', updatedBkRes.data.data.paymentStatus);
  if (updatedBkRes.data.data.status !== 'COMPLETED' || updatedBkRes.data.data.paymentStatus !== 'PAID') {
    throw new Error('Booking status was not set to COMPLETED and PAID');
  }

  // Test 9: Customer Rating & Endorsement
  const rateRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${testBk._id}/rate`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    score: 5,
    comment: 'Punctual, verified shramik and excellent workmanship!',
    cooperativeEndorsement: true
  });
  console.log('9. Customer Rating Saved:', rateRes.data.success, '| Rating Score:', rateRes.data.data.ratings?.score);
  if (!rateRes.data.success) throw new Error('Rating failed');

  console.log('\n===============================================================');
  console.log('🏆 100% COMPLETE PLATFORM AUDIT SUCCEEDED WITH ZERO ERRORS!');
  console.log('===============================================================\n');
}

runAudit().catch(err => {
  console.error('AUDIT ERROR:', err);
  process.exit(1);
});
