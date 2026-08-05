# 🚀 Deployment Guide — Cloudflare Pages & Supabase

> **Hướng Dẫn Triển Khai Sản Phẩm**: Các bước cài đặt, cấu hình biến môi trường và deploy lên Cloudflare Pages & Supabase (0$/tháng commercial).

---

## 🛠️ 1. Chuẩn Bị Biến Môi Trường (Environment Variables)

Tạo tệp `.env.local` hoặc cấu hình trong **Cloudflare Pages Environment Variables**:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Strava API v3 Configuration
STRAVA_CLIENT_ID=12345
STRAVA_CLIENT_SECRET=abcdef1234567890
STRAVA_VERIFY_TOKEN=your_custom_webhook_secret_token

# App Configuration
NEXT_PUBLIC_APP_URL=https://strava-ranking.pages.dev
```

---

## 📦 2. Các Bước Triển Khai Lên Cloudflare Pages

1. **Cài đặt Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **Đăng nhập Cloudflare**:
   ```bash
   npx wrangler login
   ```

3. **Biên dịch dự án**:
   ```bash
   npm run build
   ```

4. **Triển khai sản phẩm**:
   ```bash
   npx wrangler pages deploy .open-next/assets --project-name=strava-ranking
   ```

---

## 🗄️ 3. Thiết Lập PostgreSQL trên Supabase

1. Mở Supabase Project SQL Editor.
2. Thực thi tệp `docs/03-architecture/erd.md` để khởi tạo toàn bộ schema, indexes và RLS Policies.
3. Tạo tài khoản Admin ban đầu trong `auth.users` và set `role = 'admin'` trong `user_profiles`.
