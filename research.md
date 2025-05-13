# Research Document: Localizing Project to Korean (Hardcoding Approach)

## Task

Replace all user-facing English text with Korean equivalents throughout the Next.js project. This involves modifying UI components, metadata, validation messages, email templates, and configuration files.

## Approach (Based on User Outline: platform.txt - Approach 1)

Hardcode all text to Korean, removing existing English text and any i18n infrastructure (e.g., `next-intl`).

## Plan Overview

### Phase 1: Preparation & Initial Analysis

1.  **Project Directory Scan**: Identify all files within `app/`, `components/`, `lib/validation/`, `app/emails/`, and any other relevant directories containing user-facing text.
2.  **Configuration File Review**: Inspect key files for i18n configurations:
    - Root layout file(s) (e.g., `app/layout.tsx`, `app/[locale]/layout.tsx`)
    - `middleware.ts`
    - `next.config.mjs` (or `.js`)

### Phase 2: Content Localization (Iterative)

This phase involves systematically going through the identified files and replacing English text.

1.  **UI Text**: In `.tsx` files within `app/` and `components/`.
    - Direct text in JSX.
    - Placeholders, alt text, aria-labels.
2.  **Metadata**: `title` and `description` in `Metadata` objects in `page.tsx` and `layout.tsx` files.
3.  **Validation Messages**: Error messages in Zod schemas (e.g., `lib/validation/**/*.ts`).
4.  **Email Content**: Text in email components/templates (e.g., `app/emails/**/*.tsx`).

### Phase 3: Configuration Updates

1.  **Root Layout**: Update `<html>` tag to `lang="ko"`. Remove any `next-intl` providers/imports.
2.  **Locale Directory Structure**: If `app/[locale]` exists, rename to `app/`. Update import paths in `middleware.ts` and other affected files.
3.  **Middleware (`middleware.ts`**): Remove `next-intl` or other i18n-specific logic. Retain Supabase auth logic.
4.  **Next.js Config (`next.config.mjs`**): Remove any `i18n` configuration object.

### Phase 4: Verification & Finalization

1.  **TypeScript Check**: Run `npx tsc --noEmit`.
2.  **Code Formatting**: Run `npx prettier --write .`.

## Implementation Progress

### Localization of Components

The following components and areas have been successfully localized with hardcoded Korean text, following the approach outlined:

- **UI Text & Metadata in Main Application Pages:**
  - `app/(main)/properties/page.tsx`: Localized metadata, page title, button texts, and messages.
  - `app/(main)/search/page.tsx`: Localized metadata, page title, and suspense fallback message.
- **Search Functionality Components:**
  - `app/(main)/search/_components/SearchForm.tsx`: All user-facing text, including labels, placeholders, button text, and Zod-based validation messages, translated to Korean.
  - `app/(main)/search/_components/SearchResults.tsx`: Localized error messages, "no results" message, results count, and button text.
- **Property Display Components:**
  - `components/property/PropertyCard.tsx`: Localized price formatting (e.g., "/월" for monthly rent), property type display (e.g., "월세", "매매"), distance indicators (e.g., "m 거리", "km 거리"), units for property features (e.g., "침실", "욕실", "제곱피트"), fallback image `alt` text, and the "View Details" button text.
- **Agent Registration Workflow (from previous sessions, relevant to overall localization):**
  - Agent registration form: Localized success/error messages and form labels.
  - Email templates (`AgentRegistrationEmail.tsx`, `RequestInfoEmail.tsx`): Content was reviewed and confirmed/updated to be in Korean.

### TypeScript Error Resolution

During the localization process, specific TypeScript issues were addressed:

- **`SearchForm.tsx`**:
  - Corrected the usage of the `PropertyType` type to align with its definition.
  - Resolved compatibility issues with `SelectTrigger` and `SelectItem` components from Shadcn UI to comply with their TypeScript definitions.

### Resolving Linting Issues in Email Templates

**Problem**: Persistent linting warnings (`CSS inline styles should not be used`) in email template files (`app/emails/*.tsx`) despite attempts to use `eslint-disable` and `stylelint-disable` comments.

**Investigation & Findings**:

- Running `npx eslint --debug app/emails/AgentRegistrationEmail.tsx` revealed that ESLint itself was not flagging the inline styles. Instead, it reported the disable comments as 'unused'.
- The project uses a modern `eslint.config.mjs` (flat config) which extends `next/core-web-vitals` and `next/typescript`.
- The warnings were suspected to originate from a rule like `react/no-inline-styles` included in the Next.js ESLint presets, or from an IDE-specific linter.

**Solution (ESLint)**:

1. Modified `/Users/macbookair/platform/eslint.config.mjs` to add an override for email template files, specifically disabling the `react/no-inline-styles` rule:
   ```javascript
   // eslint.config.mjs
   // ... (imports and compat setup)
   const eslintConfig = [
     ...compat.extends("next/core-web-vitals", "next/typescript"),
     {
       files: ["app/emails/**/*.tsx", "app/emails/**/*.ts"],
       rules: {
         "react/no-inline-styles": "off",
       },
     },
   ];
   export default eslintConfig;
   ```
2. Removed the now-confirmed 'unused' `/* eslint-disable */` and `/* stylelint-disable */` comments from the email template files (`AgentRegistrationEmail.tsx`, `RequestInfoEmail.tsx`).
3. Confirmed with `npx eslint app/emails/AgentRegistrationEmail.tsx` that ESLint no longer reports any errors or warnings for these files.

**Remaining Warnings**:

- Any remaining "CSS inline styles should not be used" warnings are likely originating from the IDE's built-in HTML/CSS linter or other linting extensions, not from ESLint.
- These IDE-specific warnings need to be addressed through IDE settings (e.g., `.vscode/settings.json` for VS Code) to ignore these rules for email template files, as inline styles are necessary for HTML email compatibility.

## Improving Korean Font Handling with `next/font`

`next/font` optimizes web fonts (including custom and Google Fonts) for performance and privacy. It automatically self-hosts font files and can help prevent layout shifts.

### 1. Using Korean Fonts from Google Fonts (e.g., Noto Sans KR)

`next/font/google` allows easy integration of fonts from Google Fonts. `Noto Sans KR` is a common choice for Korean.

**Implementation Steps:**

1.  **Import Font** (e.g., in `app/layout.tsx`):

    ```typescript
    import { Noto_Sans_KR } from "next/font/google";
    ```

2.  **Initialize Font**:

    ```typescript
    const notoSansKR = Noto_Sans_KR({
      subsets: ["korean"], // Essential for Korean characters
      weight: ["400", "700"], // Specify necessary weights (e.g., regular, bold)
      display: "swap", // Recommended for performance
      // variable: '--font-noto-sans-kr' // Optional: for CSS variable integration (e.g., with Tailwind CSS)
    });
    ```

    - `subsets: ['korean']`: Ensures Google Fonts serves Korean glyphs.
    - `weight`: Can be a single string (e.g., `'400'`) or an array.
    - `display: 'swap'`: Shows fallback font while loading.

3.  **Apply Font** (typically in `app/layout.tsx`):
    - **Using `className`**:
      ```tsx
      export default function RootLayout({
        children,
      }: {
        children: React.ReactNode;
      }) {
        return (
          <html lang="ko" className={notoSansKR.className}>
            <body>{children}</body>
          </html>
        );
      }
      ```
    - **Using CSS `variable`** (e.g., with Tailwind CSS):
      In `tailwind.config.js`:
      ```javascript
      // tailwind.config.js
      const defaultTheme = require("tailwindcss/defaultTheme");
      module.exports = {
        theme: {
          extend: {
            fontFamily: {
              sans: [
                "var(--font-noto-sans-kr)",
                ...defaultTheme.fontFamily.sans,
              ],
            },
          },
        },
      };
      ```
      In `app/layout.tsx`:
      ```tsx
      export default function RootLayout({
        children,
      }: {
        children: React.ReactNode;
      }) {
        return (
          <html lang="ko" className={`${notoSansKR.variable} antialiased`}>
            <body>{children}</body>
          </html>
        );
      }
      ```

### 2. Using Local Korean Font Files

For self-hosting Korean font files (e.g., `.woff2`, `.otf`).

**Implementation Steps:**

1.  **Store Font Files**: Place files in your project (e.g., `public/fonts/` or `app/fonts/`).

2.  **Import `localFont`**:

    ```typescript
    import localFont from "next/font/local";
    ```

3.  **Initialize Font**:

    ```typescript
    const myKoreanFont = localFont({
      src: [
        {
          path: "../../public/fonts/MyKoreanFont-Regular.woff2", // Adjust path as needed from the file calling localFont
          weight: "400",
          style: "normal",
        },
        {
          path: "../../public/fonts/MyKoreanFont-Bold.woff2",
          weight: "700",
          style: "normal",
        },
      ],
      display: "swap",
      preload: false, // Highly recommended for CJK (Korean) fonts to optimize initial load
      // variable: '--my-korean-font', // Optional for CSS variable
    });
    ```

    - `src`: Path(s) to font files. Relative paths are from the file where `localFont` is declared.
    - `preload: false`: Crucial for large CJK fonts to avoid performance hits on initial load. `next/font` still optimizes the font.

4.  **Apply Font**: Use `myKoreanFont.className` or `myKoreanFont.variable` as shown for Google Fonts.

### General Recommendations for Korean Fonts with `next/font`

- **Minimize Weights**: Include only the font weights truly needed to keep file sizes down.
- **Fallback Fonts**: Define sensible fallback fonts in your global CSS or Tailwind configuration.
  ```css
  /* example in globals.css */
  body {
    font-family:
      var(--font-primary-korean),
      /* Assuming you use a CSS variable */ -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      "Helvetica Neue",
      Arial,
      sans-serif,
      "Apple Color Emoji",
      "Segoe UI Emoji",
      "Segoe UI Symbol";
  }
  ```
- **Testing**: Test thoroughly across browsers and devices for rendering and performance.

### Advanced Optimization Techniques for Korean Fonts

For further optimization, especially with large Korean font files:

- **Prioritize WOFF2 Format**: When using local fonts, ensure they are in `.woff2` format. It offers the best compression and performance compared to older formats (TTF, OTF, WOFF).
- **Use Variable Fonts**: If available, prefer variable Korean fonts. They bundle multiple weights and styles into a single, more efficient file, reducing HTTP requests and improving loading.
- **Advanced (Manual) Subsetting for Local Fonts**:
  - While `next/font` performs automatic subsetting, for maximum optimization of _local_ Korean fonts, consider manual subsetting.
  - Tools like `pyftsubset` (from the FontTools library) or `Glyphhanger` can create custom font files containing _only the specific Korean glyphs actually used on your site_.
  - This can significantly reduce file size but requires an additional build step and careful management if your site's Korean content updates frequently.
  - Load these manually-subsetted fonts using `next/font/local`.
- **Robust Fallback Font Strategy**:
  - Define a comprehensive list of fallback fonts in your CSS, prioritizing common Korean system fonts to ensure graceful degradation and platform consistency. Example:
    ```css
    font-family:
      var(--your-korean-font),
      /* Primary next/font */ "Apple SD Gothic Neo",
      /* macOS Korean */ "Malgun Gothic",
      /* Windows Korean */ "Nanum Gothic",
      /* Common free Korean font */ sans-serif;
    ```
  - `next/font` automatically generates `size-adjust` CSS descriptors to help match the fallback font's metrics to your web font, minimizing Cumulative Layout Shift (CLS).
- **Fine-tuning `display` for Local Fonts**:
  - While `display: 'swap'` is a good default, for very large local fonts, consider:
    - `display: 'optional'`: Renders the font only if it loads very quickly; otherwise, uses the fallback. Good for non-critical enhancements.
    - `display: 'fallback'`: Gives the font a short block period. If it doesn't load, uses the fallback for the session. A middle ground.
- **Confirm `preload: false` for Local CJK Fonts**: As mentioned earlier, ensure `preload: false` is set for `next/font/local` when dealing with large Korean (CJK) fonts to prevent negative impacts on initial page load speed.
- **Caching**: While `next/font`'s self-hosting handles caching well for static assets, ensure your server/CDN is configured for optimal caching of these font files if you have specific needs beyond default Next.js behavior.

By applying these advanced strategies, you can further enhance the performance and rendering quality of Korean text in your Next.js application.

## Notes

- Korean translations will be directly embedded into the code.
- This plan assumes that specific Korean translations will be provided or can be derived. For complex or nuanced text, clarification or placeholder text might be used initially.
- The process will be iterative, likely proceeding module by module or file type by file type.

## Updated Notes

- The hardcoding approach for localization has been successfully applied to several key components.
- While Zod validation messages were localized directly in `SearchForm.tsx`, future consideration could be given to centralizing these if more forms adopt Zod.
- Styling HTML emails remains a challenge due to linting configurations. The necessity of inline styles for broad email client compatibility often conflicts with common web development linting rules. This project's setup requires further investigation to properly configure or selectively disable these warnings for email templates.
