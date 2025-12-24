
export interface AttendanceRecord {
  name: string;
  employeeId: string;
  zoneId: string;
  coords: string;
  timestamp: string;
}

const STORAGE_KEY = 'tml_fire_safety_attendance';

export const submitAttendance = async (data: {
  name: string;
  employeeId: string;
  zoneId: string;
  coords: string;
}) => {
  const newRecord: AttendanceRecord = {
    ...data,
    timestamp: new Date().toLocaleString('vi-VN'),
  };

  // 1. Lưu vào LocalStorage để xem ngay lập tức trên máy này
  const existingData = getLocalAttendance();
  const updatedData = [newRecord, ...existingData];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));

  // 2. Gửi đến Google Sheets (Yêu cầu Google Apps Script đã deploy)
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_REPLACE_WITH_YOUR_ACTUAL_ID/exec";

  try {
    // Nếu bạn đã thiết lập Google Apps Script, fetch sẽ gửi dữ liệu đi
    if (!GOOGLE_SCRIPT_URL.includes("REPLACE_WITH_YOUR_ACTUAL_ID")) {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
    }
    return { success: true, record: newRecord };
  } catch (error) {
    console.error("Attendance Sync Error:", error);
    // Vẫn trả về success vì đã lưu được ở LocalStorage
    return { success: true, record: newRecord };
  }
};

export const getLocalAttendance = (): AttendanceRecord[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearLocalAttendance = () => {
  localStorage.removeItem(STORAGE_KEY);
};
