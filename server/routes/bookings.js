const express = require('express');
const router = express.Router();
const { DataStore } = require('../services/dataStore');
const { matchWorkerToBooking } = require('../services/matchingEngine');
const { calculatePaymentSplit, generateInvoiceNumber } = require('../services/paymentService');

// GET /api/bookings - List all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await DataStore.getBookings();
    res.json({ success: true, count: bookings.length, data: bookings });
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

    // 1. Fetch available workers and cooperatives
    const allWorkers = await DataStore.getWorkers();
    const allCoops = await DataStore.getCooperatives();

    let newBookingData = {};
    let matchResult = null;

    if (bookingMode === 'CONTRACTOR_TEAM') {
      // Contractor Team Request: Customer describes the outcome; contractor plans workforce & sends proposal
      const contractor = (await DataStore.getContractors())[0];
      const coop = allCoops.find(c => c._id === contractor?.cooperativeId) || allCoops[0];
      const initialAmount = Number(estimatedAmount) || 0;
      const split = calculatePaymentSplit(initialAmount, coop?.splitConfig);

      newBookingData = {
        customerName: customerName || 'Rahul Deshmukh',
        customerPhone: customerPhone || '+91 98230 45678',
        serviceCategory,
        subTrade: subTrade || `${serviceCategory} Contractor Project`,
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
        contractorId: contractor?._id || 'cnt_101',
        contractorName: contractor?.name || 'Balasaheb Ramchandra Shinde',
        assignedWorkerIds: [],
        address: address || 'Kothrud, Pune 411038',
        cooperativeId: coop?._id,
        cooperativeName: coop?.name,
        assignedWorkerId: undefined,
        workerName: 'Awaiting Contractor Evaluation & Planning',
        status: 'PROPOSAL_PENDING',
        totalAmount: initialAmount,
        paymentBreakdown: {
          workerAmount: split.workerAmount,
          coopAmount: split.coopAmount,
          welfareAmount: split.welfareAmount,
          platformAmount: split.platformAmount
        },
        paymentStatus: 'PENDING',
        paymentMethod: 'UPI',
        invoiceNumber: generateInvoiceNumber(),
        allocationRationale: `Customer specified project outcome ("${projectScope?.taskDescription || subTrade}"). Dispatched to Contractor ${contractor?.name} for workforce evaluation & proposal.`,
        etaMinutes: 45
      };
    } else {
      // Solo Worker Flow: Run Cooperative-First AI Matching Engine
      const tempBooking = {
        serviceCategory,
        subTrade,
        urgency,
        address,
        type: 'HOUSEHOLD'
      };
      matchResult = matchWorkerToBooking(tempBooking, allWorkers, allCoops);
      const assignedWorker = matchResult.selectedWorker;
      const coop = allCoops.find(c => c._id === assignedWorker?.cooperativeId) || allCoops[0];
      const split = calculatePaymentSplit(estimatedAmount, coop?.splitConfig);

      newBookingData = {
        customerName: customerName || 'Rahul Deshmukh',
        customerPhone: customerPhone || '+91 98230 45678',
        serviceCategory,
        subTrade: subTrade || `${serviceCategory} General Service`,
        type: 'HOUSEHOLD',
        urgency,
        bookingMode: 'SOLO_WORKER',
        teamSize: 1,
        projectDurationDays: 1,
        address: address || 'Kothrud, Pune 411038',
        cooperativeId: coop?._id,
        cooperativeName: coop?.name,
        assignedWorkerId: assignedWorker?._id,
        workerName: assignedWorker?.name,
        workerPhone: assignedWorker?.phone,
        status: 'ALLOCATED',
        totalAmount: estimatedAmount,
        paymentBreakdown: {
          workerAmount: split.workerAmount,
          coopAmount: split.coopAmount,
          welfareAmount: split.welfareAmount,
          platformAmount: split.platformAmount
        },
        paymentStatus: 'PENDING',
        paymentMethod: 'UPI',
        invoiceNumber: generateInvoiceNumber(),
        allocationRationale: matchResult.rationale,
        etaMinutes: matchResult.etaMinutes || 20
      };

      if (assignedWorker) {
        await DataStore.updateWorker(assignedWorker._id, {
          status: 'ON_DUTY',
          currentWorkload: (assignedWorker.currentWorkload || 0) + 1
        });
      }
    }

    const newBooking = await DataStore.createBooking(newBookingData);

    res.status(201).json({
      success: true,
      data: newBooking,
      booking: newBooking,
      matchMeta: {
        score: matchResult ? matchResult.score : 98.5,
        distKm: matchResult ? matchResult.distKm : 1.2,
        rationale: matchResult ? matchResult.rationale : newBookingData.allocationRationale
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bookings/emergency - 🚨 Instant 1-Click SOS Dispatch
router.post('/emergency', async (req, res) => {
  try {
    const {
      customerName = "Emergency Requester",
      customerPhone = "+91 98999 11111",
      emergencyType = "Water Leakage", // or Short Circuit, Gas Leak, Lockout
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

    const allWorkers = await DataStore.getWorkers();
    const allCoops = await DataStore.getCooperatives();

    const emergencyBooking = {
      serviceCategory: trade,
      subTrade,
      urgency: 'EMERGENCY',
      address,
      type: 'EMERGENCY'
    };

    const matchResult = matchWorkerToBooking(emergencyBooking, allWorkers, allCoops);
    const assignedWorker = matchResult.selectedWorker;
    const coop = allCoops.find(c => c._id === assignedWorker?.cooperativeId) || allCoops[0];

    const split = calculatePaymentSplit(basePrice, coop?.splitConfig);

    const created = await DataStore.createBooking({
      customerName,
      customerPhone,
      serviceCategory: trade,
      subTrade,
      type: 'EMERGENCY',
      urgency: 'EMERGENCY',
      address,
      cooperativeId: coop?._id,
      cooperativeName: coop?.name,
      assignedWorkerId: assignedWorker?._id,
      workerName: assignedWorker?.name,
      workerPhone: assignedWorker?.phone,
      status: 'ALLOCATED',
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
      allocationRationale: `🚨 EMERGENCY DISPATCH: ${matchResult.rationale}`,
      etaMinutes: Math.min(12, matchResult.etaMinutes || 10),
      emergencyTriggerReason: notes
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

// PUT /api/bookings/:id/status - Update Booking Status
router.put('/:id/status', async (req, res) => {
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
    }

    const updated = await DataStore.updateBooking(req.params.id, updates);
    res.json({ success: true, data: updated });
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

    const split = booking.paymentBreakdown;

    // 1. Mark booking as PAID
    const updatedBooking = await DataStore.updateBooking(req.params.id, {
      paymentStatus: 'PAID',
      paymentMethod,
      status: 'COMPLETED',
      completedAt: new Date().toISOString()
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
      workerName: `Plan Approved by Customer — Allocating ${booking.teamSize || 4} Shramiks`
    });

    res.json({ success: true, data: updated, booking: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
