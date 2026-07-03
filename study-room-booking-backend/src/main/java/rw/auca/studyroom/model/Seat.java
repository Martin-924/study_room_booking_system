package rw.auca.studyroom.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "seats")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID roomId;

    @Column(nullable = false)
    private String seatNo;

    @Column(nullable = false)
    private Integer rowIndex;

    @Column(nullable = false)
    private Integer columnIndex;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(nullable = false)
    private Boolean nearWindow = false;

    @Column(nullable = false)
    private Boolean powerSocket = false;

    public Seat() {
    }

    public Seat(UUID roomId, String seatNo, Integer rowIndex, Integer columnIndex) {
        this.roomId = roomId;
        this.seatNo = seatNo;
        this.rowIndex = rowIndex;
        this.columnIndex = columnIndex;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public void setRoomId(UUID roomId) {
        this.roomId = roomId;
    }

    public String getSeatNo() {
        return seatNo;
    }

    public void setSeatNo(String seatNo) {
        this.seatNo = seatNo;
    }

    public Integer getRowIndex() {
        return rowIndex;
    }

    public void setRowIndex(Integer rowIndex) {
        this.rowIndex = rowIndex;
    }

    public Integer getColumnIndex() {
        return columnIndex;
    }

    public void setColumnIndex(Integer columnIndex) {
        this.columnIndex = columnIndex;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public Boolean getNearWindow() {
        return nearWindow;
    }

    public void setNearWindow(Boolean nearWindow) {
        this.nearWindow = nearWindow;
    }

    public Boolean getPowerSocket() {
        return powerSocket;
    }

    public void setPowerSocket(Boolean powerSocket) {
        this.powerSocket = powerSocket;
    }
}
