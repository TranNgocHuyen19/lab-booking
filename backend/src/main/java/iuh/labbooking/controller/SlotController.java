package iuh.labbooking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.labbooking.dto.request.slot.BulkSlotStatusRequest;
import iuh.labbooking.dto.request.slot.SlotRequest;
import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.slot.SlotResponse;
import iuh.labbooking.dto.response.slot.SecureSlotResponse;
import iuh.labbooking.service.slot.SlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/slots")
@RequiredArgsConstructor
@Tag(name = "Slot", description = "APIs for slot management")
public class SlotController {

    private final SlotService slotService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create slot", description = "Role: ADMIN")
    public ResponseEntity<ApiResponse<SecureSlotResponse>> createSlot(@RequestBody @Valid SlotRequest request) {
        SecureSlotResponse response = slotService.createSlot(request);
        return ResponseEntity.ok(ApiResponse.created("Slot created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update slot", description = "Role: ADMIN")
    public ResponseEntity<ApiResponse<SecureSlotResponse>> updateSlot(
            @PathVariable Long id,
            @RequestBody @Valid SlotRequest request) {
        SecureSlotResponse response = slotService.updateSlot(id, request);
        return ResponseEntity.ok(ApiResponse.success("Slot updated successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Find slot by ID", description = "Role: ADMIN")
    public ResponseEntity<ApiResponse<SecureSlotResponse>> findSlotById(@PathVariable Long id) {
        SecureSlotResponse response = slotService.findSlotById(id);
        return ResponseEntity.ok(ApiResponse.success("Slot retrieved successfully", response));
    }

    @GetMapping
    @Operation(summary = "Find slots", description = "Public access")
    public ResponseEntity<ApiResponse<PageResponse<List<SlotResponse>>>> findSlots(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String keyword) {
        PageResponse<List<SlotResponse>> response = slotService.findSlots(page, limit, keyword);
        return ResponseEntity.ok(ApiResponse.success("Slots retrieved successfully", response));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Filter slots (Admin)", description = "Role: ADMIN")
    public ResponseEntity<ApiResponse<PageResponse<List<SecureSlotResponse>>>> filterSlotsAdmin(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active) {
        PageResponse<List<SecureSlotResponse>> response = slotService.filterSlots(page, limit, keyword, active);
        return ResponseEntity.ok(ApiResponse.success("Slots retrieved successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle slot status", description = "Role: ADMIN")
    public ResponseEntity<ApiResponse<Void>> toggleSlotStatus(@PathVariable Long id) {
        slotService.toggleSlotStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Slot status toggled successfully", null));
    }

    @PatchMapping("/actions/bulk-active")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk update slot status", description = "Role: ADMIN")
    public ResponseEntity<ApiResponse<Void>> updateSlotsStatus(@RequestBody @Valid BulkSlotStatusRequest request) {
        slotService.updateSlotsStatus(request);
        return ResponseEntity.ok(ApiResponse.success("Slots status updated successfully", null));
    }
}
