import { writable } from 'svelte/store';

export interface TabSyncState {
  activeTab: string | null;
  syncEnabled: boolean;
  lastSync: number;
}

const tabSyncStore = writable<TabSyncState>({
  activeTab: null,
  syncEnabled: true,
  lastSync: Date.now()
});

export const tabSyncService = {
  ...tabSyncStore,
  
  syncData: (data: any) => {
    tabSyncStore.update(state => ({
      ...state,
      lastSync: Date.now()
    }));
  },
  
  broadcastMessage: (message: any) => {
    // Broadcast to other tabs
  },
  
  enable: () => {
    tabSyncStore.update(state => ({ ...state, syncEnabled: true }));
  },
  
  disable: () => {
    tabSyncStore.update(state => ({ ...state, syncEnabled: false }));
  }
};