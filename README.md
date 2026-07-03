# 智能校园自习室预约管理平台

本项目是 Java 程序设计实践课程的大作业项目，面向高校自习室预约与座位管控场景，提供统一登录、角色分流、在线选座、管理员维护、预约管控和数据报表等功能。系统目前已经实现管理员端与学生端两套工作界面，网站整体为中文界面。

## 项目简介

平台用于解决校园自习室占座、空位不明确、预约管理困难等问题。学生可以按校区、楼栋、楼层和自习室筛选空闲座位，选择日期与时间段后在线预约；管理员可以维护楼栋、自习室、座位排布、学生账号、预约状态和基础统计数据。学生也可以自行注册账号。

系统采用前后端分离架构：

- 前端使用 React 构建单页应用，提供中文交互界面和图形化座位选择。
- 后端使用 Spring Boot 提供 REST API，并通过 Spring Data JPA 访问 PostgreSQL 数据库。
- 数据库使用 PostgreSQL，保存账号、楼栋、自习室、座位与预约记录。

## 当前功能

### 统一登录与角色分流

- 管理员和学生共用同一个登录入口。
- 每个账号都使用”账号 + 密码”登录。
- 登录成功后根据账号角色进入不同工作台。
- 默认初始密码为 `123456`。
- 登录后支持修改密码。
- 学生可在登录页自行注册账号（填写账号、密码、姓名、学号、班级、手机号）。

### 管理员端功能

管理员登录后进入”管理员工作台”，当前包含以下模块：

- 实时看板：查看学生账号数、管理员数、自习室数、总座位数、进行中预约、当前占用率等运行概况。
- 自习室管理：维护校区、楼栋、楼层、自习室信息，录入座位行列数并生成座位排布。
- 座位可视化：以图形方式展示座位布局，便于观察不同自习室的座位规模和排布。
- 账号管理：新增管理员或学生账号，修改账号资料，删除账号，重置密码，启用/禁用账号。
- 黑名单管理：可将爽约次数较多或违规的学生加入黑名单，也可解除黑名单。
- 预约管控：查看学生预约记录，支持取消预约、签到、释放座位、标记爽约等操作。
- 数据报表：查看指定日期的预约总量、当前预约、占用率、各自习室日均使用率和热门时段统计。

### 学生端功能

学生登录后进入”学生预约中心”，当前包含以下模块：

- 预约选座：按校区、楼栋、楼层、自习室、日期和时间段筛选座位。
- 图形化选座：以座位图方式展示空闲、已占用、已选择、停用等状态。
- 我的预约：查看个人预约记录，支持签到和取消预约。
- 账号设置：修改登录密码。
- 黑名单提示：被加入黑名单的学生账号会收到提示，并暂时不能继续预约。

### 注册账号

- 登录页提供”没有账号？去注册”入口。
- 注册需填写：账号、密码、确认密码、姓名、学号、班级、手机号。
- 注册成功后自动创建学生角色账号，并跳转回登录页。
- 学号、班级、手机号均为必填项。
- 注册接口位于 `POST /api/auth/register`。

## 校园校区结构

系统当前以厦门大学校区结构为演示数据：

| 校区 | 楼栋 | 有自习室的楼层 |
|------|------|---------------|
| 思明校区 | 图书馆 | 1F・2F・3F・4F |
| 翔安校区 | 德旺图书馆 | 2F・3F・4F・5F・6F |
| 翔安校区 | 学武楼 | B1（负一楼） |

楼层筛选会根据所选校区/楼栋动态显示实际有房间的楼层，不存在楼层的选项不会出现。

## 技术栈

### 后端

- Java 17+
- Spring Boot 3.2.5
- Spring Web
- Spring Data JPA
- PostgreSQL
- Maven

### 前端

- React 18
- 原生 fetch（无额外 HTTP 库）
- CSS
- Node.js / npm

### 数据库

- PostgreSQL
- 数据库名：`studyroom_db`
- 默认本地账号：`postgres`
- 当前本地密码：`123456`

## 项目结构

```text
study_room_booking_system
├─ study-room-booking-backend/        # Spring Boot 后端服务
│  ├─ src/main/java/
│  │  └─ rw/auca/studyroom/
│  │     ├─ config/DataLoader.java     # 初始演示数据（厦大校区结构）
│  │     ├─ controller/                # REST API 控制器
│  │     ├─ model/                     # JPA 实体
│  │     ├─ repository/                # 数据访问层
│  │     └─ service/                   # 业务逻辑
│  └─ src/main/resources/
│     └─ application.properties        # 数据库与服务端口配置
│
├─ study-room-booking-frontend/       # React 前端应用
│  ├─ src/
│  │  ├─ App.js                       # 所有组件与交互逻辑（单文件 SPA）
│  │  └─ App.css                      # 页面样式
│  ├─ public/
│  └─ package.json
│
└─ README.md
```

## 核心数据模型

当前后端主要包含以下实体：

- `UserAccount`：账号信息，包含登录名、密码、真实姓名、角色（管理员/学生）、学号、班级、手机号、启用状态、黑名单状态、爽约次数等。
- `Building`：楼栋信息，包含校区、楼栋名称、楼层数和说明。
- `Room`：自习室信息，包含所属楼栋、楼层、名称、容量、开放时间、关闭时间、座位行列数等。
- `Seat`：座位信息，包含所属自习室、座位号、行列位置、是否启用、是否靠窗、是否有插座等。
- `Booking`：预约记录，包含预约学生、自习室、座位、日期、开始时间、结束时间、状态（预约中/已释放/已取消/爽约）、签到状态等。

## 默认账号

系统启动时会通过 `DataLoader` 初始化演示账号和基础数据。

| 角色 | 账号 | 密码 | 说明 |
| --- | --- | --- | --- |
| 管理员 | `admin` | `123456` | 系统管理员账号 |
| 学生 | `2024001` | `123456` | 演示学生账号 |

管理员可以在”账号管理”中继续新增管理员账号和学生账号。新增账号的初始密码为 `123456`，后续可重置或由用户登录后修改。学生也可以在登录页自行注册。

## 本地运行

### 1. 准备环境

请先确认本机已经安装：

- JDK 17 或更高版本
- Maven
- Node.js 与 npm
- PostgreSQL

### 2. 创建数据库

在 PostgreSQL 中创建数据库：

```sql
CREATE DATABASE studyroom_db;
```

后端数据库配置位于：

```text
study-room-booking-backend/src/main/resources/application.properties
```

当前配置示例：

```properties
server.port=8081
spring.datasource.url=jdbc:postgresql://localhost:5432/studyroom_db
spring.datasource.username=postgres
spring.datasource.password=123456
spring.jpa.hibernate.ddl-auto=update
```

### 3. 启动后端

```powershell
cd study-room-booking-backend
mvn spring-boot:run
```

后端默认运行在：

```text
http://localhost:8081
```

API 基础路径为：

```text
http://localhost:8081/api
```

### 4. 启动前端

打开新的终端窗口：

```powershell
cd study-room-booking-frontend
npm install
npm start
```

前端默认运行在：

```text
http://localhost:3000
```

浏览器访问该地址后，可以使用默认管理员账号或学生账号登录，也可以自行注册新账号。

## 主要 API

### 认证与注册

- `POST /api/auth/login`：账号密码登录。
- `POST /api/auth/register`：学生自助注册（姓名、学号、班级、手机号为必填）。
- `PUT /api/auth/change-password`：修改密码。

### 账号管理

- `GET /api/users`：查询账号列表。
- `POST /api/users`：新增账号（管理员操作）。
- `PUT /api/users/{id}`：修改账号信息。
- `DELETE /api/users/{id}`：删除账号。
- `PUT /api/users/{id}/reset-password`：重置密码。
- `PUT /api/users/{id}/blacklist`：加入或解除黑名单。

### 楼栋与自习室

- `GET /api/buildings`：查询楼栋列表。
- `POST /api/buildings`：新增楼栋。
- `PUT /api/buildings/{id}`：修改楼栋。
- `DELETE /api/buildings/{id}`：删除楼栋。
- `GET /api/rooms`：查询自习室列表。
- `POST /api/rooms`：新增自习室并生成座位。
- `PUT /api/rooms/{id}`：修改自习室。
- `DELETE /api/rooms/{id}`：删除自习室。
- `GET /api/rooms/{id}/seats?date=YYYY-MM-DD&startTime=HH:MM&endTime=HH:MM`：按日期和时间段查询座位状态。

### 预约管理

- `GET /api/bookings`：查询全部预约记录。
- `GET /api/bookings/user/{userId}`：查询指定用户的预约。
- `POST /api/bookings`：创建预约。
- `DELETE /api/bookings/{id}`：取消预约（已签到不可取消）。
- `PUT /api/bookings/{id}/cancel`：取消预约。
- `PUT /api/bookings/{id}/release`：释放座位。
- `PUT /api/bookings/{id}/check-in`：预约签到（仅限预约当天时间段内，允许提前15分钟）。
- `PUT /api/bookings/{id}/no-show`：标记爽约。

### 数据报表

- `GET /api/reports/overview`：运行概况。
- `GET /api/reports/room-usage?date=YYYY-MM-DD`：各自习室使用率。
- `GET /api/reports/time-slots?date=YYYY-MM-DD`：热门时段统计。

## 主要业务规则

- 只有学生账号可以创建预约，管理员账号不能预约座位。
- 学生可以在登录页自行注册（填写姓名、学号、班级、手机号等必填信息）。
- 被禁用或加入黑名单的学生账号不能预约。
- 预约日期不能早于当前日期。
- 预约结束时间必须晚于开始时间。
- 同一学生单日最多允许 3 条有效预约。
- 同一座位在时间冲突时不能被重复预约。
- **签到规则**：仅限预约当天，在预约开始前15分钟至结束时间之间可签到。已签到不可重复签到。
- **取消限制**：已签到的预约不可取消。
- **爽约规则**：预约开始后超过15分钟未签到自动标记爽约，违规次数+1。
- 爽约次数达到3次后，账号会被自动加入黑名单。
- 取消预约、释放座位、签到和爽约会更新预约状态，不会直接删除历史记录。
- 当天已过的时间段不会显示在预约选项中，自动切换至下一个可用时段。
- 楼层筛选根据所选校区/楼栋动态显示实际有房间的楼层（如负一楼显示为”B1层”）。

## 当前完成度与后续完善方向

当前项目已经具备课程题目要求中的主要功能，包括自习室管理、学生预约、座位管控、实时看板和数据报表，并实现了管理员与学生不同界面的角色分流。

后续可以继续完善：

- 密码加密存储和更完整的登录会话机制。
- 更细粒度的管理员权限控制。
- 操作日志与审计记录。
- 更丰富的数据图表和报表导出。
- 座位布局拖拽编辑、座位属性批量设置。
- 前后端自动化测试和异常提示优化。

## 说明

本项目用于课程设计与演示环境，默认账号和默认密码便于本地调试。若部署到真实环境，请修改数据库密码、关闭演示账号或重置默认密码，并补充正式的登录鉴权与密码加密机制。
