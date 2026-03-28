---
name: impeccable
description: "Design vocabulary and skills for frontend development. 21 skills including /polish, /distill, /audit, /typeset, /overdrive, and an enhanced frontend-design skill with curated anti-patterns. Source: pbakaus/impeccable v1.6.0"
globs: ["**/*.svelte", "**/*.css", "**/*.html"]
alwaysApply: false
---

# Impeccable Frontend Design

A design language that makes AI assistants better at frontend design. Builds on Anthropic's foundation with curated patterns and anti-patterns for creating impeccable UIs.

**Source:** [pbakaus/impeccable](https://github.com/pbakaus/impeccable) v1.6.0

## Available Sub-Skills

Each sub-directory contains a `SKILL.md` with detailed guidance:

### Core Design
- `frontend-design/` — Main design skill with reference docs for color, contrast, typography, spatial design, motion, responsive design, interaction design, and UX writing

### Design Commands (User-Invocable)
- `adapt/` — Adapt designs for different contexts
- `animate/` — Add motion and animation
- `arrange/` — Layout and spatial arrangement
- `audit/` — Design audit and review
- `bolder/` — Make designs more bold and impactful
- `clarify/` — Improve clarity and readability
- `colorize/` — Color system and palette work
- `critique/` — Design critique with heuristics scoring, cognitive load analysis, and personas
- `delight/` — Add delight and personality
- `distill/` — Simplify and reduce complexity
- `extract/` — Extract design patterns
- `harden/` — Make designs more robust
- `normalize/` — Normalize and standardize
- `onboard/` — Onboarding flow design
- `optimize/` — Performance and design optimization
- `overdrive/` — Push designs further
- `polish/` — Final polish pass
- `quieter/` — Make designs calmer and less noisy
- `teach-impeccable/` — Set up design context for the project
- `typeset/` — Typography refinement

## Usage

Start with the `frontend-design/SKILL.md` for foundational guidance, then use individual command skills as needed. The `teach-impeccable` skill should be run first to establish design context via `.impeccable.md`.
