package rw.auca.studyroom.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "rooms")
public class Room {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(nullable = false)
    private String name;

    private UUID buildingId;

    private String buildingName;

    private String campus;

    private Integer floorNumber = 1;
    
    @Column(nullable = false)
    private Integer capacity;
    
    @Column(nullable = false)
    private String location;
    
    @Column(nullable = false)
    private Boolean available = true;

    private Integer rowCount = 4;

    private Integer columnCount = 6;

    private String openTime = "08:00";

    private String closeTime = "22:00";
    
    public Room() {
    }
    
    public Room(String name, Integer capacity, String location, Boolean available) {
        this.name = name;
        this.capacity = capacity;
        this.location = location;
        this.available = available;
    }

    public Room(String name, UUID buildingId, String buildingName, String campus, Integer floorNumber,
                Integer rowCount, Integer columnCount, String location) {
        this.name = name;
        this.buildingId = buildingId;
        this.buildingName = buildingName;
        this.campus = campus;
        this.floorNumber = floorNumber;
        this.rowCount = rowCount;
        this.columnCount = columnCount;
        this.capacity = rowCount * columnCount;
        this.location = location;
        this.available = true;
    }
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }

    public UUID getBuildingId() {
        return buildingId;
    }

    public void setBuildingId(UUID buildingId) {
        this.buildingId = buildingId;
    }

    public String getBuildingName() {
        return buildingName;
    }

    public void setBuildingName(String buildingName) {
        this.buildingName = buildingName;
    }

    public String getCampus() {
        return campus;
    }

    public void setCampus(String campus) {
        this.campus = campus;
    }

    public Integer getFloorNumber() {
        return floorNumber;
    }

    public void setFloorNumber(Integer floorNumber) {
        this.floorNumber = floorNumber;
    }
    
    public Integer getCapacity() {
        return capacity;
    }
    
    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public Boolean getAvailable() {
        return available;
    }
    
    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public Integer getRowCount() {
        return rowCount;
    }

    public void setRowCount(Integer rowCount) {
        this.rowCount = rowCount;
    }

    public Integer getColumnCount() {
        return columnCount;
    }

    public void setColumnCount(Integer columnCount) {
        this.columnCount = columnCount;
    }

    public String getOpenTime() {
        return openTime;
    }

    public void setOpenTime(String openTime) {
        this.openTime = openTime;
    }

    public String getCloseTime() {
        return closeTime;
    }

    public void setCloseTime(String closeTime) {
        this.closeTime = closeTime;
    }
}
