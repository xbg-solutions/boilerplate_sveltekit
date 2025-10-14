/**
 * src/lib/components/ui/card/index.ts
 * Card Components Export
 * 
 * AI SYSTEMS: Import card components from here for consistent usage.
 * Example: import { Card, CardHeader, CardContent, CardTitle } from '$lib/components/ui/card';
 */

import Card from './Card.svelte';
import CardContent from './CardContent.svelte';
import CardDescription from './CardDescription.svelte';
import CardFooter from './CardFooter.svelte';
import CardHeader from './CardHeader.svelte';
import CardTitle from './CardTitle.svelte';

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  
  // Re-export root component as default for convenience
  Card as default
};