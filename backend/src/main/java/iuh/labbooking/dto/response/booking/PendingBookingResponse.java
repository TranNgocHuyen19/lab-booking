package iuh.labbooking.dto.response.booking;

import iuh.labbooking.dto.response.slot.SlotResponse;
import iuh.labbooking.dto.response.user.UserSummaryResponse;
import iuh.labbooking.enums.BookingType;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
public record PendingBookingResponse(
        Long id,
        String room,
        SlotResponse slot,
        LocalDate bookingDate,
        LocalDateTime createdAt,
        BookingType type,
        String groupName,
        UserSummaryResponse requester
) {
}
