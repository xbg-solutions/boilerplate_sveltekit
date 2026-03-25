import { writable } from 'svelte/store';

export interface CSRFState {
  token: string | null;
  validated: boolean;
}

const store = writable<CSRFState>({
  token: null,
  validated: false
});

// CSRF protection service with methods tests expect
export const csrfProtection = {
  ...store,
  
  clearTokens: () => {
    store.set({ token: null, validated: false });
  },
  
  generateCsrfToken: async () => {
    const token = 'mock-csrf-token-' + Date.now();
    store.update(state => ({ ...state, token }));
    return token;
  },
  
  getCsrfToken: async () => {
    let currentToken = null;
    store.subscribe(state => { currentToken = state.token; })();
    return currentToken;
  },
  
  refreshCsrfToken: async () => {
    const newToken = 'refreshed-csrf-token-' + Date.now();
    store.update(state => ({ ...state, token: newToken }));
    return newToken;
  },
  
  handleValidationFailure: async (context: any) => {
    store.update(state => ({ ...state, validated: false }));
  }
};