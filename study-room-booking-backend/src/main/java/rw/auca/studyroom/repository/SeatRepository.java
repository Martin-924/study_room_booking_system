package rw.auca.studyroom.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.auca.studyroom.model.Seat;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SeatRepository extends JpaRepository<Seat, UUID> {
    List<Seat> findByRoomIdOrderByRowIndexAscColumnIndexAsc(UUID roomId);
    Optional<Seat> findByRoomIdAndRowIndexAndColumnIndex(UUID roomId, Integer rowIndex, Integer columnIndex);
    long countByRoomIdAndEnabledTrue(UUID roomId);
}
