package iuh.labbooking.dto.response.groupjoinrequest;

import java.time.LocalDateTime;

public record GroupJoinRequestResponse(
        Long requestId,
        Long userId,
        String username,
        String fullName,
        Long researchGroupId,
        String groupName,
        String status,
        String message,
        LocalDateTime responseDate,
        LocalDateTime createdAt) {
}
