package iuh.labbooking.repository;

import iuh.labbooking.dto.projection.*;
import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.GroupType;
import iuh.labbooking.enums.ParticipantStatus;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.model.SlotBooking;
import iuh.labbooking.model.SlotBookingId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SlotBookingRepository extends JpaRepository<SlotBooking, SlotBookingId> {
        List<SlotBooking> findByBookingDateBetween(LocalDate startDate, LocalDate endDate);

        List<SlotBooking> findByBookingRequest(BookingRequest bookingRequest);

        @Query("""
                            SELECT sb.slot.slotId, COUNT(bp)
                            FROM SlotBooking sb
                            JOIN sb.bookingRequest br
                            JOIN BookingParticipant bp ON bp.bookingRequest = br
                            WHERE br.labRoom.labRoomId = :labRoomId
                              AND sb.bookingDate = :bookingDate
                              AND sb.slot.slotId IN :slotIds
                              AND bp.status = :participantStatus
                              AND br.status IN :validStatuses
                            GROUP BY sb.slot.slotId
                        """)
        List<Object[]> countActiveParticipantsBySlots(
                        @Param("labRoomId") Long labRoomId,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotIds") List<Long> slotIds,
                        @Param("participantStatus") ParticipantStatus participantStatus,
                        @Param("validStatuses") List<RequestStatus> validStatuses);

        @Query("""
                            SELECT sb.slot.slotId, br.bookingRequestId
                            FROM SlotBooking sb
                            JOIN sb.bookingRequest br
                            WHERE br.labRoom.labRoomId = :labRoomId
                              AND sb.bookingDate = :bookingDate
                              AND sb.slot.slotId IN :slotIds
                              AND br.bookingType = 'THESIS'
                              AND br.status IN :validStatuses
                        """)
        List<Object[]> findThesisBookingsBySlots(
                        @Param("labRoomId") Long labRoomId,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotIds") List<Long> slotIds,
                        @Param("validStatuses") List<RequestStatus> validStatuses);

        @Query("""
                            SELECT DISTINCT br
                            FROM SlotBooking sb
                            JOIN sb.bookingRequest br
                            WHERE br.labRoom.labRoomId = :labRoomId
                              AND sb.bookingDate = :bookingDate
                              AND sb.slot.slotId IN :slotIds
                              AND br.status IN :validStatuses
                              AND br.bookingType <> 'THESIS'
                        """)
        List<BookingRequest> findConflictingNonThesisBookings(
                        @Param("labRoomId") Long labRoomId,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("slotIds") List<Long> slotIds,
                        @Param("validStatuses") List<RequestStatus> validStatuses);

        // ===================== Dashboard KPI Queries =====================

        @Query("SELECT COUNT(DISTINCT sb.bookingRequest.bookingRequestId) FROM SlotBooking sb WHERE sb.bookingDate BETWEEN :fromDate AND :toDate")
        long countTotalBookings(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

        @Query("SELECT COUNT(DISTINCT sb.bookingRequest.bookingRequestId) FROM SlotBooking sb " +
                        "WHERE sb.bookingDate BETWEEN :fromDate AND :toDate AND sb.bookingRequest.status = 'PENDING'")
        long countPendingBookings(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

        @Query("SELECT COUNT(sb) FROM SlotBooking sb " +
                        "WHERE sb.bookingDate BETWEEN :fromDate AND :toDate AND sb.bookingRequest.status = 'APPROVED'")
        long countApprovedSlots(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

        @Query("SELECT sb.slot, COUNT(sb) as cnt FROM SlotBooking sb " +
                        "WHERE sb.bookingDate BETWEEN :fromDate AND :toDate AND sb.bookingRequest.status = 'APPROVED' " +
                        "GROUP BY sb.slot ORDER BY cnt DESC")
        List<Object[]> findBusyShifts(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate,
                        Pageable pageable);

        @Query("SELECT sb.slot, COUNT(sb) as cnt FROM SlotBooking sb " +
                        "WHERE sb.bookingDate BETWEEN :fromDate AND :toDate AND sb.bookingRequest.status = 'APPROVED' " +
                        "GROUP BY sb.slot ORDER BY cnt ASC")
        List<Object[]> findQuietShifts(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate,
                        Pageable pageable);

        @Query("""
                        SELECT new iuh.labbooking.dto.projection.RoomActivity(
                            sb.bookingRequest.labRoom.roomName,
                            sb.slot.slotName,
                            sb.slot.startTime,
                            sb.slot.endTime,
                            COUNT(sb)
                        )
                        FROM SlotBooking sb
                        WHERE sb.bookingDate BETWEEN :fromDate AND :toDate
                          AND sb.bookingRequest.status = 'APPROVED'
                        GROUP BY sb.bookingRequest.labRoom.roomName, sb.slot.slotName, sb.slot.startTime, sb.slot.endTime
                        """)
        List<RoomActivity> findRoomActivity(
                        @Param("fromDate") LocalDate fromDate,
                        @Param("toDate") LocalDate toDate);
    @Query("""
            SELECT new iuh.labbooking.dto.projection.BookingTypeStat(sb.bookingRequest.bookingType, COUNT(DISTINCT sb.bookingRequest.bookingRequestId))
            FROM SlotBooking sb
            WHERE sb.bookingDate BETWEEN :fromDate AND :toDate
            GROUP BY sb.bookingRequest.bookingType
            """)
    List<BookingTypeStat> findBookingTypeDistribution(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query("""
            SELECT new iuh.labbooking.dto.projection.BookingTrendStat(sb.bookingDate, COUNT(DISTINCT sb.bookingRequest.bookingRequestId))
            FROM SlotBooking sb
            WHERE sb.bookingDate BETWEEN :fromDate AND :toDate
            GROUP BY sb.bookingDate
            ORDER BY sb.bookingDate ASC
            """)
    List<BookingTrendStat> findBookingTrend(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);


    @Query("""
            SELECT DISTINCT sb.bookingRequest.bookingRequestId
            FROM SlotBooking sb
            WHERE sb.bookingRequest.labRoom.labRoomId = :labRoomId
              AND sb.slot.slotId = :slotId
              AND sb.bookingDate = :bookingDate
            """)
    List<Long> findBookingIdsBySlotAndDate(
            @Param("labRoomId") Long labRoomId,
            @Param("slotId") Long slotId,
            @Param("bookingDate") LocalDate bookingDate);


    @Query("""
            SELECT new iuh.labbooking.dto.projection.RoomUsageStat(
                br.labRoom.labRoomId,
                br.labRoom.roomName,
                COUNT(DISTINCT sb),
                (SELECT COUNT(s) FROM Slot s),
                br.labRoom.capacity,
                COALESCE(SUM(SIZE(br.participants)), 0L),
                SUM(CASE WHEN br.bookingType = 'THESIS' THEN 1L ELSE 0L END)
            )
            FROM SlotBooking sb
            JOIN sb.bookingRequest br
            WHERE sb.bookingDate BETWEEN :startDate AND :endDate
              AND br.status = 'APPROVED'
              AND (:roomId IS NULL OR br.labRoom.labRoomId = :roomId)
              AND (:activityType IS NULL OR br.bookingType = :activityType)
            GROUP BY br.labRoom.labRoomId, br.labRoom.roomName, br.labRoom.capacity
            ORDER BY COUNT(DISTINCT sb) DESC
            """)
    List<RoomUsageStat> findRoomUsageStats(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("roomId") Long roomId,
            @Param("activityType") BookingType activityType,
            Pageable pageable);

    @Query("""
            SELECT new iuh.labbooking.dto.projection.SlotUsageStat(
                sb.slot.slotId,
                sb.slot.slotName,
                COUNT(sb),
                1L
            )
            FROM SlotBooking sb
            JOIN sb.bookingRequest br
            WHERE sb.bookingDate BETWEEN :startDate AND :endDate
              AND br.status = 'APPROVED'
              AND (:roomId IS NULL OR br.labRoom.labRoomId = :roomId)
              AND (:activityType IS NULL OR br.bookingType = :activityType)
            GROUP BY sb.slot.slotId, sb.slot.slotName
            ORDER BY COUNT(sb) DESC
            """)
    List<SlotUsageStat> findSlotUsageStats(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("roomId") Long roomId,
            @Param("activityType") BookingType activityType,
            Pageable pageable);

    @Query("""
            SELECT new iuh.labbooking.dto.projection.RoomSlotUsageStat(
                br.labRoom.labRoomId,
                br.labRoom.roomName,
                sb.slot.slotId,
                sb.slot.slotName,
                CAST(sb.slot.startTime AS string),
                CAST(sb.slot.endTime AS string),
                COUNT(sb),
                br.labRoom.capacity,
                COALESCE(SUM(SIZE(br.participants)), 0L),
                SUM(CASE WHEN br.bookingType = 'THESIS' THEN 1L ELSE 0L END)
            )
            FROM SlotBooking sb
            JOIN sb.bookingRequest br
            WHERE sb.bookingDate BETWEEN :startDate AND :endDate
              AND br.status = 'APPROVED'
              AND (:roomId IS NULL OR br.labRoom.labRoomId = :roomId)
              AND (:activityType IS NULL OR br.bookingType = :activityType)
            GROUP BY br.labRoom.labRoomId, br.labRoom.roomName, br.labRoom.capacity,
                     sb.slot.slotId, sb.slot.slotName, sb.slot.startTime, sb.slot.endTime
            """)
    List<RoomSlotUsageStat> findRoomSlotUsageStats(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("roomId") Long roomId,
            @Param("activityType") BookingType activityType);

    @Query("""
            SELECT new iuh.labbooking.dto.projection.RoomSlotDetailStat(
                br.labRoom.labRoomId,
                br.labRoom.roomName,
                sb.slot.slotId,
                sb.slot.slotName,
                CAST(sb.slot.startTime AS string),
                CAST(sb.slot.endTime AS string),
                br.labRoom.capacity,
                COUNT(DISTINCT sb),
                COALESCE(SUM(SIZE(br.participants)), 0L),
                0L,
                SUM(CASE WHEN br.bookingType = 'THESIS' THEN 1L ELSE 0L END)
            )
            FROM SlotBooking sb
            JOIN sb.bookingRequest br
            WHERE sb.bookingDate BETWEEN :startDate AND :endDate
              AND br.status = 'APPROVED'
              AND (:roomId IS NULL OR br.labRoom.labRoomId = :roomId)
              AND (:activityType IS NULL OR br.bookingType = :activityType)
            GROUP BY br.labRoom.labRoomId, br.labRoom.roomName, br.labRoom.capacity,
                     sb.slot.slotId, sb.slot.slotName, sb.slot.startTime, sb.slot.endTime
            """)
    List<RoomSlotDetailStat> findRoomSlotDetailStats(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("roomId") Long roomId,
            @Param("activityType") BookingType activityType);

    @Query("""
            SELECT br.labRoom.labRoomId, sb.slot.slotId, COUNT(DISTINCT sb)
            FROM SlotBooking sb
            JOIN sb.bookingRequest br
            WHERE sb.bookingDate BETWEEN :startDate AND :endDate
              AND br.status IN ('CANCELED', 'SYSTEM_CANCELED')
              AND (:roomId IS NULL OR br.labRoom.labRoomId = :roomId)
              AND (:activityType IS NULL OR br.bookingType = :activityType)
            GROUP BY br.labRoom.labRoomId, sb.slot.slotId
            """)
    List<Object[]> findCanceledCountByRoomAndSlot(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("roomId") Long roomId,
            @Param("activityType") BookingType activityType);

    @Query("""
            SELECT COUNT(DISTINCT sb)
            FROM SlotBooking sb
            JOIN sb.bookingRequest br
            WHERE sb.bookingDate BETWEEN :startDate AND :endDate
              AND br.status = 'APPROVED'
              AND (:roomId IS NULL OR br.labRoom.labRoomId = :roomId)
              AND (:activityType IS NULL OR br.bookingType = :activityType)
            """)
    long countApprovedSlotsFiltered(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("roomId") Long roomId,
            @Param("activityType") BookingType activityType);


    @Query("""
            SELECT new iuh.labbooking.dto.projection.GroupUsageDetailStat(
                rg.researchGroupId,
                rg.groupName,
                rg.groupType,
                rg.creator.fullName,
                COUNT(DISTINCT br.bookingRequestId),
                COUNT(DISTINCT sb),
                COUNT(DISTINCT bp)
            )
            FROM SlotBooking sb
            JOIN sb.bookingRequest br
            JOIN br.researchGroup rg
            LEFT JOIN br.participants bp
            WHERE sb.bookingDate BETWEEN :startDate AND :endDate
              AND br.status = 'APPROVED'
              AND (:groupType IS NULL OR rg.groupType = :groupType)
              AND (:lecturerId IS NULL OR rg.creator.userId = :lecturerId)
            GROUP BY rg.researchGroupId, rg.groupName, rg.groupType, rg.creator.fullName
            """)
    List<GroupUsageDetailStat> findGroupUsageStats(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("groupType") GroupType groupType,
            @Param("lecturerId") Long lecturerId);

    @Query("""
            SELECT new iuh.labbooking.dto.projection.GroupDistributionStat(
                sb.slot.slotId,
                sb.slot.slotName,
                br.bookingType,
                COUNT(DISTINCT sb)
            )
            FROM SlotBooking sb
            JOIN sb.bookingRequest br
            JOIN br.researchGroup rg
            WHERE sb.bookingDate BETWEEN :startDate AND :endDate
              AND br.status = 'APPROVED'
              AND (:groupType IS NULL OR rg.groupType = :groupType)
              AND (:lecturerId IS NULL OR rg.creator.userId = :lecturerId)
            GROUP BY sb.slot.slotId, sb.slot.slotName, br.bookingType
            """)
    List<GroupDistributionStat> findGroupDistributionStats(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("groupType") GroupType groupType,
            @Param("lecturerId") Long lecturerId);

    @Query("""
            SELECT rg.researchGroupId, br.labRoom.roomName, COUNT(DISTINCT sb)
            FROM SlotBooking sb
            JOIN sb.bookingRequest br
            JOIN br.researchGroup rg
            WHERE sb.bookingDate BETWEEN :startDate AND :endDate
              AND br.status = 'APPROVED'
            GROUP BY rg.researchGroupId, br.labRoom.roomName
            """)
    List<Object[]> findGroupRoomFrequencies(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("""
            SELECT rg.researchGroupId, sb.slot.slotName, COUNT(DISTINCT sb)
            FROM SlotBooking sb
            JOIN sb.bookingRequest br
            JOIN br.researchGroup rg
            WHERE sb.bookingDate BETWEEN :startDate AND :endDate
              AND br.status = 'APPROVED'
            GROUP BY rg.researchGroupId, sb.slot.slotName
            """)
    List<Object[]> findGroupSlotFrequencies(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("""
        SELECT sb FROM SlotBooking sb
        JOIN sb.bookingRequest br
        WHERE (br.requester.userId = :userId 
           OR EXISTS (SELECT 1 FROM br.researchGroup rg JOIN rg.members m WHERE m.user.userId = :userId AND m.role IN ('LEADER', 'CO_LEADER')))
        AND sb.bookingDate >= :today
        AND br.status = 'APPROVED'
        ORDER BY sb.bookingDate ASC, sb.slot.startTime ASC
    """)
    List<SlotBooking> findUpcomingSchedulesByLecturer(
            @Param("userId") Long userId,
            @Param("today") LocalDate today,
            Pageable pageable
    );

    @Query("""
        SELECT COUNT(sb) FROM SlotBooking sb
        JOIN sb.bookingRequest br
        WHERE (br.requester.userId = :userId 
           OR EXISTS (SELECT 1 FROM br.researchGroup rg JOIN rg.members m WHERE m.user.userId = :userId AND m.role IN ('LEADER', 'CO_LEADER')))
        AND sb.bookingDate BETWEEN :startOfWeek AND :endOfWeek
        AND br.status = 'APPROVED'
    """)
    long countWeeklySchedulesByLecturer(
            @Param("userId") Long userId,
            @Param("startOfWeek") LocalDate startOfWeek,
            @Param("endOfWeek") LocalDate endOfWeek
    );

    @Query("""
        SELECT sb FROM SlotBooking sb
        JOIN sb.bookingRequest br
        WHERE (br.requester.userId = :userId 
           OR EXISTS (SELECT 1 FROM br.researchGroup rg JOIN rg.members m WHERE m.user.userId = :userId AND m.role IN ('LEADER', 'CO_LEADER')))
        AND sb.bookingDate BETWEEN :fromDate AND :toDate
        AND br.status = 'APPROVED'
        ORDER BY sb.bookingDate ASC, sb.slot.startTime ASC
    """)
    List<SlotBooking> findByLecturerAndDateRange(
            @Param("userId") Long userId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable
    );
}
