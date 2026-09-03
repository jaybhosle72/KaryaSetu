const express = require('express');
const router = express.Router();
const { DataStore } = require('../services/dataStore');

// GET /api/disputes - List disputes
router.get('/', async (req, res) => {
  try {
    const { cooperativeId } = req.query;
    const disputes = await DataStore.getDisputes(cooperativeId ? { cooperativeId } : {});
    res.json({ success: true, count: disputes.length, data: disputes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/disputes - Raise new grievance
router.post('/', async (req, res) => {
  try {
    const {
      bookingId,
      customerName,
      customerPhone,
      workerId,
      workerName,
      cooperativeId,
      cooperativeName,
      serviceCategory,
      issueType,
      description
    } = req.body;

    const newDispute = await DataStore.createDispute({
      bookingId: bookingId || 'bk_1001',
      customerName: customerName || 'Citizen Grievance Requester',
      customerPhone: customerPhone || '+91 98220 00000',
      workerId,
      workerName,
      cooperativeId: cooperativeId || 'coop_pune_elec',
      cooperativeName: cooperativeName || 'Pune Electrical Sahakari',
      serviceCategory: serviceCategory || 'Electrical',
      issueType: issueType || 'QUALITY_OF_WORK',
      description: description || 'Workmanship requires secondary inspection.',
      status: 'UNDER_MEDIATION'
    });

    res.status(201).json({
      success: true,
      message: 'Grievance registered. Assigned to Cooperative Tripartite Mediation Committee.',
      data: newDispute
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/disputes/:id/resolve - Resolve dispute by cooperative arbitrator
router.put('/:id/resolve', async (req, res) => {
  try {
    const { resolution } = req.body;
    const updated = await DataStore.updateDispute(req.params.id, {
      status: 'RESOLVED',
      resolution: resolution || 'Amicably resolved. Rework scheduled at zero additional cost.',
      resolvedAt: new Date().toISOString()
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
