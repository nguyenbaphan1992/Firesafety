
export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  safeCapacity: number;
  address: string;
}

export interface FireSafetyTip {
  title: string;
  content: string;
  priority: 'High' | 'Medium' | 'Low';
}
