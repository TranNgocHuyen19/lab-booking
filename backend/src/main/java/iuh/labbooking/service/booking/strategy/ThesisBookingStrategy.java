package iuh.labbooking.service.booking.strategy;

import iuh.labbooking.service.booking.BookingCreationContext;
import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.ParticipantStatus;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.model.ResearchGroup;
import iuh.labbooking.repository.BookingRequestRepository;
import iuh.labbooking.repository.DeviceRepository;
import iuh.labbooking.repository.LabRoomRepository;
import iuh.labbooking.repository.ResearchGroupRepository;
import iuh.labbooking.repository.SlotRepository;
import iuh.labbooking.repository.UserRepository;
import iuh.labbooking.service.booking.BookingConflictQueryService;
import iuh.labbooking.service.booking.BookingHistoryService;
import iuh.labbooking.service.booking.DeviceAvailabilityService;
import iuh.labbooking.service.booking.ThesisOverrideService;
import iuh.labbooking.service.systemconfiguration.SystemConfigurationService;
import iuh.labbooking.service.booking.validation.BookingValidationResult;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public class ThesisBookingStrategy extends AbstractBookingCreationStrategy {

    private final BookingConflictQueryService conflictQueryService;
    private final ThesisOverrideService thesisOverrideService;

    public ThesisBookingStrategy(
            BookingRequestRepository bookingRequestRepository,
            UserRepository userRepository,
            LabRoomRepository labRoomRepository,
            SlotRepository slotRepository,
            DeviceRepository deviceRepository,
            ResearchGroupRepository researchGroupRepository,
            SystemConfigurationService systemConfigurationService,
            DeviceAvailabilityService deviceAvailabilityService,
            BookingHistoryService bookingHistoryService,
            BookingConflictQueryService conflictQueryService,
            ThesisOverrideService thesisOverrideService) {
        super(bookingRequestRepository, userRepository, labRoomRepository, slotRepository, deviceRepository,
                researchGroupRepository, systemConfigurationService, deviceAvailabilityService, bookingHistoryService);
        this.conflictQueryService = conflictQueryService;
        this.thesisOverrideService = thesisOverrideService;
    }

    @Override
    public BookingType bookingType() {
        return BookingType.THESIS;
    }

    @Override
    public BookingValidationResult validate(BookingCreationContext context) {
        BookingValidationResult result = BookingValidationResult.ok();
        validateRequestShape(context, result);
        if (result.hasErrors()) {
            return result;
        }

        if (conflictQueryService.roomHasActiveThesisBooking(context.labRoomId(), primaryDate(context), slotIds(context))) {
            result.addError(ErrorCode.ROOM_HAS_THESIS_BOOKING);
        }
        validateDevices(context, result);
        return result;
    }

    @Override
    public BookingRequest create(BookingCreationContext context, BookingValidationResult validationResult) {
        List<ParticipantSeed> participants = context.participants().stream()
                .map(participant -> new ParticipantSeed(participant.userId(), participant.role(), ParticipantStatus.CONFIRMED))
                .toList();

        Set<ResearchGroup> researchGroups = loadResearchGroups(context.researchGroupIds());
        return persistBooking(context, RequestStatus.APPROVED, researchGroups, participants);
    }

    @Override
    public void afterCreated(BookingRequest bookingRequest, BookingCreationContext context) {
        thesisOverrideService.cancelConflictingPersonalAndGroupBookings(
                bookingRequest,
                primaryDate(context),
                slotIds(context));
    }
}
