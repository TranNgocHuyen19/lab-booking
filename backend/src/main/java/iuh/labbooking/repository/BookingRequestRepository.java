package iuh.labbooking.repository;

import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.enums.ParticipantStatus;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.model.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import iuh.labbooking.enums.BookingType;

@Repository
public interface BookingRequestRepository
                extends JpaRepository<BookingRequest, Long> {
        @EntityGraph(attributePaths = { "researchGroup", "participants", "bookingDevices", "slotBookings", "labRoom" })
        Optional<BookingRequest> findByBookingRequestId(Long id);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT b FROM BookingRequest b WHERE b.bookingRequestId = :id")
        Optional<BookingRequest> lockByBookingRequestId(@Param("id") Long id);

        List<BookingRequest> findByRequester(User requester);

        List<BookingRequest> findByStatus(RequestStatus status);

        long countByStatus(RequestStatus status);

        long countByRequester_UserIdAndStatus(Long userId, RequestStatus status);

        List<BookingRequest> findByLabRoom_LabRoomId(Long labRoomId);

        @Query("SELECT DISTINCT b FROM BookingRequest b " +
                        "JOIN b.researchGroup rg " +
                        "LEFT JOIN rg.members m " +
                        "WHERE m.user.userId = :userId OR rg.creator.userId = :userId")
        List<BookingRequest> findByGroupMembership(@Param("userId") Long userId);

        @Query("SELECT b FROM BookingRequest b " +
                        "INNER JOIN b.requester r " +
                        "WHERE (:keyword IS NULL OR " +
                        "LOWER(r.username) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
                        "LOWER(r.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) " +
                        "AND (:type IS NULL OR b.bookingType = :type) " +
                        "AND (:status IS NULL OR b.status = :status) " +
                        "AND (:roomId IS NULL OR b.labRoom.labRoomId = :roomId) " +
                        "ORDER BY (CASE WHEN b.status = 'PENDING' THEN 0 ELSE 1 END) ASC, (SELECT MIN(sb.bookingDate) FROM b.slotBookings sb) ASC, b.createdAt ASC")
        Page<BookingRequest> filterAdmin(
                        @Param("keyword") String keyword,
                        @Param("type") BookingType type,
                        @Param("status") RequestStatus status,
                        @Param("roomId") Long roomId,
                        Pageable pageable);

        @Query("SELECT b FROM BookingRequest b " +
                        "INNER JOIN b.requester r " +
                        "LEFT JOIN FETCH b.slotBookings sb " +
                        "LEFT JOIN FETCH sb.slot s " +
                        "WHERE b.status = 'PENDING' " +
                        "ORDER BY (SELECT MIN(sb2.bookingDate) FROM b.slotBookings sb2) ASC, b.createdAt ASC")
        List<BookingRequest> findRecentPending(Pageable pageable);

        @Query("""
                SELECT DISTINCT b FROM BookingRequest b
                JOIN FETCH b.requester
                LEFT JOIN FETCH b.participants p
                LEFT JOIN FETCH p.user
                LEFT JOIN FETCH b.researchGroup rg
                LEFT JOIN FETCH rg.members m
                LEFT JOIN FETCH m.user
                LEFT JOIN FETCH b.bookingDevices bd
                LEFT JOIN FETCH bd.device
                WHERE b.bookingRequestId IN :ids
                """)
        List<BookingRequest> findByIdsWithParticipants(@Param("ids") List<Long> ids);

        @Query("SELECT COUNT(b) FROM BookingRequest b WHERE b.status = :status AND b.createdAt >= :start AND b.createdAt <= :end")
        long countByStatusAndDateRange(@Param("status") RequestStatus status, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

        @Query("SELECT COUNT(b) FROM BookingRequest b WHERE b.createdAt >= :start AND b.createdAt <= :end")
        long countByDateRange(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

        @Query("SELECT b.status, COUNT(b) FROM BookingRequest b WHERE b.createdAt >= :start AND b.createdAt <= :end GROUP BY b.status")
        List<Object[]> countByStatusDistribution(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

        @Query("SELECT HOUR(b.createdAt), COUNT(b) FROM BookingRequest b WHERE b.createdAt >= :start AND b.createdAt <= :end GROUP BY HOUR(b.createdAt) ORDER BY HOUR(b.createdAt)")
        List<Object[]> countByHourlyTrend(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

        @Query("SELECT b FROM BookingRequest b WHERE b.createdAt >= :start AND b.createdAt <= :end AND (:status IS NULL OR b.status = :status) AND (:adminId IS NULL OR b.modifiedBy = :adminId)")
        Page<BookingRequest> filterAuditLogs(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end, @Param("status") RequestStatus status, @Param("adminId") String adminId, Pageable pageable);

        @Query("SELECT b.createdAt, b.modifiedAt FROM BookingRequest b WHERE b.createdAt >= :start AND b.createdAt <= :end AND (b.status = 'APPROVED' OR b.status = 'REJECTED') AND b.modifiedAt IS NOT NULL")
        List<Object[]> findProcessingTimes(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

        @Query("""
                SELECT COUNT(DISTINCT br) > 0
                FROM BookingRequest br
                JOIN br.researchGroup rg
                JOIN br.slotBookings sb
                WHERE rg.researchGroupId = :researchGroupId
                  AND br.bookingType = 'GROUP'
                  AND br.status IN :activeStatuses
                  AND sb.bookingDate = :bookingDate
                  AND sb.slot.slotId IN :slotIds
                """)
        boolean existsActiveGroupBookingForResearchGroup(
                        @Param("researchGroupId") Long researchGroupId,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotIds") List<Long> slotIds,
                        @Param("activeStatuses") List<RequestStatus> activeStatuses);

        @Query("""
                SELECT DISTINCT br
                FROM BookingRequest br
                JOIN br.slotBookings sb
                WHERE br.labRoom.labRoomId = :labRoomId
                  AND br.bookingType IN :bookingTypes
                  AND br.status IN :activeStatuses
                  AND sb.bookingDate = :bookingDate
                  AND sb.slot.slotId IN :slotIds
                """)
        List<BookingRequest> findActiveBookingsByRoomDateSlotsAndTypes(
                        @Param("labRoomId") Long labRoomId,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotIds") List<Long> slotIds,
                        @Param("bookingTypes") List<BookingType> bookingTypes,
                        @Param("activeStatuses") List<RequestStatus> activeStatuses);
        
        @Query("""
                SELECT DISTINCT br
                FROM BookingRequest br
                JOIN br.participants bp
                JOIN br.slotBookings sb
                WHERE bp.user.userId = :userId
                  AND br.status IN :activeStatuses
                  AND sb.bookingDate = :bookingDate
                  AND sb.slot.slotId = :slotId
                """)
        List<BookingRequest> findActiveBookingsByUserDateSlot(
                        @Param("userId") Long userId,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotId") Long slotId,
                        @Param("activeStatuses") List<RequestStatus> activeStatuses);

        @Query("""
                SELECT DISTINCT br
                FROM BookingRequest br
                JOIN br.participants bp
                JOIN br.slotBookings sb
                WHERE bp.user.userId = :userId
                  AND bp.status IN :occupyingParticipantStatuses
                  AND br.status IN :activeStatuses
                  AND sb.bookingDate = :bookingDate
                  AND sb.slot.slotId IN :slotIds
                """)
        List<BookingRequest> findActiveBookingsByUserDateSlots(
                        @Param("userId") Long userId,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotIds") List<Long> slotIds,
                        @Param("activeStatuses") List<RequestStatus> activeStatuses,
                        @Param("occupyingParticipantStatuses") List<ParticipantStatus> occupyingParticipantStatuses);

        @Query("""
                SELECT DISTINCT br
                FROM BookingRequest br
                JOIN br.slotBookings sb
                WHERE br.labRoom.labRoomId = :labRoomId
                  AND br.bookingType IN ('PERSONAL', 'GROUP')
                  AND br.status IN :activeStatuses
                  AND sb.bookingDate = :bookingDate
                  AND sb.slot.slotId IN :slotIds
                """)
        List<BookingRequest> findActivePersonalOrGroupBookingsInRoom(
                        @Param("labRoomId") Long labRoomId,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotIds") List<Long> slotIds,
                        @Param("activeStatuses") List<RequestStatus> activeStatuses);

        @Query("""
                SELECT DISTINCT br
                FROM BookingRequest br
                JOIN br.slotBookings sb
                WHERE br.labRoom.labRoomId = :labRoomId
                  AND br.bookingType = 'THESIS'
                  AND br.status IN :activeStatuses
                  AND sb.bookingDate = :bookingDate
                  AND sb.slot.slotId IN :slotIds
                """)
        List<BookingRequest> findActiveThesisByRoomDateSlot(
                        @Param("labRoomId") Long labRoomId,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotIds") List<Long> slotIds,
                        @Param("activeStatuses") List<RequestStatus> activeStatuses);

        @Query("""
                SELECT DISTINCT br
                FROM BookingRequest br
                JOIN br.participants bp
                JOIN br.slotBookings sb
                WHERE bp.user.userId = :userId
                  AND br.bookingType = :bookingType
                  AND br.status IN :activeStatuses
                  AND sb.bookingDate = :bookingDate
                  AND sb.slot.slotId IN :slotIds
                """)
        List<BookingRequest> findActiveBookingsByUserDateSlotsAndType(
                        @Param("userId") Long userId,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotIds") List<Long> slotIds,
                        @Param("bookingType") BookingType bookingType,
                        @Param("activeStatuses") List<RequestStatus> activeStatuses);

        @Query("""
                SELECT DISTINCT br
                FROM BookingRequest br
                JOIN br.participants bp
                JOIN br.slotBookings sb
                WHERE bp.user.userId = :userId
                  AND br.bookingType = 'GROUP'
                  AND bp.status = :participantStatus
                  AND br.status IN :activeStatuses
                  AND sb.bookingDate = :bookingDate
                  AND sb.slot.slotId IN :slotIds
                """)
        List<BookingRequest> findActiveGroupBookingsByUserDateSlotsAndParticipantStatus(
                        @Param("userId") Long userId,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotIds") List<Long> slotIds,
                        @Param("participantStatus") ParticipantStatus participantStatus,
                        @Param("activeStatuses") List<RequestStatus> activeStatuses);
}


