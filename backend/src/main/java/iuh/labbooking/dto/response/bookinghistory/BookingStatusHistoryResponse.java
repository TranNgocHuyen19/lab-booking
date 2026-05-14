package iuh.labbooking.dto.response.bookinghistory;

import iuh.labbooking.dto.response.user.UserSummaryResponse;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.enums.StatusChangeReason;
import lombok.Builder;
import lombok.With;

import java.time.LocalDateTime;

@Builder
@With
public record BookingStatusHistoryResponse(
        Long id,
        RequestStatus fromStatus,
        RequestStatus toStatus,
        StatusChangeReason changeReason,
        String note,
        Long relatedBookingRequestId,
        LocalDateTime createdAt,
        UserSummaryResponse createdBy
) {
}
