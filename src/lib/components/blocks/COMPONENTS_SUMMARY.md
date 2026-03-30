# Block Components Summary

## Testimonials (7 components)

### Testimonials01.svelte
- Single centered testimonial with large quote
- Avatar placeholder below with name
- Optional role/company metadata
- No star rating
- Props: `class?`, `testimonial?: Testimonial`

### Testimonials02.svelte
- 2-column card layout
- Centered quotes with avatars
- Uses first 2 testimonials by default
- Props: `class?`, `testimonials?: Testimonial[]`

### Testimonials03.svelte
- Split layout: image (left) + content (right)
- Image placeholder with 4:3 aspect ratio
- Star rating above quote
- Author details below quote
- Props: `class?`, `testimonial?: Testimonial`, `imageUrl?: string`

### Testimonials04.svelte
- 3-column card grid
- Star rating + quote + avatar + author
- Uses all 3 default testimonials
- Props: `class?`, `testimonials?: Testimonial[]`

### Testimonials05.svelte
- Dark background (foreground/background inverted)
- Centered single testimonial
- Star rating visible on dark background
- Props: `class?`, `testimonial?: Testimonial`

### Testimonials06.svelte
- Centered header section (eyebrow + title + description)
- 3-column card grid below
- Customizable title and description
- Props: `class?`, `title?`, `description?`, `testimonials?: Testimonial[]`

### Testimonials07.svelte
- Masonry/alternating layout
- Large featured card (left) + 2 smaller cards (right)
- Requires 3 testimonials minimum
- Props: `class?`, `testimonials?: Testimonial[]`

## Team Section (4 components)

### TeamSection01.svelte
- Centered header (eyebrow + title + description)
- 3-column avatar grid (responsive to 2 on tablet)
- Avatar initials, name, role, and bio
- Uses all 6 default members
- Props: `class?`, `title?`, `description?`, `members?: TeamMember[]`

### TeamSection02.svelte
- Left-aligned header
- 3-column avatar grid with social links
- Twitter and LinkedIn icon buttons with hover states
- Props: `class?`, `title?`, `description?`, `members?: TeamMember[]`

### TeamSection03.svelte
- Centered header
- Compact 4-column avatar layout (2 cols on mobile)
- Only avatar, name, and role (no bio)
- Uses first 4 members by default
- Props: `class?`, `title?`, `description?`, `members?: TeamMember[]`

### TeamSection04.svelte
- Left-aligned header
- Horizontal row layout (avatar + details | social links)
- Dividers between rows
- Social links on the right
- Uses first 4 members by default
- Props: `class?`, `title?`, `description?`, `members?: TeamMember[]`

## Key Features

All components:
- Use Svelte 5 runes ($props(), $state(), $derived())
- Tailwind CSS only (no scoped styles)
- TypeScript throughout
- Inline SVG icons (star rating, Twitter/X, LinkedIn)
- Import `{ cn }` from '$lib/utils/cn'
- Support responsive design (mobile-first)
- Include sensible defaults with customization support

## Types

### Testimonial
```ts
interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  rating?: number; // 1-5 stars
}
```

### TeamMember
```ts
interface TeamMember {
  name: string;
  role?: string;
  bio?: string;
  avatarUrl?: string;
  twitter?: string;
  linkedin?: string;
}
```

## File Structure

```
src/lib/components/blocks/
├── testimonials/
│   ├── Testimonials01.svelte
│   ├── Testimonials02.svelte
│   ├── Testimonials03.svelte
│   ├── Testimonials04.svelte
│   ├── Testimonials05.svelte
│   ├── Testimonials06.svelte
│   ├── Testimonials07.svelte
│   └── index.ts
└── team-section/
    ├── TeamSection01.svelte
    ├── TeamSection02.svelte
    ├── TeamSection03.svelte
    ├── TeamSection04.svelte
    └── index.ts
```

All components export types and default exports from index.ts for clean imports:
```ts
import { Testimonials01, type Testimonial } from '$lib/components/blocks/testimonials';
import { TeamSection01, type TeamMember } from '$lib/components/blocks/team-section';
```
