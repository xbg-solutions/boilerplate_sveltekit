# Animation Components

Reusable transition and animation components for smooth UI interactions using Svelte's built-in transitions.

## Components

### FadeTransition

Smooth fade in/out transitions.

**Location**: `$lib/components/animations/FadeTransition.svelte`

**Props:**
- `show`: boolean - Controls visibility (default: true)
- `duration`: number - Animation duration in ms (default: 300)
- `delay`: number - Delay before animation starts in ms (default: 0)
- `easing`: EasingFunction - Svelte easing function (default: quintOut)

**Usage:**
```svelte
<script>
  import { FadeTransition } from '$lib/components/animations';
  let visible = true;
</script>

<FadeTransition show={visible} duration={500}>
  <div>Content that fades in/out</div>
</FadeTransition>
```

**Features:**
- Asymmetric transitions (exit 30% faster than entry)
- Customizable easing functions
- Delay support for staggered animations

### SlideTransition

Slide animations (horizontal or vertical).

**Location**: `$lib/components/animations/SlideTransition.svelte`

**Props:**
- `show`: boolean - Controls visibility
- `direction`: 'left' | 'right' | 'up' | 'down' - Slide direction
- `duration`: number - Animation duration in ms
- `distance`: number - Distance to slide in pixels

**Usage:**
```svelte
<SlideTransition show={isOpen} direction="left" duration={400}>
  <SidePanel />
</SlideTransition>
```

**Use Cases:**
- Slide-in panels
- Drawer components
- Mobile menus
- Tooltips

### ScaleTransition

Scale-based animations for zoom effects.

**Location**: `$lib/components/animations/ScaleTransition.svelte`

**Props:**
- `show`: boolean - Controls visibility
- `start`: number - Starting scale (default: 0)
- `duration`: number - Animation duration in ms
- `opacity`: boolean - Include opacity transition

**Usage:**
```svelte
<ScaleTransition show={isVisible} start={0.8} opacity={true}>
  <ModalContent />
</ScaleTransition>
```

**Use Cases:**
- Modal dialogs
- Popups
- Tooltips
- Image zoom effects

### FlipTransition

FLIP (First, Last, Invert, Play) animation technique for smooth layout transitions.

**Location**: `$lib/components/animations/FlipTransition.svelte`

**Props:**
- `duration`: number - Animation duration in ms
- `easing`: EasingFunction - Svelte easing function

**Usage:**
```svelte
<script>
  import { flip } from 'svelte/animate';
  import { FlipTransition } from '$lib/components/animations';
</script>

{#each items as item (item.id)}
  <FlipTransition>
    <div>{item.name}</div>
  </FlipTransition>
{/each}
```

**Use Cases:**
- List reordering
- Grid rearrangements
- Drag and drop interfaces
- Animated sorting

### StaggeredAnimation

Staggered entrance animations for lists.

**Location**: `$lib/components/animations/StaggeredAnimation.svelte`

**Props:**
- `items`: Array - Items to animate
- `staggerDelay`: number - Delay between each item in ms (default: 100)
- `duration`: number - Individual item animation duration
- `animation`: 'fade' | 'slide' | 'scale' - Animation type

**Usage:**
```svelte
<script>
  import { StaggeredAnimation } from '$lib/components/animations';

  const items = [
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' }
  ];
</script>

<StaggeredAnimation {items} staggerDelay={150} animation="fade">
  <slot {item} />
</StaggeredAnimation>
```

**Use Cases:**
- List reveals
- Card grids
- Navigation menus
- Feature showcases

### PageTransition

Page navigation transitions (also in layout/).

**Location**: `$lib/components/animations/PageTransition.svelte`

**Props:**
- `duration`: number - Transition duration
- `type`: 'fade' | 'slide' | 'scale' - Transition type

**Usage:**
```svelte
<!-- In +layout.svelte -->
<script>
  import { PageTransition } from '$lib/components/animations';
  import { page } from '$app/stores';
</script>

{#key $page.url.pathname}
  <PageTransition type="fade">
    <slot />
  </PageTransition>
{/key}
```

## Animation Patterns

### Conditional Content with Fade

```svelte
<script>
  import { FadeTransition } from '$lib/components/animations';
  let showContent = false;
</script>

<button on:click={() => showContent = !showContent}>
  Toggle
</button>

<FadeTransition show={showContent}>
  <p>This content fades in and out</p>
</FadeTransition>
```

### Staggered List Entrance

```svelte
<script>
  import { StaggeredAnimation } from '$lib/components/animations';

  const features = [
    'Feature 1',
    'Feature 2',
    'Feature 3'
  ];
</script>

<StaggeredAnimation items={features} let:item staggerDelay={100}>
  <div class="feature-card">
    {item}
  </div>
</StaggeredAnimation>
```

### Modal with Scale and Fade

```svelte
<script>
  import { ScaleTransition } from '$lib/components/animations';
  let isOpen = false;
</script>

<ScaleTransition show={isOpen} start={0.95} opacity={true}>
  <div class="modal">
    <h2>Modal Title</h2>
    <p>Modal content</p>
  </div>
</ScaleTransition>
```

### Slide-in Side Panel

```svelte
<script>
  import { SlideTransition } from '$lib/components/animations';
  let isOpen = false;
</script>

<SlideTransition show={isOpen} direction="right" duration={300}>
  <aside class="side-panel">
    <nav>Navigation items</nav>
  </aside>
</SlideTransition>
```

## Svelte Transitions

These components wrap Svelte's built-in transitions:
- `fade` - Opacity transitions
- `slide` - Sliding with height/width animation
- `scale` - Scaling transformations
- `fly` - Combined slide and fade

**Easing Functions** (from `svelte/easing`):
- `linear`, `quintIn`, `quintOut`, `quintInOut`
- `cubicIn`, `cubicOut`, `cubicInOut`
- `elasticOut`, `bounceOut`

## Performance Considerations

1. **Use CSS transforms** - Scale, translate are GPU-accelerated
2. **Avoid layout thrashing** - Transitions that trigger reflow are expensive
3. **Limit concurrent animations** - Too many can cause jank
4. **Use `will-change`** - Hint browser about upcoming animations
5. **Test on mobile devices** - Animations can be CPU-intensive

## Accessibility

- **Respect prefers-reduced-motion**:
  ```svelte
  <script>
    import { reducedMotion } from '$lib/stores/accessibility';
    $: duration = $reducedMotion ? 0 : 300;
  </script>

  <FadeTransition {duration}>
    <Content />
  </FadeTransition>
  ```
- **Don't rely solely on animation** for information
- **Ensure focus management** during transitions
- **Provide skip options** for lengthy animations

## Best Practices

1. **Keep animations fast** (200-400ms for most cases)
2. **Use appropriate easing** - `ease-out` for entrances, `ease-in` for exits
3. **Maintain consistency** across the app
4. **Test performance** on low-end devices
5. **Provide reduced motion alternatives**
6. **Use staggering sparingly** - Can delay content visibility
7. **Combine with semantic transitions** - Use `{#key}` blocks

## Integration with SHADCN Components

Wrap UI components with transitions:

```svelte
<script>
  import { FadeTransition } from '$lib/components/animations';
  import { Dialog, DialogContent } from '$lib/components/ui/dialog';
</script>

<Dialog bind:open={isOpen}>
  <FadeTransition show={isOpen}>
    <DialogContent>
      Dialog content with custom fade
    </DialogContent>
  </FadeTransition>
</Dialog>
```

## Component Count: 6

- FadeTransition
- SlideTransition
- ScaleTransition
- FlipTransition
- StaggeredAnimation
- PageTransition
