package iuh.labbooking.repository;

import iuh.labbooking.model.AttendanceSystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface AttendanceSystemConfigRepository extends JpaRepository<AttendanceSystemConfig, Long> {

    @Query("SELECT ac FROM AttendanceSystemConfig ac WHERE ac.active = true ORDER BY ac.createdAt DESC LIMIT 1")
    Optional<AttendanceSystemConfig> findActiveConfiguration();

    Optional<AttendanceSystemConfig> findFirstByActiveTrueOrderByCreatedAtDesc();
}
