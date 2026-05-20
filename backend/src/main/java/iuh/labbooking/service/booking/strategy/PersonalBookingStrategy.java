package iuh.labbooking.service.booking.strategy;

import iuh.labbooking.service.booking.BookingCreationContext;
import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.ParticipantRole;
import iuh.labbooking.enums.ParticipantStatus;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.repository.BookingRequestRepository;
import iuh.labbooking.repository.DeviceRepository;
import iuh.labbooking.repository.LabRoomRepository;
import iuh.labbooking.repository.ResearchGroupRepository;
import iuh.labbooking.repository.SlotRepository;
import iuh.labbooking.repository.UserRepository;
import iuh.labbooking.service.booking.BookingHistoryService;
import iuh.labbooking.service.systemconfiguration.SystemConfigurationService;
import iuh.labbooking.service.booking.validation.BookingCreationValidator;
import iuh.labbooking.service.booking.validation.BookingValidationResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
@Slf4j
public class PersonalBookingStrategy extends AbstractBookingCreationStrategy {

    private final BookingCreationValidator bookingCreationValidator;

    public PersonalBookingStrategy(
            BookingRequestRepository bookingRequestRepository,
            UserRepository userRepository,
            LabRoomRepository labRoomRepository,
            SlotRepository slotRepository,
            DeviceRepository deviceRepository,
            ResearchGroupRepository researchGroupRepository,
            SystemConfigurationService systemConfigurationService,
            BookingHistoryService bookingHistoryService,
            BookingCreationValidator bookingCreationValidator) {
        super(bookingRequestRepository, userRepository, labRoomRepository, slotRepository, deviceRepository,
                researchGroupRepository, systemConfigurationService, bookingHistoryService);
        this.bookingCreationValidator = bookingCreationValidator;
    }

    @Override
    public BookingType bookingType() {
        return BookingType.PERSONAL;
    }

    @Override
    public BookingValidationResult validate(BookingCreationContext context) {
        return bookingCreationValidator.validatePersonal(context);
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
