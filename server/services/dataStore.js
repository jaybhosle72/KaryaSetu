const { getDBMode, getInMemoryStore } = require('../config/db');
const Cooperative = require('../models/Cooperative');
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const InstitutionalContract = require('../models/InstitutionalContract');
const DemandForecast = require('../models/DemandForecast');
const WelfareClaim = require('../models/WelfareClaim');
const Dispute = require('../models/Dispute');
const {
  seedCooperatives,
  seedWorkers,
  seedContracts,
  seedForecasts,
  seedBookings,
  seedWelfareLedger,
  seedContractors
} = require('../data/seedData');

const seedDisputes = [];

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
      if (filter.trade) q.trade = filter.trade;
      if (filter.status) q.status = filter.status;
      return await Worker.find(q);
    }
    return store.workers.filter(w => {
      if (filter.cooperativeId && w.cooperativeId !== filter.cooperativeId) return false;
      if (filter.trade && w.trade.toLowerCase() !== filter.trade.toLowerCase()) return false;
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
      reliabilityScore: 98,
      experienceYears: 5,
      completedJobsCount: 0,
      totalEarnings: 0,
      currentWorkload: 0,
      maxDailyCapacity: 3,
      status: 'AVAILABLE',
      isEmergencyDuty: false,
      verifiedSkills: [{
        name: `${workerData.primaryTrade || 'Multi-Trade'} Certified`,
        issuer: workerData.cooperativeName || 'Maharashtra Labour Cooperative',
        verifiedDate: new Date().toISOString().split('T')[0]
      }],
      kycStatus: {
        aadhaarVerified: true,
        policeClearance: true,
        eshramLinked: true,
        lastVerified: new Date().toISOString().split('T')[0]
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
  async getBookings() {
    if (getDBMode() === 'mongodb') return await Booking.find().sort({ createdAt: -1 });
    return [...store.bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

  // Contractor methods
  async getContractors() {
    return store.contractors || [];
  },
  async getContractorById(id) {
    return (store.contractors || []).find(c => c._id === id || c.id === id);
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
          workerName: workerNames,
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

  // Reset to initial seed
  async resetDemoData() {
    store.cooperatives = JSON.parse(JSON.stringify(seedCooperatives));
    store.workers = JSON.parse(JSON.stringify(seedWorkers));
    store.contracts = JSON.parse(JSON.stringify(seedContracts));
    store.forecasts = JSON.parse(JSON.stringify(seedForecasts));
    store.bookings = JSON.parse(JSON.stringify(seedBookings));
    store.welfareLedger = JSON.parse(JSON.stringify(seedWelfareLedger));
    store.disputes = JSON.parse(JSON.stringify(seedDisputes));
    
    if (getDBMode() === 'mongodb') {
      await Cooperative.deleteMany({});
      await Worker.deleteMany({});
      await InstitutionalContract.deleteMany({});
      await DemandForecast.deleteMany({});
      await Booking.deleteMany({});
      await WelfareClaim.deleteMany({});
      await Dispute.deleteMany({});
      await Cooperative.insertMany(seedCooperatives);
      await Worker.insertMany(seedWorkers);
      await InstitutionalContract.insertMany(seedContracts);
      await DemandForecast.insertMany(seedForecasts);
      await Booking.insertMany(seedBookings);
      await WelfareClaim.insertMany(seedWelfareLedger);
      await Dispute.insertMany(seedDisputes);
    }
    return { message: 'Demo data reset successfully.' };
  }
};

module.exports = {
  DataStore,
  seedMongoIfEmpty
};
