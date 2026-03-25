/**
 * src/lib/stores/logging.store.test.ts
 * 
 * Tests for logging.store.ts
 * Tests the logging store structure and behavior
 */

import { get } from 'svelte/store';
import { describe, it, expect, beforeEach } from 'vitest';
import { loggerStore } from '@xbg.solutions/frontend-core';
import type { LoggerState, TimerInfo } from '@xbg.solutions/frontend-core';

describe('Logger Store', () => {
  // Reset store before each test
  beforeEach(() => {
    // Reset store to initial state
    loggerStore.set({
      enabled: false,
      timers: {}
    });
  });
  
  it('should have the correct initial state', () => {
    const state = get(loggerStore);
    
    expect(state.enabled).toBe(false);
    expect(state.timers).toEqual({});
  });
  
  it('should enable and disable logging', () => {
    // Enable logging
    loggerStore.update(state => ({
      ...state,
      enabled: true
    }));
    
    let state = get(loggerStore);
    expect(state.enabled).toBe(true);
    
    // Disable logging
    loggerStore.update(state => ({
      ...state,
      enabled: false
    }));
    
    state = get(loggerStore);
    expect(state.enabled).toBe(false);
  });
  
  it('should add timers', () => {
    const now = Date.now();
    const timerName = 'testTimer';
    const timerInfo: TimerInfo = {
      startTime: now,
      label: 'Test Timer'
    };
    
    // Add a timer
    loggerStore.update(state => ({
      ...state,
      timers: {
        ...state.timers,
        [timerName]: timerInfo
      }
    }));
    
    const state = get(loggerStore);
    expect(state.timers).toHaveProperty(timerName);
    expect(state.timers[timerName]).toEqual(timerInfo);
  });
  
  it('should update existing timers', () => {
    const initialTime = Date.now() - 1000;
    const timerName = 'testTimer';
    
    // Add initial timer
    loggerStore.update(state => ({
      ...state,
      timers: {
        ...state.timers,
        [timerName]: {
          startTime: initialTime,
          label: 'Initial Label'
        }
      }
    }));
    
    // Update the timer
    const updatedTime = Date.now();
    loggerStore.update(state => ({
      ...state,
      timers: {
        ...state.timers,
        [timerName]: {
          startTime: updatedTime,
          label: 'Updated Label'
        }
      }
    }));
    
    const state = get(loggerStore);
    expect(state.timers[timerName].startTime).toBe(updatedTime);
    expect(state.timers[timerName].label).toBe('Updated Label');
  });
  
  it('should remove timers', () => {
    const timerName = 'testTimer';
    
    // Add a timer
    loggerStore.update(state => ({
      ...state,
      timers: {
        ...state.timers,
        [timerName]: {
          startTime: Date.now(),
          label: 'Test Timer'
        }
      }
    }));
    
    // Verify timer was added
    let state = get(loggerStore);
    expect(state.timers).toHaveProperty(timerName);
    
    // Remove the timer
    loggerStore.update(state => {
      const newTimers = { ...state.timers };
      delete newTimers[timerName];
      
      return {
        ...state,
        timers: newTimers
      };
    });
    
    // Verify timer was removed
    state = get(loggerStore);
    expect(state.timers).not.toHaveProperty(timerName);
  });
  
  it('should handle multiple timers', () => {
    const now = Date.now();
    
    // Add multiple timers
    loggerStore.update(state => ({
      ...state,
      timers: {
        timer1: { startTime: now - 1000, label: 'Timer 1' },
        timer2: { startTime: now - 500, label: 'Timer 2' },
        timer3: { startTime: now, label: 'Timer 3' }
      }
    }));
    
    const state = get(loggerStore);
    expect(Object.keys(state.timers).length).toBe(3);
    expect(state.timers.timer1.label).toBe('Timer 1');
    expect(state.timers.timer2.label).toBe('Timer 2');
    expect(state.timers.timer3.label).toBe('Timer 3');
  });
  
  it('should replace all timers', () => {
    // Add initial timers
    loggerStore.update(state => ({
      ...state,
      timers: {
        timer1: { startTime: Date.now() - 1000, label: 'Timer 1' },
        timer2: { startTime: Date.now() - 500, label: 'Timer 2' }
      }
    }));
    
    // Replace with new timers
    const now = Date.now();
    const newTimers = {
      newTimer1: { startTime: now, label: 'New Timer 1' }
    };
    
    loggerStore.update(state => ({
      ...state,
      timers: newTimers
    }));
    
    const state = get(loggerStore);
    expect(Object.keys(state.timers).length).toBe(1);
    expect(state.timers).not.toHaveProperty('timer1');
    expect(state.timers).not.toHaveProperty('timer2');
    expect(state.timers).toHaveProperty('newTimer1');
    expect(state.timers.newTimer1.label).toBe('New Timer 1');
  });
  
  it('should clear all timers', () => {
    // Add multiple timers
    loggerStore.update(state => ({
      ...state,
      timers: {
        timer1: { startTime: Date.now() - 1000, label: 'Timer 1' },
        timer2: { startTime: Date.now() - 500, label: 'Timer 2' }
      }
    }));
    
    // Verify timers were added
    let state = get(loggerStore);
    expect(Object.keys(state.timers).length).toBe(2);
    
    // Clear all timers
    loggerStore.update(state => ({
      ...state,
      timers: {}
    }));
    
    // Verify timers were cleared
    state = get(loggerStore);
    expect(Object.keys(state.timers).length).toBe(0);
  });
});