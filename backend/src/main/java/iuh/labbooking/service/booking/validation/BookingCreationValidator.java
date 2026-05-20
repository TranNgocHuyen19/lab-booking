package iuh.labbooking.service.booking.validation;

import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.ParticipantStatus;
import iuh.labbooking.enums.ScheduleConflictAction;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.model.BookingSystemConfig;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.model.Slot;
import iuh.labbooking.model.SlotBooking;
import iuh.labbooking.model.User;
import iuh.labbooking.repository.BookingRequestRepository;
import iuh.labbooking.repository.SlotRepository;
import iuh.labbooking.repository.UserRepository;
import iuh.labbooking.service.booking.BookingCreationContext;
import iuh.labbooking.service.booking.availability.DeviceAvailabilityService;
import iuh.labbooking.service.booking.availability.RoomCapacityService;
import iuh.labbooking.service.booking.conflict.BookingConflictQueryService;
import iuh.labbooking.service.booking.validation.BookingValidationResult.BookingValidationError;
import iuh.labbooking.service.booking.validation.BookingValidationResult.ConflictDeviceResult;
import iuh.labbooking.service.booking.validation.BookingValidationResult.ExistingScheduleConflictResult;
import iuh.labbooking.service.booking.validation.BookingValidationResult.ParticipantConflictResult;
import iuh.labbooking.service.systemconfiguration.SystemConfigurationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class BookingCreationValidator {

    private final BookingRequestRepository bookingRequestRepository;
    private final UserRepository userRepository;
    private final SlotRepository slotRepository;
    private final SystemConfigurationService systemConfigurationService;
    private final BookingConflictQueryService conflictQueryService;
    private final DeviceAvailabilityService deviceAvailabilityService;
    private final RoomCapacityService roomCapacityService;

    public BookingValidationResult validatePersonal(BookingCreationContext context) {
        BookingValidationResult result = newResult(context);
        if (result.hasErrors()) {
            return result;
        }

        addPersonalExistingScheduleConflicts(context, result);
        addRoomThesisConflict(context, result);
        addDeviceErrors(context, result);
        addCapacityErrors(context, result, 1);
        return result;
    }

    public BookingValidationResult validateGroup(BookingCreationContext context) {
        BookingValidationResult result = newResult(context);
        if (result.hasErrors()) {
            return result;
        }

        if (context.researchGroupIds().size() != 1) {
            result.addError(ErrorCode.GROUP_REQUIRES_ONE_RESEARCH_GROUP);
            return result;
        }

        Long researchGroupId = context.researchGroupIds().iterator().next();
        if (conflictQueryService.researchGroupHasActiveGroupBooking(
                researchGroupId,
                context.primaryDate(),
                context.slotIds())) {
            result.addError(ErrorCode.RESEARCH_GROUP_HAS_ACTIVE_BOOKING);
        }

        addRoomThesisConflict(context, result);
        addGroupParticipantConflicts(context, result);
        addDeviceErrors(context, result);
        addCapacityErrors(context, result, effectiveParticipantCount(context));
        return result;
    }

    public BookingValidationResult validateThesis(BookingCreationContext context) {
        BookingValidationResult result = newResult(context);
        if (result.hasErrors()) {
            return result;
        }

        User requester = userRepository.findById(context.requesterId()).orElse(null);
        if (requester == null || requester.getRole() == null) {
            result.addError(ErrorCode.USER_NOT_FOUND);
            return result;
        }

        String roleName = requester.getRole().getRoleName();
        if (!"ADMIN".equals(roleName) && !"LECTURER".equals(roleName)) {
            result.addError(ErrorCode.THESIS_BOOKING_NOT_ALLOWED);
            return result;
        }

        addRoomThesisConflict(context, result);
        addDeviceErrors(context, result);
        return result;
    }

    private BookingValidationResult newResult(BookingCreationContext context) {
        BookingValidationResult result = BookingValidationResult.ok();
        if (context.hasDuplicatedSlots()) {
            result.addError(ErrorCode.DUPLICATED_SLOT_IN_REQUEST);
        }
        if (context.hasMultipleDates()) {
            result.addError(ErrorCode.BOOKING_MULTIPLE_DATES_NOT_ALLOWED);
        }
        addBookingConfigErrors(context, result);
        return result;
    }

    private void addBookingConfigErrors(BookingCreationContext context, BookingValidationResult result) {
        User requester = userRepository.findById(context.requesterId()).orElse(null);
        if (requester == null || requester.getRole() == null) {
            result.addError(ErrorCode.USER_NOT_FOUND);
            return;
        }

        BookingSystemConfig config = systemConfigurationService.getActiveBookingConfig();
        String roleName = requester.getRole().getRoleName();
        Integer maxAdvanceDays = maxAdvanceDaysForRole(roleName, config);
        if (maxAdvanceDays == null || maxAdvanceDays <= 0) {
            result.addError(ErrorCode.BOOKING_ROLE_NOT_ALLOWED);
            return;
        }

        Integer minMinutesToBook = minMinutesToBookForRole(roleName, config);
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        for (var slotCommand : context.slots()) {
            long daysAhead = Duration.between(
                    today.atStartOfDay(),
                    slotCommand.bookingDate().atStartOfDay()).toDays();
            if (daysAhead > maxAdvanceDays) {
                result.addError(ErrorCode.BOOKING_TOO_FAR_IN_ADVANCE);
            }
        }

        if (minMinutesToBook == null) {
            return;
        }

        List<Slot> slots = slotRepository.findAllById(context.slotIds());
        if (slots.size() != context.slotIds().stream().distinct().count()) {
            result.addError(ErrorCode.SLOT_NOT_FOUND);
            return;
        }

        for (var slotCommand : context.slots()) {
            Slot slot = slots.stream()
                    .filter(s -> s.getSlotId().equals(slotCommand.slotId()))
                    .findFirst()
                    .orElse(null);
            if (slot == null) {
                result.addError(ErrorCode.SLOT_NOT_FOUND);
                continue;
            }

            LocalDateTime startTime = LocalDateTime.of(slotCommand.bookingDate(), slot.getStartTime());
            long minutesUntilStart = Duration.between(now, startTime).toMinutes();
            if (minutesUntilStart < minMinutesToBook) {
                result.addError(ErrorCode.BOOKING_CREATION_TIME_INVALID);
            }
        }
    }

    private Integer maxAdvanceDaysForRole(String roleName, BookingSystemConfig config) {
        return switch (roleName) {
            case "STUDENT" -> config.getStudentAdvanceDays();
            case "LECTURER" -> config.getLecturerAdvanceDays();
            case "ADMIN" -> config.getAdminAdvanceDays();
            default -> null;
        };
    }

    private Integer minMinutesToBookForRole(String roleName, BookingSystemConfig config) {
        return switch (roleName) {
            case "STUDENT" -> config.getStudentMinMinutesToBook();
            case "LECTURER" -> config.getLecturerMinMinutesToBook();
            default -> null;
        };
    }

    private void addPersonalExistingScheduleConflicts(
            BookingCreationContext context,
            BookingValidationResult result) {
        var date = context.primaryDate();
        var slotIds = context.slotIds();
        var activeStatuses = BookingConflictQueryService.ACTIVE_BOOKING_STATUSES;

        var personalConflicts = bookingRequestRepository.findActiveBookingsByUserDateSlotsAndType(
                context.requesterId(),
                date,
                slotIds,
                BookingType.PERSONAL,
                activeStatuses);
        if (!personalConflicts.isEmpty()) {
            BookingRequest conflict = personalConflicts.getFirst();
            addExistingScheduleConflictsForBooking(
                    result,
                    ErrorCode.PERSONAL_BOOKING_DUPLICATED.name(),
                    ErrorCode.PERSONAL_BOOKING_DUPLICATED.getMessage(),
                    context.requesterId(),
                    conflict,
                    BookingType.PERSONAL,
                    date,
                    slotIds,
                    ScheduleConflictAction.SWITCH_TO_NEW_BOOKING);
            result.addWarning(ErrorCode.PERSONAL_BOOKING_DUPLICATED);
        }

        var confirmedGroupConflicts = bookingRequestRepository.findActiveGroupBookingsByUserDateSlotsAndParticipantStatus(
                context.requesterId(),
                date,
                slotIds,
                ParticipantStatus.CONFIRMED,
                activeStatuses);
        if (!confirmedGroupConflicts.isEmpty()) {
            BookingRequest conflict = confirmedGroupConflicts.getFirst();
            addExistingScheduleConflictsForBooking(
                    result,
                    ErrorCode.USER_CONFIRMED_IN_GROUP_BOOKING.name(),
                    ErrorCode.USER_CONFIRMED_IN_GROUP_BOOKING.getMessage(),
                    context.requesterId(),
                    conflict,
                    BookingType.GROUP,
                    date,
                    slotIds,
                    ScheduleConflictAction.KEEP_EXISTING_BOOKING);
            result.addWarning(ErrorCode.USER_CONFIRMED_IN_GROUP_BOOKING);
        }

        conflictQueryService.findSoftGroupConflicts(context.requesterId(), date, slotIds)
                .forEach(conflict -> result.addWarning(ErrorCode.USER_HAS_PENDING_GROUP_INVITATION));
    }

    private void addExistingScheduleConflictsForBooking(
            BookingValidationResult result,
            String code,
            String message,
            Long userId,
            BookingRequest conflictingBooking,
            BookingType conflictingBookingType,
            LocalDate bookingDate,
            List<Long> slotIds,
            ScheduleConflictAction action) {
        var conflictingSlotIds = conflictingBooking.getSlotBookings().stream()
                .filter(item -> item.getBookingDate().equals(bookingDate)
                        && slotIds.contains(item.getSlot().getSlotId()))
                .map(item -> item.getSlot().getSlotId())
                .distinct()
                .toList();

        var exactSlotIds = conflictingSlotIds.isEmpty() ? slotIds : conflictingSlotIds;
        exactSlotIds.forEach(slotId -> result.addExistingScheduleConflict(existingScheduleConflict(
                code,
                message,
                userId,
                conflictingBooking,
                conflictingBookingType,
                bookingDate,
                slotId,
                action)));
    }

    private ExistingScheduleConflictResult existingScheduleConflict(
            String code,
            String message,
            Long userId,
            BookingRequest conflictingBooking,
            BookingType conflictingBookingType,
            LocalDate bookingDate,
            Long slotId,
            ScheduleConflictAction action) {
        SlotBooking slotBooking = conflictingBooking.getSlotBookings().stream()
                .filter(item -> item.getBookingDate().equals(bookingDate)
                        && item.getSlot().getSlotId().equals(slotId))
                .findFirst()
                .orElse(null);

        Slot slot = slotBooking != null ? slotBooking.getSlot() : null;
        LocalTime startTime = slotBooking != null ? slotBooking.getStartTime() : null;
        LocalTime endTime = slotBooking != null ? slotBooking.getEndTime() : null;

        List<ConflictDeviceResult> devices = conflictingBooking.getBookingDevices() == null
            ? List.of()
            : conflictingBooking.getBookingDevices().stream()
            .filter(item -> item.getDevice() != null && item.getQuantity() != null && item.getQuantity() > 0)
            .sorted((a, b) -> {
                Long aId = a.getDevice() != null ? a.getDevice().getDeviceId() : null;
                Long bId = b.getDevice() != null ? b.getDevice().getDeviceId() : null;
                if (aId == null && bId == null) return 0;
                if (aId == null) return 1;
                if (bId == null) return -1;
                return aId.compareTo(bId);
            })
            .map(item -> new ConflictDeviceResult(
                item.getDevice().getDeviceId(),
                item.getDevice().getDeviceName(),
                item.getDevice().getDeviceType(),
                item.getQuantity()))
            .toList();

        return new ExistingScheduleConflictResult(
                code,
                message,
                userId,
                conflictingBooking.getBookingRequestId(),
                conflictingBookingType,
                bookingDate,
                slotId,
                conflictingBooking.getLabRoom() != null ? conflictingBooking.getLabRoom().getLabRoomId() : null,
                conflictingBooking.getLabRoom() != null ? conflictingBooking.getLabRoom().getRoomName() : null,
                conflictingBooking.getLabRoom() != null ? conflictingBooking.getLabRoom().getBuilding() : null,
                slot != null ? slot.getSlotName() : null,
                startTime,
                endTime,
            devices,
                action);
    }

    private void addGroupParticipantConflicts(
            BookingCreationContext context,
            BookingValidationResult result) {
        var date = context.primaryDate();
        var slotIds = context.slotIds();

        context.participants().forEach(participant -> {
            var personalConflicts = conflictQueryService.findActivePersonalBookingsForUser(
                    participant.userId(),
                    date,
                    slotIds);
            if (!personalConflicts.isEmpty()) {
                result.addParticipantConflict(new ParticipantConflictResult(
                        participant.userId(),
                        personalConflicts.getFirst().getBookingRequestId(),
                        BookingType.PERSONAL,
                        ParticipantStatus.PENDING_CONFLICT_RESOLUTION,
                        "Participant has a personal booking and must resolve the conflict before joining."));
            }
        });
    }

    private int effectiveParticipantCount(BookingCreationContext context) {
        long requestedParticipants = context.participants().stream()
                .map(participant -> participant.userId())
                .distinct()
                .count();
        boolean requesterIncluded = context.participants().stream()
                .anyMatch(participant -> participant.userId().equals(context.requesterId()));
        return (int) requestedParticipants + (requesterIncluded ? 0 : 1);
    }

    private void addRoomThesisConflict(BookingCreationContext context, BookingValidationResult result) {
        if (conflictQueryService.roomHasActiveThesisBooking(
                context.labRoomId(),
                context.primaryDate(),
                context.slotIds())) {
            result.addError(ErrorCode.ROOM_HAS_THESIS_BOOKING);
        }
    }

    private void addDeviceErrors(BookingCreationContext context, BookingValidationResult result) {
        deviceAvailabilityService.checkAvailability(context).stream()
                .filter(device -> !device.available())
                .map(device -> new BookingValidationError(
                        ErrorCode.INSUFFICIENT_DEVICE_QUANTITY.name(),
                        "Device " + device.deviceId() + " only has "
                                + device.availableQuantity() + " available item(s)",
                        null,
                        null))
                .forEach(result::addError);
    }

    private void addCapacityErrors(
            BookingCreationContext context,
            BookingValidationResult result,
            int requestedSeats) {
        roomCapacityService.checkCapacity(context, requestedSeats).stream()
                .filter(capacity -> !capacity.enoughCapacity())
                .map(capacity -> new BookingValidationError(
                        ErrorCode.BOOKING_EXCEEDS_CAPACITY.name(),
                        "Room capacity exceeded for date " + capacity.bookingDate()
                                + ", slot " + capacity.slotId()
                                + ". Capacity: " + capacity.roomCapacity()
                                + ", occupied: " + capacity.occupiedSeats()
                                + ", requested: " + capacity.requestedSeats(),
                        null,
                        null))
                .forEach(result::addError);
    }
}
