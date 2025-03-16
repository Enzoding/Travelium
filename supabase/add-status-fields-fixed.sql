-- 为 podcasts 表添加 podcast_status 字段
ALTER TABLE podcasts
ADD COLUMN IF NOT EXISTS podcast_status INTEGER DEFAULT 0;

-- 为 books 表添加 book_status 字段
ALTER TABLE books
ADD COLUMN IF NOT EXISTS book_status INTEGER DEFAULT 0;
