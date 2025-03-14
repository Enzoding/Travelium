-- 为 books 表创建 RLS 策略
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 允许已认证用户查看自己的书籍
CREATE POLICY "用户可以查看自己的书籍" ON books
  FOR SELECT
  USING (auth.uid() = user_id);

-- 允许已认证用户创建自己的书籍
CREATE POLICY "用户可以创建自己的书籍" ON books
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许已认证用户更新自己的书籍
CREATE POLICY "用户可以更新自己的书籍" ON books
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 允许已认证用户删除自己的书籍
CREATE POLICY "用户可以删除自己的书籍" ON books
  FOR DELETE
  USING (auth.uid() = user_id);

-- 为 podcasts 表创建 RLS 策略
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

-- 允许已认证用户查看自己的播客
CREATE POLICY "用户可以查看自己的播客" ON podcasts
  FOR SELECT
  USING (auth.uid() = user_id);

-- 允许已认证用户创建自己的播客
CREATE POLICY "用户可以创建自己的播客" ON podcasts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许已认证用户更新自己的播客
CREATE POLICY "用户可以更新自己的播客" ON podcasts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 允许已认证用户删除自己的播客
CREATE POLICY "用户可以删除自己的播客" ON podcasts
  FOR DELETE
  USING (auth.uid() = user_id);

-- 为 countries 表创建 RLS 策略
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- 允许所有用户查看国家列表
CREATE POLICY "所有用户可以查看国家列表" ON countries
  FOR SELECT
  TO authenticated
  USING (true);

-- 为 profiles 表创建 RLS 策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 允许已认证用户查看自己的资料
CREATE POLICY "用户可以查看自己的资料" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 允许已认证用户更新自己的资料
CREATE POLICY "用户可以更新自己的资料" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 创建触发器函数，在用户注册时自动创建资料
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, created_at, updated_at)
  VALUES (new.id, new.email, '', '', now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 为 cities 表创建 RLS 策略
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- 允许所有用户查看城市列表
CREATE POLICY "所有用户可以查看城市列表" ON cities
  FOR SELECT
  TO authenticated
  USING (true);

-- 为 book_cities 表创建 RLS 策略
ALTER TABLE book_cities ENABLE ROW LEVEL SECURITY;

-- 允许已认证用户查看自己的书籍关联城市
CREATE POLICY "用户可以查看自己的书籍关联城市" ON book_cities
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM books
    WHERE books.id = book_cities.book_id
    AND books.user_id = auth.uid()
  ));

-- 允许已认证用户创建自己的书籍关联城市
CREATE POLICY "用户可以创建自己的书籍关联城市" ON book_cities
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM books
    WHERE books.id = book_cities.book_id
    AND books.user_id = auth.uid()
  ));

-- 允许已认证用户删除自己的书籍关联城市
CREATE POLICY "用户可以删除自己的书籍关联城市" ON book_cities
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM books
    WHERE books.id = book_cities.book_id
    AND books.user_id = auth.uid()
  ));

-- 为 podcast_cities 表创建 RLS 策略
ALTER TABLE podcast_cities ENABLE ROW LEVEL SECURITY;

-- 允许已认证用户查看自己的播客关联城市
CREATE POLICY "用户可以查看自己的播客关联城市" ON podcast_cities
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM podcasts
    WHERE podcasts.id = podcast_cities.podcast_id
    AND podcasts.user_id = auth.uid()
  ));

-- 允许已认证用户创建自己的播客关联城市
CREATE POLICY "用户可以创建自己的播客关联城市" ON podcast_cities
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM podcasts
    WHERE podcasts.id = podcast_cities.podcast_id
    AND podcasts.user_id = auth.uid()
  ));

-- 允许已认证用户删除自己的播客关联城市
CREATE POLICY "用户可以删除自己的播客关联城市" ON podcast_cities
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM podcasts
    WHERE podcasts.id = podcast_cities.podcast_id
    AND podcasts.user_id = auth.uid()
  ));