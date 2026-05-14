package iuh.labbooking.mapper;

import iuh.labbooking.dto.request.researchgroup.CreateResearchGroupRequest;
import iuh.labbooking.dto.response.researchgroup.MemberInfoResponse;
import iuh.labbooking.dto.response.researchgroup.MyResearchGroupResponse;
import iuh.labbooking.dto.response.researchgroup.ResearchGroupResponse;
import iuh.labbooking.dto.response.researchgroup.SecureResearchGroupResponse;
import iuh.labbooking.model.GroupMembership;
import iuh.labbooking.model.ResearchGroup;
import iuh.labbooking.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;
import iuh.labbooking.enums.MemberRole;

import java.util.List;

@Mapper(componentModel = "spring", uses = {
        MemberInfoMapper.class }, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ResearchGroupMapper {

    @Mapping(target = "researchGroupId", ignore = true)
    @Mapping(target = "creator", source = "creator")
    @Mapping(target = "status", constant = "ACTIVE")
    @Mapping(target = "isPrivate", source = "request.isPrivate")
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "joinRequests", ignore = true)
    ResearchGroup toEntity(CreateResearchGroupRequest request, User creator);

    @Mapping(target = "leaderId", expression = "java(getLeaderId(group))")
    @Mapping(target = "leaderName", expression = "java(getLeaderName(group))")
    @Mapping(target = "members", source = "group.members")
    @Mapping(target = "pendingRequestsCount", source = "pendingRequestsCount")
    SecureResearchGroupResponse toSecureResponse(ResearchGroup group, long pendingRequestsCount);

    @Mapping(target = "leaderId", expression = "java(getLeaderId(group))")
    @Mapping(target = "leaderName", expression = "java(getLeaderName(group))")
    @Mapping(target = "members", source = "group.members")
    @Mapping(target = "pendingRequestsCount", constant = "0L")
    SecureResearchGroupResponse toSecureResponse(ResearchGroup group);

    @Mapping(target = "leaderName", expression = "java(getLeaderName(group))")
    @Mapping(target = "memberCount", expression = "java(group.getMembers() == null ? 0 : group.getMembers().size())")
    @Mapping(target = "requestStatus", source = "requestStatus")
    @Mapping(target = "memberRole", source = "memberRole")
    @Mapping(target = "requestId", source = "requestId")
    ResearchGroupResponse toResponse(
            ResearchGroup group,
            String requestStatus,
            String memberRole,
            Long requestId);

    @Mapping(target = "leaderName", expression = "java(getLeaderName(group))")
    @Mapping(target = "memberCount", expression = "java(group.getMembers() == null ? 0 : group.getMembers().size())")
    @Mapping(target = "requestStatus", ignore = true)
    @Mapping(target = "memberRole", ignore = true)
    @Mapping(target = "requestId", ignore = true)
    ResearchGroupResponse toResponse(ResearchGroup group);

    @Mapping(target = "memberCount", expression = "java(group.getMembers() == null ? 0 : group.getMembers().size())")
    @Mapping(target = "leaders", source = "leaders")
    @Mapping(target = "members", source = "members")
    @Mapping(target = "memberRole", source = "memberRole")
    @Mapping(target = "requestStatus", source = "requestStatus")
    @Mapping(target = "requestId", source = "requestId")
    MyResearchGroupResponse toMyGroupDetail(
            ResearchGroup group,
            String memberRole,
            String requestStatus,
            Long requestId,
            List<MemberInfoResponse> leaders,
            List<MemberInfoResponse> members);

    default ResearchGroupResponse toResponse(GroupMembership membership) {
        if (membership == null || membership.getResearchGroup() == null)
            return null;
        return toResponse(membership.getResearchGroup());
    }

    default Long getLeaderId(ResearchGroup group) {
        if (group == null || group.getMembers() == null) return null;
        return group.getMembers().stream()
                .filter(m -> m.getRole() == MemberRole.LEADER)
                .map(m -> m.getUser().getUserId())
                .findFirst()
                .orElse(null);
    }

    default String getLeaderName(ResearchGroup group) {
        if (group == null || group.getMembers() == null) return null;
        return group.getMembers().stream()
                .filter(m -> m.getRole() == MemberRole.LEADER)
                .map(m -> m.getUser().getFullName())
                .findFirst()
                .orElse(null);
    }
}
