import { Database } from "./supabase";

// 内容类型枚举
export enum ContentType {
  Book = 'book',
  Podcast = 'podcast',
  Article = 'article',
  Video = 'video'
}

export type Country = {
  id: string;
  code: string;
  name: string;
  created_at?: string;
};

export type City = {
  id: string;
  name: string;
  country_id: string;
  country_name?: string; // 用于前端显示
  country_code?: string; // 用于前端显示
  mapbox_id?: string;
  place_type?: string;
  longitude?: number;
  latitude?: number;
  bbox?: string;
  region?: string;
  district?: string;
  place_formatted?: string;
  created_at?: string;
  updated_at?: string;
};

export type ExternalResource = {
  id: string;
  content_id: string;
  url: string;
  created_at?: string;
};

// 统一内容类型
export type Content = {
  id: string;
  user_id: string;
  type: ContentType;
  title: string;
  subtitle?: string;
  orig_title?: string;
  description?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  
  // API兼容字段
  uuid?: string;
  url?: string;
  api_url?: string;
  category?: string;
  parent_uuid?: string;
  display_title?: string;
  
  // 书籍特有字段
  author?: string[];
  translator?: string[];
  language?: string[];
  pub_house?: string;
  pub_year?: number;
  pub_month?: number;
  binding?: string;
  price?: string;
  pages?: number;
  series?: string;
  imprint?: string;
  isbn?: string;
  
  // 关联数据 (非数据库字段，用于前端显示)
  countries?: Country[];
  cities?: City[];
  external_resources?: ExternalResource[];
};

// 向后兼容的类型定义
export type Book = {
  id: string;
  title: string;
  author?: string;
  description?: string;
  url?: string;
  coverUrl?: string;
  countries: Country[];
  cities: City[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  status?: number;
};

export type Podcast = {
  id: string;
  title: string;
  url?: string;
  description?: string;
  coverUrl?: string;
  audioUrl?: string;
  countries: Country[];
  cities: City[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  status?: number;
};

export type Profile = {
  id: string;
  username?: string;
  avatar_url?: string;
  full_name?: string;
  bio?: string;
  website?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
};

// 不带ID的内容类型，用于创建新内容
export type ContentWithoutId = Omit<Content, 'id' | 'user_id' | 'created_at' | 'updated_at'> & {
  cities?: City[];
  countries?: Country[];
  external_resources?: { url: string }[];
};

// 向后兼容的类型定义
export type BookWithoutId = {
  title: string;
  author?: string;
  description?: string;
  url?: string;
  coverUrl?: string;
  countries?: Country[];
  cities?: City[];
};

export type PodcastWithoutId = {
  title: string;
  url?: string;
  description?: string;
  coverUrl?: string;
  audioUrl?: string;
  countries?: Country[];
  cities?: City[];
};
