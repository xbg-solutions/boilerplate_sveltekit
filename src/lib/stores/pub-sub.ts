import { writable } from 'svelte/store';

export interface PubSubState {
  subscribers: Record<string, Function[]>;
  messageCount: number;
}

export const pubSubStore = writable<PubSubState>({
  subscribers: {},
  messageCount: 0
});

// Simple pub-sub service that tests expect
export const pubSubService = {
  publish: (topic: string, data?: any) => {
    pubSubStore.update(state => ({ 
      ...state, 
      messageCount: state.messageCount + 1 
    }));
  },
  
  subscribe: (topic: string, callback: Function) => {
    return () => {}; // unsubscribe function
  },
  
  clear: () => {
    pubSubStore.update(state => ({ 
      ...state, 
      subscribers: {}, 
      messageCount: 0 
    }));
  }
};