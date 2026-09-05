const seedCooperatives = [
  {
    _id: "coop_pune_elec",
    name: "Pune Electrical & Mechanical Shramik Sahakari Sanstha Ltd.",
    shortName: "Pune Electrical Sahakari",
    regNumber: "MAH/PNE/LBR/2018/8842",
    establishedYear: 2018,
    district: "Pune",
    state: "Maharashtra",
    coverageAreas: ["Kothrud", "Shivajinagar", "Baner", "Hinjewadi", "Aundh", "Wakad"],
    serviceCategories: ["Electrical", "Appliance Repair", "Solar Maintenance"],
    totalWorkers: 84,
    activeWorkers: 68,
    rating: 4.88,
    reliabilityScore: 98.2,
    welfareFundBalance: 428500, // INR
    totalJobsCompleted: 14230,
    emergencyResponseTimeAvg: "14 mins",
    contact: {
      president: "Suresh Patil",
      secretary: "Ramesh Gaikwad",
      phone: "+91 98220 12345",
      email: "contact@puneelectricalsahakari.org"
    },
    location: {
      lat: 18.5204,
      lng: 73.8567,
      address: "Sahakar Bhavan, Shivajinagar, Pune 411005"
    },
    splitConfig: {
      workerShare: 80,
      coopShare: 10,
      welfareShare: 6,
      platformShare: 4
    }
  },
  {
    _id: "coop_pune_plumb",
    name: "Maharashtra Jal & Sanitation Shramik Sahakari Mandal",
    shortName: "Maha Jal Sahakari",
    regNumber: "MAH/PNE/SAN/2019/3190",
    establishedYear: 2019,
    district: "Pune & PCMC",
    state: "Maharashtra",
    coverageAreas: ["Kothrud", "Hadapsar", "Viman Nagar", "Kalyani Nagar", "Pimpri", "Chinchwad"],
    serviceCategories: ["Plumbing", "Sanitation", "Waterproofing", "Drainage"],
    totalWorkers: 62,
    activeWorkers: 51,
    rating: 4.82,
    reliabilityScore: 96.5,
    welfareFundBalance: 312000, // INR
    totalJobsCompleted: 10840,
    emergencyResponseTimeAvg: "12 mins",
    contact: {
      president: "Anil Shinde",
      secretary: "Santosh Deshmukh",
      phone: "+91 98223 98765",
      email: "help@mahajalsahakari.org"
    },
    location: {
      lat: 18.5089,
      lng: 73.8258,
      address: "Shramik Seva Kendra, Kothrud, Pune 411038"
    },
    splitConfig: {
      workerShare: 80,
      coopShare: 10,
      welfareShare: 6,
      platformShare: 4
    }
  },
  {
    _id: "coop_pune_multi",
    name: "Brihan-Maharashtra Multi-Trade Labour Cooperative Federation",
    shortName: "Brihan Multi-Trade Coop",
    regNumber: "MAH/MS/LBR/FED/2021/0411",
    establishedYear: 2021,
    district: "Pune Metropolitan",
    state: "Maharashtra",
    coverageAreas: ["Baner", "Bavdhan", "Kothrud", "Wakad", "Pashan", "Hinjewadi"],
    serviceCategories: ["Carpentry", "Painting", "Deep Cleaning", "Gardening", "Caregiving"],
    totalWorkers: 110,
    activeWorkers: 89,
    rating: 4.85,
    reliabilityScore: 97.4,
    welfareFundBalance: 615000, // INR
    totalJobsCompleted: 18940,
    emergencyResponseTimeAvg: "22 mins",
    contact: {
      president: "Meenakshi Kulkarni",
      secretary: "Vikas Jagtap",
      phone: "+91 98225 54321",
      email: "info@brihanmultitrade.org"
    },
    location: {
      lat: 18.5590,
      lng: 73.7868,
      address: "Kisan-Shramik Complex, Baner Road, Pune 411045"
    },
    splitConfig: {
      workerShare: 80,
      coopShare: 10,
      welfareShare: 6,
      platformShare: 4
    }
  }
];

const seedWorkers = [
  {
    _id: "wrk_101",
    cooperativeId: "coop_pune_elec",
    cooperativeName: "Pune Electrical Sahakari",
    name: "Santosh Baburao Kadam",
    phone: "+91 98221 00101",
    trade: "Electrical",
    subTrades: ["Switchgear Repair", "Inverter/UPS Installation", "Short Circuit Troubleshooting", "Household Wiring"],
    experienceYears: 9,
    completedJobs: 412,
    reliabilityScore: 98.4,
    customerRating: 4.9,
    status: "AVAILABLE", // AVAILABLE, ON_DUTY, EMERGENCY_READY, OFF_DUTY
    isEmergencyDuty: true,
    verifiedSkills: [
      { name: "NSDC Level-4 Domestic Electrician", issuer: "National Skill Development Corporation", verifiedDate: "2022-04-10" },
      { name: "Safety & High Voltage Protocol (IS-732)", issuer: "Pune Electrical Sahakari", verifiedDate: "2023-01-15" },
      { name: "Appliance Grounding & Surge Protection", issuer: "Skill India Mission", verifiedDate: "2023-08-20" }
    ],
    welfareDetails: {
      pmjayCardNumber: "PMJAY-MH-9942-1802",
      accidentalInsuranceActive: true,
      insuranceCoverageAmount: 500000,
      welfareContributionBalance: 24650, // INR accumulated
      pensionCreditTier: "Gold Tier",
      lastHealthCheckup: "2026-05-12",
      scholarshipAvailedForDependents: 1
    },
    location: {
      lat: 18.5246,
      lng: 73.8500,
      area: "Shivajinagar, Pune"
    },
    currentWorkload: 2, // jobs completed today
    maxDailyCapacity: 5,
    totalEarnings: 184500
  },
  {
    _id: "wrk_102",
    cooperativeId: "coop_pune_plumb",
    cooperativeName: "Maha Jal Sahakari",
    name: "Pravin Maruti Jadhav",
    phone: "+91 98221 00102",
    trade: "Plumbing",
    subTrades: ["Burst Pipe Emergency", "Bathroom Sanitary Fitting", "Motor & Pump Repair", "Water Tank Leakage"],
    experienceYears: 12,
    completedJobs: 528,
    reliabilityScore: 99.1,
    customerRating: 4.95,
    status: "EMERGENCY_READY",
    isEmergencyDuty: true,
    verifiedSkills: [
      { name: "Master Plumber Certification", issuer: "Indian Plumbing Skills Council (IPSC)", verifiedDate: "2021-11-05" },
      { name: "High-Pressure Hydraulic Leak Sealing", issuer: "Maha Jal Sahakari", verifiedDate: "2023-02-18" },
      { name: "Emergency Trenchless Pipeline Repair", issuer: "Skill India", verifiedDate: "2024-06-10" }
    ],
    welfareDetails: {
      pmjayCardNumber: "PMJAY-MH-8812-4029",
      accidentalInsuranceActive: true,
      insuranceCoverageAmount: 500000,
      welfareContributionBalance: 31800,
      pensionCreditTier: "Platinum Tier",
      lastHealthCheckup: "2026-04-20",
      scholarshipAvailedForDependents: 2
    },
    location: {
      lat: 18.5085,
      lng: 73.8180,
      area: "Kothrud, Pune"
    },
    currentWorkload: 1,
    maxDailyCapacity: 5,
    totalEarnings: 236000
  },
  {
    _id: "wrk_103",
    cooperativeId: "coop_pune_multi",
    cooperativeName: "Brihan Multi-Trade Coop",
    name: "Ganesh Vishnu More",
    phone: "+91 98221 00103",
    trade: "Carpentry",
    subTrades: ["Door Lock Installation", "Modular Furniture Assembly", "Cabinet Repair", "Wood Polishing"],
    experienceYears: 7,
    completedJobs: 289,
    reliabilityScore: 96.8,
    customerRating: 4.84,
    status: "AVAILABLE",
    isEmergencyDuty: false,
    verifiedSkills: [
      { name: "NSDC Certified Joiner & Cabinetmaker", issuer: "Furniture & Fittings Skill Council", verifiedDate: "2022-09-14" },
      { name: "Modern Hardware & Smart Lock Specialist", issuer: "Brihan Multi-Trade Coop", verifiedDate: "2023-10-05" }
    ],
    welfareDetails: {
      pmjayCardNumber: "PMJAY-MH-7731-5501",
      accidentalInsuranceActive: true,
      insuranceCoverageAmount: 500000,
      welfareContributionBalance: 17400,
      pensionCreditTier: "Silver Tier",
      lastHealthCheckup: "2026-06-01",
      scholarshipAvailedForDependents: 0
    },
    location: {
      lat: 18.5580,
      lng: 73.7920,
      area: "Baner, Pune"
    },
    currentWorkload: 1,
    maxDailyCapacity: 4,
    totalEarnings: 139200
  },
  {
    _id: "wrk_104",
    cooperativeId: "coop_pune_multi",
    cooperativeName: "Brihan Multi-Trade Coop",
    name: "Sunita Ramesh Kamble",
    phone: "+91 98221 00104",
    trade: "Deep Cleaning",
    subTrades: ["Eco-friendly Deep Cleaning", "Sanitization & Disinfection", "Kitchen Degreasing", "Sofa & Upholstery"],
    experienceYears: 6,
    completedJobs: 340,
    reliabilityScore: 97.9,
    customerRating: 4.92,
    status: "AVAILABLE",
    isEmergencyDuty: false,
    verifiedSkills: [
      { name: "Professional Facility Hygiene & Safety", issuer: "Domestic Workers Sector Skill Council", verifiedDate: "2022-05-18" },
      { name: "Chemical Handling & Green Cleaning Protocol", issuer: "Brihan Multi-Trade Coop", verifiedDate: "2023-04-12" }
    ],
    welfareDetails: {
      pmjayCardNumber: "PMJAY-MH-6620-8912",
      accidentalInsuranceActive: true,
      insuranceCoverageAmount: 500000,
      welfareContributionBalance: 20400,
      pensionCreditTier: "Gold Tier",
      lastHealthCheckup: "2026-03-15",
      scholarshipAvailedForDependents: 1
    },
    location: {
      lat: 18.5620,
      lng: 73.7780,
      area: "Baner / Balewadi, Pune"
    },
    currentWorkload: 0,
    maxDailyCapacity: 3,
    totalEarnings: 163200
  },
  {
    _id: "wrk_105",
    cooperativeId: "coop_pune_elec",
    cooperativeName: "Pune Electrical Sahakari",
    name: "Sachin Tukaram Shinde",
    phone: "+91 98221 00105",
    trade: "Appliance Repair",
    subTrades: ["Inverter AC Servicing", "Refrigerator Compressor", "Washing Machine PCB", "Microwave Repair"],
    experienceYears: 8,
    completedJobs: 375,
    reliabilityScore: 98.0,
    customerRating: 4.88,
    status: "AVAILABLE",
    isEmergencyDuty: true,
    verifiedSkills: [
      { name: "Electronic Consumer Appliances Specialist", issuer: "ESSCI (Electronics Skill Council)", verifiedDate: "2022-07-22" },
      { name: "Inverter PCB Diagnostic Specialist", issuer: "Pune Electrical Sahakari", verifiedDate: "2024-01-10" }
    ],
    welfareDetails: {
      pmjayCardNumber: "PMJAY-MH-5519-7432",
      accidentalInsuranceActive: true,
      insuranceCoverageAmount: 500000,
      welfareContributionBalance: 22500,
      pensionCreditTier: "Gold Tier",
      lastHealthCheckup: "2026-02-19",
      scholarshipAvailedForDependents: 1
    },
    location: {
      lat: 18.5120,
      lng: 73.8340,
      area: "Kothrud / Paud Road, Pune"
    },
    currentWorkload: 2,
    maxDailyCapacity: 5,
    totalEarnings: 180000
  }
];

const seedContracts = [
  {
    _id: "ct_rwa_001",
    clientName: "Green Meadows Co-operative Housing Society (RWA)",
    clientType: "Housing Society",
    address: "Pan Card Club Road, Baner, Pune 411045",
    cooperativeId: "coop_pune_elec",
    cooperativeName: "Pune Electrical Sahakari",
    contractTitle: "Annual Comprehensive Electrical & Pump Maintenance",
    requestedCrew: [
      { trade: "Electrical", count: 2, role: "Dedicated Society Technicians" },
      { trade: "Plumbing", count: 2, role: "Pump & Overhead Tank Specialists" },
      { trade: "Deep Cleaning", count: 3, role: "Weekly Clubhouse & Common Area Sanitization" }
    ],
    durationMonths: 12,
    startDate: "2026-01-01",
    monthlyValue: 48000, // INR
    status: "ACTIVE", // ACTIVE, PENDING_ALLOCATION, COMPLETED
    allocatedWorkers: ["wrk_101", "wrk_102"],
    slaCompliance: "99.4%",
    welfareContributionMonthly: 2880, // 6% of contract to worker welfare
    notes: "Bi-weekly scheduled preventive audit, 15-minute emergency response SLA."
  },
  {
    _id: "ct_rwa_002",
    clientName: "St. Xavier's Model High School & Junior College",
    clientType: "Educational Institution",
    address: "Erandwane, Near Film Institute, Pune 411004",
    cooperativeId: "coop_pune_plumb",
    cooperativeName: "Maha Jal Sahakari",
    contractTitle: "School Campus Water Filtration & Restroom Facility SLA",
    requestedCrew: [
      { trade: "Plumbing", count: 2, role: "Daily RO Plant & Restroom Facility Upkeep" }
    ],
    durationMonths: 10,
    startDate: "2026-06-01",
    monthlyValue: 24000,
    status: "ACTIVE",
    allocatedWorkers: ["wrk_102"],
    slaCompliance: "98.8%",
    welfareContributionMonthly: 1440,
    notes: "Drinking water quality inspection every Monday morning before school assembly."
  },
  {
    _id: "ct_rwa_003",
    clientName: "TechEdge Innovation Hub & Co-working Space",
    clientType: "Commercial Complex",
    address: "Hinjewadi Phase 1, Pune 411057",
    cooperativeId: "coop_pune_multi",
    cooperativeName: "Brihan Multi-Trade Coop",
    contractTitle: "Facilities Maintenance & Ergonomic Furniture Care",
    requestedCrew: [
      { trade: "Carpentry", count: 2, role: "Workstation and Acoustic Partition Care" },
      { trade: "Electrical", count: 1, role: "Server Room UPS & Power Redundancy" }
    ],
    durationMonths: 6,
    startDate: "2026-07-01",
    monthlyValue: 36000,
    status: "ACTIVE",
    allocatedWorkers: ["wrk_103"],
    slaCompliance: "99.1%",
    welfareContributionMonthly: 2160,
    notes: "Rapid weekend workstation maintenance to avoid business disruption."
  }
];

const seedForecasts = [
  {
    locality: "Baner & Balewadi",
    trade: "Plumbing",
    currentDemand: "HIGH",
    expectedDemandTomorrow: "VERY HIGH",
    historicalTrendPercentage: "+185%",
    confidenceScore: 94.2,
    causeFactor: "Heavy Monsoon precipitation alert; drainage backflow in low-lying sectors",
    recommendedWorkforceAllocation: 14,
    currentAvailableInZone: 6,
    shortfall: 8,
    actionRecommendation: "Pre-position 8 emergency plumbers from Hadapsar & Kothrud branches before 07:00 AM"
  },
  {
    locality: "Hinjewadi IT Zone",
    trade: "Electrical",
    currentDemand: "MEDIUM",
    expectedDemandTomorrow: "HIGH",
    historicalTrendPercentage: "+120%",
    confidenceScore: 91.0,
    causeFactor: "Monsoon tree falls triggering transformer trips & residential society generator transfers",
    recommendedWorkforceAllocation: 12,
    currentAvailableInZone: 7,
    shortfall: 5,
    actionRecommendation: "Alert Pune Electrical Sahakari Emergency Squad 2 for early morning deployment"
  },
  {
    locality: "Kothrud & Karve Nagar",
    trade: "Deep Cleaning",
    currentDemand: "MEDIUM",
    expectedDemandTomorrow: "HIGH",
    historicalTrendPercentage: "+140%",
    confidenceScore: 89.5,
    causeFactor: "Pre-Ganesh Chaturthi / Festive preparation deep cleaning reservations",
    recommendedWorkforceAllocation: 18,
    currentAvailableInZone: 11,
    shortfall: 7,
    actionRecommendation: "Open extra slots for women-led cooperative deep cleaning squads"
  },
  {
    locality: "Viman Nagar & Kalyani Nagar",
    trade: "Appliance Repair",
    currentDemand: "MEDIUM",
    expectedDemandTomorrow: "MEDIUM",
    historicalTrendPercentage: "+15%",
    confidenceScore: 88.0,
    causeFactor: "Regular seasonal appliance maintenance cycles",
    recommendedWorkforceAllocation: 8,
    currentAvailableInZone: 8,
    shortfall: 0,
    actionRecommendation: "Adequate workforce allocated; maintain standard rotational shifts"
  }
];

const seedBookings = [
  {
    _id: "bk_1001",
    customerName: "Aditya Deshpande",
    customerPhone: "+91 98900 11223",
    serviceCategory: "Electrical",
    subTrade: "Switchgear Repair",
    type: "HOUSEHOLD",
    urgency: "STANDARD",
    address: "Flat 402, Mayur Residency, Kothrud, Pune 411038",
    cooperativeId: "coop_pune_elec",
    cooperativeName: "Pune Electrical Sahakari",
    assignedWorkerId: "wrk_101",
    workerName: "Santosh Baburao Kadam",
    workerPhone: "+91 98221 00101",
    status: "COMPLETED",
    totalAmount: 500,
    paymentBreakdown: {
      workerAmount: 400,     // 80%
      coopAmount: 50,        // 10%
      welfareAmount: 30,     // 6%
      platformAmount: 20     // 4%
    },
    paymentStatus: "PAID",
    paymentMethod: "UPI (Google Pay)",
    invoiceNumber: "INV-COOP-2026-00412",
    createdAt: "2026-08-30T10:15:00.000Z",
    completedAt: "2026-08-30T11:45:00.000Z",
    ratings: {
      score: 5,
      comment: "Santosh ji arrived on time, was extremely courteous, diagnosed the MCB tripping in 10 minutes. Proud to support our local worker cooperative!",
      quality: 5,
      punctuality: 5,
      safety: 5,
      cooperativeEndorsement: true
    }
  },
  {
    _id: "bk_1002",
    customerName: "Rohit & Megha Sharma",
    customerPhone: "+91 97654 32109",
    serviceCategory: "Plumbing",
    subTrade: "Burst Pipe Emergency",
    type: "EMERGENCY",
    urgency: "EMERGENCY",
    address: "Row House 7, Nyati Estate, Baner, Pune 411045",
    cooperativeId: "coop_pune_plumb",
    cooperativeName: "Maha Jal Sahakari",
    assignedWorkerId: "wrk_102",
    workerName: "Pravin Maruti Jadhav",
    workerPhone: "+91 98221 00102",
    status: "IN_PROGRESS",
    totalAmount: 650,
    paymentBreakdown: {
      workerAmount: 520,     // 80%
      coopAmount: 65,        // 10%
      welfareAmount: 39,     // 6%
      platformAmount: 26     // 4%
    },
    paymentStatus: "PENDING",
    paymentMethod: "Awaiting Completion",
    invoiceNumber: "INV-COOP-2026-00413",
    createdAt: "2026-09-01T22:30:00.000Z",
    etaMinutes: 8,
    otp: "4821",
    emergencyTriggerReason: "Main supply pipeline rupture; water flooding parking and utility area"
  },
  {
    _id: "bk_team_101",
    customerName: "Amanora Residents Association",
    customerPhone: "+91 99222 33445",
    serviceCategory: "Painting & Waterproofing",
    subTrade: "Exterior Waterproofing & Paint",
    type: "HOUSEHOLD",
    urgency: "STANDARD",
    bookingMode: "CONTRACTOR_TEAM",
    teamSize: 3,
    projectDurationDays: 2,
    contractorId: "cnt_101",
    contractorName: "Balasaheb Ramchandra Shinde",
    assignedWorkerIds: ["wrk_101", "wrk_102", "wrk_104"],
    workerName: "Santosh Baburao Kadam, Pravin Maruti Jadhav, Sunita Ramesh Kamble",
    address: "Tower 9, Amanora Town, Hadapsar, Pune 411028",
    cooperativeId: "coop_pune_multi",
    cooperativeName: "Brihan-Maharashtra Multi-Trade Labour Cooperative",
    status: "ALLOCATED",
    totalAmount: 18500,
    projectScope: {
      taskDescription: "Exterior Waterproofing & Weathercoat Painting for Tower 9",
      propertyType: "12-Story Housing Society Tower",
      scopeType: "Exterior Facade & Parapet Walls",
      approxAreaSqFt: 12500,
      preferredStartDate: "05 Sep 2026 (09:00 AM)",
      specialRequirements: "Pressure wash exterior facade to remove monsoon moss & efflorescence. Inject polyurethane waterproofing sealant into parapet hairline cracks. Apply 1 coat exterior damp-proof primer followed by 2 coats of elastomeric weathercoat. Terrace 3-phase power & water tap available near lift room. Society corridor barricading required."
    },
    proposal: {
      workforce: [
        { role: "Master Waterproofing Specialist", count: 2, skills: "Polyurethane crack injection, elastomeric coating, EN-361 high-rope rigging" },
        { role: "Site Scaffolding & Material Assistant", count: 1, skills: "Material batch mixing, pressure washing, safety barricading" }
      ],
      estimatedDurationDays: 2,
      estimatedCost: 18500,
      materialsAndEquipment: [
        "Heavy-duty Aluminium Suspended Scaffolding (2 Units)",
        "150-Bar High-Pressure Facade Washer",
        "Airless Paint Sprayer with 30m Hose",
        "EN 361 Fall-Arrest Safety Harnesses & Helmets",
        "Protective Canvas Floor Drop Sheets"
      ],
      notes: "Mukaddam Balasaheb Shinde on-site supervision. 80% minimum gazetted wages deposited to workers' bank accounts. 1-year cooperative guarantee."
    },
    paymentBreakdown: {
      workerAmount: 14800,
      coopAmount: 1850,
      welfareAmount: 1110,
      platformAmount: 740
    },
    paymentStatus: "PENDING",
    invoiceNumber: "INV-TEAM-2026-00089",
    allocationRationale: "Contractor assigned certified painter shramiks with multi-year cooperative warranty.",
    createdAt: "2026-09-02T10:00:00.000Z"
  },
  {
    _id: "bk_team_102",
    customerName: "Pooja Agarwal (Baner Tech Residency)",
    customerPhone: "+91 98331 44556",
    serviceCategory: "Deep Cleaning",
    subTrade: "Commercial Floor Buffing & Post-Construction Sanitization",
    type: "HOUSEHOLD",
    urgency: "STANDARD",
    bookingMode: "CONTRACTOR_TEAM",
    teamSize: 4,
    projectDurationDays: 1,
    contractorId: "cnt_101",
    contractorName: "Balasaheb Ramchandra Shinde",
    assignedWorkerIds: [],
    address: "B-Wing, Baner Tech Residency, Baner, Pune 411045",
    cooperativeId: "coop_pune_multi",
    cooperativeName: "Brihan-Maharashtra Multi-Trade Labour Cooperative",
    status: "MATCHING",
    totalAmount: 9600,
    paymentBreakdown: {
      workerAmount: 7680,
      coopAmount: 960,
      welfareAmount: 576,
      platformAmount: 384
    },
    paymentStatus: "PENDING",
    invoiceNumber: "INV-TEAM-2026-00090",
    allocationRationale: "Awaiting contractor team allocation of 4 certified deep-cleaning workers from community.",
    createdAt: "2026-09-03T08:30:00.000Z"
  },
  {
    _id: "bk_team_103",
    customerName: "Dr. Vikram & Ananya Deshmukh",
    customerPhone: "+91 98229 11002",
    serviceCategory: "Painting & Renovation",
    subTrade: "Full Interior Painting & Surface Repair (3 BHK)",
    type: "HOUSEHOLD",
    urgency: "STANDARD",
    bookingMode: "CONTRACTOR_TEAM",
    teamSize: 4,
    projectDurationDays: 3,
    contractorId: "cnt_101",
    contractorName: "Balasaheb Ramchandra Shinde",
    assignedWorkerIds: [],
    address: "Flat 701, Rohan Nilay Phase 2, Aundh, Pune 411007",
    cooperativeId: "coop_pune_multi",
    cooperativeName: "Brihan-Maharashtra Multi-Trade Labour Cooperative",
    status: "PROPOSAL_PENDING",
    totalAmount: 14500,
    projectScope: {
      taskDescription: "Full Interior Painting for 3 BHK Flat (Walls, Ceiling & Woodwork)",
      propertyType: "3 BHK Flat",
      scopeType: "Interior Walls & Ceiling Painting",
      approxAreaSqFt: 1350,
      preferredStartDate: "Tomorrow, 09:00 AM",
      specialRequirements: "Customer requested complete wall sanding, 2 coats of acrylic putty, 1 coat primer, and 2 coats of Asian Paints Royal Luxury Emulsion. Protect furniture with drop sheets."
    },
    paymentBreakdown: {
      workerAmount: 11600,
      coopAmount: 1450,
      welfareAmount: 870,
      platformAmount: 580
    },
    paymentStatus: "PENDING",
    invoiceNumber: "INV-TEAM-2026-00091",
    allocationRationale: "Awaiting contractor proposal and workforce plan sizing.",
    notes: "Customer outcome: 'I want to paint my 3 BHK flat before the festive season. Need verified cooperative team with Mukaddam supervision.'",
    createdAt: "2026-09-05T09:00:00.000Z"
  },
  {
    _id: "bk_team_104",
    customerName: "Sneha & Rohan Kulkarni",
    customerPhone: "+91 98221 44778",
    serviceCategory: "Home Maintenance & Renovation",
    subTrade: "Bathroom Tile Waterproofing & Plumbing Overhaul",
    type: "HOUSEHOLD",
    urgency: "STANDARD",
    bookingMode: "CONTRACTOR_TEAM",
    teamSize: 3,
    projectDurationDays: 2,
    contractorId: "cnt_101",
    contractorName: "Balasaheb Ramchandra Shinde",
    assignedWorkerIds: [],
    address: "Bungalow 12, Prabhat Road Lane 4, Erandwane, Pune 411004",
    cooperativeId: "coop_pune_multi",
    cooperativeName: "Brihan-Maharashtra Multi-Trade Labour Cooperative",
    status: "PROPOSAL_PENDING",
    totalAmount: 9800,
    projectScope: {
      taskDescription: "Bathroom Tile Waterproofing & Sanitary Overhaul",
      propertyType: "Independent House",
      scopeType: "Plumbing & Tiling Repair",
      approxAreaSqFt: 450,
      preferredStartDate: "Tomorrow, 10:00 AM",
      specialRequirements: "Replace aged concealed piping, apply epoxy grout to floor joints, install new diverter fixture, and test water pressure."
    },
    paymentBreakdown: {
      workerAmount: 7840,
      coopAmount: 980,
      welfareAmount: 588,
      platformAmount: 392
    },
    paymentStatus: "PENDING",
    invoiceNumber: "INV-TEAM-2026-00092",
    allocationRationale: "Awaiting contractor proposal and workforce plan sizing.",
    notes: "Customer outcome: 'Persistent dampness on adjacent bedroom wall. Need bathroom waterproofing overhaul.'",
    createdAt: "2026-09-05T10:30:00.000Z"
  }
];

const seedWelfareLedger = [
  {
    _id: "wlf_001",
    workerId: "wrk_101",
    workerName: "Santosh Baburao Kadam",
    cooperativeName: "Pune Electrical Sahakari",
    type: "ACCIDENT_INSURANCE_PREMIUM",
    title: "PMSBY & Sahakari Suraksha Cover Renewal (₹5,00,000 cover)",
    amount: 720,
    status: "DISBURSED",
    date: "2026-06-01",
    description: "Annual group policy covering occupational electrical hazard, funded 100% via welfare split."
  },
  {
    _id: "wlf_002",
    workerId: "wrk_102",
    workerName: "Pravin Maruti Jadhav",
    cooperativeName: "Maha Jal Sahakari",
    type: "CHILD_EDUCATION_SCHOLARSHIP",
    title: "Daughter's Polytechnic Engineering Scholarship",
    amount: 15000,
    status: "DISBURSED",
    date: "2026-07-15",
    description: "Merit-based education incentive sponsored by the Cooperative Welfare Fund."
  },
  {
    _id: "wlf_003",
    workerId: "wrk_104",
    workerName: "Sunita Ramesh Kamble",
    cooperativeName: "Brihan Multi-Trade Coop",
    type: "PREVENTIVE_HEALTH_CAMP",
    title: "Annual Ergonomic & Pulmonary Health Checkup",
    amount: 1800,
    status: "DISBURSED",
    date: "2026-03-15",
    description: "Comprehensive medical screening conducted at Sahakar Seva Hospital."
  }
];

const seedContractors = [
  {
    _id: "cnt_101",
    name: "Balasaheb Ramchandra Shinde",
    phone: "+91 98224 88120",
    licenseNumber: "LIC/CLRA/PNE/2022/8812",
    cooperativeId: "coop_pune_multi",
    cooperativeName: "Brihan-Maharashtra Multi-Trade Labour Cooperative",
    aadhaarNumber: "XXXX-XXXX-9102",
    tradesManaged: ["Painting", "Home Maintenance & Repair", "Deep Cleaning", "Carpentry", "Electrical"],
    communitySize: 14,
    rating: 4.88,
    completedContracts: 42,
    location: {
      lat: 18.5074,
      lng: 73.8077,
      area: "Kothrud",
      address: "Shinde Wada, Near Karve Statue, Kothrud, Pune 411038"
    },
    workerIds: ["wrk_101", "wrk_102", "wrk_103", "wrk_104", "wrk_105", "wrk_108"]
  },
  {
    _id: "cnt_102",
    name: "Sanjay Vithalrao Patil",
    phone: "+91 98229 44112",
    licenseNumber: "LIC/CLRA/PNE/2021/4412",
    cooperativeId: "coop_pune_plumb",
    cooperativeName: "Maharashtra Jal & Sanitation Shramik Sahakari",
    aadhaarNumber: "XXXX-XXXX-7714",
    tradesManaged: ["Plumbing", "Masonry", "Flooring & Tiling", "Waterproofing", "Civil Works"],
    communitySize: 11,
    rating: 4.84,
    completedContracts: 35,
    location: {
      lat: 18.4912,
      lng: 73.8185,
      area: "Karve Nagar",
      address: "Patil Nirman Kendra, Hingne Home Colony, Karve Nagar, Pune 411052"
    },
    workerIds: ["wrk_102", "wrk_106", "wrk_107"]
  },
  {
    _id: "cnt_103",
    name: "Dnyaneshwar Tukaram Jadhav",
    phone: "+91 98231 66780",
    licenseNumber: "LIC/CLRA/PNE/2020/6678",
    cooperativeId: "coop_pune_multi",
    cooperativeName: "Brihan-Maharashtra Multi-Trade Labour Cooperative",
    aadhaarNumber: "XXXX-XXXX-3341",
    tradesManaged: ["Painting", "Electrical", "Construction", "AMCs", "Institutional Facility"],
    communitySize: 16,
    rating: 4.91,
    completedContracts: 53,
    location: {
      lat: 18.5590,
      lng: 73.7868,
      area: "Baner",
      address: "Jadhav Commercial Complex, Baner-Pashan Link Road, Pune 411045"
    },
    workerIds: ["wrk_101", "wrk_103", "wrk_105", "wrk_108"]
  }
];

module.exports = {
  seedCooperatives,
  seedWorkers,
  seedContracts,
  seedForecasts,
  seedBookings,
  seedWelfareLedger,
  seedContractors
};
