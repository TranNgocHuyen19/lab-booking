package iuh.labbooking.dto.response.dashboard.lecturer;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UpcomingAgendaResponse(
    Long bookingId,
    String roomName,
    String slotName,
    String slotTime,
    String groupName,
    String bookingType,
    LocalDate bookingDate,
    String status
) {}
