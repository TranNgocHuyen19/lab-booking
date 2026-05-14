package iuh.labbooking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.labbooking.dto.request.researchgroup.AddMembersRequest;
import iuh.labbooking.dto.request.researchgroup.UpdateMemberRoleRequest;
import iuh.labbooking.dto.request.researchgroup.CreateResearchGroupRequest;
import iuh.labbooking.dto.request.researchgroup.UpdateResearchGroupRequest;
import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.researchgroup.MemberInfoResponse;
import iuh.labbooking.dto.response.researchgroup.MyResearchGroupResponse;
import iuh.labbooking.dto.response.researchgroup.ResearchGroupResponse;
import iuh.labbooking.dto.response.researchgroup.SecureResearchGroupResponse;
import iuh.labbooking.dto.response.user.UserResponse;
import iuh.labbooking.enums.GroupType;
import iuh.labbooking.service.researchgroup.ResearchGroupService;
import iuh.labbooking.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/research-groups")
@RequiredArgsConstructor
@Tag(name = "Research Group", description = "Research group management APIs")
public class ResearchGroupController {

    private final ResearchGroupService researchGroupService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Create research group (lecturer only)")
    public ResponseEntity<ApiResponse<SecureResearchGroupResponse>> createGroup(
            @Valid @RequestBody CreateResearchGroupRequest request) {
        SecureResearchGroupResponse response = researchGroupService.createGroup(request);
        return ResponseEntity.ok(ApiResponse.success("Research group created successfully", response));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    @Operation(summary = "Update research group (creator only)")
    public ResponseEntity<ApiResponse<SecureResearchGroupResponse>> updateGroup(
            @PathVariable Long id,
            @Valid @RequestBody UpdateResearchGroupRequest request) {
        SecureResearchGroupResponse response = researchGroupService.updateGroup(id, request);
        return ResponseEntity.ok(ApiResponse.success("Research group updated successfully", response));
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add members to research group (member/creator/admin only)")
    public ResponseEntity<ApiResponse<ResearchGroupResponse>> addMembers(
            @PathVariable Long id,
            @Valid @RequestBody AddMembersRequest request) {
        ResearchGroupResponse response = researchGroupService.addMembers(id, request);
        return ResponseEntity.ok(ApiResponse.success("Members added successfully", response));
    }

    @PatchMapping("/{id}/members/role")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Update member role in research group (creator/leader only)")
    public ResponseEntity<ApiResponse<Void>> updateMemberRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMemberRoleRequest request) {
        researchGroupService.updateMemberRole(id, request);
        return ResponseEntity.ok(ApiResponse.success("Member role updated successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get public research group details by ID")
    public ResponseEntity<ApiResponse<ResearchGroupResponse>> findPublicGroupById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Public research group details retrieved successfully",
                researchGroupService.findPublicGroupById(id)));
    }

    @GetMapping("/{id}/find")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get research group details for authenticated user")
    public ResponseEntity<ApiResponse<ResearchGroupResponse>> findGroupById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Research group details retrieved successfully",
                researchGroupService.findGroupById(id)));
    }

    @GetMapping("/{id}/my-detail")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get detailed research group information (authenticated only)")
    public ResponseEntity<ApiResponse<MyResearchGroupResponse>> findMyGroupDetail(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Detailed research group information retrieved successfully",
                researchGroupService.findMyGroupDetail(id)));
    }


    @GetMapping("")
    @Operation(summary = "Filter all visible research groups (public, active)")
    public ResponseEntity<ApiResponse<PageResponse<List<ResearchGroupResponse>>>> filterGroups(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) GroupType type,
            @RequestParam(required = false) Long leaderId) {
        return ResponseEntity.ok(ApiResponse.success("Research groups retrieved successfully",
                researchGroupService.filterGroups(page, limit, keyword, type, leaderId)));
    }

    @GetMapping("/leaders")
    @Operation(summary = "Get research group leaders")
    public ResponseEntity<ApiResponse<PageResponse<List<UserResponse>>>> filterLeaders(
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.success("Leaders retrieved successfully",
                researchGroupService.filterLeaders(keyword)));
    }


    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Filter research groups that current user is a member of")
    public ResponseEntity<ApiResponse<PageResponse<List<ResearchGroupResponse>>>> filterMyGroups(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) GroupType type,
            @RequestParam(required = false) Long leaderId,
            @RequestParam(required = false) Boolean isPrivate) {
        return ResponseEntity.ok(ApiResponse.success("My research groups retrieved successfully",
                researchGroupService.filterMyGroups(page, limit, keyword, type, leaderId, isPrivate)));
    }

    @GetMapping("/my/leaders")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get leaders of groups that current user is a member of")
    public ResponseEntity<ApiResponse<PageResponse<List<UserResponse>>>> filterMyLeaders(
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.success("My group leaders retrieved successfully",
                researchGroupService.filterMyLeaders(keyword)));
    }

    @GetMapping("/other")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Filter public research groups that current user is NOT a member of")
    public ResponseEntity<ApiResponse<PageResponse<List<ResearchGroupResponse>>>> filterOtherGroups(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) GroupType type,
            @RequestParam(required = false) Long leaderId) {
        return ResponseEntity.ok(ApiResponse.success("Other research groups retrieved successfully",
                researchGroupService.filterOtherGroups(page, limit, keyword, type, leaderId)));
    }

    @GetMapping("/other/leaders")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get leaders of public groups that current user is NOT a member of")
    public ResponseEntity<ApiResponse<PageResponse<List<UserResponse>>>> filterOtherLeaders(
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.success("Other group leaders retrieved successfully",
                researchGroupService.filterOtherLeaders(keyword)));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Filter all research groups (Admin only)")
    public ResponseEntity<ApiResponse<PageResponse<List<SecureResearchGroupResponse>>>> filterAllResearchGroupsAdmin(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) GroupType type,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean isPrivate) {
        return ResponseEntity.ok(ApiResponse.success(
                researchGroupService.filterResearchGroupsAdmin(page, limit, keyword, type, active, isPrivate)));
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get research group details for Admin")
    public ResponseEntity<ApiResponse<SecureResearchGroupResponse>> findGroupByIdAdmin(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Research group details retrieved successfully",
                researchGroupService.findGroupByIdAdmin(id)));
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get research group members")
    public ResponseEntity<ApiResponse<PageResponse<List<MemberInfoResponse>>>> findMembersByGroupId(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        PageResponse<List<MemberInfoResponse>> response = researchGroupService.findMembersByGroupId(id, page, limit);
        return ResponseEntity.ok(ApiResponse.success("Research group members retrieved successfully", response));
    }

    @GetMapping("/managed")
    @PreAuthorize("hasRole('LECTURER')")
    @Operation(summary = "Search research groups managed by current user with filters")
    public ResponseEntity<ApiResponse<PageResponse<List<SecureResearchGroupResponse>>>> filterManagedResearchGroupsAdmin(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) GroupType groupType,
            @RequestParam(required = false) Boolean isPrivate,
            @RequestParam(required = false) Boolean active) {

        PageResponse<List<SecureResearchGroupResponse>> response = researchGroupService.filterManagedResearchGroups(
                page, limit, keyword, groupType, isPrivate, active);

        return ResponseEntity.ok(ApiResponse.success("Managed research groups retrieved successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    @Operation(summary = "Toggle research group active status (creator or admin)")
    public ResponseEntity<ApiResponse<SecureResearchGroupResponse>> toggleActiveStatus(
            @PathVariable Long id) {
        SecureResearchGroupResponse response = researchGroupService.toggleActiveStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Research group status toggled successfully", response));
    }

    @GetMapping("/{id}/search-to-invite")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Search users to invite to group", description = "Search users by keyword excluding those already in the group")
    public ResponseEntity<ApiResponse<PageResponse<List<UserResponse>>>> filterUsersToInvite(
            @PathVariable Long id,
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Search keyword") @RequestParam(required = false) String keyword) {
        PageResponse<List<UserResponse>> users = researchGroupService.filterUsersToInvite(page, size, id, keyword);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/joined")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get joined research groups of current user")
    public ResponseEntity<ApiResponse<PageResponse<List<ResearchGroupResponse>>>> findMyJoinedGroups(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        PageResponse<List<ResearchGroupResponse>> response = researchGroupService.findMyJoinedGroups(page, limit);
        return ResponseEntity.ok(ApiResponse.success("Joined groups retrieved successfully", response));
    }
}
