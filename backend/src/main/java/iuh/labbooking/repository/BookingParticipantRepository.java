package iuh.labbooking.repository;

import iuh.labbooking.dto.response.participant.ParticipantResponse;
import iuh.labbooking.dto.response.participant.SecureParticipantResponse;
import iuh.labbooking.enums.ParticipantStatus;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.model.BookingParticipant;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface BookingParticipantRepository extends JpaRepository<BookingParticipant, Long> {
        @Query("""
                            SELECT bp.bookingRequest.bookingRequestId, COUNT(bp)
                            FROM BookingParticipant bp
                            WHERE bp.bookingRequest.bookingRequestId IN :requestIds
                            AND bp.status = 'ACTIVE'
                            AND bp.bookingRequest.status IN ('PENDING', 'APPROVED')
                            GROUP BY bp.bookingRequest.bookingRequestId
                        """)
        List<Object[]> countParticipantsByBookingRequestIds(@Param("requestIds") Set<Long> requestIds);

        List<BookingParticipant> findByBookingRequest(BookingRequest bookingRequest);

        Optional<BookingParticipant> findByBookingRequestAndUser(
                        BookingRequest bookingRequest,
                        User user);

        List<BookingParticipant> findByUserAndStatus(User user, ParticipantStatus status);

        long countByBookingRequestAndStatus(
                        BookingRequest bookingRequest,
                        ParticipantStatus status);

        boolean existsByBookingRequestAndUserAndStatus(
                        BookingRequest bookingRequest,
                        User user,
                        ParticipantStatus status);

        List<BookingParticipant> findByBookingRequestAndStatus(
                        BookingRequest bookingRequest,
                        ParticipantStatus status);

        @Query("""
                        SELECT COUNT(bp) > 0
                        FROM BookingParticipant bp
                        JOIN bp.bookingRequest br
                        JOIN SlotBooking sb ON sb.bookingRequest = br
                        WHERE bp.user.userId IN :userIds
                          AND bp.status = 'ACTIVE'
                          AND br.status IN ('PENDING', 'APPROVED')
                          AND (:excludeId IS NULL OR br.bookingRequestId <> :excludeId)
                          AND sb.bookingDate = :bookingDate
                          AND sb.slot.slotId IN :slotIds
                        """)
        boolean existsAnyUserSlotConflict(
                        @Param("userIds") List<Long> userIds,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotIds") List<Long> slotIds,
                        @Param("excludeId") Long excludeId);

        @Query("""
                        SELECT DISTINCT bp.user
                        FROM BookingParticipant bp
                        JOIN bp.bookingRequest br
                        JOIN SlotBooking sb ON sb.bookingRequest = br
                        WHERE bp.user.userId IN :userIds
                          AND bp.status = 'ACTIVE'
                          AND br.status IN ('PENDING', 'APPROVED')
                          AND (:excludeId IS NULL OR br.bookingRequestId <> :excludeId)
                          AND sb.bookingDate = :bookingDate
                          AND sb.slot.slotId IN :slotIds
                        """)
        List<User> findConflictingUsers(
                        @Param("userIds") List<Long> userIds,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotIds") List<Long> slotIds,
                        @Param("excludeId") Long excludeId);

        int countByBookingRequest(BookingRequest bookingRequest);

        @Query("""
                            SELECT new iuh.labbooking.dto.response.participant.SecureParticipantResponse(
                                p.bookingParticipantId,
                                p.user.userId,
                                p.user.username,
                                p.user.fullName,
                                p.role,
                                p.status,
                                p.createdAt,
                                p.createdBy,
                                p.modifiedAt,
                                p.modifiedBy,
                                a.checkinAt,
                                a.checkoutAt,
                                a.checkinStatus,
                                a.checkoutStatus,
                                a.lateCheckinMinutes,
                                a.earlyCheckoutMinutes,
                                a.lateCheckoutMinutes,
                                a.checkinNote,
                                a.checkoutNote
                            )
                            FROM BookingParticipant p
                            LEFT JOIN BookingSlotAttendance a ON a.bookingParticipant = p
                            WHERE p.bookingRequest.bookingRequestId = :bookingId
                            AND (:search IS NULL OR :search = '' OR LOWER(p.user.username) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')))
                            ORDER BY p.role ASC, p.user.username ASC
                        """)
        Page<SecureParticipantResponse> findParticipantsWithAttendance(
                        @Param("bookingId") Long bookingId,
                        @Param("search") String search,
                        Pageable pageable);

        @Query("""
                            SELECT new iuh.labbooking.dto.response.participant.ParticipantResponse(
                                p.bookingParticipantId,
                                p.user.userId,
                                p.user.username,
                                p.user.fullName,
                                p.role,
                                p.status
                            )
                            FROM BookingParticipant p
                            WHERE p.bookingRequest.bookingRequestId = :bookingId
                            AND (:search IS NULL OR :search = '' OR LOWER(p.user.username) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')))
                            ORDER BY p.role ASC, p.user.username ASC
                        """)
        Page<ParticipantResponse> findParticipantsBasic(
                        @Param("bookingId") Long bookingId,
                        @Param("search") String search,
                        Pageable pageable);

        @Query("""
                        SELECT COUNT(bp) > 0
                        FROM BookingParticipant bp
                        JOIN bp.bookingRequest br
                        JOIN br.slotBookings sb
                        WHERE bp.user.userId = :userId
                          AND br.bookingType = 'PERSONAL'
                          AND br.status IN :activeStatuses
                          AND bp.status IN :participantStatuses
                          AND sb.bookingDate = :bookingDate
                          AND sb.slot.slotId IN :slotIds
                        """)
        boolean existsPersonalBookingForUser(
                        @Param("userId") Long userId,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotIds") List<Long> slotIds,
                        @Param("activeStatuses") List<RequestStatus> activeStatuses,
                        @Param("participantStatuses") List<ParticipantStatus> participantStatuses);

        @Query("""
                        SELECT COUNT(bp) > 0
                        FROM BookingParticipant bp
                        JOIN bp.bookingRequest br
                        JOIN br.slotBookings sb
                        WHERE bp.user.userId = :userId
                          AND br.bookingType = 'GROUP'
                          AND br.status IN :activeStatuses
                          AND bp.status = :participantStatus
                          AND sb.bookingDate = :bookingDate
                          AND sb.slot.slotId IN :slotIds
                        """)
        boolean existsGroupBookingForUserByParticipantStatus(
                        @Param("userId") Long userId,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotIds") List<Long> slotIds,
                        @Param("activeStatuses") List<RequestStatus> activeStatuses,
                        @Param("participantStatus") ParticipantStatus participantStatus);

        @Query("""
                        SELECT DISTINCT bp
                        FROM BookingParticipant bp
                        JOIN FETCH bp.bookingRequest br
                        JOIN br.slotBookings sb
                        WHERE bp.user.userId = :userId
                          AND br.bookingType = 'GROUP'
                          AND br.status IN :activeStatuses
                          AND bp.status IN :participantStatuses
                          AND sb.bookingDate = :bookingDate
                          AND sb.slot.slotId IN :slotIds
                        """)
        List<BookingParticipant> findGroupParticipantsForUserByStatuses(
                        @Param("userId") Long userId,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotIds") List<Long> slotIds,
                        @Param("activeStatuses") List<RequestStatus> activeStatuses,
                        @Param("participantStatuses") List<ParticipantStatus> participantStatuses);
}
