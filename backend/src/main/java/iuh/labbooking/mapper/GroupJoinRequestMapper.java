package iuh.labbooking.mapper;

import iuh.labbooking.dto.response.groupjoinrequest.GroupJoinRequestDetailResponse;
import iuh.labbooking.dto.response.groupjoinrequest.GroupJoinRequestResponse;
import iuh.labbooking.dto.response.groupjoinrequest.SecureGroupJoinRequestResponse;
import iuh.labbooking.enums.MemberRole;
import iuh.labbooking.model.GroupJoinRequest;
import iuh.labbooking.model.ResearchGroup;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = { UserMapper.class })
public interface GroupJoinRequestMapper {

    @Mapping(target = "requestId", source = "groupJoinRequestId")
    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "researchGroupId", source = "researchGroup.researchGroupId")
    @Mapping(target = "groupName", source = "researchGroup.groupName")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "responseDate", source = "responseDate")
    GroupJoinRequestResponse toResponse(GroupJoinRequest request);

    @Mapping(target = "requestId", source = "groupJoinRequestId")
    @Mapping(target = "user", source = "user")
    @Mapping(target = "researchGroupId", source = "researchGroup.researchGroupId")
    @Mapping(target = "groupName", source = "researchGroup.groupName")
    @Mapping(target = "projectName", source = "researchGroup.projectName")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "responseNote", source = "responseNote")
    @Mapping(target = "responseBy", source = "responseBy")
    @Mapping(target = "responseDate", source = "responseDate")
    GroupJoinRequestDetailResponse toDetailResponse(GroupJoinRequest request);

    List<GroupJoinRequestResponse> toResponseList(List<GroupJoinRequest> requests);

    @Mapping(target = "requestId", source = "groupJoinRequestId")
    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "researchGroupId", source = "researchGroup.researchGroupId")
    @Mapping(target = "groupName", source = "researchGroup.groupName")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "responseNote", source = "responseNote")
    @Mapping(target = "responseByName", source = "responseBy.fullName")
    @Mapping(target = "responseDate", source = "responseDate")
    @Mapping(target = "leaderName", expression = "java(getLeaderName(request.getResearchGroup()))")
    SecureGroupJoinRequestResponse toSecureResponse(GroupJoinRequest request);

    List<SecureGroupJoinRequestResponse> toSecureResponseList(List<GroupJoinRequest> requests);

    default String getLeaderName(ResearchGroup group) {
        if (group == null || group.getMembers() == null) return null;
        return group.getMembers().stream()
                .filter(m -> m.getRole() == MemberRole.LEADER)
                .map(m -> m.getUser().getFullName())
                .findFirst()
                .orElse(null);
    }
}

