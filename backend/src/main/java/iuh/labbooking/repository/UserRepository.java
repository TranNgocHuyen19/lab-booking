package iuh.labbooking.repository;

import iuh.labbooking.model.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    List<User> findAllByUsernameIn(Collection<String> usernames);

    boolean existsByUsername(String username);

    boolean existsByIuhEmail(String iuhEmail);

    boolean existsByPersonalEmail(String personalEmail);

    Optional<User> findByPersonalEmail(String personalEmail);

    Optional<User> findByIuhEmail(String iuhEmail);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT u FROM User u WHERE u.userId = :userId")
        Optional<User> lockByUserId(@Param("userId") Long userId);

    @Query("SELECT u FROM User u WHERE " +
            "(:role IS NULL OR u.role.roleName = :role) AND " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.iuhEmail) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<User> filterUsers(@Param("keyword") String keyword, @Param("role") String role, Pageable pageable);

    @Query("SELECT u FROM User u WHERE " +
            "u.userId NOT IN (" +
            "    SELECT m.user.userId FROM GroupMembership m " +
            "    WHERE m.researchGroup.researchGroupId = :researchGroupId" +
            ") AND " +
            "u.userId NOT IN (" +
            "    SELECT rg.creator.userId FROM ResearchGroup rg " +
            "    WHERE rg.researchGroupId = :researchGroupId" +
            ") AND " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.iuhEmail) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY u.createdAt DESC")
    Page<User> filterUsersToInvite(Pageable pageable, @Param("researchGroupId") Long researchGroupId,
                                   @Param("keyword") String keyword);

    @Query("SELECT u FROM User u WHERE " +
            "(:role IS NULL OR u.role.roleName = :role) AND " +
            "(:active IS NULL OR u.active = :active) AND " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.personalEmail) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.iuhEmail) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<User> filterUsersAdmin(@Param("keyword") String keyword, @Param("role") String role,
                                @Param("active") Boolean active, Pageable pageable);
}
