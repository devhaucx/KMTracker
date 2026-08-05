# 🏗️ Component & Connector View (C&C View) — Strava Ranking

> **Tài liệu Mô Tả Thành Phần & Kết Nối Runtime**: Cấu trúc các thành phần thực thi và luồng dữ liệu thời gian thực (Realtime & Webhooks).

---

## 1. Runtime Components & Connectors

### Các Thành Phần Thực Thi (Components):
1. **Next.js 16 Web App (Cloudflare Pages)**: Trình duyệt web (Client-side) và Edge Server cho Server-Side Rendering (0ms cold start).
2. **Cloudflare Webhook Worker**: API Worker tiếp nhận Webhook từ Strava API v3, phản hồi `200 OK` tức thì (<50ms).
3. **Cloudflare Queues**: Xử lý hàng đợi sự kiện bài tập không đồng bộ.
4. **Supabase PostgreSQL 15**: Cơ sở dữ liệu quan hệ, lưu thông tin VĐV, phòng ban, giải đấu và bài tập.
5. **Supabase Edge Functions**: Thực thi Động cơ quy đổi điểm (`scoring.ts`), đối soát dải pace/speed và làm mới Strava OAuth token batch.
6. **Supabase Realtime (WebSockets)**: Đẩy trực tiếp thông báo điểm số mới lên Bảng Xếp Hạng của Client.
7. **Strava API v3**: Dịch vụ Strava quản lý bài tập và kết nối VĐV.

### Các Chuẩn Kết Nối (Connectors):
- **HTTPS / REST API**: Chuẩn giao tiếp giữa Client và Cloudflare Pages, giữa CF Worker và Strava API.
- **WebSocket (WSS)**: Đẩy dữ liệu Bảng xếp hạng real-time từ Supabase sang Next.js App.
- **Database Connection (TCP)**: Giao tiếp bảo mật từ Edge Functions tới PostgreSQL.

---

## 2. Sơ Đồ Thành Phần Hệ Thống (System Runtime Overview)

```mermaid
graph TD
    Client((🏃 VĐV & Ban Tổ Chức Browser))
    
    subgraph "Edge Layer (Cloudflare Infrastructure)"
        CFP[🌐 Cloudflare Pages Next.js 16]
        CFW[⚡ Webhook Worker Ack <50ms]
        CFQ[📥 Cloudflare Queues]
    end

    subgraph "Backend Layer (Supabase Free Tier)"
        DB[(🗄️ PostgreSQL 15 DB)]
        RT[⚡ Supabase Realtime WSS]
        EF[⚡ Edge Functions process-activity]
        Auth[🔒 Supabase Auth & OAuth]
    end

    subgraph "External Platform"
        Strava[🏃 Strava API v3]
    end

    Client -->|HTTPS| CFP
    Client -->|WSS| RT
    CFP -->|Session / Auth| Auth
    CFP -->|Queries| DB

    Strava -->|Webhook POST| CFW
    CFW -->|Enqueue| CFQ
    CFQ -->|Consume Event| EF
    EF -->|Fetch Activity| Strava
    EF -->|Calculate Score & Write| DB
    DB -->|Trigger Realtime| RT
```

---

## 3. Sequence Diagrams (Các Luồng Xử Lý Chính)

### 3.1. Luồng Tiếp Nhận & Quy Đổi Điểm Webhook Async

```mermaid
sequenceDiagram
    participant Strava as Strava API v3
    participant CFW as CF Webhook Worker
    participant CFQ as CF Queue
    participant EF as Supabase Edge Function
    participant DB as PostgreSQL 15
    participant RT as Supabase Realtime
    participant App as Next.js Client

    Strava->>CFW: POST /api/webhook/strava (activity.create)
    CFW-->>Strava: 200 OK (Response < 50ms)
    CFW->>CFQ: Enqueue activity event payload
    
    CFQ->>EF: Trigger batch consume event
    EF->>Strava: GET /api/v3/activities/{id} (Bearer Token)
    Strava-->>EF: Detailed Activity Payload (distance, moving_time, pace)
    EF->>EF: Calculate score via scoring.ts (pace & date check)
    EF->>DB: INSERT INTO activities (is_valid, converted_km)
    DB-->>RT: PostgreSQL Change Notification
    RT-->>App: Push updated leaderboard rank over WSS
```

### 3.2. Luồng Chuyển Ngữ Cảnh Cuộc Thi & Khôi Phục Điểm 2 Chiều

```mermaid
sequenceDiagram
    actor VĐV
    participant App as Next.js Dashboard
    participant Scoring as scoring.ts Engine
    participant DB as PostgreSQL 15

    VĐV->>App: Chọn Giải Mùa Hè từ Dropdown Chuyển Giải
    App->>DB: Query tất cả bài tập thô Strava gốc của VĐV
    DB-->>App: Raw Activities Array (distance_actual, start_date)
    App->>Scoring: Quét lại theo mốc thời gian start_date -> end_date & dải pace của Giải Mùa Hè
    Scoring-->>App: Converted KM mới & Cập nhật cờ is_valid
    App-->>VĐV: Hiển thị Bảng điểm & Thứ hạng mới của Giải Mùa Hè
    
    VĐV->>App: Bấm chuyển ngược lại Giải Mùa Thu cũ
    App->>Scoring: Quét lại theo mốc thời gian & quy tắc của Giải Mùa Thu
    Scoring-->>App: Khôi phục 100% điểm số ban đầu
    App-->>VĐV: Thứ hạng ban đầu được khôi phục nguyên vẹn
```
