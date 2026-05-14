package iuh.labbooking.repository;

import iuh.labbooking.model.LecturerProfile;
import iuh.labbooking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LecturerProfileRepository extends JpaRepository<LecturerProfile, Long> {
    Optional<LecturerProfile> findByUser(User user);
}
