package iuh.labbooking.dto.response.researchgroup;

import iuh.labbooking.enums.GroupType;

public record ResearchGroupResponse(
                Long researchGroupId,
                String groupName,
                String description,
                GroupType groupType,
                String projectName,
                String leaderName,
                boolean isPrivate,
                String status,
                int memberCount,
                String requestStatus,
                String memberRole,
                Long requestId) {
}
