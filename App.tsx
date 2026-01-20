
import React, { useState, useMemo } from 'react';
import { UnitInfo, ViewMode, ScheduleItem } from './types';
import { CALCULATE_PLANS, FORMAT_CURRENCY } from './constants';
import { 
  Layers,
  Printer, 
  ShieldAlert
} from 'lucide-react';
import Header from './components/Header';
import UnitForm from './components/UnitForm';
import PlanCard from './components/PlanCard';
import ComparisonTable from './components/ComparisonTable';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const App: React.FC = () => {
  const [unitInfo, setUnitInfo] = useState<UnitInfo>({
    unitType: 'Typical',
    totalPrice: 0,
    bua: 0,
    gardenRoofArea: 0,
    rooms: '1 Bedroom',
    floor: '',
    building: ''
  });

  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const calculatedPlans = useMemo(() => {
    return CALCULATE_PLANS(unitInfo.totalPrice);
  }, [unitInfo.totalPrice]);

  const togglePlanSelection = (id: string) => {
    setSelectedPlans(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const getDueDate = (monthsOffset: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsOffset);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleExportPDF = () => {
    if (unitInfo.totalPrice <= 0) return;
    
    const doc = new jsPDF();
    const plansToExport = calculatedPlans.filter(p => selectedPlans.length === 0 || selectedPlans.includes(p.id));

    plansToExport.forEach((plan, index) => {
      if (index > 0) doc.addPage();

      // Header Branding (Stacked & Centered)
      doc.setFontSize(26);
      doc.setTextColor(0, 0, 0);
      doc.text('PLDG DEVELOPMENT', 105, 15, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text('ETLALA', 105, 23, { align: 'center' });

      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text('THE PROMISE LIVES HERE', 105, 28, { align: 'center' });
      
      doc.setFontSize(8);
      doc.text(`Doc Ref: QUOTE-${Date.now().toString().slice(-6)} | Date: ${new Date().toLocaleDateString('en-GB')}`, 105, 33, { align: 'center' });

      // Unit Header Box
      doc.setFillColor(245, 245, 245);
      doc.rect(14, 40, 182, 45, 'F');
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text('UNIT SPECIFICATIONS', 20, 50);

      doc.setFontSize(9);
      doc.setTextColor(80);
      
      let leftY = 60;
      let rightY = 60;

      // Mandatory
      doc.text(`Total Price: ${FORMAT_CURRENCY(unitInfo.totalPrice)}`, 20, leftY);
      leftY += 6;
      doc.text(`Unit Type: ${unitInfo.unitType}`, 20, leftY);
      leftY += 6;
      doc.text(`Rooms: ${unitInfo.rooms}`, 20, leftY);
      
      // Optional Fields check
      if (unitInfo.building && unitInfo.building.trim() !== '') {
        doc.text(`Building: ${unitInfo.building}`, 110, rightY);
        rightY += 6;
      }
      if (unitInfo.bua > 0) {
        doc.text(`BUA: ${unitInfo.bua} sqm`, 110, rightY);
        rightY += 6;
      }
      if (unitInfo.gardenRoofArea > 0) {
        doc.text(`Garden/Roof: ${unitInfo.gardenRoofArea} sqm`, 110, rightY);
        rightY += 6;
      }
      if (unitInfo.floor && unitInfo.floor.trim() !== '') {
        doc.text(`Floor: ${unitInfo.floor}`, 110, rightY);
        rightY += 6;
      }

      // Plan Details
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`${plan.name}`, 14, 100);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Net Payable: ${FORMAT_CURRENCY(plan.netPrice)}`, 14, 106);

      // Group schedule items by timing (month)
      const groupedSchedule: Record<string, { names: string[], percentage: number, amount: number, timing: number }> = {};
      
      plan.schedule.forEach(item => {
        const timeKey = item.timing;
        if (!groupedSchedule[timeKey]) {
          groupedSchedule[timeKey] = {
            names: [item.name],
            percentage: item.percentage,
            amount: item.amount,
            timing: parseInt(timeKey)
          };
        } else {
          groupedSchedule[timeKey].names.push(item.name);
          groupedSchedule[timeKey].percentage += item.percentage;
          groupedSchedule[timeKey].amount += item.amount;
        }
      });

      const sortedTimings = Object.values(groupedSchedule).sort((a, b) => a.timing - b.timing);

      const tableData: any[][] = sortedTimings.map(group => {
        const dateStr = getDueDate(group.timing);
        const combinedName = group.names.join(' + ');
        
        return [
          combinedName,
          `${group.percentage.toFixed(2)}%`,
          dateStr,
          FORMAT_CURRENCY(group.amount)
        ];
      });

      if (plan.installmentsYears > 0) {
        tableData.push([{ content: 'Periodic Installment Rates', colSpan: 4, styles: { fillColor: [240, 240, 240], fontStyle: 'bold', halign: 'center' } }]);
        
        if (plan.phasedInstallments) {
          plan.phasedInstallments.forEach(phase => {
            tableData.push([`${phase.label} - Monthly`, '', '', FORMAT_CURRENCY(phase.monthly)]);
            tableData.push([`${phase.label} - Quarterly`, '', '', FORMAT_CURRENCY(phase.quarterly)]);
          });
        } else {
          tableData.push(['Monthly Reference Rate', '', '', FORMAT_CURRENCY(plan.monthlyInstallment)]);
          tableData.push(['Quarterly Base Installment', '', '', FORMAT_CURRENCY(plan.quarterlyInstallment)]);
        }
      }

      autoTable(doc, {
        startY: 110,
        head: [['Payment Step', 'Share %', 'Due Date', 'Value (EGP)']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 
          0: { cellWidth: 80 },
          1: { halign: 'center' },
          3: { halign: 'right', fontStyle: 'bold' } 
        }
      });
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          // Split footer lines
          doc.text('All rights reserved for Bassem Salama', 105, 282, { align: 'center' });
          doc.text('01116850111', 105, 287, { align: 'center' });
      }
    });

    doc.save(`PLDG_Quote_${unitInfo.totalPrice}.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-10 rounded-[3rem] sticky top-36">
              <div className="flex items-center gap-3 mb-10 text-white">
                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-mont font-black text-[10px] tracking-tighter shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                   PLDG
                </div>
                <h2 className="text-xl font-black font-mont uppercase tracking-[0.3em]">Unit Details</h2>
              </div>
              
              <UnitForm unitInfo={unitInfo} onChange={setUnitInfo} />
              
              <div className="mt-12 space-y-4">
                <button 
                  onClick={() => setShowComparison(!showComparison)}
                  className="flex items-center justify-center gap-3 w-full py-5 px-6 bg-white/5 text-white font-bold rounded-3xl hover:bg-white/10 transition-all border border-white/10"
                >
                  <Layers className="w-5 h-5" />
                  {showComparison ? 'Switch to Grid' : 'Compare Rates'}
                </button>
                <button 
                  onClick={handleExportPDF}
                  disabled={unitInfo.totalPrice <= 0}
                  className={`flex items-center justify-center gap-3 w-full py-6 px-6 bg-white text-black font-black rounded-3xl transition-all group ${unitInfo.totalPrice <= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:shadow-[0_0_50px_rgba(255,255,255,0.2)]'}`}
                >
                  <Printer className="w-6 h-6 transition-transform group-hover:scale-110" />
                  GENERATE QUOTE
                </button>
              </div>

              <div className="mt-10 p-5 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-3 mb-2 text-white/50">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Pricing Policy</span>
                </div>
                <p className="text-[10px] text-white/30 leading-relaxed font-bold uppercase tracking-wider">
                  QUARTERLY COLLECTION CYCLE IS THE DEFAULT STANDARD FOR ETLALA DEVELOPMENTS.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="mb-12">
                <h3 className="text-5xl font-black text-white font-mont tracking-tighter mb-2 italic uppercase">Payment Plans</h3>
                <p className="text-white/30 text-base font-medium uppercase tracking-[0.4em] mb-8">Quarterly Collection Matrix</p>
                <div className="h-1 w-24 bg-white/10 rounded-full"></div>
            </div>

            {showComparison ? (
              <ComparisonTable 
                plans={calculatedPlans.filter(p => selectedPlans.length === 0 || selectedPlans.includes(p.id))} 
                viewMode={ViewMode.QUARTERLY}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {calculatedPlans.map(plan => (
                  <PlanCard 
                    key={plan.id}
                    plan={plan}
                    viewMode={ViewMode.QUARTERLY}
                    isSelected={selectedPlans.includes(plan.id)}
                    onToggle={() => togglePlanSelection(plan.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-black text-white py-24 mt-24 border-t border-white/5 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center mb-12">
            <span className="font-mont font-black text-6xl text-white tracking-[-0.08em] leading-none mb-2">PLDG</span>
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-[1em] ml-4">Development</span>
          </div>
          <div className="space-y-1">
            <p className="text-white/40 text-sm font-black tracking-[0.3em] uppercase">All rights reserved for Bassem Salama</p>
            <p className="text-white/40 text-sm font-black tracking-[0.3em] uppercase">01116850111</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
