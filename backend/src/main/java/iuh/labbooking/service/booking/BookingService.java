package iuh.labbooking.service.booking;

import iuh.labbooking.dto.request.booking.AddParticipantRequest;
import iuh.labbooking.dto.request.booking.BookingStatusRequest;
import iuh.labbooking.dto.request.booking.CancelBookingRequest;
import iuh.labbooking.dto.request.booking.CreateBookingRequest;
import iuh.labbooking.dto.request.booking.UpdateBookingRequest;
import iuh.labbooking.dto.response.booking.*;
import iuh.labbooking.dto.response.bookinghistory.BookingStatusHistoryResponse;
import iuh.labbooking.dto.response.base.PageResponse;


import iuh.labbooking.dto.response.participant.ParticipantResponse;
import iuh.labbooking.dto.response.participant.SecureParticipantResponse;

import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.RequestStatus;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {
        BookingResponse createBooking(CreateBookingRequest request);

        BookingResponse updateBooking(Long id, UpdateBookingRequest request);

        BookingResponse cancelBooking(Long bookingRequestId, CancelBookingRequest request);

        BookingResponse leaveBooking(Long bookingRequestId);

        List<BookingResponse> findMyBookings();

        List<SecureBookingResponse> findMyGroupBookings();

        BookingResponse findBookingById(Long bookingRequestId);

        SecureBookingResponse findBookingByIdAdmin(Long bookingRequestId);

        SecureBookingResponse approveBooking(Long bookingRequestId, BookingStatusRequest request);

        SecureBookingResponse rejectBooking(Long bookingRequestId, BookingStatusRequest request);

        void bulkApprove(List<Long> bookingRequestIds, String note);

        void bulkReject(List<Long> bookingRequestIds, String reason);

        void bulkSystemCancel(List<Long> bookingRequestIds, String reason);

        SecureBookingResponse systemCancelBooking(Long bookingRequestId, BookingStatusRequest request);

        BookingResponse addParticipants(Long bookingRequestId, List<AddParticipantRequest> request);

        List<SecureBookingResponse> findBookingsByLabRoom(Long labRoomId);

        PageResponse<List<SecureBookingResponse>> filterBookingRequestsAdmin(
                        int page, int limit, String keyword, BookingType type, RequestStatus status, Long roomId);

        PageResponse<List<SecureParticipantResponse>> findBookingParticipants(Long bookingRequestId, int page,
                        int limit,
                        String search);

        PageResponse<List<ParticipantResponse>> findBookingParticipantsBasic(Long bookingRequestId, int page, int limit,
                        String search);

        List<String> findBookingParticipantUsernames(Long bookingRequestId);

        List<PendingBookingResponse> findRecentPendingBookings(int limit);

        SlotBookingDetailResponse findSlotBookingDetail(
                        Long labRoomId, Long slotId, LocalDate bookingDate);

        List<SlotBookingDetailParticipant> findBookingParticipantsForSlotDetail(
                        Long bookingRequestId);

        List<BookingStatusHistoryResponse> findBookingStatusHistory(Long bookingRequestId);
}

