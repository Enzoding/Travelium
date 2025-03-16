-- 为 podcasts 表添加 podcast_status 字段
ALTER TABLE IF EXISTS podcasts
ADD COLUMN IF NOT EXISTS podcast_status INTEGER DEFAULT 0;

-- 为 books 表添加 book_status 字段（如果不存在）
ALTER TABLE IF EXISTS books
ADD COLUMN IF NOT EXISTS book_status INTEGER DEFAULT 0;
