# Next.js Minimal Boilerplate

A clean, minimal Next.js boilerplate with TypeScript, Tailwind CSS, and shadcn/ui, designed to be a flexible starting point for your projects.

## Features

- [Next.js](https://nextjs.org) with App Router
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Tailwind CSS v4](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for beautiful, accessible components
- Minimal dependencies
- Clean project structure
- Dark mode support
- Consistent file casing enforced by TypeScript

## Getting Started

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
/
├── app/                # Next.js App Router
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Home page
│   └── globals.css    # Global styles with Tailwind v4 config
├── components/        # React components
│   ├── Container.tsx  # Layout container component
│   └── ui/            # shadcn/ui components
├── lib/               # Utility functions
│   └── utils.ts       # Helper functions for shadcn/ui
├── public/            # Static assets
└── ...                # Config files
```

## Customization

This boilerplate is intentionally minimal but includes shadcn/ui for beautiful UI components. You can easily add more features as needed:

- State management (Redux, Zustand, etc.)
- Additional shadcn/ui components
- API clients (React Query, SWR, etc.)
- Authentication
- Database connections

### Adding More shadcn/ui Components

To add more shadcn/ui components, you can manually copy them from the [shadcn/ui documentation](https://ui.shadcn.com/docs/components) or use the CLI if you have it installed:

```bash
npx shadcn@latest add [component-name]
```

For example, to add the Dialog component:

```bash
npx shadcn@latest add dialog
```

## Learn More

To learn more about the technologies used in this boilerplate:

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives/overview/introduction)
