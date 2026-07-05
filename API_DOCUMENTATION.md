# API 文档

## 基础路径

```
http://localhost:8081/api
```

---

## 认证与注册

### 1. 登录

支持使用**昵称（username）**登录；**学号（studentNo）**由前端自动查询用户名后登录。

**端点：** `POST /auth/login`

**请求体（昵称登录）：**
```json
{
  "username": "admin",
  "password": "123456"
}
```

**请求体（学号登录 — 前端自动转换，后端仅接受 username）：**
```json
{
  "username": "2024001",
  "password": "123456"
}
```

**响应：** `200 OK`
```json
{
  "id": "8cb4b4db-...",
  "username": "admin",
  "realName": "系统管理员",
  "role": "ADMIN",
  "studentNo": null,
  "className": null,
  "phone": null,
  "email": null,
  "enabled": true,
  "blacklisted": false,
  "violationCount": 0
}
```

**错误响应：** `401 Unauthorized`
```
账号或密码错误
```

---

### 2. 注册（学生自助）

**端点：** `POST /auth/register`

**请求体：**
```json
{
  "username": "2024002",
  "password": "mypassword",
  "realName": "李四",
  "studentNo": "2024002",
  "className": "计算机科学与技术 1 班",
  "phone": "13800000002",
  "email": "lisi@school.edu"
}
```

**验证规则：**
| 字段 | 必填 | 说明 |
|------|------|------|
| `username` | ✅ | 昵称，唯一 |
| `password` | ✅ | 至少 6 位 |
| `realName` | ✅ | 真实姓名 |
| `studentNo` | ✅ | 学号 |
| `className` | ❌ | 班级，选填 |
| `phone` | ❌ | 手机号，选填 |
| `email` | ❌ | 邮箱，选填 |

**响应：** `201 Created`
```json
{
  "id": "99020936-...",
  "username": "2024002",
  "realName": "李四",
  "role": "STUDENT",
  "studentNo": "2024002",
  "className": "计算机科学与技术 1 班",
  "phone": "13800000002",
  "email": "lisi@school.edu",
  "enabled": true,
  "blacklisted": false,
  "violationCount": 0
}
```

---

### 3. 修改密码

**端点：** `PUT /auth/change-password`

**请求体：**
```json
{
  "userId": "8cb4b4db-...",
  "oldPassword": "123456",
  "newPassword": "newpass123"
}
```

**验证：** 新密码至少 6 位

**响应：** `200 OK`
```
密码修改成功
```

---

## 账号管理（管理员）

| 方法 | 端点 | 说明 |
|------|------|------|
| `GET` | `/users` | 查询账号列表 |
| `POST` | `/users` | 新增账号（初始密码 123456） |
| `PUT` | `/users/{id}` | 修改账号信息 |
| `PUT` | `/users/{id}/profile` | 修改个人资料（昵称、邮箱、手机号、班级） |
| `DELETE` | `/users/{id}` | 删除账号 |
| `PUT` | `/users/{id}/reset-password` | 重置密码为 123456 |
| `PUT` | `/users/{id}/blacklist` | 切换黑名单状态 |

---

## 楼栋与自习室

| 方法 | 端点 | 说明 |
|------|------|------|
| `GET` | `/buildings` | 查询楼栋列表 |
| `POST` | `/buildings` | 新增楼栋 |
| `PUT` | `/buildings/{id}` | 修改楼栋 |
| `DELETE` | `/buildings/{id}` | 删除楼栋 |
| `GET` | `/rooms` | 查询自习室列表 |
| `POST` | `/rooms` | 新增自习室并生成座位 |
| `PUT` | `/rooms/{id}` | 修改自习室并同步座位 |
| `DELETE` | `/rooms/{id}` | 删除自习室 |
| `GET` | `/rooms/{id}/seats?date=&startTime=&endTime=` | 按日期和时间段查询座位状态 |
| `GET` | `/rooms/{id}/all-seats` | 获取自习室全部座位（用于编辑弹窗）。**注意：** 该接口可能不存在（404），前端已实现备选方案，按行列数自动生成本地座位。 |
| `PUT` | `/rooms/{roomId}/seats/{seatId}` | 更新单个座位属性（如启用/停用）。**注意：** API 不可用时静默忽略。 |

### 座位状态查询响应示例

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

座位状态值：`AVAILABLE`（空闲）、`OCCUPIED`（已占用）、`DISABLED`（停用）

---

## 预约管理

| 方法 | 端点 | 说明 |
|------|------|------|
| `GET` | `/bookings` | 查询全部预约记录 |
| `GET` | `/bookings/user/{userId}` | 查询指定用户的预约 |
| `POST` | `/bookings` | 创建预约 |
| `PUT` | `/bookings/{id}/cancel` | 取消预约（已签到不可取消） |
| `DELETE` | `/bookings/{id}` | 取消预约（同上一行） |
| `PUT` | `/bookings/{id}/release` | 释放座位 |
| `PUT` | `/bookings/{id}/check-in` | 签到（开始后 30 分钟内） |
| `PUT` | `/bookings/{id}/check-out` | 签退（已签到后可随时释放座位） |
| `PUT` | `/bookings/{id}/no-show` | 标记违规 |

### 预约状态

| 状态 | 含义 |
|------|------|
| `ACTIVE` | 预约中 |
| `RELEASED` | 已释放（签到后退座或管理员释放） |
| `CANCELLED` | 已取消 |
| `NO_SHOW` | 违规（未签到或未签退） |

### 签到规则

- 仅限预约当天
- 签到窗口：**预约开始时间 → 开始后 30 分钟**
- 不可重复签到
- 签到后无法取消预约（但可签退）

### 签退规则

- 仅限已签到的预约
- 签退后座位释放，状态变为 `RELEASED`
- 无时间限制，签到后随时可签退

### 违规类型

系统自动检测两类违规：

| 类型 | 条件 | 判断依据 |
|------|------|---------|
| Type 1 — 未签到 | 超过开始时间 30 分钟仍未签到 | `checkedIn = false` |
| Type 2 — 未签退 | 已签到但超过结束时间 30 分钟仍未签退 | `checkedIn = true` |

违规达到 3 次后账号自动加入黑名单。

---

## 数据报表

| 方法 | 端点 | 说明 |
|------|------|------|
| `GET` | `/reports/overview` | 运行概况（学生数、自习室数、座位数、进行中预约等） |
| `GET` | `/reports/room-usage?date=YYYY-MM-DD` | 各自习室当日使用率（不含已取消预约） |
| `GET` | `/reports/time-slots?date=YYYY-MM-DD` | 各小时预约数分布（08:00~22:00） |
| `GET` | `/reports/no-show-stats` | 违规分类统计（未签到/未签退数量）。**注意：** 该接口可能返回 404，前端已实现备选方案，从全部预约中自动计算 NO_SHOW 数据。 |

### 数据报表前端计算补充

当后端 API 返回空数据或不可用时，前端会自动从已加载的预约数据中重新计算：

- **预约时段分布**：遍历所有非 CANCELLED 预约，按开始时间归入 2 小时时段统计
- **各自习室使用率**：按时长加权计算（占用座位小时 ÷ 总可用座位小时 × 100%）
- **违规统计**：统计 STATUS = 'NO_SHOW' 的预约记录

---

## 默认账号

| 角色 | 昵称 | 密码 | 说明 |
|------|------|------|------|
| 管理员 | `admin` | `123456` | 系统管理员 |
| 学生 | `2024001` | `123456` | 演示学生（学号同昵称） |

---

## 数据表结构

### user_accounts

```sql
CREATE TABLE user_accounts (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    real_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,          -- 'ADMIN' or 'STUDENT'
    student_no VARCHAR(255),
    class_name VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255),
    enabled BOOLEAN NOT NULL DEFAULT true,
    blacklisted BOOLEAN NOT NULL DEFAULT false,
    violation_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL
);
```

### buildings

```sql
CREATE TABLE buildings (
    id UUID PRIMARY KEY,
    campus VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    floor_count INTEGER NOT NULL,
    description VARCHAR(255)
);
```

### rooms

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

### seats

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

### bookings

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

## HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request（参数错误） |
| 401 | Unauthorized（登录失败） |
| 404 | Not Found |
| 409 | Conflict（重复用户名、预约冲突） |
| 500 | Internal Server Error |

---

## CORS

开发阶段所有控制器均已启用全局 CORS：`@CrossOrigin(origins = "*")`

---

**API 版本：** 2.2.0
**最后更新：** 2026-07-05
