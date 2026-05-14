package iuh.labbooking.repository;

import iuh.labbooking.enums.GroupType;
import iuh.labbooking.model.ResearchGroup;
import iuh.labbooking.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResearchGroupRepository extends JpaRepository<ResearchGroup, Long> {
        List<ResearchGroup> findByCreator_UserId(Long userId);

        Optional<ResearchGroup> findByGroupName(String groupName);

        @Query("""
                            SELECT rg FROM ResearchGroup rg
                            WHERE (:keyword IS NULL
                                OR LOWER(rg.groupName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
                                OR EXISTS (SELECT 1 FROM rg.members leader WHERE leader.role = LEADER AND LOWER(leader.user.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))))
                            AND (:type IS NULL OR rg.groupType = :type)
                            AND (:leaderId IS NULL OR EXISTS (SELECT 1 FROM rg.members leader WHERE leader.role = 'LEADER' AND leader.user.userId = :leaderId))
                            AND (rg.isPrivate = false)
                            AND NOT EXISTS (SELECT 1
                                            FROM rg.members m
                                            WHERE m.user.userId = :currentUserId)
                            AND (rg.active = true)
                            ORDER BY rg.createdAt DESC, rg.researchGroupId DESC
                        """)
        Page<ResearchGroup> filterOtherResearchGroups(
                        Pageable pageable,
                        @Param("keyword") String keyword,
                        @Param("type") GroupType type,
                        @Param("leaderId") Long leaderId,
                        @Param("currentUserId") Long currentUserId);

        @Query("""
                            SELECT rg FROM ResearchGroup rg
                            WHERE (:keyword IS NULL
                                OR LOWER(rg.groupName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
                                OR EXISTS (SELECT 1 FROM rg.members leader WHERE leader.role = LEADER AND LOWER(leader.user.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))))
                            AND (:type IS NULL OR rg.groupType = :type)
                            AND (:leaderId IS NULL OR EXISTS (SELECT 1 FROM rg.members leader WHERE leader.role = LEADER AND leader.user.userId = :leaderId))
                            AND (:isPrivate IS NULL OR rg.isPrivate = :isPrivate)
                            AND (rg.active = true)
                            AND EXISTS (
                                SELECT 1 FROM rg.members m
                                WHERE m.user.userId = :currentUserId
                            )
                            ORDER BY rg.createdAt DESC, rg.researchGroupId DESC
                        """)
        Page<ResearchGroup> filterMyResearchGroups(
                        Pageable pageable,
                        @Param("keyword") String keyword,
                        @Param("type") GroupType type,
                        @Param("leaderId") Long leaderId,
                        @Param("isPrivate") Boolean isPrivate,
                        @Param("currentUserId") Long currentUserId);

        @Query("""
                            SELECT rg FROM ResearchGroup rg
                            WHERE (:keyword IS NULL
                                OR LOWER(rg.groupName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
                                OR EXISTS (SELECT 1 FROM rg.members leader WHERE leader.role = LEADER AND LOWER(leader.user.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))))
                            AND (:type IS NULL OR rg.groupType = :type)
                            AND (:isPrivate IS NULL OR rg.isPrivate = :isPrivate)
                            AND (:leaderId IS NULL OR EXISTS (SELECT 1 FROM rg.members leader WHERE leader.role = LEADER AND leader.user.userId = :leaderId))
                            AND (rg.active = true)
                            ORDER BY rg.createdAt DESC, rg.researchGroupId DESC
                        """)
        Page<ResearchGroup> filterAllResearchGroupsByKeywordAndGroupType(
                        Pageable pageable,
                        @Param("keyword") String keyword,
                        @Param("type") GroupType type,
                        @Param("isPrivate") Boolean isPrivate,
                        @Param("leaderId") Long leaderId);

        @Query("""
                        SELECT DISTINCT m.user
                        FROM ResearchGroup rg
                        JOIN rg.members m
                        WHERE rg.active = true
                        AND rg.isPrivate = false
                        AND m.role = 'LEADER'
                        AND (:keyword IS NULL OR LOWER(m.user.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
                        AND (m.user.userId <> :currentUserId)
                        AND NOT EXISTS (SELECT 1
                                        FROM rg.members mem
                                        WHERE mem.user.userId = :currentUserId)
                        ORDER BY m.user.fullName ASC
                        """)
        Page<User> filterOtherGroupLeaders(Pageable pageable, @Param("keyword") String keyword,
                        @Param("currentUserId") Long currentUserId);

        @Query("""
                        SELECT DISTINCT m.user
                        FROM ResearchGroup rg
                        JOIN rg.members m
                        WHERE rg.active = true
                        AND m.role = 'LEADER'
                        AND (:keyword IS NULL OR LOWER(m.user.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
                        AND EXISTS (SELECT 1 FROM rg.members mem WHERE mem.user.userId = :currentUserId)
                        ORDER BY m.user.fullName ASC
                        """)
        Page<User> filterMyGroupLeaders(Pageable pageable, @Param("keyword") String keyword,
                        @Param("currentUserId") Long currentUserId);

        @Query("""
                        SELECT DISTINCT m.user
                        FROM ResearchGroup rg
                        JOIN rg.members m
                        WHERE rg.active = true
                        AND m.role = 'LEADER'
                        AND (:keyword IS NULL OR LOWER(m.user.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
                        ORDER BY m.user.fullName ASC
                        """)
        Page<User> filterAllGroupLeaders(Pageable pageable, @Param("keyword") String keyword);

        @Query("""
                        SELECT rg FROM ResearchGroup rg
                        WHERE (rg.creator.userId = :userId
                            OR EXISTS (SELECT 1 FROM rg.members m WHERE m.user.userId = :userId AND m.role IN ('LEADER', 'CO_LEADER')))
                        AND (:keyword IS NULL
                            OR LOWER(rg.groupName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
                            OR LOWER(rg.projectName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
                        AND (:type IS NULL OR rg.groupType = :type)
                        AND (:isPrivate IS NULL OR rg.isPrivate = :isPrivate)
                        AND (:active IS NULL OR rg.active = :active)
                        ORDER BY rg.createdAt DESC
                        """)
        Page<ResearchGroup> filterManagedResearchGroups(
                        Pageable pageable,
                        @Param("keyword") String keyword,
                        @Param("type") GroupType type,
                        @Param("isPrivate") Boolean isPrivate,
                        @Param("active") Boolean active,
                        @Param("userId") Long userId);

        @Query("""
                            SELECT rg FROM ResearchGroup rg
                            WHERE (:keyword IS NULL
                                OR LOWER(rg.groupName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
                                OR LOWER(rg.projectName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
                                OR LOWER(rg.creator.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
                            AND (:type IS NULL OR rg.groupType = :type)
                            AND (:active IS NULL OR rg.active = :active)
                            AND (:isPrivate IS NULL OR rg.isPrivate = :isPrivate)
                            ORDER BY rg.createdAt DESC
                        """)
        Page<ResearchGroup> filterAllResearchGroups(
                        Pageable pageable,
                        @Param("keyword") String keyword,
                        @Param("type") GroupType type,
                        @Param("active") Boolean active,
                        @Param("isPrivate") Boolean isPrivate);

        @Query("""
            SELECT COUNT(rg) FROM ResearchGroup rg
            WHERE (rg.creator.userId = :userId 
               OR EXISTS (SELECT 1 FROM rg.members m WHERE m.user.userId = :userId AND m.role IN ('LEADER', 'CO_LEADER')))
            AND rg.active = true
        """)
        long countManagedGroups(@Param("userId") Long userId);
}
