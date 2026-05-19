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
import iuh.labbooking.service.booking.ParticipantConflictService;
import iuh.labbooking.service.systemconfiguration.SystemConfigurationService;
import iuh.labbooking.service.booking.validation.BookingValidationResult;
import iuh.labbooking.service.booking.validation.ParticipantConflictResult;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public class GroupBookingStrategy extends AbstractBookingCreationStrategy {

    private final BookingConflictQueryService conflictQueryService;
    private final ParticipantConflictService participantConflictService;

    public GroupBookingStrategy(
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
            ParticipantConflictService participantConflictService) {
        super(bookingRequestRepository, userRepository, labRoomRepository, slotRepository, deviceRepository,
                researchGroupRepository, systemConfigurationService, deviceAvailabilityService, bookingHistoryService);
        this.conflictQueryService = conflictQueryService;
        this.participantConflictService = participantConflictService;
    }

    @Override
    public BookingType bookingType() {
        return BookingType.GROUP;
    }

    @Override
    public BookingValidationResult validate(BookingCreationContext context) {
        BookingValidationResult result = BookingValidationResult.ok();
        var date = primaryDate(context);
        var slotIds = slotIds(context);

        if (context.researchGroupIds().size() != 1) {
            result.addError(ErrorCode.GROUP_REQUIRES_ONE_RESEARCH_GROUP);
            return result;
        }

        Long researchGroupId = context.researchGroupIds().iterator().next();
        if (conflictQueryService.researchGroupHasActiveGroupBooking(researchGroupId, date, slotIds)) {
            result.addError(ErrorCode.RESEARCH_GROUP_HAS_ACTIVE_BOOKING);
        }

        if (conflictQueryService.roomHasActiveThesisBooking(context.labRoomId(), date, slotIds)) {
            result.addError(ErrorCode.ROOM_HAS_THESIS_BOOKING);
        }

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

        validateDevices(context, result);
        return result;
    }

    @Override
    public BookingRequest create(BookingCreationContext context, BookingValidationResult validationResult) {
        var date = primaryDate(context);
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
