package iuh.labbooking.dto.response.booking;

import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Builder
public record SlotBookingDetailResponse(
        Long labRoomId,
        String roomName,
        String building,
        Integer roomCapacity,

        Long slotId,
        String slotName,
        LocalTime startTime,
        LocalTime endTime,

        LocalDate bookingDate,

        List<SlotBookingDetailItem> bookings,

        Integer totalApproved,
        Integer totalPending,
        Integer totalOccupants,
        Integer availableSeats
) {
}
