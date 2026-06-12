import { useMemo } from 'react';
import type { RideRecord } from '../types';

export function useRideStats(rides: RideRecord[]) {
  const totalDistance = useMemo(() => {
    return rides.reduce((acc, r) => acc + r.distanceKm, 0);
  }, [rides]);

  const totalDuration = useMemo(() => {
    return rides.reduce((acc, r) => acc + r.durationMin, 0);
  }, [rides]);

  const avgSpeed = useMemo(() => {
    if (totalDuration === 0) return 0;
    return totalDistance / (totalDuration / 60);
  }, [totalDistance, totalDuration]);

  const maxSpeed = useMemo(() => {
    if (rides.length === 0) return 0;
    return Math.max(...rides.map(r => r.maxSpeedKmh));
  }, [rides]);

  const totalElevation = useMemo(() => {
    return rides.reduce((acc, r) => acc + r.elevationGainM, 0);
  }, [rides]);

  const maxDistance = useMemo(() => {
    if (rides.length === 0) return 0;
    return Math.max(...rides.map(r => r.distanceKm));
  }, [rides]);

  return {
    totalDistance,
    totalDuration,
    avgSpeed,
    maxSpeed,
    totalElevation,
    maxDistance,
  };
}
