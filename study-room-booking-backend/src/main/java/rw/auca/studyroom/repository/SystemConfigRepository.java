package rw.auca.studyroom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.auca.studyroom.model.SystemConfig;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {
}
