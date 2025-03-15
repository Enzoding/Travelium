# 数据结构

## 书籍
涉及以下字段：
- id: 书籍ID 唯一标识 系统生成
- book_title: 书名 string 必填
- author: 作者 string 非必填
- book_url: 书籍链接 string 非必填
- book_description: 书籍描述 string 非必填
- book_status: 书籍状态 int 0表示有效 1表示删除
- user_id: 用户ID string 与用户进行关联
- created_at: 创建时间
- updated_at: 更新时间

## 播客
涉及以下字段：
- id: 播客ID 唯一标识
- podcast_title: 播客标题 string 必填
- podcast_url: 播客链接 string 非必填
- podcast_description: 播客描述 string 非必填
- podcast_status: 播客状态 int 0表示有效 1表示删除
- user_id: 用户ID string 与用户进行关联
- created_at: 创建时间
- updated_at: 更新时间