
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SafetyMap from './components/SafetyMap';
import { MUSTER_POINTS } from './constants';
import { Location } from './types';
import { getSafetyGuidance } from './services/geminiService';

const App: React.FC = () => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [aiTips, setAiTips] = useState<string>('');
  const [isLoadingTips, setIsLoadingTips] = useState<boolean>(false);
  
  // Vị trí trực tuyến
  const [isNavEnabled, setIsNavEnabled] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zoneId = e.target.value;
    setSelectedZoneId(zoneId);
    const location = MUSTER_POINTS.find(m => m.id === zoneId) || null;
    setSelectedLocation(location);
  };

  const toggleNavigation = () => {
    if (!isNavEnabled) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserCoords({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setIsNavEnabled(true);
            setGeoError(null);
          },
          (error) => {
            console.error("Lỗi định vị:", error);
            setGeoError("Không thể truy cập GPS. Vui lòng cấp quyền.");
            setIsNavEnabled(false);
          }
        );
      } else {
        setGeoError("Trình duyệt không hỗ trợ GPS.");
      }
    } else {
      setIsNavEnabled(false);
    }
  };

  // Theo dõi vị trí liên tục khi bật chỉ đường
  useEffect(() => {
    let watchId: number;
    if (isNavEnabled && "geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error(error),
        { enableHighAccuracy: true }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavEnabled]);

  useEffect(() => {
    if (selectedLocation) {
      setIsLoadingTips(true);
      getSafetyGuidance(selectedLocation.id, selectedLocation.description).then(tips => {
        setAiTips(tips);
        setIsLoadingTips(false);
      });
    } else {
      setAiTips('');
    }
  }, [selectedLocation]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Controls & Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label htmlFor="zone-select" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Chọn khu vực báo cháy / Select Fire Zone
              </label>
              <div className="relative mb-4">
                <select
                  id="zone-select"
                  value={selectedZoneId}
                  onChange={handleZoneChange}
                  className="block w-full pl-4 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-xl appearance-none bg-slate-50 border cursor-pointer transition-all"
                >
                  <option value="">-- Chọn khu vực --</option>
                  {MUSTER_POINTS.map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.id} - {point.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <i className="fa-solid fa-chevron-down text-xs"></i>
                </div>
              </div>

              {/* Toggle Chỉ đường trực tuyến */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isNavEnabled ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <i className="fa-solid fa-location-arrow"></i>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Chỉ đường trực tuyến</p>
                    <p className="text-[10px] text-slate-500">Sử dụng GPS hiện tại</p>
                  </div>
                </div>
                <button 
                  onClick={toggleNavigation}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isNavEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isNavEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {geoError && <p className="mt-2 text-[10px] text-red-500 font-medium px-1">{geoError}</p>}

              {selectedLocation && (
                <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <h4 className="text-orange-800 font-bold text-sm mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    THÔNG TIN KHU VỰC / ZONE INFO
                  </h4>
                  <ul className="space-y-2 text-sm text-orange-700">
                    <li className="flex justify-between">
                      <span className="opacity-75">Tên:</span>
                      <span className="font-semibold">{selectedLocation.name}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="opacity-75">Sức chứa:</span>
                      <span className="font-semibold text-orange-800">1000 - 2000 người</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* AI Safety Panel */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <i className="fa-solid fa-robot text-6xl"></i>
              </div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <i className="fa-solid fa-wand-magic-sparkles text-blue-400"></i>
                Trợ lý An toàn / Safety Assistant
              </h3>
              
              <div className="space-y-4">
                {isLoadingTips ? (
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-sm">Đang tải hướng dẫn...</span>
                  </div>
                ) : aiTips ? (
                  <div className="text-sm leading-relaxed text-slate-300 whitespace-pre-line animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {aiTips}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Chọn một khu vực để nhận hướng dẫn thoát hiểm thông minh (Song ngữ).</p>
                )}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-phone-volume text-red-500"></i>
                Liên hệ khẩn cấp / Emergency
              </h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <a href="tel:092068951" className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">A. Nguyễn Bá Phan</span>
                      <span className="text-[10px] text-slate-500 font-medium">CBAT</span>
                    </div>
                    <span className="text-blue-600 font-bold text-sm">092068 951</span>
                  </a>
                  <a href="tel:0982517433" className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">A. Đoàn Trọng Long</span>
                      <span className="text-[10px] text-slate-500 font-medium">Đội trưởng PCCC</span>
                    </div>
                    <span className="text-blue-600 font-bold text-sm">0982517433</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <a href="tel:114" className="flex flex-col items-center p-2 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors">
                    <span className="text-red-600 font-black text-lg leading-none">114</span>
                    <span className="text-[9px] uppercase font-bold text-red-800 mt-1">Cứu hỏa</span>
                  </a>
                  <a href="tel:115" className="flex flex-col items-center p-2 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors">
                    <span className="text-blue-600 font-black text-lg leading-none">115</span>
                    <span className="text-[9px] uppercase font-bold text-blue-800 mt-1">Cấp cứu</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Map Display */}
          <div className="lg:col-span-8">
            <div className="sticky top-24">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    BẢN ĐỒ TẬP KẾT AN TOÀN
                    {selectedLocation && (
                      <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full border border-red-200 font-bold uppercase tracking-tighter">
                        Khẩn cấp
                      </span>
                    )}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    {isNavEnabled && userCoords 
                      ? "Đang hiển thị đường đi ngắn nhất từ vị trí hiện tại của bạn."
                      : `Xác định vị trí cổng tập kết an toàn (${selectedZoneId === '1U01' ? 'Cổng 3' : selectedZoneId === '1U02' ? 'Cổng 2' : 'Chọn khu vực'}).`
                    }
                  </p>
                </div>
              </div>
              
              <SafetyMap 
                location={selectedLocation} 
                userCoords={userCoords}
                isNavEnabled={isNavEnabled}
              />

              {/* Legend/Footer Info */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-xs font-semibold text-slate-600">Vị trí Muster Point</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className={`h-4 w-4 rounded-full ${isNavEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                  <span className="text-xs font-semibold text-slate-600">Vị trí của bạn</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="h-4 w-1 bg-blue-400"></div>
                  <span className="text-xs font-semibold text-slate-600">Đường thoát nạn</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Persistent Call to Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 md:hidden z-50">
        <div className="px-4 flex gap-3">
           <button 
             onClick={() => window.location.href='tel:114'}
             className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-200 flex items-center justify-center gap-2 active:scale-95 transition-transform"
           >
             <i className="fa-solid fa-phone"></i> GỌI 114
           </button>
           <button 
             onClick={toggleNavigation}
             className={`flex-1 ${isNavEnabled ? 'bg-blue-600' : 'bg-slate-700'} text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform`}
           >
             <i className="fa-solid fa-location-arrow"></i> {isNavEnabled ? 'DỪNG CHỈ ĐƯỜNG' : 'CHỈ ĐƯỜNG'}
           </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
