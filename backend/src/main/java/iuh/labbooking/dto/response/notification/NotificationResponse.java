package iuh.labbooking.dto.response.notification;

import iuh.labbooking.enums.NotificationType;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record NotificationResponse(
        Long notificationId,
        NotificationType type,
        String title,
        String message,
        Long relatedBookingRequestId,
        Long relatedParticipantId,
        Long relatedUserId,
        String metadata,
        boolean read,
        LocalDateTime createdAt,
        LocalDateTime readAt
) {
}
