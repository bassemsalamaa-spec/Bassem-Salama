
import React from 'react';
import { UnitInfo } from '../types';
import { Layout, Maximize2, Trees, Hash, CreditCard, Layers, Building2 } from 'lucide-react';

interface UnitFormProps {
  unitInfo: UnitInfo;
  onChange: (info: UnitInfo) => void;
}

const UnitForm: React.FC<UnitFormProps> = ({ unitInfo, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let newValue: string | number = value;
    if (name === 'totalPrice') {
      // Remove commas and non-digits for storage
      const rawValue = value.replace(/,/g, '');
      newValue = rawValue ? Number(rawValue) : 0;
    } else if (name === 'bua' || name === 'gardenRoofArea') {
      newValue = value ? Number(value) : 0;
    }

    onChange({
      ...unitInfo,
      [name]: newValue
    });
  };

  // Helper to format number with commas for display
  const formatDisplay = (val: number) => {
    if (!val && val !== 0) return '';
    return val.toLocaleString('en-US');
  };

  return (
    <div className="space-y-6">
      {/* Primary Mandatory Field */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
          <CreditCard className="w-3 h-3 text-white" /> Total Unit Price (EGP) <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <input 
            type="text" 
            name="totalPrice"
            placeholder="Enter Unit Value"
            value={unitInfo.totalPrice ? formatDisplay(unitInfo.totalPrice) : ''}
            onChange={handleChange}
            className="w-full pl-5 pr-12 py-4 input-dark rounded-2xl text-xl font-black"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20">EGP</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Layout className="w-3 h-3" /> Unit Type
          </label>
          <select 
            name="unitType"
            value={unitInfo.unitType}
            onChange={handleChange}
            className="w-full px-4 py-3 input-dark rounded-xl text-sm font-semibold cursor-pointer"
          >
            <option value="Typical">Typical</option>
            <option value="Ground + Garden">Ground + Garden</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Hash className="w-3 h-3" /> Rooms
          </label>
          <select 
            name="rooms"
            value={unitInfo.rooms}
            onChange={handleChange}
            className="w-full px-4 py-3 input-dark rounded-xl text-sm font-semibold cursor-pointer"
          >
            <option value="1 Bedroom">1 Bedroom</option>
            <option value="2 Bedrooms">2 Bedrooms</option>
            <option value="3 Bedrooms">3 Bedrooms</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Building2 className="w-3 h-3" /> Building
          </label>
          <input 
            type="text" 
            name="building"
            placeholder="e.g. A1"
            value={unitInfo.building || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 input-dark rounded-xl text-sm font-semibold"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-3 h-3" /> Floor Level
          </label>
          <input 
            type="text" 
            name="floor"
            placeholder="e.g. 2nd"
            value={unitInfo.floor || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 input-dark rounded-xl text-sm font-semibold"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Maximize2 className="w-3 h-3" /> BUA (sqm)
          </label>
          <input 
            type="number" 
            name="bua"
            placeholder="0"
            value={unitInfo.bua || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 input-dark rounded-xl text-sm font-semibold"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Trees className="w-3 h-3" /> Garden/Roof (sqm)
          </label>
          <input 
            type="number" 
            name="gardenRoofArea"
            placeholder="0"
            value={unitInfo.gardenRoofArea || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 input-dark rounded-xl text-sm font-semibold"
          />
        </div>
      </div>
    </div>
  );
};

export default UnitForm;
