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
            long active = bookingRepository.findByRoomIdAndBookingDateAndStatus(room.getId(), targetDate, "ACTIVE").size();
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
        String[][] slots = {
            {"08:00", "10:00"},
            {"10:00", "12:00"},
            {"14:00", "16:00"},
            {"16:00", "18:00"},
            {"19:00", "21:00"}
        };
        List<Booking> bookings = bookingRepository.findByStatus("ACTIVE");
        List<Map<String, Object>> result = new ArrayList<>();
        for (String[] slot : slots) {
            int count = 0;
            for (Booking booking : bookings) {
                if (targetDate.equals(booking.getBookingDate()) && timesOverlap(slot[0], slot[1], booking.getStartTime(), booking.getEndTime())) {
                    count++;
                }
            }
            Map<String, Object> item = new HashMap<>();
            item.put("label", slot[0] + "-" + slot[1]);
            item.put("count", count);
            result.add(item);
        }
        return result;
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
