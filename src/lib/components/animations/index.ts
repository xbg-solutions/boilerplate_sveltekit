export { default as FadeTransition } from './FadeTransition.svelte';
export { default as SlideTransition } from './SlideTransition.svelte';
export { default as ScaleTransition } from './ScaleTransition.svelte';
export { default as FlipTransition } from './FlipTransition.svelte';
export { default as PageTransition } from './PageTransition.svelte';
export { default as StaggeredAnimation } from './StaggeredAnimation.svelte';

// Custom transition utilities
export const customTransitions = {
  /**
   * Bounce in animation
   */
  bounceIn: (node: Element, { duration = 600, delay = 0 } = {}) => {
    return {
      duration,
      delay,
      css: (t: number) => {
        const eased = 1 - Math.pow(1 - t, 3);
        const bounce = Math.sin(eased * Math.PI * 3) * 0.3 * (1 - eased);
        return `
          transform: scale(${eased + bounce});
          opacity: ${t};
        `;
      }
    };
  },

  /**
   * Slide and fade combined
   */
  slideFade: (node: Element, { 
    duration = 400, 
    delay = 0, 
    x = 0, 
    y = 20 
  } = {}) => {
    return {
      duration,
      delay,
      css: (t: number) => {
        return `
          transform: translate(${(1 - t) * x}px, ${(1 - t) * y}px);
          opacity: ${t};
        `;
      }
    };
  },

  /**
   * Typewriter effect
   */
  typewriter: (node: Element, { duration = 1000, delay = 0 } = {}) => {
    const text = node.textContent;
    const length = text?.length || 0;
    
    return {
      duration,
      delay,
      tick: (t: number) => {
        const i = Math.round(length * t);
        node.textContent = text?.slice(0, i) || '';
      }
    };
  },

  /**
   * Pulse effect
   */
  pulse: (node: Element, { 
    duration = 1000, 
    delay = 0, 
    intensity = 0.1 
  } = {}) => {
    return {
      duration,
      delay,
      css: (t: number) => {
        const scale = 1 + Math.sin(t * Math.PI * 2) * intensity;
        return `transform: scale(${scale});`;
      }
    };
  }
};

// Easing functions
export const customEasing = {
  bounceOut: (t: number) => {
    const a = 4 / 11;
    const b = 8 / 11;
    const c = 9 / 10;
    const ca = 4356 / 361;
    const cb = 35442 / 1805;
    const cc = 16061 / 1805;
    const t2 = t * t;
    return t < a
      ? 7.5625 * t2
      : t < b
      ? 9.075 * t2 - 9.9 * t + 3.4
      : t < c
      ? ca * t2 - cb * t + cc
      : 10.8 * t * t - 20.52 * t + 10.72;
  },
  
  elasticOut: (t: number) => {
    return Math.sin(-13 * (t + 1) * Math.PI / 2) * Math.pow(2, -10 * t) + 1;
  }
};