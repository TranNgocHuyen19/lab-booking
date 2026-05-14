package iuh.labbooking.repository;

import iuh.labbooking.model.BookingRequestStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRequestStatusHistoryRepository extends JpaRepository<BookingRequestStatusHistory, Long> {
    List<BookingRequestStatusHistory> findByBookingRequestBookingRequestIdOrderByCreatedAtDesc(Long bookingRequestId);
}
