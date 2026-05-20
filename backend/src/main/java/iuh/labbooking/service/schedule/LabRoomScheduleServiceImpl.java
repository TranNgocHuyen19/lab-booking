package iuh.labbooking.service.schedule;

import iuh.labbooking.dto.response.schedule.DayScheduleResponse;
import iuh.labbooking.dto.response.schedule.RoomScheduleResponse;
import iuh.labbooking.dto.response.schedule.SlotScheduleResponse;
import iuh.labbooking.dto.response.schedule.WeekScheduleResponse;
import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.ParticipantStatus;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.mapper.LabRoomMapper;
import iuh.labbooking.model.LabRoom;
import iuh.labbooking.model.Slot;
import iuh.labbooking.model.SlotBooking;
import iuh.labbooking.repository.BookingParticipantRepository;
import iuh.labbooking.repository.LabRoomRepository;
import iuh.labbooking.repository.SlotBookingRepository;
import iuh.labbooking.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabRoomScheduleServiceImpl implements LabRoomScheduleService {
    private static final List<RequestStatus> ACTIVE_BOOKING_STATUSES = List.of(
            RequestStatus.PENDING,
            RequestStatus.APPROVED
    );

    private static final List<ParticipantStatus> OCCUPYING_PARTICIPANT_STATUSES = List.of(
            ParticipantStatus.CONFIRMED,
            ParticipantStatus.INVITED,
            ParticipantStatus.PENDING_CONFLICT_RESOLUTION
    );

    private final LabRoomRepository labRoomRepository;
    private final SlotRepository slotRepository;
    private final SlotBookingRepository slotBookingRepository;
    private final BookingParticipantRepository bookingParticipantRepository;
    private final LabRoomMapper labRoomMapper;

    @Override
    @Transactional(readOnly = true)
    public WeekScheduleResponse findWeekSchedule(LocalDate selectedDate) {
        return getWeekSchedule(selectedDate, false);
    }

    @Override
    @Transactional(readOnly = true)
    public WeekScheduleResponse findWeekScheduleAdmin(LocalDate selectedDate) {
        return getWeekSchedule(selectedDate, true);
    }

    private WeekScheduleResponse getWeekSchedule(LocalDate selectedDate, boolean isAdminView) {
        LocalDate weekStart = selectedDate.with(DayOfWeek.MONDAY);
        LocalDate weekEnd = selectedDate.with(DayOfWeek.SUNDAY);

        List<LabRoom> labRooms = labRoomRepository.findAll();
        List<Slot> slots = slotRepository.findAll();
        List<SlotBooking> slotBookings = slotBookingRepository.findByBookingDateBetween(weekStart, weekEnd);

        Set<Long> bookingRequestIds = slotBookings.stream()
                .map(sb -> sb.getBookingRequest().getBookingRequestId())
                .collect(Collectors.toSet());

        Map<Long, Integer> participantCountMap = new HashMap<>();
        if (!bookingRequestIds.isEmpty()) {
            List<Object[]> participantCounts = bookingParticipantRepository
                    .countParticipantsByBookingRequestIds(
                            bookingRequestIds,
                            ACTIVE_BOOKING_STATUSES,
                            OCCUPYING_PARTICIPANT_STATUSES);
            participantCountMap = participantCounts.stream()
                    .collect(Collectors.toMap(
                            row -> (Long) row[0],
                            row -> ((Long) row[1]).intValue()));
        }

        // Group bookings by room_date_slot key to support multiple bookings per slot
        Map<String, List<SlotBooking>> bookingMap = new HashMap<>();
        for (SlotBooking sb : slotBookings) {
            String key = sb.getBookingRequest().getLabRoom().getLabRoomId() + "_" +
                    sb.getBookingDate() + "_" +
                    sb.getSlot().getSlotId();
            bookingMap.computeIfAbsent(key, k -> new ArrayList<>()).add(sb);
        }

        List<RoomScheduleResponse> roomSchedules = new ArrayList<>();
        for (LabRoom room : labRooms) {
            List<DayScheduleResponse> daySchedules = new ArrayList<>();

            for (LocalDate date = weekStart; !date.isAfter(weekEnd); date = date.plusDays(1)) {
                List<SlotScheduleResponse> slotSchedules = new ArrayList<>();

                for (Slot slot : slots) {
                    String key = room.getLabRoomId() + "_" + date + "_" + slot.getSlotId();
                    List<SlotBooking> bookings = bookingMap.getOrDefault(key, Collections.emptyList());

                    SlotScheduleResponse slotResponse = buildSlotScheduleResponse(
                            slot, bookings, room, date, participantCountMap, isAdminView);
                    slotSchedules.add(slotResponse);
                }

                daySchedules.add(DayScheduleResponse.builder()
                        .date(date)
                        .slots(slotSchedules)
                        .build());
            }

            roomSchedules.add(RoomScheduleResponse.builder()
                    .labRoomId(room.getLabRoomId())
                    .roomName(room.getRoomName())
                    .building(room.getBuilding())
                    .capacity(room.getCapacity())
                    .devices(room.getLabRoomDevices() != null ? room.getLabRoomDevices().stream()
                            .map(labRoomMapper::toLabRoomDeviceResponse)
                            .collect(Collectors.toList()) : Collections.emptyList())
                    .schedule(daySchedules)
                    .build());
        }

        return WeekScheduleResponse.builder()
                .weekStart(weekStart)
                .weekEnd(weekEnd)
                .rooms(roomSchedules)
                .build();
    }

    private SlotScheduleResponse buildSlotScheduleResponse(
            Slot slot,
            List<SlotBooking> bookings,
            LabRoom room,
            LocalDate date,
            Map<Long, Integer> participantCountMap,
            boolean isAdminView) {

        List<SlotBooking> activeBookings = bookings == null ? Collections.emptyList()
                : bookings.stream()
                        .filter(b -> b.getBookingRequest().getStatus() == RequestStatus.APPROVED ||
                                b.getBookingRequest().getStatus() == RequestStatus.PENDING)
                        .toList();

        // Collect all booking request IDs
        List<Long> bookingRequestIds = activeBookings.stream()
                .map(b -> b.getBookingRequest().getBookingRequestId())
                .distinct()
                .toList();

        // Count pending bookings
        int pendingCount = (int) activeBookings.stream()
                .filter(b -> b.getBookingRequest().getStatus() == RequestStatus.PENDING)
                .map(b -> b.getBookingRequest().getBookingRequestId())
                .distinct()
                .count();

        // Calculate total participant count across all active bookings
        int totalParticipantCount = activeBookings.stream()
                .mapToInt(b -> {
                    BookingType bookingType = b.getBookingRequest().getBookingType();
                    Long bookingRequestId = b.getBookingRequest().getBookingRequestId();
                    return calculateParticipantCount(bookingType, bookingRequestId, room, participantCountMap);
                })
                .sum();

        String status = determineStatus(activeBookings, slot, date, totalParticipantCount, room.getCapacity(), isAdminView);

        return SlotScheduleResponse.builder()
                .slotId(slot.getSlotId())
                .slotName(slot.getSlotName())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .status(status)
                .bookingRequestIds(bookingRequestIds)
                .participantCount(totalParticipantCount)
                .roomCapacity(room.getCapacity())
                .pendingCount(isAdminView ? pendingCount : 0)
                .build();
    }

    private String determineStatus(List<SlotBooking> bookings, Slot slot, LocalDate date, int totalParticipantCount,
            int capacity, boolean isAdminView) {
        LocalDateTime slotEndDateTime = LocalDateTime.of(date, slot.getEndTime());
        if (!isAdminView && slotEndDateTime.isBefore(LocalDateTime.now())) {
            return "EXPIRED";
        }

        boolean hasThesis = bookings.stream()
                .anyMatch(b -> b.getBookingRequest().getBookingType() == BookingType.THESIS);

        if (hasThesis || totalParticipantCount >= capacity) {
            return "FULL";
        }

        if (!bookings.isEmpty()) {
            return "OCCUPIED";
        }

        return "AVAILABLE";
    }

    private int calculateParticipantCount(
            BookingType bookingType,
            Long bookingRequestId,
            LabRoom room,
            Map<Long, Integer> participantCountMap) {
        if (bookingType == null) {
            return 0;
        }

        return switch (bookingType) {
            case THESIS -> room.getCapacity();
            case PERSONAL -> 1;
            case GROUP -> participantCountMap.getOrDefault(bookingRequestId, 0);
        };
    }
}
