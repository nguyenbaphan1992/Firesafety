
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white p-2 rounded-lg shadow-lg shadow-red-200">
              <i className="fa-solid fa-fire-extinguisher text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">FIRE SAFE <span className="text-red-600">HUB</span></h1>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-none">Emergency Response App</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Hệ thống trực tuyến
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
