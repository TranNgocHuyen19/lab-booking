package iuh.labbooking.dto.response.statistics;

import iuh.labbooking.enums.RequestStatus;
import lombok.Builder;

@Builder
public record BookingOutcomeResponse(
        RequestStatus status,
        long count,
        double percentage
) {
}
