import { Booking, Cooperative, InstitutionalContract, DemandForecast, WelfareClaim, Worker, SplitConfig, Contractor } from '../types';

const API_BASE = '/api';

export const api = {
  // Cooperatives
  async getCooperatives(): Promise<Cooperative[]> {
    const res = await fetch(`${API_BASE}/cooperatives`);
    const data = await res.json();
    return data.data || [];
  },

  async getCooperativeById(id: string): Promise<Cooperative> {
    const res = await fetch(`${API_BASE}/cooperatives/${id}`);
    const data = await res.json();
    return data.data;
  },

  async updateCooperativeSplit(id: string, splitConfig: SplitConfig): Promise<Cooperative> {
    const res = await fetch(`${API_BASE}/cooperatives/${id}/split`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(splitConfig)
    });
    const data = await res.json();
    return data.data;
  },

  // Workers
  async getWorkers(params?: { cooperativeId?: string; trade?: string; status?: string }): Promise<Worker[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE}/workers?${query}`);
    const data = await res.json();
    return data.data || [];
  },

  async getWorkerById(id: string): Promise<Worker & { recentBookings: Booking[]; welfareRecords: WelfareClaim[] }> {
    const res = await fetch(`${API_BASE}/workers/${id}`);
    const data = await res.json();
    return data.data;
  },

  async updateWorkerStatus(id: string, status: string, isEmergencyDuty?: boolean): Promise<Worker> {
    const res = await fetch(`${API_BASE}/workers/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, isEmergencyDuty })
    });
    const data = await res.json();
    return data.data;
  },

  async verifyWorkerSkill(id: string, skillName: string, issuer?: string): Promise<Worker> {
    const res = await fetch(`${API_BASE}/workers/${id}/verify-skill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillName, issuer })
    });
    const data = await res.json();
    return data.data;
  },

  async createWorker(workerData: {
    name: string;
    phone: string;
    trade: string;
    aadhaar: string;
    cooperativeId?: string;
    cooperativeName?: string;
    contractorId?: string;
  }): Promise<Worker> {
    const res = await fetch(`${API_BASE}/workers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workerData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to onboard worker');
    }
    return data.data;
  },

  // Bookings
  async getBookings(): Promise<Booking[]> {
    const res = await fetch(`${API_BASE}/bookings`);
    const data = await res.json();
    return data.data || [];
  },

  async getBookingById(id: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${id}`);
    const data = await res.json();
    return data.data;
  },

  async createBooking(bookingData: {
    customerName: string;
    customerPhone: string;
    serviceCategory: string;
    subTrade: string;
    address: string;
    estimatedAmount: number;
    urgency?: string;
  }): Promise<{ booking: Booking; matchMeta: any }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    const data = await res.json();
    return { booking: data.data, matchMeta: data.matchMeta };
  },

  async createEmergencyBooking(emergencyData: {
    customerName: string;
    customerPhone: string;
    emergencyType: string;
    address: string;
    notes?: string;
  }): Promise<{ booking: Booking; message: string; etaMinutes: number }> {
    const res = await fetch(`${API_BASE}/bookings/emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emergencyData)
    });
    const data = await res.json();
    return { booking: data.data, message: data.message, etaMinutes: data.etaMinutes };
  },

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    return data.data;
  },

  async verifyBookingOtp(id: string, otp: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${id}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to verify OTP');
    }
    return data.data;
  },

  async submitProposal(id: string, proposalData: {
    workforce: any[];
    estimatedDurationDays: number;
    estimatedCost: number;
    materialsAndEquipment: string[];
    notes?: string;
  }): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${id}/proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposalData)
    });
    const data = await res.json();
    return data.data;
  },

  async approveProposal(id: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${id}/approve-proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return data.data;
  },

  async payBooking(id: string, paymentMethod?: string): Promise<{ booking: Booking; breakdown: any }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod })
    });
    const data = await res.json();
    return { booking: data.data, breakdown: data.breakdown };
  },

  async rateBooking(id: string, ratings: {
    score: number;
    comment: string;
    quality: number;
    punctuality: number;
    safety: number;
    cooperativeEndorsement: boolean;
  }): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${id}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ratings)
    });
    const data = await res.json();
    return data.data;
  },

  // Institutional Contracts
  async getContracts(): Promise<InstitutionalContract[]> {
    const res = await fetch(`${API_BASE}/contracts`);
    const data = await res.json();
    return data.data || [];
  },

  async createContract(contractData: any): Promise<InstitutionalContract> {
    const res = await fetch(`${API_BASE}/contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contractData)
    });
    const data = await res.json();
    return data.data;
  },

  // Forecast
  async getForecast(): Promise<{ data: DemandForecast[]; aiSummary: string }> {
    const res = await fetch(`${API_BASE}/forecast`);
    const data = await res.json();
    return { data: data.data || [], aiSummary: data.aiSummary || '' };
  },

  // Welfare
  async getWelfareLedger(): Promise<{ records: WelfareClaim[]; totalCorpus: number }> {
    const res = await fetch(`${API_BASE}/welfare/ledger`);
    const data = await res.json();
    return { records: data.data || [], totalCorpus: data.totalWelfareCorpusINR || 0 };
  },

  async submitWelfareClaim(claimData: any): Promise<WelfareClaim> {
    const res = await fetch(`${API_BASE}/welfare/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claimData)
    });
    const data = await res.json();
    return data.data;
  },

  // Geo-Location Service Matching
  async getNearbyWorkers(data: { serviceCategory: string; subTrade?: string; address?: string; lat?: number; lng?: number; isEmergency?: boolean }): Promise<any> {
    const res = await fetch(`${API_BASE}/matching/nearby-workers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async getNearbyContractors(data: { serviceCategory: string; projectScope?: any; address?: string; lat?: number; lng?: number }): Promise<any> {
    const res = await fetch(`${API_BASE}/matching/nearby-contractors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  // Disputes & Grievance Redressal
  async getDisputes(cooperativeId?: string): Promise<any[]> {
    const query = cooperativeId ? `?cooperativeId=${cooperativeId}` : '';
    const res = await fetch(`${API_BASE}/disputes${query}`);
    const data = await res.json();
    return data.data || [];
  },

  async createDispute(disputeData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/disputes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(disputeData)
    });
    const data = await res.json();
    return data.data;
  },

  async resolveDispute(id: string, resolution: string): Promise<any> {
    const res = await fetch(`${API_BASE}/disputes/${id}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution })
    });
    const data = await res.json();
    return data.data;
  },

  // Contractors & Community Allocation
  async getContractors(): Promise<Contractor[]> {
    const res = await fetch(`${API_BASE}/contractors`);
    const data = await res.json();
    return data.data || [];
  },

  async getContractorById(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/contractors/${id}`);
    const data = await res.json();
    return data.data;
  },

  async allocateTeamWorkers(bookingId: string, workerIds: string[]): Promise<Booking> {
    const res = await fetch(`${API_BASE}/contractors/allocate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, workerIds })
    });
    const data = await res.json();
    return data.data;
  },

  async addWorkerToCommunity(contractorId: string, workerId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/contractors/add-worker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contractorId, workerId })
    });
    const data = await res.json();
    return data.data;
  },

  // Reset Demo
  async resetDemoData(): Promise<void> {
    await fetch(`${API_BASE}/reset-demo`, { method: 'POST' });
  }
};
