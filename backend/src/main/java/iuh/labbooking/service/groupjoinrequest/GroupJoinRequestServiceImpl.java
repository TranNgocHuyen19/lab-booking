package iuh.labbooking.service.groupjoinrequest;

import iuh.labbooking.dto.request.groupjoinrequest.UpdateJoinRequestStatusRequest;
import iuh.labbooking.dto.request.groupjoinrequest.BulkJoinRequestUpdate;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.groupjoinrequest.GroupJoinRequestDetailResponse;
import iuh.labbooking.dto.response.groupjoinrequest.GroupJoinRequestResponse;
import iuh.labbooking.dto.response.groupjoinrequest.SecureGroupJoinRequestResponse;
import iuh.labbooking.enums.MemberRole;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.mapper.GroupJoinRequestMapper;
import iuh.labbooking.model.GroupJoinRequest;
import iuh.labbooking.model.GroupMembership;
import iuh.labbooking.model.ResearchGroup;
import iuh.labbooking.model.User;
import iuh.labbooking.repository.GroupJoinRequestRepository;
import iuh.labbooking.repository.GroupMembershipRepository;
import iuh.labbooking.repository.ResearchGroupRepository;
import iuh.labbooking.util.SecurityUtil;
import iuh.labbooking.util.MemberRoleUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupJoinRequestServiceImpl implements GroupJoinRequestService {

    private final GroupJoinRequestRepository groupJoinRequestRepository;
    private final GroupMembershipRepository groupMembershipRepository;
    private final ResearchGroupRepository researchGroupRepository;
    private final GroupJoinRequestMapper groupJoinRequestMapper;
    private final SecurityUtil securityUtil;
    private final MemberRoleUtil memberRoleUtil;

    @Override
    @Transactional
    public void createJoinRequests(User user, Set<Long> researchGroupIds, String joinMessage) {
        if (researchGroupIds == null || researchGroupIds.isEmpty()) {
            log.debug("No research groups specified for user {}", user.getUsername());
            return;
        }

        for (Long groupId : researchGroupIds) {
            createJoinRequest(user, groupId, joinMessage);
        }
    }

    @Override
    @Transactional
    public void createJoinRequest(User user, Long researchGroupId, String joinMessage) {
        log.debug("Creating join request for user {} to research group {}",
                user.getUsername(), researchGroupId);

        ResearchGroup group = researchGroupRepository.findById(researchGroupId)
                .orElseThrow(() -> {
                    log.error("Research group {} not found", researchGroupId);
                    return new AppException(ErrorCode.RESEARCH_GROUP_NOT_FOUND);
                });

        if (group.isPrivate()) {
            log.warn("Cannot create join request for private research group {}", researchGroupId);
            throw new AppException(ErrorCode.RESEARCH_GROUP_PRIVATE);
        }

        boolean isAlreadyMember = groupMembershipRepository
                .existsByResearchGroup_ResearchGroupIdAndUser_UserId(researchGroupId, user.getUserId());

        if (isAlreadyMember) {
            log.warn("User {} is already a member of research group {}",
                    user.getUsername(), researchGroupId);
            throw new AppException(ErrorCode.ALREADY_GROUP_MEMBER);
        }

        boolean hasPendingRequest = groupJoinRequestRepository
                .existsByResearchGroup_ResearchGroupIdAndUser_UserIdAndStatus(
                        researchGroupId, user.getUserId(), RequestStatus.PENDING);

        if (hasPendingRequest) {
            log.warn("User {} already has a pending join request for research group {}",
                    user.getUsername(), researchGroupId);
            throw new AppException(ErrorCode.PENDING_JOIN_REQUEST_EXISTS);
        }

        GroupJoinRequest joinRequest = GroupJoinRequest.builder()
                .user(user)
                .researchGroup(group)
                .status(RequestStatus.PENDING)
                .message(joinMessage)
                .build();

        groupJoinRequestRepository.save(joinRequest);

        log.info("Successfully created join request for user {} to research group {}",
                user.getUsername(), researchGroupId);
    }

    @Override
    public GroupJoinRequestDetailResponse findRequestById(Long requestId) {
        User currentUser = securityUtil.getCurrentUser();
        log.debug("User {} getting join request by ID: {}", currentUser.getUsername(), requestId);

        GroupJoinRequest joinRequest = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.JOIN_REQUEST_NOT_FOUND));

        boolean isRequester = joinRequest.getUser().getUserId().equals(currentUser.getUserId());
        Long groupId = joinRequest.getResearchGroup().getResearchGroupId();
        boolean isLeaderOrCoLeader = memberRoleUtil.hasRole(groupId, currentUser.getUserId(), MemberRole.LEADER,
                MemberRole.CO_LEADER);

        if (!isRequester && !isLeaderOrCoLeader) {
            log.error("User {} does not have permission to view join request {}", currentUser.getUsername(), requestId);
            throw new AppException(ErrorCode.INSUFFICIENT_PERMISSION);
        }

        return groupJoinRequestMapper.toDetailResponse(joinRequest);
    }

    @Override
    public PageResponse<List<GroupJoinRequestResponse>> findMyJoinRequests(int page, int size, String status) {
        User currentUser = securityUtil.getCurrentUser();
        log.debug("Getting join requests for user: {}", currentUser.getUsername());
        page = Math.max(page - 1, 0);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<GroupJoinRequest> requestPage;

        if (status != null && !status.isEmpty()) {
            RequestStatus requestStatus = RequestStatus.valueOf(status.toUpperCase());
            requestPage = groupJoinRequestRepository.findByUser_UserIdAndStatus(
                    currentUser.getUserId(), requestStatus, pageable);
        } else {
            requestPage = groupJoinRequestRepository.findByUser_UserId(currentUser.getUserId(), pageable);
        }

        List<GroupJoinRequestResponse> responses = groupJoinRequestMapper.toResponseList(requestPage.getContent());

        return new PageResponse<>(
                responses,
                requestPage.getNumber(),
                requestPage.getTotalPages(),
                requestPage.getSize(),
                requestPage.getTotalElements());
    }

    @Override
    public PageResponse<List<SecureGroupJoinRequestResponse>> filterJoinRequestsByAdmin(
            int page, int size, String status, String keyword,
            Long researchGroupId,
            LocalDate fromDate,
            LocalDate toDate) {
        log.debug("Admin filtering all join requests");

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(23, 59, 59) : null;

        Page<GroupJoinRequest> requestPage = groupJoinRequestRepository.findAllJoinRequestsWithFilters(
                status != null && !status.isEmpty() ? RequestStatus.valueOf(status.toUpperCase()) : null,
                keyword,
                researchGroupId,
                fromDateTime,
                toDateTime,
                pageable);

        return PageResponse.fromPage(requestPage, groupJoinRequestMapper::toSecureResponse);
    }

    @Override
    public PageResponse<List<SecureGroupJoinRequestResponse>> filterJoinRequestsForMyGroups(
            int page, int size, String status, String keyword,
            Long researchGroupId,
            LocalDate fromDate,
            LocalDate toDate) {
        User currentUser = securityUtil.getCurrentUser();
        log.debug("Filtering join requests for groups created by user: {} (ID: {})",
                currentUser.getUsername(), currentUser.getUserId());

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(23, 59, 59) : null;

        Page<GroupJoinRequest> requestPage = groupJoinRequestRepository.findJoinRequestsByLeaderWithFilters(
                currentUser.getUserId(),
                status != null && !status.isEmpty() ? RequestStatus.valueOf(status.toUpperCase()) : null,
                keyword,
                researchGroupId,
                fromDateTime,
                toDateTime,
                pageable);

        return PageResponse.fromPage(requestPage, groupJoinRequestMapper::toSecureResponse);
    }

    @Override
    public PageResponse<List<SecureGroupJoinRequestResponse>> findJoinRequestsForGroup(Long groupId, int page, int size,
            String status, String keyword) {
        log.debug("Getting join requests for group: {} with keyword: {}", groupId, keyword);

        if (!researchGroupRepository.existsById(groupId)) {
            throw new AppException(ErrorCode.RESEARCH_GROUP_NOT_FOUND);
        }
        page = Math.max(page - 1, 0);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<GroupJoinRequest> requestPage;

        if (status != null && !status.isEmpty()) {
            RequestStatus requestStatus = RequestStatus.valueOf(status.toUpperCase());
            requestPage = groupJoinRequestRepository.findByResearchGroup_ResearchGroupIdAndStatus(
                    groupId, requestStatus, pageable);
        } else {
            requestPage = groupJoinRequestRepository.findByResearchGroup_ResearchGroupId(groupId, pageable);
        }

        List<SecureGroupJoinRequestResponse> responses = groupJoinRequestMapper
                .toSecureResponseList(requestPage.getContent());

        return new PageResponse<>(
                responses,
                requestPage.getNumber() + 1,
                requestPage.getTotalPages(),
                requestPage.getSize(),
                requestPage.getTotalElements());
    }

    @Override
    @Transactional
    public SecureGroupJoinRequestResponse approveJoinRequest(Long requestId, UpdateJoinRequestStatusRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        log.debug("User {} approving join request {}", currentUser.getUsername(), requestId);

        GroupJoinRequest joinRequest = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.JOIN_REQUEST_NOT_FOUND));

        validateRequestStatus(joinRequest, RequestStatus.PENDING);

        Long groupId = joinRequest.getResearchGroup().getResearchGroupId();
        if (!securityUtil.isAdmin()
                && !memberRoleUtil.hasRole(groupId, currentUser.getUserId(), MemberRole.LEADER, MemberRole.CO_LEADER)) {
            throw new AppException(ErrorCode.INSUFFICIENT_PERMISSION);
        }

        joinRequest.setStatus(RequestStatus.APPROVED);
        joinRequest.setResponseBy(currentUser);
        joinRequest.setResponseDate(LocalDateTime.now());
        if (request != null && request.responseNote() != null && !request.responseNote().isEmpty()) {
            joinRequest.setResponseNote(request.responseNote());
        }
        joinRequest = groupJoinRequestRepository.save(joinRequest);

        GroupMembership membership = GroupMembership.builder()
                .researchGroup(joinRequest.getResearchGroup())
                .user(joinRequest.getUser())
                .role(MemberRole.MEMBER)
                .build();

        groupMembershipRepository.save(membership);

        log.info("Join request {} approved by user {}", requestId, currentUser.getUsername());

        return groupJoinRequestMapper.toSecureResponse(joinRequest);
    }

    @Override
    @Transactional
    public SecureGroupJoinRequestResponse rejectJoinRequest(Long requestId, UpdateJoinRequestStatusRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        log.debug("User {} rejecting join request {}", currentUser.getUsername(), requestId);

        GroupJoinRequest joinRequest = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.JOIN_REQUEST_NOT_FOUND));

        validateRequestStatus(joinRequest, RequestStatus.PENDING);

        Long groupId = joinRequest.getResearchGroup().getResearchGroupId();
        if (!securityUtil.isAdmin() && !memberRoleUtil.hasRole(groupId, currentUser.getUserId(), MemberRole.LEADER)) {
            throw new AppException(ErrorCode.INSUFFICIENT_PERMISSION);
        }

        joinRequest.setStatus(RequestStatus.REJECTED);
        joinRequest.setResponseBy(currentUser);
        joinRequest.setResponseDate(LocalDateTime.now());
        if (request != null && request.responseNote() != null && !request.responseNote().isEmpty()) {
            joinRequest.setResponseNote(request.responseNote());
        }
        joinRequest = groupJoinRequestRepository.save(joinRequest);

        log.info("Join request {} rejected by user {}", requestId, currentUser.getUsername());

        return groupJoinRequestMapper.toSecureResponse(joinRequest);
    }

    @Override
    @Transactional
    public GroupJoinRequestResponse cancelJoinRequest(Long requestId) {
        User currentUser = securityUtil.getCurrentUser();
        log.debug("User {} cancelling join request {}", currentUser.getUsername(), requestId);

        GroupJoinRequest joinRequest = groupJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.JOIN_REQUEST_NOT_FOUND));

        if (!joinRequest.getUser().getUserId().equals(currentUser.getUserId())) {
            log.error("User {} cannot cancel join request {} created by another user",
                    currentUser.getUsername(), requestId);
            throw new AppException(ErrorCode.CANNOT_MODIFY_REQUEST);
        }

        validateRequestStatus(joinRequest, RequestStatus.PENDING);

        joinRequest.setStatus(RequestStatus.CANCELED);
        joinRequest = groupJoinRequestRepository.save(joinRequest);

        log.info("Join request {} cancelled by user {}", requestId, currentUser.getUsername());

        return groupJoinRequestMapper.toResponse(joinRequest);
    }

    private void validateRequestStatus(GroupJoinRequest joinRequest, RequestStatus expectedStatus) {
        if (joinRequest.getStatus() != expectedStatus) {
            log.error("Invalid request status. Expected: {}, Actual: {}",
                    expectedStatus, joinRequest.getStatus());
            throw new AppException(ErrorCode.INVALID_REQUEST_STATUS);
        }
    }

    @Override
    @Transactional
    public void bulkApproveJoinRequests(BulkJoinRequestUpdate request) {
        User currentUser = securityUtil.getCurrentUser();
        UpdateJoinRequestStatusRequest statusRequest = new UpdateJoinRequestStatusRequest(request.responseNote());
        for (Long requestId : request.requestIds()) {
            approveJoinRequest(requestId, statusRequest);
        }
        log.info("Bulk approve completed by user {}. Processed {} requests",
                currentUser.getUsername(), request.requestIds().size());
    }

    @Override
    @Transactional
    public void bulkRejectJoinRequests(BulkJoinRequestUpdate request) {
        User currentUser = securityUtil.getCurrentUser();
        UpdateJoinRequestStatusRequest statusRequest = new UpdateJoinRequestStatusRequest(request.responseNote());
        for (Long requestId : request.requestIds()) {
            rejectJoinRequest(requestId, statusRequest);
        }
        log.info("Bulk reject completed by user {}. Processed {} requests",
                currentUser.getUsername(), request.requestIds().size());
    }
}
