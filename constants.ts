
import { Location } from './types';

export const MUSTER_POINTS: Location[] = [
  {
    id: '1U01',
    name: 'Khu vực 1U01',
    lat: 20.968278,
    lng: 106.372889,
    address: '20°58\'05.8"N 106°22\'22.4"E',
    description: 'Bãi đỗ xe phía Đông - Điểm tập kết an toàn số 1 (Bên ngoài Cổng 3).',
    safeCapacity: 2000
  },
  {
    id: '1U02',
    name: 'Khu vực 1U02',
    lat: 20.970278,
    lng: 106.370611,
    address: '20°58\'13.0"N 106°22\'14.2"E',
    description: 'Sân bóng nội bộ - Điểm tập kết an toàn số 2 (Bên ngoài Cổng 2).',
    safeCapacity: 2000
  }
];

export const APP_THEME = {
  primary: '#dc2626', // Red-600
  secondary: '#f97316', // Orange-500
  accent: '#1e293b' // Slate-800
};
