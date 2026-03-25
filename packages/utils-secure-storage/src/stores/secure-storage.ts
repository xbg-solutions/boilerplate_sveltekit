import { writable } from 'svelte/store';

export interface SecureStorageState {
  encrypted: boolean;
  namespace: string | null;
}

export const secureStorageStore = writable<SecureStorageState>({
  encrypted: true,
  namespace: null
});