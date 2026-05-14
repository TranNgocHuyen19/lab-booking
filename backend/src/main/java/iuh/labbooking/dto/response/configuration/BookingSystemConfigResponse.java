package iuh.labbooking.dto.response.configuration;

import java.time.LocalDateTime;

public record BookingSystemConfigResponse(
        Long bookingSystemConfigId,
        Integer studentAdvanceDays,
        Integer lecturerAdvanceDays,
        Integer adminAdvanceDays,
        Integer minMinutesBeforeStartToCancel,
        Integer minMinutesBeforeStartToApprove,
        Integer studentMinMinutesToBook,
        Integer lecturerMinMinutesToBook,
        LocalDateTime createdAt,
        String createdBy,
        LocalDateTime modifiedAt,
        String modifiedBy,
        Boolean active
) {
}
