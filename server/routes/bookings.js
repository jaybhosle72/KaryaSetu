const express = require('express');
const router = express.Router();
const { DataStore } = require('../services/dataStore');
const { calculatePaymentSplit, generateInvoiceNumber } = require('../services/paymentService');
const { resolveCanonicalTrade, isTradeMatch } = require('../utils/tradeResolver');

// GET /api/bookings - List all bookings with optional role/worker filtering
router.get('/', async (req, res) => {
  try {
    const { role, workerId, trade, status, bookingMode } = req.query;
    const allBookings = await DataStore.getBookings();

    let filtered = allBookings;

    if (workerId || role === 'worker') {
      const worker = workerId ? await DataStore.getWorkerById(workerId) : null;
      const workerTrade = worker?.trade || trade;
      const workerSubTrades = worker?.subTrades || [];

      if (workerTrade) {
        filtered = allBookings.filter(b => {
          const isAssignedToMe = worker && (
            String(b.assignedWorkerId) === String(worker._id) ||
            String(b.assignedWorkerId) === String(worker.id) ||
            String(b.assignedWorkerId) === String(workerId)
          );
          const isMatchingTrade = isTradeMatch(workerTrade, b, workerSubTrades);
          const isAvailableInMyTrade = b.status === 'MATCHING' && !b.assignedWorkerId && isMatchingTrade;
          return isAssignedToMe || isAvailableInMyTrade;
        });
      }
    } else {
      if (status) filtered = filtered.filter(b => b.status === status);
      if (bookingMode) filtered = filtered.filter(b => b.bookingMode === bookingMode);
    }

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bookings/:id - Single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await DataStore.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bookings - Create Standard or Institutional Household Booking
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      serviceCategory,
      subTrade,
      address,
      estimatedAmount = 500,
      urgency = 'STANDARD',
      bookingMode = 'SOLO_WORKER',
      teamSize = 1,
      projectDurationDays = 1,
      projectScope
    } = req.body;

    const allCoops = await DataStore.getCooperatives();
    const defaultCoop = allCoops[0] || { _id: 'coop_pune_multi', name: 'Brihan-Maharashtra Multi-Trade Labour Cooperative' };

    const canonicalTrade = resolveCanonicalTrade(req.body);
    let newBookingData = {};

    if (bookingMode === 'CONTRACTOR_TEAM') {
      // Contractor Team Request: Customer describes outcome; contractor plans workforce & sends proposal
      const allContractors = await DataStore.getContractors();
      const contractor = (req.body.contractorId ? allContractors.find(c => c._id === req.body.contractorId) : null) || allContractors[0];
      const coop = allCoops.find(c => c._id === contractor?.cooperativeId) || defaultCoop;
      const initialAmount = Number(estimatedAmount) || 0;
      const split = calculatePaymentSplit(initialAmount, coop?.splitConfig);

      newBookingData = {
        customerName: customerName || 'Citizen Customer',
        customerPhone: customerPhone || '+91 98220 11223',
        serviceCategory,
        subTrade: subTrade || `${serviceCategory} Contractor Project`,
        trade: canonicalTrade,
        type: 'HOUSEHOLD',
        urgency,
        bookingMode: 'CONTRACTOR_TEAM',
        teamSize: 0,
        projectDurationDays: 0,
        projectScope: projectScope || {
          taskDescription: `Outcome requirement for ${serviceCategory}`,
          propertyType: '3 BHK',
          scopeType: 'Interior',
          approxAreaSqFt: 1200
        },
        contractorId: contractor?._id,
        contractorName: contractor?.name,
        assignedWorkerIds: [],
        address: address || 'Pune, Maharashtra',
        cooperativeId: coop?._id,
        cooperativeName: coop?.name,
        assignedWorkerId: undefined,
        workerName: 'Awaiting Contractor Evaluation & Planning',
        status: 'PROPOSAL_PENDING',
        totalAmount: initialAmount,
        notes: req.body.notes || '',
        paymentBreakdown: {
          workerAmount: split.workerAmount,
          coopAmount: split.coopAmount,
          welfareAmount: split.welfareAmount,
          platformAmount: split.platformAmount
        },
        paymentStatus: 'PENDING',
        paymentMethod: 'UPI',
        invoiceNumber: generateInvoiceNumber(),
        allocationRationale: `Customer specified project outcome ("${projectScope?.taskDescription || subTrade}"). Dispatched to Contractor ${contractor?.name || 'Mukaddam'} for workforce planning & proposal.`,
        etaMinutes: 45
      };
    } else {
      // Solo Worker Flow: Created in MATCHING state without pre-assignment!
      const coop = defaultCoop;
      const split = calculatePaymentSplit(estimatedAmount, coop?.splitConfig);

      newBookingData = {
        customerName: customerName || 'Citizen Customer',
        customerPhone: customerPhone || '+91 98220 11223',
        serviceCategory,
        subTrade: subTrade || `${serviceCategory} General Service`,
        trade: canonicalTrade,
        type: 'HOUSEHOLD',
        urgency,
        bookingMode: 'SOLO_WORKER',
        teamSize: 1,
        projectDurationDays: 1,
        address: address || 'Pune, Maharashtra',
        cooperativeId: coop?._id,
        cooperativeName: coop?.name,
        assignedWorkerId: null,
        workerName: 'Matching eligible cooperative professional...',
        workerPhone: '',
        status: 'MATCHING',
        totalAmount: Number(estimatedAmount) || 500,
        notes: req.body.notes || '',
        paymentBreakdown: {
          workerAmount: split.workerAmount,
          coopAmount: split.coopAmount,
          welfareAmount: split.welfareAmount,
          platformAmount: split.platformAmount
        },
        paymentStatus: 'PENDING',
        paymentMethod: 'UPI',
        invoiceNumber: generateInvoiceNumber(),
        allocationRationale: `Request dispatched to cooperative pool for ${serviceCategory}. Awaiting technician acceptance.`,
        etaMinutes: 15,
        otp: req.body.otp || Math.floor(1000 + Math.random() * 9000).toString()
      };
    }

    const newBooking = await DataStore.createBooking(newBookingData);

    res.status(201).json({
      success: true,
      data: newBooking,
      booking: newBooking,
      matchMeta: {
        score: 98.5,
        distKm: 1.2,
        rationale: newBookingData.allocationRationale
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bookings/:id/accept - Real Worker Accepts Matching Request
router.post('/:id/accept', async (req, res) => {
  try {
    const { workerId } = req.body;
    if (!workerId) {
      return res.status(400).json({ success: false, error: 'workerId is required to accept job.' });
    }

    const updatedBooking = await DataStore.acceptBooking(req.params.id, workerId);
    res.json({
      success: true,
      message: `Job accepted successfully by ${updatedBooking.workerName}!`,
      data: updatedBooking,
      booking: updatedBooking
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/bookings/clear-all - Purge test/demo bookings for clean testing
router.delete('/clear-all', async (req, res) => {
  try {
    const result = await DataStore.clearAllBookings();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bookings/emergency - Rapid 1-Click SOS Dispatch
router.post('/emergency', async (req, res) => {
  try {
    const {
      customerName = "Emergency Requester",
      customerPhone = "+91 98999 11111",
      emergencyType = "Water Leakage",
      address = "Baner Road, Pune 411045",
      notes = "Critical immediate response required"
    } = req.body;

    let trade = "Plumbing";
    let subTrade = "Burst Pipe Emergency";
    let basePrice = 650;

    if (emergencyType.toLowerCase().includes("electric") || emergencyType.toLowerCase().includes("short circuit") || emergencyType.toLowerCase().includes("spark")) {
      trade = "Electrical";
      subTrade = "Short Circuit Troubleshooting";
      basePrice = 600;
    } else if (emergencyType.toLowerCase().includes("lock") || emergencyType.toLowerCase().includes("door")) {
      trade = "Carpentry";
      subTrade = "Door Lock Emergency";
      basePrice = 550;
    }

    const allWorkers = (await DataStore.getWorkers()).filter(w => isTradeMatch(w.trade, trade, w.subTrades));
    const availableWorkers = allWorkers.filter(w => w.status === 'AVAILABLE' || w.status === 'EMERGENCY_READY');
    const assignedWorker = availableWorkers[0] || allWorkers[0] || null;

    const allCoops = await DataStore.getCooperatives();
    const coop = allCoops.find(c => c._id === assignedWorker?.cooperativeId) || allCoops[0];
    const split = calculatePaymentSplit(basePrice, coop?.splitConfig);

    const created = await DataStore.createBooking({
      customerName,
      customerPhone,
      serviceCategory: trade,
      subTrade,
      trade,
      type: 'EMERGENCY',
      urgency: 'EMERGENCY',
      address,
      cooperativeId: coop?._id,
      cooperativeName: coop?.name,
      assignedWorkerId: assignedWorker?._id,
      workerName: assignedWorker?.name || 'Rapid Response Squad',
      workerPhone: assignedWorker?.phone || '+91 98221 00102',
      status: assignedWorker ? 'ALLOCATED' : 'MATCHING',
      totalAmount: basePrice,
      paymentBreakdown: {
        workerAmount: split.workerAmount,
        coopAmount: split.coopAmount,
        welfareAmount: split.welfareAmount,
        platformAmount: split.platformAmount
      },
      paymentStatus: 'PENDING',
      paymentMethod: 'UPI / Direct',
      invoiceNumber: generateInvoiceNumber(),
      allocationRationale: `🚨 EMERGENCY RAPID SQUAD: Auto-dispatched nearest ${trade} shramik.`,
      etaMinutes: 10,
      emergencyTriggerReason: notes,
      otp: req.body.otp || Math.floor(1000 + Math.random() * 9000).toString()
    });

    if (assignedWorker) {
      await DataStore.updateWorker(assignedWorker._id, {
        status: 'ON_DUTY',
        currentWorkload: (assignedWorker.currentWorkload || 0) + 1
      });
    }

    res.status(201).json({
      success: true,
      message: '🚨 Emergency Worker Dispatched through Cooperative Rapid Squad',
      data: created,
      booking: created,
      etaMinutes: created.etaMinutes
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT & PATCH /api/bookings/:id/status - Update Booking Status
const handleUpdateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await DataStore.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const updates = { status };
    if (status === 'COMPLETED') {
      updates.completedAt = new Date().toISOString();
      // Free the worker
      if (booking.assignedWorkerId) {
        const worker = await DataStore.getWorkerById(booking.assignedWorkerId);
        if (worker) {
          await DataStore.updateWorker(worker._id, {
            status: worker.isEmergencyDuty ? 'EMERGENCY_READY' : 'AVAILABLE',
            completedJobs: (worker.completedJobs || 0) + 1
          });
        }
      }
      // Note: team worker status update is handled individually above or via DataStore
    }

    const updated = await DataStore.updateBooking(req.params.id, updates);
    res.json({ success: true, data: updated, booking: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
router.put('/:id/status', handleUpdateStatus);
router.patch('/:id/status', handleUpdateStatus);

// POST /api/bookings/:id/verify-otp - Verify Doorstep 4-digit OTP & transition to IN_PROGRESS
router.post('/:id/verify-otp', async (req, res) => {
  try {
    const { otp } = req.body;
    const booking = await DataStore.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const expectedOtp = booking.otp || '4821';
    if (otp && otp.toString().trim() !== expectedOtp.toString().trim()) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid OTP. Please enter the correct 4-digit code provided to the customer.` 
      });
    }

    const updated = await DataStore.updateBooking(req.params.id, {
      status: 'IN_PROGRESS',
      workerVerifiedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Doorstep OTP verified successfully. Worker authorized to start work.',
      data: updated,
      booking: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bookings/:id/pay - Process Digital Payment & Apply 4-Way Transparent Split
router.post('/:id/pay', async (req, res) => {
  try {
    const { paymentMethod = 'UPI (PhonePe / GPay)' } = req.body;
    const booking = await DataStore.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const split = booking.paymentBreakdown || {
      workerAmount: Math.round(booking.totalAmount * 0.8),
      coopAmount: Math.round(booking.totalAmount * 0.1),
      welfareAmount: Math.round(booking.totalAmount * 0.06),
      platformAmount: Math.round(booking.totalAmount * 0.04)
    };

    const isFinishingWork = booking.status === 'COMPLETED' || booking.status === 'IN_PROGRESS';
    const newStatus = isFinishingWork ? 'COMPLETED' : 'EN_ROUTE';

    const updatedBooking = await DataStore.updateBooking(req.params.id, {
      paymentStatus: 'PAID',
      paymentMethod,
      status: newStatus,
      completedAt: isFinishingWork ? (booking.completedAt || new Date().toISOString()) : booking.completedAt,
      paidAt: new Date().toISOString()
    });

    // 2. Credit Worker Earnings & Welfare
    if (booking.assignedWorkerId) {
      const worker = await DataStore.getWorkerById(booking.assignedWorkerId);
      if (worker) {
        const currentBalance = worker.welfareDetails?.welfareContributionBalance || 0;
        await DataStore.updateWorker(worker._id, {
          totalEarnings: (worker.totalEarnings || 0) + split.workerAmount,
          completedJobs: (worker.completedJobs || 0) + 1,
          status: worker.isEmergencyDuty ? 'EMERGENCY_READY' : 'AVAILABLE',
          welfareDetails: {
            ...worker.welfareDetails,
            welfareContributionBalance: currentBalance + split.welfareAmount
          }
        });
      }
    }

    // 3. Credit Cooperative Welfare Fund Balance
    if (booking.cooperativeId) {
      const coop = await DataStore.getCooperativeById(booking.cooperativeId);
      if (coop) {
        await DataStore.updateCooperative(coop._id, {
          welfareFundBalance: (coop.welfareFundBalance || 0) + split.welfareAmount,
          totalJobsCompleted: (coop.totalJobsCompleted || 0) + 1
        });
      }
    }

    res.json({
      success: true,
      message: 'Payment settled with transparent 4-way cooperative split',
      data: updatedBooking,
      booking: updatedBooking,
      breakdown: {
        workerPayout: `₹${split.workerAmount} (80% take-home)`,
        coopReserve: `₹${split.coopAmount} (10% tools & operations)`,
        welfareFund: `₹${split.welfareAmount} (6% healthcare & social security)`,
        platformTech: `₹${split.platformAmount} (4% server & payment gateway)`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bookings/:id/rate - Customer Rating & Cooperative Endorsement
router.post('/:id/rate', async (req, res) => {
  try {
    const { score = 5, comment = "", quality = 5, punctuality = 5, safety = 5, cooperativeEndorsement = true } = req.body;
    const booking = await DataStore.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const ratingsObj = {
      score,
      comment,
      quality,
      punctuality,
      safety,
      cooperativeEndorsement
    };

    const updated = await DataStore.updateBooking(req.params.id, { ratings: ratingsObj });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bookings/:id/proposal - Contractor submits planned workforce proposal to customer
router.post('/:id/proposal', async (req, res) => {
  try {
    const { workforce, estimatedDurationDays, estimatedCost, materialsAndEquipment, notes } = req.body;
    const booking = await DataStore.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const coop = await DataStore.getCooperativeById(booking.cooperativeId);
    const split = calculatePaymentSplit(Number(estimatedCost) || 0, coop?.splitConfig);

    const totalWorkers = (workforce || []).reduce((sum, item) => sum + (Number(item.count) || 0), 0);

    const proposal = {
      workforce: workforce || [],
      estimatedDurationDays: Number(estimatedDurationDays) || 1,
      estimatedCost: Number(estimatedCost) || 0,
      materialsAndEquipment: materialsAndEquipment || [],
      notes: notes || 'Cooperative depot equipment included. Transparent statutory rate breakdown.',
      submittedAt: new Date().toISOString()
    };

    const updated = await DataStore.updateBooking(req.params.id, {
      proposal,
      totalAmount: Number(estimatedCost) || 0,
      projectDurationDays: Number(estimatedDurationDays) || 1,
      teamSize: totalWorkers || 1,
      status: 'PROPOSAL_RECEIVED',
      workerName: `Proposal Sent: ${totalWorkers} Shramiks (${estimatedDurationDays} Days)`,
      paymentBreakdown: {
        workerAmount: split.workerAmount,
        coopAmount: split.coopAmount,
        welfareAmount: split.welfareAmount,
        platformAmount: split.platformAmount
      }
    });

    res.json({ success: true, data: updated, booking: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bookings/:id/approve-proposal - Customer approves contractor proposal
router.post('/:id/approve-proposal', async (req, res) => {
  try {
    const booking = await DataStore.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const updated = await DataStore.updateBooking(req.params.id, {
      status: 'MATCHING',
      workerName: `Plan Approved by Customer — Ready for Crew Allocation (${booking.teamSize || 2} Shramiks)`
    });

    res.json({ success: true, data: updated, booking: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
