package iuh.labbooking.controller;

import iuh.labbooking.dto.request.user.ChangePasswordRequest;
import iuh.labbooking.dto.request.user.CreateUserRequest;
import iuh.labbooking.dto.request.user.UpdateUserRequest;
import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.user.SecureUserResponse;
import iuh.labbooking.dto.response.user.UserResponse;
import iuh.labbooking.service.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    private final UserService userService;

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update profile", description = "Update current user's editable profile fields")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my profile", description = "Get current user's detailed profile including role-specific data")
    public ResponseEntity<ApiResponse<UserResponse>> findMyProfileDetailed() {
        UserResponse response = userService.findMyProfileDetailed();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Change my password", description = "Change current user's password and revoke all tokens (logout all devices)")
    public ResponseEntity<ApiResponse<Void>> changeMyPassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changeMyPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully. Please login again.", null));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new user", description = "Create a new user account")
    public ResponseEntity<ApiResponse<SecureUserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        SecureUserResponse user = userService.createUser(request);
        return new ResponseEntity<>(ApiResponse.created(user), HttpStatus.CREATED);
    }

    @GetMapping("/{username}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user by username", description = "Retrieve user information by username")
    public ResponseEntity<ApiResponse<UserResponse>> findUserByUsername(
            @Parameter(description = "Username of the user") @PathVariable String username) {
        UserResponse user = userService.findUserByUsername(username);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Get all users", description = "Retrieve all users with pagination and sorting")
    public ResponseEntity<ApiResponse<PageResponse<List<SecureUserResponse>>>> findAllUsersAdmin(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "username") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDir) {
        PageResponse<List<SecureUserResponse>> users = userService.findAllUsersAdmin(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Search users", description = "Search users by keyword (username, fullName, emailIuh)")
    public ResponseEntity<ApiResponse<PageResponse<List<UserResponse>>>> filterUsers(
            @Parameter(description = "Search keyword") @RequestParam(required = false) String keyword,
            @Parameter(description = "Role to filter") @RequestParam(required = false) String role,
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        PageResponse<List<UserResponse>> users = userService.filterUsers(keyword, role, page, size);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Get all users (Admin)", description = "Filter users by keyword, role, and active status")
    public ResponseEntity<ApiResponse<PageResponse<List<SecureUserResponse>>>> findAllUsersForAdmin(
            @Parameter(description = "Search keyword") @RequestParam(required = false) String keyword,
            @Parameter(description = "Role to filter") @RequestParam(required = false) String role,
            @Parameter(description = "Active status") @RequestParam(required = false) Boolean active,
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        PageResponse<List<SecureUserResponse>> users = userService.filterUsersAdmin(keyword, role, active, page, size);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user profile (Admin)", description = "Admin update any user's profile")
    public ResponseEntity<ApiResponse<SecureUserResponse>> updateUserAdmin(
            @PathVariable String username,
            @Valid @RequestBody UpdateUserRequest request) {
        SecureUserResponse response = userService.updateUserAdmin(username, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Delete a user by username")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @Parameter(description = "Username of the user") @PathVariable String username) {
        userService.deleteUser(username);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @PatchMapping("/{username}/password")
    @Operation(summary = "Change password (Admin)", description = "Admin change user password - does not revoke tokens")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Parameter(description = "Username of the user") @PathVariable String username,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(username, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PatchMapping("/{username}/active")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user active status", description = "Activate or deactivate a user")
    public ResponseEntity<ApiResponse<Void>> updateActive(
            @Parameter(description = "Username of the user") @PathVariable String username,
            @Parameter(description = "Active status") @RequestParam boolean active) {
        userService.updateActive(username, active);
        return ResponseEntity.ok(ApiResponse.success("Active status updated successfully", null));
    }
}
