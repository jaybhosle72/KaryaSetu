const express = require('express');
const router = express.Router();
const { DataStore } = require('../services/dataStore');

// GET /api/contractors - List all contractors
router.get('/', async (req, res) => {
  try {
    const contractors = await DataStore.getContractors();
    res.json({ success: true, count: contractors.length, data: contractors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/contractors/:id - Get contractor details with community members and team jobs
router.get('/:id', async (req, res) => {
  try {
    const contractor = await DataStore.getContractorById(req.params.id);
    if (!contractor) {
      return res.status(404).json({ success: false, error: 'Contractor not found' });
    }

    const allWorkers = await DataStore.getWorkers();
    const communityWorkers = allWorkers.filter(w => (contractor.workerIds || []).includes(w._id));

    const allBookings = await DataStore.getBookings();
    const teamBookings = allBookings.filter(b => b.contractorId === req.params.id || b.bookingMode === 'CONTRACTOR_TEAM');

    res.json({
      success: true,
      data: {
        ...contractor,
        communityWorkers,
        teamBookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/contractors/allocate - Allocate specific workers from community to team booking
router.post('/allocate', async (req, res) => {
  try {
    const { bookingId, workerIds } = req.body;
    if (!bookingId || !Array.isArray(workerIds) || workerIds.length === 0) {
      return res.status(400).json({ success: false, error: 'bookingId and workerIds array are required' });
    }

    const updatedBooking = await DataStore.allocateWorkersToTeamBooking(bookingId, workerIds);
    if (!updatedBooking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({ success: true, data: updatedBooking, booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/contractors/:id/allocate-workers - Alias route for contractor allocating crew
router.put('/:id/allocate-workers', async (req, res) => {
  try {
    const { bookingId, workerIds } = req.body;
    if (!bookingId || !Array.isArray(workerIds) || workerIds.length === 0) {
      return res.status(400).json({ success: false, error: 'bookingId and workerIds array are required' });
    }

    const updatedBooking = await DataStore.allocateWorkersToTeamBooking(bookingId, workerIds);
    if (!updatedBooking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({ success: true, data: updatedBooking, booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/contractors/add-worker - Add a worker to contractor community
router.post('/add-worker', async (req, res) => {
  try {
    const { contractorId, workerId } = req.body;
    const updated = await DataStore.addWorkerToContractorCommunity(contractorId, workerId);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Contractor not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
