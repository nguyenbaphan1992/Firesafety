
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SafetyMap from './components/SafetyMap';
import { MUSTER_POINTS } from './constants';
import { Location } from './types';
import { getSafetyGuidance } from './services/geminiService';
import { submitAttendance } from './services/attendanceService';

const App: React.FC = () => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [aiTips, setAiTips] = useState<string>('');
  const [isLoadingTips, setIsLoadingTips] = useState<boolean>(false);
  
  // Attendance State
  const [userName, setUserName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Vị trí trực tuyến
  const [isNavEnabled, setIsNavEnabled] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zoneId = e.target.value;
    setSelectedZoneId(zoneId);
    const location = MUSTER_POINTS.find(m => m.id === zoneId) || null;
    setSelectedLocation(location);
    setIsSubmitted(false);
  };

  const handleRollCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZoneId) {
      alert("Vui lòng chọn khu vực trước!");
      return;
    }
    if (!userName.trim()) {
      alert("Vui lòng nhập họ tên!");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAttendance({
        name: userName,
        employeeId: employeeId,
        zoneId: selectedZoneId,
        coords: userCoords ? `${userCoords.lat}, ${userCoords.lng}` : "No GPS"
      });
      setIsSubmitted(true);
      setUserName('');
      setEmployeeId('');
    } catch (error) {
      alert("Lỗi đồng bộ dữ liệu. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="min-h-screen bg-slate-50 relative">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pb-32 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            {/* Zone Selection */}
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
                      {point.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <i className="fa-solid fa-chevron-down text-xs"></i>
                </div>
              </div>

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
            </div>

            {/* Attendance / Roll Call */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-red-100">
              <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-clipboard-user"></i>
                ĐIỂM DANH KHẨN CẤP
              </h3>
              
              {isSubmitted ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="fa-solid fa-circle-check text-xl"></i>
                    <span className="font-bold">ĐÃ XÁC NHẬN CÓ MẶT</span>
                  </div>
                  <p className="text-xs">Thông tin đã được đồng bộ lên hệ thống.</p>
                  <button onClick={() => setIsSubmitted(false)} className="mt-3 text-[10px] font-bold uppercase tracking-wider text-green-800 underline">Điểm danh lại</button>
                </div>
              ) : (
                <form onSubmit={handleRollCall} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Họ và tên / Full Name</label>
                    <input type="text" required value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Nhập tên của bạn..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mã nhân viên</label>
                    <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="VD: NV1234..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
                  </div>
                  <button type="submit" disabled={isSubmitting || !selectedZoneId} className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${!selectedZoneId ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 active:scale-95'}`}>
                    {isSubmitting ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <i className="fa-solid fa-check-to-slot"></i>}
                    XÁC NHẬN CÓ MẶT
                  </button>
                </form>
              )}
            </div>

            {/* AI Safety Panel */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <i className="fa-solid fa-robot text-6xl"></i>
              </div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <i className="fa-solid fa-wand-magic-sparkles text-blue-400"></i>
                Trợ lý An toàn
              </h3>
              <div className="space-y-4">
                {isLoadingTips ? (
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-sm">Đang tải hướng dẫn...</span>
                  </div>
                ) : aiTips ? (
                  <div className="text-sm leading-relaxed text-slate-300 whitespace-pre-line animate-in fade-in duration-700">
                    {aiTips}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Chọn một khu vực để nhận hướng dẫn thoát hiểm.</p>
                )}
              </div>
            </div>

            {/* Updated Emergency Contacts */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-phone-volume text-red-500"></i>
                Liên hệ khẩn cấp
              </h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <a href="tel:0902068951" className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">Nguyễn Bá Phan</span>
                      <span className="text-[10px] text-slate-500 font-medium uppercase">Cán bộ An toàn</span>
                    </div>
                    <span className="text-blue-600 font-bold text-sm">0902068951</span>
                  </a>
                  <a href="tel:0966513996" className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">Trần Văn Quang</span>
                      <span className="text-[10px] text-slate-500 font-medium uppercase">Cán bộ An toàn</span>
                    </div>
                    <span className="text-blue-600 font-bold text-sm">0966513996</span>
                  </a>
                  <a href="tel:0981596275" className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">Nguyễn Hữu Lợi</span>
                      <span className="text-[10px] text-slate-500 font-medium uppercase">Đội trưởng PCCC&CNCH</span>
                    </div>
                    <span className="text-blue-600 font-bold text-sm">0981596275</span>
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

          <div className="lg:col-span-8">
            <div className="sticky top-24">
              <div className="mb-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  BẢN ĐỒ TẬP KẾT AN TOÀN
                  {selectedLocation && (
                    <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full border border-red-200 font-bold uppercase tracking-tighter">
                      ZONE: {selectedLocation.id}
                    </span>
                  )}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {isNavEnabled && userCoords 
                    ? "Đang hiển thị đường đi ngắn nhất từ vị trí hiện tại."
                    : "Chọn một khu vực từ danh sách bên trái để xác định điểm tập kết an toàn."}
                </p>
              </div>
              
              <SafetyMap 
                location={selectedLocation} 
                userCoords={userCoords}
                isNavEnabled={isNavEnabled}
              />

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
                  <span className="text-xs font-semibold text-slate-600">Lộ trình thoát hiểm</span>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-slate-200">
                <button 
                  onClick={() => {
                    const pass = prompt("Nhập mật khẩu Admin để xem danh sách điểm danh:");
                    if (pass === "Phan1992") {
                      window.open("https://docs.google.com/spreadsheets/d/1D4SSRS6DSqdv0xbHTkJ2xlE27D28nviFpp23LsFtUPA/edit?usp=sharing", "_blank");
                    } else if (pass !== null) {
                      alert("Mật khẩu không đúng.");
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
                >
                  <i className="fa-solid fa-lock"></i>
                  Truy cập dữ liệu Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 md:hidden z-50">
        <div className="px-4 flex gap-3">
           <a href="tel:114" className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
             <i className="fa-solid fa-phone"></i> GỌI 114
           </a>
           <button onClick={toggleNavigation} className={`flex-1 ${isNavEnabled ? 'bg-blue-600' : 'bg-slate-700'} text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2`}>
             <i className="fa-solid fa-location-arrow"></i> {isNavEnabled ? 'STOP' : 'CHỈ ĐƯỜNG'}
           </button>
        </div>
      </footer>

      {/* Watermark */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 pointer-events-none opacity-40 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] z-0 select-none">
        Sustainability dept
      </div>
    </div>
  );
};

export default App;
