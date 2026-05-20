package iuh.labbooking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.labbooking.dto.request.booking.*;
import iuh.labbooking.dto.response.base.ApiResponse;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.booking.*;
import iuh.labbooking.dto.response.bookinghistory.BookingStatusHistoryResponse;

import iuh.labbooking.dto.response.participant.ParticipantResponse;
import iuh.labbooking.dto.response.participant.SecureParticipantResponse;
import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.service.booking.BookingService;
import iuh.labbooking.service.booking.conflict.ResolveScheduleConflictService;
import iuh.labbooking.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking", description = "Booking management APIs")
public class BookingController {

    private final BookingService bookingService;
    private final ResolveScheduleConflictService resolveScheduleConflictService;
    private final SecurityUtil securityUtil;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create booking request")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request) {
        BookingResponse response = bookingService.createBookingV2(request);
        return ResponseEntity.ok(ApiResponse.success("Booking created successfully", response));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update booking request (creator/admin/group lecturer only)")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBookingRequest request) {
        BookingResponse response = bookingService.updateBooking(id, request);
        return ResponseEntity.ok(ApiResponse.success("Booking updated successfully", response));
    }

    @PostMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancel booking (creator only)")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id, @RequestBody(required = false) CancelBookingRequest request) {
        BookingResponse response = bookingService.cancelBooking(id, request);
        return ResponseEntity.ok(ApiResponse.success("Booking canceled successfully", response));
    }

    @DeleteMapping("/{id}/participants/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Leave booking (participant only)")
    public ResponseEntity<ApiResponse<BookingResponse>> leaveBooking(
            @PathVariable Long id) {
        BookingResponse response = bookingService.leaveBooking(id);
        return ResponseEntity.ok(ApiResponse.success("Left booking successfully", response));
    }

    @PostMapping("/participants/{participantId}/resolve-conflict")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Resolve a participant schedule conflict")
    public ResponseEntity<ApiResponse<Void>> resolveParticipantConflict(
            @PathVariable Long participantId,
            @Valid @RequestBody ResolveParticipantConflictRequest request) {
        resolveScheduleConflictService.resolveParticipantConflict(
                securityUtil.getCurrentUserId(),
                participantId,
                request);
        return ResponseEntity.ok(ApiResponse.success("Participant conflict resolved successfully", null));
    }

    @PostMapping("/{id}/participants")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add participants to THESIS booking (creator only)")
    public ResponseEntity<ApiResponse<BookingResponse>> addParticipants(
            @PathVariable Long id,
            @Valid @RequestBody List<AddParticipantRequest> request) {
        BookingResponse response = bookingService.addParticipants(id, request);
        return ResponseEntity.ok(ApiResponse.success("Participants added successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> findMyBookings() {
        List<BookingResponse> response = bookingService.findMyBookings();
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", response));
    }

    @GetMapping("/my-groups")
    @PreAuthorize("hasRole('LECTURER')")
    @Operation(summary = "Get bookings of researcher groups where current user is owner or member")
    public ResponseEntity<ApiResponse<List<SecureBookingResponse>>> findMyGroupBookings() {
        List<SecureBookingResponse> response = bookingService.findMyGroupBookings();
        return ResponseEntity.ok(ApiResponse.success("Group bookings retrieved successfully", response));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Filter booking requests for admin")
    public ResponseEntity<ApiResponse<PageResponse<List<SecureBookingResponse>>>> filterBookingRequestsAdmin(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BookingType type,
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) Long roomId) {
        return ResponseEntity.ok(ApiResponse.success("Booking requests filtered successfully",
                bookingService.filterBookingRequestsAdmin(page, limit, keyword, type, status, roomId)));
    }

    @GetMapping("/{id}/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Get booking detail with full audit info (creator/admin only)")
    public ResponseEntity<ApiResponse<SecureBookingResponse>> findBookingByIdAdmin(
            @PathVariable Long id) {
        SecureBookingResponse response = bookingService.findBookingByIdAdmin(id);
        return ResponseEntity.ok(ApiResponse.success("Booking retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get booking detail (with access control)")
    public ResponseEntity<ApiResponse<BookingResponse>> findBookingById(
            @PathVariable Long id) {
        BookingResponse response = bookingService.findBookingById(id);
        return ResponseEntity.ok(ApiResponse.success("Booking retrieved successfully", response));
    }

    @GetMapping("/lab-room/{labRoomId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all bookings for a lab room (admin only)")
    public ResponseEntity<ApiResponse<List<SecureBookingResponse>>> findBookingsByLabRoom(
            @PathVariable Long labRoomId) {
        List<SecureBookingResponse> response = bookingService.findBookingsByLabRoom(labRoomId);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", response));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Approve booking request (ADMIN/LECTURER only)")
    public ResponseEntity<ApiResponse<SecureBookingResponse>> approveBooking(
            @PathVariable Long id,
            @RequestBody(required = false) BookingStatusRequest request) {
        SecureBookingResponse response = bookingService.approveBooking(id, request);
        return ResponseEntity.ok(ApiResponse.success("Booking approved successfully", response));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Reject booking request (ADMIN/LECTURER only)")
    public ResponseEntity<ApiResponse<SecureBookingResponse>> rejectBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusRequest request) {
        SecureBookingResponse response = bookingService.rejectBooking(id, request);
        return ResponseEntity.ok(ApiResponse.success("Booking rejected successfully", response));
    }

    @PostMapping("/{id}/system-cancel")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "System cancel booking request (ADMIN only)")
    public ResponseEntity<ApiResponse<SecureBookingResponse>> systemCancelBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusRequest request) {
        SecureBookingResponse response = bookingService.systemCancelBooking(id, request);
        return ResponseEntity.ok(ApiResponse.success("Booking system-canceled successfully", response));
    }

    @PostMapping("/actions/bulk-approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk approve booking requests (ADMIN only)")
    public ResponseEntity<ApiResponse<Void>> bulkApprove(
            @Valid @RequestBody BulkBookingUpdate request) {
        bookingService.bulkApprove(request.requestIds(), request.reason());
        return ResponseEntity.ok(ApiResponse.success("Bookings approved successfully", null));
    }

    @PostMapping("/actions/bulk-reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk reject booking requests (ADMIN only)")
    public ResponseEntity<ApiResponse<Void>> bulkReject(
            @Valid @RequestBody BulkBookingUpdate request) {
        bookingService.bulkReject(request.requestIds(), request.reason());
        return ResponseEntity.ok(ApiResponse.success("Bookings rejected successfully", null));
    }

    @PostMapping("/actions/bulk-system-cancel")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bulk system-cancel booking requests (ADMIN only)")
    public ResponseEntity<ApiResponse<Void>> bulkSystemCancel(
            @Valid @RequestBody BulkBookingUpdate request) {
        bookingService.bulkSystemCancel(request.requestIds(), request.reason());
        return ResponseEntity.ok(ApiResponse.success("Bookings system-canceled successfully", null));
    }


    @GetMapping("/{id}/participants-detail")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Get paginated booking participants with attendance info (creator/admin/lecturer/participant only)")
    public ResponseEntity<ApiResponse<PageResponse<List<SecureParticipantResponse>>>> findBookingParticipants(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success("Participants retrieved successfully",
                bookingService.findBookingParticipants(id, page, limit, search)));
    }

    @GetMapping("/{id}/participants")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get paginated basic booking participants (creator/participant only)")
    public ResponseEntity<ApiResponse<PageResponse<List<ParticipantResponse>>>> findBookingParticipantsBasic(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success("Participants retrieved successfully",
                bookingService.findBookingParticipantsBasic(id, page, limit, search)));
    }

    @GetMapping("/{id}/participant-usernames")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all participant usernames of a booking")
    public ResponseEntity<ApiResponse<List<String>>> findBookingParticipantUsernames(
            @PathVariable Long id) {
        List<String> response = bookingService.findBookingParticipantUsernames(id);
        return ResponseEntity.ok(ApiResponse.success("Usernames retrieved successfully", response));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get recent pending bookings for dashboard")
    public ResponseEntity<ApiResponse<List<PendingBookingResponse>>> findRecentPendingBookings(
            @RequestParam(defaultValue = "5") int limit) {
        List<PendingBookingResponse> response = bookingService.findRecentPendingBookings(limit);
        return ResponseEntity.ok(ApiResponse.success("Pending bookings retrieved successfully", response));
    }

    @GetMapping("/slot-detail")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get booking detail for a specific slot/room/date (Admin schedule dialog)")
    public ResponseEntity<ApiResponse<SlotBookingDetailResponse>> findSlotBookingDetail(
            @RequestParam Long labRoomId,
            @RequestParam Long slotId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bookingDate) {
        SlotBookingDetailResponse response = bookingService.findSlotBookingDetail(labRoomId, slotId, bookingDate);
        return ResponseEntity.ok(ApiResponse.success("Slot booking detail retrieved successfully", response));
    }

    @GetMapping("/{id}/slot-detail-participants")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get participants list for a booking in slot detail dialog")
    public ResponseEntity<ApiResponse<List<SlotBookingDetailParticipant>>> findBookingParticipantsForSlotDetail(
            @PathVariable Long id) {
        var response = bookingService.findBookingParticipantsForSlotDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Participants retrieved successfully", response));
    }

    @GetMapping("/{id}/status-history")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Get booking status history (Admin/Lecturer only)")
    public ResponseEntity<ApiResponse<List<BookingStatusHistoryResponse>>> findBookingStatusHistory(
            @PathVariable Long id) {
        List<BookingStatusHistoryResponse> response = bookingService.findBookingStatusHistory(id);
        return ResponseEntity.ok(ApiResponse.success("Booking status history retrieved successfully", response));
    }
}
