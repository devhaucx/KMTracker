# 📄 Product Requirements Document (PRD) — KM Tracker Platform

> **Tên hệ thống:** KM Tracker — Nền tảng tích lũy & thi đua KM thể thao doanh nghiệp  
> **Phiên bản:** v3.0 (Cập nhật Kiến trúc Phân quyền, Soft Delete, Chống Thao Túng & Chuyển Giải Động)  
> **Đối tượng:** Cán bộ nhân viên công ty (Vận động viên) & Ban Tổ Chức (Admin)

---

## 🎯 1. Mục Tiêu Sản Phẩm (Product Vision)

Hệ thống **KM Tracker** là giải pháp phần mềm SaaS doanh nghiệp giúp khởi tạo, vận hành và quản lý các giải thi đua tích lũy KM thể thao (Chạy bộ, Đi bộ, Đạp xe, Bơi lội...) dựa trên quãng đường thực tế thực hiện được giữa các cá nhân và đơn vị phòng ban trong công ty.

### Các Trụ Cột Nền Tảng:
1. **Thi đua Hào hứng & Gamification**: Bảng Vàng Top 3 Podium có hiệu ứng ánh kim & vương miện Vàng, thanh tiến độ 1,000 KM toàn giải, chỉ số bám đuổi runner phía trên và xếp hạng phòng ban real-time.
2. **Minh Bạch & Tự Động 100%**: Bài tập được tự động ghi nhận qua **Strava API v3 Webhook**, kiểm tra dải pace/speed tối thiểu – tối đa và quy đổi thành điểm KM theo tỉ lệ riêng của từng giải đấu.
3. **Bảo Vệ Dữ Liệu & Khóa Thao Túng (Security & Anti-Tampering)**:
   - **Immutability Lock**: Công thức điểm, dải pace và ngày thi đấu tự động KHÓA khi giải đang `active` hoặc `ended` để chống thao túng thứ hạng.
   - **Soft Delete (`is_deleted = true`)**: Xóa giải đấu hoặc gỡ tài khoản chỉ gán cờ ẩn, tuyệt đối không xóa cứng dữ liệu khỏi PostgreSQL.
   - **Đối soát Strava ID & Xử lý Khiếu nại**: Admin kiểm tra trực tiếp hồ sơ Strava công khai (`strava.com/athletes/{id}`), có quyền `[Loại khỏi giải]` đối với tài khoản ảo và `[↺ Khôi phục & Đồng bộ]` để trả lại điểm thi đấu khi khiếu nại đúng.
4. **Ngữ Cảnh 1 Cuộc Thi Active & Quy Đổi Điểm 2 Chiều**:
   - VĐV thi đấu trong ngữ cảnh 1 giải active tại 1 thời điểm trên Dashboard.
   - Khi chuyển giữa các giải đấu, điểm số thô Strava giữ nguyên và được **quy đổi lại chính xác 100% theo khoảng thời gian (`start_date` → `end_date`) và thể lệ riêng của giải đó**. Khi quay lại giải cũ, điểm số và thứ hạng cũ được khôi phục nguyên vẹn.

---

## 👥 2. Người Dùng & Phân Quyền (User Personas & Auth)

### 2.1 Vận Động Viên / Nhân Viên (`role: 'user'`)
- Nhận Link Mời (ví dụ: `/join/AUTUMN2026`) từ BTC để xem thể lệ và kết nối tài khoản Strava qua OAuth 2.0.
- Chọn đơn vị Phòng Ban đại diện (Marketing, IT, Kinh Doanh, Kế Toán, Ban Giám Đốc...).
- Xem Dashboard cá nhân, thống kê KM, biểu đồ Donut % môn, tiến độ 7 ngày và link bấm trực tiếp bài tập trên Strava (`strava.com/activities/{id}`).
- Nhập mã mời để chuyển đổi ngữ cảnh thi đấu hoặc bấm `[Đồng bộ & Tính lại điểm]` tự phục vụ.

### 2.2 Ban Tổ Chức / Admin (`role: 'admin' | 'super_admin'`)
- Đăng nhập bằng Email/Password tại cổng `/admin/login` (không bắt buộc phải có tài khoản Strava).
- Tạo cuộc thi mới, thiết lập dải pace min/max, tỉ lệ quy đổi và tạo Link Mời.
- Quản lý danh mục phòng ban và phân gán nhân sự.
- Kiểm duyệt bài tập nghi vấn, kéo bài tập bị sót thủ công bằng `Strava Activity ID`.
- Đối soát Strava Athlete ID, xử lý khiếu nại, loại tài khoản ảo hoặc khôi phục VĐV.
- Báo cáo thi đua & xuất tệp CSV UTF-8 BOM chuẩn cho Microsoft Excel.

---

## 🏆 3. Quy Tắc Quy Đổi Điểm & Kiểm Soát Pace (Scoring Engine)

### 3.1 Ma Trận Môn Thể Thao & Quy Đổi Chuẩn
- **Chạy bộ (Run)**: 1.0 km thực tế = 1.0 km quy đổi (Dải pace chuẩn: `4:00` - `15:00` min/km).
- **Đi bộ (Walk)**: 1.0 km thực tế = 1.0 km quy đổi (Dải pace chuẩn: `9:00` - `20:00` min/km).
- **Đạp xe (Ride)**: 1.0 km thực tế = 0.33 km quy đổi (Dải speed chuẩn: `10` - `35` km/h).
- **Bơi lội (Swim)**: 1.0 km thực tế = 5.0 km quy đổi (Dải pace chuẩn: `1:30` - `6:00` min/100m).

### 3.2 Tùy Chỉnh Thể Lệ Theo Cuộc Thi
Admin có thể bật/tắt từng môn, thay đổi hệ số quy đổi và nới/siết dải pace min/max khi tạo giải đấu mới.

---

## 🛡️ 4. Kiểm Soát Quyền Truy Cập (Access Control Matrix)

- **Trang Công Khai (Guest)**: `/` (Landing Page SaaS), `/join/[code]` (Trang Link Mời), `/admin/login`.
- **Trang VĐV (Auth User)**: `/dashboard`, `/leaderboard`, `/rules`, `/profile`.
- **Trang Quản Trị (Admin)**: `/admin`, `/admin/competitions`, `/admin/competitions/new`, `/admin/competitions/[id]`, `/admin/departments`, `/admin/users`, `/admin/activities`, `/admin/reports`.
