package iuh.labbooking.dto.response.researchgroup;

import iuh.labbooking.enums.GroupType;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

public record SecureResearchGroupResponse(
        Long researchGroupId,
        String groupName,
        String description,
        String projectName,
        GroupType groupType,
        String status,
        boolean isPrivate,

        Long leaderId,
        String leaderName,

        List<MemberInfoResponse> members,

        LocalDateTime createdAt,
        String createdBy,
        LocalDateTime modifiedAt,
        String modifiedBy,
        boolean active,
        long pendingRequestsCount

) {
}
