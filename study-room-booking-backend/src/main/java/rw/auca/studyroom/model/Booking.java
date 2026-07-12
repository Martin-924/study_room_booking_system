package rw.auca.studyroom.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bookings")
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(nullable = false)
    private String studentName;
    
    @Column(nullable = false)
    private String studentId;

    private UUID userId;

    private String username;
    
    @Column(nullable = false)
    private UUID roomId;

    private UUID seatId;

    private String seatNo;
    
    @Column(nullable = false)
    private String bookingDate;

    private String startTime;

    private String endTime;
    
    @Column(nullable = false)
    private Boolean released = false;

    @Column(nullable = false)
    private Boolean checkedIn = false;

    private Boolean reminderSent = false;

    @Column(nullable = false)
    private String status = "ACTIVE";

    private LocalDateTime createdAt = LocalDateTime.now();
    
    public Booking() {
    }
    
    public Booking(String studentName, String studentId, UUID roomId, String bookingDate, Boolean released) {
        this.studentName = studentName;
        this.studentId = studentId;
        this.roomId = roomId;
        this.bookingDate = bookingDate;
        this.released = released;
    }
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getStudentName() {
        return studentName;
    }
    
    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }
    
    public String getStudentId() {
        return studentId;
    }
    
    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
    
    public UUID getRoomId() {
        return roomId;
    }
    
    public void setRoomId(UUID roomId) {
        this.roomId = roomId;
    }

    public UUID getSeatId() {
        return seatId;
    }

    public void setSeatId(UUID seatId) {
        this.seatId = seatId;
    }

    public String getSeatNo() {
        return seatNo;
    }

    public void setSeatNo(String seatNo) {
        this.seatNo = seatNo;
    }
    
    public String getBookingDate() {
        return bookingDate;
    }
    
    public void setBookingDate(String bookingDate) {
        this.bookingDate = bookingDate;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
    
    public Boolean getReleased() {
        return released;
    }
    
    public void setReleased(Boolean released) {
        this.released = released;
    }

    public Boolean getCheckedIn() {
        return checkedIn;
    }

    public void setCheckedIn(Boolean checkedIn) {
        this.checkedIn = checkedIn;
    }

    public Boolean getReminderSent() {
        return reminderSent;
    }

    public void setReminderSent(Boolean reminderSent) {
        this.reminderSent = reminderSent;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
