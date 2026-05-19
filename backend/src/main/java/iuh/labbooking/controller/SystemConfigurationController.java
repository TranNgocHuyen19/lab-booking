package iuh.labbooking.controller;

import iuh.labbooking.dto.request.configuration.UpdateAttendanceSystemConfigRequest;
import iuh.labbooking.dto.request.configuration.UpdateBookingSystemConfigRequest;
import iuh.labbooking.dto.request.configuration.UpdateConfigFieldRequest;
import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.configuration.AttendanceSystemConfigResponse;
import iuh.labbooking.dto.response.configuration.BookingSystemConfigResponse;
import iuh.labbooking.dto.response.configuration.SystemConfigHistoryResponse;
import iuh.labbooking.service.systemconfiguration.SystemConfigurationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.security.PermitAll;

import java.util.List;

@RestController
@RequestMapping("/system-configs")
@RequiredArgsConstructor
public class SystemConfigurationController {

    private final SystemConfigurationService configService;

    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<AttendanceSystemConfigResponse>> getAttendanceConfig() {
        return ResponseEntity.ok(ApiResponse.success(configService.getAttendanceConfigResponse()));
    }

    @PutMapping("/attendance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSystemConfigResponse>> updateAttendanceConfig(
            @RequestBody UpdateAttendanceSystemConfigRequest request) {
        return ResponseEntity.ok(ApiResponse.success(configService.updateAttendanceConfig(request)));
    }

    @PatchMapping("/attendance/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSystemConfigResponse>> updateAttendanceField(
            @PathVariable String key,
            @RequestBody UpdateConfigFieldRequest request) {
        return ResponseEntity.ok(ApiResponse.success(configService.updateAttendanceField(key, request)));
    }

    @GetMapping("/attendance/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SystemConfigHistoryResponse>>> getAttendanceHistory() {
        return ResponseEntity.ok(ApiResponse.success(configService.getAttendanceConfigHistory()));
    }

    @GetMapping("/booking")
    public ResponseEntity<ApiResponse<BookingSystemConfigResponse>> getBookingConfig() {
        return ResponseEntity.ok(ApiResponse.success(configService.getBookingConfigResponse()));
    }

    @PutMapping("/booking")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingSystemConfigResponse>> updateBookingConfig(
            @RequestBody UpdateBookingSystemConfigRequest request) {
        return ResponseEntity.ok(ApiResponse.success(configService.updateBookingConfig(request)));
    }

    @PatchMapping("/booking/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingSystemConfigResponse>> updateBookingField(
            @PathVariable String key,
            @RequestBody UpdateConfigFieldRequest request) {
        return ResponseEntity.ok(ApiResponse.success(configService.updateBookingField(key, request)));
    }

    @GetMapping("/booking/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SystemConfigHistoryResponse>>> getBookingHistory() {
        return ResponseEntity.ok(ApiResponse.success(configService.getBookingConfigHistory()));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SystemConfigHistoryResponse>>> getAllConfigHistory() {
        return ResponseEntity.ok(ApiResponse.success(configService.getAllConfigHistory()));
    }
}
