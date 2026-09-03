const express = require('express');
const router = express.Router();
const { DataStore } = require('../services/dataStore');
const {
  matchWorkersForCustomer,
  matchContractorsForProject,
  resolveAreaCoordinates
} = require('../services/matchingEngine');

// POST /api/matching/nearby-workers
// Finds and scores nearby workers for solo on-demand services
router.post('/nearby-workers', async (req, res) => {
  try {
    const { serviceCategory, subTrade, address, lat, lng, isEmergency } = req.body;
    const workers = await DataStore.getWorkers();

    const customerCoords = (lat && lng) ? { lat, lng } : resolveAreaCoordinates(address);

    const rankedWorkers = matchWorkersForCustomer(workers, {
      serviceCategory,
      subTrade,
      address,
      isEmergency: Boolean(isEmergency)
    }, customerCoords);

    res.json({
      success: true,
      customerLocation: customerCoords,
      count: rankedWorkers.length,
      data: rankedWorkers.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/matching/nearby-contractors
// Level 1: Finds and scores nearby contractors for major projects
router.post('/nearby-contractors', async (req, res) => {
  try {
    const { serviceCategory, projectScope, address, lat, lng } = req.body;
    const contractors = await DataStore.getContractors();

    const customerCoords = (lat && lng) ? { lat, lng } : resolveAreaCoordinates(address);

    const rankedContractors = matchContractorsForProject(contractors, {
      serviceCategory,
      projectScope: projectScope || {},
      address
    }, customerCoords);

    res.json({
      success: true,
      customerLocation: customerCoords,
      count: rankedContractors.length,
      data: rankedContractors
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
