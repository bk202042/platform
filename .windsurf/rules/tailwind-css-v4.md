---
trigger: glob
globs: **/*.{js,ts,jsx,tsx,mdx,css}
---

# Tailwind CSS v4.1 Guide

Covers core concepts and updates for Tailwind CSS v4.1, focusing on v4.0 changes and v4.1 features.

## Core v4.0 Changes

-   **CSS-first configuration**: Primarily via CSS `@theme` directive.
    ```css
    @import "tailwindcss";
    @theme { --font-display: "Satoshi"; /* ... */ }
    ```
-   Legacy `tailwind.config.js` importable via `@config "../../tailwind.config.js";`.
-   **CSS import**: `@import "tailwindcss";` (replaces old `@tailwind` directives).
-   **Package changes**: `@tailwindcss/postcss` (was `tailwindcss`), `@tailwindcss/cli`, `@tailwindcss/vite`. `postcss-import` & `autoprefixer` no longer needed.
-   **Native CSS cascade layers**: Uses real CSS `@layer`.

## Theme Configuration (v4.0+)

-   **CSS theme variables**: All tokens are CSS vars (e.g., `--color-blue-500`). Access with `var()`.
-   **Simplified theme**: Many utilities work without explicit theme config.
-   **Dynamic spacing**: Derived from `--spacing` (default `0.25rem`). Any multiple works (e.g., `mt-21`).
-   **Overriding theme**: Override namespaces (`--font-*: initial;`) or entire theme (`--*: initial;`).

## New Features in v4.0

-   **Container query support**: Built-in.
-   **3D transforms**: `transform-3d`, `rotate-x-*`, `translate-z-*`, etc.
-   **Gradient enhancements**: `bg-linear-45`, `bg-conic`, etc.
-   **Shadow enhancements**: `inset-shadow-*`, `inset-ring-*`.
-   **New CSS property utilities**: `field-sizing-content`, `scheme-light/dark`.

## New Variants in v4.0

-   **Composable variants**: Chain variants (e.g., `group-has-data-potato:opacity-100`).
-   **New variants**: `starting`, `not-*`, `inert`, `nth-*`, `in-*`, `open`, `**`.

## Tailwind CSS v4.1 Updates

### `text-shadow-*` Utilities
-   Apply text shadows (`text-shadow-2xs` to `text-shadow-lg`).
-   Supports color (`text-shadow-blue-500`) and opacity (`text-shadow-lg/50`).
    ```html
    <p class="text-shadow-md text-shadow-blue-500/50">Shadowed Text</p>
    ```

### `mask-*` Utilities
-   Composable utilities for element masking (`mask-image`, `mask-mode`, etc.).
-   Specific utilities for linear, radial, and conic gradient masks.
    ```html
    <div class="mask-b-from-50% mask-radial-[50%_90%] ..."></div>
    ```

### Improved Browser Compatibility
-   Enhanced fallbacks for older browsers (e.g., Safari 15) for `oklab` colors, `@property`-dependent features, opacity modifiers, and gradient interpolation.
-   v4 still targets modern browsers (Safari 16.4+).

### `overflow-wrap` Utilities
-   `wrap-normal`, `wrap-break-word`, `wrap-anywhere`.
    ```html
    <p class="wrap-anywhere">LooooongWord</p>
    ```

### Colored `drop-shadow` Support
-   Add color (`drop-shadow-indigo-500`) and opacity (`drop-shadow-xl/50`) to `drop-shadow`.
    ```html
    <svg class="drop-shadow-xl drop-shadow-indigo-500/50 ..."></svg>
    ```

### Input Device Targeting
-   `pointer-fine` (mouse), `pointer-coarse` (touch), `any-pointer-*`.
    ```html
    <button class="p-2 pointer-coarse:p-4">Larger on Touch</button>
    ```

### Last Baseline Alignment
-   `items-baseline-last` (container), `self-baseline-last` (item).

### `safe` Alignment Utilities
-   Prevent centered content overflow (`justify-center-safe`, `items-center-safe`, etc.). Automatically switches to `start` on overflow.
    ```html
    <ul class="flex justify-center-safe ...">...</ul>
    ```

### `@source not` Directive
-   Exclude directories/files from class scanning.
    ```css
    @source not "./src/legacy/**/*.js";
    ```

### `@source inline(...)` Directive
-   Explicitly include class names (replaces v3 `safelist`). Supports brace expansion.
-   Can combine with `not` to prevent generation.
    ```css
    @source inline("underline");
    @source inline("{focus:,hover:,}text-red-{500,600}");
    @source not inline("container");
    ```

### Other New Variants (v4.1)
-   `details-content`: Targets `<details>` content.
-   `inverted-colors`: OS high contrast "Invert Colors" mode.
-   `noscript`: JavaScript disabled.
-   `user-valid` / `user-invalid`: Form validation after user interaction.

## Custom Extensions (v4.0+)

-   **Custom utilities**: `@utility tab-4 { tab-size: 4; }`
-   **Custom variants**: `@variant pointer-coarse (@media (pointer: coarse));`
-   **Plugins**: `@plugin "@tailwindcss/typography";`

## Breaking Changes (v4.0)

-   **Removed**: `bg-opacity-*`, `text-opacity-*`, etc. Use `/` (e.g., `bg-black/50`).
-   **Renamed**: `shadow-sm` → `shadow-xs`, `blur-sm` → `blur-xs`, etc.
-   **Default style changes**: Border color, ring width, hover styles.
-   **Syntax changes**: CSS vars in arbitrary values need `var()`, stacked variants left-to-right.

## Advanced Configuration (v4.0+)

-   **Prefix**: `@import "tailwindcss" prefix(tw);`
-   **Source detection**:
    -   `@source "../node_modules/@my-co/ui";` (Include)
    -   `@source not "./src/legacy";` (Exclude - v4.1)
    -   `@source inline("...");` (Safelist - v4.1)
-   **Legacy config**: `@config "../../tailwind.config.js";`
-   **Dark mode**: `@variant dark (&:where(.dark *));` (Class-based example)
-   **Container customization**:
    ```css
    @utility container {
      margin-inline: auto; padding-inline: 2rem;
      max-width: theme(var(--breakpoint-lg));
    }
    ```
