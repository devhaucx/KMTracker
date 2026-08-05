# 📚 KM Tracker Documentation Index

> **Nền tảng tích lũy & thi đua KM thể thao doanh nghiệp đồng bộ tự động với Strava**  
> **Tech Stack:** Next.js 16 (App Router) · Cloudflare Pages + Workers · Supabase PostgreSQL 15 & Realtime

---

## 🗂️ Danh Mục Tài Liệu Hệ Thống (Docs Sitemap)

```
docs/
├── 00-learning/                           # Khái niệm & Quy chuẩn thiết kế tài liệu
│   ├── learning_roadmap_project_docs.md
│   └── software_project_documentation_guide.md
│
├── 01-business/                           # Tài liệu Nghiệp Vụ & Yêu Cầu Sản Phẩm
│   └── prd.md                             # Product Requirements Document (PRD v3.0)
│
├── 02-requirements/                       # Yêu Cầu Chức Năng & Luồng Người Dùng
│   ├── user-stories.md                    # Danh sách User Stories VĐV & Admin
│   ├── user-flows.md                      # Luồng tham gia giải & đối soát khiếu nại
│   └── user-personas.md                   # Chân dung VĐV & Ban tổ chức Admin
│
├── 03-architecture/                       # Kiến Trúc Hệ Thống & Cơ Sở Dữ Liệu
│   ├── erd.md                             # Sơ đồ ERD & Script SQL Migration PostgreSQL
│   ├── module-view.md                     # Sitemap 19 Routes & Động Cơ Quy Đổi Điểm
│   ├── cc-view.md                         # Component & Connector View (Cloudflare + Supabase)
│   └── allocation-view.md                 # Hạ tầng phân bổ Edge Infrastructure
│
└── 04-development/                        # Hướng Dẫn Phát Triển & Triển Khai
    ├── api-specification.md               # Đặc tả API Strava OAuth, Webhook & Resync
    └── deployment-guide.md                # Hướng dẫn Deploy Cloudflare Pages + Supabase
```

---

## 🔑 Các Điểm Nổi Bật Về Kiến Trúc & Bảo Mật

1. **Chống Thao Túng Thứ Hạng (Immutability Lock)**: Công thức tính điểm và dải pace tự động khóa khi giải ở trạng thái `active` hoặc `ended`.
2. **Bảo Vệ Dữ Liệu Bằng Soft Delete (`is_deleted = true`)**: Xóa giải đấu hoặc tạm gỡ tài khoản không làm mất dữ liệu thô trong DB.
3. **Đối Soát Strava Athlete ID & Khôi Phục VĐV**: Bấm soi trực tiếp hồ sơ Strava công khai (`strava.com/athletes/{id}`), hỗ trợ gỡ tài khoản ảo và `[↺ Khôi phục & Đồng bộ]` trả lại điểm khi khiếu nại đúng.
4. **Ngữ Cảnh 1 Cuộc Thi Active & Quy Đổi Điểm 2 Chiều**: Động cơ quy đổi tự động tính lại điểm chính xác theo mốc thời gian (`start_date` → `end_date`) và thể lệ riêng của giải đấu được chọn, khôi phục nguyên vẹn 100% khi chuyển lại giải cũ.
5. **Xuất Báo Cáo UTF-8 BOM CSV**: Tương thích hoàn hảo với Microsoft Excel mà không bị lỗi phông chữ tiếng Việt.
