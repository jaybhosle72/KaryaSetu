const express = require('express');
const router = express.Router();
const { DataStore } = require('../services/dataStore');

const maskUan = (uan) => {
  if (!uan) return 'XXXX-XXXX-••••';
  const clean = String(uan).replace(/\D/g, '');
  if (clean.length >= 4) {
    return `XXXX-XXXX-${clean.slice(-4)}`;
  }
  return 'XXXX-XXXX-••••';
};

// GET /api/workers - List workers with optional filters
router.get('/', async (req, res) => {
  try {
    const { cooperativeId, trade, status } = req.query;
    const isCustomer = req.headers['x-user-role'] === 'customer';
    const workers = await DataStore.getWorkers({ cooperativeId, trade, status });
    
    // Privacy protection: customers only see eshramRegistered badge, not full UAN
    const sanitized = workers.map(w => {
      const copy = { ...w };
      if (isCustomer) {
        delete copy.eshramUan;
        if (copy.welfareDetails) {
          copy.welfareDetails = { ...copy.welfareDetails };
          delete copy.welfareDetails.eShramUAN;
        }
      } else if (copy.eshramUan) {
        copy.eshramUanMasked = maskUan(copy.eshramUan);
      }
      return copy;
    });

    res.json({ success: true, count: sanitized.length, data: sanitized });
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

    const workerObj = worker.toObject ? worker.toObject() : { ...worker };
    const isCustomer = req.headers['x-user-role'] === 'customer';
    if (isCustomer) {
      delete workerObj.eshramUan;
      if (workerObj.welfareDetails) {
        workerObj.welfareDetails = { ...workerObj.welfareDetails };
        delete workerObj.welfareDetails.eShramUAN;
      }
    } else if (workerObj.eshramUan) {
      workerObj.eshramUanMasked = maskUan(workerObj.eshramUan);
    }

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

    let resolvedContractorName = null;
    if (contractorId) {
      const contractor = await DataStore.getContractorById(contractorId);
      if (contractor) {
        resolvedContractorName = contractor.name;
      }
    }

    const newWorker = await DataStore.createWorker({
      name,
      phone,
      primaryTrade: trade || 'General Labour',
      trade: trade || 'General Labour',
      aadhaarNumber: aadhaar || 'XXXX-XXXX-8821',
      cooperativeId: cooperativeId || 'coop_101',
      cooperativeName: cooperativeName || 'Brihan-Maharashtra Multi-Trade Labour Cooperative',
      contractorId: contractorId || null,
      contractorName: resolvedContractorName
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
