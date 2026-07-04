package rw.auca.studyroom.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rw.auca.studyroom.model.Booking;
import rw.auca.studyroom.model.Building;
import rw.auca.studyroom.model.Room;
import rw.auca.studyroom.model.Seat;
import rw.auca.studyroom.repository.BookingRepository;
import rw.auca.studyroom.repository.BuildingRepository;
import rw.auca.studyroom.repository.RoomRepository;
import rw.auca.studyroom.repository.SeatRepository;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class RoomService {
    
    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private BookingRepository bookingRepository;
    
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }
    
    public Optional<Room> getRoomById(UUID id) {
        return roomRepository.findById(id);
    }
    
    public Room createRoom(Room room) {
        normalizeRoom(room);
        Room savedRoom = roomRepository.save(room);
        syncSeats(savedRoom);
        return savedRoom;
    }
    
    public Room updateRoom(UUID id, Room roomDetails) {
        Optional<Room> roomOptional = roomRepository.findById(id);
        if (roomOptional.isPresent()) {
            Room room = roomOptional.get();
            room.setName(roomDetails.getName());
            room.setCapacity(roomDetails.getCapacity());
            room.setLocation(roomDetails.getLocation());
            room.setAvailable(roomDetails.getAvailable());
            room.setBuildingId(roomDetails.getBuildingId());
            room.setBuildingName(roomDetails.getBuildingName());
            room.setCampus(roomDetails.getCampus());
            room.setFloorNumber(roomDetails.getFloorNumber());
            room.setRowCount(roomDetails.getRowCount());
            room.setColumnCount(roomDetails.getColumnCount());
            room.setOpenTime(roomDetails.getOpenTime());
            room.setCloseTime(roomDetails.getCloseTime());
            normalizeRoom(room);
            Room savedRoom = roomRepository.save(room);
            syncSeats(savedRoom);
            return savedRoom;
        }
        return null;
    }
    
    public boolean deleteRoom(UUID id) {
        if (roomRepository.existsById(id)) {
            roomRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Map<String, Object> getSeatMap(UUID roomId, String bookingDate, String startTime, String endTime) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("自习室不存在"));
        syncSeats(room);
        List<Seat> seats = seatRepository.findByRoomIdOrderByRowIndexAscColumnIndexAsc(roomId);
        List<Booking> activeBookings = bookingRepository.findByRoomIdAndBookingDateAndStatus(roomId, bookingDate, "ACTIVE");

        List<Map<String, Object>> seatViews = new ArrayList<>();
        int occupied = 0;
        for (Seat seat : seats) {
            Map<String, Object> view = new HashMap<>();
            view.put("id", seat.getId());
            view.put("seatNo", seat.getSeatNo());
            view.put("rowIndex", seat.getRowIndex());
            view.put("columnIndex", seat.getColumnIndex());
            view.put("enabled", seat.getEnabled());
            view.put("nearWindow", seat.getNearWindow());
            view.put("powerSocket", seat.getPowerSocket());

            String status = Boolean.TRUE.equals(seat.getEnabled()) ? "AVAILABLE" : "DISABLED";
            for (Booking booking : activeBookings) {
                if (seat.getId().equals(booking.getSeatId()) && timesOverlap(startTime, endTime, booking.getStartTime(), booking.getEndTime())) {
                    status = "OCCUPIED";
                    view.put("bookingId", booking.getId());
                    view.put("studentName", booking.getStudentName());
                    occupied++;
                    break;
                }
            }
            view.put("status", status);
            seatViews.add(view);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("room", room);
        result.put("rowCount", room.getRowCount());
        result.put("columnCount", room.getColumnCount());
        result.put("seats", seatViews);
        result.put("occupiedCount", occupied);
        result.put("availableCount", Math.max(0, seats.size() - occupied));
        return result;
    }

    public List<Map<String, Object>> getAllSeats(UUID roomId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("自习室不存在"));
        List<Seat> seats = seatRepository.findByRoomIdOrderByRowIndexAscColumnIndexAsc(roomId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Seat seat : seats) {
            Map<String, Object> view = new HashMap<>();
            view.put("id", seat.getId());
            view.put("seatNo", seat.getSeatNo());
            view.put("rowIndex", seat.getRowIndex());
            view.put("columnIndex", seat.getColumnIndex());
            view.put("enabled", seat.getEnabled());
            view.put("nearWindow", seat.getNearWindow());
            view.put("powerSocket", seat.getPowerSocket());
            result.add(view);
        }
        return result;
    }

    public Map<String, Object> updateSeat(UUID roomId, UUID seatId, Map<String, Object> body) {
        Seat seat = seatRepository.findById(seatId)
            .orElseThrow(() -> new RuntimeException("座位不存在"));
        if (!seat.getRoomId().equals(roomId)) {
            throw new RuntimeException("座位不属于该自习室");
        }
        if (body.containsKey("enabled")) {
            seat.setEnabled((Boolean) body.get("enabled"));
        }
        if (body.containsKey("nearWindow")) {
            seat.setNearWindow((Boolean) body.get("nearWindow"));
        }
        if (body.containsKey("powerSocket")) {
            seat.setPowerSocket((Boolean) body.get("powerSocket"));
        }
        seatRepository.save(seat);
        Map<String, Object> view = new HashMap<>();
        view.put("id", seat.getId());
        view.put("seatNo", seat.getSeatNo());
        view.put("enabled", seat.getEnabled());
        return view;
    }

    public void syncSeats(Room room) {
        int rows = room.getRowCount() == null || room.getRowCount() < 1 ? 1 : room.getRowCount();
        int columns = room.getColumnCount() == null || room.getColumnCount() < 1 ? 1 : room.getColumnCount();
        for (int row = 1; row <= rows; row++) {
            for (int column = 1; column <= columns; column++) {
                Optional<Seat> existing = seatRepository.findByRoomIdAndRowIndexAndColumnIndex(room.getId(), row, column);
                if (existing.isEmpty()) {
                    Seat seat = new Seat(room.getId(), String.format("%02d-%02d", row, column), row, column);
                    seat.setNearWindow(column == 1 || column == columns);
                    seat.setPowerSocket(row % 2 == 0);
                    seatRepository.save(seat);
                } else {
                    Seat seat = existing.get();
                    seat.setSeatNo(String.format("%02d-%02d", row, column));
                    seatRepository.save(seat);
                }
            }
        }

        List<Seat> seats = seatRepository.findByRoomIdOrderByRowIndexAscColumnIndexAsc(room.getId());
        for (Seat seat : seats) {
            if (seat.getRowIndex() > rows || seat.getColumnIndex() > columns) {
                seat.setEnabled(false);
                seatRepository.save(seat);
            }
        }
    }

    private void normalizeRoom(Room room) {
        if (room.getRowCount() == null || room.getRowCount() < 1) {
            room.setRowCount(4);
        }
        if (room.getColumnCount() == null || room.getColumnCount() < 1) {
            room.setColumnCount(6);
        }
        if (room.getCapacity() == null || room.getCapacity() < 1) {
            room.setCapacity(room.getRowCount() * room.getColumnCount());
        }
        if (room.getAvailable() == null) {
            room.setAvailable(true);
        }
        if (room.getOpenTime() == null || room.getOpenTime().isBlank()) {
            room.setOpenTime("08:00");
        }
        if (room.getCloseTime() == null || room.getCloseTime().isBlank()) {
            room.setCloseTime("22:00");
        }
        if (room.getBuildingId() != null) {
            Optional<Building> building = buildingRepository.findById(room.getBuildingId());
            if (building.isPresent()) {
                room.setBuildingName(building.get().getName());
                room.setCampus(building.get().getCampus());
            }
        }
        if (room.getFloorNumber() == null) {
            room.setFloorNumber(1);
        }
        if (room.getLocation() == null || room.getLocation().isBlank()) {
            String buildingName = room.getBuildingName() == null ? "未分配楼栋" : room.getBuildingName();
            room.setLocation((room.getCampus() == null ? "主校区" : room.getCampus()) + " / " + buildingName + " / " + room.getFloorNumber() + "层");
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
