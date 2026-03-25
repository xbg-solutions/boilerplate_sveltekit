/**
 * src/lib/stores/event.store.test.ts
 * Event store integration unit tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get, writable } from 'svelte/store';

// Mock the pub-sub module - note that vi.mock is hoisted to the top of the file
vi.mock('$lib/services/events/pub-sub', () => ({
  subscribe: vi.fn(() => vi.fn()),
  publish: vi.fn()
}));

// Import after the mock
import { subscribe, publish } from '@xbg.solutions/frontend-core';
import { eventStore, eventDerived, connectStoreToEvents } from '@xbg.solutions/frontend-core';

// Type casting for TypeScript
const subscribeMock = subscribe as any;
const publishMock = publish as any;
const unsubscribeMock = vi.fn();

describe('Event Store Integration', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Reset the return value of subscribe for this test
    subscribeMock.mockReturnValue(unsubscribeMock);
  });
  
  describe('eventStore', () => {
    it('should create a writable store with initial value', () => {
      const store = eventStore({
        initialValue: { count: 0 },
        eventType: 'counter:updated'
      });
      
      expect(get(store)).toEqual({ count: 0 });
      expect(typeof store.set).toBe('function');
      expect(typeof store.update).toBe('function');
      expect(typeof store.subscribe).toBe('function');
    });
    
    it('should subscribe to events and update store value', () => {
      const store = eventStore({
        initialValue: { count: 0 },
        eventType: 'counter:updated'
      });
      
      // Verify subscription was made
      expect(subscribeMock).toHaveBeenCalledWith(
        'counter:updated',
        expect.any(Function)
      );
      
      // Extract the callback function that was passed to subscribe
      const handler = subscribeMock.mock.calls[0]?.[1] as ((payload: any) => void) | undefined;
      
      // Simulate the handler being called with data
      handler?.({ count: 5 });
      
      // Store should be updated
      expect(get(store)).toEqual({ count: 5 });
    });
    
    it('should apply transformer to incoming event payload', () => {
      const store = eventStore({
        initialValue: 0,
        eventType: 'counter:incremented',
        transformer: (amount) => amount + 10
      });
      
      // Extract the callback function
      const handler = subscribeMock.mock.calls[0]?.[1] as ((payload: any) => void) | undefined;
      
      // Simulate the event
      handler?.(5);
      
      // Store should have transformed value
      expect(get(store)).toBe(15);
    });
    
    it('should publish events when value changes if publishOnChange is true', () => {
      const store = eventStore({
        initialValue: { count: 0 },
        eventType: 'counter:updated',
        publishOnChange: true
      });
      
      // Update store value
      store.set({ count: 5 });
      
      // Event should be published
      expect(publishMock).toHaveBeenCalledWith(
        'counter:updated',
        { count: 5 },
        'eventStore'
      );
    });
    
    it('should not publish events when publishOnChange is false', () => {
      const store = eventStore({
        initialValue: { count: 0 },
        eventType: 'counter:updated',
        publishOnChange: false
      });
      
      // Update store value
      store.set({ count: 5 });
      
      // No event should be published
      expect(publishMock).not.toHaveBeenCalled();
    });
    
    it('should use custom event type and source for publishing', () => {
      const store = eventStore({
        initialValue: { count: 0 },
        eventType: 'counter:updated',
        publishOnChange: true,
        publishEventType: 'counter:changed',
        eventSource: 'CounterStore'
      });
      
      // Update store value
      store.set({ count: 5 });
      
      // Event should be published with custom type and source
      expect(publishMock).toHaveBeenCalledWith(
        'counter:changed',
        { count: 5 },
        'CounterStore'
      );
    });
    
    it('should not publish initial value to prevent feedback loops', () => {
      eventStore({
        initialValue: { count: 0 },
        eventType: 'counter:updated',
        publishOnChange: true
      });
      
      // Initial value should not trigger a publish
      expect(publishMock).not.toHaveBeenCalled();
    });
    
    it('should clean up subscriptions when destroy is called', () => {
      const store = eventStore({
        initialValue: { count: 0 },
        eventType: 'counter:updated'
      });
      
      // Call destroy method
      (store as any).destroy();
      
      // Unsubscribe should be called
      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
  
  describe('eventDerived', () => {
    it('should create a readable store based on events', () => {
      const store = eventDerived(
        'user:updated',
        (payload) => `User: ${payload.name}`,
        'No user'
      );
      
      // Initial value should be set
      expect(get(store)).toBe('No user');
      
      // Should have subscribed to the event
      expect(subscribeMock).toHaveBeenCalledWith(
        'user:updated',
        expect.any(Function)
      );
      
      // Extract the callback function
      const handler = subscribeMock.mock.calls[0]?.[1] as ((payload: any) => void) | undefined;
      
      // Simulate event
      handler?.({ name: 'John' });
      
      // Store should be updated with derived value
      expect(get(store)).toBe('User: John');
    });
    
    it('should handle multiple event types', () => {
      const store = eventDerived(
        ['user:created', 'user:updated'],
        (payload) => `User: ${payload.name}`,
        'No user'
      );
      
      // Verify subscription to multiple events
      expect(subscribeMock).toHaveBeenCalledWith(
        ['user:created', 'user:updated'],
        expect.any(Function)
      );
      
      // Extract the callback function
      const handler = subscribeMock.mock.calls[0]?.[1] as ((payload: any) => void) | undefined;
      
      // Simulate event
      handler?.({ name: 'Jane' });
      
      // Store should be updated
      expect(get(store)).toBe('User: Jane');
    });
    
    it('should pass event object to derive function', () => {
      const deriveFn = vi.fn((payload, event) => payload);
      
      const store = eventDerived('test:event', deriveFn, null);
      
      // Extract the callback function
      const handler = subscribeMock.mock.calls[0]?.[1] as ((payload: any, event: any) => void) | undefined;
      
      // Simulate event
      const payload = { data: 'test' };
      const event = { type: 'test:event', payload };
      
      handler?.(payload, event);
      
      // Derive function should receive both payload and event
      expect(deriveFn).toHaveBeenCalledWith(payload, event);
    });
    
    it('should clean up when destroy is called', () => {
      const store = eventDerived('test:event', (p) => p, null);
      
      // Call destroy
      (store as any).destroy();
      
      // Unsubscribe should be called
      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
  
  describe('connectStoreToEvents', () => {
    it('should publish events when store changes', () => {
        const testStore = writable({ value: 'initial' });
        
        // Connect the store to events
        const unsubscribe = connectStoreToEvents(
          testStore,
          'store:updated',
          'TestStore'
        );
        
        // The initial value gets published on connection (which is the correct behavior)
        expect(publishMock).toHaveBeenCalledWith(
          'store:updated',
          { value: 'initial' },
          'TestStore'
        );
        
        // Clear the mock calls to start fresh
        publishMock.mockClear();
        
        // Update the store
        testStore.set({ value: 'changed' });
        
        // Event should be published
        expect(publishMock).toHaveBeenCalledWith(
          'store:updated',
          { value: 'changed' },
          'TestStore'
        );
        
        // Update again
        testStore.update(val => ({ value: val.value + '-updated' }));
        
        // Should publish again (only counting calls after the mockClear)
        expect(publishMock).toHaveBeenCalledTimes(2);
        
        // Clean up
        unsubscribe();
      });
    
    it('should use default source if not provided', () => {
      const testStore = writable('test');
      
      const unsubscribe = connectStoreToEvents(testStore, 'store:updated');
      
      testStore.set('updated');
      
      expect(publishMock).toHaveBeenCalledWith(
        'store:updated',
        'updated',
        'store' // Default source
      );
      
      unsubscribe();
    });
    
    it('should handle primitive values in stores', () => {
      const numberStore = writable(0);
      
      const unsubscribe = connectStoreToEvents(numberStore, 'number:updated');
      
      numberStore.set(42);
      
      expect(publishMock).toHaveBeenCalledWith(
        'number:updated',
        42,
        'store'
      );
      
      unsubscribe();
    });
    
    it('should return a functioning unsubscribe function', () => {
      const testStore = writable('test');
      const unsubscribeSpy = vi.fn();
      
      // Replace the subscribe method of the store
      const originalSubscribe = testStore.subscribe;
      testStore.subscribe = vi.fn(() => unsubscribeSpy);
      
      const unsubscribe = connectStoreToEvents(testStore, 'test:event');
      
      expect(testStore.subscribe).toHaveBeenCalled();
      
      // Call the returned unsubscribe function
      unsubscribe();
      
      // Should call the store's unsubscribe function
      expect(unsubscribeSpy).toHaveBeenCalled();
      
      // Restore original subscribe method
      testStore.subscribe = originalSubscribe;
    });
  });
});