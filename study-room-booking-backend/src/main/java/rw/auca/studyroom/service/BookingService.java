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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

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
    
    public List<Booking> getAllBookings() {
        releaseExpiredBookings();
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByUser(UUID userId) {
        releaseExpiredBookings();
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public Booking createBooking(Booking booking) {
        return createBookingFromEntity(booking);
    }

    public Booking createBooking(Map<String, String> request) {
        Booking booking = new Booking();
        booking.setUserId(UUID.fromString(request.get("userId")));
        booking.setRoomId(UUID.fromString(request.get("roomId")));
        booking.setSeatId(UUID.fromString(request.get("seatId")));
        booking.setBookingDate(request.get("bookingDate"));
        booking.setStartTime(request.get("startTime"));
        booking.setEndTime(request.get("endTime"));
        return createBookingFromEntity(booking);
    }

    public Booking createBookingFromEntity(Booking booking) {
        releaseExpiredBookings();
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
            if (userBookings.size() >= 3) {
                throw new RuntimeException("单日最多预约 3 次");
            }
            
            List<Booking> existingBookings = bookingRepository.findBySeatIdAndBookingDateAndStatus(
                booking.getSeatId(), booking.getBookingDate(), "ACTIVE"
            );
            for (Booking existing : existingBookings) {
                if (timesOverlap(booking.getStartTime(), booking.getEndTime(), existing.getStartTime(), existing.getEndTime())) {
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
            return bookingRepository.save(booking);
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
        // 校验签到时间：仅限预约日期当天 + 时间段内（允许提前15分钟）
        LocalDate today = LocalDate.now();
        if (booking.getBookingDate() == null || !today.toString().equals(booking.getBookingDate())) {
            throw new RuntimeException("仅限预约当天签到");
        }
        if (booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new RuntimeException("预约时间不完整");
        }
        LocalTime now = LocalTime.now();
        LocalTime startTime = LocalTime.parse(booking.getStartTime());
        LocalTime endTime = LocalTime.parse(booking.getEndTime());
        LocalTime earliest = startTime.minusMinutes(15);
        if (now.isBefore(earliest)) {
            throw new RuntimeException("签到时间未到，请在预约开始时间前15分钟内签到");
        }
        if (!now.isBefore(endTime)) {
            throw new RuntimeException("预约时段已结束，无法签到");
        }
        booking.setCheckedIn(true);
        return bookingRepository.save(booking);
    }

    public Booking markNoShow(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("预约不存在"));
        markNoShowAndSave(booking);
        return booking;
    }

    public void releaseExpiredBookings() {
        List<Booking> activeBookings = bookingRepository.findByStatus("ACTIVE");
        LocalDateTime now = LocalDateTime.now();
        for (Booking booking : activeBookings) {
            if (Boolean.TRUE.equals(booking.getCheckedIn()) || booking.getBookingDate() == null || booking.getStartTime() == null) {
                continue;
            }
            LocalDateTime startAt = LocalDateTime.of(LocalDate.parse(booking.getBookingDate()), LocalTime.parse(booking.getStartTime()));
            if (startAt.plusMinutes(15).isBefore(now)) {
                markNoShowAndSave(booking);
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
                if (user.getViolationCount() >= 3) {
                    user.setBlacklisted(true);
                }
                userAccountRepository.save(user);
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

    private boolean timesOverlap(String startA, String endA, String startB, String endB) {
        if (startA == null || endA == null || startB == null || endB == null) {
            return false;
        }
        LocalTime aStart = LocalTime.parse(startA);
        LocalTime aEnd = LocalTime.parse(endA);
        LocalTime bStart = LocalTime.parse(startB);
        LocalTime bEnd = LocalTime.parse(endB);
        return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
    }
}
