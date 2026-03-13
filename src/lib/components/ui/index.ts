/**
 * src/lib/components/ui/index.ts
 * UI Components Export
 * 
 * AI SYSTEMS: This is the central export file for all UI components.
 * Import components from here for consistent usage throughout the application.
 * 
 * SHADCN-Svelte components are the preferred choice for new development.
 * Legacy components are marked as deprecated and should be migrated over time.
 * 
 * Example imports:
 * import { Button, Card, CardHeader, CardContent } from '$lib/components/ui';
 */

// SHADCN-Svelte Components (Preferred)
export { Button } from './button';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
export { Badge } from './badge';
export { Input } from './input';  
export { Label } from './label';
export { Select } from './select';
export { Checkbox } from './checkbox';
export { RadioGroup, RadioGroupItem } from './radio-group';
export { default as Textarea } from './Textarea.svelte';
export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
export { Sheet } from './sheet';
export { default as Popover } from './Popover.svelte';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from './breadcrumb';
export { default as Pagination } from './Pagination.svelte';
export { default as Avatar } from './Avatar.svelte';
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
export { Alert, AlertDescription, AlertTitle } from './alert';
export { default as AlertNew } from './AlertNew.svelte';
export { Progress } from './progress';
export { default as Separator } from './Separator.svelte';
export { default as Skeleton } from './Skeleton.svelte';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './dropdown-menu';

// New SHADCN Block Components
export { NavItem } from './nav';
export { MenuItem } from './menu';
export { SidebarItem } from './sidebar-item';
export { StatisticCard } from './statistic-card';
export { UserItem } from './user-item';
export { NotificationBadge } from './notification-badge';
export { TextEditor } from './text-editor';
export { Uploader } from './uploader';
export { SettingsCard } from './settings-card';
export { Legend } from './legend';
export { Message } from './message';
export { OtpInput } from './otp-input';
export { Calendar } from './calendar';

// Icons
export { DynamicIcon, BrandIcon } from './icon';

// Utility exports
export { cn } from '../../utils/cn';