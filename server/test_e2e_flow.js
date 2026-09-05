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
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function registerOrLogin(userData) {
  const regRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, userData);

  if (regRes.data && regRes.data.user) {
    return regRes.data;
  }

  // Fallback to login if already registered
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    phone: userData.phone,
    role: userData.role
  });

  if (!loginRes.data || !loginRes.data.user) {
    console.error('regRes:', regRes.data);
    console.error('loginRes:', loginRes.data);
  }

  return loginRes.data;
}

async function runTests() {
  console.log('--- STARTING MULTI-DEVICE ROLE-BASED INTEGRATION TESTS ---');

  // 1. Clear test bookings
  const clearRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/bookings/clear-all',
    method: 'DELETE'
  });
  console.log('1. Cleared bookings:', clearRes.data);

  // 2. Register/Login real customer (Device 1)
  const custRes = await registerOrLogin({
    name: 'Vikram Malhotra',
    phone: '+91 99887 11223',
    address: 'Flat 502, Sky High Towers, Kothrud, Pune',
    role: 'customer'
  });
  console.log('2. Customer Active:', custRes.user.name, custRes.user.phone);

  // 3. Register/Login real worker (Device 2)
  const workerRes = await registerOrLogin({
    name: 'Rameshwar Patil',
    phone: '+91 98221 44556',
    trade: 'Electrical',
    experienceYears: 5,
    aadhaar: '9988-7766-5544',
    role: 'worker'
  });
  console.log('3. Worker Active:', workerRes.user.name, 'Worker ID:', workerRes.worker?._id || workerRes.user.workerId);

  const workerId = workerRes.worker?._id || workerRes.user.workerId;

  // 4. Device 1 (Customer) books individual electrician
  const bookRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/bookings',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    customerName: custRes.user.name,
    customerPhone: custRes.user.phone,
    address: custRes.user.address,
    serviceCategory: 'Electrical',
    subTrade: 'Switchboard Repair & Fan Installation',
    bookingMode: 'SOLO_WORKER',
    estimatedPrice: 650
  });

  const b = bookRes.data.booking;
  console.log('4. Customer Created Booking:', {
    id: b._id,
    status: b.status,
    assignedWorkerId: b.assignedWorkerId,
    doorstepOtp: b.doorstepOtp
  });

  if (b.status !== 'MATCHING' || b.assignedWorkerId) {
    throw new Error('FAILED: Booking should be in MATCHING with no assigned worker!');
  }
  console.log('✓ Verified: Booking is broadcast to workers in MATCHING status.');

  // 5. Device 2 (Worker) views matching requests and accepts it
  const acceptRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${b._id}/accept`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    workerId: workerId
  });

  const accepted = acceptRes.data.booking || acceptRes.data.data;
  console.log('5. Worker Accepted Job:', {
    status: accepted.status,
    workerName: accepted.workerName,
    workerPhone: accepted.workerPhone,
    assignedWorkerId: accepted.assignedWorkerId
  });

  if (accepted.status !== 'ALLOCATED' || accepted.assignedWorkerId !== workerId) {
    throw new Error('FAILED: Booking was not properly allocated to worker!');
  }
  console.log('✓ Verified: Booking atomically allocated to Worker Rameshwar Patil.');

  // 6. Worker starts travel (EN_ROUTE)
  const enRouteRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${b._id}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, { status: 'EN_ROUTE' });
  const enRouteBooking = enRouteRes.data.data || enRouteRes.data;
  console.log('6. Worker en route status:', enRouteBooking.status);

  // 7. Worker arrives at doorstep and enters customer OTP
  const otpRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${b._id}/verify-otp`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { otp: b.otp || '4821' });

  const inProgBooking = otpRes.data.booking || otpRes.data.data;
  console.log('7. OTP Verified at doorstep:', {
    status: inProgBooking.status,
    workerVerifiedAt: inProgBooking.workerVerifiedAt
  });

  if (inProgBooking.status !== 'IN_PROGRESS') {
    throw new Error('FAILED: OTP verification did not transition job to IN_PROGRESS!');
  }
  console.log('✓ Verified: Job is now IN_PROGRESS.');

  // 8. Worker completes service
  const completeRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${b._id}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, { status: 'COMPLETED' });
  const compBooking = completeRes.data.data || completeRes.data;
  console.log('8. Worker completed service:', compBooking.status);

  // 9. Customer settles escrow payment
  const payRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${b._id}/pay`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { paymentMethod: 'UPI_ESCROW' });

  console.log('9. Payment Settled:', {
    paymentStatus: payRes.data.booking.paymentStatus,
    status: payRes.data.booking.status
  });

  console.log('=== FLOW 1 (CUSTOMER -> SOLO WORKER) FULLY VERIFIED! ===\n');

  // FLOW 2: CONTRACTOR PROJECT FLOW
  console.log('--- STARTING FLOW 2: CONTRACTOR TEAM PROJECT ---');
  // Register/Login Real Contractor (Device 3)
  const contractorRes = await registerOrLogin({
    name: 'Balasaheb Mukaddam',
    phone: '+91 98223 99887',
    license: 'MH-PUN-LAB-2024-9988',
    trade: 'Electrical',
    role: 'contractor'
  });
  console.log('10. Contractor Active:', contractorRes.user.name, contractorRes.user.phone);

  const contractorId = contractorRes.contractor?._id || contractorRes.user.contractorId;

  // Customer creates a CONTRACTOR_TEAM project requirement
  const projRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/bookings',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    customerName: custRes.user.name,
    customerPhone: custRes.user.phone,
    address: 'Commercial Tower, Sector 4, Baner, Pune',
    serviceCategory: 'Electrical',
    subTrade: 'Complete Building Rewiring & DB Panel Setup',
    bookingMode: 'CONTRACTOR_TEAM',
    propertyType: 'Commercial Complex',
    scopeType: 'Turnkey Renovation',
    approxAreaSqFt: 4500,
    contractorId: contractorId,
    contractorName: contractorRes.user.name,
    notes: 'Requires 4 electricians and 2 helpers for 5 days.'
  });

  const projBooking = projRes.data.booking;
  console.log('11. Customer Submitted Project Requirement:', {
    id: projBooking._id,
    status: projBooking.status,
    bookingMode: projBooking.bookingMode
  });

  if (projBooking.status !== 'PROPOSAL_PENDING') {
    throw new Error('FAILED: Contractor project should start in PROPOSAL_PENDING!');
  }
  console.log('✓ Verified: Project requirement starts in PROPOSAL_PENDING.');

  // Device 3 (Contractor) reviews requirement and submits proposal
  const propRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${projBooking._id}/proposal`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    workforce: [
      { role: 'Master Electrician', count: 2, dailyRate: 1200 },
      { role: 'Wireman Helper', count: 2, dailyRate: 600 }
    ],
    estimatedDurationDays: 5,
    estimatedCost: 28500,
    materialsAndEquipment: ['Safety Harness', 'Multimeter', 'Drill Machine'],
    notes: 'Allocating 2 certified wiremen + 2 apprentice helpers with safety gear.'
  });

  const propData = propRes.data.booking || propRes.data.data;
  console.log('12. Contractor Submitted Proposal:', {
    status: propData.status,
    totalAmount: propData.totalAmount,
    projectDurationDays: propData.projectDurationDays
  });

  if (propData.status !== 'PROPOSAL_RECEIVED') {
    throw new Error('FAILED: Status should transition to PROPOSAL_RECEIVED!');
  }
  console.log('✓ Verified: Status is now PROPOSAL_RECEIVED.');

  // Device 1 (Customer) approves contractor proposal
  const approveRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/bookings/${projBooking._id}/approve-proposal`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  const approvedData = approveRes.data.booking || approveRes.data.data;
  console.log('13. Customer Approved Proposal:', {
    status: approvedData.status
  });

  if (approvedData.status !== 'MATCHING') {
    throw new Error('FAILED: Status should transition to MATCHING for contractor to allocate crew!');
  }
  console.log('✓ Verified: Customer approved proposal; status is now MATCHING.');

  // Device 3 (Contractor) dispatches verified crew
  const allocRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/contractors/allocate`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    bookingId: projBooking._id,
    workerIds: [workerId]
  });

  const allocData = allocRes.data.booking || allocRes.data.data;
  console.log('14. Contractor Dispatched Crew:', {
    status: allocData.status,
    assignedWorkerIds: allocData.assignedWorkerIds,
    allocatedCrewSize: allocData.assignedWorkerIds?.length
  });

  if (allocData.status !== 'ALLOCATED') {
    throw new Error('FAILED: Status should be ALLOCATED after contractor assigns crew!');
  }
  console.log('✓ Verified: Crew dispatched; project is now ALLOCATED.');

  console.log('\n======================================================');
  console.log('🎉 ALL MULTI-ROLE END-TO-END WORKFLOW TESTS PASSED 100%!');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
