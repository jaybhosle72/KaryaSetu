const express = require('express');
const router = express.Router();
const { DataStore } = require('../services/dataStore');

// GET /api/cooperatives - List all cooperatives
router.get('/', async (req, res) => {
  try {
    const coops = await DataStore.getCooperatives();
    res.json({ success: true, count: coops.length, data: coops });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/cooperatives/:id - Get specific cooperative details & workers
router.get('/:id', async (req, res) => {
  try {
    const coop = await DataStore.getCooperativeById(req.params.id);
    if (!coop) return res.status(404).json({ success: false, error: 'Cooperative not found' });
    
    const workers = await DataStore.getWorkers({ cooperativeId: req.params.id });
    res.json({ success: true, data: { ...coop, workers } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/cooperatives/:id/split - Update cooperative split configuration
router.put('/:id/split', async (req, res) => {
  try {
    const { workerShare, coopShare, welfareShare, platformShare } = req.body;
    if (workerShare + coopShare + welfareShare + platformShare !== 100) {
      return res.status(400).json({ success: false, error: 'Shares must sum to exactly 100%' });
    }
    const updated = await DataStore.updateCooperative(req.params.id, {
      splitConfig: { workerShare, coopShare, welfareShare, platformShare }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
