-- 内容类型枚举
CREATE TYPE content_type AS ENUM ('book', 'podcast', 'article', 'video');

-- 创建用户配置文件表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  full_name TEXT,
  bio TEXT,
  website TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 为用户配置文件表添加行级安全策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户可以查看所有配置文件" ON profiles FOR SELECT USING (true);
CREATE POLICY "用户只能更新自己的配置文件" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "用户只能插入自己的配置文件" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 创建内容表（主要针对书籍API）
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type content_type NOT NULL,
  
  -- 基本信息
  title TEXT NOT NULL,
  subtitle TEXT,
  orig_title TEXT,
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- API兼容字段
  uuid TEXT,
  url TEXT,
  api_url TEXT,
  category TEXT,
  parent_uuid TEXT,
  display_title TEXT,
  
  -- 书籍特有字段
  author TEXT[],
  translator TEXT[],
  language TEXT[],
  pub_house TEXT,
  pub_year INTEGER,
  pub_month INTEGER,
  binding TEXT,
  price TEXT,
  pages INTEGER,
  series TEXT,
  imprint TEXT,
  isbn TEXT
);

-- 创建外部资源表
CREATE TABLE external_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 创建国家表
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 创建城市表
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  
  -- Mapbox相关字段
  mapbox_id TEXT,                         -- Mapbox的唯一标识符
  place_type TEXT,                        -- 地点类型（如city, town等）
  longitude DECIMAL(10, 7),               -- 经度
  latitude DECIMAL(10, 7),                -- 纬度
  bbox TEXT,                              -- 边界框 [minLon,minLat,maxLon,maxLat]
  region TEXT,                            -- 区域/省/州
  district TEXT,                          -- 区/县
  place_formatted TEXT,                   -- 格式化的地点名称
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (name, country_id)
);

-- 内容位置关联表
CREATE TABLE content_locations (
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, city_id)
);

-- 创建索引以提高查询性能
CREATE INDEX idx_contents_user_id ON contents(user_id);
CREATE INDEX idx_contents_type ON contents(type);
CREATE INDEX idx_content_locations_content_id ON content_locations(content_id);
CREATE INDEX idx_content_locations_city_id ON content_locations(city_id);

-- 添加行级安全策略
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户只能查看自己的内容" ON contents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能插入自己的内容" ON contents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户只能更新自己的内容" ON contents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用户只能删除自己的内容" ON contents FOR DELETE USING (auth.uid() = user_id);

-- 为其他表添加行级安全策略
ALTER TABLE external_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "外部资源安全策略" ON external_resources 
  USING (EXISTS (SELECT 1 FROM contents WHERE contents.id = content_id AND contents.user_id = auth.uid()));

ALTER TABLE content_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "内容位置关联安全策略" ON content_locations 
  USING (EXISTS (SELECT 1 FROM contents WHERE contents.id = content_id AND contents.user_id = auth.uid()));

-- 创建触发器函数，在新用户注册时自动创建用户配置文件
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, email)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -- 创建触发器，监听新用户创建事件
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
