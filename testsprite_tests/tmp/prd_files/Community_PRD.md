**Product Requirements Document (PRD)**

**Feature:** Community Board (지역 커뮤니티 게시판)
**Platform:** VinaHome (Vietnam Property Platform for Korean expats)
**Target Release:** Q4 2025

---

### 1. Overview

Add a regionally segmented community feature similar to "당근마켓 동네생활" where signed-in users can:

* Ask apartment/neighborhood questions
* Share recommendations
* Buy/sell second-hand items
* Post free-form local content

This feature will enhance community engagement around residential buildings in Ho Chi Minh and Hanoi.

---

### 2. Goals

* Increase retention through local user-generated content
* Provide high-trust, local context for prospective renters
* Introduce organic community growth tied to apartment clusters

---

### 3. User Stories

#### As a signed-in user, I can:

* Browse community posts by City → Apartment
* Create posts under specific categories with text and images
* Like and comment on posts
* See most liked posts pinned at the top

---

### 4. Key Features

#### 4.1 Categories

Each post must belong to one of the following categories:

1. 묻고 답하기 (Q&A)
2. 동네 업소 추천 (Recommendations)
3. 중고거리 (Second-hand)
4. 자유글 (Free Talk)

#### 4.2 Post Content

* Title (optional)
* Body (required)
* Image uploads (max 5 per post)
* Category tag (required)
* Apartment (required)

#### 4.3 Apartment Structure

Separate DB table:

```sql
CREATE TABLE apartments (
  id UUID PRIMARY KEY,
  city TEXT NOT NULL,          -- e.g., "Ho Chi Minh", "Hanoi"
  name TEXT NOT NULL,          -- e.g., "The Metropole"
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

#### 4.4 Post Sorting

* Most liked (within 7 days) are pinned at top
* Remaining posts sorted by Newest First

#### 4.5 Interactions

* Likes (1 per user)
* Comments and threaded replies
* No private messaging
* No user reporting

---

### 5. Access Control

* Only signed-in users can post, comment, and like
* Guests can read posts but not interact

---

### 6. UI Components (shadcn/ui)

* `PostCard`: Compact view for feed
* `PostDetail`: Full post + comments
* `NewPostDialog`: Modal form for creating a post
* `ApartmentSelect`: Cascading City → Apartment selector
* `LikeButton`, `CommentList`, `CommentForm`

---

### 7. Tech Stack Alignment

* **Framework:** Next.js 15 App Router
* **Database:** Supabase (PostgreSQL)
* **Storage:** Supabase Storage for images
* **Auth:** Supabase Auth (required to interact)
* **Styling:** Tailwind CSS + shadcn/ui

---

### 8. API Endpoints

* `GET /api/community?city=HCM&apt=Vinhomes`
* `POST /api/community` — create post
* `POST /api/community/[post_id]/like`
* `POST /api/community/[post_id]/comment`
* `GET /api/community/[post_id]`

---

### 9. Future Considerations

* Add apartment-based notifications
* Enable sorting filters (e.g., "Popular", "My Posts")
* Moderate content with admin dashboard
* Introduce push/email notifications per apartment

---

### 10. Success Metrics

* Avg. posts per active apartment per week
* % users returning via community content
* Comment-to-post ratio
* Top-liked post view rate

# 1. 목표 및 주요 기능 정의

## 1.1. 목표

- **커뮤니티(Community) 페이지**를 추가하여, 사용자가 동네별로 글을 작성/조회/댓글/좋아요 등 소통할 수 있도록 한다.
- 부동산, 생활, 맛집, 반려동물 등 다양한 카테고리 지원.
- 위치(동네) 기반 필터링 및 검색 기능 제공.

## 1.2. 주요 기능

- **커뮤니티 메인 페이지**: 동네별 인기글, 최신글, 카테고리별 필터, 검색.
- **글 상세 페이지**: 본문, 댓글, 좋아요, 신고 등.
- **글 작성/수정/삭제**: 인증된 사용자만 가능.
- **댓글 작성/삭제**: 인증된 사용자만 가능.
- **좋아요/신고**: 인증된 사용자만 가능.
- **동네(지역) 선택/변경**: 사용자 위치 기반 또는 직접 선택.
- **카테고리**: (예시) 전체, 인기글, 동네행사, 맛집, 반려동물, 운동, 생활/편의, 분실/실종, 병원/약국, 고민/사연, 동네친구, 이사/시공, 주거/부동산, 교육, 취미, 사건사고, 풍경, 미용, 임신/육아, 일반 등.

---

# 2. 데이터 모델 설계 (Supabase)

## 2.1. community_posts

| 컬럼명 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid (PK) | 게시글 ID |
| user_id | uuid (FK) | 작성자 |
| region_code | text | 동네/지역 코드 |
| category | text | 카테고리 |
| title | text | 제목 |
| content | text | 본문 |
| images | text[] | 이미지 URL 배열 |
| likes_count | int | 좋아요 수 |
| comments_count | int | 댓글 수 |
| created_at | timestamp | 생성일 |
| updated_at | timestamp | 수정일 |
| is_deleted | boolean | 삭제 여부 |

## 2.2. community_comments

| 컬럼명 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid (PK) | 댓글 ID |
| post_id | uuid (FK) | 게시글 ID |
| user_id | uuid (FK) | 작성자 |
| content | text | 댓글 내용 |
| created_at | timestamp | 생성일 |
| is_deleted | boolean | 삭제 여부 |

## 2.3. community_likes

| 컬럼명 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid (PK) | 좋아요 ID |
| post_id | uuid (FK) | 게시글 ID |
| user_id | uuid (FK) | 사용자 ID |
| created_at | timestamp | 생성일 |

## 2.4. 지역/동네 정보 (region)

- 기존 주소/지역 데이터 활용 또는 별도 테이블 설계

---

# 3. API/라우트 설계 (Next.js App Router)

## 3.1. API Route 구조 (app/api/community/)

- `/api/community/posts/` (GET, POST): 글 목록 조회/글 작성
- `/api/community/posts/[id]/` (GET, PATCH, DELETE): 글 상세/수정/삭제
- `/api/community/posts/[id]/comments/` (GET, POST): 댓글 목록/작성
- `/api/community/comments/[id]/` (DELETE): 댓글 삭제
- `/api/community/posts/[id]/like/` (POST, DELETE): 좋아요/취소

## 3.2. 인증/권한

- Supabase Auth 기반, 인증된 사용자만 글/댓글/좋아요 가능
- 미인증 사용자는 읽기만 가능

---

# 4. 프론트엔드 UI/UX 설계

## 4.1. 페이지 구조

- `/community` : 커뮤니티 메인 (동네/카테고리/검색/글목록)
- `/community/[postId]` : 글 상세
- `/community/write` : 글 작성/수정 (모달 또는 별도 페이지)
- `/community/region` : 동네 선택/변경 (모달 또는 별도 페이지)

## 4.2. 컴포넌트 구조 (feature-based)

- `components/community/CommunityList.tsx` : 글 목록/필터/검색
- `components/community/CommunityPostCard.tsx` : 글 카드
- `components/community/CommunityPostDetail.tsx` : 글 상세
- `components/community/CommunityCommentList.tsx` : 댓글 목록
- `components/community/CommunityCommentForm.tsx` : 댓글 작성
- `components/community/CommunityWriteForm.tsx` : 글 작성/수정
- `components/community/CommunityRegionSelector.tsx` : 동네 선택

## 4.3. UI/UX 참고

- [당근마켓 동네생활](https://www.daangn.com/kr/community/?in=%EC%84%9C%EC%B4%884%EB%8F%99-366)과 유사한 카테고리, 필터, 인기글/최신글 탭, 동네 선택, 글/댓글/좋아요/신고 등
- shadcn/ui, Tailwind CSS 활용, 모바일 우선 반응형

---

# 5. Validation, 메시지, 접근성

- 모든 사용자 메시지/라벨/버튼/에러는 **한국어**로 하드코딩 ([research.md](http://research.md/) 기준)
- Zod로 폼 validation, 에러 메시지 한글화
- 접근성(aria-label 등)도 한글 적용

---

# 6. Supabase 연동 및 보안

- 서버 컴포넌트/Route Handler에서 `@supabase/ssr` 사용 ([researchstack.md](http://researchstack.md/) 참고)
- 클라이언트 컴포넌트에서는 `@supabase/supabase-js` 사용
- 인증 미들웨어는 기존 Supabase Auth 미들웨어 활용

---

# 7. 개발 및 배포 워크플로우

1. **DB 마이그레이션**: community_posts, community_comments, community_likes 테이블 생성
2. **API Route 구현**: CRUD, 인증, 권한, validation
3. **UI 컴포넌트/페이지 구현**: feature-based 구조, shadcn/ui, Tailwind CSS
4. **통합 테스트**: tsc, prettier, 실제 동작 확인
5. **배포**: 기존 워크플로우와 동일

---

# 8. 확장 고려사항

- 이미지 업로드: Supabase Storage 연동
- 신고/관리자 기능: 신고 테이블 및 관리자 페이지
- 알림: 댓글/좋아요/답글 시 Sonner toast 등
- 무한스크롤/페이지네이션
- SEO/메타데이터: 동네/카테고리별 title/description

---

# 9. 예시 UI 플로우

1. **커뮤니티 메인**: 동네/카테고리 선택 → 글 목록 → 글 클릭
2. **글 상세**: 본문, 이미지, 댓글, 좋아요, 신고
3. **글 작성/수정**: 제목/본문/카테고리/이미지 업로드
4. **댓글**: 작성/삭제
5. **동네 변경**: 지역 선택 → 해당 동네 글 목록

---

# 10. 참고/출처

- [당근마켓 동네생활](https://www.daangn.com/kr/community/?in=%EC%84%9C%EC%B4%884%EB%8F%99-366)
- [research.md](http://research.md/), [researchstack.md](http://researchstack.md/), PROJECT_ANALYSIS.md, context7, coding rules

---

**이 플랜은 귀하의 코드베이스 구조, 기술스택, 한글 하드코딩 정책, Supabase/Next.js App Router, shadcn/ui, Tailwind CSS, 인증/보안 정책, 그리고 당근마켓 동네생활의 주요 UX를 모두 반영합니다.**

구체적 테이블/컴포넌트/라우트/메시지/권한/확장성까지 포함한 실전 설계안입니다.

추가 세부 설계, DB 마이그레이션 SQL, API 스펙, UI 와이어프레임 등 필요시 언제든 요청하세요!

- TO DO (Task)

    ---

    ## 1. DB 마이그레이션

    **명령어 예시:**

    ```bash
    # 마이그레이션 파일 생성 (예시: create_community_tables.sql)
    touch supabase/migrations/20250701_create_community_tables.sql

    # 마이그레이션 파일에 아래 SQL 작성
    # (예시)
    -- community_posts
    CREATE TABLE community_posts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id),
      region_code text NOT NULL,
      category text NOT NULL,
      title text NOT NULL,
      content text NOT NULL,
      images text[],
      likes_count int DEFAULT 0,
      comments_count int DEFAULT 0,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now(),
      is_deleted boolean DEFAULT false
    );

    -- community_comments
    CREATE TABLE community_comments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id uuid REFERENCES community_posts(id),
      user_id uuid REFERENCES users(id),
      content text NOT NULL,
      created_at timestamp DEFAULT now(),
      is_deleted boolean DEFAULT false
    );

    -- community_likes
    CREATE TABLE community_likes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id uuid REFERENCES community_posts(id),
      user_id uuid REFERENCES users(id),
      created_at timestamp DEFAULT now()
    );

    # 마이그레이션 적용
    supabase db push

    ```

    ---

    ## 2. API Route 설계 및 구현

    **명령어/프롬프트 예시:**

    ```
    # 커뮤니티 API Route 생성
    mkdir -p app/api/community/posts/[id]/comments
    touch app/api/community/posts/route.ts
    touch app/api/community/posts/[id]/route.ts
    touch app/api/community/posts/[id]/comments/route.ts
    touch app/api/community/comments/[id]/route.ts
    touch app/api/community/posts/[id]/like/route.ts

    # 각 route.ts에 CRUD, 인증, 권한, validation 로직 구현
    # 예시 프롬프트:
    "Supabase SSR 클라이언트로 인증된 사용자만 글 작성 가능하도록 /api/community/posts/route.ts에 POST 핸들러를 구현해줘. Zod로 제목/본문/카테고리 validation, 한글 에러 메시지 포함."

    ```

    ---

    ## 3. 커뮤니티 메인 페이지(/community) UI/UX 구현

    **명령어/프롬프트 예시:**

    ```
    # 페이지 및 컴포넌트 생성
    mkdir -p app/community
    touch app/community/page.tsx
    mkdir -p components/community
    touch components/community/CommunityList.tsx
    touch components/community/CommunityPostCard.tsx
    touch components/community/CommunityRegionSelector.tsx

    # 프롬프트 예시:
    "동네, 카테고리, 검색, 인기글/최신글 탭, 글 목록, 동네 선택 기능이 포함된 커뮤니티 메인 페이지를 shadcn/ui와 Tailwind CSS로 구현해줘. 모든 UI 텍스트는 한글로."

    ```

    ---

    ## 4. 글 상세 페이지(/community/[postId]) UI/UX 구현

    **명령어/프롬프트 예시:**

    ```
    # 상세 페이지 및 컴포넌트 생성
    mkdir -p app/community/[postId]
    touch app/community/[postId]/page.tsx
    touch components/community/CommunityPostDetail.tsx
    touch components/community/CommunityCommentList.tsx

    # 프롬프트 예시:
    "글 본문, 이미지, 댓글 목록, 좋아요, 신고 버튼이 포함된 상세 페이지를 구현해줘. 댓글은 실시간으로 추가/삭제 가능해야 하며, 모든 메시지는 한글로."

    ```

    ---

    ## 5. 글 작성/수정 페이지(/community/write) 및 폼 컴포넌트 구현

    **명령어/프롬프트 예시:**

    ```
    # 작성/수정 페이지 및 폼 컴포넌트 생성
    mkdir -p app/community/write
    touch app/community/write/page.tsx
    touch components/community/CommunityWriteForm.tsx

    # 프롬프트 예시:
    "제목, 본문, 카테고리, 이미지 업로드, Zod validation(한글 에러 메시지) 포함 글 작성/수정 폼을 구현해줘. 인증된 사용자만 접근 가능하도록."

    ```

    ---

    ## 6. 댓글 컴포넌트 및 기능 구현

    **명령어/프롬프트 예시:**

    ```
    touch components/community/CommunityCommentForm.tsx

    # 프롬프트 예시:
    "댓글 목록, 댓글 작성/삭제 기능을 가진 컴포넌트를 구현해줘. 인증된 사용자만 댓글 작성/삭제 가능하며, 모든 메시지는 한글로."

    ```

    ---

    ## 7. 좋아요/신고 기능 구현

    **명령어/프롬프트 예시:**

    ```
    # 프롬프트 예시:
    "글 상세 페이지에 좋아요 토글 버튼과 신고 버튼을 추가해줘. 좋아요는 인증된 사용자만 가능, 신고는 신고 API 호출로 처리. UI 메시지는 한글로."

    ```

    ---

    ## 8. 동네(지역) 선택/변경 기능 구현

    **명령어/프롬프트 예시:**

    ```
    # 프롬프트 예시:
    "동네(지역) 선택 모달/페이지를 구현해줘. 사용자가 지역을 선택하면 해당 지역의 글만 필터링해서 보여주고, 지역 상태는 전역 context로 관리."

    ```

    ---

    ## 9. 한글 하드코딩 및 접근성 적용

    **명령어/프롬프트 예시:**

    ```
    # 프롬프트 예시:
    "모든 커뮤니티 관련 UI 컴포넌트의 텍스트, 버튼, 에러 메시지, aria-label을 한글로 하드코딩해줘. 접근성도 고려."

    ```

    ---

    ## 10. 통합 테스트

    **명령어 예시:**

    ```bash
    npx tsc --noEmit
    npx prettier --write .
    # 실제 동작 QA: 브라우저에서 커뮤니티 주요 플로우 테스트

    ```

    ---

    ## 11. 배포 및 운영

    **명령어 예시:**

    ```bash
    # 기존 배포 워크플로우 사용 (예: Vercel, Supabase 등)
    git add .
    git commit -m "feat: 커뮤니티 기능 추가"
    git push origin main
    # 운영 모니터링 및 피드백 수집

    ```

    ---

    **각 단계별로 위 명령어/프롬프트를 활용하면, 효율적이고 일관된 방식으로 커뮤니티 기능을 개발·관리할 수 있습니다.
    추가로 각 Task별 상세 코드 생성 프롬프트, 테스트 케이스, API 명세 등도 필요시 요청해 주세요!**

- TO DOs Task (Improved with Cursor)

    아래는 PRD(제품 요구사항 문서)를 반영하여 개선된 커뮤니티 기능의 Task, 상세 코드 생성 프롬프트, 테스트 케이스, API 명세입니다.

    기존 설계의 장점을 살리면서, **아파트 단위 지역화, 카테고리 제한, 상호작용/정렬/접근제어/DB구조/컴포넌트/UI/지표**까지 모두 반영합니다.

    ---

    ## 1. 개선된 TO DOs Task

    ### 1. DB 마이그레이션 및 설계

    - apartments 테이블 생성 (city, name, slug, created_at)
    - community_posts: apartment_id, category(ENUM), images(최대 5), body(필수), title(선택)
    - community_comments: threaded replies 지원 (parent_id)
    - community_likes: post당 1개 제한
    - 인덱스: apartment_id, category, created_at, likes_count

    ### 2. API Route 설계 및 구현

    - GET /api/community?city=&apt= : 아파트별/도시별/카테고리별/정렬별(최신, 인기) 목록
    - POST /api/community : 새 글 작성 (카테고리, 아파트, 본문, 이미지)
    - GET /api/community/[post_id] : 상세
    - POST /api/community/[post_id]/like : 좋아요 토글
    - POST /api/community/[post_id]/comment : 댓글/대댓글 작성
    - 인증: POST/LIKE/COMMENT는 로그인 필요, GET은 게스트 허용

    ### 3. 커뮤니티 메인 페이지(/community)

    - 도시 → 아파트 → 카테고리 → 글 목록
    - 인기글(7일 내 좋아요순) 상단 고정, 나머지 최신순
    - ApartmentSelect, PostCard, LikeButton, NewPostDialog 등

    ### 4. 글 상세 페이지(/community/[postId])

    - PostDetail, CommentList, CommentForm, LikeButton
    - 댓글/대댓글(쓰레드) 지원

    ### 5. 글 작성/수정(NewPostDialog)

    - 카테고리(ENUM), 아파트(필수), 본문(필수), 이미지(최대 2), 제목(선택)
    - Zod validation, Supabase Storage 연동

    ### 6. 댓글/대댓글 기능

    - CommentList, CommentForm, parent_id로 쓰레드 구조

    ### 7. 접근제어/권한

    - 인증된 사용자만 글/댓글/좋아요 가능, 게스트는 읽기만

    ### 8. UI/UX 및 컴포넌트

    - shadcn/ui 기반, 모든 메시지 한글, 반응형, 접근성

    ### 9. 테스트/배포/지표

    - tsc/prettier, 주요 플로우 QA, 성공지표(아파트별 주간 글수, 댓글/좋아요 비율 등) 추적

    ---

    ## 2. 상세 코드 생성 프롬프트

    ### 1) DB 마이그레이션

    ```
    "Supabase(PostgreSQL)용 apartments, community_posts, community_comments, community_likes 테이블을 생성하는 SQL을 작성해줘. apartments는 city, name, slug(unique), created_at 포함. posts는 apartment_id, category(ENUM: QNA, RECOMMEND, SECONDHAND, FREE), title(선택), body(필수), images(최대 5), user_id, likes_count, comments_count, created_at, updated_at. comments는 parent_id로 대댓글 지원. likes는 post당 1개 제한. 적절한 인덱스도 추가."

    ```

    ### 2) API Route

    ```
    "Next.js App Router 환경에서 /api/community/route.ts에 GET(아파트/도시/카테고리/정렬별 목록), POST(글 작성) 핸들러를 Supabase SSR 클라이언트로 구현해줘. POST는 인증 필요, Zod로 validation(카테고리, 아파트, 본문, 이미지 최대 5), 한글 에러 메시지. GET은 인기글(7일 내 좋아요순 상단), 최신순 정렬."

    ```

    ```
    "/api/community/[post_id]/like/route.ts에 인증된 사용자의 좋아요 토글(1인 1개) API를 구현해줘."

    ```

    ```
    "/api/community/[post_id]/comment/route.ts에 댓글/대댓글(쓰레드) 작성 API를 구현해줘. parent_id로 대댓글 구분."

    ```

    ### 3) UI/컴포넌트

    ```
    "shadcn/ui와 Tailwind CSS로 ApartmentSelect(도시→아파트), PostCard(카테고리, 본문, 이미지, 좋아요, 댓글수), NewPostDialog(카테고리, 아파트, 본문, 이미지 업로드, Zod validation), PostDetail(상세+댓글), LikeButton, CommentList, CommentForm 컴포넌트를 한글 메시지로 구현해줘."

    ```

    ### 4) 정렬/인기글

    ```
    "커뮤니티 글 목록에서 7일 내 좋아요 많은 글을 상단에 고정하고, 나머지는 최신순으로 정렬하는 쿼리/로직을 작성해줘."

    ```

    ### 5) 접근제어

    ```
    "API와 UI에서 인증된 사용자만 글/댓글/좋아요 가능, 게스트는 읽기만 가능하도록 권한 체크 로직을 추가해줘."

    ```

    ## 3. 테스트 케이스

    - 아파트/도시/카테고리별 글 목록 필터링 정상 동작
    - 인기글(7일 내 좋아요순) 상단 고정, 최신순 정렬
    - 인증 없이 POST/LIKE/COMMENT 시 401 반환
    - 글 작성 시 카테고리/아파트/본문/이미지(최대 5) validation
    - 댓글/대댓글(쓰레드) 작성/조회/삭제 정상 동작
    - 좋아요 중복 방지, 취소 가능
    - ApartmentSelect에서 도시 선택 시 해당 아파트만 표시
    - 게스트는 읽기만 가능, 버튼 비활성화
    - 모든 UI/에러 메시지 한글, 접근성(aria-label) 적용

    ---

    ## 4. API 명세 (예시)

    ### [GET] /api/community?city=HCM&apt=Vinhomes&category=QNA&sort=popular

    - **설명**: 아파트/도시/카테고리/정렬별 글 목록
    - **Response**: 인기글(7일 내 좋아요순) 상단, 나머지 최신순

    ### [POST] /api/community

    - **Body**:

        ```json
        {
          "apartment_id": "uuid",
          "category": "QNA",
          "title": "질문 있습니다",
          "body": "이 아파트 주차장 어떤가요?",
          "images": ["url1", "url2"]
        }

        ```

    - **Response**: 201 Created, { id, ... }

    ### [POST] /api/community/[post_id]/like

    - **설명**: 좋아요 토글(1인 1개)

    ### [POST] /api/community/[post_id]/comment

    - **Body**:

        ```json
        {
          "body": "저도 궁금해요!",
          "parent_id": null
        }

        ```

    - **Response**: 201 Created, { id, ... }

    ### [GET] /api/community/[post_id]

    - **설명**: 글 상세 + 댓글(쓰레드)

    ---

    ## 5. 추가 개선/확장 포인트

    - ApartmentSelect에서 최근 인기 아파트/도시 자동 추천
    - 향후 apartment-based notification, sorting filter, admin moderation, push/email notification 등 확장 고려
    - 성공지표(아파트별 주간 글수, 댓글/좋아요 비율, Top-liked post view rate) 추적용 쿼리/로그 추가

    ---

    **이 설계는 PRD의 모든 요구사항(아파트 단위, 카테고리 제한, 상호작용, 정렬, 접근제어, UI/UX, 확장성, 지표 등)을 반영합니다.
    각 Task별로 위 프롬프트/테스트/API 명세를 활용하면, 실전 개발·테스트·운영까지 체계적으로 진행할 수 있습니다.
    추가로 각 API의 상세 스펙, 예시 응답, 컴포넌트 props 타입, 쿼리 최적화 등도 필요시 요청해 주세요!**
