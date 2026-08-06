# 📚 KM Tracker Documentation Index

> **Nền tảng tích lũy & thi đua KM thể thao doanh nghiệp đồng bộ tự động với Strava**  
> **Tech Stack:** Next.js 16 (Turbopack) · Cloudflare Workers (OpenNext v1.20) · Supabase PostgreSQL 15 & Realtime  
> **Live Production:** [https://kmtracker.dev-haucx.workers.dev](https://kmtracker.dev-haucx.workers.dev)

---

## 🗂️ Danh Mục Tài Liệu Hệ Thống (Docs Sitemap)

```
docs/
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
    ├── api-specification.md               # Đặc tả API Strava OAuth, Webhook & Dynamic Host
    └── deployment-guide.md                # Hướng dẫn Deploy Cloudflare Workers + Supabase
```

---

## 🔑 Các Điểm Nổi Bật Về Kiến Trúc & Giao Diện

1. **Giao Diện Material Design 3 / Android Native Optimizations**:
   - Bottom Navigation Bar 54px với active pill indicator cho di động.
   - Thẻ hiển thị dữ liệu nén, bo góc mềm mại (`16px`), độ nổi bóng nhẹ, tối ưu 100% không gian trải nghiệm trên Android & iOS.
2. **Cơ Chế Bảo Mật Phiên HMAC-SHA256 (`tm_session`)**:
   - Xác thực phiên bằng cookie mã hóa chữ ký HMAC-SHA256, không bị phụ thuộc vào localStorage hay Auth Redirect Loop.
3. **Phòng Tránh Lỗi CORS Prefetch**:
   - Các Route Handler `/api/auth/strava` và `/api/auth/logout` tự động phát hiện `prefetch` header từ Next.js Router và trả về `HTTP 204 No Content`, ngăn chặn triệt để lỗi preflight CORS khi mở ứng dụng.
4. **Xử Lý Domain Động (`getAppUrl`)**:
   - Tự động lọc các domain nội bộ `localhost:3000` sinh ra từ proxy OpenNext Worker để đảm bảo các phản hồi Redirect luôn trả về chính xác tên miền sản xuất `https://kmtracker.dev-haucx.workers.dev`.
5. **Chống Thao Túng Thứ Hạng & Soft Delete (`is_deleted = true`)**:
   - Công thức tính điểm tự động khóa khi giải ở trạng thái `active` hoặc `ended`. Mọi thao tác gỡ VĐV hoặc giải đấu đều là Soft Delete an toàn.
