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

const seedBookings = [];

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
