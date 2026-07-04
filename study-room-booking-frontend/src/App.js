import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8081/api'
  : '/api';

const statusText = {
  ACTIVE: '预约中',
  RELEASED: '已释放',
  CANCELLED: '已取消',
  NO_SHOW: '违规'
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
  if (!booking.startTime) return false;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = booking.startTime.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const deadlineMin = startMin + 30;
  // 签到窗口：预约开始时间 → 开始后30分钟
  return nowMin >= startMin && nowMin < deadlineMin;
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
  const [form, setForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm] = useState({ username: '', password: '', confirmPassword: '', realName: '', studentNo: '', className: '', phone: '', email: '' });
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
          phone: regForm.phone,
          email: regForm.email
        })
      });
      setSuccess('注册成功！请使用新账号登录。');
      setRegForm({ username: '', password: '', confirmPassword: '', realName: '', studentNo: '', className: '', phone: '', email: '' });
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
              昵称<span className="required">*</span>
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
              班级
              <input value={regForm.className} onChange={(e) => setRegForm({ ...regForm, className: e.target.value })} />
            </label>
            <label>
              手机号
              <input value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} />
            </label>
            <label>
              邮箱
              <input type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
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
            昵称 / 学号
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
  const [noShowStats, setNoShowStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [reportDate, setReportDate] = useState(today());
  const [message, setMessage] = useState('');

  const loadAdminData = useCallback(async (date = reportDate) => {
    const [nextUsers, nextBuildings, nextRooms, nextBookings, nextOverview, nextUsage, nextTimeStats, nextNoShow] = await Promise.all([
      api('/users'),
      api('/buildings'),
      api('/rooms'),
      api('/bookings'),
      api('/reports/overview'),
      api(`/reports/room-usage?date=${date}`),
      api(`/reports/time-slots?date=${date}`),
      api('/reports/no-show-stats')
    ]);
    setUsers(nextUsers);
    setBuildings(nextBuildings);
    setRooms(nextRooms);
    setBookings(nextBookings);
    setOverview(nextOverview);
    setUsage(nextUsage);
    setTimeStats(nextTimeStats);
    setNoShowStats(nextNoShow);
  }, [reportDate]);

  const loadSettings = useCallback(async () => {
    try {
      setSettings(await api('/admin/settings'));
    } catch (err) {
      setMessage(err.message);
    }
  }, []);

  useEffect(() => {
    loadAdminData().catch((err) => setMessage(err.message));
    loadSettings();
  }, [loadAdminData, loadSettings]);

  const tabs = [
    { key: 'overview', label: '实时看板', icon: '▦' },
    { key: 'rooms', label: '自习室管理', icon: '□' },
    { key: 'users', label: '账号管理', icon: '人' },
    { key: 'bookings', label: '预约管控', icon: '时' },
    { key: 'reports', label: '数据报表', icon: '图' },
    { key: 'settings', label: '系统设置', icon: '设' }
  ];

  return (
    <Shell user={user} onLogout={onLogout} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}>
      <Header title="管理员工作台" subtitle="维护楼栋、楼层、自习室座位排布，管理学生账号与预约状态。" />
      {message && <div className="message">{message}</div>}
      {activeTab === 'overview' && (
        <OverviewPanel overview={overview} usage={usage} timeStats={timeStats} noShowStats={noShowStats} onRefresh={() => loadAdminData()} />
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
      {activeTab === 'settings' && (
        <SettingsPanel settings={settings} onReload={loadSettings} setMessage={setMessage} />
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

function OverviewPanel({ overview, usage, timeStats, noShowStats, onRefresh }) {
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
      <div className="chart-row">
        <LineChartPanel title="预约时段分布" items={timeStats} />
        <NoShowPiePanel title="违规情况" stats={noShowStats} />
      </div>
      <HeatPanel title="自习室座位热力图" items={usage} />
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

function LineChartPanel({ title, items }) {
  if (!items || items.length === 0) return null;
  const values = items.map((d) => d.count || 0);
  const dataMax = Math.max(...values);
  const max = dataMax > 0 ? dataMax : 1;
  const w = 560, h = 180, px = 36, pr = 16, py = 16;
  const chartW = w - px - pr;
  const chartH = h - py * 2;
  const xStep = chartW / (items.length - 1 || 1);

  const points = items.map((d, i) => ({
    x: px + i * xStep,
    y: h - py - ((d.count || 0) / max) * chartH,
    label: d.label || '',
    count: d.count || 0
  }));

  // 平滑曲线（三次贝塞尔插值），控制点限制在图表边界内
  function smoothPath(pts) {
    if (pts.length === 0) return '';
    const yBottom = h - py; // 0 值对应的 y 坐标
    const yTop = py;        // 最大值对应的 y 坐标
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const pPrev = pts[i - 2] || p0;
      const pNext = pts[i + 1] || p1;
      const cpx1 = p0.x + (p1.x - pPrev.x) / 6;
      let cpy1 = p0.y + (p1.y - pPrev.y) / 6;
      const cpx2 = p1.x - (pNext.x - p0.x) / 6;
      let cpy2 = p1.y - (pNext.y - p0.y) / 6;
      // 限制控制点不超出图表上下边界
      cpy1 = Math.max(yTop, Math.min(yBottom, cpy1));
      cpy2 = Math.max(yTop, Math.min(yBottom, cpy2));
      d += `C${cpx1.toFixed(1)},${cpy1.toFixed(1)} ${cpx2.toFixed(1)},${cpy2.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
    }
    return d;
  }
  const pathD = smoothPath(points);

  // 纵轴刻度：自动生成 4~5 个合理的整数值
  const yTicks = (() => {
    if (max <= 5) {
      // 小数值：显示 0,1,2,...,max
      const ticks = [];
      for (let v = 0; v <= max; v++) ticks.push(v);
      return ticks;
    }
    // 大数值：取整间隔
    const step = Math.pow(10, Math.floor(Math.log10(max)));
    const ticks = [];
    for (let v = 0; v <= max + step; v += step) ticks.push(v);
    return ticks;
  })();

  return (
    <section className="panel chart-panel">
      <h3>{title}</h3>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', maxHeight: 200 }}>
        {yTicks.map((v) => {
          const y = h - py - (v / max) * chartH;
          return <g key={v}>
            <line x1={px} y1={y} x2={w - pr} y2={y} stroke="#eaf1ee" strokeWidth={1} />
            <text x={px - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#718188">{v}</text>
          </g>;
        })}
        <path d={pathD} fill="none" stroke="#1f8a70" strokeWidth={2.5} strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3.5} fill="#1f8a70" stroke="#fff" strokeWidth={1.5} />
            {items.length <= 15 && (
              <text x={p.x} y={h - 2} textAnchor="middle" fontSize={9} fill="#65747a">{p.label}</text>
            )}
          </g>
        ))}
        {points.map((p, i) => (
          <title key={i}>{p.label}: {p.count} 次</title>
        ))}
      </svg>
    </section>
  );
}

function NoShowPiePanel({ title, stats }) {
  if (!stats || stats.total === 0) {
    return (
      <section className="panel chart-panel">
        <h3>{title}</h3>
        <div className="empty-state" style={{ minHeight: 120 }}>暂无违规记录</div>
      </section>
    );
  }
  const t1 = stats.noCheckIn || 0;
  const t2 = stats.noCheckOut || 0;
  const total = Math.max(1, t1 + t2);
  const a1 = (t1 / total) * 360;
  const a2 = (t2 / total) * 360;
  const cx = 100, cy = 100, r = 80;

  function polar(angle, radius) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(startAngle, endAngle) {
    if (endAngle - startAngle >= 360) {
      const p1 = polar(startAngle, r);
      const p2 = polar(startAngle + 180, r);
      return `M${cx},${cy} L${p1.x},${p1.y} A${r},${r} 0 1,0 ${p2.x},${p2.y} A${r},${r} 0 1,0 ${p1.x},${p1.y} Z`;
    }
    const start = polar(startAngle, r);
    const end = polar(endAngle, r);
    const large = (endAngle - startAngle) > 180 ? 1 : 0;
    return `M${cx},${cy} L${start.x},${start.y} A${r},${r} 0 ${large},1 ${end.x},${end.y} Z`;
  }

  const colors = ['#e67e22', '#e74c3c'];
  const segments = [];
  let cur = 0;
  if (a1 > 0) { segments.push({ start: cur, end: cur + a1, label: '未签到', count: t1, color: colors[0] }); cur += a1; }
  if (a2 > 0) { segments.push({ start: cur, end: cur + a2, label: '未签退', count: t2, color: colors[1] }); }

  return (
    <section className="panel chart-panel">
      <h3>{title}（共 {total} 次）</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg viewBox="0 0 200 200" style={{ width: 160, height: 160, flexShrink: 0 }}>
          {segments.map((seg, i) => (
            <path key={i} d={arcPath(seg.start, seg.end)} fill={seg.color} stroke="#fff" strokeWidth={1.5}>
              <title>{seg.label}: {seg.count} 次 ({Math.round((seg.count / total) * 100)}%)</title>
            </path>
          ))}
          <circle cx={cx} cy={cy} r={35} fill="#fff" />
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize={18} fontWeight={800} fill="#173d3a">{total}</text>
          <text x={cx} y={cy + 13} textAnchor="middle" fontSize={10} fill="#65747a">总计</text>
        </svg>
        <div style={{ fontSize: 13, display: 'grid', gap: 8 }}>
          {segments.map((seg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: seg.color, display: 'inline-block' }} />
              <span style={{ color: '#5a6a70' }}>{seg.label}</span>
              <strong style={{ color: '#173d3a' }}>{seg.count}</strong>
              <span style={{ color: '#718188', fontSize: 12 }}>({Math.round((seg.count / total) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </section>
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

function RoomEditModal({ room, buildings, onClose, onSaved, setMessage }) {
  const [form, setForm] = useState({
    name: room.name || '',
    buildingId: room.buildingId || '',
    floorNumber: room.floorNumber || 1,
    rowCount: room.rowCount || 4,
    columnCount: room.columnCount || 6,
    openTime: room.openTime || '08:00',
    closeTime: room.closeTime || '22:00',
    available: Boolean(room.available)
  });
  const [seats, setSeats] = useState([]);
  const [dirtySeats, setDirtySeats] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(true);

  useEffect(() => {
    api(`/rooms/${room.id}/all-seats`)
      .then((data) => {
        setSeats(data);
        setLoadingSeats(false);
      })
      .catch((err) => {
        setMessage(err.message);
        setLoadingSeats(false);
      });
  }, [room.id, setMessage]);

  const toggleSeat = (seat) => {
    setSeats((prev) => prev.map((s) => (s.id === seat.id ? { ...s, enabled: !s.enabled } : s)));
    setDirtySeats((prev) => new Set([...prev, seat.id]));
  };

  const handleSave = async () => {
    if (!form.name || !form.buildingId) {
      setMessage('请填写自习室名称并选择所属楼栋');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        floorNumber: Number(form.floorNumber),
        rowCount: Number(form.rowCount),
        columnCount: Number(form.columnCount),
        capacity: Number(form.rowCount) * Number(form.columnCount)
      };
      await api(`/rooms/${room.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      for (const seatId of dirtySeats) {
        const seat = seats.find((s) => s.id === seatId);
        if (seat) {
          await api(`/rooms/${room.id}/seats/${seatId}`, {
            method: 'PUT',
            body: JSON.stringify({ enabled: seat.enabled })
          });
        }
      }
      setMessage('自习室信息已保存');
      onSaved();
      onClose();
    } catch (err) {
      setMessage(err.message);
    }
    setSaving(false);
  };

  // 按行列排布座位
  const rows = Number(form.rowCount) || 1;
  const cols = Number(form.columnCount) || 1;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card room-edit-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">编辑自习室 — {room.name}</h3>
        <div className="room-edit-body">
          <div className="room-edit-form">
            <label>所属楼栋
              <select value={form.buildingId} onChange={(e) => setForm({ ...form, buildingId: e.target.value })} required>
                <option value="">请选择</option>
                {buildings.map((b) => <option key={b.id} value={b.id}>{b.campus} · {b.name}</option>)}
              </select>
            </label>
            <label>自习室名称
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>楼层
              <input type="number" value={form.floorNumber} onChange={(e) => setForm({ ...form, floorNumber: e.target.value })} />
            </label>
            <label>座位行数
              <input type="number" min="1" value={form.rowCount} onChange={(e) => setForm({ ...form, rowCount: e.target.value })} />
            </label>
            <label>座位列数
              <input type="number" min="1" value={form.columnCount} onChange={(e) => setForm({ ...form, columnCount: e.target.value })} />
            </label>
            <label>开放时间
              <input type="time" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })} />
            </label>
            <label>关闭时间
              <input type="time" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} />
            </label>
            <label className="check-line">
              <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
              开放预约
            </label>
          </div>
          <div className="room-edit-seats-panel">
            <strong>座位状态（点击切换启用/停用）</strong>
            {loadingSeats ? (
              <div className="empty-state" style={{ minHeight: 120 }}>加载座位中...</div>
            ) : (
              <>
                <div className="room-edit-seat-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(44px, 1fr))` }}>
                  {Array.from({ length: rows }, (_, ri) => ri + 1).map((r) =>
                    Array.from({ length: cols }, (_, ci) => ci + 1).map((c) => {
                      const seat = seats.find((s) => s.rowIndex === r && s.columnIndex === c);
                      if (!seat) {
                        return <div key={`${r}-${c}`} className="seat placeholder" />;
                      }
                      return (
                        <button
                          key={seat.id}
                          type="button"
                          className={`seat ${seat.enabled ? 'available' : 'disabled'}`}
                          onClick={() => toggleSeat(seat)}
                          title={`${seat.seatNo} · ${seat.enabled ? '已启用' : '已停用'}${dirtySeats.has(seat.id) ? ' (已修改)' : ''}`}
                        >
                          {seat.seatNo}
                        </button>
                      );
                    })
                  )}
                </div>
                <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                  绿色=启用 · 灰色=停用 · 点击切换
                  {dirtySeats.size > 0 && ` · ${dirtySeats.size} 个已修改`}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="modal-actions" style={{ marginTop: 20, borderTop: '1px solid #eaf1ee', paddingTop: 16 }}>
          <button className="ghost-btn" onClick={onClose}>取消</button>
          <button className="primary-btn" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
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
  const [editTarget, setEditTarget] = useState(null);

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
      await api('/rooms', { method: 'POST', body: JSON.stringify(payload) });
      setRoomForm({ buildingId: '', name: '', floorNumber: 1, rowCount: 4, columnCount: 6, openTime: '08:00', closeTime: '22:00', available: true });
      setMessage('自习室已创建');
      onChanged();
    } catch (err) {
      setMessage(err.message);
    }
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
          <h3>新增自习室与座位排布</h3>
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
            <button className="primary-btn" type="submit">生成座位</button>
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
              <button type="button" onClick={() => setEditTarget(room)}>修改</button>
              <button type="button" className="danger" onClick={() => deleteRoom(room.id)}>删除</button>
            </div>
          </article>
        ))}
      </section>
      {editTarget && (
        <RoomEditModal
          room={editTarget}
          buildings={buildings}
          onClose={() => setEditTarget(null)}
          onSaved={onChanged}
          setMessage={setMessage}
        />
      )}
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
      setMessage('用户已保存，初始密码为 123456');
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
        <h3>{editing ? '修改用户' : '新增用户'}</h3>
        <form className="form-grid wide" onSubmit={saveUser}>
          <label>昵称<input value={form.username} disabled={Boolean(editing)} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>
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
        <DataTable headers={['昵称', '姓名', '角色', '班级/学号', '状态', '操作']}>
          {users.map((target) => (
            <tr key={target.id}>
              <td>{target.username}</td>
              <td>{target.realName}</td>
              <td>{roleText[target.role]}</td>
              <td>{target.className || '-'} {target.studentNo || ''}</td>
              <td>{target.blacklisted ? '黑名单' : target.enabled ? '正常' : '停用'} · 违规 {target.violationCount || 0} 次</td>
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
                  <button type="button" onClick={() => operate(booking.id, 'no-show', '已登记违规')}>违规</button>
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
  // 当日累计预约 = timeStats 各小时预约数之和
  const dailyTotal = timeStats ? timeStats.reduce((s, d) => s + (d.count || 0), 0) : 0;
  return (
    <div className="stack">
      <div className="toolbar">
        <h2>数据报表</h2>
        <label className="inline-field">统计日期<input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} /></label>
        <button className="primary-btn" type="button" onClick={onLoad}>查询</button>
      </div>
      <div className="metric-grid">
        <Metric label="当日累计预约" value={dailyTotal} />
        <Metric label="当前预约" value={overview.activeBookings || 0} />
        <Metric label="当前占用率" value={`${overview.occupancyRate || 0}%`} />
      </div>
      <div className="two-column">
        <HeatPanel title="各自习室使用率" items={usage} />
        <LineChartPanel title="预约时段分布" items={timeStats} />
      </div>
    </div>
  );
}

const SETTINGS_LABELS = {
  max_bookings_per_day: '单日最大预约次数',
  check_in_window_minutes: '签到窗口（分钟）',
  violation_blacklist_threshold: '违规黑名单阈值（次）',
  no_show_grace_minutes: '未签到违规时间（分钟）',
  checkout_grace_minutes: '未签退违规时间（分钟）'
};

const SETTINGS_DESC = {
  max_bookings_per_day: '每个学生每天最多可预约的次数',
  check_in_window_minutes: '预约开始后多少分钟内可以签到',
  violation_blacklist_threshold: '违规累计达到多少次后自动加入黑名单',
  no_show_grace_minutes: '超过开始时间多少分钟未签到视为违规',
  checkout_grace_minutes: '超过结束时间多少分钟未签退视为违规'
};

function SettingsPanel({ settings, onReload, setMessage }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({ ...settings });
    }
  }, [settings]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(form)
      });
      setMessage('系统设置已保存');
      onReload();
    } catch (err) {
      setMessage(err.message);
    }
    setSaving(false);
  };

  if (!settings) {
    return <section className="panel"><div className="empty-state">加载中...</div></section>;
  }

  const keys = Object.keys(SETTINGS_LABELS);

  return (
    <section className="panel narrow">
      <h3>系统设置</h3>
      <p className="muted" style={{ marginBottom: 20 }}>配置预约限制参数，修改后立即生效。</p>
      <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
        {keys.map((key) => (
          <label key={key}>
            <span>{SETTINGS_LABELS[key]}</span>
            <small className="muted" style={{ fontWeight: 400, fontSize: 12, marginTop: -4 }}>
              {SETTINGS_DESC[key]}
            </small>
            <input
              type="number"
              min="1"
              value={form[key] ?? settings[key] ?? ''}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </label>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <button className="primary-btn" type="button" onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存设置'}
        </button>
      </div>
    </section>
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
    { key: 'profile', label: '个人中心', icon: '密' }
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
    startTime: '',
    endTime: ''
  });
  const [seatMap, setSeatMap] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [timeError, setTimeError] = useState('');

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
  const startTime = filters.startTime || (currentRoom ? currentRoom.openTime : '');
  const endTime = filters.endTime || (currentRoom ? currentRoom.closeTime : '');

  // 验证时间合理性
  useEffect(() => {
    if (!startTime || !endTime) {
      setTimeError('');
      return;
    }
    if (startTime >= endTime) {
      setTimeError('结束时间必须晚于开始时间');
      return;
    }
    if (currentRoom && (startTime < currentRoom.openTime || endTime > currentRoom.closeTime)) {
      setTimeError(`该自习室开放时间为 ${currentRoom.openTime}-${currentRoom.closeTime}`);
      return;
    }
    if (filters.date === today()) {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const [sh, sm] = startTime.split(':').map(Number);
      const startMin = sh * 60 + sm;
      if (nowMin >= startMin) {
        setTimeError('开始时间不能早于当前时间');
        return;
      }
    }
    setTimeError('');
  }, [startTime, endTime, currentRoom, filters.date]);

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
  }, [filters.roomId, filters.date, filters.startTime, filters.endTime, startTime, endTime, setMessage]);

  const createBooking = async () => {
    if (!selectedSeat) {
      setMessage('请先选择一个空闲座位');
      return;
    }
    if (timeError) {
      setMessage(timeError);
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
          <label className="room-filter">自习室
            <select value={filters.roomId} onChange={(e) => setFilters({ ...filters, roomId: e.target.value })}>
              <option value="">请选择自习室</option>
              {roomOptions.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
            </select>
          </label>
        </div>
        <div className="filter-row">
          <label>日期<input type="date" min={today()} value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} /></label>
          <label className="time-range-label">时间段
            <div className="time-range-input">
              <input type="time" value={filters.startTime} onChange={(e) => setFilters({ ...filters, startTime: e.target.value })} />
              <span>至</span>
              <input type="time" value={filters.endTime} onChange={(e) => setFilters({ ...filters, endTime: e.target.value })} />
            </div>
          </label>
        </div>
        {timeError && <div className="message error" style={{ marginTop: 0 }}>{timeError}</div>}
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
  const [confirmAction, setConfirmAction] = useState(null);

  const handleCheckInClick = (booking) => {
    setConfirmAction({ type: 'check-in', booking });
  };

  const handleCheckOutClick = (booking) => {
    setConfirmAction({ type: 'check-out', booking });
  };

  const handleCancelClick = (booking) => {
    setConfirmAction({ type: 'cancel', booking });
  };

  const confirmActionSubmit = async () => {
    if (!confirmAction) return;
    const { type, booking } = confirmAction;
    const actionMap = { 'check-in': 'check-in', 'check-out': 'check-out', cancel: 'cancel' };
    const msgMap = { 'check-in': '签到成功', 'check-out': '签退成功', cancel: '预约已取消' };
    try {
      await api(`/bookings/${booking.id}/${actionMap[type]}`, { method: 'PUT' });
      setMessage(msgMap[type]);
      onChanged();
    } catch (err) {
      setMessage(err.message);
    }
    setConfirmAction(null);
  };

  const confirmTitleMap = {
    'check-in': '确认签到',
    'check-out': '确认签退',
    cancel: '确认取消预约'
  };

  const confirmMessageMap = {
    'check-in': (b) => `确定要签到 ${b.bookingDate} ${b.startTime}-${b.endTime} 在 ${roomMap[b.roomId] || '自习室'} ${b.seatNo || ''} 座位的预约吗？签到后座位将被您占用。`,
    'check-out': (b) => `确定要签退 ${b.bookingDate} ${b.startTime}-${b.endTime} 在 ${roomMap[b.roomId] || '自习室'} ${b.seatNo || ''} 座位的预约吗？签退后座位将释放给他人。`,
    cancel: (b) => `确定要取消 ${b.bookingDate} ${b.startTime}-${b.endTime} 在 ${roomMap[b.roomId] || '自习室'} ${b.seatNo || ''} 座位的预约吗？`
  };

  const confirmTextMap = {
    'check-in': '确认签到',
    'check-out': '确认签退',
    cancel: '确认取消'
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
                    <button type="button" onClick={() => handleCheckInClick(booking)}>签到</button>
                  )}
                  <button type="button" className="danger" onClick={() => handleCancelClick(booking)}>取消预约</button>
                </>
              )}
              {booking.status === 'ACTIVE' && booking.checkedIn && (
                <>
                  <span className="muted" style={{ marginRight: 8 }}>已签到</span>
                  <button type="button" onClick={() => handleCheckOutClick(booking)}>签退</button>
                </>
              )}
              {booking.status !== 'ACTIVE' && <span className="muted">—</span>}
            </td>
          </tr>
        ))}
      </DataTable>
      <ConfirmModal
        visible={!!confirmAction}
        title={confirmAction ? confirmTitleMap[confirmAction.type] : ''}
        message={confirmAction ? confirmMessageMap[confirmAction.type](confirmAction.booking) : ''}
        confirmText={confirmAction ? confirmTextMap[confirmAction.type] : '确认'}
        cancelText="返回"
        onConfirm={confirmActionSubmit}
        onCancel={() => setConfirmAction(null)}
        danger={confirmAction?.type === 'cancel'}
      />
    </section>
  );
}

function ConfirmModal({ visible, title, message, confirmText, cancelText, onConfirm, onCancel, danger }) {
  if (!visible) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="ghost-btn" onClick={onCancel}>{cancelText || '返回'}</button>
          <button className={danger ? 'danger primary-btn' : 'primary-btn'} onClick={onConfirm}>{confirmText || '确认'}</button>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({ user, onUserUpdate, setMessage }) {
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: user.username || '',
    email: user.email || '',
    phone: user.phone || '',
    className: user.className || ''
  });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    if (!profileForm.username.trim()) {
      setMessage('昵称不能为空');
      return;
    }
    setSavingProfile(true);
    try {
      const updatedUser = await api(`/users/${user.id}/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileForm)
      });
      onUserUpdate({ ...user, ...updatedUser });
      setMessage('个人信息已更新');
      setEditing(false);
    } catch (err) {
      setMessage(err.message);
    }
    setSavingProfile(false);
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('两次输入的新密码不一致');
      return;
    }
    try {
      await api('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ userId: user.id, oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword })
      });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('密码修改成功');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="panel narrow">
      <div className="toolbar">
        <h3>个人中心</h3>
        {!editing ? (
          <button type="button" className="ghost-btn" onClick={() => setEditing(true)}>编辑资料</button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="ghost-btn" onClick={() => { setEditing(false); setProfileForm({ username: user.username, email: user.email || '', phone: user.phone || '', className: user.className || '' }); }}>取消</button>
            <button type="button" className="primary-btn" onClick={saveProfile} disabled={savingProfile}>{savingProfile ? '保存中...' : '保存资料'}</button>
          </div>
        )}
      </div>

      <div className="profile-summary">
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 8, alignItems: 'center', fontSize: 14 }}>
            <span style={{ color: '#65747a', fontWeight: 600 }}>姓名</span>
            <span style={{ color: '#1f2a2e' }}>{user.realName}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 8, alignItems: 'center', fontSize: 14 }}>
            <span style={{ color: '#65747a', fontWeight: 600 }}>学号</span>
            <span style={{ color: '#1f2a2e' }}>{user.studentNo || '-'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 8, alignItems: 'center', fontSize: 14 }}>
            <span style={{ color: '#65747a', fontWeight: 600 }}>角色</span>
            <span style={{ color: '#1f2a2e' }}>{roleText[user.role]}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 8, alignItems: 'center', fontSize: 14 }}>
            <span style={{ color: '#65747a', fontWeight: 600 }}>违规次数</span>
            <span style={{ color: '#1f2a2e' }}>{user.violationCount || 0} 次{user.blacklisted ? ' · 已加入黑名单' : ''}</span>
          </div>
        </div>
      </div>

      <div className="form-grid" style={{ marginBottom: 24 }}>
        <label>昵称
          {editing ? (
            <input name="username" value={profileForm.username} onChange={handleProfileChange} required />
          ) : (
            <input value={user.username} disabled />
          )}
        </label>
        <label>邮箱
          {editing ? (
            <input name="email" type="email" value={profileForm.email} onChange={handleProfileChange} />
          ) : (
            <input value={user.email || '-'} disabled />
          )}
        </label>
        <label>手机号
          {editing ? (
            <input name="phone" value={profileForm.phone} onChange={handleProfileChange} />
          ) : (
            <input value={user.phone || '-'} disabled />
          )}
        </label>
        <label>班级
          {editing ? (
            <input name="className" value={profileForm.className} onChange={handleProfileChange} />
          ) : (
            <input value={user.className || '-'} disabled />
          )}
        </label>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #eaf1ee', margin: '0 0 20px' }} />

      <h4 style={{ margin: '0 0 14px', color: '#173d3a', fontSize: 15 }}>修改密码</h4>
      <form className="form-grid" onSubmit={changePassword}>
        <label>原密码<input type="password" value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} required /></label>
        <label>新密码<input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required /></label>
        <label>确认新密码<input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required /></label>
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
