import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8081/api'
  : '/api';

const timeSlots = [
  ['08:00', '10:00'],
  ['10:00', '12:00'],
  ['14:00', '16:00'],
  ['16:00', '18:00'],
  ['19:00', '21:00']
];

const statusText = {
  ACTIVE: '预约中',
  RELEASED: '已释放',
  CANCELLED: '已取消',
  NO_SHOW: '爽约'
};

const roleText = {
  ADMIN: '管理员',
  STUDENT: '学生'
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function canCheckIn(booking) {
  if (booking.bookingDate !== today()) return false;
  if (!booking.startTime || !booking.endTime) return false;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = booking.startTime.split(':').map(Number);
  const [eh, em] = booking.endTime.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  // 允许预约开始前15分钟签到，直到时段结束
  return nowMin >= (startMin - 15) && nowMin < endMin;
}

function floorLabel(floor) {
  if (floor < 0) return 'B' + Math.abs(floor) + '层';
  return floor + '层';
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || '请求失败');
  }
  if (response.status === 204) {
    return null;
  }
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.text();
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('studyroom_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (loginUser) => {
    localStorage.setItem('studyroom_user', JSON.stringify(loginUser));
    setUser(loginUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('studyroom_user');
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return user.role === 'ADMIN'
    ? <AdminDashboard user={user} onLogout={handleLogout} />
    : <StudentDashboard user={user} onLogout={handleLogout} onUserUpdate={handleLogin} />;
}

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: 'admin', password: '123456' });
  const [regForm, setRegForm] = useState({ username: '', password: '', confirmPassword: '', realName: '', studentNo: '', className: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const loginUser = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      onLogin(loginUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (regForm.password !== regForm.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (regForm.password.length < 6) {
      setError('密码至少需要 6 位');
      return;
    }
    setLoading(true);
    try {
      await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: regForm.username,
          password: regForm.password,
          realName: regForm.realName,
          studentNo: regForm.studentNo,
          className: regForm.className,
          phone: regForm.phone
        })
      });
      setSuccess('注册成功！请使用新账号登录。');
      setRegForm({ username: '', password: '', confirmPassword: '', realName: '', studentNo: '', className: '', phone: '' });
      setMode('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setSuccess('');
  };

  if (mode === 'register') {
    return (
      <main className="login-page">
        <section className="login-panel register-panel">
          <div>
            <p className="eyebrow">Java 程序设计实践大作业</p>
            <h1>智能校园自习室预约管理平台</h1>
            <p className="login-copy">注册学生账号，注册完成后使用账号密码登录系统进行预约选座。</p>
          </div>
          <form className="login-form" onSubmit={handleRegister}>
            <label>
              账号<span className="required">*</span>
              <input value={regForm.username} onChange={(e) => setRegForm({ ...regForm, username: e.target.value })} required />
            </label>
            <label>
              密码<span className="required">*</span>
              <input type="password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} required placeholder="至少 6 位" />
            </label>
            <label>
              确认密码<span className="required">*</span>
              <input type="password" value={regForm.confirmPassword} onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })} required />
            </label>
            <label>
              姓名<span className="required">*</span>
              <input value={regForm.realName} onChange={(e) => setRegForm({ ...regForm, realName: e.target.value })} required />
            </label>
            <label>
              学号<span className="required">*</span>
              <input value={regForm.studentNo} onChange={(e) => setRegForm({ ...regForm, studentNo: e.target.value })} required />
            </label>
            <label>
              班级<span className="required">*</span>
              <input value={regForm.className} onChange={(e) => setRegForm({ ...regForm, className: e.target.value })} required />
            </label>
            <label>
              手机号<span className="required">*</span>
              <input value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} required />
            </label>
            {error && <div className="message error">{error}</div>}
            {success && <div className="message">{success}</div>}
            <button className="primary-btn" type="submit" disabled={loading}>{loading ? '注册中...' : '注册'}</button>
            <button type="button" className="ghost-btn switch-btn" onClick={switchMode}>已有账号？去登录</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div>
          <p className="eyebrow">Java 程序设计实践大作业</p>
          <h1>智能校园自习室预约管理平台</h1>
          <p className="login-copy">统一登录入口，管理员和学生使用账号密码登录，进入各自的工作界面。</p>
        </div>
        <form className="login-form" onSubmit={submit}>
          <label>
            账号
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </label>
          <label>
            密码
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          {error && <div className="message error">{error}</div>}
          <button className="primary-btn" type="submit" disabled={loading}>{loading ? '登录中...' : '登录'}</button>
          <button type="button" className="ghost-btn switch-btn" onClick={switchMode}>没有账号？去注册</button>
        </form>
      </section>
    </main>
  );
}

function Shell({ user, onLogout, tabs, activeTab, setActiveTab, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">自</span>
          <div>
            <strong>自习室预约平台</strong>
            <small>智能选座与座位管控</small>
          </div>
        </div>
        <nav>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="user-card">
          <span>{roleText[user.role]}</span>
          <strong>{user.realName}</strong>
          <small>{user.username}</small>
          <button type="button" onClick={onLogout}>退出登录</button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [overview, setOverview] = useState({});
  const [usage, setUsage] = useState([]);
  const [timeStats, setTimeStats] = useState([]);
  const [reportDate, setReportDate] = useState(today());
  const [message, setMessage] = useState('');

  const loadAdminData = useCallback(async (date = reportDate) => {
    const [nextUsers, nextBuildings, nextRooms, nextBookings, nextOverview, nextUsage, nextTimeStats] = await Promise.all([
      api('/users'),
      api('/buildings'),
      api('/rooms'),
      api('/bookings'),
      api('/reports/overview'),
      api(`/reports/room-usage?date=${date}`),
      api(`/reports/time-slots?date=${date}`)
    ]);
    setUsers(nextUsers);
    setBuildings(nextBuildings);
    setRooms(nextRooms);
    setBookings(nextBookings);
    setOverview(nextOverview);
    setUsage(nextUsage);
    setTimeStats(nextTimeStats);
  }, [reportDate]);

  useEffect(() => {
    loadAdminData().catch((err) => setMessage(err.message));
  }, [loadAdminData]);

  const tabs = [
    { key: 'overview', label: '实时看板', icon: '▦' },
    { key: 'rooms', label: '自习室管理', icon: '□' },
    { key: 'users', label: '账号管理', icon: '人' },
    { key: 'bookings', label: '预约管控', icon: '时' },
    { key: 'reports', label: '数据报表', icon: '图' }
  ];

  return (
    <Shell user={user} onLogout={onLogout} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}>
      <Header title="管理员工作台" subtitle="维护楼栋、楼层、自习室座位排布，管理学生账号与预约状态。" />
      {message && <div className="message">{message}</div>}
      {activeTab === 'overview' && (
        <OverviewPanel overview={overview} usage={usage} timeStats={timeStats} onRefresh={() => loadAdminData()} />
      )}
      {activeTab === 'rooms' && (
        <RoomManager buildings={buildings} rooms={rooms} onChanged={() => loadAdminData()} setMessage={setMessage} />
      )}
      {activeTab === 'users' && (
        <UserManager users={users} onChanged={() => loadAdminData()} setMessage={setMessage} />
      )}
      {activeTab === 'bookings' && (
        <AdminBookingPanel bookings={bookings} rooms={rooms} onChanged={() => loadAdminData()} setMessage={setMessage} />
      )}
      {activeTab === 'reports' && (
        <ReportsPanel
          reportDate={reportDate}
          setReportDate={setReportDate}
          overview={overview}
          usage={usage}
          timeStats={timeStats}
          onLoad={() => loadAdminData(reportDate)}
        />
      )}
    </Shell>
  );
}

function Header({ title, subtitle }) {
  return (
    <header className="page-header">
      <p className="eyebrow">智能校园自习室预约管理平台</p>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}

function OverviewPanel({ overview, usage, timeStats, onRefresh }) {
  return (
    <div className="stack">
      <div className="toolbar">
        <h2>运行概况</h2>
        <button type="button" className="ghost-btn" onClick={onRefresh}>刷新数据</button>
      </div>
      <div className="metric-grid">
        <Metric label="学生账号" value={overview.studentCount || 0} />
        <Metric label="管理员" value={overview.adminCount || 0} />
        <Metric label="自习室" value={overview.roomCount || 0} />
        <Metric label="总座位" value={overview.seatCount || 0} />
        <Metric label="进行中预约" value={overview.activeBookings || 0} />
        <Metric label="当前占用率" value={`${overview.occupancyRate || 0}%`} />
      </div>
      <div className="two-column">
        <HeatPanel title="自习室座位热力图" items={usage} />
        <BarPanel title="热门时段统计" items={timeStats} labelKey="label" valueKey="count" />
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HeatPanel({ title, items }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      <div className="heat-list">
        {items.map((item) => (
          <div className="heat-row" key={item.roomId}>
            <div>
              <strong>{item.roomName}</strong>
              <span>{item.buildingName || '未分配楼栋'} · {item.floorNumber || 1}层</span>
            </div>
            <div className="heat-track">
              <span style={{ width: `${Math.min(100, item.usageRate || 0)}%` }} />
            </div>
            <b>{item.usageRate || 0}%</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function BarPanel({ title, items, labelKey, valueKey }) {
  const max = Math.max(1, ...items.map((item) => item[valueKey] || 0));
  return (
    <section className="panel">
      <h3>{title}</h3>
      <div className="bar-list">
        {items.map((item) => (
          <div className="bar-row" key={item[labelKey]}>
            <span>{item[labelKey]}</span>
            <div><i style={{ width: `${((item[valueKey] || 0) / max) * 100}%` }} /></div>
            <b>{item[valueKey] || 0}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function RoomManager({ buildings, rooms, onChanged, setMessage }) {
  const [buildingForm, setBuildingForm] = useState({ campus: '主校区', name: '', floorCount: 5, description: '' });
  const [roomForm, setRoomForm] = useState({
    buildingId: '',
    name: '',
    floorNumber: 1,
    rowCount: 4,
    columnCount: 6,
    openTime: '08:00',
    closeTime: '22:00',
    available: true
  });
  const [editingRoom, setEditingRoom] = useState(null);

  const saveBuilding = async (event) => {
    event.preventDefault();
    try {
      await api('/buildings', { method: 'POST', body: JSON.stringify({ ...buildingForm, floorCount: Number(buildingForm.floorCount) }) });
      setBuildingForm({ campus: '主校区', name: '', floorCount: 5, description: '' });
      setMessage('楼栋已保存');
      onChanged();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const saveRoom = async (event) => {
    event.preventDefault();
    const payload = {
      ...roomForm,
      floorNumber: Number(roomForm.floorNumber),
      rowCount: Number(roomForm.rowCount),
      columnCount: Number(roomForm.columnCount),
      capacity: Number(roomForm.rowCount) * Number(roomForm.columnCount)
    };
    try {
      if (editingRoom) {
        await api(`/rooms/${editingRoom.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/rooms', { method: 'POST', body: JSON.stringify(payload) });
      }
      setRoomForm({ buildingId: '', name: '', floorNumber: 1, rowCount: 4, columnCount: 6, openTime: '08:00', closeTime: '22:00', available: true });
      setEditingRoom(null);
      setMessage('自习室信息已保存');
      onChanged();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const editRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      buildingId: room.buildingId || '',
      name: room.name || '',
      floorNumber: room.floorNumber || 1,
      rowCount: room.rowCount || 4,
      columnCount: room.columnCount || 6,
      openTime: room.openTime || '08:00',
      closeTime: room.closeTime || '22:00',
      available: Boolean(room.available)
    });
  };

  const deleteRoom = async (id) => {
    if (!window.confirm('确认删除这个自习室吗？')) return;
    await api(`/rooms/${id}`, { method: 'DELETE' });
    setMessage('自习室已删除');
    onChanged();
  };

  return (
    <div className="stack">
      <div className="two-column">
        <section className="panel">
          <h3>楼栋录入</h3>
          <form className="form-grid" onSubmit={saveBuilding}>
            <label>校区<input value={buildingForm.campus} onChange={(e) => setBuildingForm({ ...buildingForm, campus: e.target.value })} /></label>
            <label>楼栋名称<input value={buildingForm.name} onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })} required /></label>
            <label>楼层数<input type="number" min="1" value={buildingForm.floorCount} onChange={(e) => setBuildingForm({ ...buildingForm, floorCount: e.target.value })} /></label>
            <label>说明<input value={buildingForm.description} onChange={(e) => setBuildingForm({ ...buildingForm, description: e.target.value })} /></label>
            <button className="primary-btn" type="submit">新增楼栋</button>
          </form>
          <div className="chip-list">
            {buildings.map((building) => (
              <span key={building.id}>{building.campus} · {building.name} · {building.floorCount}层</span>
            ))}
          </div>
        </section>
        <section className="panel">
          <h3>{editingRoom ? '修改自习室' : '新增自习室与座位排布'}</h3>
          <form className="form-grid" onSubmit={saveRoom}>
            <label>所属楼栋
              <select value={roomForm.buildingId} onChange={(e) => setRoomForm({ ...roomForm, buildingId: e.target.value })} required>
                <option value="">请选择</option>
                {buildings.map((building) => <option key={building.id} value={building.id}>{building.campus} · {building.name}</option>)}
              </select>
            </label>
            <label>自习室名称<input value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} required /></label>
            <label>楼层<input type="number" value={roomForm.floorNumber} onChange={(e) => setRoomForm({ ...roomForm, floorNumber: e.target.value })} /></label>
            <label>座位行数<input type="number" min="1" value={roomForm.rowCount} onChange={(e) => setRoomForm({ ...roomForm, rowCount: e.target.value })} /></label>
            <label>座位列数<input type="number" min="1" value={roomForm.columnCount} onChange={(e) => setRoomForm({ ...roomForm, columnCount: e.target.value })} /></label>
            <label>开放时间<input type="time" value={roomForm.openTime} onChange={(e) => setRoomForm({ ...roomForm, openTime: e.target.value })} /></label>
            <label>关闭时间<input type="time" value={roomForm.closeTime} onChange={(e) => setRoomForm({ ...roomForm, closeTime: e.target.value })} /></label>
            <label className="check-line"><input type="checkbox" checked={roomForm.available} onChange={(e) => setRoomForm({ ...roomForm, available: e.target.checked })} />开放预约</label>
            <button className="primary-btn" type="submit">{editingRoom ? '保存修改' : '生成座位'}</button>
          </form>
        </section>
      </div>
      <section className="room-grid">
        {rooms.map((room) => (
          <article className="room-card" key={room.id}>
            <div>
              <strong>{room.name}</strong>
              <span>{room.campus || '校区未设置'} · {room.buildingName || '楼栋未设置'} · {floorLabel(room.floorNumber)}</span>
            </div>
            <MiniSeatGrid rows={room.rowCount || 4} columns={room.columnCount || 6} />
            <p>{room.capacity} 个座位 · {room.openTime || '08:00'}-{room.closeTime || '22:00'} · {room.available ? '开放' : '停用'}</p>
            <div className="row-actions">
              <button type="button" onClick={() => editRoom(room)}>修改</button>
              <button type="button" className="danger" onClick={() => deleteRoom(room.id)}>删除</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function MiniSeatGrid({ rows, columns }) {
  const cells = Array.from({ length: Math.max(1, rows * columns) });
  return (
    <div className="mini-seat-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {cells.map((_, index) => <span key={index} />)}
    </div>
  );
}

function UserManager({ users, onChanged, setMessage }) {
  const emptyForm = { username: '', realName: '', role: 'STUDENT', studentNo: '', className: '', phone: '', enabled: true, blacklisted: false };
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  const saveUser = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await api(`/users/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/users', { method: 'POST', body: JSON.stringify({ ...form, password: '123456' }) });
      }
      setForm(emptyForm);
      setEditing(null);
      setMessage('账号已保存，初始密码为 123456');
      onChanged();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const editUser = (target) => {
    setEditing(target);
    setForm({ ...emptyForm, ...target });
  };

  const resetPassword = async (id) => {
    await api(`/users/${id}/reset-password`, { method: 'PUT' });
    setMessage('密码已重置为 123456');
    onChanged();
  };

  const deleteUser = async (id) => {
    if (!window.confirm('确认删除该账号吗？')) return;
    await api(`/users/${id}`, { method: 'DELETE' });
    setMessage('账号已删除');
    onChanged();
  };

  const toggleBlacklist = async (target) => {
    await api(`/users/${target.id}/blacklist`, {
      method: 'PUT',
      body: JSON.stringify({ blacklisted: !target.blacklisted })
    });
    setMessage(target.blacklisted ? '已解除黑名单' : '已加入黑名单');
    onChanged();
  };

  return (
    <div className="stack">
      <section className="panel">
        <h3>{editing ? '修改账号' : '新增账号'}</h3>
        <form className="form-grid wide" onSubmit={saveUser}>
          <label>登录账号<input value={form.username} disabled={Boolean(editing)} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>
          <label>姓名<input value={form.realName} onChange={(e) => setForm({ ...form, realName: e.target.value })} required /></label>
          <label>角色
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="STUDENT">学生</option>
              <option value="ADMIN">管理员</option>
            </select>
          </label>
          <label>学号<input value={form.studentNo || ''} onChange={(e) => setForm({ ...form, studentNo: e.target.value })} /></label>
          <label>班级<input value={form.className || ''} onChange={(e) => setForm({ ...form, className: e.target.value })} /></label>
          <label>手机号<input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="check-line"><input type="checkbox" checked={Boolean(form.enabled)} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />账号启用</label>
          <button className="primary-btn" type="submit">{editing ? '保存账号' : '新增账号'}</button>
          {editing && <button type="button" className="ghost-btn" onClick={() => { setEditing(null); setForm(emptyForm); }}>取消修改</button>}
        </form>
      </section>
      <section className="panel">
        <h3>账号列表</h3>
        <DataTable headers={['账号', '姓名', '角色', '班级/学号', '状态', '操作']}>
          {users.map((target) => (
            <tr key={target.id}>
              <td>{target.username}</td>
              <td>{target.realName}</td>
              <td>{roleText[target.role]}</td>
              <td>{target.className || '-'} {target.studentNo || ''}</td>
              <td>{target.blacklisted ? '黑名单' : target.enabled ? '正常' : '停用'} · 爽约 {target.violationCount || 0} 次</td>
              <td className="table-actions">
                <button type="button" onClick={() => editUser(target)}>修改</button>
                <button type="button" onClick={() => resetPassword(target.id)}>重置密码</button>
                <button type="button" onClick={() => toggleBlacklist(target)}>{target.blacklisted ? '解除黑名单' : '加入黑名单'}</button>
                <button type="button" className="danger" onClick={() => deleteUser(target.id)}>删除</button>
              </td>
            </tr>
          ))}
        </DataTable>
      </section>
    </div>
  );
}

function AdminBookingPanel({ bookings, rooms, onChanged, setMessage }) {
  const roomMap = useMemo(() => Object.fromEntries(rooms.map((room) => [room.id, room.name])), [rooms]);

  const operate = async (id, action, successMessage) => {
    try {
      await api(`/bookings/${id}/${action}`, { method: 'PUT' });
      setMessage(successMessage);
      onChanged();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="panel">
      <h3>预约管控</h3>
      <DataTable headers={['学生', '自习室', '座位', '日期', '时间', '状态', '操作']}>
        {bookings.map((booking) => (
          <tr key={booking.id}>
            <td>{booking.studentName}<small>{booking.studentId}</small></td>
            <td>{roomMap[booking.roomId] || '未知自习室'}</td>
            <td>{booking.seatNo || '-'}</td>
            <td>{booking.bookingDate}</td>
            <td>{booking.startTime || '-'}-{booking.endTime || '-'}</td>
            <td>{statusText[booking.status] || booking.status}{booking.checkedIn ? ' · 已签到' : ''}</td>
            <td className="table-actions">
              {booking.status === 'ACTIVE' && (
                <>
                  {canCheckIn(booking) && !booking.checkedIn && (
                    <button type="button" onClick={() => operate(booking.id, 'check-in', '已签到')}>签到</button>
                  )}
                  <button type="button" onClick={() => operate(booking.id, 'release', '座位已释放')}>释放</button>
                  <button type="button" onClick={() => operate(booking.id, 'no-show', '已登记爽约')}>爽约</button>
                  <button type="button" className="danger" onClick={() => operate(booking.id, 'cancel', '预约已取消')}>取消</button>
                </>
              )}
              {booking.status !== 'ACTIVE' && <span className="muted">—</span>}
            </td>
          </tr>
        ))}
      </DataTable>
    </section>
  );
}

function ReportsPanel({ reportDate, setReportDate, overview, usage, timeStats, onLoad }) {
  return (
    <div className="stack">
      <div className="toolbar">
        <h2>数据报表</h2>
        <label className="inline-field">统计日期<input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} /></label>
        <button className="primary-btn" type="button" onClick={onLoad}>查询</button>
      </div>
      <div className="metric-grid">
        <Metric label="累计预约" value={overview.totalBookings || 0} />
        <Metric label="当前预约" value={overview.activeBookings || 0} />
        <Metric label="当前占用率" value={`${overview.occupancyRate || 0}%`} />
      </div>
      <div className="two-column">
        <HeatPanel title="各自习室日均使用率" items={usage} />
        <BarPanel title="热门时段统计" items={timeStats} labelKey="label" valueKey="count" />
      </div>
    </div>
  );
}

function StudentDashboard({ user, onLogout, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('reserve');
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  const loadStudentData = useCallback(async () => {
    const [nextBuildings, nextRooms, nextBookings] = await Promise.all([
      api('/buildings'),
      api('/rooms'),
      api(`/bookings/user/${user.id}`)
    ]);
    setBuildings(nextBuildings);
    setRooms(nextRooms);
    setBookings(nextBookings);
  }, [user.id]);

  useEffect(() => {
    loadStudentData().catch((err) => setMessage(err.message));
  }, [loadStudentData]);

  const tabs = [
    { key: 'reserve', label: '预约选座', icon: '座' },
    { key: 'mine', label: '我的预约', icon: '单' },
    { key: 'profile', label: '账号设置', icon: '密' }
  ];

  return (
    <Shell user={user} onLogout={onLogout} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}>
      <Header title="学生预约中心" subtitle="按校区、楼栋和楼层筛选自习室，查看座位状态后在线选座。" />
      {message && <div className="message">{message}</div>}
      {user.blacklisted && <div className="message error">当前账号在黑名单中，暂不能预约。请联系管理员处理。</div>}
      {activeTab === 'reserve' && (
        <ReservationPanel user={user} buildings={buildings} rooms={rooms} onChanged={loadStudentData} setMessage={setMessage} />
      )}
      {activeTab === 'mine' && (
        <StudentBookingPanel bookings={bookings} rooms={rooms} onChanged={loadStudentData} setMessage={setMessage} />
      )}
      {activeTab === 'profile' && (
        <ProfilePanel user={user} onUserUpdate={onUserUpdate} setMessage={setMessage} />
      )}
    </Shell>
  );
}

function ReservationPanel({ user, buildings, rooms, onChanged, setMessage }) {
  const [filters, setFilters] = useState({
    campus: '',
    buildingId: '',
    floorNumber: '',
    roomId: '',
    date: today(),
    slot: '08:00-10:00'
  });
  const [seatMap, setSeatMap] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const campuses = Array.from(new Set(buildings.map((building) => building.campus).filter(Boolean)));
  const buildingOptions = buildings.filter((building) => !filters.campus || building.campus === filters.campus);

  // 筛选出所选校区/楼栋下实际有房间的楼层
  const floorsWithRooms = Array.from(new Set(
    rooms.filter((room) => {
      return (!filters.campus || room.campus === filters.campus)
        && (!filters.buildingId || room.buildingId === filters.buildingId);
    }).map((room) => room.floorNumber)
  )).sort((a, b) => a - b);

  const roomOptions = rooms.filter((room) => {
    return (!filters.campus || room.campus === filters.campus)
      && (!filters.buildingId || room.buildingId === filters.buildingId)
      && (!filters.floorNumber || String(room.floorNumber || 1) === String(filters.floorNumber));
  });
  const currentRoom = rooms.find((room) => room.id === filters.roomId);
  const [startTime, endTime] = filters.slot.split('-');

  // 当天只显示还未结束的时间段
  const availableSlots = timeSlots.filter(([start, end]) => {
    if (filters.date !== today()) return true;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const [eh, em] = end.split(':').map(Number);
    return nowMin < (eh * 60 + em);
  });

  // 当前选中的时段已过期时自动切换到第一个可用时段
  useEffect(() => {
    if (filters.date !== today() || availableSlots.length === 0) return;
    const currentValid = availableSlots.some(([s, e]) => `${s}-${e}` === filters.slot);
    if (!currentValid) {
      const [ns, ne] = availableSlots[0];
      setFilters(prev => ({ ...prev, slot: `${ns}-${ne}` }));
    }
  }, [filters.date, filters.slot, availableSlots]);

  useEffect(() => {
    if (!filters.roomId) {
      setSeatMap(null);
      return;
    }
    api(`/rooms/${filters.roomId}/seats?date=${filters.date}&startTime=${startTime}&endTime=${endTime}`)
      .then((data) => {
        setSeatMap(data);
        setSelectedSeat(null);
      })
      .catch((err) => setMessage(err.message));
  }, [filters.roomId, filters.date, filters.slot, startTime, endTime, setMessage]);

  const createBooking = async () => {
    if (!selectedSeat) {
      setMessage('请先选择一个空闲座位');
      return;
    }
    try {
      await api('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          roomId: filters.roomId,
          seatId: selectedSeat.id,
          bookingDate: filters.date,
          startTime,
          endTime
        })
      });
      setMessage('预约成功');
      onChanged();
      const latestMap = await api(`/rooms/${filters.roomId}/seats?date=${filters.date}&startTime=${startTime}&endTime=${endTime}`);
      setSeatMap(latestMap);
      setSelectedSeat(null);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="stack">
      <section className="panel">
        <h3>选择自习室</h3>
        <div className="filter-grid">
          <label>校区
            <select value={filters.campus} onChange={(e) => setFilters({ ...filters, campus: e.target.value, buildingId: '', roomId: '' })}>
              <option value="">全部校区</option>
              {campuses.map((campus) => <option key={campus} value={campus}>{campus}</option>)}
            </select>
          </label>
          <label>楼栋
            <select value={filters.buildingId} onChange={(e) => setFilters({ ...filters, buildingId: e.target.value, floorNumber: '', roomId: '' })}>
              <option value="">全部楼栋</option>
              {buildingOptions.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}
            </select>
          </label>
          <label>楼层
            <select value={filters.floorNumber} onChange={(e) => setFilters({ ...filters, floorNumber: e.target.value, roomId: '' })}>
              <option value="">全部楼层</option>
              {floorsWithRooms.map((floor) => <option key={floor} value={floor}>{floorLabel(floor)}</option>)}
            </select>
          </label>
          <label>自习室
            <select value={filters.roomId} onChange={(e) => setFilters({ ...filters, roomId: e.target.value })}>
              <option value="">请选择自习室</option>
              {roomOptions.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
            </select>
          </label>
          <label>日期<input type="date" min={today()} value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} /></label>
          <label>时间段
            <select value={filters.slot} onChange={(e) => setFilters({ ...filters, slot: e.target.value })}>
              {availableSlots.length === 0
                ? <option value="">今日无可用时段</option>
                : availableSlots.map(([start, end]) => <option key={`${start}-${end}`} value={`${start}-${end}`}>{start}-{end}</option>)}
            </select>
          </label>
        </div>
      </section>
      <section className="panel">
        <div className="toolbar">
          <div>
            <h3>{currentRoom ? currentRoom.name : '座位可视化'}</h3>
            <p className="muted">{currentRoom ? `${currentRoom.location} · ${currentRoom.openTime}-${currentRoom.closeTime}` : '请选择自习室查看座位图'}</p>
          </div>
          <button className="primary-btn" type="button" onClick={createBooking} disabled={!selectedSeat || user.blacklisted}>确认预约</button>
        </div>
        <SeatLegend />
        {seatMap ? (
          <SeatGrid seatMap={seatMap} selectedSeat={selectedSeat} setSelectedSeat={setSelectedSeat} />
        ) : (
          <div className="empty-state">选择条件后展示座位图</div>
        )}
      </section>
    </div>
  );
}

function SeatLegend() {
  return (
    <div className="legend">
      <span><i className="available" />空闲</span>
      <span><i className="occupied" />已占用</span>
      <span><i className="selected" />已选择</span>
      <span><i className="disabled" />停用</span>
    </div>
  );
}

function SeatGrid({ seatMap, selectedSeat, setSelectedSeat }) {
  return (
    <div className="seat-map-wrap">
      <div className="room-door">入口</div>
      <div className="seat-map" style={{ gridTemplateColumns: `repeat(${seatMap.columnCount}, minmax(44px, 1fr))` }}>
        {seatMap.seats.map((seat) => {
          const selected = selectedSeat?.id === seat.id;
          const disabled = seat.status !== 'AVAILABLE';
          return (
            <button
              key={seat.id}
              type="button"
              className={`seat ${seat.status.toLowerCase()} ${selected ? 'selected' : ''}`}
              disabled={disabled}
              onClick={() => setSelectedSeat(seat)}
              title={`${seat.seatNo}${seat.powerSocket ? ' · 有插座' : ''}${seat.nearWindow ? ' · 靠窗' : ''}`}
            >
              {seat.seatNo}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StudentBookingPanel({ bookings, rooms, onChanged, setMessage }) {
  const roomMap = useMemo(() => Object.fromEntries(rooms.map((room) => [room.id, room.name])), [rooms]);

  const operate = async (id, action, successMessage) => {
    try {
      await api(`/bookings/${id}/${action}`, { method: 'PUT' });
      setMessage(successMessage);
      onChanged();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="panel">
      <h3>我的预约</h3>
      <DataTable headers={['自习室', '座位', '日期', '时间', '状态', '操作']}>
        {bookings.map((booking) => (
          <tr key={booking.id}>
            <td>{roomMap[booking.roomId] || '未知自习室'}</td>
            <td>{booking.seatNo || '-'}</td>
            <td>{booking.bookingDate}</td>
            <td>{booking.startTime || '-'}-{booking.endTime || '-'}</td>
            <td>{statusText[booking.status] || booking.status}{booking.checkedIn ? ' · 已签到' : ''}</td>
            <td className="table-actions">
              {booking.status === 'ACTIVE' && !booking.checkedIn && (
                <>
                  {canCheckIn(booking) && (
                    <button type="button" onClick={() => operate(booking.id, 'check-in', '签到成功')}>签到</button>
                  )}
                  <button type="button" className="danger" onClick={() => operate(booking.id, 'cancel', '预约已取消')}>取消预约</button>
                </>
              )}
              {booking.status === 'ACTIVE' && booking.checkedIn && (
                <span className="muted">已签到 · 无需操作</span>
              )}
              {booking.status !== 'ACTIVE' && <span className="muted">—</span>}
            </td>
          </tr>
        ))}
      </DataTable>
    </section>
  );
}

function ProfilePanel({ user, onUserUpdate, setMessage }) {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const changePassword = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMessage('两次输入的新密码不一致');
      return;
    }
    try {
      await api('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ userId: user.id, oldPassword: form.oldPassword, newPassword: form.newPassword })
      });
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('密码修改成功');
      onUserUpdate(user);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="panel narrow">
      <h3>账号设置</h3>
      <div className="profile-summary">
        <strong>{user.realName}</strong>
        <span>{roleText[user.role]} · {user.username}</span>
        <span>{user.className || '未填写班级'} · 爽约 {user.violationCount || 0} 次</span>
      </div>
      <form className="form-grid" onSubmit={changePassword}>
        <label>原密码<input type="password" value={form.oldPassword} onChange={(e) => setForm({ ...form, oldPassword: e.target.value })} required /></label>
        <label>新密码<input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required /></label>
        <label>确认新密码<input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required /></label>
        <button className="primary-btn" type="submit">修改密码</button>
      </form>
    </section>
  );
}

function DataTable({ headers, children }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export default App;
