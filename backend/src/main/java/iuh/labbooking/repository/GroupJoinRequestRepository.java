package iuh.labbooking.repository;

import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.model.GroupJoinRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupJoinRequestRepository extends JpaRepository<GroupJoinRequest, Long> {

        boolean existsByResearchGroup_ResearchGroupIdAndUser_UserIdAndStatus(
                        Long researchGroupId, Long userId, RequestStatus status);

        Optional<GroupJoinRequest> findFirstByResearchGroup_ResearchGroupIdAndUser_UserIdOrderByCreatedAtDesc(
                        Long researchGroupId, Long userId);

        Page<GroupJoinRequest> findByUser_UserId(Long userId, Pageable pageable);

        Page<GroupJoinRequest> findByUser_UserIdAndStatus(Long userId, RequestStatus status, Pageable pageable);

        Page<GroupJoinRequest> findByResearchGroup_ResearchGroupId(Long groupId, Pageable pageable);

        Page<GroupJoinRequest> findByResearchGroup_ResearchGroupIdAndStatus(
                        Long groupId, RequestStatus status, Pageable pageable);

        @Query("SELECT gjr FROM GroupJoinRequest gjr JOIN gjr.researchGroup rg " +
                        "WHERE (rg.creator.userId = :userId OR EXISTS (SELECT 1 FROM rg.members m WHERE m.user.userId = :userId AND m.role IN ('LEADER', 'CO_LEADER'))) "
                        +
                        "AND (:status IS NULL OR gjr.status = :status) " +
                        "AND (:researchGroupId IS NULL OR rg.researchGroupId = :researchGroupId) " +
                        "AND (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR gjr.createdAt >= :fromDate) " +
                        "AND (CAST(:toDate AS java.time.LocalDateTime) IS NULL OR gjr.createdAt <= :toDate) " +
                        "AND (:keyword IS NULL OR LOWER(gjr.user.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) "
                        +
                        "OR LOWER(rg.groupName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) " +
                        "OR LOWER(rg.creator.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) " +
                        "OR LOWER(gjr.user.username) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))")
        Page<GroupJoinRequest> findJoinRequestsByLeaderWithFilters(
                        @Param("userId") Long userId,
                        @Param("status") RequestStatus status,
                        @Param("keyword") String keyword,
                        @Param("researchGroupId") Long researchGroupId,
                        @Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate,
                        Pageable pageable);

        @Query("SELECT gjr FROM GroupJoinRequest gjr JOIN gjr.researchGroup rg " +
                        "WHERE (:status IS NULL OR gjr.status = :status) " +
                        "AND (:researchGroupId IS NULL OR rg.researchGroupId = :researchGroupId) " +
                        "AND (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR gjr.createdAt >= :fromDate) " +
                        "AND (CAST(:toDate AS java.time.LocalDateTime) IS NULL OR gjr.createdAt <= :toDate) " +
                        "AND (:keyword IS NULL OR LOWER(gjr.user.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) "
                        +
                        "OR LOWER(rg.groupName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) " +
                        "OR LOWER(rg.creator.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) " +
                        "OR LOWER(gjr.user.username) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))")
        Page<GroupJoinRequest> findAllJoinRequestsWithFilters(
                        @Param("status") RequestStatus status,
                        @Param("keyword") String keyword,
                        @Param("researchGroupId") Long researchGroupId,
                        @Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate,
                        Pageable pageable);

        long countByResearchGroup_ResearchGroupIdAndStatus(Long groupId, RequestStatus status);

        @Query("SELECT gjr FROM GroupJoinRequest gjr WHERE gjr.researchGroup.researchGroupId IN :groupIds AND gjr.user.userId = :userId ORDER BY gjr.createdAt DESC")
        List<GroupJoinRequest> findByGroupIdsAndUserId(@Param("groupIds") List<Long> groupIds, @Param("userId") Long userId);

        @Query("SELECT gjr.researchGroup.researchGroupId, COUNT(gjr) FROM GroupJoinRequest gjr WHERE gjr.researchGroup.researchGroupId IN :groupIds AND gjr.status = :status GROUP BY gjr.researchGroup.researchGroupId")
        List<Object[]> countByGroupIdsAndStatus(@Param("groupIds") List<Long> groupIds, @Param("status") RequestStatus status);

        @Query("""
            SELECT COUNT(gjr) FROM GroupJoinRequest gjr
            JOIN gjr.researchGroup rg
            WHERE (rg.creator.userId = :userId 
               OR EXISTS (SELECT 1 FROM rg.members m WHERE m.user.userId = :userId AND m.role IN ('LEADER', 'CO_LEADER')))
            AND gjr.status = :status
        """)
        long countPendingJoinRequestsByLecturer(@Param("userId") Long userId, @Param("status") RequestStatus status);

        @Query("""
            SELECT gjr FROM GroupJoinRequest gjr
            JOIN gjr.researchGroup rg
            WHERE (rg.creator.userId = :userId 
               OR EXISTS (SELECT 1 FROM rg.members m WHERE m.user.userId = :userId AND m.role IN ('LEADER', 'CO_LEADER')))
            AND gjr.status = :status
            ORDER BY gjr.createdAt DESC
        """)
        List<GroupJoinRequest> findRecentJoinRequestsByLecturer(@Param("userId") Long userId, @Param("status") RequestStatus status, Pageable pageable);
}
