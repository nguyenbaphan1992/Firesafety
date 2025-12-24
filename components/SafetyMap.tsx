
import React from 'react';
import { Location } from '../types';

interface SafetyMapProps {
  location: Location | null;
  userCoords: { lat: number; lng: number } | null;
  isNavEnabled: boolean;
}

const SafetyMap: React.FC<SafetyMapProps> = ({ location, userCoords, isNavEnabled }) => {
  if (!location) {
    return (
      <div className="w-full h-[400px] bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl">
        <div className="text-center text-slate-400">
          <i className="fa-solid fa-map-location-dot text-5xl mb-3"></i>
          <p className="font-medium">Vui lòng chọn khu vực để xem bản đồ</p>
        </div>
      </div>
    );
  }

  /**
   * Google Maps Parameters:
   * q: query/coordinates
   * z: zoom level (1-20)
   * t: map type (m: standard, k: satellite, h: hybrid, p: terrain)
   * output: embed format
   */
  let mapUrl = `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=19&t=k&output=embed`;
  
  if (isNavEnabled && userCoords) {
    mapUrl = `https://maps.google.com/maps?saddr=${userCoords.lat},${userCoords.lng}&daddr=${location.lat},${location.lng}&z=19&t=k&output=embed`;
  }

  const openGoogleMaps = () => {
    // layer=s ensures satellite view is triggered in the full application
    const url = isNavEnabled && userCoords
      ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${location.lat},${location.lng}&travelmode=walking&layer=s`
      : `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}&layer=s`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border-4 border-white shadow-2xl transition-all duration-500 ease-in-out">
      <div className="bg-red-600 text-white p-3 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2 text-sm md:text-base">
          <i className="fa-solid fa-location-crosshairs"></i>
          {isNavEnabled ? 'ĐANG CHỈ ĐƯỜNG' : 'VỊ TRÍ TẬP KẾT'}: {location.id}
        </h3>
        <div className="flex items-center gap-2">
          {isNavEnabled && userCoords && (
            <span className="text-[10px] bg-green-500 px-2 py-0.5 rounded animate-pulse font-bold tracking-wider">GPS LIVE</span>
          )}
          <span className="text-[10px] bg-red-700 px-2 py-0.5 rounded font-bold tracking-wider">VỆ TINH</span>
        </div>
      </div>
      
      <div className="relative group">
        <iframe
          title="Muster Point Map"
          width="100%"
          height="450"
          frameBorder="0"
          style={{ border: 0 }}
          src={mapUrl}
          allowFullScreen
        ></iframe>
        
        <button 
          onClick={openGoogleMaps}
          className="absolute bottom-4 right-4 bg-white text-slate-900 px-4 py-2 rounded-lg shadow-xl border border-slate-200 font-bold text-xs md:text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <i className="fa-solid fa-up-right-from-square text-red-600"></i>
          Mở Bản Đồ Chi Tiết
        </button>
      </div>

      <div className="bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="bg-orange-100 text-orange-600 p-2 rounded-lg shrink-0">
            <i className="fa-solid fa-circle-info"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800 leading-tight">{location.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
              <p className="text-[10px] text-slate-500 font-medium">Tọa độ mục tiêu: {location.address}</p>
              {isNavEnabled && userCoords && (
                <p className="text-[10px] text-blue-600 font-bold italic">
                  * Đã kích hoạt chế độ chỉ đường từ vị trí của bạn.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyMap;
