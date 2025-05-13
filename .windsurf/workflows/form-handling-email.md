---
description: Next.js Form Handling & Email
---

## Next.js Form Handling & Email (API Routes)

**Objective:** Robust Next.js form input, validation, & email sending using API Routes.

**Core Tech:** Next.js (App Router, API Routes), React Hook Form (RHF), Zod, Resend, React Email, Sonner, TypeScript.

---

### Implementation Steps:

**Step 1: Define Zod Schemas (`lib/schemas.ts`)**

- **Action:** For each form, create a Zod schema specifying fields, types, and validation rules (e.g., `z.string().min(1, "Required")`, `.email("Invalid email")`). Export schemas.
- **Example:** `export const ContactSchema = z.object({ name: z.string().min(1), email: z.string().email(), message: z.string().min(5) });`

**Step 2: Create Email Templates (`emails/`)**

- **Action:** Build React functional components for HTML email content. Accept form data as props. Keep styling minimal for compatibility.
- **Example:** `const ContactEmail = ({ name, message }) => (<div><h1>Query from {name}</h1><p>{message}</p></div>); export default ContactEmail;`

**Step 3: Client-Side Form Components (`components/contact-form.tsx`)**

- **Directive:** `'use client'`.
- **Hooks & Types:**
  - Import `useForm`, `SubmitHandler` (RHF), `zodResolver`, Zod schema, UI parts, `toast` (Sonner).
  - Type form inputs: `type Inputs = z.infer<typeof YourFormSchema>;`
- **`useForm` Init:**
  - `const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Inputs>({ resolver: zodResolver(YourFormSchema), defaultValues: { /* ... */ } });`
- **Submit Handler (`processForm: SubmitHandler<Inputs>`):**
  - `async` function.
  - `fetch` `POST` to API route (e.g., `/api/contact`), `body: JSON.stringify(data)`, `headers: { 'Content-Type': 'application/json' }`.
  - On `response.ok`: `toast.success('Sent!')`; `reset()`.
  - Else: `errorData = await response.json(); toast.error(errorData.error?.message || 'Failed.')`.
  - `try...catch` for network errors: `toast.error('Network error.')`.
- **Render JSX:**
  - `<form onSubmit={handleSubmit(processForm)} noValidate>`.
  - Inputs: `{...register('fieldName')}`.
  - Errors: `{errors.fieldName && <p>{errors.fieldName.message}</p>}`.
  - Submit Button: `disabled={isSubmitting}`. Text changes based on `isSubmitting`.

**Step 4: Backend API Routes (`app/api/[formName]/route.ts`)**

- **`POST` Handler (`async function POST(request: Request)`):**
  1.  **Imports:** `NextResponse` (from `next/server`), `Resend`, Zod schema, Email template.
  2.  **Init Resend:** `const resend = new Resend(process.env.RESEND_API_KEY);`.
  3.  **Parse Body:** `const body = await request.json();`.
  4.  **Server-Side Validation (CRITICAL):**
      - `const result = YourFormSchema.safeParse(body);`
      - `if (!result.success) { return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 }); }`
      - `const { field1, field2 } = result.data; // Destructure validated data`
  5.  **Send Email (Resend):**
      - `const { data, error } = await resend.emails.send({`
        - `from: 'Your Verified Sender <you@yourdomain.com>', // MUST be verified in Resend`
        - `to: ['recipient@example.com'], // Or dynamically from result.data`
        - `subject: 'Your Email Subject',`
        - `react: <YourEmailTemplateComponent {...result.data} />, // Or use 'text' for plain text`
      - `});`
      - `if (error) { console.error("Resend error:", error); return NextResponse.json({ error: "Failed to send email." }, { status: 500 }); }`
  6.  **Success Response:** `return NextResponse.json({ message: 'Email sent successfully!' });`.
  7.  **Error Handling:** Wrap entire handler in `try...catch` for general errors and return appropriate `NextResponse.json` with status 500. Securely use environment variables (e.g., `RESEND_API_KEY`).

**Step 5: Configure Toaster (Sonner)**

- **Location:** `components/providers.tsx` or root layout (`app/layout.tsx`).
- **Action:** Ensure Sonner's `<Toaster />` component is rendered globally.
- **Example:** `<Toaster position="top-right" richColors />`
  _(The project might use a custom wrapper like `components/ui/sonner.tsx` which is then used in a provider or layout)_.
