import { writable } from 'svelte/store';

export interface RoleBasedAccess {
  roles: string[];
  permissions: string[];
}

export const rbacStore = writable<RoleBasedAccess>({
  roles: [],
  permissions: []
});