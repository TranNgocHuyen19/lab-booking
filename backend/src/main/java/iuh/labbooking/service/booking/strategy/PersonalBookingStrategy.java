package iuh.labbooking.service.booking.strategy;

import iuh.labbooking.service.booking.BookingCreationContext;
import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.ParticipantRole;
import iuh.labbooking.enums.ParticipantStatus;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.model.BookingParticipant;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.repository.BookingRequestRepository;
import iuh.labbooking.repository.DeviceRepository;
import iuh.labbooking.repository.LabRoomRepository;
import iuh.labbooking.repository.ResearchGroupRepository;
import iuh.labbooking.repository.SlotRepository;
import iuh.labbooking.repository.UserRepository;
import iuh.labbooking.service.booking.BookingConflictQueryService;
import iuh.labbooking.service.booking.BookingHistoryService;
import iuh.labbooking.service.booking.DeviceAvailabilityService;
import iuh.labbooking.service.systemconfiguration.SystemConfigurationService;
import iuh.labbooking.service.booking.validation.BookingValidationResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
@Slf4j
public class PersonalBookingStrategy extends AbstractBookingCreationStrategy {

    private final BookingConflictQueryService conflictQueryService;

    public PersonalBookingStrategy(
            BookingRequestRepository bookingRequestRepository,
            UserRepository userRepository,
            LabRoomRepository labRoomRepository,
            SlotRepository slotRepository,
            DeviceRepository deviceRepository,
            ResearchGroupRepository researchGroupRepository,
            SystemConfigurationService systemConfigurationService,
            DeviceAvailabilityService deviceAvailabilityService,
            BookingHistoryService bookingHistoryService,
            BookingConflictQueryService conflictQueryService) {
        super(bookingRequestRepository, userRepository, labRoomRepository, slotRepository, deviceRepository,
                researchGroupRepository, systemConfigurationService, deviceAvailabilityService, bookingHistoryService);
        this.conflictQueryService = conflictQueryService;
    }

    @Override
    public BookingType bookingType() {
        return BookingType.PERSONAL;
    }

    @Override
    public BookingValidationResult validate(BookingCreationContext context) {
        BookingValidationResult result = BookingValidationResult.ok();
        validateRequestShape(context, result);
        if (result.hasErrors()) {
            return result;
        }

        var date = primaryDate(context);
        var slotIds = slotIds(context);

        if (conflictQueryService.userHasActivePersonalBooking(context.requesterId(), date, slotIds)) {
            result.addError(ErrorCode.PERSONAL_BOOKING_DUPLICATED);
        }

        if (conflictQueryService.userHasConfirmedGroupBooking(context.requesterId(), date, slotIds)) {
            result.addError(ErrorCode.USER_CONFIRMED_IN_GROUP_BOOKING);
        }

        for (BookingParticipant conflict : conflictQueryService.findSoftGroupConflicts(context.requesterId(), date, slotIds)) {
            result.addWarning(ErrorCode.USER_HAS_PENDING_GROUP_INVITATION);
        }

        if (conflictQueryService.roomHasActiveThesisBooking(context.labRoomId(), date, slotIds)) {
            result.addError(ErrorCode.ROOM_HAS_THESIS_BOOKING);
        }

        validateDevices(context, result);
        validateCapacity(context, result, conflictQueryService, 1);
        return result;
    }

    @Override
    public BookingRequest create(BookingCreationContext context, BookingValidationResult validationResult) {
        return persistBooking(
                context,
                RequestStatus.PENDING,
                Set.of(),
                List.of(new ParticipantSeed(context.requesterId(), ParticipantRole.SELF_STUDY, ParticipantStatus.CONFIRMED)));
    }
}
