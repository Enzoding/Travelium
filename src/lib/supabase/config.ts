import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

// 这些环境变量将在部署时设置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 创建 Supabase 客户端实例（用于非浏览器环境）
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// 创建客户端 Supabase 客户端（浏览器端使用）
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// 创建服务器端 Supabase 客户端（用于服务器组件）
export function createServerSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
