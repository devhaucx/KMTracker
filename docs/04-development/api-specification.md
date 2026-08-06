# 🔌 API Specification — KM Tracker Platform

> **Đặc tả Giao diện Lập trình Ứng dụng (API Spec)**: Các endpoint Auth 2.0, Webhook tiếp nhận dữ liệu và API xử lý đối soát.

---

## 🔑 1. Authenticated Auth & OAuth Endpoints

### `GET /api/auth/strava`
- **Mục đích**: Khởi tạo luồng đăng nhập Strava OAuth 2.0.
- **Header Handling**: Kiểm tra `purpose === 'prefetch'` hoặc `x-middleware-prefetch` → Trả về `HTTP 204 No Content` để tránh lỗi CORS background fetch trong Next.js.
- **Query Params**:
  - `invite_code` (optional): Mã cuộc thi muốn gia nhập sau khi auth.
- **Flow**: Redirect người dùng sang `https://www.strava.com/oauth/authorize?client_id=...&response_type=code&scope=read,activity:read_all`.

### `GET /api/auth/strava/callback`
- **Mục đích**: Tiếp nhận `code` từ Strava, thực hiện token exchange và tạo phiên đăng nhập.
- **Query Params**:
  - `code`: Authorization code từ Strava.
  - `scope`: Quyền được cấp.
- **Flow**:
  1. Tráo đổi `code` lấy `access_token`, `refresh_token`, và `athlete_id`.
  2. Tạo/Cập nhật hồ sơ VĐV trong bảng `users` & `user_profiles`.
  3. Tạo session token HMAC-SHA256 lưu trong cookie `tm_session` (Strict HttpOnly, SameSite=Lax).
  4. Sử dụng `getAppUrl(request)` tự động nhận diện domain sản xuất (`https://kmtracker.dev-haucx.workers.dev`) để redirect an toàn.

### `GET /api/auth/logout`
- **Mục đích**: Đăng xuất tài khoản VĐV / Admin.
- **Header Handling**: Trả về `HTTP 204 No Content` khi phát hiện `prefetch` header.
- **Flow**: Xóa cookie `tm_session` và redirect người dùng về trang chủ `/`.

---

## 🏃 2. Strava Webhook Endpoints

### `GET /api/webhook/strava`
- **Mục đích**: Phản hồi xác thực Webhook Subscription với Strava API v3.
- **Query Params**:
  - `hub.mode`: `'subscribe'`
  - `hub.challenge`: Chuỗi challenge ngẫu nhiên.
  - `hub.verify_token`: Token xác thực bí mật.
- **Response**: `200 OK` với JSON `{"hub.challenge": "..."}` trong dưới 50ms.

### `POST /api/webhook/strava`
- **Mục đích**: Tiếp nhận thông báo sự kiện bài tập mới (`activity.create`).
- **Body Payload**:
  ```json
  {
    "object_type": "activity",
    "object_id": 987654321,
    "aspect_type": "create",
    "owner_id": 12345678,
    "subscription_id": 1001,
    "event_time": 1722854400
  }
  ```
- **Flow**: Tải thông tin bài tập từ Strava API v3, chạy động cơ quy đổi `calculateActivityScore` và lưu kết quả vào PostgreSQL.

---

## 🛠️ 3. Admin & User Manual Reconciliation Endpoints

### `POST /api/webhook/setup`
- **Mục đích**: Khởi tạo và thiết lập Strava Webhook Subscription tự động cho môi trường Cloudflare Workers.
