package iuh.labbooking.controller;

import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.schedule.WeekScheduleResponse;
import iuh.labbooking.service.schedule.LabRoomScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/lab-rooms")
@RequiredArgsConstructor
@Tag(name = "Lab Room Schedule", description = "APIs for laboratory room schedules")
public class LabRoomScheduleController {

    private final LabRoomScheduleService labRoomScheduleService;

    @GetMapping("/schedule")
    @Operation(summary = "Get lab room schedule for a week", description = "Returns the complete schedule for all lab rooms for the week containing the specified date (Monday to Sunday, ISO-8601)")
    public ResponseEntity<ApiResponse<WeekScheduleResponse>> findWeekSchedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        WeekScheduleResponse response = labRoomScheduleService.findWeekSchedule(date);
        return ResponseEntity.ok(ApiResponse.success("Week schedule retrieved successfully", response));
    }

    @GetMapping("/schedule/admin")
    @Operation(summary = "Get lab room schedule for a week (Admin)", description = "Returns the complete schedule for all lab rooms for the week containing the specified date, including expired slots")
    public ResponseEntity<ApiResponse<WeekScheduleResponse>> findWeekScheduleAdmin(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        WeekScheduleResponse response = labRoomScheduleService.findWeekScheduleAdmin(date);
        return ResponseEntity.ok(ApiResponse.success("Admin week schedule retrieved successfully", response));
    }
}
