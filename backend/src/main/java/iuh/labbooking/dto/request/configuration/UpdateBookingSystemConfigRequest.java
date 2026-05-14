package iuh.labbooking.dto.request.configuration;

public record UpdateBookingSystemConfigRequest(
        Integer studentAdvanceDays,
        Integer lecturerAdvanceDays,
        Integer adminAdvanceDays,
        Integer minMinutesBeforeStartToCancel,
        Integer minMinutesBeforeStartToApprove,
        Integer studentMinMinutesToBook,
        Integer lecturerMinMinutesToBook,
        String reason
) {
}
