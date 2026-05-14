package iuh.labbooking.dto.response.statistics;

import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.RequestStatus;
import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record BookingAuditLogResponse(
        Long bookingId,
        String requesterName,
        String requesterMssv,
        String requesterAvatar,
        BookingType bookingType,
        LocalDateTime submitTime,
        LocalDateTime processTime,
        Long processingTimeMinutes,
        RequestStatus status
) {
}
