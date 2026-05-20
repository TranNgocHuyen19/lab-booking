package iuh.labbooking.mapper.booking;

import iuh.labbooking.dto.response.booking.BookingParticipantResponse;
import iuh.labbooking.dto.response.booking.BookingResponse;
import iuh.labbooking.dto.response.booking.BookingWarning;
import iuh.labbooking.dto.response.booking.ConflictDeviceResponse;
import iuh.labbooking.dto.response.booking.ExistingScheduleConflictResponse;
import iuh.labbooking.dto.response.booking.ParticipantConflictResponse;
import iuh.labbooking.dto.response.bookingdevice.BookingDeviceResponse;
import iuh.labbooking.dto.response.slot.SlotResponse;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.service.booking.validation.BookingValidationResult;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class BookingCreationResponseMapper {

    public BookingResponse toResponse(BookingRequest booking, BookingValidationResult validationResult) {
        Set<Long> researchGroupIds = booking.getResearchGroup().stream()
                .map(group -> group.getResearchGroupId())
                .collect(Collectors.toSet());

        return BookingResponse.builder()
                .bookingRequestId(booking.getBookingRequestId())
                .purpose(booking.getPurpose())
                .bookingType(booking.getBookingType())
                .status(booking.getStatus())
                .bookingDate(booking.getSlotBookings().stream()
                        .map(slot -> slot.getBookingDate())
                        .findFirst()
                        .orElse(null))
                .labRoomId(booking.getLabRoom().getLabRoomId())
                .roomName(booking.getLabRoom().getRoomName())
                .building(booking.getLabRoom().getBuilding())
                .roomCapacity(booking.getLabRoom().getCapacity())
                .slots(booking.getSlotBookings().stream()
                        .sorted(Comparator.comparing(slot -> slot.getSlot().getSlotId()))
                        .map(slot -> new SlotResponse(
                                slot.getSlot().getSlotId(),
                                slot.getName(),
                                slot.getStartTime(),
                                slot.getEndTime(),
                                slot.getSlot().getDescription()))
                        .toList())
                .participantCount(booking.getParticipants().size())
                .devices(booking.getBookingDevices().stream()
                        .sorted(Comparator.comparing(device -> device.getDevice().getDeviceId()))
                        .map(device -> BookingDeviceResponse.builder()
                                .deviceId(device.getDevice().getDeviceId())
                                .deviceName(device.getDevice().getDeviceName())
                                .deviceType(device.getDevice().getDeviceType())
                                .icon(device.getDevice().getIcon())
                                .quantity(device.getQuantity())
                                .build())
                        .toList())
                .requesterId(booking.getRequester().getUserId())
                .requesterName(booking.getRequester().getFullName())
                .requesterUsername(booking.getRequester().getUsername())
                .isCreator(true)
                .responseNote(booking.getResponseNote())
                .responseDate(booking.getResponseDate())
                .responseBy(null)
                .researchGroupIds(researchGroupIds.stream().toList())
                .isAllowedEditing(true)
                .createdAt(booking.getCreatedAt())
                .participants(booking.getParticipants().stream()
                        .sorted(Comparator.comparing(participant -> participant.getUser().getUserId()))
                        .map(participant -> new BookingParticipantResponse(
                                participant.getBookingParticipantId(),
                                participant.getUser().getUserId(),
                                participant.getUser().getUsername(),
                                participant.getUser().getFullName(),
                                participant.getRole(),
                                participant.getStatus()))
                        .toList())
                .warnings(validationResult.warnings().stream()
                        .map(warning -> new BookingWarning(
                                warning.code(),
                                warning.message(),
                                warning.relatedUserId(),
                                warning.relatedBookingRequestId()))
                        .toList())
                .participantConflicts(validationResult.participantConflicts().stream()
                        .map(conflict -> new ParticipantConflictResponse(
                                conflict.userId(),
                                conflict.conflictingBookingRequestId(),
                                conflict.conflictingBookingType(),
                                conflict.suggestedParticipantStatus(),
                                conflict.message()))
                        .toList())
                .existingScheduleConflicts(validationResult.existingScheduleConflicts().stream()
                        .map(conflict -> new ExistingScheduleConflictResponse(
                                conflict.code(),
                                conflict.message(),
                                conflict.userId(),
                                conflict.conflictingBookingRequestId(),
                                conflict.conflictingBookingType(),
                                conflict.bookingDate(),
                                conflict.slotId(),
                                conflict.labRoomId(),
                                conflict.roomName(),
                                conflict.building(),
                                conflict.slotName(),
                                conflict.startTime(),
                                conflict.endTime(),
                                conflict.devices() == null
                                        ? java.util.List.of()
                                        : conflict.devices().stream()
                                        .map(device -> new ConflictDeviceResponse(
                                                device.deviceId(),
                                                device.deviceName(),
                                                device.deviceType(),
                                                device.quantity()))
                                        .toList(),
                                conflict.suggestedAction()))
                        .toList())
                .build();
    }
}
