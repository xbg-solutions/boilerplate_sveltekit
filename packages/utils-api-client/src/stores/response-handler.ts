import { writable } from 'svelte/store';

export interface ResponseHandlerState {
  responseCount: number;
  errors: string[];
}

export const responseHandlerStore = writable<ResponseHandlerState>({
  responseCount: 0,
  errors: []
});