export interface RideRecord {
  id: string;
  dateISO: string; // YYYY-MM-DD
  title: string;
  distanceKm: number;
  durationMin: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  elevationGainM: number;
  avgPowerW: number | null;
  avgHrBpm: number | null;
  description: string;
  routeId: string | null;
  bikeName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CycleRoute {
  id: string;
  name: string;
  distanceKm: number;
  elevationGainM: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  waypoints: string[]; // названия точек маршрута
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  bikePart: string;
  type: 'repair' | 'replace' | 'service' | 'upgrade' | 'cleaning' | 'inspection';
  description: string;
  cost: number;
  dateISO: string; // YYYY-MM-DD
  isDone: boolean;
  bikeName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryNote {
  id: string;
  title: string;
  content: string;
  color: 'blue' | 'green' | 'orange' | 'pink' | 'purple';
  tags: string[];
  isPinned: boolean;
  rideId: string | null;
  createdAt: string;
  updatedAt: string;
}
