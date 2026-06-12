import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRideStats } from '../hooks/useRideStats';
import type { RideRecord } from '../types';

const mockRides: RideRecord[] = [
  {
    id: 'r1',
    title: 'Test Ride',
    dateISO: '2026-01-15',
    distanceKm: 25,
    durationMin: 60,
    avgSpeedKmh: 25,
    maxSpeedKmh: 35,
    elevationGainM: 200,
    avgPowerW: null,
    avgHrBpm: null,
    description: '',
    routeId: null,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'r2',
    title: 'Test Ride 2',
    dateISO: '2026-01-16',
    distanceKm: 40,
    durationMin: 90,
    avgSpeedKmh: 26.7,
    maxSpeedKmh: 40,
    elevationGainM: 350,
    avgPowerW: null,
    avgHrBpm: null,
    description: '',
    routeId: null,
    createdAt: '2026-01-16T10:00:00Z',
    updatedAt: '2026-01-16T10:00:00Z',
  },
];

describe('useRideStats', () => {
  it('calculates total distance', () => {
    const { result } = renderHook(() => useRideStats(mockRides));
    expect(result.current.totalDistance).toBe(65);
  });

  it('calculates total duration', () => {
    const { result } = renderHook(() => useRideStats(mockRides));
    expect(result.current.totalDuration).toBe(150);
  });

  it('calculates average speed', () => {
    const { result } = renderHook(() => useRideStats(mockRides));
    expect(result.current.avgSpeed).toBeCloseTo(26, 0);
  });

  it('finds max speed', () => {
    const { result } = renderHook(() => useRideStats(mockRides));
    expect(result.current.maxSpeed).toBe(40);
  });

  it('calculates total elevation', () => {
    const { result } = renderHook(() => useRideStats(mockRides));
    expect(result.current.totalElevation).toBe(550);
  });

  it('finds max distance', () => {
    const { result } = renderHook(() => useRideStats(mockRides));
    expect(result.current.maxDistance).toBe(40);
  });

  it('handles empty rides', () => {
    const { result } = renderHook(() => useRideStats([]));
    expect(result.current.totalDistance).toBe(0);
    expect(result.current.totalDuration).toBe(0);
    expect(result.current.avgSpeed).toBe(0);
    expect(result.current.maxSpeed).toBe(0);
    expect(result.current.totalElevation).toBe(0);
    expect(result.current.maxDistance).toBe(0);
  });
});
