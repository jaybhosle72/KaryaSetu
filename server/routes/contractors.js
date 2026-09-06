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

// GET /api/contractors/:id/workers - Get all workers affiliated with this contractor
router.get('/:id/workers', async (req, res) => {
  try {
    const contractor = await DataStore.getContractorById(req.params.id);
    if (!contractor) {
      return res.status(404).json({ success: false, error: 'Contractor not found' });
    }

    const allWorkers = await DataStore.getWorkers();
    const committeeWorkers = allWorkers.filter(w => 
      String(w.contractorId) === String(req.params.id) ||
      (Array.isArray(contractor.workerIds) && contractor.workerIds.includes(w._id))
    );

    res.json({ success: true, count: committeeWorkers.length, data: committeeWorkers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/contractors/:id/add-worker & POST /api/contractors/add-worker - Add or recruit worker to committee
const handleAddWorker = async (req, res) => {
  try {
    const contractorId = req.params.id || req.body.contractorId;
    const { workerId, phone, newWorker } = req.body;

    if (!contractorId) {
      return res.status(400).json({ success: false, error: 'contractorId is required' });
    }

    const contractor = await DataStore.getContractorById(contractorId);
    if (!contractor) {
      return res.status(404).json({ success: false, error: 'Contractor not found' });
    }

    let targetWorkerId = workerId;

    // Case 1: Onboard brand new worker directly under this contractor
    if (newWorker && newWorker.name && newWorker.phone) {
      const created = await DataStore.createWorker({
        name: newWorker.name,
        phone: newWorker.phone,
        trade: newWorker.trade || 'General Labour',
        subTrades: newWorker.subTrades || [newWorker.trade || 'General Labour'],
        experienceYears: Number(newWorker.experienceYears) || 3,
        aadhaarNumber: newWorker.aadhaar || `XXXX-XXXX-${newWorker.phone.slice(-4)}`,
        cooperativeId: contractor.cooperativeId || 'coop_101',
        cooperativeName: contractor.cooperativeName || 'Brihan-Maharashtra Multi-Trade Labour Cooperative',
        contractorId: contractor._id,
        contractorName: contractor.name
      });
      targetWorkerId = created._id;
    } else if (!targetWorkerId && phone) {
      // Case 2: Lookup existing worker by phone
      const allWorkers = await DataStore.getWorkers();
      const cleanSearch = phone.replace(/[\s-]/g, '');
      const found = allWorkers.find(w => w.phone.replace(/[\s-]/g, '').includes(cleanSearch.slice(-10)));
      if (!found) {
        return res.status(404).json({ success: false, error: `No worker found with phone ${phone}` });
      }
      targetWorkerId = found._id;
    }

    if (!targetWorkerId) {
      return res.status(400).json({ success: false, error: 'Provide either workerId, phone, or newWorker object' });
    }

    const updated = await DataStore.addWorkerToContractorCommunity(contractorId, targetWorkerId);
    const worker = await DataStore.getWorkerById(targetWorkerId);

    res.json({
      success: true,
      message: `Worker ${worker.name} successfully added to ${contractor.name}'s committee!`,
      data: updated,
      worker
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

router.post('/:id/add-worker', handleAddWorker);
router.post('/add-worker', handleAddWorker);

// DELETE /api/contractors/:id/workers/:workerId - Release worker from committee
router.delete('/:id/workers/:workerId', async (req, res) => {
  try {
    const { id: contractorId, workerId } = req.params;
    const updated = await DataStore.removeWorkerFromContractorCommunity(contractorId, workerId);
    res.json({
      success: true,
      message: 'Worker released from contractor committee to independent pool.',
      data: updated
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/contractors/remove-worker - Alias
router.post('/remove-worker', async (req, res) => {
  try {
    const { contractorId, workerId } = req.body;
    if (!contractorId || !workerId) {
      return res.status(400).json({ success: false, error: 'contractorId and workerId are required' });
    }
    const updated = await DataStore.removeWorkerFromContractorCommunity(contractorId, workerId);
    res.json({
      success: true,
      message: 'Worker released from contractor committee to independent pool.',
      data: updated
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
