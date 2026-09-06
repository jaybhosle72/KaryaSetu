/**
 * Strict Trade-Specific Service Request Dispatching & Acceptance Verification Test
 */
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

async function runTest() {
  console.log('=== STARTING TRADE SPECIFIC DISPATCH TEST ===\n');

  // 1. Register Electrician Worker
  const elecWorkerRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/workers',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Ramesh Wireman',
    trade: 'Electrical',
    phone: '+91 98230 ' + Math.floor(10000 + Math.random() * 90000),
    experienceYears: 6,
    skills: ['Wiring', 'Switchboard', 'Inverter'],
    status: 'AVAILABLE'
  });
  const elecWorker = elecWorkerRes.data.data;
  console.log('1. Created Certified Electrician:', elecWorker.name, '| Trade:', elecWorker.trade, '| ID:', elecWorker._id);

  // 2. Register Plumber Worker
  const plumbWorkerRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/workers',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Suresh Plumber',
    trade: 'Plumbing',
    phone: '+91 98231 ' + Math.floor(10000 + Math.random() * 90000),
    experienceYears: 8,
    skills: ['Pipe Fitting', 'Tap Repair', 'Drainage'],
    status: 'AVAILABLE'
  });
  const plumbWorker = plumbWorkerRes.data.data;
  console.log('2. Created Certified Plumber:', plumbWorker.name, '| Trade:', plumbWorker.trade, '| ID:', plumbWorker._id);

  // 3. Create Electrical Request
  const elecBookingRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/bookings',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    customerName: 'Anand Patil',
    customerPhone: '+91 91234 56789',
    address: 'Kothrud, Pune',
    serviceCategory: 'Home Maintenance & Repair',
    subTrade: 'Electrical: MCB Tripping & Short Circuit Repair',
    estimatedAmount: 850
  });
  const elecBooking = elecBookingRes.data.booking;
  console.log('3. Created Electrical Booking:', elecBooking._id, '| Resolved Trade:', elecBooking.trade);
  if (elecBooking.trade !== 'Electrical') {
    throw new Error(`Expected trade 'Electrical' but got '${elecBooking.trade}'`);
  }

  // 4. Create Plumbing Request
  const plumbBookingRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/bookings',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    customerName: 'Sunita Deshmukh',
    customerPhone: '+91 91234 56780',
    address: 'Aundh, Pune',
    serviceCategory: 'Home Maintenance & Repair',
    subTrade: 'Plumbing: Kitchen Sink Water Leakage & Pipe Replacement',
    estimatedAmount: 750
  });
  const plumbBooking = plumbBookingRes.data.booking;
  console.log('4. Created Plumbing Booking:', plumbBooking._id, '| Resolved Trade:', plumbBooking.trade);
  if (plumbBooking.trade !== 'Plumbing') {
    throw new Error(`Expected trade 'Plumbing' but got '${plumbBooking.trade}'`);
  }

  // 5. Test Filtered Feed for Electrician
  const elecFeed = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings?workerId=${elecWorker._id}`,
    method: 'GET'
  });
  const elecFeedIds = elecFeed.data.data.map(b => b._id);
  const elecSeesElecJob = elecFeedIds.includes(elecBooking._id);
  const elecSeesPlumbJob = elecFeedIds.includes(plumbBooking._id);
  console.log('5. Electrician Feed: Sees Electrical Job?', elecSeesElecJob, '| Sees Plumbing Job?', elecSeesPlumbJob);
  if (!elecSeesElecJob) throw new Error('Electrician failed to see electrical booking');
  if (elecSeesPlumbJob) throw new Error('LEAK DETECTED: Electrician saw plumbing booking in their queue!');

  // 6. Test Filtered Feed for Plumber
  const plumbFeed = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings?workerId=${plumbWorker._id}`,
    method: 'GET'
  });
  const plumbFeedIds = plumbFeed.data.data.map(b => b._id);
  const plumbSeesPlumbJob = plumbFeedIds.includes(plumbBooking._id);
  const plumbSeesElecJob = plumbFeedIds.includes(elecBooking._id);
  console.log('6. Plumber Feed: Sees Plumbing Job?', plumbSeesPlumbJob, '| Sees Electrical Job?', plumbSeesElecJob);
  if (!plumbSeesPlumbJob) throw new Error('Plumber failed to see plumbing booking');
  if (plumbSeesElecJob) throw new Error('LEAK DETECTED: Plumber saw electrical booking in their queue!');

  // 7. Plumber attempts to accept Electrical job (Must be rejected)
  const illegalAcceptRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${elecBooking._id}/accept`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    workerId: plumbWorker._id
  });
  console.log('7. Plumber Attempt to Accept Electrical Job (Expect Rejection): Status', illegalAcceptRes.status, '| Error:', illegalAcceptRes.data.error);
  if (illegalAcceptRes.status === 200) {
    throw new Error('SECURITY BREACH: Plumber was allowed to accept an Electrical booking!');
  }

  // 8. Electrician accepts Electrical job (Must succeed)
  const legalAcceptRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${elecBooking._id}/accept`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    workerId: elecWorker._id
  });
  console.log('8. Electrician Accept Electrical Job: Status', legalAcceptRes.status, '| Success:', legalAcceptRes.data.success);
  if (legalAcceptRes.status !== 200 || !legalAcceptRes.data.success) {
    throw new Error('Electrician could not accept their own certified electrical job: ' + JSON.stringify(legalAcceptRes.data));
  }

  // 9. Electrician attempts to accept Plumbing job (Must be rejected)
  const illegalAcceptRes2 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${plumbBooking._id}/accept`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    workerId: elecWorker._id
  });
  console.log('9. Electrician Attempt to Accept Plumbing Job (Expect Rejection): Status', illegalAcceptRes2.status, '| Error:', illegalAcceptRes2.data.error);
  if (illegalAcceptRes2.status === 200) {
    throw new Error('SECURITY BREACH: Electrician was allowed to accept a Plumbing booking!');
  }

  // 10. Plumber accepts Plumbing job (Must succeed)
  const legalAcceptRes2 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${plumbBooking._id}/accept`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    workerId: plumbWorker._id
  });
  console.log('10. Plumber Accept Plumbing Job: Status', legalAcceptRes2.status, '| Success:', legalAcceptRes2.data.success);
  if (legalAcceptRes2.status !== 200 || !legalAcceptRes2.data.success) {
    throw new Error('Plumber could not accept their own certified plumbing job: ' + JSON.stringify(legalAcceptRes2.data));
  }

  console.log('\n========================================================================');
  console.log('🎉 100% STRICT TRADE DISPATCH & ACCEPTANCE ENFORCEMENT VERIFIED!');
  console.log('========================================================================\n');
}

runTest().catch(err => {
  console.error('TEST ERROR:', err.message);
  process.exit(1);
});
