
export interface UnitInfo {
  unitType: 'Typical' | 'Ground + Garden';
  totalPrice: number; // Mandatory
  bua: number; // Optional
  gardenRoofArea: number; // Optional
  rooms: '1 Bedroom' | '2 Bedrooms' | '3 Bedrooms';
  floor: string;
  building: string; // Added building field
}

export interface ScheduleItem {
  name: string;
  percentage: number;
  amount: number;
  timing: string;
}

export interface PhasedInstallment {
  label: string;
  monthly: number;
  quarterly: number;
  durationYears: number;
}

export interface PaymentPlanResult {
  id: string;
  name: string;
  type: string;
  description: string;
  discountPercentage: number;
  discountAmount: number;
  originalPrice: number;
  netPrice: number;
  schedule: ScheduleItem[];
  totalInstallmentAmount: number;
  monthlyInstallment: number;
  quarterlyInstallment: number;
  installmentsYears: number;
  phasedInstallments?: PhasedInstallment[];
}

export enum ViewMode {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY'
}
