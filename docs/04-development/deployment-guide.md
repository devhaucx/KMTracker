# 🚀 Deployment Guide — Cloudflare Workers & Supabase

> **Hướng Dẫn Triển Khai Sản Phẩm**: Quy trình build OpenNext v1.20, cấu hình biến môi trường và deploy lên Cloudflare Workers (0$/tháng commercial) & Supabase PostgreSQL.

---

## 🛠️ 1. Chuẩn Bị Biến Môi Trường (Environment Variables)

Tạo tệp `.env.local` cho môi trường Local Dev & cấu hình trên Cloudflare Workers Dashboard:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Strava API v3 Configuration
STRAVA_CLIENT_ID=12345
STRAVA_CLIENT_SECRET=abcdef1234567890
STRAVA_VERIFY_TOKEN=your_custom_webhook_secret_token

# Application URL & Auth Secret
NEXT_PUBLIC_APP_URL=https://kmtracker.dev-haucx.workers.dev
SESSION_SECRET=your_custom_hmac_sha256_secret_key
```

---

## 📦 2. Các Bước Biên Dịch & Triển Khai Worker

1. **Biên dịch OpenNext Cloudflare Worker**:
   ```bash
   npm run build:worker
   ```
   *Lưu ý: Lệnh này kích hoạt `@opennextjs/cloudflare build` tạo gói Worker tối ưu trong `.open-next/worker.js`.*

2. **Triển khai lên Cloudflare Workers với API Token**:
   ```bash
   CLOUDFLARE_API_TOKEN=cfut_... npx wrangler deploy
   ```

---

## 🗄️ 3. Thiết Lập Cơ Sở Dữ Liệu Supabase PostgreSQL

1. Đăng nhập Supabase Console và mở **SQL Editor**.
2. Thực thi tuần tự các tệp Migration từ `supabase/migrations/`:
   - `001_initial_schema.sql` (Tables & RLS)
   - `002_departments.sql`
   - `003_activities_converted.sql`
   - `004_admin_roles.sql`
   - `005_audit_logs.sql`
   - `006_rule_modifications.sql`
   - `007_soft_delete_and_competitions.sql`
3. Cấu hình tài khoản Admin trong `user_profiles` với `role = 'admin'` hoặc `'super_admin'`.
