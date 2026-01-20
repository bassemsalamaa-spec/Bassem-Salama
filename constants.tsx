
import { PaymentPlanResult, ScheduleItem, PhasedInstallment } from './types';

export const FORMAT_CURRENCY = (val: number) => 
  new Intl.NumberFormat('en-EG', { 
    style: 'currency', 
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);

/**
 * Helper to generate a sequence of quarterly installments.
 * Returns an array of items without variance adjustment (done at top level).
 */
const generateQuarterlySequenceRaw = (
  totalAmount: number, 
  years: number, 
  totalPrice: number,
  startMonth: number = 3,
  startQuarterIndex: number = 1
): ScheduleItem[] => {
  const items: ScheduleItem[] = [];
  const quarters = Math.round(years * 4);
  if (quarters <= 0) return [];
  
  const amountPerQuarter = Math.floor(totalAmount / quarters);

  for (let i = 1; i <= quarters; i++) {
    const currentPercentage = (amountPerQuarter / totalPrice) * 100;
    items.push({
      name: `Quarterly Installment ${startQuarterIndex + i - 1}`,
      percentage: Number(currentPercentage.toFixed(3)),
      amount: amountPerQuarter,
      timing: (startMonth + (i - 1) * 3).toString()
    });
  }
  return items;
};

/**
 * Final adjustment to ensure sum of schedule items equals netPrice exactly.
 */
const adjustScheduleVariance = (schedule: ScheduleItem[], targetTotal: number, originalPrice: number): ScheduleItem[] => {
  if (schedule.length === 0) return schedule;
  
  const currentSum = schedule.reduce((sum, item) => sum + item.amount, 0);
  const variance = targetTotal - currentSum;
  
  if (variance !== 0) {
    const lastItem = schedule[schedule.length - 1];
    lastItem.amount += variance;
    lastItem.percentage = Number(((lastItem.amount / originalPrice) * 100).toFixed(3));
  }
  
  return schedule;
};

export const CALCULATE_PLANS = (price: number): PaymentPlanResult[] => {
  const plans: PaymentPlanResult[] = [];
  if (!price || price <= 0) return [];

  // 1) 0% Downpayment - 5 Years
  const p1Net = Math.round(price * 0.875);
  let p1Schedule = [
    { name: 'Down Payment', percentage: 0, amount: 0, timing: '0' },
    ...generateQuarterlySequenceRaw(p1Net, 5, p1Net, 0)
  ];
  p1Schedule = adjustScheduleVariance(p1Schedule, p1Net, p1Net);
  plans.push({
    id: 'plan-1',
    name: '0% Downpayment - 5 Years - 12.5% Disc',
    type: 'Plan',
    description: '',
    originalPrice: price,
    discountPercentage: 12.5,
    discountAmount: price * 0.125,
    netPrice: p1Net,
    installmentsYears: 5,
    totalInstallmentAmount: p1Net,
    monthlyInstallment: p1Net / (5 * 12),
    quarterlyInstallment: p1Net / (5 * 4),
    schedule: p1Schedule
  });

  // 2) 15% Downpayment - 6 Years
  const p2Net = Math.round(price * 0.90);
  const p2DP = Math.floor(p2Net * 0.15);
  const p2Rem = p2Net - p2DP;
  let p2Schedule = [
    { name: 'Down Payment', percentage: 15, amount: p2DP, timing: '0' },
    ...generateQuarterlySequenceRaw(p2Rem, 6, p2Net, 3)
  ];
  p2Schedule = adjustScheduleVariance(p2Schedule, p2Net, p2Net);
  plans.push({
    id: 'plan-2',
    name: '15% Downpayment - 6 Years - 10% Disc',
    type: 'Plan',
    description: '',
    originalPrice: price,
    discountPercentage: 10,
    discountAmount: price * 0.10,
    netPrice: p2Net,
    installmentsYears: 6,
    totalInstallmentAmount: p2Rem,
    monthlyInstallment: p2Rem / (6 * 12),
    quarterlyInstallment: p2Rem / (6 * 4),
    schedule: p2Schedule
  });

  // 3) 8% Downpayment - 8 Years
  const p3DP = Math.floor(price * 0.08);
  const p3B1 = Math.floor(price * 0.08);
  const p3B2 = Math.floor(price * 0.08);
  const p3Rem = price - p3DP - p3B1 - p3B2;
  let p3Schedule = [
    { name: 'Down Payment', percentage: 8, amount: p3DP, timing: '0' },
    { name: 'Annual Payment 1', percentage: 8, amount: p3B1, timing: '12' },
    { name: 'Annual Payment 2', percentage: 8, amount: p3B2, timing: '24' },
    ...generateQuarterlySequenceRaw(p3Rem, 8, price, 3)
  ];
  p3Schedule = adjustScheduleVariance(p3Schedule, price, price);
  plans.push({
    id: 'plan-3',
    name: '8% Downpayment - 8 Years',
    type: 'Plan',
    description: '',
    originalPrice: price,
    discountPercentage: 0,
    discountAmount: 0,
    netPrice: price,
    installmentsYears: 8,
    totalInstallmentAmount: p3Rem,
    monthlyInstallment: p3Rem / (8 * 12),
    quarterlyInstallment: p3Rem / (8 * 4),
    schedule: p3Schedule
  });

  // 4) 10% Downpayment - 10 Years
  const p4DP = Math.floor(price * 0.10);
  const p4Ph1Amount = Math.floor(price * 0.50);
  const p4Ph2Amount = price - p4DP - p4Ph1Amount;
  let p4Schedule = [
    { name: 'Down Payment', percentage: 10, amount: p4DP, timing: '0' },
    ...generateQuarterlySequenceRaw(p4Ph1Amount, 4, price, 3, 1),
    ...generateQuarterlySequenceRaw(p4Ph2Amount, 6, price, 51, 17)
  ];
  p4Schedule = adjustScheduleVariance(p4Schedule, price, price);
  plans.push({
    id: 'plan-4',
    name: '10% Downpayment - 10 Years',
    type: 'Plan',
    description: '',
    originalPrice: price,
    discountPercentage: 0,
    discountAmount: 0,
    netPrice: price,
    installmentsYears: 10,
    totalInstallmentAmount: p4Ph1Amount + p4Ph2Amount,
    monthlyInstallment: p4Ph1Amount / (4 * 12), 
    quarterlyInstallment: p4Ph1Amount / (4 * 4),
    phasedInstallments: [
      { label: 'Years 1-4', monthly: p4Ph1Amount / (4 * 12), quarterly: p4Ph1Amount / (4 * 4), durationYears: 4 },
      { label: 'Years 5-10', monthly: p4Ph2Amount / (6 * 12), quarterly: p4Ph2Amount / (6 * 4), durationYears: 6 }
    ],
    schedule: p4Schedule
  });

  // 5) 12% Downpayment - 12 Years
  const p5DP = Math.floor(price * 0.12);
  const p5B1 = Math.floor(price * 0.07);
  const p5B2 = Math.floor(price * 0.07);
  const p5B3 = Math.floor(price * 0.07);
  const p5B4 = Math.floor(price * 0.07);
  const p5Rem = price - p5DP - p5B1 - p5B2 - p5B3 - p5B4;
  let p5Schedule = [
    { name: 'Down Payment', percentage: 12, amount: p5DP, timing: '0' },
    { name: 'Annual Payment 1', percentage: 7, amount: p5B1, timing: '12' },
    { name: 'Annual Payment 2', percentage: 7, amount: p5B2, timing: '24' },
    { name: 'Annual Payment 3', percentage: 7, amount: p5B3, timing: '36' },
    { name: 'Annual Payment 4', percentage: 7, amount: p5B4, timing: '48' },
    ...generateQuarterlySequenceRaw(p5Rem, 12, price, 3)
  ];
  p5Schedule = adjustScheduleVariance(p5Schedule, price, price);
  plans.push({
    id: 'plan-5',
    name: '12% Downpayment - 12 Years',
    type: 'Plan',
    description: '',
    originalPrice: price,
    discountPercentage: 0,
    discountAmount: 0,
    netPrice: price,
    installmentsYears: 12,
    totalInstallmentAmount: p5Rem,
    monthlyInstallment: p5Rem / (12 * 12),
    quarterlyInstallment: p5Rem / (12 * 4),
    schedule: p5Schedule
  });

  // 6) CASH
  const p6Net = Math.round(price * 0.70);
  plans.push({
    id: 'plan-6',
    name: 'CASH - 30% Disc',
    type: 'Plan',
    description: '',
    originalPrice: price,
    discountPercentage: 30,
    discountAmount: price * 0.30,
    netPrice: p6Net,
    installmentsYears: 0,
    totalInstallmentAmount: 0,
    monthlyInstallment: 0,
    quarterlyInstallment: 0,
    schedule: [
      { name: 'Cash Settlement', percentage: 100, amount: p6Net, timing: '0' }
    ]
  });

  return plans;
};
