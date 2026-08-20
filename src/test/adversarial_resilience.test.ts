import { describe, it, expect, beforeEach } from 'vitest';
import { calculateFatigue } from '../cognitive/helpers';
import { dataReducer, HistoryState } from '../context/dataHistory';
import { getDefaultData } from '../storage/defaults';
import { safeSaveItem } from '../storage/atomic';
import { AppData, ScheduleBlock } from '../types';

describe('LifeOS Resilience & Vulnerability Fix Verification', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Verification 1: Fatigue engine strictly ignores future scheduled events', () => {
    const data: AppData = getDefaultData();
    data.tasks = [];
    data.workouts = [];
    data.rides = [];
    data.schedule = [];

    const baseFatigue = calculateFatigue(data);
    expect(baseFatigue).toBe(35);

    // Add future completed rest blocks scheduled for 1 year in the future (e.g. 2027)
    const futureRestBlock: ScheduleBlock = {
      id: 'sb_future_rest',
      title: 'Future Vacation',
      dateISO: '2027-12-31',
      startTime: '10:00',
      durationMin: 120,
      type: 'rest',
      isCompleted: true,
      tags: [],
      createdAt: '2026-08-20T00:00:00Z',
      updatedAt: '2026-08-20T00:00:00Z',
    };
    data.schedule.push(futureRestBlock, futureRestBlock, futureRestBlock);

    const resultingFatigue = calculateFatigue(data);
    console.log(`[FIXED] Future events do not pollute today's fatigue: base = ${baseFatigue}%, with 2027 rest blocks = ${resultingFatigue}%`);
    expect(resultingFatigue).toBe(baseFatigue); // Fatigue remains unchanged at 35%!
  });

  it('Verification 2: Undo/Redo maintains ID consistency and does NOT duplicate entities', () => {
    const initialState: HistoryState = {
      past: [],
      present: getDefaultData(),
      future: [],
    };
    initialState.present.tasks = [];

    // Dispatch ADD_ENTITY without explicit id
    const malformedTask = {
      title: 'Task Without Explicit ID',
      description: 'Auto-id generated',
      isCompleted: false,
    };

    // 1. Add entity
    let state = dataReducer(initialState, {
      type: 'ADD_ENTITY',
      entity: 'tasks',
      payload: malformedTask,
    });
    expect(state.present.tasks.length).toBe(1);

    // 2. Perform UNDO -> Entity is cleanly removed!
    state = dataReducer(state, { type: 'UNDO' });
    console.log('[FIXED] After UNDO, task count is correctly:', state.present.tasks.length);
    expect(state.present.tasks.length).toBe(0);

    // 3. Perform REDO -> Entity is restored once!
    state = dataReducer(state, { type: 'REDO' });
    console.log('[FIXED] After REDO, task count is correctly restored to:', state.present.tasks.length);
    expect(state.present.tasks.length).toBe(1);

    // 4. Repeat Undo/Redo 5 times -> Count stays strictly 1
    for (let i = 0; i < 5; i++) {
      state = dataReducer(state, { type: 'UNDO' });
      state = dataReducer(state, { type: 'REDO' });
    }

    console.log('[FIXED] After 5 Undo/Redo cycles, task count is stable at:', state.present.tasks.length);
    expect(state.present.tasks.length).toBe(1);
  });

  it('Verification 3: Atomic Storage safely writes and verifies payloads', () => {
    const largeData = 'X'.repeat(2 * 1024 * 1024); // 2 MB string
    safeSaveItem('test_storage_key', largeData);
    expect(localStorage.getItem('test_storage_key')).toBe(largeData);
    console.log('[FIXED] Atomic storage safe save verified.');
  });
});
