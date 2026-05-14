package iuh.labbooking.dto.response.booking;

import iuh.labbooking.dto.response.bookingdevice.BookingDeviceResponse;
import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.RequestStatus;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record SlotBookingDetailItem(
        Long bookingRequestId,
        String purpose,
        BookingType bookingType,
        RequestStatus status,
        Long requesterId,
        String requesterName,
        String requesterUsername,
        String groupName,
        String leaderName,
        String leaderUsername,
        Integer participantCount,
        List<BookingDeviceResponse> devices,
        String responseNote,
        LocalDateTime createdAt
) {
}
