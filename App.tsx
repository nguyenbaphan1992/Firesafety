
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SafetyMap from './components/SafetyMap';
import { MUSTER_POINTS } from './constants';
import { Location } from './types';
import { getSafetyGuidance } from './services/geminiService';
import { submitAttendance, getLocalAttendance, AttendanceRecord, clearLocalAttendance } from './services/attendanceService';

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
  
  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  
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
      // Refresh list if in admin mode
      if (isAdminMode) setAttendanceList(getLocalAttendance());
    } catch (error) {
      alert("Lỗi hệ thống. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAdmin = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
    } else {
      const pass = prompt("Nhập mật khẩu Admin để xem danh sách:");
      if (pass === "Phan1992") {
        setAttendanceList(getLocalAttendance());
        setIsAdminMode(true);
      } else if (pass !== null) {
        alert("Mật khẩu không chính xác.");
      }
    }
  };

  const toggleNavigation = () => {
    if (!isNavEnabled) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
            setIsNavEnabled(true);
            setGeoError(null);
          },
          (error) => {
            setGeoError("Không thể truy cập GPS.");
            setIsNavEnabled(false);
          }
        );
      }
    } else {
      setIsNavEnabled(false);
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      setIsLoadingTips(true);
      getSafetyGuidance(selectedLocation.id, selectedLocation.description).then(tips => {
        setAiTips(tips);
        setIsLoadingTips(false);
      });
    }
  }, [selectedLocation]);

  return (
    <div className="min-h-screen bg-slate-50 relative pb-20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {isAdminMode ? (
          /* ADMIN DASHBOARD VIEW */
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-gauge-high text-red-600"></i>
                  DASHBOARD ĐIỂM DANH
                </h2>
                <p className="text-slate-500 text-sm">Danh sách nhân viên đã xác nhận an toàn tại các điểm tập kết.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if(confirm("Bạn có chắc chắn muốn xóa toàn bộ danh sách tạm thời này?")) {
                      clearLocalAttendance();
                      setAttendanceList([]);
                    }
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  XÓA TẤT CẢ
                </button>
                <button 
                  onClick={toggleAdmin}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-colors"
                >
                  THOÁT ADMIN
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-bold text-slate-700">Thời gian</th>
                      <th className="px-6 py-4 font-bold text-slate-700">Họ và Tên</th>
                      <th className="px-6 py-4 font-bold text-slate-700">MSNV</th>
                      <th className="px-6 py-4 font-bold text-slate-700">Khu vực</th>
                      <th className="px-6 py-4 font-bold text-slate-700">Tọa độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {attendanceList.length > 0 ? attendanceList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-500 font-medium">{item.timestamp}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 text-slate-600">{item.employeeId || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-red-100">
                            {item.zoneId}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[10px] text-slate-400 font-mono">{item.coords}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                          Chưa có dữ liệu điểm danh mới.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* USER MAIN VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              {/* Zone Selection */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Khu vực báo cháy</label>
                <div className="relative mb-4">
                  <select
                    value={selectedZoneId}
                    onChange={handleZoneChange}
                    className="block w-full pl-4 pr-10 py-3 border-slate-300 focus:ring-red-500 focus:border-red-500 rounded-xl appearance-none bg-slate-50 border cursor-pointer"
                  >
                    <option value="">-- Chọn khu vực --</option>
                    {MUSTER_POINTS.map((point) => (
                      <option key={point.id} value={point.id}>{point.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isNavEnabled ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      <i className="fa-solid fa-location-arrow"></i>
                    </div>
                    <p className="text-xs font-bold text-slate-700">Chỉ đường trực tuyến</p>
                  </div>
                  <button onClick={toggleNavigation} className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${isNavEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${isNavEnabled ? 'translate-x-5' : 'translate-x-0'} m-0.5`} />
                  </button>
                </div>
              </div>

              {/* Attendance Form */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-red-100">
                <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-clipboard-user"></i> ĐIỂM DANH KHẨN CẤP
                </h3>
                {isSubmitted ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
                    <p className="font-bold text-sm">ĐÃ XÁC NHẬN CÓ MẶT!</p>
                    <button onClick={() => setIsSubmitted(false)} className="mt-2 text-xs underline font-bold">Điểm danh lại</button>
                  </div>
                ) : (
                  <form onSubmit={handleRollCall} className="space-y-4">
                    <input type="text" required value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Họ và tên..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="Mã nhân viên..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    <button type="submit" disabled={isSubmitting || !selectedZoneId} className={`w-full py-3 rounded-xl font-bold text-sm text-white ${!selectedZoneId ? 'bg-slate-300' : 'bg-red-600'}`}>
                      {isSubmitting ? 'ĐANG GỬI...' : 'XÁC NHẬN CÓ MẶT'}
                    </button>
                  </form>
                )}
              </div>

              {/* AI Safety Panel */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-wand-magic-sparkles text-blue-400"></i> Trợ lý An toàn
                </h3>
                {isLoadingTips ? (
                  <div className="text-slate-400 text-sm animate-pulse">Đang tải hướng dẫn...</div>
                ) : aiTips && (
                  <div className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">{aiTips}</div>
                )}
              </div>

              {/* Emergency Contacts */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Liên hệ khẩn cấp</h3>
                <div className="space-y-2">
                  <a href="tel:0902068951" className="block p-3 bg-slate-50 border rounded-xl hover:bg-slate-100">
                    <p className="font-bold text-sm">Nguyễn Bá Phan</p>
                    <p className="text-[10px] text-slate-500">CB An toàn - 0902068951</p>
                  </a>
                  <a href="tel:0966513996" className="block p-3 bg-slate-50 border rounded-xl hover:bg-slate-100">
                    <p className="font-bold text-sm">Trần Văn Quang</p>
                    <p className="text-[10px] text-slate-500">CB An toàn - 0966513996</p>
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <SafetyMap location={selectedLocation} userCoords={userCoords} isNavEnabled={isNavEnabled} />
              <div className="mt-8 pt-8 border-t border-slate-200 flex justify-between items-center">
                <button onClick={toggleAdmin} className="text-xs text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1">
                  <i className="fa-solid fa-lock"></i> Quản lý dữ liệu (Admin)
                </button>
                <div className="opacity-40 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Sustainability dept</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Call to Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 md:hidden z-50">
        <div className="px-4 flex gap-3">
           <a href="tel:114" className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
             <i className="fa-solid fa-phone"></i> GỌI 114
           </a>
           <button onClick={toggleNavigation} className={`flex-1 ${isNavEnabled ? 'bg-blue-600' : 'bg-slate-700'} text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2`}>
             <i className="fa-solid fa-location-arrow"></i> {isNavEnabled ? 'DỪNG' : 'CHỈ ĐƯỜNG'}
           </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
