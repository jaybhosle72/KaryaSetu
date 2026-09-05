const mongoose = require('mongoose');
const { getDBMode, getInMemoryStore } = require('../config/db');
const Cooperative = require('../models/Cooperative');
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const InstitutionalContract = require('../models/InstitutionalContract');
const DemandForecast = require('../models/DemandForecast');
const WelfareClaim = require('../models/WelfareClaim');
const Dispute = require('../models/Dispute');
const User = require('../models/User');
const Contractor = require('../models/Contractor');
const {
  seedCooperatives,
  seedWorkers,
  seedContracts,
  seedForecasts,
  seedBookings,
  seedWelfareLedger,
  seedContractors
} = require('../data/seedData');

const seedDisputes = [
  {
    _id: "dsp_001",
    bookingId: "bk_1001",
    customerName: "Aditya Deshpande",
    customerPhone: "+91 98900 11223",
    workerId: "wrk_101",
    workerName: "Santosh Baburao Kadam",
    cooperativeId: "coop_pune_elec",
    cooperativeName: "Pune Electrical Sahakari",
    serviceCategory: "Electrical",
    issueType: "QUALITY_OF_WORK",
    description: "Switchgear MCB replacement was prompt, but customer requested additional clarification on the surge warranty certificate.",
    status: "RESOLVED",
    resolution: "Cooperative Technical Inspector verified the IS-732 certificate and provided formal 1-year cooperative warranty letter.",
    resolvedAt: "2026-08-31T14:00:00.000Z",
    date: "2026-08-30"
  },
  {
    _id: "dsp_002",
    bookingId: "bk_1002",
    customerName: "Rohit Sharma",
    customerPhone: "+91 97654 32109",
    workerId: "wrk_102",
    workerName: "Pravin Maruti Jadhav",
    cooperativeId: "coop_pune_plumb",
    cooperativeName: "Maha Jal Sahakari",
    serviceCategory: "Plumbing",
    issueType: "TIMELINESS_DELAY",
    description: "Heavy rain caused 5-minute traffic delay during emergency pipeline transit.",
    status: "UNDER_MEDIATION",
    resolution: "Cooperative coordinator contacted customer in real-time and waived emergency transit surcharge.",
    date: "2026-09-01"
  }
];

// Initialize in-memory store with deep copy of seed data
const store = getInMemoryStore();
store.cooperatives = JSON.parse(JSON.stringify(seedCooperatives));
store.workers = JSON.parse(JSON.stringify(seedWorkers));
store.contracts = JSON.parse(JSON.stringify(seedContracts));
store.forecasts = JSON.parse(JSON.stringify(seedForecasts));
store.bookings = JSON.parse(JSON.stringify(seedBookings));
store.welfareLedger = JSON.parse(JSON.stringify(seedWelfareLedger));
store.disputes = JSON.parse(JSON.stringify(seedDisputes));
store.contractors = JSON.parse(JSON.stringify(seedContractors));
store.users = [];

// Seed initial system users mapped to workers, contractors, and cooperatives
const initialSeedUsers = [
  {
    _id: 'usr_cust_01',
    name: 'Aakash Deshmukh',
    phone: '+91 98220 11223',
    role: 'customer',
    address: 'Flat 402, Mayur Residency, Kothrud, Pune 411038'
  },
  ...seedWorkers.map(w => ({
    _id: `usr_${w._id}`,
    name: w.name,
    phone: w.phone,
    role: 'worker',
    workerId: w._id,
    cooperativeId: w.cooperativeId,
    cooperativeName: w.cooperativeName,
    metadata: { trade: w.trade, skills: w.verifiedSkills }
  })),
  ...seedContractors.map(c => ({
    _id: `usr_${c._id}`,
    name: c.name,
    phone: c.phone,
    role: 'contractor',
    contractorId: c._id,
    cooperativeId: c.cooperativeId,
    cooperativeName: c.cooperativeName,
    metadata: { license: c.licenseNumber, trades: c.tradesManaged }
  })),
  {
    _id: 'usr_admin_01',
    name: 'Suresh Patil',
    phone: '+91 98220 99887',
    role: 'admin',
    cooperativeId: 'coop_pune_multi',
    cooperativeName: 'Brihan-Maharashtra Multi-Trade Labour Cooperative'
  }
];
store.users = JSON.parse(JSON.stringify(initialSeedUsers));

async function seedMongoIfEmpty() {
  if (getDBMode() === 'mongodb') {
    try {
      const coopCount = await Cooperative.countDocuments();
      if (coopCount === 0) {
        console.log('🌱 Seeding initial records into MongoDB...');
        await Cooperative.insertMany(seedCooperatives);
        await Worker.insertMany(seedWorkers);
        await InstitutionalContract.insertMany(seedContracts);
        await DemandForecast.insertMany(seedForecasts);
        await Booking.insertMany(seedBookings);
        await WelfareClaim.insertMany(seedWelfareLedger);
      }

      const contractorCount = await Contractor.countDocuments();
      if (contractorCount === 0) {
        await Contractor.insertMany(seedContractors);
        console.log('🌱 Seeded contractors into MongoDB.');
      }

      const userCount = await User.countDocuments();
      if (userCount === 0) {
        await User.insertMany(initialSeedUsers);
        console.log('🌱 Seeded initial users into MongoDB.');
      }

      const disputeCount = await Dispute.countDocuments();
      if (disputeCount === 0) {
        await Dispute.insertMany(seedDisputes);
        console.log('🌱 Seeded initial disputes into MongoDB.');
      }
    } catch (e) {
      console.warn('Seed error on MongoDB:', e.message);
    }
  }
}

// Universal collection accessors
const DataStore = {
  // Users (Authentication & Profile)
  async getUsers(filter = {}) {
    if (getDBMode() === 'mongodb') {
      const q = {};
      if (filter.role) q.role = filter.role;
      return await User.find(q);
    }
    return store.users.filter(u => {
      if (filter.role && u.role !== filter.role) return false;
      return true;
    });
  },

  async getUserByPhone(phone, role = null) {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (!digits) return null;
    const regexPattern = digits.split('').join('\\D*');

    if (getDBMode() === 'mongodb') {
      const q = { phone: { $regex: regexPattern } };
      if (role) q.role = role;
      return await User.findOne(q);
    }
    return store.users.find(u => {
      const uDigits = (u.phone || '').replace(/\D/g, '').slice(-10);
      if (uDigits !== digits) return false;
      if (role && u.role !== role) return false;
      return true;
    });
  },

  async getUserById(id) {
    if (getDBMode() === 'mongodb') return await User.findOne({ $or: [{ _id: id }, { id }] });
    return store.users.find(u => u._id === id || u.id === id);
  },

  async createUser(userData) {
    const doc = {
      _id: `usr_${Date.now()}`,
      ...userData
    };
    if (getDBMode() === 'mongodb') {
      const created = new User(doc);
      return await created.save();
    }
    store.users.unshift(doc);
    return doc;
  },

  async updateUser(id, updates) {
    if (getDBMode() === 'mongodb') return await User.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, updates, { new: true });
    const idx = store.users.findIndex(u => u._id === id || u.id === id);
    if (idx !== -1) {
      store.users[idx] = { ...store.users[idx], ...updates };
      return store.users[idx];
    }
    return null;
  },

  // Cooperatives
  async getCooperatives() {
    if (getDBMode() === 'mongodb') return await Cooperative.find();
    return store.cooperatives;
  },
  async getCooperativeById(id) {
    if (getDBMode() === 'mongodb') return await Cooperative.findOne({ $or: [{ _id: id }, { id }] });
    return store.cooperatives.find(c => c._id === id || c.id === id);
  },
  async updateCooperative(id, updates) {
    if (getDBMode() === 'mongodb') return await Cooperative.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, updates, { new: true });
    const idx = store.cooperatives.findIndex(c => c._id === id || c.id === id);
    if (idx !== -1) {
      store.cooperatives[idx] = { ...store.cooperatives[idx], ...updates };
      return store.cooperatives[idx];
    }
    return null;
  },

  // Workers
  async getWorkers(filter = {}) {
    if (getDBMode() === 'mongodb') {
      const q = {};
      if (filter.cooperativeId) q.cooperativeId = filter.cooperativeId;
      if (filter.trade) q.trade = { $regex: new RegExp(filter.trade, 'i') };
      if (filter.status) q.status = filter.status;
      return await Worker.find(q);
    }
    return store.workers.filter(w => {
      if (filter.cooperativeId && w.cooperativeId !== filter.cooperativeId) return false;
      if (filter.trade && !w.trade.toLowerCase().includes(filter.trade.toLowerCase())) return false;
      if (filter.status && w.status !== filter.status) return false;
      return true;
    });
  },
  async getWorkerById(id) {
    if (getDBMode() === 'mongodb') return await Worker.findOne({ $or: [{ _id: id }, { id }] });
    return store.workers.find(w => w._id === id || w.id === id);
  },
  async updateWorker(id, updates) {
    if (getDBMode() === 'mongodb') return await Worker.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, updates, { new: true });
    const idx = store.workers.findIndex(w => w._id === id || w.id === id);
    if (idx !== -1) {
      store.workers[idx] = { ...store.workers[idx], ...updates };
      return store.workers[idx];
    }
    return null;
  },
  async createWorker(workerData) {
    const doc = {
      _id: `wrk_${Date.now()}`,
      rating: 4.9,
      customerRating: 4.88,
      reliabilityScore: 98,
      experienceYears: workerData.experienceYears || 3,
      completedJobs: 0,
      totalEarnings: 0,
      currentWorkload: 0,
      maxDailyCapacity: 4,
      status: 'AVAILABLE',
      isEmergencyDuty: false,
      verifiedSkills: [{
        name: `${workerData.trade || 'Certified'} Professional`,
        issuer: workerData.cooperativeName || 'Maharashtra Labour Cooperative',
        verifiedDate: new Date().toISOString().split('T')[0]
      }],
      welfareDetails: {
        pmjayCardNumber: `PMJAY-MH-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        accidentalInsuranceActive: true,
        insuranceCoverageAmount: 500000,
        welfareContributionBalance: 0,
        pensionCreditTier: 'Silver Tier'
      },
      ...workerData
    };
    if (getDBMode() === 'mongodb') {
      const created = new Worker(doc);
      return await created.save();
    }
    store.workers.unshift(doc);
    return doc;
  },

  // Bookings
  async getBookings(filter = {}) {
    if (getDBMode() === 'mongodb') {
      const q = {};
      if (filter.status) q.status = filter.status;
      if (filter.assignedWorkerId) q.assignedWorkerId = filter.assignedWorkerId;
      if (filter.contractorId) q.contractorId = filter.contractorId;
      if (filter.bookingMode) q.bookingMode = filter.bookingMode;
      return await Booking.find(q).sort({ createdAt: -1 });
    }
    return [...store.bookings]
      .filter(b => {
        if (filter.status && b.status !== filter.status) return false;
        if (filter.assignedWorkerId && b.assignedWorkerId !== filter.assignedWorkerId) return false;
        if (filter.contractorId && b.contractorId !== filter.contractorId) return false;
        if (filter.bookingMode && b.bookingMode !== filter.bookingMode) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getBookingById(id) {
    if (getDBMode() === 'mongodb') return await Booking.findOne({ $or: [{ _id: id }, { id }] });
    return store.bookings.find(b => b._id === id || b.id === id);
  },

  async createBooking(bookingData) {
    const doc = {
      _id: `bk_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...bookingData
    };
    if (getDBMode() === 'mongodb') {
      const created = new Booking(doc);
      return await created.save();
    }
    store.bookings.unshift(doc);
    return doc;
  },

  async updateBooking(id, updates) {
    if (getDBMode() === 'mongodb') return await Booking.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, updates, { new: true });
    const idx = store.bookings.findIndex(b => b._id === id || b.id === id);
    if (idx !== -1) {
      store.bookings[idx] = { ...store.bookings[idx], ...updates };
      return store.bookings[idx];
    }
    return null;
  },

  // Atomic Worker Acceptance
  async acceptBooking(bookingId, workerId) {
    const worker = await this.getWorkerById(workerId);
    if (!worker) throw new Error(`Worker with ID ${workerId} not found`);

    if (getDBMode() === 'mongodb') {
      const idMatch = { $or: [{ _id: String(bookingId) }, { id: String(bookingId) }] };

      // Check if already allocated to this worker
      const existing = await Booking.findOne(idMatch);
      if (existing && existing.assignedWorkerId && String(existing.assignedWorkerId) === String(worker._id)) {
        if (existing.status === 'MATCHING') {
          existing.status = 'ALLOCATED';
          await existing.save();
        }
        return existing;
      }

      // Atomic find & update: accept if status is MATCHING (unassigned) or already allocated to worker
      const updatedBooking = await Booking.findOneAndUpdate(
        {
          $and: [
            idMatch,
            {
              $or: [
                { status: 'MATCHING', assignedWorkerId: null },
                { status: 'MATCHING', assignedWorkerId: { $exists: false } },
                { status: 'MATCHING', assignedWorkerId: '' },
                { assignedWorkerId: worker._id }
              ]
            }
          ]
        },
        {
          assignedWorkerId: worker._id,
          workerName: worker.name,
          workerPhone: worker.phone,
          cooperativeId: worker.cooperativeId || undefined,
          cooperativeName: worker.cooperativeName || undefined,
          status: 'ALLOCATED',
          etaMinutes: 15,
          allocationRationale: `Accepted in real-time by verified ${worker.trade} shramik ${worker.name} (${worker.cooperativeName}).`
        },
        { new: true }
      );

      if (!updatedBooking) {
        throw new Error('Job is no longer available or has already been accepted by another worker.');
      }

      await Worker.findOneAndUpdate(
        { $or: [{ _id: worker._id }, { id: worker._id }] },
        { status: 'ON_DUTY', $inc: { currentWorkload: 1 } }
      );

      return updatedBooking;
    }

    // In-memory atomic check
    const existingMem = store.bookings.find(b => (b._id === bookingId || b.id === bookingId));
    if (existingMem && existingMem.assignedWorkerId === worker._id) {
      existingMem.status = 'ALLOCATED';
      return existingMem;
    }

    const bookingIdx = store.bookings.findIndex(b => (b._id === bookingId || b.id === bookingId) && (b.status === 'MATCHING' && (!b.assignedWorkerId || b.assignedWorkerId === worker._id)));
    if (bookingIdx === -1) {
      throw new Error('Job is no longer available or has already been accepted by another worker.');
    }

    store.bookings[bookingIdx] = {
      ...store.bookings[bookingIdx],
      assignedWorkerId: worker._id,
      workerName: worker.name,
      workerPhone: worker.phone,
      cooperativeId: worker.cooperativeId || store.bookings[bookingIdx].cooperativeId,
      cooperativeName: worker.cooperativeName || store.bookings[bookingIdx].cooperativeName,
      status: 'ALLOCATED',
      etaMinutes: 15,
      allocationRationale: `Accepted in real-time by verified ${worker.trade} shramik ${worker.name} (${worker.cooperativeName}).`
    };

    const wIdx = store.workers.findIndex(w => w._id === worker._id);
    if (wIdx !== -1) {
      store.workers[wIdx].status = 'ON_DUTY';
      store.workers[wIdx].currentWorkload = (store.workers[wIdx].currentWorkload || 0) + 1;
    }

    return store.bookings[bookingIdx];
  },

  // Clear demo / mock bookings for clean testing
  async clearAllBookings() {
    if (getDBMode() === 'mongodb') {
      await Booking.deleteMany({});
    }
    store.bookings = [];
    return { success: true, message: 'All bookings cleared successfully. Ready for clean real-user workflow.' };
  },

  // Institutional Contracts
  async getContracts() {
    if (getDBMode() === 'mongodb') return await InstitutionalContract.find().sort({ createdAt: -1 });
    return store.contracts;
  },
  async createContract(contractData) {
    const doc = {
      _id: `ct_rwa_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      ...contractData
    };
    if (getDBMode() === 'mongodb') {
      const created = new InstitutionalContract(doc);
      return await created.save();
    }
    store.contracts.unshift(doc);
    return doc;
  },

  // Forecasts
  async getForecasts() {
    if (getDBMode() === 'mongodb') return await DemandForecast.find();
    return store.forecasts;
  },

  // Welfare Ledger
  async getWelfareLedger() {
    if (getDBMode() === 'mongodb') return await WelfareClaim.find().sort({ date: -1 });
    return store.welfareLedger;
  },
  async createWelfareClaim(claimData) {
    const doc = {
      _id: `wlf_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'DISBURSED',
      ...claimData
    };
    if (getDBMode() === 'mongodb') {
      const created = new WelfareClaim(doc);
      return await created.save();
    }
    store.welfareLedger.unshift(doc);
    return doc;
  },

  // Disputes & Grievance Redressal
  async getDisputes(filter = {}) {
    if (getDBMode() === 'mongodb') {
      const q = {};
      if (filter.cooperativeId) q.cooperativeId = filter.cooperativeId;
      return await Dispute.find(q).sort({ createdAt: -1 });
    }
    return store.disputes.filter(d => {
      if (filter.cooperativeId && d.cooperativeId !== filter.cooperativeId) return false;
      return true;
    });
  },
  async createDispute(disputeData) {
    const doc = {
      _id: `dsp_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'UNDER_MEDIATION',
      ...disputeData
    };
    if (getDBMode() === 'mongodb') {
      const created = new Dispute(doc);
      return await created.save();
    }
    store.disputes.unshift(doc);
    return doc;
  },
  async updateDispute(id, updates) {
    if (getDBMode() === 'mongodb') return await Dispute.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, updates, { new: true });
    const idx = store.disputes.findIndex(d => d._id === id || d.id === id);
    if (idx !== -1) {
      store.disputes[idx] = { ...store.disputes[idx], ...updates };
      return store.disputes[idx];
    }
    return null;
  },

  // Contractors & Mukaddam
  async getContractors(filter = {}) {
    if (getDBMode() === 'mongodb') {
      const q = {};
      if (filter.cooperativeId) q.cooperativeId = filter.cooperativeId;
      return await Contractor.find(q);
    }
    return (store.contractors || []).filter(c => {
      if (filter.cooperativeId && c.cooperativeId !== filter.cooperativeId) return false;
      return true;
    });
  },

  async getContractorById(id) {
    if (getDBMode() === 'mongodb') return await Contractor.findOne({ $or: [{ _id: id }, { id }] });
    return (store.contractors || []).find(c => c._id === id || c.id === id);
  },

  async createContractor(contractorData) {
    const doc = {
      _id: `cnt_${Date.now()}`,
      rating: 4.88,
      completedContracts: 0,
      workerIds: [],
      communitySize: 0,
      ...contractorData
    };
    if (getDBMode() === 'mongodb') {
      const created = new Contractor(doc);
      return await created.save();
    }
    store.contractors.unshift(doc);
    return doc;
  },

  async updateContractor(id, updates) {
    if (getDBMode() === 'mongodb') return await Contractor.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, updates, { new: true });
    const idx = store.contractors.findIndex(c => c._id === id || c.id === id);
    if (idx !== -1) {
      store.contractors[idx] = { ...store.contractors[idx], ...updates };
      return store.contractors[idx];
    }
    return null;
  },

  async allocateWorkersToTeamBooking(bookingId, workerIds) {
    if (getDBMode() === 'mongodb') {
      const assignedWorkers = await Worker.find({ _id: { $in: workerIds } });
      const workerNames = assignedWorkers.map(w => w.name).join(', ');
      const updated = await Booking.findOneAndUpdate(
        { $or: [{ _id: bookingId }, { id: bookingId }] },
        {
          assignedWorkerIds: workerIds,
          teamSize: workerIds.length,
          status: 'ALLOCATED',
          assignedWorkerId: workerIds[0],
          workerName: workerNames || `${workerIds.length} Verified Shramiks`,
          allocationRationale: `Contractor allocated ${workerIds.length} verified shramiks from cooperative community.`
        },
        { new: true }
      );
      await Worker.updateMany({ _id: { $in: workerIds } }, { status: 'ON_DUTY', $inc: { currentWorkload: 1 } });
      return updated;
    }

    const bookingIdx = store.bookings.findIndex(b => b._id === bookingId || b.id === bookingId);
    if (bookingIdx === -1) return null;
    
    const assignedWorkers = (store.workers || []).filter(w => workerIds.includes(w._id));
    store.bookings[bookingIdx].assignedWorkerIds = workerIds;
    store.bookings[bookingIdx].teamSize = workerIds.length;
    store.bookings[bookingIdx].status = 'ALLOCATED';
    store.bookings[bookingIdx].assignedWorkerId = workerIds[0];
    store.bookings[bookingIdx].workerName = assignedWorkers.map(w => w.name).join(', ');
    store.bookings[bookingIdx].allocationRationale = `Contractor allocated ${workerIds.length} verified shramiks from cooperative community.`;
    
    workerIds.forEach(wId => {
      const wIdx = store.workers.findIndex(w => w._id === wId);
      if (wIdx !== -1) {
        store.workers[wIdx].status = 'ON_DUTY';
        store.workers[wIdx].currentWorkload = (store.workers[wIdx].currentWorkload || 0) + 1;
      }
    });
    
    return store.bookings[bookingIdx];
  },

  async addWorkerToContractorCommunity(contractorId, workerId) {
    if (getDBMode() === 'mongodb') {
      const contractor = await Contractor.findOne({ $or: [{ _id: contractorId }, { id: contractorId }] });
      if (contractor) {
        if (!contractor.workerIds.includes(workerId)) {
          contractor.workerIds.push(workerId);
          contractor.communitySize = contractor.workerIds.length;
          await contractor.save();
        }
        return contractor;
      }
      return null;
    }

    const cIdx = (store.contractors || []).findIndex(c => c._id === contractorId);
    if (cIdx !== -1) {
      if (!store.contractors[cIdx].workerIds.includes(workerId)) {
        store.contractors[cIdx].workerIds.push(workerId);
        store.contractors[cIdx].communitySize = store.contractors[cIdx].workerIds.length;
      }
      return store.contractors[cIdx];
    }
    return null;
  },

  // Reset demo
  async resetDemoData() {
    store.cooperatives = JSON.parse(JSON.stringify(seedCooperatives));
    store.workers = JSON.parse(JSON.stringify(seedWorkers));
    store.contracts = JSON.parse(JSON.stringify(seedContracts));
    store.forecasts = JSON.parse(JSON.stringify(seedForecasts));
    store.bookings = JSON.parse(JSON.stringify(seedBookings));
    store.welfareLedger = JSON.parse(JSON.stringify(seedWelfareLedger));
    store.disputes = JSON.parse(JSON.stringify(seedDisputes));
    store.contractors = JSON.parse(JSON.stringify(seedContractors));
    store.users = JSON.parse(JSON.stringify(initialSeedUsers));
    
    if (getDBMode() === 'mongodb') {
      await Cooperative.deleteMany({});
      await Worker.deleteMany({});
      await InstitutionalContract.deleteMany({});
      await DemandForecast.deleteMany({});
      await Booking.deleteMany({});
      await WelfareClaim.deleteMany({});
      await Dispute.deleteMany({});
      await Contractor.deleteMany({});
      await User.deleteMany({});

      await Cooperative.insertMany(seedCooperatives);
      await Worker.insertMany(seedWorkers);
      await InstitutionalContract.insertMany(seedContracts);
      await DemandForecast.insertMany(seedForecasts);
      await Booking.insertMany(seedBookings);
      await WelfareClaim.insertMany(seedWelfareLedger);
      await Dispute.insertMany(seedDisputes);
      await Contractor.insertMany(seedContractors);
      await User.insertMany(initialSeedUsers);
    }
    return { message: 'Demo data reset successfully.' };
  }
};

module.exports = {
  DataStore,
  seedMongoIfEmpty
};
