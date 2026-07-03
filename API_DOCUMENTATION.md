# API Documentation

## Base URL
```
http://localhost:8081/api
```

---

## Authentication & Registration

### 1. Login
Authenticate a user with username and password.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "123456"
}
```

**Response:** `200 OK`
```json
{
  "id": "8cb4b4db-...",
  "username": "admin",
  "realName": "系统管理员",
  "role": "ADMIN",
  "studentNo": null,
  "className": null,
  "phone": null,
  "enabled": true,
  "blacklisted": false,
  "violationCount": 0
}
```

**Error Response:** `401 Unauthorized`
```
账号或密码错误
```

---

### 2. Register (Student Self-Service)
Create a new student account without admin intervention.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "username": "2024002",
  "password": "mypassword",
  "realName": "李四",
  "studentNo": "2024002",
  "className": "计算机科学与技术 1 班",
  "phone": "13800000002"
}
```

**Validation Rules:**
- `username`: Required, must be unique
- `password`: Required, minimum 6 characters
- `realName`: Required
- `studentNo`: Required
- `className`: Required
- `phone`: Required

**Response:** `201 Created`
```json
{
  "id": "99020936-...",
  "username": "2024002",
  "realName": "李四",
  "role": "STUDENT",
  "studentNo": "2024002",
  "className": "计算机科学与技术 1 班",
  "phone": "13800000002",
  "enabled": true,
  "blacklisted": false,
  "violationCount": 0
}
```

**Error Response:** `400 Bad Request`
```
用户名已存在
```

---

### 3. Change Password

**Endpoint:** `PUT /auth/change-password`

**Request Body:**
```json
{
  "userId": "8cb4b4db-...",
  "oldPassword": "123456",
  "newPassword": "newpass123"
}
```

**Validation:** newPassword minimum 6 characters

**Response:** `200 OK`
```
密码修改成功
```

---

## User Management (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | List all users |
| `POST` | `/users` | Create user (admin) — defaults password to "123456" |
| `PUT` | `/users/{id}` | Update user profile |
| `DELETE` | `/users/{id}` | Delete user |
| `PUT` | `/users/{id}/reset-password` | Reset password to "123456" |
| `PUT` | `/users/{id}/blacklist` | Toggle blacklist status |

---

## Building & Room Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/buildings` | List all buildings |
| `POST` | `/buildings` | Create building |
| `PUT` | `/buildings/{id}` | Update building |
| `DELETE` | `/buildings/{id}` | Delete building |
| `GET` | `/rooms` | List all rooms |
| `POST` | `/rooms` | Create room + generate seats |
| `PUT` | `/rooms/{id}` | Update room + sync seats |
| `DELETE` | `/rooms/{id}` | Delete room |
| `GET` | `/rooms/{id}/seats?date=&startTime=&endTime=` | Get seat map with availability |

### Seat Map Response Example

```json
{
  "room": { ... },
  "rowCount": 4,
  "columnCount": 6,
  "seats": [
    { "id": "...", "seatNo": "01-01", "rowIndex": 1, "columnIndex": 1,
      "enabled": false, "nearWindow": true, "powerSocket": false,
      "status": "DISABLED" },
    { "id": "...", "seatNo": "01-02", "rowIndex": 1, "columnIndex": 2,
      "enabled": true, "nearWindow": false, "powerSocket": false,
      "status": "AVAILABLE" },
    { "id": "...", "seatNo": "01-03", "rowIndex": 1, "columnIndex": 3,
      "enabled": true, "nearWindow": false, "powerSocket": false,
      "status": "OCCUPIED", "bookingId": "...", "studentName": "张三" }
  ],
  "occupiedCount": 1,
  "availableCount": 22
}
```

Seat status values: `AVAILABLE` (空闲), `OCCUPIED` (已占用), `DISABLED` (停用).

---

## Booking Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/bookings` | List all bookings |
| `GET` | `/bookings/user/{userId}` | List bookings for a user |
| `POST` | `/bookings` | Create booking |
| `PUT` | `/bookings/{id}/cancel` | Cancel booking |
| `DELETE` | `/bookings/{id}` | Cancel booking (alternative) |
| `PUT` | `/bookings/{id}/release` | Release seat |
| `PUT` | `/bookings/{id}/check-in` | Check in (sign in) |
| `PUT` | `/bookings/{id}/no-show` | Mark as no-show |

### Booking Status Values

| Status | Meaning |
|--------|---------|
| `ACTIVE` | 预约中 — Active reservation |
| `RELEASED` | 已释放 — Released by admin |
| `CANCELLED` | 已取消 — Cancelled |
| `NO_SHOW` | 爽约 — No-show (15 min past start without check-in) |

### Check-in Rules

- Only allowed on the booking date (today)
- Only allowed during the time window: **start time - 15 minutes** to **end time**
- Cannot check in twice
- After check-in, cancellation is rejected

### No-show (Auto-detection)

Triggered on every booking-related API call. After the booking's start time + 15 minutes, if the student hasn't checked in:
- Status changes to `NO_SHOW`
- Student's violation count increases by 1
- If violation count reaches 3, the student is blacklisted

---

## Time Slots

```
08:00-10:00  — Morning Session 1
10:00-12:00  — Morning Session 2
14:00-16:00  — Afternoon Session 1
16:00-18:00  — Afternoon Session 2
19:00-21:00  — Evening Session
```

On the current date, only time slots that haven't ended yet are shown.

---

## Data Tables (Seed Data)

### Buildings

| Campus | Building | Floors |
|--------|----------|-------|
| 思明校区 | 图书馆 | 4 floors (study rooms on 1F-4F) |
| 翔安校区 | 德旺图书馆 | 6 floors (study rooms on 2F-6F) |
| 翔安校区 | 学武楼 | 1 floor (B1 basement) |

### Rooms

| Room | Location | Seats |
|------|----------|-------|
| 图书馆一层自习室 | 思明校区 / 图书馆 / 1层 | 24 (4×6) |
| 图书馆二层自习室 | 思明校区 / 图书馆 / 2层 | 24 (4×6) |
| 图书馆三层静音区 | 思明校区 / 图书馆 / 3层 | 40 (5×8) |
| 图书馆四层自习室 | 思明校区 / 图书馆 / 4层 | 24 (4×6) |
| 德旺图书馆二层自习区 | 翔安校区 / 德旺图书馆 / 2层 | 40 (5×8) |
| 德旺图书馆三层自习区 | 翔安校区 / 德旺图书馆 / 3层 | 24 (4×6) |
| 德旺图书馆四层自习区 | 翔安校区 / 德旺图书馆 / 4层 | 24 (4×6) |
| 德旺图书馆五层自习区 | 翔安校区 / 德旺图书馆 / 5层 | 40 (5×8) |
| 德旺图书馆六层自习区 | 翔安校区 / 德旺图书馆 / 6层 | 24 (4×6) |
| 学武楼负一楼自习室 | 翔安校区 / 学武楼 / B1层 | 60 (6×10) |

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict (duplicate username, booking conflict) |
| 500 | Internal Server Error |

---

## CORS Configuration

The API has CORS enabled for all origins during development: `@CrossOrigin(origins = "*")`.

---

## Database Schema

### user_accounts Table
```sql
CREATE TABLE user_accounts (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    real_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,         -- 'ADMIN' or 'STUDENT'
    student_no VARCHAR(255),
    class_name VARCHAR(255),
    phone VARCHAR(255),
    enabled BOOLEAN NOT NULL DEFAULT true,
    blacklisted BOOLEAN NOT NULL DEFAULT false,
    violation_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL
);
```

### buildings Table
```sql
CREATE TABLE buildings (
    id UUID PRIMARY KEY,
    campus VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    floor_count INTEGER NOT NULL,
    description VARCHAR(255)
);
```

### rooms Table
```sql
CREATE TABLE rooms (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    building_id UUID,
    building_name VARCHAR(255),
    campus VARCHAR(255),
    floor_number INTEGER DEFAULT 1,
    capacity INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT true,
    row_count INTEGER DEFAULT 4,
    column_count INTEGER DEFAULT 6,
    open_time VARCHAR(255) DEFAULT '08:00',
    close_time VARCHAR(255) DEFAULT '22:00'
);
```

### seats Table
```sql
CREATE TABLE seats (
    id UUID PRIMARY KEY,
    room_id UUID NOT NULL,
    seat_no VARCHAR(255) NOT NULL,
    row_index INTEGER NOT NULL,
    column_index INTEGER NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    near_window BOOLEAN NOT NULL DEFAULT false,
    power_socket BOOLEAN NOT NULL DEFAULT false
);
```

### bookings Table
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    user_id UUID,
    username VARCHAR(255),
    room_id UUID NOT NULL,
    seat_id UUID,
    seat_no VARCHAR(255),
    booking_date VARCHAR(255) NOT NULL,
    start_time VARCHAR(255),
    end_time VARCHAR(255),
    released BOOLEAN NOT NULL DEFAULT false,
    checked_in BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(255) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP
);
```

---

**API Version:** 2.0.0  
**Last Updated:** July 3, 2026
