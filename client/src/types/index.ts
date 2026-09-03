export type UserRole = 'customer' | 'worker' | 'contractor' | 'admin' | 'cooperative' | 'federation';

export interface VerifiedSkill {
  name: string;
  issuer: string;
  verifiedDate: string;
}

export interface WelfareDetails {
  pmjayCardNumber?: string;
  eShramUAN?: string;
  accidentalInsuranceActive: boolean;
  insuranceCoverageAmount: number;
  welfareContributionBalance: number;
  pensionCreditTier: string;
  lastHealthCheckup?: string;
  scholarshipAvailedForDependents: number;
}

export interface Worker {
  _id: string;
  id?: string;
  cooperativeId: string;
  cooperativeName: string;
  name: string;
  phone: string;
  trade: string;
  subTrades?: string[];
  experienceYears: number;
  completedJobs: number;
  reliabilityScore: number;
  customerRating: number;
  status: 'AVAILABLE' | 'ON_DUTY' | 'EMERGENCY_READY' | 'OFF_DUTY';
  isEmergencyDuty: boolean;
  verifiedSkills: VerifiedSkill[];
  welfareDetails: WelfareDetails;
  location?: {
    lat: number;
    lng: number;
    area: string;
  };
  currentWorkload: number;
  maxDailyCapacity: number;
  totalEarnings: number;
  aadhaarNumber?: string;
  contractorId?: string;
}

export interface SplitConfig {
  workerShare: number;   // e.g. 80
  coopShare: number;     // e.g. 10
  welfareShare: number;  // e.g. 6
  platformShare: number; // e.g. 4
}

export interface Cooperative {
  _id: string;
  id?: string;
  name: string;
  shortName: string;
  regNumber: string;
  establishedYear: number;
  district: string;
  state: string;
  coverageAreas: string[];
  serviceCategories: string[];
  totalWorkers: number;
  activeWorkers: number;
  rating: number;
  reliabilityScore: number;
  welfareFundBalance: number;
  totalJobsCompleted: number;
  emergencyResponseTimeAvg: string;
  contact?: {
    president?: string;
    secretary?: string;
    phone?: string;
    email?: string;
  };
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  splitConfig: SplitConfig;
  workers?: Worker[];
}

export interface PaymentBreakdown {
  workerAmount: number;
  coopAmount: number;
  welfareAmount: number;
  platformAmount: number;
}

export interface Contractor {
  _id: string;
  id?: string;
  name: string;
  phone: string;
  licenseNumber: string; // CLRA labor contractor license
  cooperativeId: string;
  cooperativeName: string;
  aadhaarNumber: string;
  tradesManaged: string[];
  communitySize: number;
  rating: number;
  completedContracts: number;
  workerIds: string[];
}

export interface WorkforceAllocationItem {
  role: string;
  count: number;
  skills?: string;
  dailyRate?: number;
}

export interface ContractorProposal {
  workforce: WorkforceAllocationItem[];
  estimatedDurationDays: number;
  estimatedCost: number;
  materialsAndEquipment: string[];
  notes: string;
  submittedAt?: string;
}

export interface ProjectScope {
  taskDescription: string;
  propertyType: string;
  scopeType: string;
  approxAreaSqFt?: number;
  preferredStartDate?: string;
  specialRequirements?: string;
}

export interface Booking {
  _id: string;
  id?: string;
  customerName: string;
  customerPhone: string;
  serviceCategory: string;
  subTrade: string;
  type: 'HOUSEHOLD' | 'INSTITUTIONAL' | 'EMERGENCY';
  urgency: 'STANDARD' | 'PRIORITY' | 'EMERGENCY';
  bookingMode?: 'SOLO_WORKER' | 'CONTRACTOR_TEAM';
  teamSize?: number;
  workerType?: string;
  workerTier?: 'STANDARD' | 'MASTER' | 'HELPER';
  contractorId?: string;
  contractorName?: string;
  assignedWorkerIds?: string[];
  assignedWorkers?: Worker[];
  projectDurationDays?: number;
  projectScope?: ProjectScope;
  proposal?: ContractorProposal;
  address: string;
  cooperativeId?: string;
  cooperativeName?: string;
  assignedWorkerId?: string;
  workerName?: string;
  workerPhone?: string;
  status: 'MATCHING' | 'ALLOCATED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'PROPOSAL_PENDING' | 'PROPOSAL_RECEIVED';
  totalAmount: number;
  paymentBreakdown: PaymentBreakdown;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  paymentMethod?: string;
  invoiceNumber?: string;
  allocationRationale?: string;
  etaMinutes?: number;
  ratings?: {
    score: number;
    comment: string;
    quality: number;
    punctuality: number;
    safety: number;
    cooperativeEndorsement: boolean;
  };
  emergencyTriggerReason?: string;
  createdAt: string;
  completedAt?: string;
}

export interface InstitutionalCrewReq {
  trade: string;
  count: number;
  role: string;
}

export interface InstitutionalContract {
  _id: string;
  id?: string;
  clientName: string;
  clientType: 'Housing Society' | 'Educational Institution' | 'Commercial Complex' | 'Healthcare / Hospital' | 'Government Body';
  address: string;
  cooperativeId: string;
  cooperativeName: string;
  contractTitle: string;
  requestedCrew: InstitutionalCrewReq[];
  durationMonths: number;
  startDate: string;
  monthlyValue: number;
  status: 'ACTIVE' | 'PENDING_ALLOCATION' | 'COMPLETED' | 'UNDER_REVIEW';
  allocatedWorkers: string[];
  slaCompliance: string;
  welfareContributionMonthly: number;
  notes?: string;
}

export interface DemandForecast {
  _id?: string;
  locality: string;
  trade: string;
  currentDemand: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH';
  expectedDemandTomorrow: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH';
  historicalTrendPercentage: string;
  confidenceScore: number;
  causeFactor: string;
  recommendedWorkforceAllocation: number;
  currentAvailableInZone: number;
  shortfall: number;
  actionRecommendation: string;
}

export interface WelfareClaim {
  _id: string;
  workerId: string;
  workerName: string;
  cooperativeName: string;
  type: string;
  title: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'DISBURSED';
  date: string;
  description: string;
}

export interface Dispute {
  _id: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  workerId?: string;
  workerName?: string;
  cooperativeId: string;
  cooperativeName: string;
  serviceCategory: string;
  issueType: 'QUALITY_OF_WORK' | 'TIMELINESS_DELAY' | 'OVERCHARGING_QUERY' | 'BEHAVIOUR_MISCONDUCT' | 'SAFETY_CONCERN';
  description: string;
  status: 'OPEN' | 'UNDER_MEDIATION' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  resolvedAt?: string;
  date: string;
}

export interface GeoLocationCoords {
  lat: number;
  lng: number;
  area: string;
  address?: string;
}

export interface WorkerMatchResult {
  worker: Worker;
  distKm: number;
  etaMinutes: number;
  totalScore: number;
  scoreBreakdown: {
    skillScore: number;
    distanceScore: number;
    availabilityScore: number;
    reliabilityScore: number;
    experienceScore: number;
  };
  rationale: string;
}

export interface ContractorMatchResult {
  contractor: {
    _id: string;
    name: string;
    phone: string;
    licenseNumber: string;
    cooperativeName?: string;
    tradesManaged: string[];
    communitySize: number;
    rating: number;
    completedContracts: number;
    location: {
      lat: number;
      lng: number;
      area: string;
      address: string;
    };
  };
  distKm: number;
  totalScore: number;
  scoreBreakdown: {
    capabilityScore: number;
    locationScore: number;
    workforceScore: number;
    experienceScore: number;
    ratingScore: number;
  };
  rationale: string;
}
