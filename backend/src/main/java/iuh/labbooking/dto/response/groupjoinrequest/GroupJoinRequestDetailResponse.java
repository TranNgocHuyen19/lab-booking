package iuh.labbooking.dto.response.groupjoinrequest;

import iuh.labbooking.dto.response.user.LecturerBriefInfoResponse;
import iuh.labbooking.dto.response.user.UserBriefInfoResponse;
import java.time.LocalDateTime;

public record GroupJoinRequestDetailResponse(
        Long requestId,
        UserBriefInfoResponse user,
        Long researchGroupId,
        String groupName,
        String projectName,
        String status,
        String message,
        String responseNote,
        LocalDateTime responseDate,
        LocalDateTime createdAt,
        LecturerBriefInfoResponse responseBy) {
}
