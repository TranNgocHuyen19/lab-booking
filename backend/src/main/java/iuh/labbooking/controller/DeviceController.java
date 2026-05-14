package iuh.labbooking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.labbooking.dto.request.device.BulkDeviceStatusRequest;
import iuh.labbooking.dto.request.device.DeviceRequest;
import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.device.DeviceAvailabilityResponse;
import iuh.labbooking.dto.response.device.DeviceResponse;
import iuh.labbooking.dto.response.device.SecureDeviceResponse;
import iuh.labbooking.service.device.DeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/devices")
@RequiredArgsConstructor
@Tag(name = "Device", description = "APIs for device management")
public class DeviceController {

    private final DeviceService deviceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create device", description = "Role: ADMIN")
    public ResponseEntity<ApiResponse<SecureDeviceResponse>> createDevice(@RequestBody @Valid DeviceRequest request) {
        SecureDeviceResponse response = deviceService.createDevice(request);
        return ResponseEntity.ok(ApiResponse.created("Device created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update device", description = "Role: ADMIN")
    public ResponseEntity<ApiResponse<SecureDeviceResponse>> updateDevice(
            @PathVariable Long id,
            @RequestBody @Valid DeviceRequest request) {
        SecureDeviceResponse response = deviceService.updateDevice(id, request);
        return ResponseEntity.ok(ApiResponse.success("Device updated successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Find device by ID", description = "Role: ADMIN")
    public ResponseEntity<ApiResponse<SecureDeviceResponse>> findDeviceByIdAdmin(@PathVariable Long id) {
        SecureDeviceResponse response = deviceService.findDeviceById(id);
        return ResponseEntity.ok(ApiResponse.success("Device retrieved successfully", response));
    }

    @GetMapping
    @Operation(summary = "Find devices", description = "Public access. Returns only active devices.")
    public ResponseEntity<ApiResponse<PageResponse<List<DeviceResponse>>>> findDevices(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String keyword) {
        PageResponse<List<DeviceResponse>> response = deviceService.findDevices(page, limit, keyword);
        return ResponseEntity.ok(ApiResponse.success("Devices retrieved successfully", response));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Find all devices (admin)", description = "Admin only. Returns all devices including inactive ones with full audit fields.")
    public ResponseEntity<ApiResponse<PageResponse<List<SecureDeviceResponse>>>> filterDevicesAdmin(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active) {
        PageResponse<List<SecureDeviceResponse>> response = deviceService.findAllDevicesForAdmin(page, limit, keyword, active);
        return ResponseEntity.ok(ApiResponse.success("All devices retrieved successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle device status", description = "Role: ADMIN. Toggle device active status.")
    public ResponseEntity<ApiResponse<Void>> toggleDeviceStatus(@PathVariable Long id) {
        deviceService.toggleDeviceStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Device status toggled successfully", null));
    }

    @PatchMapping("/actions/bulk-active")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk update device status", description = "Role: ADMIN. Update active status for multiple devices.")
    public ResponseEntity<ApiResponse<Void>> updateDevicesStatus(@RequestBody @Valid BulkDeviceStatusRequest request) {
        deviceService.updateDevicesStatus(request);
        return ResponseEntity.ok(ApiResponse.success("Devices status updated successfully", null));
    }


    @GetMapping("/availability")
    @Operation(summary = "Get device availability for lab room", description = "Returns available device quantities for selected slots. "
            +
            "availableQuantity is the minimum across all selected slots. " +
            "Only counts PENDING and APPROVED bookings.")
    public ResponseEntity<ApiResponse<List<DeviceAvailabilityResponse>>> findDeviceAvailability(
            @RequestParam Long labRoomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam List<Long> slotIds,
            @RequestParam(required = false) Long excludeBookingId) {

        List<DeviceAvailabilityResponse> response = deviceService.findDeviceAvailability(
                labRoomId, date, slotIds, excludeBookingId);

        return ResponseEntity.ok(ApiResponse.success(
                "Device availability retrieved successfully",
                response));
    }
}
