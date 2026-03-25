import { writable } from 'svelte/store';

export interface ApiServiceState {
  isOnline: boolean;
  requestCount: number;
}

export const apiServiceStore = writable<ApiServiceState>({
  isOnline: true,
  requestCount: 0
});