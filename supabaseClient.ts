/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Thông tin kết nối Supabase trực tiếp
const DEFAULT_SUPABASE_URL = 'https://rxjvvfoxmdfakcbqskwn.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_SJSVyW7MUw2FK4fs3IIgGw_0bor6Hzn';

// Đọc thông tin kết nối từ biến môi trường của Vite hoặc sử dụng cấu hình mặc định
const env = (import.meta as any).env || {};
const supabaseUrl: string = env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey: string = env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Kiểm tra xem biến môi trường đã được cấu hình hợp lệ chưa
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project') &&
  supabaseUrl.startsWith('http')
);

// Đường dẫn kết nối client:
// Trong môi trường trình duyệt, sử dụng proxy `/api/supabase` của cùng domain (same-origin)
// để tránh hoàn toàn việc bị chặn bởi Sandbox iframe và lỗi CORS của trình duyệt.
const getClientUrl = (): string => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api/supabase`;
  }
  return 'http://localhost:3000/api/supabase';
};

// Khởi tạo Supabase client an toàn
// Nếu chưa cấu hình, supabase sẽ là null để hệ thống tự động kích hoạt chế độ Fallback LocalStorage an toàn
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(getClientUrl(), supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

