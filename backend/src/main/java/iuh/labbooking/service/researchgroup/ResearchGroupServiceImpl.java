package iuh.labbooking.service.researchgroup;

import iuh.labbooking.dto.request.researchgroup.AddMembersRequest;
import iuh.labbooking.dto.request.researchgroup.CreateResearchGroupRequest;
import iuh.labbooking.dto.request.researchgroup.MemberInfoRequest;
import iuh.labbooking.dto.request.researchgroup.UpdateResearchGroupRequest;
import iuh.labbooking.dto.request.researchgroup.UpdateMemberRoleRequest;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.researchgroup.ResearchGroupResponse;
import iuh.labbooking.dto.response.researchgroup.SecureResearchGroupResponse;
import iuh.labbooking.dto.response.user.UserResponse;
import iuh.labbooking.enums.GroupType;
import iuh.labbooking.enums.MemberRole;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.mapper.ResearchGroupMapper;
import iuh.labbooking.model.GroupJoinRequest;
import iuh.labbooking.model.GroupMembership;
import iuh.labbooking.model.ResearchGroup;
import iuh.labbooking.model.User;
import iuh.labbooking.repository.GroupJoinRequestRepository;
import iuh.labbooking.repository.GroupMembershipRepository;
import iuh.labbooking.repository.ResearchGroupRepository;
import iuh.labbooking.repository.UserRepository;
import iuh.labbooking.util.SecurityUtil;
import iuh.labbooking.util.MemberRoleUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import iuh.labbooking.mapper.MemberInfoMapper;
import iuh.labbooking.dto.response.researchgroup.MyResearchGroupResponse;
import iuh.labbooking.dto.response.researchgroup.MemberInfoResponse;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResearchGroupServiceImpl implements ResearchGroupService {

    private final ResearchGroupRepository researchGroupRepository;
    private final GroupMembershipRepository groupMembershipRepository;
    private final GroupJoinRequestRepository groupJoinRequestRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;
    private final ResearchGroupMapper mapper;
    private final iuh.labbooking.mapper.UserMapper userMapper;
    private final MemberInfoMapper memberInfoMapper;
    private final MemberRoleUtil memberRoleUtil;

    @Override
    @Transactional(readOnly = true)
    public Set<ResearchGroup> findEntitiesByIds(Set<Long> ids) {
        return (ids == null || ids.isEmpty()) ? new HashSet<>()
                : new HashSet<>(researchGroupRepository.findAllById(ids));
    }

    @Override
    @Transactional
    public SecureResearchGroupResponse createGroup(CreateResearchGroupRequest request) {
        User currentUser = securityUtil.getCurrentUser();

        String roleName = currentUser.getRole().getRoleName();
        if (!"ADMIN".equals(roleName) && !"LECTURER".equals(roleName)) {
            throw new AppException(ErrorCode.CANNOT_CREATE_GROUP);
        }

        User advisor = currentUser;
        if (securityUtil.isAdmin() && request.advisorId() != null) {
            advisor = userRepository.findById(request.advisorId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }

        ResearchGroup group = mapper.toEntity(request, advisor);
        Set<GroupMembership> memberships = new HashSet<>();

        GroupMembership creatorMembership = GroupMembership.builder()
                .researchGroup(group)
                .user(advisor)
                .role(MemberRole.LEADER)
                .build();
        memberships.add(creatorMembership);

        if (request.initialMembers() != null && !request.initialMembers().isEmpty()) {
            for (MemberInfoRequest member : request.initialMembers()) {
                User user = userRepository.findByUsername(member.username())
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

                if (user.getUserId().equals(advisor.getUserId())) {
                    continue;
                }

                GroupMembership membership = GroupMembership.builder()
                        .researchGroup(group)
                        .user(user)
                        .role(member.role())
                        .build();
                memberships.add(membership);
            }
        }

        group.setMembers(memberships);
        group = researchGroupRepository.save(group);

        log.info("User {} created research group {} for advisor {} with {} members",
                currentUser.getUsername(), group.getResearchGroupId(), advisor.getUsername(), memberships.size());

        return mapper.toSecureResponse(group);
    }

    @Override
    @Transactional
    public SecureResearchGroupResponse updateGroup(Long researchGroupId, UpdateResearchGroupRequest request) {
        User currentUser = securityUtil.getCurrentUser();

        ResearchGroup group = researchGroupRepository.findById(researchGroupId)
                .orElseThrow(() -> new AppException(ErrorCode.RESEARCH_GROUP_NOT_FOUND));

        if (!securityUtil.isAdmin() && !memberRoleUtil.hasRole(researchGroupId, currentUser.getUserId(), MemberRole.LEADER)) {
            throw new AppException(ErrorCode.INSUFFICIENT_PERMISSION);
        }

        if (request.groupName() != null) {
            group.setGroupName(request.groupName());
        }
        if (request.description() != null) {
            group.setDescription(request.description());
        }
        if (request.projectName() != null) {
            group.setProjectName(request.projectName());
        }
        if (request.groupType() != null) {
            group.setGroupType(request.groupType());
        }
        if (request.isPrivate() != null) {
            group.setPrivate(request.isPrivate());
        }

        if (securityUtil.isAdmin() && request.advisorId() != null) {
            User newAdvisor = userRepository.findById(request.advisorId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            group.setCreator(newAdvisor);
        }

        if (request.members() != null) {
            updateMembers(group, request.members());
        }

        group = researchGroupRepository.save(group);
        log.info("User {} updated research group {}", currentUser.getUsername(), researchGroupId);

        return mapper.toSecureResponse(group);
    }

    @Override
    @Transactional
    public ResearchGroupResponse addMembers(Long researchGroupId, AddMembersRequest request) {
        User currentUser = securityUtil.getCurrentUser();

        ResearchGroup group = researchGroupRepository.findById(researchGroupId)
                .orElseThrow(() -> new AppException(ErrorCode.RESEARCH_GROUP_NOT_FOUND));

        if (!memberRoleUtil.hasRole(researchGroupId, currentUser.getUserId(), MemberRole.LEADER,
                MemberRole.CO_LEADER)) {
            throw new AppException(ErrorCode.INSUFFICIENT_PERMISSION);
        }

        List<GroupMembership> newMemberships = new ArrayList<>();

        for (MemberInfoRequest memberInfo : request.members()) {
            if (groupMembershipRepository.existsByResearchGroup_ResearchGroupIdAndUser_Username(
                    researchGroupId, memberInfo.username())) {
                throw new AppException(ErrorCode.USER_ALREADY_MEMBER);
            }

            User user = userRepository.findByUsername(memberInfo.username())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            groupJoinRequestRepository.findFirstByResearchGroup_ResearchGroupIdAndUser_UserIdOrderByCreatedAtDesc(
                    researchGroupId, user.getUserId())
                    .ifPresent(joinRequest -> {
                        if (joinRequest.getStatus() == RequestStatus.PENDING) {
                            joinRequest.setStatus(RequestStatus.APPROVED);
                            groupJoinRequestRepository.save(joinRequest);
                            log.info("Auto-approved join request {} for user {}",
                                    joinRequest.getGroupJoinRequestId(), user.getUsername());
                        }
                    });

            GroupMembership membership = GroupMembership.builder()
                    .researchGroup(group)
                    .user(user)
                    .role(memberInfo.role())
                    .build();
            newMemberships.add(membership);
        }

        group.getMembers().addAll(newMemberships);
        group = researchGroupRepository.save(group);

        log.info("Added {} members to research group {}", newMemberships.size(), researchGroupId);

        return mapper.toResponse(group);
    }

    @Override
    @Transactional
    public void updateMemberRole(Long researchGroupId, UpdateMemberRoleRequest request) {
        boolean isAdmin = securityUtil.isAdmin();
        Long currentUserId = securityUtil.getCurrentUserId();

        if (!isAdmin && !memberRoleUtil.hasRole(researchGroupId, currentUserId, MemberRole.LEADER)) {
            throw new AppException(ErrorCode.INSUFFICIENT_PERMISSION);
        }

        GroupMembership membership = groupMembershipRepository
                .findByResearchGroup_ResearchGroupIdAndUser_Username(researchGroupId, request.username())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_MEMBER));

        if (!isAdmin && membership.getRole() == MemberRole.LEADER) {
            throw new AppException(ErrorCode.INSUFFICIENT_PERMISSION);
        }

        membership.setRole(request.role());
        groupMembershipRepository.save(membership);

        log.info("User {} (Role: {}) updated role of {} in group {} to {}",
                securityUtil.getCurrentUsername(), isAdmin ? "ADMIN" : "LEADER",
                request.username(), researchGroupId, request.role());
    }

    @Override
    public PageResponse<List<ResearchGroupResponse>> filterGroups(int page, int limit, String keyword,
            GroupType type, Long leaderId) {
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, limit);
        
        Page<ResearchGroup> groups = researchGroupRepository.filterAllResearchGroupsByKeywordAndGroupType(pageable,
                keyword, type, false, leaderId);
        
        return PageResponse.fromPage(groups, mapper::toResponse);
    }

    @Override
    public PageResponse<List<UserResponse>> filterLeaders(String keyword) {
        Page<User> leadersPage = researchGroupRepository.filterAllGroupLeaders(Pageable.unpaged(), keyword);
        return PageResponse.fromPage(leadersPage, userMapper::toResponse);
    }


    @Override
    public PageResponse<List<ResearchGroupResponse>> filterMyGroups(int page, int limit, String keyword,
            GroupType type, Long leaderId, Boolean isPrivate) {
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, limit);
        Long currentUserId = securityUtil.getCurrentUserId();

        Page<ResearchGroup> groups = researchGroupRepository.filterMyResearchGroups(pageable, keyword, type, leaderId, isPrivate,
                currentUserId);

        List<Long> groupIds = groups.getContent().stream()
                .map(ResearchGroup::getResearchGroupId)
                .toList();

        Map<Long, List<GroupMembership>> membershipsByGroupId = groupMembershipRepository
                .findAllByResearchGroupIdIn(groupIds).stream()
                .collect(Collectors.groupingBy(gm -> gm.getResearchGroup().getResearchGroupId()));

        groups.getContent().forEach(group -> {
            List<GroupMembership> memberships = membershipsByGroupId.getOrDefault(group.getResearchGroupId(), List.of());
            group.setMembers(new HashSet<>(memberships));
        });

        return PageResponse.fromPage(groups, group -> {
            String memberRole = group.getMembers().stream()
                    .filter(m -> m.getUser().getUserId().equals(currentUserId))
                    .map(m -> m.getRole().name())
                    .findFirst()
                    .orElse(null);

            return mapper.toResponse(group, null, memberRole, null);
        });
    }

    @Override
    public PageResponse<List<UserResponse>> filterMyLeaders(String keyword) {
        Long currentUserId = securityUtil.getCurrentUserId();
        Page<User> leadersPage = researchGroupRepository.filterMyGroupLeaders(Pageable.unpaged(), keyword, currentUserId);
        return PageResponse.fromPage(leadersPage, userMapper::toResponse);
    }

    @Override
    public PageResponse<List<ResearchGroupResponse>> filterOtherGroups(int page, int limit, String keyword,
            GroupType type, Long leaderId) {
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, limit);
        Long currentUserId = securityUtil.getCurrentUserId();

        Page<ResearchGroup> groups = researchGroupRepository.filterOtherResearchGroups(pageable, keyword, type, leaderId,
                currentUserId);

        List<Long> groupIds = groups.getContent().stream()
                .map(ResearchGroup::getResearchGroupId)
                .toList();

        Map<Long, List<GroupMembership>> membershipsByGroupId = groupMembershipRepository
                .findAllByResearchGroupIdIn(groupIds).stream()
                .collect(Collectors.groupingBy(gm -> gm.getResearchGroup().getResearchGroupId()));

        Map<Long, GroupJoinRequest> latestRequestByGroupId = groupJoinRequestRepository
                .findByGroupIdsAndUserId(groupIds, currentUserId).stream()
                .collect(Collectors.toMap(
                        gjr -> gjr.getResearchGroup().getResearchGroupId(),
                        gjr -> gjr,
                        (existing, replacement) -> existing 
                ));

        groups.getContent().forEach(group -> {
            List<GroupMembership> memberships = membershipsByGroupId.getOrDefault(group.getResearchGroupId(), List.of());
            group.setMembers(new HashSet<>(memberships));
        });

        return PageResponse.fromPage(groups, group -> {
            String requestStatus = null;
            Long requestId = null;

            GroupJoinRequest request = latestRequestByGroupId.get(group.getResearchGroupId());
            if (request != null) {
                requestStatus = request.getStatus().name();
                requestId = request.getGroupJoinRequestId();
            }

            return mapper.toResponse(group, requestStatus, null, requestId);
        });
    }

    @Override
    public PageResponse<List<UserResponse>> filterOtherLeaders(String keyword) {
        Long currentUserId = securityUtil.getCurrentUserId();
        Page<User> leadersPage = researchGroupRepository.filterOtherGroupLeaders(Pageable.unpaged(), keyword, currentUserId);
        return PageResponse.fromPage(leadersPage, userMapper::toResponse);
    }

    @Override
    public ResearchGroupResponse findPublicGroupById(Long researchGroupId) {
        ResearchGroup group = researchGroupRepository.findById(researchGroupId)
                .orElseThrow(() -> new AppException(ErrorCode.RESEARCH_GROUP_NOT_FOUND));

        return mapper.toResponse(group, null, null, null);
    }

    @Override
    public ResearchGroupResponse findGroupById(Long researchGroupId) {
        ResearchGroup group = researchGroupRepository.findById(researchGroupId)
                .orElseThrow(() -> new AppException(ErrorCode.RESEARCH_GROUP_NOT_FOUND));

        Long currentUserId = securityUtil.getCurrentUserId();

        String role = group.getMembers().stream()
                .filter(m -> m.getUser().getUserId().equals(currentUserId))
                .findFirst()
                .map(m -> m.getRole().name())
                .orElse(null);

        String requestStatus = null;
        Long requestId = null;

        if (role == null) {
            var request = groupJoinRequestRepository
                    .findFirstByResearchGroup_ResearchGroupIdAndUser_UserIdOrderByCreatedAtDesc(
                            researchGroupId, currentUserId)
                    .orElse(null);
            if (request != null) {
                requestStatus = request.getStatus().name();
                requestId = request.getGroupJoinRequestId();
            }
        }

        return mapper.toResponse(group, requestStatus, role, requestId);
    }

    @Override
    public MyResearchGroupResponse findMyGroupDetail(Long researchGroupId) {
        ResearchGroup group = researchGroupRepository.findById(researchGroupId)
                .orElseThrow(() -> new AppException(ErrorCode.RESEARCH_GROUP_NOT_FOUND));

        Long currentUserId = securityUtil.getCurrentUserId();
        boolean isAdmin = securityUtil.isAdmin();

        Optional<GroupMembership> membershipOpt = groupMembershipRepository
                .findByResearchGroup_ResearchGroupIdAndUser_UserId(researchGroupId, currentUserId);
        String role = membershipOpt.map(m -> m.getRole().name()).orElse(null);
        MemberRole memberRole = membershipOpt.map(GroupMembership::getRole).orElse(null);

        String requestStatus = null;
        Long requestId = null;

        if (role == null && !isAdmin) {
            var request = groupJoinRequestRepository
                    .findFirstByResearchGroup_ResearchGroupIdAndUser_UserIdOrderByCreatedAtDesc(
                            researchGroupId, currentUserId)
                    .orElse(null);
            if (request != null) {
                requestStatus = request.getStatus().name();
                requestId = request.getGroupJoinRequestId();
            }
        }

        List<GroupMembership> allMembers;
        if (isAdmin || memberRole != null) {
            allMembers = new ArrayList<>(group.getMembers());
        } else {
            allMembers = group.getMembers().stream()
                    .filter(m -> m.getRole() == MemberRole.LEADER)
                    .toList();
        }

        List<MemberInfoResponse> leaders = memberInfoMapper.toMemberInfoList(
                allMembers.stream()
                        .filter(m -> m.getRole() == MemberRole.LEADER)
                        .toList());

        List<MemberInfoResponse> members = memberInfoMapper.toMemberInfoList(
                allMembers.stream()
                        .filter(m -> m.getRole() != MemberRole.LEADER)
                        .toList());

        return mapper.toMyGroupDetail(group, role, requestStatus, requestId, leaders, members);
    }

    @Override
    public PageResponse<List<MemberInfoResponse>> findMembersByGroupId(Long groupId, int page, int limit) {
        Long currentUserId = securityUtil.getCurrentUserId();

        if (!securityUtil.isAdmin()) {
            if (!groupMembershipRepository.existsByResearchGroup_ResearchGroupIdAndUser_UserId(groupId,
                    currentUserId)) {
                throw new AppException(ErrorCode.NOT_GROUP_MEMBER);
            }
        }

        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, limit);
        Page<GroupMembership> memberships = groupMembershipRepository.findByResearchGroup_ResearchGroupId(groupId,
                pageable);
        return PageResponse.fromPage(memberships, memberInfoMapper::toMemberInfo);
    }

    @Override
    public PageResponse<List<SecureResearchGroupResponse>> filterManagedResearchGroups(int page, int limit,
            String keyword,
            GroupType type, Boolean isPrivate, Boolean active) {
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, limit);
        Long currentUserId = securityUtil.getCurrentUserId();

        Page<ResearchGroup> groups = researchGroupRepository.filterManagedResearchGroups(
                pageable, keyword, type, isPrivate, active, currentUserId);

        return PageResponse.fromPage(groups, group -> {
            long pendingCount = groupJoinRequestRepository.countByResearchGroup_ResearchGroupIdAndStatus(
                    group.getResearchGroupId(), RequestStatus.PENDING);
            return mapper.toSecureResponse(group, pendingCount);
        });
    }

    @Override
    @Transactional
    public SecureResearchGroupResponse toggleActiveStatus(Long researchGroupId) {
        Long currentUserId = securityUtil.getCurrentUserId();
        ResearchGroup group = researchGroupRepository.findById(researchGroupId)
                .orElseThrow(() -> new AppException(ErrorCode.RESEARCH_GROUP_NOT_FOUND));

        if (!memberRoleUtil.hasRole(researchGroupId, currentUserId, MemberRole.LEADER)) {
            throw new AppException(ErrorCode.INSUFFICIENT_PERMISSION);
        }

        group.setActive(!group.isActive());
        group = researchGroupRepository.save(group);

        log.info("User {} toggled active status of group {} to {}",
                securityUtil.getCurrentUsername(), researchGroupId, group.isActive());

        return mapper.toSecureResponse(group);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<List<UserResponse>> filterUsersToInvite(int page, int size, Long groupId, String keyword) {
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepository.filterUsersToInvite(pageable, groupId, keyword);

        return PageResponse.fromPage(userPage, userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<List<ResearchGroupResponse>> findMyJoinedGroups(int page, int limit) {
        Long currentUserId = securityUtil.getCurrentUserId();
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, limit);

        Page<ResearchGroup> groups = researchGroupRepository.filterMyResearchGroups(
                pageable, null, null, null, null, currentUserId);

        List<Long> groupIds = groups.getContent().stream()
                .map(ResearchGroup::getResearchGroupId)
                .toList();

        Map<Long, List<GroupMembership>> membershipsByGroupId = groupMembershipRepository
                .findAllByResearchGroupIdIn(groupIds).stream()
                .collect(Collectors.groupingBy(gm -> gm.getResearchGroup().getResearchGroupId()));

        groups.getContent().forEach(group -> {
            List<GroupMembership> memberships = membershipsByGroupId.getOrDefault(group.getResearchGroupId(), List.of());
            group.setMembers(new HashSet<>(memberships));
        });

        return PageResponse.fromPage(groups, group -> {
            String memberRole = group.getMembers().stream()
                    .filter(m -> m.getUser().getUserId().equals(currentUserId))
                    .map(m -> m.getRole().name())
                    .findFirst()
                    .orElse(null);
            return mapper.toResponse(group, null, memberRole, null);
        });
    }

    @Override
    public PageResponse<List<SecureResearchGroupResponse>> filterResearchGroupsAdmin(
            int page, int limit, String keyword, GroupType type, Boolean active, Boolean isPrivate) {
        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, limit);

        Page<ResearchGroup> groups = researchGroupRepository.filterAllResearchGroups(
                pageable, keyword, type, active, isPrivate);

        List<Long> groupIds = groups.getContent().stream()
                .map(ResearchGroup::getResearchGroupId)
                .toList();

        Map<Long, List<GroupMembership>> membershipsByGroupId = groupMembershipRepository
                .findAllByResearchGroupIdIn(groupIds).stream()
                .collect(Collectors.groupingBy(gm -> gm.getResearchGroup().getResearchGroupId()));

        Map<Long, Long> pendingCountsByGroupId = groupJoinRequestRepository
                .countByGroupIdsAndStatus(groupIds, RequestStatus.PENDING).stream()
                .collect(Collectors.toMap(
                        arr -> (Long) arr[0],
                        arr -> (Long) arr[1]
                ));

        groups.getContent().forEach(group -> {
            List<GroupMembership> memberships = membershipsByGroupId.getOrDefault(group.getResearchGroupId(), List.of());
            group.setMembers(new HashSet<>(memberships));
        });

        return PageResponse.fromPage(groups, group -> {
            long pendingCount = pendingCountsByGroupId.getOrDefault(group.getResearchGroupId(), 0L);
            return mapper.toSecureResponse(group, pendingCount);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public SecureResearchGroupResponse findGroupByIdAdmin(Long id) {
        ResearchGroup group = researchGroupRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESEARCH_GROUP_NOT_FOUND));

        return mapper.toSecureResponse(group);
    }

    private void updateMembers(ResearchGroup group, List<MemberInfoRequest> memberRequests) {
        Map<String, MemberRole> newMemberMap = memberRequests.stream()
                .collect(Collectors.toMap(MemberInfoRequest::username, MemberInfoRequest::role));

        Set<GroupMembership> currentMemberships = group.getMembers();

        // Remove members who are no longer in the list
        currentMemberships.removeIf(membership -> !newMemberMap.containsKey(membership.getUser().getUsername()));

        // Update or Add members
        for (Map.Entry<String, MemberRole> entry : newMemberMap.entrySet()) {
            String username = entry.getKey();
            MemberRole role = entry.getValue();

            Optional<GroupMembership> existingOpt = currentMemberships.stream()
                    .filter(m -> m.getUser().getUsername().equals(username))
                    .findFirst();

            if (existingOpt.isPresent()) {
                existingOpt.get().setRole(role);
            } else {
                User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

                GroupMembership membership = GroupMembership.builder()
                        .researchGroup(group)
                        .user(user)
                        .role(role)
                        .build();
                currentMemberships.add(membership);
            }
        }

        // Ensure that the advisor (creator) is ALWAYS a LEADER in the group
        User advisor = group.getCreator();
        boolean leaderExists = currentMemberships.stream()
                .anyMatch(m -> m.getUser().getUserId().equals(advisor.getUserId()) && m.getRole() == MemberRole.LEADER);

        if (!leaderExists) {
            Optional<GroupMembership> advisorMembershipOpt = currentMemberships.stream()
                    .filter(m -> m.getUser().getUserId().equals(advisor.getUserId()))
                    .findFirst();

            if (advisorMembershipOpt.isPresent()) {
                advisorMembershipOpt.get().setRole(MemberRole.LEADER);
            } else {
                currentMemberships.add(GroupMembership.builder()
                        .researchGroup(group)
                        .user(advisor)
                        .role(MemberRole.LEADER)
                        .build());
            }
        }
    }
}
