const express = require('express');
const router = express.Router();
const { DataStore } = require('../services/dataStore');

// GET /api/workers - List workers with optional filters
router.get('/', async (req, res) => {
  try {
    const { cooperativeId, trade, status } = req.query;
    const workers = await DataStore.getWorkers({ cooperativeId, trade, status });
    res.json({ success: true, count: workers.length, data: workers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/workers/:id - Worker details & individual welfare profile
router.get('/:id', async (req, res) => {
  try {
    const worker = await DataStore.getWorkerById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, error: 'Worker not found' });
    
    // Also get this worker's bookings and welfare transactions
    const allBookings = await DataStore.getBookings();
    const workerBookings = allBookings.filter(b => b.assignedWorkerId === req.params.id);
    const allWelfare = await DataStore.getWelfareLedger();
    const workerWelfare = allWelfare.filter(w => w.workerId === req.params.id);

    const workerObj = worker.toObject ? worker.toObject() : worker;
    res.json({
      success: true,
      data: {
        ...workerObj,
        recentBookings: workerBookings.slice(0, 5),
        welfareRecords: workerWelfare
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/workers/:id/status - Toggle availability or emergency duty
router.put('/:id/status', async (req, res) => {
  try {
    const { status, isEmergencyDuty } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (typeof isEmergencyDuty === 'boolean') updates.isEmergencyDuty = isEmergencyDuty;

    const updated = await DataStore.updateWorker(req.params.id, updates);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/workers/:id/verify-skill - Cooperative certifies or verifies a skill
router.post('/:id/verify-skill', async (req, res) => {
  try {
    const { skillName, issuer } = req.body;
    const worker = await DataStore.getWorkerById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, error: 'Worker not found' });

    const newSkill = {
      name: skillName || 'Cooperative Advanced Trade Certified',
      issuer: issuer || worker.cooperativeName,
      verifiedDate: new Date().toISOString().split('T')[0]
    };

    const updatedSkills = [...(worker.verifiedSkills || []), newSkill];
    const updated = await DataStore.updateWorker(req.params.id, {
      verifiedSkills: updatedSkills,
      reliabilityScore: Math.min(99.9, (worker.reliabilityScore || 95) + 0.5)
    });

    res.json({ success: true, data: updated, addedSkill: newSkill });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/workers/:id/skills/verify - Alias route for verifying skill
router.put('/:id/skills/verify', async (req, res) => {
  try {
    const { skillName, issuer } = req.body;
    const worker = await DataStore.getWorkerById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, error: 'Worker not found' });

    const newSkill = {
      name: skillName || 'Cooperative Advanced Trade Certified',
      issuer: issuer || worker.cooperativeName,
      verifiedDate: new Date().toISOString().split('T')[0]
    };

    const updatedSkills = [...(worker.verifiedSkills || []), newSkill];
    const updated = await DataStore.updateWorker(req.params.id, {
      verifiedSkills: updatedSkills,
      reliabilityScore: Math.min(99.9, (worker.reliabilityScore || 95) + 0.5)
    });

    res.json({ success: true, data: updated, addedSkill: newSkill });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/workers - Onboard new shramik to cooperative & contractor community
router.post('/', async (req, res) => {
  try {
    const { name, phone, trade, aadhaar, cooperativeId, cooperativeName, contractorId } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Name and phone are required' });
    }
    const newWorker = await DataStore.createWorker({
      name,
      phone,
      primaryTrade: trade || 'General Labour',
      trade: trade || 'General Labour',
      aadhaarNumber: aadhaar || 'XXXX-XXXX-8821',
      cooperativeId: cooperativeId || 'coop_101',
      cooperativeName: cooperativeName || 'Brihan-Maharashtra Multi-Trade Labour Cooperative',
      contractorId: contractorId || 'cnt_101'
    });

    if (contractorId) {
      await DataStore.addWorkerToContractorCommunity(contractorId, newWorker._id);
    }

    res.status(201).json({ success: true, data: newWorker });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
