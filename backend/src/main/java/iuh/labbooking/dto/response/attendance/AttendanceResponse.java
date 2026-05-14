package iuh.labbooking.dto.response.attendance;

import iuh.labbooking.enums.CheckinStatus;
import iuh.labbooking.enums.CheckoutStatus;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record AttendanceResponse(

        Long attendanceId,

        String userName,
        String userFullName,

        CheckinStatus checkinStatus,
        Integer lateCheckinMinutes,
        String checkinNote,
        LocalDateTime checkinAt,

        CheckoutStatus checkoutStatus,
        Integer earlyCheckoutMinutes,
        Integer lateCheckoutMinutes,
        String checkoutNote,
        LocalDateTime checkoutAt
) {}
