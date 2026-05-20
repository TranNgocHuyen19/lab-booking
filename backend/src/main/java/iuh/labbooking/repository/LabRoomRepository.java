package iuh.labbooking.repository;

import iuh.labbooking.model.LabRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabRoomRepository extends JpaRepository<LabRoom, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints({ @QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000") })
    @Query("SELECT lr FROM LabRoom lr WHERE lr.labRoomId = :id")
    Optional<LabRoom> lockByLabRoomId(@Param("id") Long id);

    Optional<LabRoom> findByRoomName(String roomName);

    boolean existsByRoomName(String roomName);

    boolean existsByRoomNameAndLabRoomIdNot(String roomName, Long labRoomId);

    @Query("SELECT lr FROM LabRoom lr WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(lr.roomName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(lr.building) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:active IS NULL OR lr.active = :active) " +
            "ORDER BY lr.createdAt DESC")
    Page<LabRoom> filterLabRooms(Pageable pageable,
                                 @Param("keyword") String keyword,
                                 @Param("active") Boolean active);

    @Modifying
    @Query("UPDATE LabRoom lr SET lr.active = :active WHERE lr.labRoomId IN :ids")
    void updateActiveStatus(@Param("ids") List<Long> ids,
                            @Param("active") boolean active);
}
