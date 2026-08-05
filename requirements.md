- App thi đua thể thao giữa các phòng ban và cá nhân đăng nhập dựa vào app strava 
- đông bộ dữ liệu theo thời gian thực 

Hoạt độngThành tích thực tếThành tích quy đổiĐiều kiện Pace/Tốc độĐi bộ1 km1 kmPace: 9 - 14 phút/kmChạy bộ1 km1 kmPace: 4 - 9 phút/kmĐạp xe3 km1 kmVận tốc: 10 - 25 km/hBơi0.2 km1 kmPace: 2 - 6 phút/100mLọc dữ liệu hợp lệ: Tự động loại bỏ các hoạt động ngoài khoảng thời gian ghi nhận thành tích (10/09/2026 - 30/09/2026) hoặc vi phạm điều kiện pace/tốc độ.

Đăng ký/Đăng nhập: Hỗ trợ đăng ký cá nhân/đội nhóm (trước 09/09/2026).

Trang cá nhân: Hiển thị lịch sử tập luyện, trạng thái đồng bộ, thành tích thực tế và thành tích quy đổi.

Bảng xếp hạng (Leaderboard): Xếp hạng thời gian thực theo cá nhân và theo phòng ban/đội nhóm.

Responsive UI: Tối ưu hiển thị mượt mà trên cả máy tính và điện thoại.

4. Trang Quản trị (Admin Dashboard)

Quản lý người dùng & Đội nhóm: Quản lý danh sách CBNV, phân quyền phòng ban.

Đối soát & Xử lý dữ liệu: Lọc, kiểm tra, duyệt/hủy các hoạt động nghi vấn từ Strava.

Báo cáo & Export: Xuất báo cáo tổng kết phục vụ công bố kết quả (dự kiến trong 3–5 ngày sau cuộc thi).

5. Yêu cầu Hạ tầng & Hiệu năng

Tải trọng hệ thống: Đảm bảo vận hành ổn định, đáp ứng khoảng 500 người dùng đồng thời.

Bảo mật: Bảo mật token kết nối Strava và thông tin nội bộ Công ty.


- 1 người dùng có khả năng tham gia nhiều loại hình thể thao, sẽ hiển thị bảng vàng ranking theo từng loại thể thao, còn bảng vàng to nhất đẹp nhất chỉ hiển thị theo cách tính điểm chung, có chức năng lọc theo cá nhân hay lọc theo phòng ban 

1. Kiến trúc Tổng quan (System Architecture)
Plaintext
[Frontend (Next.js / React)]
         │ (REST API / Supabase Client)
         ▼
[Backend Core (FastAPI / Django)] ────► [Database: Supabase (PostgreSQL)]
         │
         │ (Enqueue Job)
         ▼
   [Broker: Redis] ────► [Worker: Celery] ────► [Strava API v3]
2. Chi tiết từng thành phần & Lý do chọn
A. Backend Core & API: Python (FastAPI)
Lý do chọn: FastAPI chạy bất đồng bộ (Async/Await) cực nhanh, rất phù hợp làm RESTful API cho ứng dụng kết nối Webhook.

Nhiệm vụ:

Xử lý luồng OAuth 2.0 đăng nhập/kết nối tài khoản Strava.

Tiếp nhận Webhook gửi về từ Strava mỗi khi người dùng hoàn thành một hoạt động (Workout).

Cung cấp API hiển thị Bảng xếp hạng (Leaderboard) cho Mobile/Web.

B. Message Broker & Caching: Redis
Lý do chọn: Bắt buộc có nếu dùng Celery. Ngoài ra dùng Redis để cache Bảng xếp hạng giúp ứng dụng gánh 500+ users đồng thời mà không nghẽn Database.

Nhiệm vụ:

Hàng đợi công việc (Queue) cho Celery.

Cache kết quả Bảng xếp hạng cá nhân / phòng ban (refresh mỗi 1-5 phút/lần).

C. Background Tasks: Celery Job
Lý do chọn: Xử lý các tác vụ tốn thời gian ở chế độ chạy ngầm (Background), giúp API phản hồi ngay lập tức cho client.

Nhiệm vụ chính của Celery:

Sync Activity Job: Khi Strava Webhook báo có bài tập mới, Celery Worker sẽ kéo thông tin chi tiết (distance, elapsed_time, moving_time, type,...) qua Strava API v3.

Calculate Score Job: Thực hiện logic kiểm tra Pace/Speed và quy đổi thành tích (xem bảng bên dưới).

Cron / Scheduled Job (Celery Beat): Tự động kiểm tra và làm mới Refresh Token Strava đã hết hạn cho 500 users.

D. Database & Auth: Supabase (PostgreSQL)
Lý do chọn: Cung cấp sẵn Postgres DB, Auth, Realtime updates (nếu cần bảng xếp hạng nhảy điểm sống động) và lưu trữ tệp (Storage).

Nhiệm vụ: Lưu trữ thông tin người dùng, phòng ban, danh sách bài tập (activities) và kết quả quy đổi.

3. Logic xử lý quy đổi trong Celery Task (Core Business Logic)
Đoạn code Python minh họa hàm xử lý quy đổi thành tích cho Celery Worker:

Python
# tasks.py
from celery import Celery

app = Celery("sports_tasks", broker="redis://localhost:6379/0")


@app.task
def process_strava_activity(activity_data):
    """Xử lý và quy đổi thành tích từ dữ liệu Strava gửi về."""
    act_type = activity_data.get("type")  # Run, Walk, Ride, Swim
    distance_km = activity_data.get("distance", 0) / 1000.0  # mét -> km
    moving_time_sec = activity_data.get("moving_time", 0)

    if distance_km <= 0 or moving_time_sec <= 0:
        return {"status": "invalid_data"}

    converted_km = 0.0
    is_valid = False

    # 1. ĐI BỘ (Pace: 9 - 14 phút/km)
    if act_type in ["Walk", "Hiking"]:
        pace_min_per_km = (moving_time_sec / 60.0) / distance_km
        if 9.0 <= pace_min_per_km <= 14.0:
            is_valid = True
            converted_km = distance_km * 1.0  # 1km thực tế = 1km quy đổi

    # 2. CHẠY BỘ (Pace: 4 - 9 phút/km)
    elif act_type in ["Run"]:
        pace_min_per_km = (moving_time_sec / 60.0) / distance_km
        if 4.0 <= pace_min_per_km <= 9.0:
            is_valid = True
            converted_km = distance_km * 1.0  # 1km thực tế = 1km quy đổi

    # 3. ĐẠP XE (Vận tốc: 10 - 25 km/h)
    elif act_type in ["Ride", "EBikeRide"]:
        speed_kmh = distance_km / (moving_time_sec / 3600.0)
        if 10.0 <= speed_kmh <= 25.0:
            is_valid = True
            converted_km = distance_km / 3.0  # 3km thực tế = 1km quy đổi

    # 4. BƠI (Pace: 2 - 6 phút/100m)
    elif act_type in ["Swim"]:
        pace_min_per_100m = (moving_time_sec / 60.0) / (
            distance_km * 10
        )  # đổi ra đơn vị 100m
        if 2.0 <= pace_min_per_100m <= 6.0:
            is_valid = True
            converted_km = (
                distance_km / 0.2
            )  # 0.2km thực tế = 1km quy đổi (x5)

    # Nếu hợp lệ thì ghi nhận kết quả vào Supabase DB
    if is_valid:
        # save_to_supabase(user_id, activity_data, converted_km)
        return {"status": "success", "converted_km": converted_km}

    return {"status": "rejected_pace_out_of_range"}
4. Sơ đồ Cấu trúc CSDL mẫu trên Supabase (Postgres)
users: id, email, full_name, department_id, strava_athlete_id, access_token, refresh_token, token_expires_at.

departments: id, name (Ví dụ: Phòng Marketing, Khối Nhà máy,...).

activities:

id, user_id, strava_activity_id

type (Walk/Run/Ride/Swim)

distance_actual (km thực tế)

distance_converted (km quy đổi)

moving_time (giây)

pace_or_speed

start_date (UTC - Dùng để check trong khoảng 10/09/2026 đến 30/09/2026)

is_valid (Boolean - Hợp lệ hay vi phạm Pace)

5. Chiến lược tối ưu để gánh 500 Users đồng thời
Dùng Webhook thay vì Polling: Nhận dữ liệu đẩy chủ động từ Strava về webhook FastAPI -> đẩy sang Celery xử lý. Không dùng vòng lặp quét (polling) tốn API Quota của Strava.

Caching Leaderboard: Bảng xếp hạng Tổng/Phòng ban được lưu trữ tạm trong Redis với thời gian hết hạn (TTL) khoảng 60 giây. Mỗi khi 500 người mở app xem thứ hạng, hệ thống lấy từ Redis ra trả về ngay lập tức thay vì query nặng xuống Supabase DB.

admin sẽ tạo phòng ban, setup cách tính điểm, có thể thay đổi cách tính điểm, cách khởi tạo thời gian cuộc thi chạy, thời gian kết thúc
- khi kết nối với strava, login lần đầu cho phép người dùng chọn phòng ban trước, có thể chọn để tham gia vào cuộc thi nào sắp xảy ra
bảng vàng:
- kết quả tính theo phòng ban
- tính theo cá nhân 
filter theo cả từng môn cá nhân, và cả kết quả chung 
chỉ dược tham gia các bộ môn thể thao được định sẵn trong cuộc thi để tính điểm, admin có thể bổ sung thêm bớt vào cuộc thi nếu nó vẫn chưa diễn ra 