package rw.auca.studyroom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.auca.studyroom.model.Room;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
}
