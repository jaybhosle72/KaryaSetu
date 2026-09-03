const express = require('express');
const router = express.Router();
const { DataStore } = require('../services/dataStore');

// GET /api/welfare/ledger - List welfare ledger transactions
router.get('/ledger', async (req, res) => {
  try {
    const records = await DataStore.getWelfareLedger();
    const coops = await DataStore.getCooperatives();
    const totalCorpus = coops.reduce((sum, c) => sum + (c.welfareFundBalance || 0), 0);

    res.json({
      success: true,
      totalWelfareCorpusINR: totalCorpus,
      totalCorpus: totalCorpus,
      count: records.length,
      data: records,
      records: records
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/welfare/claim - Record a new welfare claim or benefit disbursement
router.post('/claim', async (req, res) => {
  try {
    const { workerId, workerName, cooperativeName, type, title, amount, description } = req.body;
    const newClaim = await DataStore.createWelfareClaim({
      workerId: workerId || 'wrk_101',
      workerName: workerName || 'Santosh Baburao Kadam',
      cooperativeName: cooperativeName || 'Pune Electrical Sahakari',
      type: type || 'ACCIDENT_INSURANCE_PREMIUM',
      title: title || 'Worker Welfare Direct Grant',
      amount: Number(amount) || 1200,
      description: description || 'Approved by Cooperative Welfare Committee.'
    });

    res.status(201).json({ success: true, data: newClaim });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
