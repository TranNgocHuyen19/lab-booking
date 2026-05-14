package iuh.labbooking.controller;

import iuh.labbooking.dto.response.dashboard.lecturer.LecturerDashboardResponse;
import iuh.labbooking.service.dashboard.LecturerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.RequestParam;
import java.time.LocalDate;

import iuh.labbooking.dto.response.base.ApiResponse;

@RestController
@RequestMapping("lecturer/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('LECTURER')")
public class LecturerDashboardController {

    private final LecturerDashboardService lecturerDashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<LecturerDashboardResponse>> getLecturerDashboard(
            @RequestParam(name = "fromDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(name = "toDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(ApiResponse.success("Retrieved lecturer dashboard data successfully", lecturerDashboardService.getLecturerDashboard(fromDate, toDate)));
    }
}
