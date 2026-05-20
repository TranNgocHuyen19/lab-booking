package iuh.labbooking.repository;

import iuh.labbooking.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipient_UserIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    long countByRecipient_UserIdAndReadAtIsNull(Long recipientId);

    Optional<Notification> findByNotificationIdAndRecipient_UserId(Long notificationId, Long recipientId);

    boolean existsByEventKey(String eventKey);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Notification n SET n.readAt = :readAt WHERE n.recipient.userId = :recipientId AND n.readAt IS NULL")
    void markAllAsReadForUser(Long recipientId, java.time.LocalDateTime readAt);
}
