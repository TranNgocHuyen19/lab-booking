package iuh.labbooking.service.booking.strategy;

import iuh.labbooking.service.booking.BookingCreationContext;
import iuh.labbooking.enums.BookingType;
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
import iuh.labbooking.service.booking.conflict.ParticipantConflictService;
import iuh.labbooking.service.systemconfiguration.SystemConfigurationService;
import iuh.labbooking.service.booking.validation.BookingCreationValidator;
import iuh.labbooking.service.booking.validation.BookingValidationResult;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public class GroupBookingStrategy extends AbstractBookingCreationStrategy {

    private final ParticipantConflictService participantConflictService;
    private final BookingCreationValidator bookingCreationValidator;

    public GroupBookingStrategy(
            BookingRequestRepository bookingRequestRepository,
            UserRepository userRepository,
            LabRoomRepository labRoomRepository,
            SlotRepository slotRepository,
            DeviceRepository deviceRepository,
            ResearchGroupRepository researchGroupRepository,
            SystemConfigurationService systemConfigurationService,
            BookingHistoryService bookingHistoryService,
            ParticipantConflictService participantConflictService,
            BookingCreationValidator bookingCreationValidator) {
        super(bookingRequestRepository, userRepository, labRoomRepository, slotRepository, deviceRepository,
                researchGroupRepository, systemConfigurationService, bookingHistoryService);
        this.participantConflictService = participantConflictService;
        this.bookingCreationValidator = bookingCreationValidator;
    }

    @Override
    public BookingType bookingType() {
        return BookingType.GROUP;
    }

    @Override
    public BookingValidationResult validate(BookingCreationContext context) {
        return bookingCreationValidator.validateGroup(context);
    }

    @Override
    public BookingRequest create(BookingCreationContext context, BookingValidationResult validationResult) {
        var date = context.primaryDate();
        var slotIds = slotIds(context);

        List<ParticipantSeed> participants = context.participants().stream()
                .map(participant -> new ParticipantSeed(
                        participant.userId(),
                        participant.role(),
                        participantConflictService.resolveStatusForGroupParticipant(participant.userId(), date, slotIds)))
                .toList();

        Set<ResearchGroup> researchGroups = loadResearchGroups(context.researchGroupIds());
        return persistBooking(context, RequestStatus.PENDING, researchGroups, participants);
    }
}
