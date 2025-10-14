import { writable } from 'svelte/store';

export interface UserCreationState {
  isCreating: boolean;
  lastCreated: string | null;
  error: string | null;
}

export const userCreationStore = writable<UserCreationState>({
  isCreating: false,
  lastCreated: null,
  error: null
});

// Placeholder function that tests expect
export const ensureUserExists = async (uid: string) => {
  return true;
};