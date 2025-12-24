
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center">
              {/* Logo Tinh Lợi Placeholder - SVG for high quality representation */}
              <svg width="60" height="40" viewBox="0 0 100 66" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                <path d="M40 0H0V66H30C45 66 60 50 70 40L85 25C92 18 100 12 100 0H60C50 0 40 10 30 20L15 35C8 42 0 48 0 66" fill="#E31E24" />
                <path d="M60 66H100V0H70C55 0 40 16 30 26L15 41C8 48 0 54 0 66H40C50 66 60 56 70 46L85 31C92 24 100 18 100 0" fill="#0056A3" />
                <path d="M50 20L35 35L50 50L65 35L50 20Z" fill="white" />
              </svg>
            </div>
            <div className="h-10 w-[1px] bg-slate-200 mx-1"></div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">FIRE SAFE <span className="text-red-600">HUB</span></h1>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.15em] leading-none">Tinh Lợi Safety System</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-4 py-1.5 rounded-full border border-green-100 shadow-sm">
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
