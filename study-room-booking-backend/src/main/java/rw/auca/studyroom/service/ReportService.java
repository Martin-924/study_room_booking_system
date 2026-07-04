package rw.auca.studyroom.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rw.auca.studyroom.model.Booking;
import rw.auca.studyroom.model.Room;
import rw.auca.studyroom.model.UserRole;
import rw.auca.studyroom.repository.BookingRepository;
import rw.auca.studyroom.repository.RoomRepository;
import rw.auca.studyroom.repository.SeatRepository;
import rw.auca.studyroom.repository.UserAccountRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingService bookingService;

    public Map<String, Object> getOverview() {
        bookingService.releaseExpiredBookings();
        long roomCount = roomRepository.count();
        long seatCount = seatRepository.count();
        long activeBookings = bookingRepository.findByStatus("ACTIVE").size();

        Map<String, Object> result = new HashMap<>();
        result.put("studentCount", userAccountRepository.findByRole(UserRole.STUDENT).size());
        result.put("adminCount", userAccountRepository.findByRole(UserRole.ADMIN).size());
        result.put("roomCount", roomCount);
        result.put("seatCount", seatCount);
        result.put("activeBookings", activeBookings);
        result.put("totalBookings", bookingRepository.count());
        result.put("occupancyRate", seatCount == 0 ? 0 : Math.round(activeBookings * 10000.0 / seatCount) / 100.0);
        return result;
    }

    public List<Map<String, Object>> getRoomUsage(String date) {
        bookingService.releaseExpiredBookings();
        String targetDate = date == null || date.isBlank() ? LocalDate.now().toString() : date;
        List<Map<String, Object>> result = new ArrayList<>();
        for (Room room : roomRepository.findAll()) {
            long seatCount = seatRepository.countByRoomIdAndEnabledTrue(room.getId());
            // 统计当日所有预约（不含已取消的）用于计算使用率
            List<Booking> dayBookings = bookingRepository.findByRoomIdAndBookingDate(room.getId(), targetDate);
            long active = 0;
            for (Booking b : dayBookings) {
                if (!"CANCELLED".equals(b.getStatus())) {
                    active++;
                }
            }
            Map<String, Object> item = new HashMap<>();
            item.put("roomId", room.getId());
            item.put("roomName", room.getName());
            item.put("buildingName", room.getBuildingName());
            item.put("floorNumber", room.getFloorNumber());
            item.put("seatCount", seatCount);
            item.put("activeCount", active);
            item.put("usageRate", seatCount == 0 ? 0 : Math.round(active * 10000.0 / seatCount) / 100.0);
            result.add(item);
        }
        return result;
    }

    public List<Map<String, Object>> getTimeSlotStats(String date) {
        bookingService.releaseExpiredBookings();
        String targetDate = date == null || date.isBlank() ? LocalDate.now().toString() : date;
        List<Booking> bookings = bookingRepository.findAll();

        // 按小时统计预约数（08:00 ~ 22:00）
        Map<Integer, Integer> hourCount = new HashMap<>();
        for (int h = 8; h <= 22; h++) {
            hourCount.put(h, 0);
        }
        for (Booking booking : bookings) {
            if (targetDate.equals(booking.getBookingDate()) && booking.getStartTime() != null) {
                try {
                    LocalTime st = LocalTime.parse(booking.getStartTime());
                    int h = st.getHour();
                    hourCount.put(h, hourCount.getOrDefault(h, 0) + 1);
                } catch (Exception ignored) {}
            }
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (int h = 8; h <= 22; h++) {
            Map<String, Object> item = new HashMap<>();
            item.put("hour", h);
            item.put("label", String.format("%02d:00", h));
            item.put("count", hourCount.getOrDefault(h, 0));
            result.add(item);
        }
        return result;
    }

    public Map<String, Object> getNoShowStats() {
        bookingService.releaseExpiredBookings();
        List<Booking> noShows = bookingRepository.findByStatus("NO_SHOW");
        int type1 = 0; // 未签到
        int type2 = 0; // 签到了但未签退
        for (Booking b : noShows) {
            if (Boolean.TRUE.equals(b.getCheckedIn())) {
                type2++;
            } else {
                type1++;
            }
        }
        Map<String, Object> result = new HashMap<>();
        result.put("total", noShows.size());
        result.put("noCheckIn", type1);
        result.put("noCheckOut", type2);
        return result;
    }
}
