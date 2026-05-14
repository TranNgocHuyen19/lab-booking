package iuh.labbooking.repository;

import iuh.labbooking.model.SystemConfigHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemConfigHistoryRepository extends JpaRepository<SystemConfigHistory, Long> {

    List<SystemConfigHistory> findByConfigKeyOrderByCreatedAtDesc(String configKey);

    List<SystemConfigHistory> findByCategoryOrderByCreatedAtDesc(String category);

    List<SystemConfigHistory> findTop50ByOrderByCreatedAtDesc();
}
