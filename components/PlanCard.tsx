
import React from 'react';
import { PaymentPlanResult, ViewMode } from '../types';
import { FORMAT_CURRENCY } from '../constants';
import { Check, Calculator, Clock } from 'lucide-react';

interface PlanCardProps {
  plan: PaymentPlanResult;
  viewMode: ViewMode;
  isSelected: boolean;
  onToggle: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isSelected, onToggle }) => {
  // Filter out the repetitive quarterly installments from the UI list
  // but keep major steps like Down Payment and Annual Payments
  const mainSteps = plan.schedule.filter(item => 
    !item.name.toLowerCase().includes('installment') || 
    item.name.toLowerCase().includes('down')
  );

  return (
    <div 
      onClick={onToggle}
      className={`relative cursor-pointer group rounded-[2.5rem] overflow-hidden border-2 transition-all duration-700 h-full flex flex-col ${
        isSelected 
        ? 'border-white bg-white/10 shadow-[0_0_80px_rgba(255,255,255,0.05)] translate-y-[-10px]' 
        : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'
      }`}
    >
      {isSelected && (
        <div className="absolute top-8 right-8 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-2xl z-20 scale-110">
          <Check className="w-6 h-6 stroke-[4px]" />
        </div>
      )}

      <div className="p-10 flex-grow flex flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full bg-white/10 text-white">
                {plan.installmentsYears > 0 ? `${plan.installmentsYears} Years` : 'Cash'}
              </span>
          </div>
          <h4 className="text-3xl font-black font-mont text-white leading-tight tracking-tighter">{plan.name}</h4>
          {plan.description && (
            <p className="text-[11px] text-white/40 font-bold tracking-[0.2em] mt-2 uppercase">{plan.description}</p>
          )}
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-black/40 rounded-3xl p-6 border border-white/5">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 mb-2">Net Contract Price</p>
            <p className="text-2xl font-black text-white font-mont">{FORMAT_CURRENCY(plan.netPrice)}</p>
            {plan.discountPercentage > 0 && (
              <p className="text-[10px] text-emerald-400 font-black mt-2 uppercase tracking-widest">
                -{plan.discountPercentage}% Discount ({FORMAT_CURRENCY(plan.discountAmount)})
              </p>
            )}
          </div>
        </div>

        {plan.installmentsYears > 0 && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2 text-white/30 px-2">
              <Calculator className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Schedule Breakdown</span>
            </div>
            
            {plan.phasedInstallments ? (
              <div className="space-y-3">
                {plan.phasedInstallments.map((phase, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-3xl border border-white/5">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">{phase.label}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[8px] font-bold text-white/30 uppercase">Quarterly</p>
                        <p className="text-xs font-black text-white">{FORMAT_CURRENCY(phase.quarterly)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold text-white/30 uppercase">Monthly (Ref)</p>
                        <p className="text-[10px] font-bold text-white/60">{FORMAT_CURRENCY(phase.monthly)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-3xl border border-white/20">
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">Quarterly (Base)</p>
                  <p className="text-sm font-black text-white truncate">
                    {FORMAT_CURRENCY(plan.quarterlyInstallment)}
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Monthly (Ref)</p>
                  <p className="text-xs font-black text-white truncate">
                    {FORMAT_CURRENCY(plan.monthlyInstallment)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-8 border-t border-white/5 flex-grow overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Payment Steps</h5>
            <Clock className="w-3 h-3 text-white/20" />
          </div>
          
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {mainSteps.map((item, idx) => (
              <div key={idx} className="relative pl-6 border-l border-white/10 last:border-0 pb-4 last:pb-0">
                <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-white/30"></div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold ${item.name.toLowerCase().includes('annual') ? 'text-emerald-400' : 'text-white/70'}`}>
                    {item.name}
                  </span>
                  <span className="text-[10px] font-black text-white">{item.percentage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/20 uppercase font-black tracking-widest">
                    {item.timing === '0' ? 'At Contract' : `Month ${item.timing}`}
                  </span>
                  <span className="text-[10px] text-white font-bold">{FORMAT_CURRENCY(item.amount)}</span>
                </div>
              </div>
            ))}
            {plan.installmentsYears > 0 && (
              <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">
                  + {plan.installmentsYears * 4} Quarterly Installments 
                  <br/> (Full Breakdown in PDF)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
