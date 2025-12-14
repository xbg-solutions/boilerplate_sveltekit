# Sanitizer Utility

## Overview

Input sanitization utility for preventing XSS attacks and cleaning user-provided data. Supports multiple sanitization levels, recursive sanitization of complex objects, and HTML sanitization with configurable allowed tags.

**Location:** `src/lib/utils/sanitizer.ts`

## Key Features

- Three sanitization levels: strict, medium, basic
- XSS prevention and HTML sanitization
- Recursive sanitization of objects and arrays
- Configurable allowed HTML tags and attributes
- Type-safe implementation
- Integration with error handling

## Sanitization Levels

### Strict

Strips all HTML tags and special characters. Safest option for text-only content.

```typescript
sanitize('<script>alert("xss")</script>', { level: 'strict' });
// Output: 'scriptalertxssscript'
```

### Medium

Allows specified HTML tags while removing dangerous content. Good for rich text editors.

```typescript
sanitize('<p>Hello <script>alert("xss")</script></p>', { level: 'medium' });
// Output: '<p>Hello </p>'
```

### Basic

Escapes HTML entities but preserves the text. Default level.

```typescript
sanitize('<p>Hello</p>', { level: 'basic' });
// Output: '&lt;p&gt;Hello&lt;/p&gt;'
```

## Key Functions

### sanitize

Main sanitizer function that handles strings, objects, and arrays.

```typescript
function sanitize<T>(
  input: T,
  options?: SanitizerOptions
): RecursivelyProcessed<T>
```

**Options:**
- `level?: 'strict' | 'medium' | 'basic'` - Sanitization level (default: 'basic')
- `preserveCase?: boolean` - Keep original casing (default: true)
- `preserveWhitespace?: boolean` - Keep whitespace (default: true)
- `maxLength?: number` - Maximum string length

**Usage:**
```typescript
// String sanitization
const clean = sanitize(userInput, { level: 'strict' });

// Object sanitization
const cleanObj = sanitize({
  name: '<script>alert("xss")</script>',
  email: 'user@example.com'
}, { level: 'strict' });
// Result: { name: 'scriptalertxssscript', email: 'user@example.com' }

// Array sanitization
const cleanArray = sanitize(['<b>test</b>', 'normal'], { level: 'medium' });
```

### safeSanitize

Safe version that never throws errors.

```typescript
async function safeSanitize<T>(
  input: T,
  options?: SanitizerOptions
): Promise<RecursivelyProcessed<T>>
```

**Usage:**
```typescript
const result = await safeSanitize(userInput, { level: 'strict' });
// Always returns a result, never throws
```

### createSanitizer

Creates a sanitizer function with predefined options.

```typescript
function createSanitizer(
  defaultOptions?: SanitizerOptions
): <T>(input: T, options?: SanitizerOptions) => RecursivelyProcessed<T>
```

**Usage:**
```typescript
// Create custom sanitizer
const mySanitizer = createSanitizer({
  level: 'medium',
  maxLength: 500
});

// Use it
const clean = mySanitizer(userInput);
```

### escapeHtml

Escapes HTML special characters.

```typescript
function escapeHtml(input: string): string
```

**Usage:**
```typescript
const escaped = escapeHtml('<div>Hello & goodbye</div>');
// Output: '&lt;div&gt;Hello &amp; goodbye&lt;/div&gt;'
```

### stripHtml

Removes all HTML tags from a string.

```typescript
function stripHtml(input: string): string
```

**Usage:**
```typescript
const stripped = stripHtml('<p>Hello <strong>World</strong></p>');
// Output: 'Hello World'
```

### sanitizeHtml

Sanitizes HTML by allowing only specified tags.

```typescript
function sanitizeHtml(input: string): string
```

**Usage:**
```typescript
const sanitized = sanitizeHtml(
  '<p>Safe</p><script>alert("xss")</script>'
);
// Output: '<p>Safe</p>'
```

## Predefined Sanitizers

### strictSanitizer

Removes all HTML and special characters.

```typescript
const clean = strictSanitizer(userInput);
```

### mediumSanitizer

Allows safe HTML tags.

```typescript
const clean = mediumSanitizer(richTextInput);
```

### basicSanitizer

Escapes HTML entities.

```typescript
const clean = basicSanitizer(userInput);
```

### inputSanitizer

For form inputs - strict with no whitespace.

```typescript
const clean = inputSanitizer(formField);
```

### urlParamSanitizer

For URL parameters - strict, no whitespace, max 255 chars.

```typescript
const clean = urlParamSanitizer(urlParam);
```

## Common Usage Patterns

### Form Input Sanitization

```typescript
import { inputSanitizer } from '$lib/utils/sanitizer';

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const username = inputSanitizer(formData.get('username'));
    const email = inputSanitizer(formData.get('email'));

    // Now safe to use
    await createUser({ username, email });
  }
};
```

### Rich Text Editor

```typescript
import { mediumSanitizer } from '$lib/utils/sanitizer';

function saveArticle(content: string) {
  // Allow safe HTML tags
  const sanitized = mediumSanitizer(content);
  return db.articles.create({ content: sanitized });
}
```

### API Response Sanitization

```typescript
import { sanitize } from '$lib/utils/sanitizer';

async function fetchUserData(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();

  // Recursively sanitize all fields
  return sanitize(data, { level: 'basic' });
}
```

### URL Parameter Sanitization

```typescript
import { urlParamSanitizer } from '$lib/utils/sanitizer';

export async function load({ url }) {
  const search = urlParamSanitizer(url.searchParams.get('q'));
  const page = urlParamSanitizer(url.searchParams.get('page'));

  return {
    search,
    page: parseInt(page) || 1
  };
}
```

### Complex Object Sanitization

```typescript
import { sanitize } from '$lib/utils/sanitizer';

const userProfile = {
  name: '<script>alert("xss")</script>',
  bio: '<p>Hello <strong>World</strong></p>',
  settings: {
    theme: 'dark',
    notifications: '<img src=x onerror=alert("xss")>'
  }
};

const sanitized = sanitize(userProfile, { level: 'strict' });
// All nested strings are sanitized
```

## Allowed HTML Tags and Attributes

### Default Allowed Tags (Medium Level)

```typescript
const ALLOWED_TAGS = [
  'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'strong', 'em', 'b', 'i', 'u', 'a', 'span'
];
```

### Default Allowed Attributes

```typescript
const ALLOWED_ATTRIBUTES = {
  'a': ['href', 'target', 'rel', 'title'],
  'span': ['class'],
  'code': ['class'],
  '*': ['id', 'class'] // Allowed on all elements
};
```

## Integration Points

### Error Handler

Automatically logs sanitization errors and provides fallback behavior.

### Logger Service

All sanitization operations are logged via `loggerService.withContext('Sanitizer')`.

### Type System

Full TypeScript support with `RecursivelyProcessed<T>` type that maintains input structure while ensuring all strings are sanitized.

## Best Practices

1. **Use appropriate level** - Choose strictest level that meets requirements
2. **Sanitize at boundaries** - Sanitize data when it enters your system
3. **Don't over-sanitize** - Avoid sanitizing data multiple times
4. **Validate first** - Use validation before sanitization
5. **Consider context** - Use `inputSanitizer` for forms, `urlParamSanitizer` for URLs, etc.
6. **Test thoroughly** - Test with various XSS payloads
7. **Use predefined sanitizers** - They have sensible defaults

## Security Considerations

- **Not a silver bullet** - Sanitization is one layer of defense
- **Use with CSP** - Combine with Content Security Policy headers
- **Validate input** - Always validate data before sanitizing
- **Keep updated** - Monitor for new XSS techniques
- **Server-side only** - Never rely solely on client-side sanitization
- **Escape output** - Sanitize at input AND escape at output

## Type Definitions

```typescript
interface SanitizerOptions {
  level?: 'strict' | 'medium' | 'basic';
  preserveCase?: boolean;
  preserveWhitespace?: boolean;
  maxLength?: number;
}

type RecursivelyProcessed<T> = T extends string
  ? string
  : T extends Array<infer U>
  ? Array<RecursivelyProcessed<U>>
  : T extends object
  ? { [K in keyof T]: RecursivelyProcessed<T[K]> }
  : T;
```
