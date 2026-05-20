package iuh.labbooking.service.booking.strategy;

import iuh.labbooking.service.booking.BookingCreationContext;
import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.ParticipantStatus;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.model.ResearchGroup;
import iuh.labbooking.repository.BookingRequestRepository;
import iuh.labbooking.repository.DeviceRepository;
import iuh.labbooking.repository.LabRoomRepository;
import iuh.labbooking.repository.ResearchGroupRepository;
import iuh.labbooking.repository.SlotRepository;
import iuh.labbooking.repository.UserRepository;
import iuh.labbooking.service.booking.BookingHistoryService;
import iuh.labbooking.service.booking.conflict.ThesisOverrideService;
import iuh.labbooking.service.systemconfiguration.SystemConfigurationService;
import iuh.labbooking.service.booking.validation.BookingCreationValidator;
import iuh.labbooking.service.booking.validation.BookingValidationResult;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public class ThesisBookingStrategy extends AbstractBookingCreationStrategy {

    private final ThesisOverrideService thesisOverrideService;
    private final BookingCreationValidator bookingCreationValidator;

    public ThesisBookingStrategy(
            BookingRequestRepository bookingRequestRepository,
            UserRepository userRepository,
            LabRoomRepository labRoomRepository,
            SlotRepository slotRepository,
            DeviceRepository deviceRepository,
            ResearchGroupRepository researchGroupRepository,
            SystemConfigurationService systemConfigurationService,
            BookingHistoryService bookingHistoryService,
            ThesisOverrideService thesisOverrideService,
            BookingCreationValidator bookingCreationValidator) {
        super(bookingRequestRepository, userRepository, labRoomRepository, slotRepository, deviceRepository,
                researchGroupRepository, systemConfigurationService, bookingHistoryService);
        this.thesisOverrideService = thesisOverrideService;
        this.bookingCreationValidator = bookingCreationValidator;
    }

    @Override
    public BookingType bookingType() {
        return BookingType.THESIS;
    }

    @Override
    public BookingValidationResult validate(BookingCreationContext context) {
        return bookingCreationValidator.validateThesis(context);
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
                context.primaryDate(),
                slotIds(context));
    }
}
