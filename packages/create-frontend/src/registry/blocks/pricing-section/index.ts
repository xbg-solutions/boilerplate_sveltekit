export { default as PricingSection01 } from './PricingSection01.svelte';
export { default as PricingSection02 } from './PricingSection02.svelte';
export { default as PricingSection03 } from './PricingSection03.svelte';
export { default as PricingSection04 } from './PricingSection04.svelte';
export { default as PricingSection05 } from './PricingSection05.svelte';

export interface PricingPlan {
	name: string;
	price: string;
	period?: string;
	description?: string;
	features: string[];
	ctaLabel?: string;
	highlighted?: boolean;
}

export interface FAQ {
	q: string;
	a: string;
}
