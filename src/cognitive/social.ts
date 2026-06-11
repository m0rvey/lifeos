import { Depth, type Person, type GraphWeights } from '../types';
import { getDaysSince, clamp } from './helpers';

const DEPTH_THRESHOLDS: Record<Depth, number> = {
  [Depth.CORE]: 14,
  [Depth.INNER]: 30,
  [Depth.SOCIAL]: 60,
  [Depth.PERIPHERY]: 180,
};

export function getContactThreshold(depth: Depth): number {
  return DEPTH_THRESHOLDS[depth];
}

export function computeConnectionScore(person: Person, weights: GraphWeights): number {
  const daysSince = getDaysSince(person.lastContactISO);
  const recencyPenalty = weights.recency * Math.min(daysSince / 30, 1) * 25;
  const score =
    person.energy * weights.energy +
    person.resonance * weights.resonance +
    person.reciprocity * weights.reciprocity -
    person.volatility * weights.volatility -
    recencyPenalty;
  return clamp(score, 0, 100);
}

export function isDecaying(person: Person): boolean {
  const daysSince = getDaysSince(person.lastContactISO);
  return daysSince > getContactThreshold(person.depth);
}
