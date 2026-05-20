package iuh.labbooking.dto.response.booking;

import iuh.labbooking.dto.response.bookingdevice.BookingDeviceResponse;
import iuh.labbooking.dto.response.slot.SlotResponse;
import iuh.labbooking.dto.response.user.UserSummaryResponse;
import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.RequestStatus;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Builder
public record BookingResponse(
        Long bookingRequestId,
        String purpose,
        BookingType bookingType,
        RequestStatus status,
        LocalDate bookingDate,

        Long labRoomId,
        String roomName,
        String building,
        Integer roomCapacity,

        List<SlotResponse> slots,
        Integer participantCount,
        List<BookingDeviceResponse> devices,

        Long requesterId,
        String requesterName,
        String requesterUsername,
        Boolean isCreator,
        String responseNote,
        LocalDateTime responseDate,
        UserSummaryResponse responseBy,
        List<Long> researchGroupIds,
        Boolean isAllowedEditing,
        LocalDateTime createdAt,
        List<BookingParticipantResponse> participants,
        List<BookingWarning> warnings,
        List<ParticipantConflictResponse> participantConflicts,
        List<ExistingScheduleConflictResponse> existingScheduleConflicts) {
}
