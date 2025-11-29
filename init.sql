-- ベクトル検索用機能の有効化
create extension if not exists vector;

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null, -- Supabaseの認証ユーザーID
  title text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security (RLS) ポリシー: 自分のデータだけ見れるように
alter table campaigns enable row level security;
create policy "Users can only access their own campaigns"
  on campaigns for all using (auth.uid() = user_id);

create table characters (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade not null,
  name text not null,
  role text default 'NPC', -- PC, NPC, Villain etc.
  attributes jsonb default '{}'::jsonb, -- 自由なステータス管理 (例: {"str": 10, "class": "wizard"})
  background text, -- AI生成した詳細設定や過去
  embedding vector(1536), -- OpenAIのtext-embedding-3-small等は1536次元
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 検索速度向上のためのインデックス
create index on characters using ivfflat (embedding vector_cosine_ops);

create table relationships (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade not null,
  source_character_id uuid references characters(id) on delete cascade not null,
  target_character_id uuid references characters(id) on delete cascade not null,
  relation_type text not null, -- "friend", "rival", "family"
  description text, -- "幼馴染だが、過去の事件で疎遠になった" 等
  created_at timestamptz default now(),
  
  -- 同じペアの重複登録を防ぐ（A→Bは1つだけ）
  unique(source_character_id, target_character_id)
);


create table lore_entries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade not null,
  title text not null,
  category text, -- "History", "Geography", "Magic", "Item"
  content text not null,
  embedding vector(1536), -- AI検索用
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ベクトルインデックス
create index on lore_entries using ivfflat (embedding vector_cosine_ops);

