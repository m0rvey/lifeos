import { todayISO } from './helpers';

export function calcStreak(dates: string[]): { current: number; max: number } {
  if (dates.length === 0) return { current: 0, max: 0 };

  // Unique-fy dates and slice to YYYY-MM-DD
  const uniqueDates = Array.from(new Set(dates.map((d) => d.slice(0, 10))));
  const sorted = uniqueDates.sort().reverse(); // sorted descending (newest first)

  const today = todayISO();
  const [ty, tm, td] = today.split('-').map(Number);
  const yesterdayObj = new Date(ty, tm - 1, td - 1);
  const yesterday = `${yesterdayObj.getFullYear()}-${String(yesterdayObj.getMonth() + 1).padStart(2, '0')}-${String(yesterdayObj.getDate()).padStart(2, '0')}`;

  let current = 0;

  // Check if today or yesterday was completed for current streak
  const lastDate = sorted[0];
  if (lastDate === today || lastDate === yesterday) {
    // Start counting back from the last logged date
    let checkDateStr = lastDate;
    let index = 0;

    while (index < sorted.length) {
      if (sorted[index] === checkDateStr) {
        current++;
        const [cy, cm, cd] = checkDateStr.split('-').map(Number);
        const prevDate = new Date(cy, cm - 1, cd - 1);
        checkDateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
        index++;
      } else {
        // Gap found
        break;
      }
    }
  } else {
    current = 0;
  }

  // Calculate max streak
  let max = 0;
  if (sorted.length > 0) {
    // Reverse to process chronologically
    const chronological = [...sorted].reverse();
    let tempStreak = 1;
    max = 1;
    for (let i = 1; i < chronological.length; i++) {
      const curr = new Date(chronological[i]).getTime();
      const prev = new Date(chronological[i - 1]).getTime();
      const diffTime = curr - prev;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        max = Math.max(max, tempStreak);
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
  }

  return { current, max };
}

export function getStreakLevel(streak: number): 0 | 1 | 2 | 3 {
  if (streak >= 30) return 3;
  if (streak >= 14) return 2;
  if (streak >= 7) return 1;
  return 0;
}
