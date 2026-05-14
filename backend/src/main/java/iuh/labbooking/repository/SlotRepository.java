package iuh.labbooking.repository;

import iuh.labbooking.model.Slot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {
    boolean existsBySlotName(String slotName);

    boolean existsBySlotNameAndSlotIdNot(String slotName, Long slotId);

    @Query("SELECT s FROM Slot s WHERE s.active = true AND " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(s.slotName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY s.slotName ASC")
    Page<Slot> findSlotsByKeywordAndActiveTrue(String keyword, Pageable pageable);

    long countBySlotIdIn(List<Long> slotIds);

    @Query("SELECT s FROM Slot s WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(s.slotName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:active IS NULL OR s.active = :active) " +
            "ORDER BY s.createdAt DESC")
    Page<Slot> filterSlots(Pageable pageable,
                           @Param("keyword") String keyword,
                           @Param("active") Boolean active);
    @Modifying
    @Query("UPDATE Slot s SET s.active = :active WHERE s.slotId IN :ids")
    void updateActiveStatus(List<Long> ids, boolean active);
}
