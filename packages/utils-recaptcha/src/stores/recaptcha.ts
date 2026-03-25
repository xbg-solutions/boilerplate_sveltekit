import { writable } from 'svelte/store';

export interface RecaptchaState {
  loaded: boolean;
  token: string | null;
}

export const recaptchaStore = writable<RecaptchaState>({
  loaded: false,
  token: null
});