const express = require('express');
const router = express.Router();
const { DataStore } = require('../services/dataStore');

// POST /api/auth/register - Register a real user (Customer, Worker, Contractor, Admin)
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      role = 'customer',
      address,
      trade,
      subTrades,
      experienceYears,
      aadhaar,
      license,
      cooperativeId,
      cooperativeName,
      metadata = {}
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Full name and phone number are required.' });
    }

    const cleanPhone = phone.trim();

    // Check if user already registered with this phone and role
    const existing = await DataStore.getUserByPhone(cleanPhone, role);
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: `An account for phone ${cleanPhone} with role '${role}' already exists. Please log in.` 
      });
    }

    let linkedWorker = null;
    let linkedContractor = null;

    if (role === 'worker') {
      const allCoops = await DataStore.getCooperatives();
      const defaultCoop = allCoops[0] || { _id: 'coop_pune_multi', name: 'Brihan-Maharashtra Multi-Trade Labour Cooperative' };

      linkedWorker = await DataStore.createWorker({
        name,
        phone: cleanPhone,
        trade: trade || 'General Labour',
        subTrades: Array.isArray(subTrades) ? subTrades : (subTrades ? [subTrades] : [trade || 'General Labour']),
        experienceYears: Number(experienceYears) || 3,
        aadhaarNumber: aadhaar || `XXXX-XXXX-${cleanPhone.slice(-4)}`,
        cooperativeId: cooperativeId || defaultCoop._id,
        cooperativeName: cooperativeName || defaultCoop.name,
        status: 'AVAILABLE'
      });
    } else if (role === 'contractor') {
      const allCoops = await DataStore.getCooperatives();
      const defaultCoop = allCoops[0] || { _id: 'coop_pune_multi', name: 'Brihan-Maharashtra Multi-Trade Labour Cooperative' };

      const tradesList = Array.isArray(trade) ? trade : (typeof trade === 'string' ? trade.split(',').map(s => s.trim()) : ['General Civil & Labour']);

      linkedContractor = await DataStore.createContractor({
        name,
        phone: cleanPhone,
        licenseNumber: license || `LIC/CLRA/MH/${new Date().getFullYear()}/${cleanPhone.slice(-4)}`,
        tradesManaged: tradesList,
        cooperativeId: cooperativeId || defaultCoop._id,
        cooperativeName: cooperativeName || defaultCoop.name,
        aadhaarNumber: aadhaar || `XXXX-XXXX-${cleanPhone.slice(-4)}`
      });
    }

    const newUser = await DataStore.createUser({
      name,
      phone: cleanPhone,
      email: email || '',
      role,
      address: address || 'Pune, Maharashtra',
      cooperativeId: linkedWorker?.cooperativeId || linkedContractor?.cooperativeId || cooperativeId,
      cooperativeName: linkedWorker?.cooperativeName || linkedContractor?.cooperativeName || cooperativeName,
      workerId: linkedWorker?._id,
      contractorId: linkedContractor?._id,
      metadata: {
        ...metadata,
        trade: trade || linkedWorker?.trade,
        license: license || linkedContractor?.licenseNumber
      }
    });

    res.status(201).json({
      success: true,
      message: `Successfully registered as ${role.toUpperCase()}`,
      data: newUser,
      user: newUser,
      worker: linkedWorker,
      contractor: linkedContractor
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/login - Phone-based authentication lookup
router.post('/login', async (req, res) => {
  try {
    const { phone, role } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required.' });
    }

    const cleanPhone = phone.trim();
    const user = await DataStore.getUserByPhone(cleanPhone, role);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `No registered user found for phone "${cleanPhone}"${role ? ` with role "${role}"` : ''}. Please register first.`
      });
    }

    let worker = null;
    let contractor = null;

    if (user.workerId) {
      worker = await DataStore.getWorkerById(user.workerId);
    } else if (user.role === 'worker') {
      const workers = await DataStore.getWorkers();
      worker = workers.find(w => w.phone.replace(/[\s-]/g, '').includes(cleanPhone.slice(-10)));
    }

    if (user.contractorId) {
      contractor = await DataStore.getContractorById(user.contractorId);
    } else if (user.role === 'contractor') {
      const contractors = await DataStore.getContractors();
      contractor = contractors.find(c => c.phone.replace(/[\s-]/g, '').includes(cleanPhone.slice(-10)));
    }

    res.json({
      success: true,
      data: user,
      user,
      worker,
      contractor
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/users - List registered users
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    const users = await DataStore.getUsers({ role });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/me/:id - Get user by ID
router.get('/me/:id', async (req, res) => {
  try {
    const user = await DataStore.getUserById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    let worker = null;
    let contractor = null;
    if (user.workerId) worker = await DataStore.getWorkerById(user.workerId);
    if (user.contractorId) contractor = await DataStore.getContractorById(user.contractorId);

    res.json({ success: true, data: user, user, worker, contractor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
