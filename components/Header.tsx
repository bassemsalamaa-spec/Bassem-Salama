
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-black/40 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-50 py-8">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        {/* Main Brand Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-baseline gap-2">
            <span className="font-mont font-black text-6xl text-white tracking-[-0.08em] leading-none uppercase">PLDG</span>
            <span className="text-[12px] font-normal text-white/60 uppercase tracking-[0.4em] ml-1">Development</span>
          </div>
        </div>
        
        {/* Project Branding Stacked Below */}
        <div className="flex flex-col items-center">
          <h1 className="font-mont font-bold text-3xl tracking-[0.2em] text-white leading-none">ETLALA</h1>
          <p className="text-[11px] uppercase tracking-[0.3em] font-black text-white/40 mt-3 italic">
            The Promise Lives Here
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
