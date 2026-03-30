export { default as FaqSection01 } from './FaqSection01.svelte';
export { default as FaqSection02 } from './FaqSection02.svelte';
export { default as FaqSection03 } from './FaqSection03.svelte';
export { default as FaqSection04 } from './FaqSection04.svelte';
export { default as FaqSection05 } from './FaqSection05.svelte';

export interface FaqItem {
	question: string;
	answer: string;
	category?: string;
}
