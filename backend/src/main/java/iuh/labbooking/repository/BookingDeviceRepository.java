package iuh.labbooking.repository;

import iuh.labbooking.dto.DeviceReservationDto;
import iuh.labbooking.dto.response.dashboard.DeviceUsageResponse;
import iuh.labbooking.model.BookingDevice;
import iuh.labbooking.model.BookingDeviceId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingDeviceRepository extends JpaRepository<BookingDevice, BookingDeviceId> {

  @Query("""
          SELECT new iuh.labbooking.dto.response.dashboard.DeviceUsageResponse(bd.device.deviceName, SUM(bd.quantity))
          FROM BookingDevice bd
          JOIN bd.bookingRequest br
          JOIN br.slotBookings sb
          WHERE br.status = 'APPROVED'
            AND sb.bookingDate BETWEEN :fromDate AND :toDate
          GROUP BY bd.device.deviceName
          ORDER BY SUM(bd.quantity) DESC
      """)
  List<DeviceUsageResponse> findTopUsedDevices(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate, Pageable pageable);

  @Query("""
          SELECT new iuh.labbooking.dto.DeviceReservationDto(
              bd.device.deviceId,
              sb.slot.slotId,
              SUM(bd.quantity)
          )
          FROM BookingDevice bd
          JOIN bd.bookingRequest br
          JOIN br.slotBookings sb
          WHERE br.labRoom.labRoomId = :labRoomId
            AND sb.bookingDate = :date
            AND sb.slot.slotId IN :slotIds
            AND br.status IN ('PENDING', 'APPROVED')
            AND (:excludeId IS NULL OR br.bookingRequestId <> :excludeId)
          GROUP BY bd.device.deviceId, sb.slot.slotId
      """)
  List<DeviceReservationDto> findReservedQuantitiesByLabRoomAndDateAndSlots(
        @Param("labRoomId") Long labRoomId,
        @Param("date") LocalDate date,
        @Param("slotIds") List<Long> slotIds,
        @Param("excludeId") Long excludeId);

  @Query("""
          SELECT COALESCE(SUM(bd.quantity), 0)
          FROM BookingDevice bd
          JOIN bd.bookingRequest br
          JOIN br.slotBookings sb
          WHERE br.labRoom.labRoomId = :labRoomId
            AND bd.device.deviceId = :deviceId
            AND sb.bookingDate = :bookingDate
            AND sb.slot.slotId = :slotId
            AND br.status IN :activeStatuses
      """)
  long countReservedQuantity(
        @Param("labRoomId") Long labRoomId,
        @Param("deviceId") Long deviceId,
        @Param("bookingDate") LocalDate bookingDate,
        @Param("slotId") Long slotId,
        @Param("activeStatuses") List<iuh.labbooking.enums.RequestStatus> activeStatuses);
}
