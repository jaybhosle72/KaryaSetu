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

const seedDisputes = [];
const { resolveCanonicalTrade, isTradeMatch } = require('../utils/tradeResolver');

// Initialize in-memory store with clean empty arrays (no demo/mock records)
const store = getInMemoryStore();
store.cooperatives = [];
store.workers = [];
store.contracts = [];
store.forecasts = [];
store.bookings = [];
store.welfareLedger = [];
store.disputes = [];
store.contractors = [];
store.users = [];

const initialSeedUsers = [];

async function seedMongoIfEmpty() {
  if (getDBMode() === 'mongodb') {
    try {
      // Only purge if explicitly configured via environment variable
      if (process.env.RESET_DB_ON_START === 'true') {
        await Booking.deleteMany({});
        await Worker.deleteMany({});
        await Contractor.deleteMany({});
        await User.deleteMany({});
        await InstitutionalContract.deleteMany({});
        await WelfareClaim.deleteMany({});
        await Dispute.deleteMany({});
        await DemandForecast.deleteMany({});
        await Cooperative.deleteMany({});
        console.log('🧹 Database reset requested: Initialized to 100% empty state.');
      } else {
        console.log('📦 Database ready: Preserving existing users, cooperatives, and records.');
      }
    } catch (e) {
      console.warn('Cleanup error on MongoDB:', e.message);
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

  getUserRoleFilter(role) {
    if (!role) return null;
    if (role === 'hub_coordinator' || role === 'contractor') return ['hub_coordinator', 'contractor'];
    if (role === 'federation_admin' || role === 'admin' || role === 'cooperative' || role === 'federation') {
      return ['federation_admin', 'admin', 'cooperative', 'federation'];
    }
    return [role];
  },

  async getUserByPhone(phone, role = null) {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (!digits) return null;
    const regexPattern = digits.split('').join('\\D*');
    const roleList = this.getUserRoleFilter(role);

    if (getDBMode() === 'mongodb') {
      const q = { phone: { $regex: regexPattern } };
      if (roleList) q.role = { $in: roleList };
      return await User.findOne(q);
    }
    return store.users.find(u => {
      const uDigits = (u.phone || '').replace(/\D/g, '').slice(-10);
      if (uDigits !== digits) return false;
      if (roleList && !roleList.includes(u.role)) return false;
      return true;
    });
  },

  async getUserByUsername(username, role = null) {
    if (!username) return null;
    const cleanUsername = String(username).trim().toLowerCase();
    if (!cleanUsername) return null;
    const roleList = this.getUserRoleFilter(role);

    if (getDBMode() === 'mongodb') {
      const q = { username: cleanUsername };
      if (roleList) q.role = { $in: roleList };
      return await User.findOne(q);
    }
    return store.users.find(u => {
      if ((u.username || '').toLowerCase().trim() !== cleanUsername) return false;
      if (roleList && !roleList.includes(u.role)) return false;
      return true;
    });
  },

  async getUserByIdentifier(identifier, role = null) {
    if (!identifier) return null;
    const clean = String(identifier).trim();
    if (!clean) return null;

    // 1. Try finding by exact username
    const byUsername = await this.getUserByUsername(clean, role);
    if (byUsername) return byUsername;

    // 2. Try finding by phone number
    const byPhone = await this.getUserByPhone(clean, role);
    if (byPhone) return byPhone;

    return null;
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
    if (doc.username) {
      doc.username = String(doc.username).trim().toLowerCase();
    }
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
  async createCooperative(coopData = {}) {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const regNum = (coopData.regNumber && String(coopData.regNumber).trim()) || `MH/PNE/CS/LAB/${new Date().getFullYear()}/${randomSuffix}`;
    const doc = {
      _id: coopData._id || `coop_${timestamp}`,
      name: coopData.name || 'Labour Cooperative Society',
      shortName: coopData.shortName || coopData.name || 'Coop Society',
      district: coopData.district || 'Pune',
      state: coopData.state || 'Maharashtra',
      serviceCategories: coopData.serviceCategories || ['Electrical', 'Plumbing', 'Carpentry', 'Painting', 'Deep Cleaning'],
      totalWorkers: 0,
      activeWorkers: 0,
      rating: 5.0,
      welfareFundBalance: 0,
      totalJobsCompleted: 0,
      splitConfig: {
        workerShare: 80,
        coopShare: 10,
        welfareShare: 6,
        platformShare: 4
      },
      contact: {
        president: coopData.contact?.president || 'Cooperative Board President',
        secretary: coopData.contact?.secretary || 'Joint Registrar, Pune',
        phone: coopData.contact?.phone || '+91 98220 99887',
        email: coopData.contact?.email || 'board@sahakarseva.org'
      },
      ...coopData,
      regNumber: regNum
    };
    if (getDBMode() === 'mongodb') {
      const created = new Cooperative(doc);
      return await created.save();
    }
    store.cooperatives.unshift(doc);
    return doc;
  },

  _sanitizeWorker(w) {
    if (!w) return null;
    const worker = w.toObject ? w.toObject() : { ...w };
    if (worker.eshramRegistered === undefined) worker.eshramRegistered = true;
    if (!worker.eshramUan) {
      const phoneDigits = String(worker.phone || worker._id || '8921').replace(/\D/g, '');
      const last4 = (phoneDigits.slice(-4) || '8921').padStart(4, '0');
      worker.eshramUan = `12984567${last4}`;
    }
    if (!worker.welfareDetails) worker.welfareDetails = {};
    if (!worker.welfareDetails.eShramUAN) worker.welfareDetails.eShramUAN = worker.eshramUan;
    if (worker.welfareDetails.eshramRegistered === undefined) worker.welfareDetails.eshramRegistered = true;
    return worker;
  },

  // Workers
  async getWorkers(filter = {}) {
    let list = [];
    if (getDBMode() === 'mongodb') {
      const q = {};
      if (filter.cooperativeId) q.cooperativeId = filter.cooperativeId;
      if (filter.contractorId) q.contractorId = filter.contractorId;
      if (filter.trade) q.trade = { $regex: new RegExp(filter.trade, 'i') };
      if (filter.status) q.status = filter.status;
      list = await Worker.find(q);
    } else {
      list = store.workers.filter(w => {
        if (filter.cooperativeId && w.cooperativeId !== filter.cooperativeId) return false;
        if (filter.contractorId && w.contractorId !== filter.contractorId) return false;
        if (filter.trade && !w.trade.toLowerCase().includes(filter.trade.toLowerCase())) return false;
        if (filter.status && w.status !== filter.status) return false;
        return true;
      });
    }
    return list.map(w => this._sanitizeWorker(w));
  },
  async getWorkerById(id) {
    let worker = null;
    if (getDBMode() === 'mongodb') {
      worker = await Worker.findOne({ $or: [{ _id: id }, { id }] });
    } else {
      worker = store.workers.find(w => w._id === id || w.id === id);
    }
    return this._sanitizeWorker(worker);
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
    const phoneDigits = String(workerData.phone || '8921').replace(/\D/g, '');
    const last4 = (phoneDigits.slice(-4) || '8921').padStart(4, '0');
    const uan = workerData.eshramUan || workerData.welfareDetails?.eShramUAN || `12984567${last4}`;
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
      eshramRegistered: typeof workerData.eshramRegistered === 'boolean' ? workerData.eshramRegistered : true,
      eshramUan: uan,
      verifiedSkills: [{
        name: `${workerData.trade || 'Certified'} Professional`,
        issuer: workerData.cooperativeName || 'Maharashtra Labour Cooperative',
        verifiedDate: new Date().toISOString().split('T')[0]
      }],
      welfareDetails: {
        pmjayCardNumber: `PMJAY-MH-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        eShramUAN: uan,
        eshramRegistered: typeof workerData.eshramRegistered === 'boolean' ? workerData.eshramRegistered : true,
        accidentalInsuranceActive: true,
        insuranceCoverageAmount: 500000,
        welfareContributionBalance: 0,
        pensionCreditTier: 'Silver Tier',
        ...(workerData.welfareDetails || {})
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
    const canonicalTrade = bookingData.trade || resolveCanonicalTrade(bookingData);
    const doc = {
      _id: `bk_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...bookingData,
      trade: canonicalTrade
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

    // Enforce strict trade validation
    const targetBooking = await this.getBookingById(bookingId);
    if (!targetBooking) {
      throw new Error('Job is no longer available or has already been removed.');
    }

    const targetTrade = targetBooking.trade || resolveCanonicalTrade(targetBooking);
    if (!isTradeMatch(worker.trade, targetBooking, worker.subTrades)) {
      throw new Error(`Trade mismatch: This service request requires a certified ${targetTrade} specialist, but worker ${worker.name} is certified in ${worker.trade || 'a different trade'}.`);
    }

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
    const booking = await this.getBookingById(bookingId);
    if (!booking) return null;

    // Verify all allocated workers belong to this contractor's committee if contractorId specified
    if (booking.contractorId) {
      const contractor = await this.getContractorById(booking.contractorId);
      if (contractor) {
        for (const wId of workerIds) {
          const w = await this.getWorkerById(wId);
          if (w && w.contractorId && String(w.contractorId) !== String(contractor._id) && String(w.contractorId) !== String(contractor.id)) {
            throw new Error(`Cannot allocate worker "${w.name}": Worker is exclusively affiliated with contractor "${w.contractorName || w.contractorId}".`);
          }
        }
      }
    }

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
          allocationRationale: `Contractor allocated ${workerIds.length} verified shramiks from exclusive committee.`
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
    store.bookings[bookingIdx].allocationRationale = `Contractor allocated ${workerIds.length} verified shramiks from exclusive committee.`;
    
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
    const contractor = await this.getContractorById(contractorId);
    if (!contractor) {
      throw new Error(`Contractor with ID "${contractorId}" not found.`);
    }

    const worker = await this.getWorkerById(workerId);
    if (!worker) {
      throw new Error(`Worker with ID "${workerId}" not found.`);
    }

    // Strict 1-to-1 Affiliation Exclusivity Check
    const existingContractorId = worker.contractorId;
    if (existingContractorId && String(existingContractorId) !== String(contractor._id) && String(existingContractorId) !== String(contractor.id)) {
      const currentContractor = await this.getContractorById(existingContractorId);
      const name = currentContractor ? currentContractor.name : (worker.contractorName || existingContractorId);
      throw new Error(`Affiliation conflict: Worker "${worker.name}" is already affiliated with contractor "${name}". A worker can only be affiliated with one contractor at a time.`);
    }

    if (getDBMode() === 'mongodb') {
      // Update worker with contractor affiliation
      await Worker.findOneAndUpdate(
        { $or: [{ _id: worker._id }, { id: worker._id }] },
        { contractorId: contractor._id, contractorName: contractor.name }
      );

      // Add worker to contractor's workerIds array if not already present
      if (!contractor.workerIds.includes(worker._id)) {
        contractor.workerIds.push(worker._id);
        contractor.communitySize = contractor.workerIds.length;
        await contractor.save();
      }

      // Ensure no other contractor's workerIds retains this worker
      await Contractor.updateMany(
        { _id: { $ne: contractor._id }, workerIds: worker._id },
        { $pull: { workerIds: worker._id } }
      );

      return contractor;
    }

    // In-memory store
    const wIdx = store.workers.findIndex(w => w._id === worker._id);
    if (wIdx !== -1) {
      store.workers[wIdx].contractorId = contractor._id;
      store.workers[wIdx].contractorName = contractor.name;
    }

    // Pull worker from any other contractor in-memory
    (store.contractors || []).forEach(c => {
      if (c._id !== contractor._id && Array.isArray(c.workerIds)) {
        c.workerIds = c.workerIds.filter(id => id !== worker._id);
        c.communitySize = c.workerIds.length;
      }
    });

    const cIdx = (store.contractors || []).findIndex(c => c._id === contractorId);
    if (cIdx !== -1) {
      if (!store.contractors[cIdx].workerIds.includes(worker._id)) {
        store.contractors[cIdx].workerIds.push(worker._id);
        store.contractors[cIdx].communitySize = store.contractors[cIdx].workerIds.length;
      }
      return store.contractors[cIdx];
    }
    return null;
  },

  async removeWorkerFromContractorCommunity(contractorId, workerId) {
    const contractor = await this.getContractorById(contractorId);
    if (!contractor) {
      throw new Error(`Contractor with ID "${contractorId}" not found.`);
    }

    const worker = await this.getWorkerById(workerId);

    if (getDBMode() === 'mongodb') {
      if (worker) {
        await Worker.findOneAndUpdate(
          { $or: [{ _id: worker._id }, { id: worker._id }] },
          { contractorId: null, contractorName: null }
        );
      }

      contractor.workerIds = (contractor.workerIds || []).filter(id => String(id) !== String(workerId));
      contractor.communitySize = contractor.workerIds.length;
      await contractor.save();
      return contractor;
    }

    // In-memory store
    if (worker) {
      const wIdx = store.workers.findIndex(w => w._id === worker._id);
      if (wIdx !== -1) {
        store.workers[wIdx].contractorId = null;
        store.workers[wIdx].contractorName = null;
      }
    }

    const cIdx = (store.contractors || []).findIndex(c => c._id === contractorId);
    if (cIdx !== -1) {
      store.contractors[cIdx].workerIds = (store.contractors[cIdx].workerIds || []).filter(id => String(id) !== String(workerId));
      store.contractors[cIdx].communitySize = store.contractors[cIdx].workerIds.length;
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
