const express = require('express');
const router = express.Router();
const { DataStore } = require('../services/dataStore');
const { generateDynamicForecast } = require('../services/forecastEngine');

// GET /api/forecast - AI Demand Forecasting and workforce alerts
router.get('/', async (req, res) => {
  try {
    const forecasts = await DataStore.getForecasts();
    const dynamicInsights = generateDynamicForecast();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      city: "Pune Metropolitan Cooperative Jurisdiction",
      aiSummary: "Rainfall advisory triggers +185% plumbing emergency demand surge in Sector 4 & Baner corridor.",
      data: forecasts.length > 0 ? forecasts : dynamicInsights
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
