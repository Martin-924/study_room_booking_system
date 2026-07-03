package rw.auca.studyroom.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rw.auca.studyroom.model.Building;
import rw.auca.studyroom.repository.BuildingRepository;

import java.util.List;
import java.util.UUID;

@Service
public class BuildingService {

    @Autowired
    private BuildingRepository buildingRepository;

    public List<Building> getAllBuildings() {
        return buildingRepository.findAll();
    }

    public Building createBuilding(Building building) {
        if (building.getCampus() == null || building.getCampus().isBlank()) {
            building.setCampus("主校区");
        }
        if (building.getFloorCount() == null || building.getFloorCount() < 1) {
            building.setFloorCount(1);
        }
        return buildingRepository.save(building);
    }

    public Building updateBuilding(UUID id, Building details) {
        Building building = buildingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("楼栋不存在"));
        building.setCampus(details.getCampus());
        building.setName(details.getName());
        building.setFloorCount(details.getFloorCount());
        building.setDescription(details.getDescription());
        return createBuilding(building);
    }

    public boolean deleteBuilding(UUID id) {
        if (!buildingRepository.existsById(id)) {
            return false;
        }
        buildingRepository.deleteById(id);
        return true;
    }
}
