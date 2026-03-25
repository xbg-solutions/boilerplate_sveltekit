import { writable } from 'svelte/store';

export interface RequestHandlerState {
  requestCount: number;
  activeRequests: string[];
}

export const requestHandlerStore = writable<RequestHandlerState>({
  requestCount: 0,
  activeRequests: []
});