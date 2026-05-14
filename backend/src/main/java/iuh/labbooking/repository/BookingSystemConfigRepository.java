package iuh.labbooking.repository;

import iuh.labbooking.model.BookingSystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface BookingSystemConfigRepository extends JpaRepository<BookingSystemConfig, Long> {

    @Query("SELECT bc FROM BookingSystemConfig bc WHERE bc.active = true ORDER BY bc.createdAt DESC LIMIT 1")
    Optional<BookingSystemConfig> findActiveConfiguration();

    Optional<BookingSystemConfig> findFirstByActiveTrueOrderByCreatedAtDesc();
}
