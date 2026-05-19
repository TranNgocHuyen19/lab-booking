package iuh.labbooking.service.booking.strategy;

import iuh.labbooking.dto.request.booking.CreateBookingSlot;
import iuh.labbooking.enums.ParticipantRole;
import iuh.labbooking.enums.ParticipantStatus;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.enums.StatusChangeReason;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.model.BookingDevice;
import iuh.labbooking.model.BookingParticipant;
import iuh.labbooking.model.BookingRequest;
import iuh.labbooking.model.Device;
import iuh.labbooking.model.LabRoom;
import iuh.labbooking.model.ResearchGroup;
import iuh.labbooking.model.Slot;
import iuh.labbooking.model.SlotBooking;
import iuh.labbooking.model.User;
import iuh.labbooking.repository.BookingRequestRepository;
import iuh.labbooking.repository.DeviceRepository;
import iuh.labbooking.repository.LabRoomRepository;
import iuh.labbooking.repository.ResearchGroupRepository;
import iuh.labbooking.repository.SlotRepository;
import iuh.labbooking.repository.UserRepository;
import iuh.labbooking.service.booking.BookingCreationContext;
import iuh.labbooking.service.booking.BookingHistoryService;
import iuh.labbooking.service.booking.DeviceAvailabilityService;
import iuh.labbooking.service.systemconfiguration.SystemConfigurationService;
import iuh.labbooking.service.booking.validation.BookingValidationError;
import iuh.labbooking.service.booking.validation.BookingValidationResult;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RequiredArgsConstructor
abstract class AbstractBookingCreationStrategy implements BookingCreationStrategy {

    protected final BookingRequestRepository bookingRequestRepository;
    protected final UserRepository userRepository;
    protected final LabRoomRepository labRoomRepository;
    protected final SlotRepository slotRepository;
    protected final DeviceRepository deviceRepository;
    protected final ResearchGroupRepository researchGroupRepository;
    protected final SystemConfigurationService systemConfigurationService;
    protected final DeviceAvailabilityService deviceAvailabilityService;
    protected final BookingHistoryService bookingHistoryService;

    protected void validateDevices(BookingCreationContext context, BookingValidationResult result) {
        deviceAvailabilityService.checkAvailability(context).stream()
                .filter(device -> !device.available())
                .map(device -> new BookingValidationError(
                        ErrorCode.INSUFFICIENT_DEVICE_QUANTITY.name(),
                        "Device " + device.deviceId() + " only has " + device.availableQuantity() + " available item(s)",
                        null,
                        null))
                .forEach(result::addError);
    }

    protected BookingRequest persistBooking(
            BookingCreationContext context,
            RequestStatus status,
            Set<ResearchGroup> researchGroups,
            List<ParticipantSeed> participants) {

        User requester = userRepository.findById(context.requesterId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        LabRoom labRoom = labRoomRepository.findById(context.labRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.LAB_ROOM_NOT_FOUND));

        BookingRequest booking = BookingRequest.builder()
                .purpose(context.purpose())
                .bookingType(context.bookingType())
                .status(status)
                .requester(requester)
                .labRoom(labRoom)
                .researchGroup(researchGroups)
                .bookingSystemConfig(systemConfigurationService.createBookingSnapshot())
                .build();

        booking.setSlotBookings(buildSlotBookings(context, booking));
        booking.setParticipants(buildParticipants(booking, participants));
        booking.setBookingDevices(buildBookingDevices(context, booking));

        BookingRequest saved = bookingRequestRepository.save(booking);
        bookingHistoryService.saveStatusChange(
                saved,
                null,
                status,
                StatusChangeReason.NEW_REQUEST,
                "Booking request created",
                null);

        return saved;
    }

    protected Set<ResearchGroup> loadResearchGroups(Set<Long> researchGroupIds) {
        if (researchGroupIds == null || researchGroupIds.isEmpty()) {
            return new HashSet<>();
        }
        return new HashSet<>(researchGroupRepository.findAllById(researchGroupIds));
    }

    protected LocalDate primaryDate(BookingCreationContext context) {
        return context.primaryDate();
    }

    protected List<Long> slotIds(BookingCreationContext context) {
        return context.slotIds();
    }

    private Set<SlotBooking> buildSlotBookings(BookingCreationContext context, BookingRequest booking) {
        Set<SlotBooking> slotBookings = new HashSet<>();
        for (CreateBookingSlot slotCommand : context.slots()) {
            Slot slot = slotRepository.findById(slotCommand.slotId())
                    .orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND));
            slotBookings.add(SlotBooking.builder()
                    .bookingRequest(booking)
                    .slot(slot)
                    .name(context.purpose())
                    .bookingDate(slotCommand.bookingDate())
                    .startTime(slot.getStartTime())
                    .endTime(slot.getEndTime())
                    .build());
        }
        return slotBookings;
    }

    private Set<BookingParticipant> buildParticipants(BookingRequest booking, List<ParticipantSeed> participants) {
        Set<BookingParticipant> result = new HashSet<>();
        for (ParticipantSeed seed : participants) {
            User user = userRepository.findById(seed.userId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            result.add(BookingParticipant.builder()
                    .bookingRequest(booking)
                    .user(user)
                    .role(seed.role())
                    .status(seed.status())
                    .build());
        }
        return result;
    }

    private Set<BookingDevice> buildBookingDevices(BookingCreationContext context, BookingRequest booking) {
        Set<BookingDevice> devices = new HashSet<>();
        for (var deviceCommand : context.devices()) {
            Device device = deviceRepository.findById(deviceCommand.deviceId())
                    .orElseThrow(() -> new AppException(ErrorCode.DEVICE_NOT_FOUND));
            devices.add(BookingDevice.builder()
                    .bookingRequest(booking)
                    .device(device)
                    .quantity(deviceCommand.quantity())
                    .build());
        }
        return devices;
    }

    protected void markApproved(BookingRequest bookingRequest) {
        bookingRequest.setStatus(RequestStatus.APPROVED);
        bookingRequest.setResponseDate(LocalDateTime.now());
        bookingRequestRepository.save(bookingRequest);
    }

    protected record ParticipantSeed(Long userId, ParticipantRole role, ParticipantStatus status) {
    }
}
