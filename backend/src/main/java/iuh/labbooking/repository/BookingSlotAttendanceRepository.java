package iuh.labbooking.repository;

import iuh.labbooking.model.BookingSlotAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingSlotAttendanceRepository extends JpaRepository<BookingSlotAttendance, Long> {
    @Query("""
                        SELECT DISTINCT a FROM BookingSlotAttendance a
                        JOIN FETCH a.bookingRequest br
                        JOIN FETCH br.labRoom
                        JOIN br.slotBookings sb
                        JOIN FETCH a.bookingParticipant bp
                        JOIN FETCH bp.user
                        WHERE bp.user = :user
                        AND sb.bookingDate >= :fromDate
                        ORDER BY sb.bookingDate DESC
                        """)
    List<BookingSlotAttendance> findByUserAndDateAfter(
            @Param("user") iuh.labbooking.model.User user,
            @Param("fromDate") java.time.LocalDate fromDate);

    @Query("""
                        SELECT a FROM BookingSlotAttendance a
                        JOIN FETCH a.bookingRequest br
                        JOIN FETCH br.labRoom
                        JOIN FETCH a.bookingParticipant bp
                        JOIN FETCH bp.user
                        WHERE a.bookingSlotAttendanceId = :attendanceId
                        AND bp.user = :user
                        """)
    Optional<BookingSlotAttendance> findByBookingSlotAttendanceIdAndBookingParticipant_User(
            @Param("attendanceId") Long attendanceId,
            @Param("user") iuh.labbooking.model.User user);

    @Query("""
                        SELECT a FROM BookingSlotAttendance a
                        JOIN FETCH a.bookingRequest br
                        JOIN FETCH br.labRoom
                        JOIN FETCH a.bookingParticipant bp
                        JOIN FETCH bp.user
                        WHERE br.bookingRequestId = :bookingId
                        AND bp.user = :user
                        """)
    Optional<BookingSlotAttendance> findByBookingRequest_BookingRequestIdAndBookingParticipant_User(
            @Param("bookingId") Long bookingId,
            @Param("user") iuh.labbooking.model.User user);

    List<BookingSlotAttendance> findByBookingRequest_BookingRequestId(Long bookingId);

    // ===================== Dashboard KPI Queries =====================

    /**
     * Calculate No-Show rate in a single query
     * Returns [totalActiveParticipants, noShowCount]
     */
    @Query("""
            SELECT COUNT(a), SUM(CASE WHEN a.checkinAt IS NULL THEN 1 ELSE 0 END)
            FROM BookingSlotAttendance a
            JOIN a.bookingRequest br
            JOIN br.slotBookings sb
            WHERE sb.bookingDate BETWEEN :fromDate AND :toDate
              AND br.status = 'APPROVED'
              AND a.bookingParticipant.status = 'ACTIVE'
            """)
    List<Object[]> getNoShowStats(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);
}