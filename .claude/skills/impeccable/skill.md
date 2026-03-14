# Impeccable Frontend Design

**Skill: `impeccable`**

A design language that makes AI assistants better at frontend design. Builds on Anthropic's foundation with curated patterns and anti-patterns for creating impeccable UIs.

**Source:** [pbakaus/impeccable](https://github.com/pbakaus/impeccable) — The design vocabulary with 1 skill, 17 commands, and curated anti-patterns for impeccable frontend design

**Official site:** [impeccable.style](https://impeccable.style/)

---

## When to Use This Skill

- Designing or refining UI/UX for frontend components
- Making typography, color, layout, or motion decisions
- Avoiding common design anti-patterns (cards nested in cards, poor contrast, generic templates)
- Creating visually cohesive and accessible interfaces
- Breaking away from predictable LLM design patterns (Inter font, purple gradients, etc.)

---

## What Impeccable Provides

Impeccable addresses a core problem: Every LLM learned from the same generic templates. Without guidance, you get the same predictable mistakes:
- Inter font everywhere
- Purple gradients
- Cards nested in cards
- Gray text on colored backgrounds
- Generic, template-driven layouts

### Key Features

- **Curated Design Patterns**: Typography, color, layout, motion, and more
- **Anti-Pattern Library**: Learn what NOT to do for better design outcomes
- **17 Design Commands**: Ready-to-use commands for specific design tasks
- **Multi-Tool Support**: Works with Cursor, Claude Code, Gemini CLI, Codex CLI
- **Single Source of Truth**: Transforms skills into provider-specific formats
- **Builds on Anthropic's Foundation**: Extends the official `frontend-design` skill

---

## Integration with This Boilerplate

Use Impeccable when:
- Creating new UI components (especially with shadcn-svelte)
- Refining existing component designs
- Making decisions about color schemes, typography, spacing
- Reviewing design consistency across the application
- Avoiding design anti-patterns in Svelte/SvelteKit apps

Impeccable complements the `shadcn_svelte` skill by providing design guidance while shadcn provides the component implementation.

---

## Design Principles from Impeccable

While the full skill library provides detailed guidance, key principles include:

1. **Typography**: Move beyond default system fonts; consider purpose and hierarchy
2. **Color**: Avoid low-contrast text; use intentional color palettes
3. **Layout**: Prevent excessive nesting; maintain visual breathing room
4. **Consistency**: Follow established patterns within the design system
5. **Accessibility**: Ensure readable contrast, keyboard navigation, semantic HTML

---

## Quick Reference

```bash
# Installation (if needed)
npx skills add pbakaus/impeccable

# Access via Claude Code
# The skill is available through .claude/skills/ integration
```

For detailed design commands and anti-patterns, refer to:
- Main repository: https://github.com/pbakaus/impeccable
- Skill documentation: https://github.com/pbakaus/impeccable/blob/main/source/skills/frontend-design/SKILL.md
- Official site: https://impeccable.style/

---

## Relationship to Other Skills

| When working on... | Use Impeccable for... | Also check... |
|---|---|---|
| shadcn-svelte components | Design refinement, color/typography choices | `shadcn_svelte` (implementation) |
| Svelte 5 components | Layout patterns, visual hierarchy | `svelte5_sveltekit` (reactivity patterns) |
| Custom UI blocks | Design consistency, anti-pattern avoidance | `xbg_boilerplate_sveltekit` (component conventions) |
| Tailwind styling | Color systems, spacing decisions | `svelte5_sveltekit` (Tailwind v4 integration) |
