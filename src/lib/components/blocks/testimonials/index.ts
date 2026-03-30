export { default as Testimonials01 } from './Testimonials01.svelte';
export { default as Testimonials02 } from './Testimonials02.svelte';
export { default as Testimonials03 } from './Testimonials03.svelte';
export { default as Testimonials04 } from './Testimonials04.svelte';
export { default as Testimonials05 } from './Testimonials05.svelte';
export { default as Testimonials06 } from './Testimonials06.svelte';
export { default as Testimonials07 } from './Testimonials07.svelte';

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  rating?: number;
}
