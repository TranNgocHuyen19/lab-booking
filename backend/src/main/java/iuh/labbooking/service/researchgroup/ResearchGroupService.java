package iuh.labbooking.service.researchgroup;

import iuh.labbooking.dto.request.researchgroup.AddMembersRequest;
import iuh.labbooking.dto.request.researchgroup.CreateResearchGroupRequest;
import iuh.labbooking.dto.request.researchgroup.UpdateResearchGroupRequest;
import iuh.labbooking.dto.request.researchgroup.UpdateMemberRoleRequest;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.researchgroup.MemberInfoResponse;
import iuh.labbooking.dto.response.researchgroup.MyResearchGroupResponse;
import iuh.labbooking.dto.response.researchgroup.ResearchGroupResponse;
import iuh.labbooking.dto.response.researchgroup.SecureResearchGroupResponse;
import iuh.labbooking.dto.response.user.UserResponse;
import iuh.labbooking.enums.GroupType;

import iuh.labbooking.model.ResearchGroup;

import java.util.List;
import java.util.Set;

public interface ResearchGroupService {
    Set<ResearchGroup> findEntitiesByIds(Set<Long> ids);

    SecureResearchGroupResponse createGroup(CreateResearchGroupRequest request);

    SecureResearchGroupResponse updateGroup(Long researchGroupId, UpdateResearchGroupRequest request);

    ResearchGroupResponse addMembers(Long researchGroupId, AddMembersRequest request);

    void updateMemberRole(Long researchGroupId, UpdateMemberRoleRequest request);

        PageResponse<List<ResearchGroupResponse>> filterGroups(int page, int limit, String keyword,
                        GroupType type, Long leaderId);

        PageResponse<List<UserResponse>> filterLeaders(String keyword);

        PageResponse<List<ResearchGroupResponse>> filterMyGroups(int page, int limit, String keyword,
                        GroupType type, Long leaderId, Boolean isPrivate);

        PageResponse<List<UserResponse>> filterMyLeaders(String keyword);

        PageResponse<List<ResearchGroupResponse>> filterOtherGroups(int page, int limit, String keyword,
                        GroupType type, Long leaderId);

        PageResponse<List<UserResponse>> filterOtherLeaders(String keyword);

    ResearchGroupResponse findPublicGroupById(Long researchGroupId);

    ResearchGroupResponse findGroupById(Long researchGroupId);

    MyResearchGroupResponse findMyGroupDetail(Long researchGroupId);

    PageResponse<List<MemberInfoResponse>> findMembersByGroupId(Long groupId, int page, int limit);

    PageResponse<List<SecureResearchGroupResponse>> filterManagedResearchGroups(int page, int limit, String keyword,
                                                                                GroupType type, Boolean isPrivate, Boolean active);

    SecureResearchGroupResponse toggleActiveStatus(Long researchGroupId);

    PageResponse<List<UserResponse>> filterUsersToInvite(int page, int size, Long groupId, String keyword);

    PageResponse<List<ResearchGroupResponse>> findMyJoinedGroups(int page, int limit);

    PageResponse<List<SecureResearchGroupResponse>> filterResearchGroupsAdmin(
            int page, int limit, String keyword, GroupType type, Boolean active, Boolean isPrivate);

    SecureResearchGroupResponse findGroupByIdAdmin(Long id);
}
