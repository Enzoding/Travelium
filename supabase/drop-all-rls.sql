-- 删除所有表的 RLS 策略

-- 删除 books 表的策略
DROP POLICY IF EXISTS "用户可以查看自己的书籍" ON books;
DROP POLICY IF EXISTS "用户可以创建自己的书籍" ON books;
DROP POLICY IF EXISTS "用户可以更新自己的书籍" ON books;
DROP POLICY IF EXISTS "用户可以删除自己的书籍" ON books;
ALTER TABLE IF EXISTS books DISABLE ROW LEVEL SECURITY;

-- 删除 podcasts 表的策略
DROP POLICY IF EXISTS "用户可以查看自己的播客" ON podcasts;
DROP POLICY IF EXISTS "用户可以创建自己的播客" ON podcasts;
DROP POLICY IF EXISTS "用户可以更新自己的播客" ON podcasts;
DROP POLICY IF EXISTS "用户可以删除自己的播客" ON podcasts;
ALTER TABLE IF EXISTS podcasts DISABLE ROW LEVEL SECURITY;

-- 删除 countries 表的策略
DROP POLICY IF EXISTS "所有用户可以查看国家列表" ON countries;
ALTER TABLE IF EXISTS countries DISABLE ROW LEVEL SECURITY;

-- 删除 cities 表的策略
DROP POLICY IF EXISTS "所有用户可以查看城市列表" ON cities;
ALTER TABLE IF EXISTS cities DISABLE ROW LEVEL SECURITY;

-- 删除 profiles 表的策略
DROP POLICY IF EXISTS "用户可以查看自己的资料" ON profiles;
DROP POLICY IF EXISTS "用户可以更新自己的资料" ON profiles;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;

-- 删除 book_cities 表的策略
DROP POLICY IF EXISTS "用户可以查看自己的书籍关联城市" ON book_cities;
DROP POLICY IF EXISTS "用户可以创建自己的书籍关联城市" ON book_cities;
DROP POLICY IF EXISTS "用户可以删除自己的书籍关联城市" ON book_cities;
ALTER TABLE IF EXISTS book_cities DISABLE ROW LEVEL SECURITY;

-- 删除 podcast_cities 表的策略
DROP POLICY IF EXISTS "用户可以查看自己的播客关联城市" ON podcast_cities;
DROP POLICY IF EXISTS "用户可以创建自己的播客关联城市" ON podcast_cities;
DROP POLICY IF EXISTS "用户可以删除自己的播客关联城市" ON podcast_cities;
ALTER TABLE IF EXISTS podcast_cities DISABLE ROW LEVEL SECURITY;

-- 如果之前有旧的关联表，也一并清理
-- 删除 book_countries 表的策略（如果存在）
DROP POLICY IF EXISTS "用户可以查看自己的书籍关联国家" ON book_countries;
DROP POLICY IF EXISTS "用户可以创建自己的书籍关联国家" ON book_countries;
DROP POLICY IF EXISTS "用户可以更新自己的书籍关联国家" ON book_countries;
DROP POLICY IF EXISTS "用户可以删除自己的书籍关联国家" ON book_countries;
ALTER TABLE IF EXISTS book_countries DISABLE ROW LEVEL SECURITY;

-- 删除 podcast_countries 表的策略（如果存在）
DROP POLICY IF EXISTS "用户可以查看自己的播客关联国家" ON podcast_countries;
DROP POLICY IF EXISTS "用户可以创建自己的播客关联国家" ON podcast_countries;
DROP POLICY IF EXISTS "用户可以更新自己的播客关联国家" ON podcast_countries;
DROP POLICY IF EXISTS "用户可以删除自己的播客关联国家" ON podcast_countries;
ALTER TABLE IF EXISTS podcast_countries DISABLE ROW LEVEL SECURITY;
