# 🔌 API Specification — Strava Ranking Platform

> **Đặc tả Giao diện Lập trình Ứng dụng (API Spec)**: Các endpoint OAuth 2.0, Webhook tiếp nhận dữ liệu và API xử lý đối soát.

---

## 🔑 1. Authenticated Strava OAuth Endpoints

### `GET /api/auth/strava`
- **Mục đích**: Khởi tạo luồng đăng nhập Strava OAuth 2.0.
- **Query Params**:
  - `invite_code` (optional): Mã cuộc thi muốn gia nhập sau khi auth.
- **Flow**: Redirect người dùng sang `https://www.strava.com/oauth/authorize?client_id=...&response_type=code&scope=read,activity:read_all`.

### `GET /api/auth/strava/callback`
- **Mục đích**: Tiếp nhận `code` từ Strava, thực hiện token exchange và tạo phiên đăng nhập.
- **Query Params**:
  - `code`: Authorization code từ Strava.
  - `scope`: Quyền được cấp.
- **Response**: Set cookie phiên đăng nhập và redirect về `/dashboard` hoặc `/join/[code]`.

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
- **Flow**: Push event vào Cloudflare Queue / Edge Function để tải thông tin bài tập từ Strava API v3, chạy động cơ quy đổi `calculateActivityScore` và lưu kết quả vào PostgreSQL.

---

## 🛠️ 3. Admin & User Manual Reconciliation Endpoints

### `POST /api/activities/resync`
- **Mục đích**: Kéo bài tập bị thiếu thủ công qua mã `strava_activity_id`.
- **Body Payload**:
  ```json
  {
    "strava_activity_id": 987654321
  }
  ```
- **Response**: `200 OK` với chi tiết chỉ số đã đối soát và cập nhật thành công vào Bảng Xếp Hạng.
