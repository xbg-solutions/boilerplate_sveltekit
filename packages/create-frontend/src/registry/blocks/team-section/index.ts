export { default as TeamSection01 } from './TeamSection01.svelte';
export { default as TeamSection02 } from './TeamSection02.svelte';
export { default as TeamSection03 } from './TeamSection03.svelte';
export { default as TeamSection04 } from './TeamSection04.svelte';

export interface TeamMember {
  name: string;
  role?: string;
  bio?: string;
  avatarUrl?: string;
  twitter?: string;
  linkedin?: string;
}
