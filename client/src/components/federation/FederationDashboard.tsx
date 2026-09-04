import React from 'react';
import { Cooperative, Worker, Booking, InstitutionalContract, WelfareClaim } from '../../types';
import { 
  Globe, ShieldCheck, Building2, Users, TrendingUp, Award, 
  CheckCircle2, AlertCircle, FileCheck, Layers, PieChart 
} from 'lucide-react';

interface FederationDashboardProps {
  cooperatives: Cooperative[];
  workers: Worker[];
  bookings: Booking[];
  contracts: InstitutionalContract[];
  welfareRecords: WelfareClaim[];
}

export const FederationDashboard: React.FC<FederationDashboardProps> = ({
  cooperatives,
  workers,
  bookings,
  contracts,
  welfareRecords
}) => {
  const totalWelfareFund = cooperatives.reduce((acc, c) => acc + (c.welfareFundBalance || 0), 0);
  const totalWorkersCount = cooperatives.reduce((acc, c) => acc + (c.totalWorkers || 0), 0);
  const totalJobsCompleted = cooperatives.reduce((acc, c) => acc + (c.totalJobsCompleted || 0), 0);
  const totalInstitutionalContractsValue = contracts.reduce((acc, c) => acc + (c.monthlyValue || 0), 0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Federation Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-purple-800/80">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4 border border-purple-500/30">
            <Globe className="w-4 h-4" /> Apex State Federation Governance
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Maharashtra State Labour Cooperative Federation
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-3 leading-relaxed">
            Central governance, multi-cooperative social security corpus administration, and equitable workforce balancing across member primary labour cooperatives in Western Maharashtra.
          </p>
        </div>
      </div>

      {/* Macro Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Member Cooperatives</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{cooperatives.length} Societies</p>
          <p className="text-xs text-purple-700 font-semibold mt-1">100% MSCS Compliant</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accredited Workforce</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{totalWorkersCount} Shramiks</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Zero Middleman Gig Cuts</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Federation Welfare Corpus</span>
          <p className="text-3xl font-black text-amber-600 mt-1">₹{totalWelfareFund.toLocaleString('en-IN')}</p>
          <p className="text-xs text-amber-800 font-medium mt-1">PM-JAY & Accidental Cover</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Institutional Monthly SLAs</span>
          <p className="text-3xl font-black text-blue-700 mt-1">₹{totalInstitutionalContractsValue.toLocaleString('en-IN')}/mo</p>
          <p className="text-xs text-blue-800 font-medium mt-1">Housing Societies & Schools</p>
        </div>

      </div>

      {/* Member Cooperative Benchmark Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">District Cooperative Benchmark Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">Comparative performance metrics, coverage, and welfare reserves</p>
          </div>
          <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ✓ 0 Pending Disputes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-3">Cooperative Name</th>
                <th className="py-3.5 px-3">Registration No.</th>
                <th className="py-3.5 px-3">Wards Covered</th>
                <th className="py-3.5 px-3">Workforce</th>
                <th className="py-3.5 px-3">Reliability</th>
                <th className="py-3.5 px-3">Welfare Corpus</th>
                <th className="py-3.5 px-3 text-right">Emergency ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cooperatives.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-3">
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <p className="text-[11px] text-slate-400">{c.district} Jurisdiction</p>
                  </td>
                  <td className="py-4 px-3 font-mono text-slate-600">{c.regNumber}</td>
                  <td className="py-4 px-3">
                    <span className="text-slate-700">{c.coverageAreas?.slice(0, 3).join(', ')}...</span>
                  </td>
                  <td className="py-4 px-3">
                    <span className="font-bold text-slate-800">{c.activeWorkers}</span>
                    <span className="text-slate-400">/{c.totalWorkers}</span>
                  </td>
                  <td className="py-4 px-3 font-bold text-emerald-600">{c.reliabilityScore}%</td>
                  <td className="py-4 px-3 font-black text-amber-700">₹{c.welfareFundBalance.toLocaleString('en-IN')}</td>
                  <td className="py-4 px-3 text-right font-bold text-slate-800">{c.emergencyResponseTimeAvg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Welfare Principles & Dispute Arbitration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Federation Social Security Principles
          </h3>
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span><strong>80% Statutory Floor:</strong> No cooperative member society may decrease worker take-home below 80%.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span><strong>6% Dedicated Welfare Vault:</strong> Strictly utilized for PM-JAY top-ups, accidental disability insurance, and dependent child scholarships.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span><strong>Workload Gini Equity:</strong> Automated allocation algorithms must prevent individual worker monopolization.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-purple-600" />
            Central Dispute & Grievance Arbitration
          </h3>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
              <span>Arbitration Redressal Rate</span>
              <span className="text-emerald-700">100% Resolved</span>
            </div>
            <p className="leading-relaxed">
              Commercial gig platforms ban workers without recourse based on automated algorithms. Under KaryaSetu, grievances are mediated fairly by a committee composed of the customer, cooperative arbitrator, and peer worker.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
