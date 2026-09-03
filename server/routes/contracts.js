const express = require('express');
const router = express.Router();
const { DataStore } = require('../services/dataStore');

// GET /api/contracts - List institutional contracts
router.get('/', async (req, res) => {
  try {
    const contracts = await DataStore.getContracts();
    res.json({ success: true, count: contracts.length, data: contracts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/contracts - Request a new institutional bulk contract
router.post('/', async (req, res) => {
  try {
    const {
      clientName,
      clientType,
      address,
      contractTitle,
      requestedCrew,
      durationMonths = 12,
      monthlyBudget = 45000,
      notes
    } = req.body;

    const coops = await DataStore.getCooperatives();
    const assignedCoop = coops[0]; // Primary multi-trade or electrical coop

    const welfareShareMonthly = Math.round((monthlyBudget * 6) / 100);

    const newContract = await DataStore.createContract({
      clientName,
      clientType: clientType || 'Housing Society',
      address,
      cooperativeId: assignedCoop?._id,
      cooperativeName: assignedCoop?.name,
      contractTitle: contractTitle || `Institutional Facility Maintenance SLA`,
      requestedCrew: requestedCrew || [
        { trade: 'Electrical', count: 2, role: 'Daily Campus Maintenance' },
        { trade: 'Plumbing', count: 2, role: 'Water Storage & Pump Stations' }
      ],
      durationMonths,
      monthlyValue: monthlyBudget,
      status: 'ACTIVE',
      allocatedWorkers: ["wrk_101", "wrk_102"],
      slaCompliance: '99.5%',
      welfareContributionMonthly: welfareShareMonthly,
      notes: notes || 'Periodic preventive checklist with SLA warranty.'
    });

    res.status(201).json({ success: true, data: newContract });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
