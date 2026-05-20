package iuh.labbooking.mapper;

import iuh.labbooking.dto.response.notification.NotificationResponse;
import iuh.labbooking.model.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponse toResponse(Notification notification) {
        if (notification == null) {
            return null;
        }
        return NotificationResponse.builder()
                .notificationId(notification.getNotificationId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .relatedBookingRequestId(notification.getRelatedBookingRequestId())
                .relatedParticipantId(notification.getRelatedParticipantId())
                .relatedUserId(notification.getRelatedUserId())
                .metadata(notification.getMetadata())
                .read(notification.getReadAt() != null)
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}
