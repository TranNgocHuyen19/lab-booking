
package iuh.labbooking.repository;

import iuh.labbooking.model.GroupMembership;
import iuh.labbooking.model.GroupMembershipId;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMembershipRepository extends JpaRepository<GroupMembership, GroupMembershipId> {

    boolean existsByResearchGroup_ResearchGroupIdAndUser_UserId(Long researchGroupId, Long userId);

    boolean existsByResearchGroup_ResearchGroupIdAndUser_Username(Long researchGroupId, String username);

    Optional<GroupMembership> findByResearchGroup_ResearchGroupIdAndUser_UserId(Long researchGroupId, Long userId);

    @Query("SELECT COUNT(gm) > 0 FROM GroupMembership gm WHERE gm.researchGroup IN :groups AND gm.user.userId = :userId")
    boolean existsByResearchGroupInAndUser_UserId(
            @Param("groups") java.util.Set<iuh.labbooking.model.ResearchGroup> groups, @Param("userId") Long userId);

    List<GroupMembership> findByResearchGroup_ResearchGroupId(Long researchGroupId);

    Page<GroupMembership> findByResearchGroup_ResearchGroupId(Long researchGroupId, Pageable pageable);

    Optional<GroupMembership> findByResearchGroup_ResearchGroupIdAndUser_Username(Long researchGroupId,
            @NotNull(message = "Username is required") String username);

    @Query("SELECT gm FROM GroupMembership gm JOIN FETCH gm.user WHERE gm.researchGroup.researchGroupId IN :groupIds")
    List<GroupMembership> findAllByResearchGroupIdIn(@Param("groupIds") List<Long> groupIds);

    @Query("""
        SELECT COUNT(DISTINCT gm.user.userId) FROM GroupMembership gm
        JOIN gm.researchGroup rg
        WHERE (rg.creator.userId = :userId 
           OR EXISTS (SELECT 1 FROM rg.members m WHERE m.user.userId = :userId AND m.role IN ('LEADER', 'CO_LEADER')))
        AND gm.user.userId <> :userId
    """)
    long countStudentsInManagedGroups(@Param("userId") Long userId);
}
