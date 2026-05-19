package iuh.labbooking.service.booking;

import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.enums.StatusChangeReason;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.model.BookingRequestStatusHistory;
import iuh.labbooking.repository.BookingRequestStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingHistoryService {

    private final BookingRequestStatusHistoryRepository historyRepository;

    public void saveStatusChange(
            BookingRequest bookingRequest,
            RequestStatus fromStatus,
            RequestStatus toStatus,
            StatusChangeReason reason,
            String note,
            Long relatedBookingRequestId) {

        BookingRequestStatusHistory history = BookingRequestStatusHistory.builder()
                .bookingRequest(bookingRequest)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .changeReason(reason)
                .note(note)
                .relatedBookingRequestId(relatedBookingRequestId)
                .build();

        historyRepository.save(history);
    }
}
