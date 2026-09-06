/**
 * Automated Test: Contractor Worker Committees & 1-to-1 Affiliation Exclusivity
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
  console.log('=== STARTING CONTRACTOR COMMITTEE EXCLUSIVITY TEST ===\n');

  // 1. Register Contractor A (Deshmukh Civil & Construction)
  const cntARes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Santosh Deshmukh',
    phone: '+91 97650 ' + Math.floor(10000 + Math.random() * 90000),
    role: 'contractor',
    license: 'LIC/PNE/2026/' + Math.floor(1000 + Math.random() * 9000),
    trade: ['Civil Construction', 'Masonry', 'Carpentry']
  });
  const contractorA = cntARes.data.contractor;
  console.log('1. Created Contractor A:', contractorA.name, '| ID:', contractorA._id);

  // 2. Register Contractor B (Jadhav Facilities & Painting)
  const cntBRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Balasaheb Jadhav',
    phone: '+91 97651 ' + Math.floor(10000 + Math.random() * 90000),
    role: 'contractor',
    license: 'LIC/PNE/2026/' + Math.floor(1000 + Math.random() * 9000),
    trade: ['Painting', 'Deep Cleaning', 'Waterproofing']
  });
  const contractorB = cntBRes.data.contractor;
  console.log('2. Created Contractor B:', contractorB.name, '| ID:', contractorB._id);

  // 3. Onboard Worker 1 directly under Contractor A's Committee
  const w1Res = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/contractors/${contractorA._id}/add-worker`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    newWorker: {
      name: 'Tukaram Gavande',
      phone: '+91 98900 ' + Math.floor(10000 + Math.random() * 90000),
      trade: 'Masonry',
      experienceYears: 7
    }
  });
  const worker1 = w1Res.data.worker;
  console.log('3. Onboarded Worker 1 under Contractor A:', worker1.name, '| contractorId:', worker1.contractorId);
  if (worker1.contractorId !== contractorA._id) {
    throw new Error(`Worker 1 contractorId was not set to Contractor A._id (${contractorA._id})`);
  }

  // 4. Contractor B attempts to add Worker 1 (MUST BE REJECTED!)
  const conflictRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/contractors/${contractorB._id}/add-worker`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    workerId: worker1._id
  });
  console.log('4. Contractor B Attempt to Steal Worker 1 (Expect Rejection): Status', conflictRes.status, '| Error:', conflictRes.data.error);
  if (conflictRes.status === 200) {
    throw new Error('SECURITY BREACH: Contractor B was allowed to add Worker 1 who is already affiliated with Contractor A!');
  }
  if (!conflictRes.data.error || !conflictRes.data.error.includes('Affiliation conflict')) {
    throw new Error('Expected affiliation conflict error message but got: ' + conflictRes.data.error);
  }

  // 5. Onboard Worker 2 under Contractor B's Committee
  const w2Res = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/contractors/${contractorB._id}/add-worker`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    newWorker: {
      name: 'Dnyaneshwar More',
      phone: '+91 98901 ' + Math.floor(10000 + Math.random() * 90000),
      trade: 'Painting',
      experienceYears: 5
    }
  });
  const worker2 = w2Res.data.worker;
  console.log('5. Onboarded Worker 2 under Contractor B:', worker2.name, '| contractorId:', worker2.contractorId);
  if (worker2.contractorId !== contractorB._id) {
    throw new Error(`Worker 2 contractorId was not set to Contractor B._id (${contractorB._id})`);
  }

  // 6. Verify Contractor A's committee roster contains ONLY Worker 1
  const cntAWorkersRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/contractors/${contractorA._id}/workers`,
    method: 'GET'
  });
  const cntAWorkerIds = cntAWorkersRes.data.data.map(w => w._id);
  console.log('6. Contractor A Committee List:', cntAWorkerIds, '| Has Worker 1?', cntAWorkerIds.includes(worker1._id), '| Has Worker 2?', cntAWorkerIds.includes(worker2._id));
  if (!cntAWorkerIds.includes(worker1._id) || cntAWorkerIds.includes(worker2._id)) {
    throw new Error('Contractor A committee roster isolation failed!');
  }

  // 7. Verify Contractor B's committee roster contains ONLY Worker 2
  const cntBWorkersRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/contractors/${contractorB._id}/workers`,
    method: 'GET'
  });
  const cntBWorkerIds = cntBWorkersRes.data.data.map(w => w._id);
  console.log('7. Contractor B Committee List:', cntBWorkerIds, '| Has Worker 2?', cntBWorkerIds.includes(worker2._id), '| Has Worker 1?', cntBWorkerIds.includes(worker1._id));
  if (!cntBWorkerIds.includes(worker2._id) || cntBWorkerIds.includes(worker1._id)) {
    throw new Error('Contractor B committee roster isolation failed!');
  }

  // 8. Contractor A releases Worker 1
  const releaseRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/contractors/${contractorA._id}/workers/${worker1._id}`,
    method: 'DELETE'
  });
  console.log('8. Contractor A Released Worker 1: Status', releaseRes.status, '| Success:', releaseRes.data.success);
  if (releaseRes.status !== 200 || !releaseRes.data.success) {
    throw new Error('Failed to release worker from Contractor A committee');
  }

  // Verify Worker 1 is now unaffiliated
  const checkWorker1 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/workers/${worker1._id}`,
    method: 'GET'
  });
  console.log('8b. Worker 1 Affiliation Post-Release:', checkWorker1.data.data.contractorId);
  if (checkWorker1.data.data.contractorId) {
    throw new Error('Worker 1 contractorId was not cleared upon release');
  }

  // 9. Contractor B now recruits Worker 1 (MUST SUCCEED now that Worker 1 is unaffiliated)
  const recruitRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/contractors/${contractorB._id}/add-worker`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    workerId: worker1._id
  });
  console.log('9. Contractor B Recruits Unaffiliated Worker 1: Status', recruitRes.status, '| Success:', recruitRes.data.success);
  if (recruitRes.status !== 200 || !recruitRes.data.success) {
    throw new Error('Failed to recruit unaffiliated Worker 1 to Contractor B: ' + JSON.stringify(recruitRes.data));
  }

  // 10. Verify Contractor B now has both Worker 1 and Worker 2
  const cntBUpdated = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/contractors/${contractorB._id}/workers`,
    method: 'GET'
  });
  const cntBUpdatedIds = cntBUpdated.data.data.map(w => w._id);
  console.log('10. Contractor B Committee Count:', cntBUpdated.data.count, '| IDs:', cntBUpdatedIds);
  if (!cntBUpdatedIds.includes(worker1._id) || !cntBUpdatedIds.includes(worker2._id)) {
    throw new Error('Contractor B committee roster does not contain both recruited workers');
  }

  console.log('\n========================================================================');
  console.log('🏆 100% CONTRACTOR COMMITTEE & 1-TO-1 AFFILIATION VERIFIED SUCCEEDED!');
  console.log('========================================================================\n');
}

runTest().catch(err => {
  console.error('TEST FAILED:', err.message);
  process.exit(1);
});
