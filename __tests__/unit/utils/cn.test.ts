/**
 * src/lib/utils/cn.test.ts
 * Behavioral tests for cn utility function
 * 
 * Following our testing philosophy: Test WHAT, not HOW
 * Tests focus on input/output behavior and practical usage scenarios
 */

import { describe, it, expect } from 'vitest';
import { cn } from '@xbg.solutions/bpsk-core';

describe('cn utility function', () => {
  describe('Basic Functionality', () => {
    it('returns empty string when no arguments provided', () => {
      expect(cn()).toBe('');
    });

    it('returns single class when one argument provided', () => {
      expect(cn('text-red-500')).toBe('text-red-500');
    });

    it('combines multiple class strings', () => {
      expect(cn('px-4', 'py-2', 'bg-blue-500')).toBe('px-4 py-2 bg-blue-500');
    });

    it('handles undefined and null values gracefully', () => {
      expect(cn('px-4', undefined, 'py-2', null, 'bg-blue-500')).toBe('px-4 py-2 bg-blue-500');
    });

    it('handles empty strings', () => {
      expect(cn('px-4', '', 'py-2')).toBe('px-4 py-2');
    });
  });

  describe('Conditional Class Application', () => {
    it('applies conditional classes when condition is true', () => {
      const isActive = true;
      expect(cn('base-class', isActive && 'active-class')).toBe('base-class active-class');
    });

    it('ignores conditional classes when condition is false', () => {
      const isActive = false;
      expect(cn('base-class', isActive && 'active-class')).toBe('base-class');
    });

    it('handles multiple conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      const isLoading = true;
      
      expect(cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class',
        isLoading && 'loading-class'
      )).toBe('base-class active-class loading-class');
    });
  });

  describe('Tailwind CSS Conflict Resolution', () => {
    it('resolves conflicting padding classes (later wins)', () => {
      expect(cn('px-4', 'px-6')).toBe('px-6');
    });

    it('resolves conflicting margin classes', () => {
      expect(cn('m-2', 'm-4', 'm-1')).toBe('m-1');
    });

    it('resolves conflicting text colors', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('resolves conflicting background colors', () => {
      expect(cn('bg-red-500', 'bg-blue-500', 'bg-green-500')).toBe('bg-green-500');
    });

    it('keeps non-conflicting classes', () => {
      expect(cn('px-4', 'py-2', 'px-6')).toBe('py-2 px-6');
    });
  });

  describe('Array and Object Inputs', () => {
    it('handles array of class names', () => {
      expect(cn(['px-4', 'py-2', 'bg-blue-500'])).toBe('px-4 py-2 bg-blue-500');
    });

    it('handles object with boolean values', () => {
      expect(cn({
        'px-4': true,
        'py-2': true,
        'bg-blue-500': false,
        'text-white': true
      })).toBe('px-4 py-2 text-white');
    });

    it('combines arrays, objects, and strings', () => {
      expect(cn(
        'base-class',
        ['px-4', 'py-2'],
        { 'bg-blue-500': true, 'text-red-500': false },
        'final-class'
      )).toBe('base-class px-4 py-2 bg-blue-500 final-class');
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('works with button variant logic', () => {
      const variant = 'primary';
      const size = 'lg';
      const disabled = false;
      const className = 'custom-button';

      expect(cn(
        'inline-flex items-center justify-center',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-500 text-white',
        size === 'sm' && 'px-2 py-1',
        size === 'lg' && 'px-6 py-3',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )).toBe('inline-flex items-center justify-center bg-blue-500 text-white px-6 py-3 custom-button');
    });

    it('works with form input states', () => {
      const hasError = true;
      const isFocused = false;
      const isDisabled = false;

      expect(cn(
        'border rounded px-3 py-2',
        hasError && 'border-red-500',
        isFocused && 'ring-2 ring-blue-500',
        isDisabled && 'bg-gray-100 cursor-not-allowed',
        !hasError && 'border-gray-300'
      )).toBe('border rounded px-3 py-2 border-red-500');
    });

    it('resolves conflicts in component variants', () => {
      expect(cn(
        'px-4 py-2 bg-blue-500', // base styles
        'px-6 bg-red-500' // override styles
      )).toBe('py-2 px-6 bg-red-500');
    });
  });

  describe('Edge Cases', () => {
    it('handles deeply nested arrays', () => {
      expect(cn(['px-4', ['py-2', ['bg-blue-500']]])).toBe('px-4 py-2 bg-blue-500');
    });

    it('handles mixed types in complex scenarios', () => {
      const result = cn(
        'base',
        undefined,
        ['array-class'],
        { 'object-class': true, 'false-class': false },
        null,
        '',
        'final'
      );
      expect(result).toBe('base array-class object-class final');
    });

    it('deduplicates identical classes', () => {
      expect(cn('px-4', 'py-2', 'px-4', 'py-2')).toBe('px-4 py-2');
    });

    it('handles numeric inputs', () => {
      expect(cn('px-4', 0 && 'hidden', 1 && 'block')).toBe('px-4 block');
    });
  });

  describe('Performance Characteristics', () => {
    it('handles large numbers of classes efficiently', () => {
      const manyClasses = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      const result = cn(...manyClasses);
      
      expect(result).toContain('class-0');
      expect(result).toContain('class-99');
      expect(result.split(' ')).toHaveLength(100);
    });

    it('handles repeated calls consistently', () => {
      const inputs = ['px-4', 'py-2', 'bg-blue-500'];
      const result1 = cn(...inputs);
      const result2 = cn(...inputs);
      
      expect(result1).toBe(result2);
      expect(result1).toBe('px-4 py-2 bg-blue-500');
    });
  });
});