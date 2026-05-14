package iuh.labbooking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.labbooking.dto.request.attendance.CheckInRequest;
import iuh.labbooking.dto.request.attendance.CheckOutRequest;
import iuh.labbooking.dto.response.attendance.AttendanceResponse;
import iuh.labbooking.dto.response.attendance.AttendanceStatusResponse;
import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.service.attendance.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/attendances")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Check-in/Check-out APIs")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/{bookingId}/checkin")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check in to a booking")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(
            @PathVariable Long bookingId,
            @Valid @RequestBody CheckInRequest request) {
        AttendanceResponse response = attendanceService.checkIn(bookingId, request);
        return ResponseEntity.ok(ApiResponse.success("Checked in successfully", response));
    }

    @PostMapping("/{bookingId}/checkout")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check out from a booking")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkOut(
            @PathVariable Long bookingId,
            @Valid @RequestBody CheckOutRequest request) {
        AttendanceResponse response = attendanceService.checkOut(bookingId, request);
        return ResponseEntity.ok(ApiResponse.success("Checked out successfully", response));
    }

    @GetMapping("/status/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get attendance status for a booking")
    public ResponseEntity<ApiResponse<AttendanceStatusResponse>> findAttendanceStatus(
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success("Retrieved status successfully",
                attendanceService.findAttendanceStatusByBookingId(bookingId)));
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Get all attendance records for a booking (Lecturer/Admin only)")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> findAttendancesByBookingId(
            @PathVariable Long bookingId) {
        List<AttendanceResponse> response = attendanceService.findAttendancesByBookingId(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Attendances retrieved successfully", response));
    }
}
