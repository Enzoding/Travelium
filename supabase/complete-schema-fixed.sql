-- 创建扩展（如果不存在）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建 countries 表（如果不存在）
CREATE TABLE IF NOT EXISTS countries (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 cities 表（如果不存在）
CREATE TABLE IF NOT EXISTS cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL REFERENCES countries(code),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 books 表（如果不存在）
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  url TEXT,
  cover_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  book_status INTEGER DEFAULT 0
);

-- 创建 podcasts 表（如果不存在）
CREATE TABLE IF NOT EXISTS podcasts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  cover_url TEXT,
  audio_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  podcast_status INTEGER DEFAULT 0
);

-- 创建 book_cities 关联表（如果不存在）
CREATE TABLE IF NOT EXISTS book_cities (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  city_id TEXT NOT NULL REFERENCES cities(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 podcast_cities 关联表（如果不存在）
CREATE TABLE IF NOT EXISTS podcast_cities (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  podcast_id TEXT NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  city_id TEXT NOT NULL REFERENCES cities(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 profiles 表（如果不存在）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建触发器函数，在用户注册时自动创建资料
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, created_at, updated_at)
  VALUES (new.id, new.email, '', '', now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 以下是 RLS 策略部分
-- 注意：执行此部分之前，请确保所有表都已创建
-- 如果已经存在同名策略，可能会出错，请根据实际情况调整

-- 为 books 表创建 RLS 策略
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的策略以避免冲突
DROP POLICY IF EXISTS "用户可以查看自己的书籍" ON books;
DROP POLICY IF EXISTS "用户可以创建自己的书籍" ON books;
DROP POLICY IF EXISTS "用户可以更新自己的书籍" ON books;
DROP POLICY IF EXISTS "用户可以删除自己的书籍" ON books;

-- 创建新策略
CREATE POLICY "用户可以查看自己的书籍" ON books
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的书籍" ON books
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的书籍" ON books
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的书籍" ON books
  FOR DELETE
  USING (auth.uid() = user_id);

-- 为 podcasts 表创建 RLS 策略
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的策略以避免冲突
DROP POLICY IF EXISTS "用户可以查看自己的播客" ON podcasts;
DROP POLICY IF EXISTS "用户可以创建自己的播客" ON podcasts;
DROP POLICY IF EXISTS "用户可以更新自己的播客" ON podcasts;
DROP POLICY IF EXISTS "用户可以删除自己的播客" ON podcasts;

-- 创建新策略
CREATE POLICY "用户可以查看自己的播客" ON podcasts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的播客" ON podcasts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的播客" ON podcasts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的播客" ON podcasts
  FOR DELETE
  USING (auth.uid() = user_id);

-- 为 countries 表创建 RLS 策略
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的策略以避免冲突
DROP POLICY IF EXISTS "所有用户可以查看国家列表" ON countries;

-- 创建新策略
CREATE POLICY "所有用户可以查看国家列表" ON countries
  FOR SELECT
  TO authenticated
  USING (true);

-- 为 cities 表创建 RLS 策略
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的策略以避免冲突
DROP POLICY IF EXISTS "所有用户可以查看城市列表" ON cities;

-- 创建新策略
CREATE POLICY "所有用户可以查看城市列表" ON cities
  FOR SELECT
  TO authenticated
  USING (true);

-- 为 book_cities 表创建 RLS 策略
ALTER TABLE book_cities ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的策略以避免冲突
DROP POLICY IF EXISTS "用户可以查看自己的书籍关联城市" ON book_cities;
DROP POLICY IF EXISTS "用户可以创建自己的书籍关联城市" ON book_cities;
DROP POLICY IF EXISTS "用户可以删除自己的书籍关联城市" ON book_cities;

-- 创建新策略
CREATE POLICY "用户可以查看自己的书籍关联城市" ON book_cities
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM books
    WHERE books.id = book_cities.book_id
    AND books.user_id = auth.uid()
  ));

CREATE POLICY "用户可以创建自己的书籍关联城市" ON book_cities
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM books
    WHERE books.id = book_cities.book_id
    AND books.user_id = auth.uid()
  ));

CREATE POLICY "用户可以删除自己的书籍关联城市" ON book_cities
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM books
    WHERE books.id = book_cities.book_id
    AND books.user_id = auth.uid()
  ));

-- 为 podcast_cities 表创建 RLS 策略
ALTER TABLE podcast_cities ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的策略以避免冲突
DROP POLICY IF EXISTS "用户可以查看自己的播客关联城市" ON podcast_cities;
DROP POLICY IF EXISTS "用户可以创建自己的播客关联城市" ON podcast_cities;
DROP POLICY IF EXISTS "用户可以删除自己的播客关联城市" ON podcast_cities;

-- 创建新策略
CREATE POLICY "用户可以查看自己的播客关联城市" ON podcast_cities
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM podcasts
    WHERE podcasts.id = podcast_cities.podcast_id
    AND podcasts.user_id = auth.uid()
  ));

CREATE POLICY "用户可以创建自己的播客关联城市" ON podcast_cities
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM podcasts
    WHERE podcasts.id = podcast_cities.podcast_id
    AND podcasts.user_id = auth.uid()
  ));

CREATE POLICY "用户可以删除自己的播客关联城市" ON podcast_cities
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM podcasts
    WHERE podcasts.id = podcast_cities.podcast_id
    AND podcasts.user_id = auth.uid()
  ));

-- 为 profiles 表创建 RLS 策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的策略以避免冲突
DROP POLICY IF EXISTS "用户可以查看自己的资料" ON profiles;
DROP POLICY IF EXISTS "用户可以更新自己的资料" ON profiles;

-- 创建新策略
CREATE POLICY "用户可以查看自己的资料" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的资料" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);
