
import React from 'react';
import { PaymentPlanResult, ViewMode } from '../types';
import { FORMAT_CURRENCY } from '../constants';
import { Scale, CheckCircle2 } from 'lucide-react';

interface ComparisonTableProps {
  plans: PaymentPlanResult[];
  viewMode: ViewMode;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ plans }) => {
  if (plans.length === 0) {
    return (
      <div className="glass-card rounded-[2.5rem] p-24 text-center">
        <Scale className="w-16 h-16 text-white/10 mx-auto mb-6" />
        <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Select plans to compare performance</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto glass-card rounded-[2.5rem] border border-white/10 shadow-2xl">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-white/5">
            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 border-b border-white/5">Attribute</th>
            {plans.map(plan => (
              <th key={plan.id} className="px-8 py-6 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-white/50" />
                  <div className="text-sm font-black text-white font-mont uppercase truncate max-w-[200px]">{plan.name}</div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5">Net Contract</td>
            {plans.map(plan => (
              <td key={plan.id} className="px-8 py-5 text-sm font-black text-white border-b border-white/5">
                {FORMAT_CURRENCY(plan.netPrice)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5">Down Payment</td>
            {plans.map(plan => (
              <td key={plan.id} className="px-8 py-5 text-sm font-bold text-white border-b border-white/5">
                {FORMAT_CURRENCY(plan.schedule.find(s => s.name.toLowerCase().includes('down'))?.amount || 0)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5">Discount</td>
            {plans.map(plan => (
              <td key={plan.id} className="px-8 py-5 text-sm font-bold text-emerald-400 border-b border-white/5">
                {plan.discountPercentage}%
              </td>
            ))}
          </tr>
          <tr className="bg-white/5">
            <td className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Quarterly Rate</td>
            {plans.map(plan => (
              <td key={plan.id} className="px-8 py-6 text-xl font-black text-white font-mont border-b border-white/5">
                {plan.installmentsYears > 0 ? FORMAT_CURRENCY(plan.quarterlyInstallment) : 'N/A'}
              </td>
            ))}
          </tr>
          <tr>
            <td className="px-8 py-4 text-[9px] font-black uppercase tracking-[0.1em] text-white/20">Monthly Ref</td>
            {plans.map(plan => (
              <td key={plan.id} className="px-8 py-4 text-xs font-bold text-white/40">
                {plan.installmentsYears > 0 ? FORMAT_CURRENCY(plan.monthlyInstallment) : 'N/A'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
