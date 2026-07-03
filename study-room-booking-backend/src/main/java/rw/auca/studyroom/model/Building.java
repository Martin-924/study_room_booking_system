package rw.auca.studyroom.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "buildings")
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String campus;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer floorCount = 1;

    private String description;

    public Building() {
    }

    public Building(String campus, String name, Integer floorCount, String description) {
        this.campus = campus;
        this.name = name;
        this.floorCount = floorCount;
        this.description = description;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCampus() {
        return campus;
    }

    public void setCampus(String campus) {
        this.campus = campus;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getFloorCount() {
        return floorCount;
    }

    public void setFloorCount(Integer floorCount) {
        this.floorCount = floorCount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
