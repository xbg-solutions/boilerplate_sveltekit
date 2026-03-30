export { default as Footer01 } from './Footer01.svelte';
export { default as Footer02 } from './Footer02.svelte';
export { default as Footer03 } from './Footer03.svelte';
export { default as Footer04 } from './Footer04.svelte';
export { default as Footer05 } from './Footer05.svelte';
export { default as Footer06 } from './Footer06.svelte';
export { default as Footer07 } from './Footer07.svelte';
export { default as Footer08 } from './Footer08.svelte';
export { default as Footer09 } from './Footer09.svelte';

export interface FooterLink {
	label: string;
	href?: string;
}

export interface FooterColumn {
	heading: string;
	links: FooterLink[];
}
