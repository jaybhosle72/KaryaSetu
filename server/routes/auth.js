const express = require('express');
const router = express.Router();
const { DataStore } = require('../services/dataStore');

// POST /api/auth/register - Register a real user (Customer, Worker, Contractor, Admin)
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      username,
      password,
      phone,
      email,
      role = 'customer',
      address,
      trade,
      subTrades,
      experienceYears,
      aadhaar,
      license,
      cooperativeId: inputCoopId,
      cooperativeName: inputCoopName,
      regNumber,
      metadata = {}
    } = req.body;

    let cooperativeId = inputCoopId;
    let cooperativeName = inputCoopName;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Full name and phone number are required.' });
    }

    const cleanPhone = phone.trim();

    // Check if user already registered with this phone and role
    const existing = await DataStore.getUserByPhone(cleanPhone, role);
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: `An account with phone ${cleanPhone} already exists for role '${role}'. Please log in.` 
      });
    }

    // Username validation and uniqueness check
    let cleanUsername = username ? String(username).trim().toLowerCase() : '';
    if (cleanUsername) {
      if (cleanUsername.length < 3) {
        return res.status(400).json({ success: false, error: 'Username must be at least 3 characters long.' });
      }
      const existingUserByUsername = await DataStore.getUserByUsername(cleanUsername);
      if (existingUserByUsername) {
        return res.status(409).json({ 
          success: false, 
          error: `Username "${cleanUsername}" is already taken. Please choose another username.` 
        });
      }
    } else {
      // Auto-generate a fallback clean username if omitted
      const namePrefix = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'user';
      cleanUsername = `${namePrefix}_${cleanPhone.slice(-4)}`;
    }

    // Password validation
    if (password && password.length < 4) {
      return res.status(400).json({ success: false, error: 'Password must be at least 4 characters long.' });
    }

    let linkedWorker = null;
    let linkedContractor = null;
    let adminRegNumber = (regNumber || '').trim();

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
    } else if (role === 'admin') {
      const coopName = (cooperativeName || '').trim() || `${name}'s District Labour Cooperative Federation`;
      
      const allCoops = await DataStore.getCooperatives();
      const existingCoop = allCoops.find(c => 
        (cooperativeId && (c._id === cooperativeId || c.id === cooperativeId)) ||
        (c.name && c.name.toLowerCase().trim() === coopName.toLowerCase().trim())
      );

      if (existingCoop) {
        cooperativeId = existingCoop._id || existingCoop.id;
        cooperativeName = existingCoop.name;
        adminRegNumber = existingCoop.regNumber || adminRegNumber;
        try {
          await DataStore.updateCooperative(cooperativeId, {
            contact: {
              ...(existingCoop.contact || {}),
              president: name,
              phone: cleanPhone
            }
          });
        } catch (updateErr) {
          console.warn('Could not update cooperative contact:', updateErr.message);
        }
      } else {
        const defaultId = coopName === 'Brihan-Maharashtra Multi-Trade Labour Cooperative' ? 'coop_pune_multi' : `coop_${Date.now()}`;
        if (!adminRegNumber) {
          adminRegNumber = `MH/PNE/CS/LAB/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
        }
        
        const createdCoop = await DataStore.createCooperative({
          _id: cooperativeId || defaultId,
          name: coopName,
          shortName: coopName.length > 30 ? coopName.split(' ').slice(0, 3).join(' ') : coopName,
          regNumber: adminRegNumber,
          district: 'Pune',
          state: 'Maharashtra',
          serviceCategories: ['Electrical', 'Plumbing', 'Carpentry', 'Painting', 'Deep Cleaning', 'Civil & Masonry'],
          totalWorkers: 0,
          activeWorkers: 0,
          welfareFundBalance: 0,
          totalJobsCompleted: 0,
          contact: {
            president: name,
            secretary: 'Joint Registrar, Pune',
            phone: cleanPhone,
            email: email || `${cleanPhone}@sahakarseva.org`
          }
        });
        cooperativeId = createdCoop._id;
        cooperativeName = createdCoop.name;
      }
    }

    const newUser = await DataStore.createUser({
      name,
      username: cleanUsername,
      password: password ? String(password).trim() : undefined,
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
        username: cleanUsername,
        trade: trade || linkedWorker?.trade,
        license: license || linkedContractor?.licenseNumber,
        regNumber: adminRegNumber || undefined
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

// POST /api/auth/login - Username/Phone & Password authentication
router.post('/login', async (req, res) => {
  try {
    const { identifier, phone, username, password, role } = req.body;
    const loginId = String(identifier || username || phone || '').trim();
    if (!loginId) {
      return res.status(400).json({ success: false, error: 'Username or registered mobile number is required.' });
    }

    const user = await DataStore.getUserByIdentifier(loginId, role);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `No registered account found for "${loginId}"${role ? ` with role "${role}"` : ''}. Please check your credentials or register a new account.`
      });
    }

    // Password verification
    if (user.password) {
      if (!password) {
        return res.status(400).json({
          success: false,
          error: 'Account password is required. Please enter your password.'
        });
      }
      if (user.password !== String(password).trim()) {
        return res.status(401).json({
          success: false,
          error: 'Incorrect password. Please check your password and try again.'
        });
      }
    }

    let worker = null;
    let contractor = null;

    const cleanPhone = (user.phone || '').trim();

    if (user.workerId) {
      worker = await DataStore.getWorkerById(user.workerId);
    } else if (user.role === 'worker') {
      const workers = await DataStore.getWorkers();
      worker = workers.find(w => w.phone && w.phone.replace(/[\s-]/g, '').includes(cleanPhone.slice(-10)));
    }

    if (user.contractorId) {
      contractor = await DataStore.getContractorById(user.contractorId);
    } else if (user.role === 'contractor') {
      const contractors = await DataStore.getContractors();
      contractor = contractors.find(c => c.phone && c.phone.replace(/[\s-]/g, '').includes(cleanPhone.slice(-10)));
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
