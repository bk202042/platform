# researchstack.md

## 1. 기술 스택 및 버전 (context7 기준)

- **프론트엔드**: Next.js (App Router)
- **타입 안전성**: TypeScript
- **스타일링**: Tailwind CSS v4.1.4 ([공식 가이드](https://tailwindcss.com/))
- **UI 컴포넌트**: shadcn/ui
- **백엔드**: Supabase (PostgreSQL, PostGIS, Authentication)
- **데이터 접근 계층**: lib/data/property.ts 등에서 추상화
- **알림**: Sonner (toast)
- **폼**: React Hook Form + Zod
- **이메일**: Resend, React Email

## 2. 주요 의존성 및 설치 명령어 (README 및 context7 기준)

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

## 3. Tailwind CSS v4.1.4 (context7: .clinerules/tailwind-css-v4.md)

- **설정**: CSS-first, `@import "tailwindcss";`
- **테마**: 모든 토큰은 CSS 변수(`--color-blue-500` 등), `var()`로 접근
- **신규 기능**: 컨테이너 쿼리, 3D 변환, 그라디언트, 그림자, 다양한 유틸리티
- **브레이킹 체인지**: `bg-opacity-*`, `text-opacity-*` 제거, `/` 사용(`bg-black/50`)
- **플러그인**: `@plugin "@tailwindcss/typography";`
- **고급 설정**: `@config "../../tailwind.config.js";`, 다크모드 variant, 컨테이너 커스텀 등

## 4. Supabase 연동 (context7: .clinerules/next-js-supabase.md)

### 필수 패키지

- `@supabase/supabase-js`
- `@supabase/ssr`

### 환경 변수

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 서버 클라이언트 (Server Components, Route Handlers, Server Actions)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component에서 setAll 호출 시 무시 가능
          }
        },
      },
    },
  );
}
```

### 브라우저 클라이언트 (Client Components)

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

### 금지 사항

- `@supabase/auth-helpers-nextjs` 사용 금지
- cookie handler에 `get`, `set`, `remove` 메서드 사용 금지 (반드시 `getAll`, `setAll`만 사용)

## 5. Next.js API Route (App Router 기준, context7: .clinerules/APIs- with-Nextjs.md)

- `app/api/your-route/route.ts`에 HTTP 메서드별 함수(`GET`, `POST` 등) export
- 표준 Web API (`Request`, `Response`) 사용
- 쿼리 파라미터: `request.nextUrl.searchParams.get("query")`
- 헤더/쿠키: `next/headers`의 `cookies()`, `headers()` 사용
- 동적 라우트: `app/api/users/[id]/route.ts` → `params.id` 활용
- 미들웨어/공통 래퍼: 인증 등은 `lib/with-auth.ts` 등에서 래퍼 함수로 구현

## 6. Tailwind CSS v4.1.4 주요 코드 스니펫

```css
@import "tailwindcss";
@theme {
  --font-display: "Satoshi";
}
```

```css
@utility tab-4 {
  tab-size: 4;
}
@variant pointer-coarse (@media (pointer: coarse));
@plugin "@tailwindcss/typography";
```

## 7. Sonner (Toast) 글로벌 설정 (context7)

- `components/ui/sonner.tsx`에서 `<Toaster />` 컴포넌트 구현
- 루트 레이아웃(`app/layout.tsx`) 또는 provider에서 `<Toaster />`를 반드시 렌더링

## 8. 기타

- **프로젝트 구조**: feature-based, App Router 중심
- **데이터 접근**: API Route → Data Access Layer → DB
- **서버/클라이언트 구분**: 서버 전용 코드는 Server Component/Route Handler에, 클라이언트 전용 코드는 반드시 `"use client"` 선언 후 작성

---

> 본 문서는 context7(프로젝트 내 .clinerules, .windsurf, README 등)에서 명시된 최신 가이드, 버전, 코드, 명령어만을 엄격히 반영하였음. 임의의 추론이나 외부 정보는 일절 포함하지 않음.
