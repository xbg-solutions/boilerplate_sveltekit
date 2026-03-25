import { writable } from 'svelte/store';

export interface AuthServiceState {
  isInitialized: boolean;
  lastOperation: string | null;
}

export const authServiceStore = writable<AuthServiceState>({
  isInitialized: false,
  lastOperation: null
});