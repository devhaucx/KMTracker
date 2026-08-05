# 🔄 User Flows & Interaction Diagrams — Strava Ranking Platform

> **Tài liệu Luồng Người Dùng & Sơ Đồ Tương Tác**: Chi tiết 4 luồng nghiệp vụ chính bằng Mermaid Diagrams.

---

## 1. Luồng Đăng Ký Tham Gia Qua Link Mời (Invite Link & OAuth Flow)

```mermaid
flowchart TD
    A[VĐV nhận Link Mời: /join/AUTUMN2026] --> B[Hiển thị thông tin cuộc thi & Countdown]
    B --> C[Click nút: Tham gia bằng Strava]
    C --> D[Chuyển hướng sang Strava OAuth 2.0]
    D --> E{Ủy quyền Strava thành công?}
    E -- Thất bại/Hủy --> B
    E -- Thành công --> F[CF Worker nhận Auth Code]
    F --> G[Exchange Code lấy Access Token & Refresh Token]
    G --> H[Upsert User Profile & Strava Athlete ID]
    H --> I[Gán VĐV vào Cuộc thi & Chuyển tới /dashboard]
    I --> J[Chọn Phòng Ban đại diện]
```

---

## 2. Luồng Tiếp Nhận & Quy Đổi Điểm Bài Tập (Webhook & Scoring Flow)

```mermaid
flowchart TD
    A[Strava Webhook: activity.create] --> B[CF Worker phản hồi 200 OK trong <50ms]
    B --> C[Enqueue sự kiện vào CF Queue]
    C --> D[Supabase Edge Function: process-activity]
    D --> E[Tải thông tin bài tập chi tiết từ Strava API v3]
    E --> F[Chạy động cơ calculateActivityScore]
    F --> G{Bài tập hợp lệ theo Pace/Speed & Ngày thi đấu?}
    G -- Không hợp lệ --> H[Lưu trạng thái is_valid = false & Ghi nhận lý do từ chối]
    G -- Hợp lệ --> I[Tính KM quy đổi = ActualKm * Ratio]
    I --> J[Lưu vào Table activities & Cập nhật Bảng xếp hạng Realtime]
```

---

## 3. Luồng Chuyển Đổi Ngữ Cảnh Cuộc Thi (Single Active Competition Switcher)

```mermaid
flowchart TD
    A[VĐV trên Dashboard /dashboard] --> B[Xem cuộc thi Active hiện tại]
    B --> C[Chọn Cuộc Thi Mới từ Dropdown / Ô Nhập Mã Mời]
    C --> D[Chuyển Ngữ Cảnh Cuộc Thi Kích Hoạt]
    D --> E[Động cơ scoring.ts quét lại lịch sử bài tập thô Strava]
    E --> F[Đánh giá lại mốc thời gian start_date -> end_date & quy tắc riêng của giải mới]
    F --> G[Cập nhật KM quy đổi & Thứ hạng tương ứng]
    G --> H[Chuyển ngược lại giải cũ -> Khôi phục 100% điểm số ban đầu]
```

---

## 4. Luồng Quản Trị, Soi Strava ID & Xử Lý Khiếu Nại (Admin Moderation & Restore Flow)

```mermaid
flowchart TD
    A[Admin đăng nhập /admin/login] --> B[Xem Danh sách VĐV /admin/users]
    B --> C[Bấm ID #12345678 -> Mở hồ sơ Strava công khai strava.com/athletes/id]
    C --> D{Tài khoản ảo hay chính chủ?}
    D -- Tài khoản ảo --> E[Click nút: Loại khỏi giải]
    E --> F[Gán status = withdrawn & Tạm ẩn khỏi Leaderboard]
    D -- VĐV khiếu nại đúng --> G[Click nút: ↺ Khôi phục & Đồng bộ]
    G --> H[Gán status = active & Tự động quét tính lại điểm bài tập]
    H --> I[Trả lại toàn bộ thành tích & thứ hạng cho VĐV trên Leaderboard]
```
