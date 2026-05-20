package iuh.labbooking.service.notification;

import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.notification.NotificationResponse;
import iuh.labbooking.dto.response.notification.UnreadNotificationCountResponse;
import iuh.labbooking.enums.RequestStatus;

import java.util.List;

public interface NotificationService {
    PageResponse<List<NotificationResponse>> getMyNotifications(int page, int limit);

    UnreadNotificationCountResponse getMyUnreadCount();

    void markAsRead(Long notificationId);

    void markAllAsRead();

    void handleBookingCreated(Long bookingRequestId, Long actorId);

    void handleBookingStatusChanged(Long bookingRequestId, RequestStatus newStatus, Long actorId);

    void handleParticipantConflictRequired(Long bookingRequestId, Long participantId, Long userId, Long actorId);

    void handleBookingCancelledByThesis(Long thesisBookingRequestId, List<Long> cancelledBookingRequestIds);

    void handleParticipantConflictResolved(Long bookingRequestId, Long participantId, Long userId);

    void handleThesisParticipantAdded(Long bookingRequestId, Long actorId, List<Long> addedParticipantIds);
}
