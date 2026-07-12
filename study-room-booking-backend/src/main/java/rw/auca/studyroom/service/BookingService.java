package rw.auca.studyroom.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rw.auca.studyroom.model.Booking;
import rw.auca.studyroom.model.Room;
import rw.auca.studyroom.model.Seat;
import rw.auca.studyroom.model.UserAccount;
import rw.auca.studyroom.model.UserRole;
import rw.auca.studyroom.repository.BookingRepository;
import rw.auca.studyroom.repository.RoomRepository;
import rw.auca.studyroom.repository.SeatRepository;
import rw.auca.studyroom.repository.UserAccountRepository;
import rw.auca.studyroom.util.TimeUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.scheduling.annotation.Scheduled;

@Service
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private ConfigService configService;

    @Autowired
    private NotificationService notificationService;
    
    public List<Booking> getAllBookings() {
        releaseExpiredBookings();
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByUser(UUID userId) {
        releaseExpiredBookings();
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public Booking createBooking(Map<String, String> request) {
        releaseExpiredBookings();
        Booking booking = new Booking();
        booking.setUserId(UUID.fromString(request.get("userId")));
        booking.setRoomId(UUID.fromString(request.get("roomId")));
        booking.setSeatId(UUID.fromString(request.get("seatId")));
        booking.setBookingDate(request.get("bookingDate"));
        booking.setStartTime(request.get("startTime"));
        booking.setEndTime(request.get("endTime"));
        UserAccount user = userAccountRepository.findById(booking.getUserId())
            .orElseThrow(() -> new RuntimeException("账号不存在"));
        if (user.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("只有学生账号可以预约座位");
        }
        if (Boolean.TRUE.equals(user.getBlacklisted())) {
            throw new RuntimeException("该账号已进入黑名单，暂不能预约");
        }
        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new RuntimeException("账号已停用");
        }

        Optional<Room> roomOptional = roomRepository.findById(booking.getRoomId());
        if (roomOptional.isPresent()) {
            Room room = roomOptional.get();
            if (!Boolean.TRUE.equals(room.getAvailable())) {
                throw new RuntimeException("该自习室暂未开放");
            }
            Seat seat = seatRepository.findById(booking.getSeatId())
                .orElseThrow(() -> new RuntimeException("座位不存在"));
            if (!seat.getRoomId().equals(room.getId())) {
                throw new RuntimeException("座位不属于该自习室");
            }
            if (!Boolean.TRUE.equals(seat.getEnabled())) {
                throw new RuntimeException("该座位已停用");
            }
            validateBookingTime(booking);

            List<Booking> userBookings = bookingRepository.findByUserIdAndBookingDateAndStatus(
                user.getId(), booking.getBookingDate(), "ACTIVE"
            );
            int maxPerDay = configService.getInt("max_bookings_per_day", 3);
            if (userBookings.size() >= maxPerDay) {
                throw new RuntimeException("单日最多预约 " + maxPerDay + " 次");
            }
            
            List<Booking> existingBookings = bookingRepository.findBySeatIdAndBookingDateAndStatus(
                booking.getSeatId(), booking.getBookingDate(), "ACTIVE"
            );
            for (Booking existing : existingBookings) {
                if (TimeUtils.timesOverlap(booking.getStartTime(), booking.getEndTime(), existing.getStartTime(), existing.getEndTime())) {
                    throw new RuntimeException("该座位在所选时间段已被预约");
                }
            }
            
            booking.setStudentName(user.getRealName());
            booking.setStudentId(user.getStudentNo() == null ? user.getUsername() : user.getStudentNo());
            booking.setUsername(user.getUsername());
            booking.setSeatNo(seat.getSeatNo());
            booking.setStatus("ACTIVE");
            booking.setReleased(false);
            booking.setCheckedIn(false);
            booking.setCreatedAt(LocalDateTime.now());
            Booking saved = bookingRepository.save(booking);
            // 发送预约成功通知
            notificationService.createNotification(user.getId(), "BOOKING_SUCCESS", "预约成功",
                "您在 " + booking.getBookingDate() + " " + booking.getStartTime() + "-" + booking.getEndTime()
                + " 的预约已成功创建，自习室：" + room.getName() + "，座位：" + booking.getSeatNo());
            return saved;
        }
        throw new RuntimeException("自习室不存在");
    }
    
    public boolean cancelBooking(UUID id) {
        Optional<Booking> bookingOptional = bookingRepository.findById(id);
        if (bookingOptional.isPresent()) {
            Booking booking = bookingOptional.get();
            if (Boolean.TRUE.equals(booking.getCheckedIn())) {
                throw new RuntimeException("已签到的预约不可取消");
            }
            booking.setStatus("CANCELLED");
            booking.setReleased(true);
            bookingRepository.save(booking);
            if (booking.getUserId() != null) {
                userAccountRepository.findById(booking.getUserId()).ifPresent(user -> {
                    notificationService.createNotification(user.getId(), "BOOKING_SUCCESS", "预约已取消",
                        "您的预约（" + (booking.getBookingDate() == null ? "" : booking.getBookingDate())
                        + " " + (booking.getStartTime() == null ? "" : booking.getStartTime() + "-" + (booking.getEndTime() == null ? "" : booking.getEndTime())) + "）已取消。");
                });
            }
            return true;
        }
        return false;
    }
    
    public Booking releaseBooking(UUID bookingId) {
        Optional<Booking> bookingOptional = bookingRepository.findById(bookingId);
        if (bookingOptional.isPresent()) {
            Booking booking = bookingOptional.get();
            booking.setReleased(true);
            booking.setStatus("RELEASED");
            Booking updatedBooking = bookingRepository.save(booking);
            if (booking.getUserId() != null) {
                userAccountRepository.findById(booking.getUserId()).ifPresent(user -> {
                    notificationService.createNotification(user.getId(), "BOOKING_SUCCESS", "预约已释放",
                        "管理员已释放您的预约（" + (booking.getBookingDate() == null ? "" : booking.getBookingDate())
                        + " " + (booking.getStartTime() == null ? "" : booking.getStartTime() + "-" + (booking.getEndTime() == null ? "" : booking.getEndTime())) + "）。");
                });
            }
            return updatedBooking;
        }
        return null;
    }

    public Booking checkInBooking(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("预约不存在"));
        if (!"ACTIVE".equals(booking.getStatus())) {
            throw new RuntimeException("当前预约不可签到");
        }
        if (Boolean.TRUE.equals(booking.getCheckedIn())) {
            throw new RuntimeException("已签到，无需重复签到");
        }
        // 校验签到时间：仅限预约当天，在开始时间到开始后30分钟内签到
        LocalDate today = LocalDate.now();
        if (booking.getBookingDate() == null || !today.toString().equals(booking.getBookingDate())) {
            throw new RuntimeException("仅限预约当天签到");
        }
        if (booking.getStartTime() == null) {
            throw new RuntimeException("预约时间不完整");
        }
        LocalTime now = LocalTime.now();
        LocalTime startTime = LocalTime.parse(booking.getStartTime());
        int windowMin = configService.getInt("check_in_window_minutes", 30);
        LocalTime deadline = startTime.plusMinutes(windowMin);
        if (now.isBefore(startTime)) {
            throw new RuntimeException("签到时间未到，请在预约开始时间后签到");
        }
        if (!now.isBefore(deadline)) {
            throw new RuntimeException("签到时间已过（预约开始后" + windowMin + "分钟内可签到）");
        }
        booking.setCheckedIn(true);
        return bookingRepository.save(booking);
    }

    public Booking checkOutBooking(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("预约不存在"));
        if (!"ACTIVE".equals(booking.getStatus())) {
            throw new RuntimeException("当前预约状态不可签退");
        }
        if (!Boolean.TRUE.equals(booking.getCheckedIn())) {
            throw new RuntimeException("尚未签到，无需签退");
        }
        booking.setReleased(true);
        booking.setStatus("RELEASED");
        Booking saved = bookingRepository.save(booking);
        if (booking.getUserId() != null) {
            userAccountRepository.findById(booking.getUserId()).ifPresent(user -> {
                notificationService.createNotification(user.getId(), "BOOKING_SUCCESS", "签退成功",
                    "您已成功签退（" + (booking.getBookingDate() == null ? "" : booking.getBookingDate())
                    + " " + (booking.getStartTime() == null ? "" : booking.getStartTime() + "-" + (booking.getEndTime() == null ? "" : booking.getEndTime())) + "）。");
            });
        }
        return saved;
    }

    public Booking markNoShow(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("预约不存在"));
        markNoShowAndSave(booking);
        return booking;
    }

    @Scheduled(fixedRate = 60_000)
    public void releaseExpiredBookings() {
        List<Booking> activeBookings = bookingRepository.findByStatus("ACTIVE");
        LocalDateTime now = LocalDateTime.now();
        for (Booking booking : activeBookings) {
            if (booking.getBookingDate() == null || booking.getStartTime() == null) {
                continue;
            }
            LocalDate date = LocalDate.parse(booking.getBookingDate());
            LocalTime startTime = LocalTime.parse(booking.getStartTime());
            LocalDateTime startAt = LocalDateTime.of(date, startTime);

            // Type 1: 未签到且超过开始时间 N 分钟 → 违规（未按时签到）
            if (!Boolean.TRUE.equals(booking.getCheckedIn())) {
                int noShowGrace = configService.getInt("no_show_grace_minutes", 30);
                if (startAt.plusMinutes(noShowGrace).isBefore(now)) {
                    markNoShowAndSave(booking);
                }
            }
            // Type 2: 已签到但超过结束时间 N 分钟仍未签退 → 违规（未按时签退）
            else if (booking.getEndTime() != null) {
                LocalTime endTime = LocalTime.parse(booking.getEndTime());
                LocalDateTime endAt = LocalDateTime.of(date, endTime);
                int checkoutGrace = configService.getInt("checkout_grace_minutes", 30);
                if (endAt.plusMinutes(checkoutGrace).isBefore(now)) {
                    markNoShowAndSave(booking);
                }
            }

            // Type 3: 预约即将开始（1小时内）→ 发送提醒通知（仅一次）
            if (!Boolean.TRUE.equals(booking.getReminderSent())
                    && !Boolean.TRUE.equals(booking.getCheckedIn())
                    && "ACTIVE".equals(booking.getStatus())) {
                LocalDateTime remindAt = startAt.minusHours(1);
                if (remindAt.isBefore(now) && startAt.isAfter(now)) {
                    booking.setReminderSent(true);
                    bookingRepository.save(booking);
                    if (booking.getUserId() != null) {
                        Optional<Room> roomOpt = roomRepository.findById(booking.getRoomId());
                        String roomName = roomOpt.map(Room::getName).orElse("自习室");
                        notificationService.createNotification(booking.getUserId(), "BOOKING_REMINDER", "预约即将开始",
                            "您的预约 " + booking.getBookingDate() + " " + booking.getStartTime() + "-" + booking.getEndTime()
                            + " 即将开始（" + roomName + " · " + (booking.getSeatNo() == null ? "" : booking.getSeatNo()) + "），请及时签到。");
                    }
                }
            }
        }
    }

    private void markNoShowAndSave(Booking booking) {
        booking.setStatus("NO_SHOW");
        booking.setReleased(true);
        bookingRepository.save(booking);
        if (booking.getUserId() != null) {
            userAccountRepository.findById(booking.getUserId()).ifPresent(user -> {
                user.setViolationCount(user.getViolationCount() + 1);
                int threshold = configService.getInt("violation_blacklist_threshold", 3);
                if (user.getViolationCount() >= threshold) {
                    user.setBlacklisted(true);
                }
                userAccountRepository.save(user);
                // 发送违规通知
                String reason = Boolean.TRUE.equals(booking.getCheckedIn()) ? "未按时签退" : "未按时签到";
                notificationService.createNotification(user.getId(), "VIOLATION_WARNING", "违规记录",
                    "您因" + reason + "已被记录违规（" + booking.getBookingDate() + " " + booking.getStartTime() + "-" + booking.getEndTime()
                    + "），当前违规次数：" + user.getViolationCount() + "次");
            });
        }
    }

    private void validateBookingTime(Booking booking) {
        if (booking.getBookingDate() == null || booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new RuntimeException("请选择预约日期和起止时间");
        }
        LocalDate bookingDate = LocalDate.parse(booking.getBookingDate());
        LocalTime startTime = LocalTime.parse(booking.getStartTime());
        LocalTime endTime = LocalTime.parse(booking.getEndTime());
        if (!endTime.isAfter(startTime)) {
            throw new RuntimeException("结束时间必须晚于开始时间");
        }
        if (bookingDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("不能预约过去日期");
        }
    }

}
