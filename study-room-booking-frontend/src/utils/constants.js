/**
 * Shared constants used across the application.
 */

export const statusText = {
  ACTIVE: '预约中',
  RELEASED: '已释放',
  CANCELLED: '已取消',
  NO_SHOW: '违规'
};

export const roleText = {
  ADMIN: '管理员',
  STUDENT: '学生'
};

export const SETTINGS_LABELS = {
  max_bookings_per_day: '单日最大预约次数',
  check_in_window_minutes: '签到窗口（分钟）',
  violation_blacklist_threshold: '违规黑名单阈值（次）',
  no_show_grace_minutes: '未签到违规时间（分钟）',
  checkout_grace_minutes: '未签退违规时间（分钟）'
};

export const SETTINGS_DESC = {
  max_bookings_per_day: '每个学生每天最多可预约的次数',
  check_in_window_minutes: '预约开始后多少分钟内可以签到',
  violation_blacklist_threshold: '违规累计达到多少次后自动加入黑名单',
  no_show_grace_minutes: '超过开始时间多少分钟未签到视为违规',
  checkout_grace_minutes: '超过结束时间多少分钟未签退视为违规'
};

export const DEFAULT_SETTINGS = {
  max_bookings_per_day: 3,
  check_in_window_minutes: 30,
  violation_blacklist_threshold: 3,
  no_show_grace_minutes: 30,
  checkout_grace_minutes: 30
};
