package iuh.labbooking.dto.response.attendance;

import iuh.labbooking.enums.CheckinStatus;
import iuh.labbooking.enums.CheckoutStatus;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record AttendanceStatusResponse(

        boolean hasCheckedIn,
        boolean hasCheckedOut,
        boolean canCheckIn,
        boolean canCheckOut,

        CheckinStatus calculatedCheckinStatus,
        Integer calculatedLateCheckinMinutes,
        boolean needNoteForCheckIn,

        CheckoutStatus calculatedCheckoutStatus,
        Integer calculatedEarlyCheckoutMinutes,
        Integer calculatedLateCheckoutMinutes,
        boolean needNoteForCheckOut,

        LocalDateTime checkinAt,
        LocalDateTime checkoutAt,
        Integer actualLateCheckinMinutes,
        Integer actualEarlyCheckoutMinutes,
        Integer actualLateCheckoutMinutes,
        String checkinNote,
        String checkoutNote
) {}
