package iuh.labbooking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.labbooking.dto.request.groupjoinrequest.CreateJoinRequestRequest;
import iuh.labbooking.dto.request.groupjoinrequest.UpdateJoinRequestStatusRequest;
import iuh.labbooking.dto.request.groupjoinrequest.BulkJoinRequestUpdate;
import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.groupjoinrequest.GroupJoinRequestDetailResponse;
import iuh.labbooking.dto.response.groupjoinrequest.GroupJoinRequestResponse;
import iuh.labbooking.dto.response.groupjoinrequest.SecureGroupJoinRequestResponse;
import iuh.labbooking.model.User;
import iuh.labbooking.service.groupjoinrequest.GroupJoinRequestService;
import iuh.labbooking.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/group-join-requests")
@RequiredArgsConstructor
@Tag(name = "Group Join Requests", description = "Group join request operations")
public class GroupJoinRequestController {

    private final GroupJoinRequestService groupJoinRequestService;
    private final SecurityUtil securityUtil;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create join request", description = "Request to join a research group")
    public ResponseEntity<ApiResponse<Void>> createJoinRequest(
            @Valid @RequestBody CreateJoinRequestRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        groupJoinRequestService.createJoinRequest(currentUser, request.researchGroupId(), request.message());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Join request created successfully"));
    }

    @GetMapping("/my-requests")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my join requests", description = "Get all join requests sent by current user")
    public ResponseEntity<ApiResponse<PageResponse<List<GroupJoinRequestResponse>>>> findMyJoinRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        PageResponse<List<GroupJoinRequestResponse>> response = groupJoinRequestService.findMyJoinRequests(page,
                size,
                status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my-groups")
    @PreAuthorize("hasRole('LECTURER')")
    @Operation(summary = "Get join requests for my groups", description = "Get all join requests for groups where current user is creator with advanced filtering")
    public ResponseEntity<ApiResponse<PageResponse<List<SecureGroupJoinRequestResponse>>>> filterJoinRequestsForMyGroups(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long researchGroupId,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate) {
        PageResponse<List<SecureGroupJoinRequestResponse>> response = groupJoinRequestService
                .filterJoinRequestsForMyGroups(page, size, status, keyword, researchGroupId, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all join requests (Admin)", description = "Get all join requests across all groups with advanced filtering")
    public ResponseEntity<ApiResponse<PageResponse<List<SecureGroupJoinRequestResponse>>>> filterAllJoinRequestsAdmin(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long researchGroupId,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate) {
        PageResponse<List<SecureGroupJoinRequestResponse>> response = groupJoinRequestService
                .filterJoinRequestsByAdmin(page, size, status, keyword, researchGroupId, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/group/{groupId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get join requests for specific group", description = "Get all join requests for a specific research group")
    public ResponseEntity<ApiResponse<PageResponse<List<SecureGroupJoinRequestResponse>>>> findJoinRequestsForGroup(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        PageResponse<List<SecureGroupJoinRequestResponse>> response = groupJoinRequestService
                .findJoinRequestsForGroup(
                        groupId,
                        page, size, status, keyword);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{requestId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get join request by ID", description = "Get specific join request details")
    public ResponseEntity<ApiResponse<GroupJoinRequestDetailResponse>> findRequestById(
            @PathVariable Long requestId) {
        GroupJoinRequestDetailResponse response = groupJoinRequestService.findRequestById(requestId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{requestId}/approve")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Approve join request", description = "Approve a pending join request and add user to group. Must be LEADER or CO_LEADER of the group.")
    public ResponseEntity<ApiResponse<SecureGroupJoinRequestResponse>> approveJoinRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody(required = false) UpdateJoinRequestStatusRequest request) {
        SecureGroupJoinRequestResponse response = groupJoinRequestService.approveJoinRequest(requestId, request);
        return ResponseEntity.ok(ApiResponse.success("Join request approved successfully", response));
    }

    @PatchMapping("/{requestId}/reject")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Reject join request", description = "Reject a pending join request. LECTURER must be group creator, ADMIN can reject any.")
    public ResponseEntity<ApiResponse<SecureGroupJoinRequestResponse>> rejectJoinRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody UpdateJoinRequestStatusRequest request) {
        SecureGroupJoinRequestResponse response = groupJoinRequestService.rejectJoinRequest(requestId,
                request);
        return ResponseEntity.ok(ApiResponse.success("Join request rejected successfully", response));
    }

    @PatchMapping("/{requestId}/cancel")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancel join request", description = "Cancel own pending join request")
    public ResponseEntity<ApiResponse<GroupJoinRequestResponse>> cancelJoinRequest(
            @PathVariable Long requestId) {
        GroupJoinRequestResponse response = groupJoinRequestService.cancelJoinRequest(requestId);
        return ResponseEntity.ok(ApiResponse.success("Join request cancelled successfully", response));
    }

    @PatchMapping("/actions/bulk-approve")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    @Operation(summary = "Bulk approve join requests", description = "Approve multiple pending join requests at once")
    public ResponseEntity<ApiResponse<Void>> bulkApproveJoinRequests(
            @Valid @RequestBody BulkJoinRequestUpdate request) {
        groupJoinRequestService.bulkApproveJoinRequests(request);
        return ResponseEntity.ok(ApiResponse.success("Bulk approve completed"));
    }

    @PatchMapping("/actions/bulk-reject")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    @Operation(summary = "Bulk reject join requests", description = "Reject multiple pending join requests at once")
    public ResponseEntity<ApiResponse<Void>> bulkRejectJoinRequests(
            @Valid @RequestBody BulkJoinRequestUpdate request) {
        groupJoinRequestService.bulkRejectJoinRequests(request);
        return ResponseEntity.ok(ApiResponse.success("Bulk reject completed"));
    }
}
