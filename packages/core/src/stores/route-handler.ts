import { writable } from 'svelte/store';

export interface RouteHandlerState {
  currentRoute: string | null;
  isProtected: boolean;
}

export const routeHandlerStore = writable<RouteHandlerState>({
  currentRoute: null,
  isProtected: false
});