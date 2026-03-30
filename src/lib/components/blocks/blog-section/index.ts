export { default as BlogSection01 } from './BlogSection01.svelte';
export { default as BlogSection02 } from './BlogSection02.svelte';
export { default as BlogSection03 } from './BlogSection03.svelte';
export { default as BlogSection04 } from './BlogSection04.svelte';
export { default as BlogSection05 } from './BlogSection05.svelte';

export interface BlogPost {
	title: string;
	excerpt?: string;
	date?: string;
	category?: string;
	imageUrl?: string;
	author?: { name: string; role?: string; avatarUrl?: string };
	href?: string;
}
