# 📋 User Stories & Acceptance Criteria — Strava Ranking

> **Tài liệu Yêu Cầu Chức Năng**: Tập hợp User Stories và Điều kiện Chấp nhận (Acceptance Criteria) cho cả Vận Động Viên và Ban Tổ Chức Admin.

---

## 🏃 1. User Stories Dành Cho Vận Động Viên (VĐV / Employee)

### US-01: Thâm nhập Cuộc Thi qua Link Mời & Strava OAuth
- **As a** Vận động viên / Nhân viên công ty,
- **I want to** mở đường link mời (vd: `/join/AUTUMN2026`), xem thể lệ, chọn phòng ban và đăng nhập bằng tài khoản Strava,
- **So that** tôi có thể gia nhập giải đấu nhanh chóng mà không cần tạo mật khẩu mới.
- **Acceptance Criteria**:
  - Trang `/join/[code]` hiển thị đếm ngược thời gian khai mạc và sơ đồ thể lệ.
  - Sau khi xác thực Strava OAuth thành công, tự động gán VĐV vào giải và chuyển hướng về `/dashboard`.

### US-02: Theo Dõi Thành Tích & Chuyển Đổi Giải Đấu Trên Dashboard
- **As a** Vận động viên,
- **I want to** xem tổng số KM quy đổi, bài tập hợp lệ, biểu đồ Donut môn tập và biểu đồ tiến độ 7 ngày trên Dashboard cá nhân,
- **So that** tôi có thể quản lý phong độ rèn luyện của bản thân.
- **Acceptance Criteria**:
  - Mỗi tên bài tập có link bấm `↗` mở trực tiếp bài tập gốc trên Strava (`strava.com/activities/{id}`).
  - Có khung chọn chuyển đổi giữa các giải đấu (Single Active Competition).
  - Khi chuyển giải đấu, toàn bộ bài tập thô Strava được tự động quy đổi lại theo khung thời gian (`start_date` → `end_date`) và thể lệ riêng của giải đó. Bấm chuyển lại giải cũ sẽ khôi phục 100% điểm số ban đầu.

### US-03: Tự Đồng Bộ Bài Tập Khi Nghẽn Mạng
- **As a** Vận động viên,
- **I want to** bấm nút `[Đồng bộ & Tính lại điểm]` trên Dashboard khi bài tập bị chậm,
- **So that** thành tích chạy mới nhất được cập nhật ngay lập tức lên Bảng Xếp Hạng.

---

## ⚙️ 2. User Stories Dành Cho Ban Tổ Chức (Admin / Organizers)

### US-04: Tạo & Khóa Thể Lệ Cuộc Thi (Immutability Lock)
- **As an** Admin / Ban Tổ Chức,
- **I want to** khởi tạo cuộc thi mới, cấu hình dải pace min/max và tỉ lệ quy đổi từng môn,
- **So that** hệ thống tự động kiểm duyệt và tính điểm minh bạch.
- **Acceptance Criteria**:
  - Khi cuộc thi chuyển sang trạng thái `active` hoặc `ended`, công thức điểm và thời gian thi đấu sẽ **tự động khóa (`disabled`)** để chống thao túng thứ hạng.

### US-05: Bảo Vệ Dữ Liệu Bằng Soft Delete (`is_deleted = true`)
- **As an** Admin,
- **I want to** xóa cuộc thi mà không bị mất dữ liệu thô trong PostgreSQL,
- **So that** toàn bộ bài tập và dữ liệu đối soát được bảo vệ an toàn nếu tài khoản Admin bị can thiệp ngoài ý muốn.
- **Acceptance Criteria**:
  - Lệnh xóa chỉ gắn cờ `is_deleted = true` và `deleted_at = TIMESTAMP`. Cuộc thi ẩn khỏi giao diện nhưng lưu trữ an toàn 100% trong DB.

### US-06: Đối Soát Strava Athlete ID & Xử Lý Khiếu Nại VĐV
- **As an** Admin,
- **I want to** xem mã Strava ID của VĐV, mở trực tiếp hồ sơ Strava công khai (`strava.com/athletes/{id}`) và thực hiện nút `[Loại khỏi giải]` hoặc `[↺ Khôi phục & Đồng bộ]`,
- **So that** tôi có thể loại bỏ tài khoản ảo hoặc trả lại thành tích cho nhân viên khi khiếu nại thành công.
- **Acceptance Criteria**:
  - Bấm `[Loại khỏi giải]` tạm ẩn VĐV khỏi Bảng xếp hạng.
  - Bấm `[↺ Khôi phục & Đồng bộ]` đưa trạng thái VĐV về `active`, tự động tính toán lại bài tập từ Webhook DB và trả lại thứ hạng cũ cho VĐV.

### US-07: Xuất Báo Cáo CSV Chuẩn Microsoft Excel
- **As an** Admin,
- **I want to** xuất báo cáo kết quả thi đua dưới dạng tệp CSV UTF-8 BOM,
- **So that** tệp hiển thị tiếng Việt có dấu hoàn hảo trên Microsoft Excel mà không bị lỗi phông chữ.
