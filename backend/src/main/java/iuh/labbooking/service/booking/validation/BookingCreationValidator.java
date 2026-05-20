package iuh.labbooking.service.booking.validation;

import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.ParticipantStatus;
import iuh.labbooking.enums.ScheduleConflictAction;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.repository.BookingRequestRepository;
import iuh.labbooking.service.booking.BookingCreationContext;
import iuh.labbooking.service.booking.availability.DeviceAvailabilityService;
import iuh.labbooking.service.booking.availability.RoomCapacityService;
import iuh.labbooking.service.booking.conflict.BookingConflictQueryService;
import iuh.labbooking.service.booking.validation.BookingValidationResult.BookingValidationError;
import iuh.labbooking.service.booking.validation.BookingValidationResult.ExistingScheduleConflictResult;
import iuh.labbooking.service.booking.validation.BookingValidationResult.ParticipantConflictResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingCreationValidator {

    private final BookingRequestRepository bookingRequestRepository;
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

        if (context.participants().isEmpty()) {
            result.addError(ErrorCode.BOOKING_NO_PARTICIPANTS);
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
        addCapacityErrors(context, result, context.participants().size());
        return result;
    }

    public BookingValidationResult validateThesis(BookingCreationContext context) {
        BookingValidationResult result = newResult(context);
        if (result.hasErrors()) {
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
        return result;
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
            Long conflictingId = personalConflicts.getFirst().getBookingRequestId();
            slotIds.forEach(slotId -> result.addExistingScheduleConflict(new ExistingScheduleConflictResult(
                    ErrorCode.PERSONAL_BOOKING_DUPLICATED.name(),
                    ErrorCode.PERSONAL_BOOKING_DUPLICATED.getMessage(),
                    context.requesterId(),
                    conflictingId,
                    BookingType.PERSONAL,
                    date,
                    slotId,
                    ScheduleConflictAction.SWITCH_TO_NEW_BOOKING)));
            result.addWarning(ErrorCode.PERSONAL_BOOKING_DUPLICATED);
        }

        var confirmedGroupConflicts = bookingRequestRepository.findActiveGroupBookingsByUserDateSlotsAndParticipantStatus(
                context.requesterId(),
                date,
                slotIds,
                ParticipantStatus.CONFIRMED,
                activeStatuses);
        if (!confirmedGroupConflicts.isEmpty()) {
            Long conflictingId = confirmedGroupConflicts.getFirst().getBookingRequestId();
            slotIds.forEach(slotId -> result.addExistingScheduleConflict(new ExistingScheduleConflictResult(
                    ErrorCode.USER_CONFIRMED_IN_GROUP_BOOKING.name(),
                    ErrorCode.USER_CONFIRMED_IN_GROUP_BOOKING.getMessage(),
                    context.requesterId(),
                    conflictingId,
                    BookingType.GROUP,
                    date,
                    slotId,
                    ScheduleConflictAction.KEEP_EXISTING_BOOKING)));
            result.addWarning(ErrorCode.USER_CONFIRMED_IN_GROUP_BOOKING);
        }

        conflictQueryService.findSoftGroupConflicts(context.requesterId(), date, slotIds)
                .forEach(conflict -> result.addWarning(ErrorCode.USER_HAS_PENDING_GROUP_INVITATION));
    }

    private void addGroupParticipantConflicts(
            BookingCreationContext context,
            BookingValidationResult result) {
        var date = context.primaryDate();
        var slotIds = context.slotIds();

        context.participants().forEach(participant -> {
            if (conflictQueryService.userHasActivePersonalBooking(participant.userId(), date, slotIds)) {
                result.addParticipantConflict(new ParticipantConflictResult(
                        participant.userId(),
                        null,
                        BookingType.PERSONAL,
                        ParticipantStatus.PENDING_CONFLICT_RESOLUTION,
                        "Participant has a personal booking and must resolve the conflict before joining."));
            }
        });
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
