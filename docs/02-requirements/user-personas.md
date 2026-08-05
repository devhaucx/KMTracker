# 👥 User Personas — Strava Ranking Platform

> **Chân Dung Người Dùng Mục Tiêu**: Chi tiết 2 nhóm người dùng chính tương tác với hệ thống.

---

## 1. Persona 1: Nguyễn Văn Mạnh — Vận Động Viên / Nhân Viên IT 🏃

> *"Tôi thích chạy bộ mỗi sáng quanh Tây Hồ. Tôi muốn bài tập của mình tự động quy đổi điểm chính xác để mang lại thứ hạng cho phòng ban IT mà không cần phải chụp ảnh màn hình báo cáo thủ công."*

### Demographics
- **Tuổi:** 28
- **Nghề nghiệp:** Kỹ sư Phần mềm (Phòng IT & Công Nghệ).
- **Thiết bị:** iPhone 15 Pro & Đồng hồ Garmin / Đồng bộ Strava App.
- **Thói quen thể thao:** Chạy bộ 4 buổi/tuần, đạp xe cuối tuần.

### Goals
- Ghi nhận đầy đủ minh bạch các km đã chạy trên ứng dụng Strava.
- Nhìn thấy vị trí đóng góp của bản thân cho tập thể phòng ban IT.
- Thi đua hào hứng với các đồng nghiệp khác qua Bảng Vàng Top 3 Podium.

### Phù hợp với Strava Ranking
- **Chức năng yêu thích:** Tự động đồng bộ Strava Webhook, Thanh khoảng cách bám đuổi runner phía trên, Link mở bài tập trực tiếp `strava.com/activities/{id}`.

---

## 2. Persona 2: Trần Minh Khoa — Trưởng Ban Tổ Chức / Quản Trị Viên HR 🛡️

> *"Chúng tôi muốn tổ chức giải chạy Mùa Thu cho 500 cán bộ nhân viên công ty. Hệ thống phải đảm bảo minh bạch dải pace, tự phát hiện nghi vấn gian lận GPS và giúp tôi xử lý khiếu nại dễ dàng."*

### Demographics
- **Tuổi:** 35
- **Nghề nghiệp:** Trưởng phòng Truyền thông Nội bộ & Văn hóa Doanh nghiệp.
- **Mục tiêu:** Tạo phong trào thi đua rèn luyện sức khỏe sôi nổi toàn công ty.

### Goals
- Cấu hình dải pace min/max và tỉ lệ quy đổi linh hoạt cho từng môn thi đấu.
- Phát hành Link Mời nhanh chóng qua kênh Slack/Teams nội bộ.
- Xử lý khiếu nại bài tập bị gián đoạn và loại bỏ tài khoản ảo không hợp lệ.
- Xuất báo cáo CSV UTF-8 BOM chuẩn cho Microsoft Excel để tổng kết trao giải.

### Phù hợp với Strava Ranking
- **Chức năng yêu thích:** Khóa tự động thể lệ khi active (`Immutability Lock`), Cơ chế Soft Delete (`is_deleted = true`), Soi Strava ID chính chủ, Nút `[↺ Khôi phục & Đồng bộ]`.
