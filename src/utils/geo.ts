import { GPSPoint } from '../types';

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates estimated calorie expenditure during cycling based on METs, speed and weight.
 * Standard METs for cycling:
 * < 16 km/h: 4.0 METs
 * 16 - 19 km/h: 6.0 METs
 * 19 - 22 km/h: 8.0 METs
 * 22 - 25 km/h: 10.0 METs
 * 25 - 30 km/h: 12.0 METs
 * > 30 km/h: 15.0+ METs
 */
export function calculateCalories(
  speedKmH: number,
  durationSeconds: number,
  weightKg = 72
): number {
  let met = 4.0;
  if (speedKmH > 32) met = 15.5;
  else if (speedKmH > 28) met = 13.0;
  else if (speedKmH > 24) met = 10.5;
  else if (speedKmH > 20) met = 8.5;
  else if (speedKmH > 16) met = 6.8;
  else if (speedKmH > 10) met = 5.0;

  const hours = durationSeconds / 3600;
  return Math.round(met * weightKg * hours);
}

/**
 * Formats duration in seconds to hh:mm:ss or mm:ss
 */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Formats pace from speed km/h to min:sec/km
 */
export function formatPace(speedKmH: number): string {
  if (speedKmH <= 0.5) return '--:-- /km';
  const paceMinutes = 60 / speedKmH;
  const mins = Math.floor(paceMinutes);
  const secs = Math.floor((paceMinutes - mins) * 60);
  return `${mins}'${secs.toString().padStart(2, '0')}" /km`;
}

/**
 * Pre-configured realistic scenic route for GPS simulator / live demo
 * Coordinates set around a scenic coastal & mountain parkway
 */
export const SAMPLE_ROUTE_COORDS: { lat: number; lng: number; altitude: number }[] = [
  { lat: -23.561684, lng: -46.655981, altitude: 760 },
  { lat: -23.562912, lng: -46.654315, altitude: 762 },
  { lat: -23.564531, lng: -46.652189, altitude: 765 },
  { lat: -23.566891, lng: -46.650123, altitude: 771 },
  { lat: -23.569420, lng: -46.648102, altitude: 780 },
  { lat: -23.571822, lng: -46.646390, altitude: 789 },
  { lat: -23.573911, lng: -46.643812, altitude: 802 },
  { lat: -23.576120, lng: -46.640998, altitude: 815 },
  { lat: -23.578819, lng: -46.638421, altitude: 825 },
  { lat: -23.582104, lng: -46.636012, altitude: 820 },
  { lat: -23.585412, lng: -46.634120, altitude: 810 },
  { lat: -23.588931, lng: -46.632990, altitude: 795 },
  { lat: -23.592310, lng: -46.631889, altitude: 785 },
  { lat: -23.595441, lng: -46.630980, altitude: 775 },
  { lat: -23.598212, lng: -46.630112, altitude: 765 },
  { lat: -23.601119, lng: -46.629450, altitude: 760 }
];

export function getHRZone(bpm: number, maxHR = 190): { name: string; color: string; zone: number } {
  const pct = (bpm / maxHR) * 100;
  if (pct < 60) return { name: 'Z1 - Recuperação Ativa', color: 'text-sky-400 bg-sky-950/40 border-sky-800/60', zone: 1 };
  if (pct < 70) return { name: 'Z2 - Resistência Aeróbica', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60', zone: 2 };
  if (pct < 80) return { name: 'Z3 - Ritmo / Tempo', color: 'text-amber-400 bg-amber-950/40 border-amber-800/60', zone: 3 };
  if (pct < 90) return { name: 'Z4 - Limiar de Lactato', color: 'text-orange-400 bg-orange-950/40 border-orange-800/60', zone: 4 };
  return { name: 'Z5 - Potência Anaeróbica', color: 'text-rose-400 bg-rose-950/40 border-rose-800/60', zone: 5 };
}
