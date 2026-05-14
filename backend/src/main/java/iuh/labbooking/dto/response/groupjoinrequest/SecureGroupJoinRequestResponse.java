package iuh.labbooking.dto.response.groupjoinrequest;

import java.time.LocalDateTime;

public record SecureGroupJoinRequestResponse(
                Long requestId,
                Long userId,
                String username,
                String fullName,
                Long researchGroupId,
                String groupName,
                String status,
                String message,
                LocalDateTime createdAt,
                LocalDateTime modifiedAt,
                String modifiedBy,
                String responseNote,
                LocalDateTime responseDate,
                String responseByName,
                String leaderName) {
}
