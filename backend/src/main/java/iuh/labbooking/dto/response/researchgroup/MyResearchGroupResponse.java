package iuh.labbooking.dto.response.researchgroup;

import iuh.labbooking.dto.response.groupjoinrequest.GroupJoinRequestResponse;
import iuh.labbooking.enums.GroupType;

import java.util.List;

public record MyResearchGroupResponse(
		Long researchGroupId,
		String groupName,
		String description,
		GroupType groupType,
		String projectName,
		boolean isPrivate,
		String status,
		int memberCount,
		String memberRole,
		String requestStatus,
		Long requestId,
		List<MemberInfoResponse> leaders,
		List<MemberInfoResponse> members) {
}