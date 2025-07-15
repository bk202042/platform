-- 커뮤니티 기능용 마이그레이션 (카테고리 ENUM, 아파트/게시글/댓글/좋아요 테이블, 인덱스, RLS)
-- 생성일: 2025-07-11

-- 1. 커뮤니티 카테고리 ENUM 타입 생성
create type community_category as enum ('QNA', 'RECOMMEND', 'SECONDHAND', 'FREE');

-- 2. 아파트 테이블
create table apartments (
  id uuid primary key default gen_random_uuid(),
  city text not null, -- 도시명 (예: 'Ho Chi Minh', 'Hanoi')
  name text not null, -- 아파트명
  slug text unique not null, -- URL용 slug
  created_at timestamp default now()
);

-- 3. 커뮤니티 게시글 테이블
create table community_posts (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid references apartments(id) on delete cascade,
  user_id uuid references auth.users(id),
  category community_category not null,
  title text,
  body text not null,
  images text[] check (array_length(images, 1) <= 5),
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  is_deleted boolean default false
);

-- 4. 커뮤니티 댓글 테이블 (대댓글 parent_id)
create table community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade,
  user_id uuid references auth.users(id),
  parent_id uuid references community_comments(id),
  content text not null,
  created_at timestamp default now(),
  is_deleted boolean default false
);

-- 5. 커뮤니티 좋아요 테이블 (1인 1개, UNIQUE)
create table community_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade,
  user_id uuid references auth.users(id),
  created_at timestamp default now(),
  unique (post_id, user_id)
);

-- 6. 인덱스 추가 (조회/정렬/RLS 최적화)
create index idx_posts_apartment_id on community_posts(apartment_id);
create index idx_posts_category on community_posts(category);
create index idx_posts_created_at on community_posts(created_at desc);
create index idx_posts_likes_count on community_posts(likes_count desc);
create index idx_comments_post_id on community_comments(post_id);
create index idx_comments_parent_id on community_comments(parent_id);
create index idx_likes_post_id on community_likes(post_id);
create index idx_likes_user_id on community_likes(user_id);

-- 7. RLS(행 수준 보안) 활성화 및 정책
alter table community_posts enable row level security;
alter table community_comments enable row level security;
alter table community_likes enable row level security;

-- 게시글: 모두 읽기 허용
create policy "Allow read to all" on community_posts for select to public using (true);
-- 게시글: 인증 사용자만 작성
create policy "Allow insert to authenticated" on community_posts for insert to authenticated using (auth.uid() = user_id);
-- 게시글: 본인만 수정/삭제
create policy "Allow update to owner" on community_posts for update using (auth.uid() = user_id);
create policy "Allow delete to owner" on community_posts for delete using (auth.uid() = user_id);

-- 댓글: 모두 읽기 허용
create policy "Allow read to all" on community_comments for select to public using (true);
-- 댓글: 인증 사용자만 작성
create policy "Allow insert to authenticated" on community_comments for insert to authenticated using (auth.uid() = user_id);
-- 댓글: 본인만 수정/삭제
create policy "Allow update to owner" on community_comments for update using (auth.uid() = user_id);
create policy "Allow delete to owner" on community_comments for delete using (auth.uid() = user_id);

-- 좋아요: 인증 사용자만 추가/삭제, 본인만 삭제
create policy "Allow insert to authenticated" on community_likes for insert to authenticated using (auth.uid() = user_id);
create policy "Allow delete to owner" on community_likes for delete using (auth.uid() = user_id);
-- 좋아요: 모두 읽기 허용
create policy "Allow read to all" on community_likes for select to public using (true);
