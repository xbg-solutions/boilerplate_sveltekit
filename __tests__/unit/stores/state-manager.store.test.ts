/**
 * src/lib/stores/state-manager.store.test.ts
 * 
 * Tests for state-manager.store.ts
 * Tests the state manager store structure and behavior
 */

import { get } from 'svelte/store';
import { describe, it, expect, beforeEach } from 'vitest';
import { stateManagerStore, type StateManagerState } from '@xbg.solutions/utils-state-manager';
import { PersistenceStrategy } from '@xbg.solutions/utils-state-manager';

describe('State Manager Store', () => {
  // Reset store before each test
  beforeEach(() => {
    // Reset store to initial state
    stateManagerStore.set({
      domains: {},
      initialized: false
    });
  });
  
  it('should have the correct initial state', () => {
    const state = get(stateManagerStore);
    
    expect(state.initialized).toBe(false);
    expect(state.domains).toEqual({});
    expect(state.error).toBeUndefined();
  });
  
  it('should update initialization status', () => {
    // Set initialization status
    stateManagerStore.update(state => ({
      ...state,
      initialized: true
    }));
    
    const state = get(stateManagerStore);
    expect(state.initialized).toBe(true);
  });
  
  it('should track domain metadata', () => {
    // Add a domain
    stateManagerStore.update(state => ({
      ...state,
      domains: {
        ...state.domains,
        'testDomain': {
          domain: 'testDomain',
          version: 1,
          persistence: PersistenceStrategy.NONE,
          lastUpdated: Date.now()
        }
      }
    }));
    
    let state = get(stateManagerStore);
    expect(state.domains).toHaveProperty('testDomain');
    expect(state.domains['testDomain'].version).toBe(1);
    expect(state.domains['testDomain'].persistence).toBe(PersistenceStrategy.NONE);
    
    // Update domain metadata
    const updatedTime = Date.now();
    stateManagerStore.update(state => ({
      ...state,
      domains: {
        ...state.domains,
        'testDomain': {
          ...state.domains['testDomain'],
          version: 2,
          lastUpdated: updatedTime
        }
      }
    }));
    
    state = get(stateManagerStore);
    expect(state.domains['testDomain'].version).toBe(2);
    expect(state.domains['testDomain'].lastUpdated).toBe(updatedTime);
  });
  
  it('should add multiple domains', () => {
    // Add multiple domains
    stateManagerStore.update(state => ({
      ...state,
      domains: {
        'domain1': {
          domain: 'domain1',
          version: 1,
          persistence: PersistenceStrategy.NONE
        },
        'domain2': {
          domain: 'domain2',
          version: 1,
          persistence: PersistenceStrategy.SESSION
        },
        'domain3': {
          domain: 'domain3',
          version: 1,
          persistence: PersistenceStrategy.PERMANENT
        }
      }
    }));
    
    const state = get(stateManagerStore);
    expect(Object.keys(state.domains).length).toBe(3);
    expect(state.domains['domain1'].persistence).toBe(PersistenceStrategy.NONE);
    expect(state.domains['domain2'].persistence).toBe(PersistenceStrategy.SESSION);
    expect(state.domains['domain3'].persistence).toBe(PersistenceStrategy.PERMANENT);
  });
  
  it('should remove domains', () => {
    // Add domains
    stateManagerStore.update(state => ({
      ...state,
      domains: {
        'domain1': {
          domain: 'domain1',
          version: 1,
          persistence: PersistenceStrategy.NONE
        },
        'domain2': {
          domain: 'domain2',
          version: 1,
          persistence: PersistenceStrategy.SESSION
        }
      }
    }));
    
    // Verify domains were added
    let state = get(stateManagerStore);
    expect(Object.keys(state.domains).length).toBe(2);
    
    // Remove a domain
    stateManagerStore.update(state => {
      const newDomains = { ...state.domains };
      delete newDomains['domain1'];
      
      return {
        ...state,
        domains: newDomains
      };
    });
    
    // Verify domain was removed
    state = get(stateManagerStore);
    expect(Object.keys(state.domains).length).toBe(1);
    expect(state.domains).not.toHaveProperty('domain1');
    expect(state.domains).toHaveProperty('domain2');
  });
  
  it('should update error state', () => {
    // Set error state
    const error = new Error('State manager initialization failed');
    stateManagerStore.update(state => ({
      ...state,
      error
    }));
    
    const state = get(stateManagerStore);
    expect(state.error).toBe(error);
    
    // Clear error
    stateManagerStore.update(state => ({
      ...state,
      error: undefined
    }));
    
    const updatedState = get(stateManagerStore);
    expect(updatedState.error).toBeUndefined();
  });
  
  it('should update lastUpdated timestamp for domains', () => {
    // Add a domain
    stateManagerStore.update(state => ({
      ...state,
      domains: {
        'testDomain': {
          domain: 'testDomain',
          version: 1,
          persistence: PersistenceStrategy.NONE
        }
      }
    }));
    
    // Update lastUpdated timestamp
    const timestamp = Date.now();
    stateManagerStore.update(state => ({
      ...state,
      domains: {
        ...state.domains,
        'testDomain': {
          ...state.domains['testDomain'],
          lastUpdated: timestamp
        }
      }
    }));
    
    const state = get(stateManagerStore);
    expect(state.domains['testDomain'].lastUpdated).toBe(timestamp);
  });
  
  it('should clear all domains', () => {
    // Add domains
    stateManagerStore.update(state => ({
      ...state,
      domains: {
        'domain1': {
          domain: 'domain1',
          version: 1,
          persistence: PersistenceStrategy.NONE
        },
        'domain2': {
          domain: 'domain2',
          version: 1,
          persistence: PersistenceStrategy.SESSION
        }
      }
    }));
    
    // Verify domains were added
    let state = get(stateManagerStore);
    expect(Object.keys(state.domains).length).toBe(2);
    
    // Clear all domains
    stateManagerStore.update(state => ({
      ...state,
      domains: {}
    }));
    
    // Verify domains were cleared
    state = get(stateManagerStore);
    expect(Object.keys(state.domains).length).toBe(0);
  });
});