package iuh.labbooking.controller;

import iuh.labbooking.dto.request.labroom.BulkLabRoomStatusRequest;
import iuh.labbooking.dto.request.labroom.LabRoomRequest;
import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.labroom.LabRoomResponse;
import iuh.labbooking.dto.response.labroom.SecureLabRoomResponse;
import iuh.labbooking.service.labroom.LabRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lab-rooms")
@RequiredArgsConstructor
@Tag(name = "Lab Room", description = "APIs for lab room management")
public class LabRoomController {

    private final LabRoomService labRoomService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create lab room", description = "Role: ADMIN")
    public ResponseEntity<ApiResponse<SecureLabRoomResponse>> createLabRoom(@RequestBody @Valid LabRoomRequest request) {
        SecureLabRoomResponse response = labRoomService.createLabRoom(request);
        return ResponseEntity.ok(ApiResponse.created("Lab room created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update lab room", description = "Role: ADMIN")
    public ResponseEntity<ApiResponse<SecureLabRoomResponse>> updateLabRoom(
            @PathVariable Long id,
            @RequestBody @Valid LabRoomRequest request) {
        SecureLabRoomResponse response = labRoomService.updateLabRoom(id, request);
        return ResponseEntity.ok(ApiResponse.success("Lab room updated successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Find lab room by ID", description = "Public access - returns basic lab room info")
    public ResponseEntity<ApiResponse<LabRoomResponse>> findPublicLabRoomById(@PathVariable Long id) {
        LabRoomResponse response = labRoomService.findPublicLabRoomById(id);
        return ResponseEntity.ok(ApiResponse.success("Lab room retrieved successfully", response));
    }

    @GetMapping("/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Find lab room by ID (Admin)", description = "Admin access - returns secure lab room info")
    public ResponseEntity<ApiResponse<SecureLabRoomResponse>> findLabRoomById(@PathVariable Long id) {
        SecureLabRoomResponse response = labRoomService.findLabRoomById(id);
        return ResponseEntity.ok(ApiResponse.success("Lab room retrieved successfully", response));
    }

    @GetMapping
    @Operation(summary = "Find lab rooms", description = "Public access")
    public ResponseEntity<ApiResponse<PageResponse<List<LabRoomResponse>>>> findLabRoomsAdmin(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String keyword) {
        PageResponse<List<LabRoomResponse>> response = labRoomService.findLabRooms(page, limit, keyword);
        return ResponseEntity.ok(ApiResponse.success("Lab rooms retrieved successfully", response));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Find all lab rooms (admin)", description = "Admin only")
    public ResponseEntity<ApiResponse<PageResponse<List<SecureLabRoomResponse>>>> filterLabRoomsAdmin(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active) {
        PageResponse<List<SecureLabRoomResponse>> response = labRoomService.filterLabRoomsAdmin(page, limit, keyword, active);
        return ResponseEntity.ok(ApiResponse.success("All lab rooms retrieved successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle lab room status", description = "Role: ADMIN")
    public ResponseEntity<ApiResponse<Void>> toggleLabRoomStatus(@PathVariable Long id) {
        labRoomService.toggleLabRoomStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Lab room status toggled successfully", null));
    }

    @PatchMapping("/actions/bulk-active")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk update lab room status", description = "Role: ADMIN")
    public ResponseEntity<ApiResponse<Void>> updateLabRoomsStatus(@RequestBody @Valid BulkLabRoomStatusRequest request) {
        labRoomService.updateLabRoomsStatus(request);
        return ResponseEntity.ok(ApiResponse.success("Lab rooms status updated successfully", null));
    }
}
