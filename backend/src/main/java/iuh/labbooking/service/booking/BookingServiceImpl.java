package iuh.labbooking.service.booking;

import iuh.labbooking.dto.DeviceReservationDto;
import iuh.labbooking.dto.request.booking.AddParticipantRequest;
import iuh.labbooking.dto.request.booking.BookingStatusRequest;
import iuh.labbooking.dto.request.booking.CancelBookingRequest;
import iuh.labbooking.dto.request.booking.CreateBookingDevice;
import iuh.labbooking.dto.request.booking.CreateBookingRequest;
import iuh.labbooking.dto.request.booking.CreateBookingSlot;
import iuh.labbooking.dto.request.booking.CreateBookingParticipant;
import iuh.labbooking.dto.request.booking.UpdateBookingRequest;

import iuh.labbooking.dto.request.booking.DeviceQuantityRequest;
import iuh.labbooking.dto.response.booking.*;
import iuh.labbooking.dto.response.bookingdevice.BookingDeviceResponse;
import iuh.labbooking.dto.response.bookinghistory.BookingStatusHistoryResponse;
import iuh.labbooking.dto.response.participant.ParticipantResponse;
import iuh.labbooking.dto.response.participant.SecureParticipantResponse;
import iuh.labbooking.dto.response.user.UserSummaryResponse;
import iuh.labbooking.enums.*;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.mapper.BookingMapper;
import iuh.labbooking.mapper.booking.BookingCreationResponseMapper;
import iuh.labbooking.mapper.BookingStatusHistoryMapper;
import iuh.labbooking.mapper.UserMapper;
import iuh.labbooking.model.*;
import iuh.labbooking.repository.*;
import iuh.labbooking.service.booking.conflict.BookingConflictQueryService;
import iuh.labbooking.service.booking.strategy.BookingCreationStrategy;
import iuh.labbooking.service.booking.strategy.BookingStrategyFactory;
import iuh.labbooking.service.booking.validation.BookingValidationResult;
import iuh.labbooking.service.booking.validation.BookingValidationResult.ExistingScheduleConflictResult;
import iuh.labbooking.service.systemconfiguration.SystemConfigurationService;
import iuh.labbooking.service.researchgroup.ResearchGroupService;
import iuh.labbooking.service.user.UserService;
import iuh.labbooking.util.SecurityUtil;
import iuh.labbooking.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import iuh.labbooking.dto.response.base.PageResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRequestRepository bookingRequestRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final SlotBookingRepository slotBookingRepository;
    private final BookingParticipantRepository bookingParticipantRepository;
    private final LabRoomRepository labRoomRepository;
    private final ResearchGroupRepository researchGroupRepository;
    private final SlotRepository slotRepository;
    private final UserService userService;
    private final SecurityUtil securityUtil;
    private final BookingMapper bookingMapper;
    private final BookingSlotAttendanceRepository bookingSlotAttendanceRepository;
    private final SystemConfigurationService configService;
    private final ResearchGroupService researchGroupService;
    private final GroupMembershipRepository groupMembershipRepository;
    private final DeviceRepository deviceRepository;
    private final BookingDeviceRepository bookingDeviceRepository;
    private final LabRoomDeviceRepository labRoomDeviceRepository;
    private final BookingRequestStatusHistoryRepository bookingRequestStatusHistoryRepository;
    private final BookingStatusHistoryMapper bookingStatusHistoryMapper;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final BookingStrategyFactory bookingStrategyFactory;
    private final BookingCreationResponseMapper bookingCreationResponseMapper;
    private final BookingConflictQueryService bookingConflictQueryService;


    @Transactional
    @Override
    public BookingResponse createBookingV2(CreateBookingRequest request) {
        Long currentUserId = securityUtil.getCurrentUserId();
        BookingCreationContext context = new BookingCreationContext(request, currentUserId);
        log.info("Creating booking request: requesterId={}, type={}, labRoomId={}, slotCount={}, participantCount={}, deviceCount={}, forceSwitch={}",
                currentUserId,
                context.bookingType(),
                context.labRoomId(),
                context.slots().size(),
                context.participants().size(),
                context.devices().size(),
                context.forceSwitch());

        lockResourcesForCreationV2(context);
        log.debug("Locked booking resources: requesterId={}, labRoomId={}, slotIds={}, deviceIds={}",
                currentUserId,
                context.labRoomId(),
                context.slotIds(),
                context.devices().stream().map(CreateBookingDevice::deviceId).sorted().toList());

        BookingCreationStrategy strategy = bookingStrategyFactory.getStrategy(context.bookingType());
        BookingValidationResult validationResult = strategy.validate(context);
        log.info("Booking validation completed: requesterId={}, type={}, errorCount={}, existingConflictCount={}, participantConflictCount={}, warningCount={}",
                currentUserId,
                context.bookingType(),
                validationResult.errors().size(),
                validationResult.existingScheduleConflicts().size(),
                validationResult.participantConflicts().size(),
                validationResult.warnings().size());

        if (validationResult.hasErrors()) {
            log.warn("Booking validation failed: requesterId={}, type={}, errorCount={}",
                    currentUserId,
                    context.bookingType(),
                    validationResult.errors().size());
            throw new AppException(ErrorCode.BOOKING_VALIDATION_FAILED, validationResult);
        }

        if (!validationResult.existingScheduleConflicts().isEmpty()) {
            if (context.forceSwitch()) {
                log.info("Force switch requested: requesterId={}, conflictCount={}",
                        currentUserId,
                        validationResult.existingScheduleConflicts().size());
                cancelOrLeaveConflictingBookings(currentUserId, validationResult.existingScheduleConflicts());
            } else {
                log.warn("Existing schedule conflict requires confirmation: requesterId={}, conflictCount={}",
                        currentUserId,
                        validationResult.existingScheduleConflicts().size());
                throw new AppException(ErrorCode.BOOKING_VALIDATION_FAILED, validationResult);
            }
        }

        BookingRequest bookingRequest = strategy.create(context, validationResult);
        log.info("Booking persisted: bookingRequestId={}, requesterId={}, type={}, status={}",
                bookingRequest.getBookingRequestId(),
                currentUserId,
                bookingRequest.getBookingType(),
                bookingRequest.getStatus());
        strategy.afterCreated(bookingRequest, context);

        eventPublisher.publishEvent(new BookingCreatedEvent(bookingRequest.getBookingRequestId(), currentUserId));
        log.info("Published booking created event: bookingRequestId={}, requesterId={}",
                bookingRequest.getBookingRequestId(),
                currentUserId);
        publishParticipantConflictRequiredEvents(bookingRequest, currentUserId);

        return bookingCreationResponseMapper.toResponse(bookingRequest, validationResult);
    }

    private void publishParticipantConflictRequiredEvents(BookingRequest bookingRequest, Long actorId) {
        List<BookingParticipant> pendingParticipants = bookingRequest.getParticipants().stream()
                .filter(participant -> participant.getStatus() == ParticipantStatus.PENDING_CONFLICT_RESOLUTION)
                .sorted(Comparator.comparing(BookingParticipant::getBookingParticipantId))
                .toList();

        if (pendingParticipants.isEmpty()) {
            log.info("No participant conflict-required events to publish: bookingRequestId={}",
                    bookingRequest.getBookingRequestId());
            return;
        }

        for (BookingParticipant participant : pendingParticipants) {
            eventPublisher.publishEvent(new ParticipantConflictRequiredEvent(
                    bookingRequest.getBookingRequestId(),
                    participant.getBookingParticipantId(),
                    participant.getUser().getUserId(),
                    actorId
            ));
            log.info("Published participant conflict-required event: bookingRequestId={}, participantId={}, userId={}, actorId={}",
                    bookingRequest.getBookingRequestId(),
                    participant.getBookingParticipantId(),
                    participant.getUser().getUserId(),
                    actorId);
        }
    }

    private void cancelOrLeaveConflictingBookings(Long userId, List<ExistingScheduleConflictResult> conflicts) {
        Set<Long> conflictingBookingRequestIds = conflicts.stream()
                .map(ExistingScheduleConflictResult::conflictingBookingRequestId)
                .collect(Collectors.toSet());

        List<Long> sortedIds = conflictingBookingRequestIds.stream()
                .sorted()
                .toList();
        log.info("Resolving force-switch conflicts: userId={}, bookingIds={}", userId, sortedIds);

        for (Long bookingId : sortedIds) {
            BookingRequest booking = bookingRequestRepository.lockByBookingRequestId(bookingId)
                    .orElse(null);
            if (booking == null) {
                log.warn("Force-switch conflict booking not found after lock: bookingId={}", bookingId);
                continue;
            }

            if (booking.getBookingType() == BookingType.PERSONAL) {
                if (!booking.getRequester().getUserId().equals(userId)) {
                    throw new AppException(ErrorCode.BOOKING_NOT_ALLOWED);
                }

                RequestStatus oldStatus = booking.getStatus();
                if (oldStatus == RequestStatus.PENDING || oldStatus == RequestStatus.APPROVED) {
                    booking.setStatus(RequestStatus.CANCELED);
                    bookingRequestRepository.save(booking);
                    log.info("Force-switch canceled personal booking: bookingId={}, userId={}, oldStatus={}",
                            bookingId,
                            userId,
                            oldStatus);

                    bookingSlotAttendanceRepository.deleteByBookingRequest(booking);

                    List<BookingParticipant> participants = bookingParticipantRepository.findByBookingRequest(booking);
                    participants.forEach(p -> p.setStatus(ParticipantStatus.CANCELLED));
                    bookingParticipantRepository.saveAll(participants);

                    saveBookingStatusHistory(booking, oldStatus, RequestStatus.CANCELED, StatusChangeReason.USER_CANCELED,
                            "Cancelled to switch to a new personal booking.", null);
                }
            } else if (booking.getBookingType() == BookingType.GROUP) {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
                BookingParticipant participant = bookingParticipantRepository
                        .lockByBookingRequestAndUser(booking, user)
                        .orElseThrow(() -> new AppException(ErrorCode.NOT_A_PARTICIPANT));
                if (participant.getStatus() != ParticipantStatus.CONFIRMED) {
                    throw new AppException(ErrorCode.NOT_A_PARTICIPANT);
                }
                participant.setStatus(ParticipantStatus.CANCELLED);
                bookingParticipantRepository.save(participant);
                log.info("Force-switch canceled group participant: bookingId={}, participantId={}, userId={}",
                        bookingId,
                        participant.getBookingParticipantId(),
                        userId);

                bookingSlotAttendanceRepository.deleteByBookingRequestAndBookingParticipant(booking, participant);
            }
        }
    }

    private void lockResourcesForCreationV2(BookingCreationContext context) {
        if (context.bookingType() == BookingType.PERSONAL) {
            userRepository.lockByUserId(context.requesterId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }

        if (context.bookingType() == BookingType.GROUP && context.researchGroupIds().size() == 1) {
            Long researchGroupId = context.researchGroupIds().iterator().next();
            researchGroupRepository.lockByResearchGroupId(researchGroupId)
                    .orElseThrow(() -> new AppException(ErrorCode.RESEARCH_GROUP_NOT_FOUND));
        }

        labRoomRepository.lockByLabRoomId(context.labRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.LAB_ROOM_NOT_FOUND));

        if (!context.devices().isEmpty()) {
            labRoomDeviceRepository.findByLabRoomIdAndDeviceIdsWithLock(
                    context.labRoomId(),
                    context.devices().stream()
                            .map(CreateBookingDevice::deviceId)
                            .sorted()
                            .toList());
        }
    }

    @Transactional
    @Override
    public BookingResponse updateBooking(Long id, UpdateBookingRequest request) {
        BookingRequest booking = bookingRequestRepository.findByBookingRequestId(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        validateStatusIsPending(booking);
        validateUpdateAuthorization(booking, securityUtil.getCurrentUser());
        validateUpdateTiming(booking);

        if (booking.getSlotBookings() == null || booking.getSlotBookings().isEmpty()) {
            throw new AppException(ErrorCode.BOOKING_NOT_FOUND, "Đơn đặt không có thông tin ca học");
        }

        if (request.participants() != null) {
            List<String> currentUsernames = booking.getParticipants().stream()
                    .map(p -> p.getUser().getUsername())
                    .sorted()
                    .toList();
            List<String> requestedUsernames = request.participants().stream()
                    .map(AddParticipantRequest::username)
                    .sorted()
                    .toList();
            if (!currentUsernames.equals(requestedUsernames)) {
                throw new AppException(ErrorCode.BOOKING_UPDATE_FIELD_RESTRICTED);
            }
        }

        LabRoom labRoom = labRoomRepository.lockByLabRoomId(booking.getLabRoom().getLabRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.LAB_ROOM_NOT_FOUND));

        if (request.devices() != null && !request.devices().isEmpty()) {
            List<Long> deviceIds = request.devices().stream()
                    .map(DeviceQuantityRequest::deviceId)
                    .sorted()
                    .toList();
            labRoomDeviceRepository.findByLabRoomIdAndDeviceIdsWithLock(labRoom.getLabRoomId(), deviceIds);
        }

        LocalDate bookingDate = booking.getSlotBookings().iterator().next().getBookingDate();
        List<Long> currentSlotIds = booking.getSlotBookings().stream()
                .map(sb -> sb.getSlot().getSlotId())
                .toList();

        booking.setPurpose(request.purpose());
        booking.getSlotBookings().forEach(sb -> sb.setName(request.purpose()));

        booking.getParticipants().clear();
        booking.getBookingDevices().clear();

        bookingRequestRepository.saveAndFlush(booking);

        List<AddParticipantRequest> normalized = normalizeParticipants(
                booking.getBookingType(), request.participants(), booking.getRequester());

        validateNoDuplicateBookings(normalized, bookingDate,
                currentSlotIds, booking.getBookingRequestId(), request.force());

        booking.getParticipants().addAll(mapToParticipants(booking, normalized));

        if (request.devices() != null && !request.devices().isEmpty()) {
            validateInventory(labRoom, bookingDate,
                    currentSlotIds, request.devices(), booking.getBookingRequestId());

            booking.getBookingDevices().addAll(mapToBookingDevices(booking, request.devices()));
        }

        BookingRequest updatedBooking = bookingRequestRepository.save(booking);
        return buildBookingResponse(updatedBooking, securityUtil.getCurrentUser());
    }

    private void validateNoDuplicateBookings(
            List<AddParticipantRequest> participants,
            LocalDate bookingDate,
            List<Long> slotIds,
            Long excludeId,
            Boolean force) {
        if (Boolean.TRUE.equals(force)) {
            return;
        }

        List<String> usernames = participants.stream()
                .map(AddParticipantRequest::username)
                .toList();

        List<User> users = usernames.stream()
                .map(userService::findEntityByUsername)
                .toList();

        List<Long> userIds = users.stream().map(User::getUserId).toList();

        List<User> conflictingUsers = bookingParticipantRepository
                .findConflictingUsers(userIds, bookingDate, slotIds, excludeId);

        if (!conflictingUsers.isEmpty()) {
            List<String> conflictingNames = conflictingUsers.stream()
                    .map(u -> u.getFullName() + " (" + u.getUsername() + ")")
                    .toList();
            throw new AppException(ErrorCode.USER_ALREADY_BOOKED_IN_TIME_SLOT, conflictingNames);
        }
    }

    private List<AddParticipantRequest> normalizeParticipants(
            BookingType bookingType,
            List<AddParticipantRequest> participants,
            User currentUser) {
        if (bookingType == BookingType.PERSONAL) {
            return List.of(new AddParticipantRequest(
                    currentUser.getUsername(),
                    ParticipantRole.SELF_STUDY));
        }

        if (bookingType == BookingType.GROUP && (participants == null || participants.isEmpty())) {
            throw new AppException(ErrorCode.BOOKING_NO_PARTICIPANTS);
        }

        // boolean currentUserIncluded = participants.stream()
        // .anyMatch(p -> p.username().equals(currentUser.getUsername()));

        // if (!currentUserIncluded) {
        // List<AddParticipantRequest> normalized = new ArrayList<>(participants);
        //
        // ParticipantRole defaultRole = bookingType == BookingType.THESIS
        // ? ParticipantRole.SUPERVISOR
        // : ParticipantRole.GROUP_STUDY;
        //
        // normalized.add(new AddParticipantRequest(
        // currentUser.getUsername(),
        // defaultRole));
        // return normalized;
        // }

        return participants;
    }

    @Transactional
    @Override
    public BookingResponse cancelBooking(Long bookingRequestId, CancelBookingRequest request) {
        log.info("Canceling booking: ID={}", bookingRequestId);

        User currentUser = securityUtil.getCurrentUser();

        BookingRequest booking = bookingRequestRepository.lockByBookingRequestId(bookingRequestId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (!booking.getRequester().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.BOOKING_NOT_OWNER);
        }

        if (booking.getStatus() != RequestStatus.PENDING) {
            throw new AppException(ErrorCode.BOOKING_CANNOT_CANCEL);
        }

        BookingSystemConfig currentConfig = configService.getActiveBookingConfig();
        LocalDateTime startTime = getBookingStartTime(booking);

        long minutesUntilStart = java.time.Duration.between(LocalDateTime.now(), startTime).toMinutes();

        if (minutesUntilStart < currentConfig.getMinMinutesBeforeStartToCancel()) {
            throw new AppException(ErrorCode.LATE_CANCELLATION_NOT_ALLOWED, Map.of(
                    "minMinutesBeforeStartToCancel", currentConfig.getMinMinutesBeforeStartToCancel(),
                    "minutesUntilStart", minutesUntilStart
            ));
        }

        RequestStatus oldStatus = booking.getStatus();
        booking.setStatus(RequestStatus.CANCELED);
        booking = bookingRequestRepository.save(booking);

        List<BookingParticipant> participants = bookingParticipantRepository
                .findByBookingRequest(booking);

        participants.forEach(p -> p.setStatus(ParticipantStatus.CANCELLED));
        bookingParticipantRepository.saveAll(participants);

        log.info("Booking canceled: ID={}, Participants canceled: {}",
                bookingRequestId, participants.size());

        saveBookingStatusHistory(booking, oldStatus, RequestStatus.CANCELED, StatusChangeReason.USER_CANCELED,
                request != null ? request.cancelReason() : null, null);

        eventPublisher.publishEvent(new BookingStatusChangedEvent(booking.getBookingRequestId(), oldStatus, RequestStatus.CANCELED, currentUser.getUserId()));

        return buildBookingResponse(booking, currentUser);
    }
    @Transactional
    @Override
    public BookingResponse leaveBooking(Long bookingRequestId) {
        log.info("User leaving booking: ID={}", bookingRequestId);

        User currentUser = securityUtil.getCurrentUser();

        BookingRequest booking = bookingRequestRepository.lockByBookingRequestId(bookingRequestId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getStatus() != RequestStatus.PENDING) {
            throw new AppException(ErrorCode.BOOKING_CANNOT_CANCEL);
        }

        if (booking.getRequester().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.CREATOR_MUST_CANCEL_BOOKING);
        }

        if (booking.getBookingType() == BookingType.THESIS) {
            throw new AppException(ErrorCode.PARTICIPANT_CANNOT_LEAVE_THESIS);
        }

        BookingParticipant participant = bookingParticipantRepository
                .lockByBookingRequestAndUser(booking, currentUser)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_A_PARTICIPANT));

        if (participant.getStatus() != ParticipantStatus.CONFIRMED
                && participant.getStatus() != ParticipantStatus.PENDING_CONFLICT_RESOLUTION) {
            throw new AppException(ErrorCode.NOT_A_PARTICIPANT);
        }

        long activeCount = booking.getParticipants().stream()
                .filter(p -> p.getStatus() == ParticipantStatus.CONFIRMED 
                        || p.getStatus() == ParticipantStatus.PENDING_CONFLICT_RESOLUTION)
                .count();

        if (activeCount <= 1) {
            throw new AppException(ErrorCode.CANNOT_REMOVE_LAST_PARTICIPANT);
        }

        participant.setStatus(ParticipantStatus.CANCELLED);
        bookingParticipantRepository.save(participant);

        log.info("User {} left booking {}", currentUser.getUserId(), bookingRequestId);

        return buildBookingResponse(booking, currentUser);
    }

    @Transactional(readOnly = true)
    @Override
    public List<BookingResponse> findMyBookings() {
        User currentUser = securityUtil.getCurrentUser();

        List<BookingRequest> asRequester = bookingRequestRepository
                .findByRequester(currentUser);

        List<BookingParticipant> asParticipant = bookingParticipantRepository
                .findByUserAndStatusIn(currentUser, List.of(ParticipantStatus.CONFIRMED, ParticipantStatus.PENDING_CONFLICT_RESOLUTION));

        Set<BookingRequest> allBookings = new HashSet<>(asRequester);
        asParticipant.forEach(p -> allBookings.add(p.getBookingRequest()));

        return allBookings.stream()
                .map(booking -> buildBookingResponse(booking, currentUser))
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<SecureBookingResponse> findMyGroupBookings() {
        User currentUser = securityUtil.getCurrentUser();

        if (!securityUtil.isLecturer()) {
            return List.of();
        }

        List<BookingRequest> groupBookings = bookingRequestRepository.findByGroupMembership(currentUser.getUserId());

        return groupBookings.stream()
                .map(booking -> buildSecureBookingResponse(booking, currentUser))
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public BookingResponse findBookingById(Long bookingRequestId) {
        User currentUser = securityUtil.getCurrentUser();

        BookingRequest booking = bookingRequestRepository.findById(bookingRequestId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        boolean isRequester = booking.getRequester().getUserId().equals(currentUser.getUserId());
        boolean isActiveParticipant = bookingParticipantRepository
                .existsByBookingRequestAndUserAndStatusIn(booking, currentUser, List.of(ParticipantStatus.CONFIRMED, ParticipantStatus.PENDING_CONFLICT_RESOLUTION));
        boolean isAdmin = currentUser.getRole().getRoleName().equals("ADMIN");

        if (!isRequester && !isActiveParticipant && !isAdmin) {
            throw new AppException(ErrorCode.BOOKING_NOT_ALLOWED);
        }

        return buildBookingResponse(booking, currentUser);
    }

    @Override
    public SecureBookingResponse findBookingByIdAdmin(Long bookingRequestId) {
        User currentUser = securityUtil.getCurrentUser();

        BookingRequest booking = bookingRequestRepository.findById(bookingRequestId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        boolean isAdminOrLecturer = securityUtil.isAdmin() || securityUtil.isLecturer();

        if (!isAdminOrLecturer) {
            throw new AppException(ErrorCode.BOOKING_NOT_ALLOWED);
        }

        return buildSecureBookingResponse(booking, currentUser);
    }

    @Override
    public List<SecureBookingResponse> findBookingsByLabRoom(Long labRoomId) {
        User currentUser = securityUtil.getCurrentUser();

        if (!labRoomRepository.existsById(labRoomId)) {
            throw new AppException(ErrorCode.LAB_ROOM_NOT_FOUND);
        }

        List<BookingRequest> bookings = bookingRequestRepository.findByLabRoom_LabRoomId(labRoomId);

        return bookings.stream()
                .map(booking -> buildSecureBookingResponse(booking, currentUser))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<List<SecureParticipantResponse>> findBookingParticipants(Long bookingRequestId, int page,
                                                                                 int limit, String search) {
        BookingRequest booking = bookingRequestRepository.findById(bookingRequestId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        User currentUser = securityUtil.getCurrentUser();
        boolean isActiveParticipant = bookingParticipantRepository
                .existsByBookingRequestAndUserAndStatusIn(booking, currentUser, List.of(ParticipantStatus.CONFIRMED, ParticipantStatus.PENDING_CONFLICT_RESOLUTION));
        boolean isAdminOrLecturer = securityUtil.isAdmin() || securityUtil.isLecturer();

        if (!isActiveParticipant && !isAdminOrLecturer) {
            throw new AppException(ErrorCode.BOOKING_NOT_ALLOWED);
        }

        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), limit);
        Page<SecureParticipantResponse> responsePage = bookingParticipantRepository
                .findParticipantsWithAttendance(bookingRequestId, search, pageable);

        return PageResponse.fromPage(responsePage, p -> p);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<List<ParticipantResponse>> findBookingParticipantsBasic(Long bookingRequestId, int page,
                                                                                int limit, String search) {
        BookingRequest booking = bookingRequestRepository.findById(bookingRequestId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        User currentUser = securityUtil.getCurrentUser();

        boolean isRequester = booking.getRequester().getUserId().equals(currentUser.getUserId());
        boolean isActiveParticipant = bookingParticipantRepository
                .existsByBookingRequestAndUserAndStatusIn(booking, currentUser, List.of(ParticipantStatus.CONFIRMED, ParticipantStatus.PENDING_CONFLICT_RESOLUTION));
        boolean isAdminOrLecturer = securityUtil.isAdmin() || securityUtil.isLecturer();

        if (!isRequester && !isActiveParticipant && !isAdminOrLecturer) {
            throw new AppException(ErrorCode.BOOKING_NOT_ALLOWED);
        }

        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), limit);
        Page<ParticipantResponse> responsePage = bookingParticipantRepository.findParticipantsBasic(bookingRequestId,
                search, pageable);

        return PageResponse.fromPage(responsePage, p -> p);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> findBookingParticipantUsernames(Long bookingRequestId) {
        BookingRequest booking = bookingRequestRepository.findById(bookingRequestId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        return bookingParticipantRepository.findByBookingRequest(booking).stream()
                .map(p -> p.getUser().getUsername())
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public SecureBookingResponse approveBooking(Long bookingRequestId, BookingStatusRequest request) {
        log.info("Approving booking: ID={}", bookingRequestId);
        User approver = securityUtil.getCurrentUser();
        BookingRequest booking = bookingRequestRepository.lockByBookingRequestId(bookingRequestId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        if (booking.getStatus() != RequestStatus.PENDING) {
            throw new AppException(ErrorCode.BOOKING_CANNOT_APPROVE);
        }

        validateApprovalAuthority(booking, approver);

        validateResourcesForApproval(booking);

        BookingSystemConfig currentConfig = configService.getActiveBookingConfig();
        LocalDateTime startTime = getBookingStartTime(booking);

        long minutesUntilStart = Duration.between(LocalDateTime.now(), startTime).toMinutes();
        int limitMinutes = currentConfig.getMinMinutesBeforeStartToApprove();

        if (minutesUntilStart < limitMinutes) {
            throw new AppException(ErrorCode.BOOKING_TIME_PASSED_CANNOT_APPROVE, Map.of(
                    "limitMinutes", limitMinutes,
                    "minutesUntilStart", minutesUntilStart
            ));
        }

        RequestStatus oldStatus = booking.getStatus();
        booking.setStatus(RequestStatus.APPROVED);
        booking.setResponseBy(approver);
        booking.setResponseDate(LocalDateTime.now());

        if (request != null && request.responseNote() != null) {
            booking.setResponseNote(request.responseNote());
        }

        bookingRequestRepository.save(booking);

        AttendanceSystemConfig attendanceSnapshot = configService.createAttendanceSnapshot();

        List<BookingParticipant> activeParticipants = bookingParticipantRepository
                .findByBookingRequestAndStatus(booking, ParticipantStatus.CONFIRMED);

        List<BookingSlotAttendance> attendances = new ArrayList<>();
        for (BookingParticipant participant : activeParticipants) {
            BookingSlotAttendance attendance = BookingSlotAttendance.builder()
                    .bookingRequest(booking)
                    .bookingParticipant(participant)
                    .attendanceSystemConfig(attendanceSnapshot)
                    .checkinStatus(CheckinStatus.NOT_CHECKED_IN)
                    .checkoutStatus(CheckoutStatus.NOT_CHECKED_OUT)
                    .build();
            attendances.add(attendance);
        }

        bookingSlotAttendanceRepository.saveAll(attendances);

        eventPublisher.publishEvent(new BookingStatusChangedEvent(booking.getBookingRequestId(), oldStatus, RequestStatus.APPROVED, approver.getUserId()));

        log.info("Booking approved: ID={}, Attendance records created: {}",
                bookingRequestId, attendances.size());

        saveBookingStatusHistory(booking, oldStatus, RequestStatus.APPROVED, StatusChangeReason.APPROVED,
                request != null ? request.responseNote() : null, null);

        return buildSecureBookingResponse(booking, approver);
    }

    @Transactional
    @Override
    public SecureBookingResponse rejectBooking(Long bookingRequestId, BookingStatusRequest request) {
        log.info("Rejecting booking: ID={}", bookingRequestId);

        User approver = securityUtil.getCurrentUser();

        BookingRequest booking = bookingRequestRepository.lockByBookingRequestId(bookingRequestId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getStatus() != RequestStatus.PENDING) {
            throw new AppException(ErrorCode.BOOKING_CANNOT_REJECT);
        }

        validateApprovalAuthority(booking, approver);

        RequestStatus oldStatus = booking.getStatus();
        booking.setStatus(RequestStatus.REJECTED);
        booking.setResponseBy(approver);
        booking.setResponseDate(LocalDateTime.now());
        if (request != null && request.responseNote() != null) {
            booking.setResponseNote(request.responseNote());
        }
        bookingRequestRepository.save(booking);

        eventPublisher.publishEvent(new BookingStatusChangedEvent(booking.getBookingRequestId(), oldStatus, RequestStatus.REJECTED, approver.getUserId()));

        log.info("Booking rejected: ID={}, Reason: {}", bookingRequestId, booking.getResponseNote());

        saveBookingStatusHistory(booking, oldStatus, RequestStatus.REJECTED, StatusChangeReason.REJECTED,
                request != null ? request.responseNote() : null, null);

        return buildSecureBookingResponse(booking, approver);
    }

    @Transactional
    @Override
    public SecureBookingResponse systemCancelBooking(Long bookingRequestId, BookingStatusRequest request) {
        log.info("System canceling booking: ID={}", bookingRequestId);

        User approver = securityUtil.getCurrentUser();

        BookingRequest booking = bookingRequestRepository.lockByBookingRequestId(bookingRequestId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getStatus() == RequestStatus.CANCELED || booking.getStatus() == RequestStatus.SYSTEM_CANCELED
                || booking.getStatus() == RequestStatus.REJECTED) {
            throw new AppException(ErrorCode.BOOKING_CANNOT_CANCEL);
        }

        RequestStatus oldStatus = booking.getStatus();
        booking.setStatus(RequestStatus.SYSTEM_CANCELED);
        booking.setResponseBy(approver);
        booking.setResponseDate(LocalDateTime.now());
        String note = request != null ? request.responseNote() : null;
        booking.setResponseNote(note);

        List<BookingParticipant> participants = bookingParticipantRepository.findByBookingRequest(booking);
        participants.forEach(p -> p.setStatus(ParticipantStatus.CANCELLED));
        bookingParticipantRepository.saveAll(participants);

        List<BookingSlotAttendance> attendances = bookingSlotAttendanceRepository
                .findByBookingRequest_BookingRequestId(booking.getBookingRequestId());
        if (!attendances.isEmpty()) {
            bookingSlotAttendanceRepository.deleteAll(attendances);
        }

        bookingRequestRepository.save(booking);

        saveBookingStatusHistory(booking, oldStatus, RequestStatus.SYSTEM_CANCELED, StatusChangeReason.OTHER,
                note, null);

        eventPublisher.publishEvent(new BookingStatusChangedEvent(booking.getBookingRequestId(), oldStatus, RequestStatus.SYSTEM_CANCELED, approver.getUserId()));

        return buildSecureBookingResponse(booking, approver);
    }

    @Transactional
    @Override
    public void bulkApprove(List<Long> bookingRequestIds, String note) {
        log.info("Bulk approving {} bookings", bookingRequestIds.size());
        BookingStatusRequest request = new BookingStatusRequest(
                note != null && !note.isEmpty() ? note : null
        );
        for (Long id : bookingRequestIds.stream().sorted().toList()) {
            try {
                approveBooking(id, request);
            } catch (Exception e) {
                log.error("Failed to approve booking {}: {}", id, e.getMessage());
            }
        }
    }

    @Transactional
    @Override
    public void bulkReject(List<Long> bookingRequestIds, String reason) {
        log.info("Bulk rejecting {} bookings", bookingRequestIds.size());
        BookingStatusRequest request = new BookingStatusRequest(reason);
        for (Long id : bookingRequestIds.stream().sorted().toList()) {
            try {
                rejectBooking(id, request);
            } catch (Exception e) {
                log.error("Failed to reject booking {}: {}", id, e.getMessage());
            }
        }
    }

    @Transactional
    @Override
    public void bulkSystemCancel(List<Long> bookingRequestIds, String reason) {
        log.info("Bulk system-canceling {} bookings", bookingRequestIds.size());
        BookingStatusRequest request = new BookingStatusRequest(reason);
        for (Long id : bookingRequestIds.stream().sorted().toList()) {
            try {
                systemCancelBooking(id, request);
            } catch (Exception e) {
                log.error("Failed to system-cancel booking {}: {}", id, e.getMessage());
            }
        }
    }

    private void saveBookingStatusHistory(
            BookingRequest request,
            RequestStatus oldStatus,
            RequestStatus newStatus,
            StatusChangeReason reason,
            String note,
            Long relatedBookingId
    ) {
        BookingRequestStatusHistory history = BookingRequestStatusHistory.builder()
                .bookingRequest(request)
                .fromStatus(oldStatus)
                .toStatus(newStatus)
                .changeReason(reason)
                .note(note)
                .relatedBookingRequestId(relatedBookingId)
                .build();
        bookingRequestStatusHistoryRepository.save(history);
    }

    private BookingResponse buildBookingResponse(BookingRequest booking, User currentUser) {
        return bookingMapper.toResponse(
                booking,
                booking.getSlotBookings(),
                booking.getParticipants(),
                currentUser,
                isAllowedEditing(booking, currentUser));
    }

    private SecureBookingResponse buildSecureBookingResponse(BookingRequest booking, User currentUser) {
        return bookingMapper.toSecureResponse(
                booking,
                currentUser,
                isAllowedEditing(booking, currentUser));
    }

    private boolean isAllowedEditing(BookingRequest booking, User user) {
        if (booking.getStatus() != RequestStatus.PENDING) {
            if (booking.getBookingType() != BookingType.THESIS || booking.getStatus() != RequestStatus.APPROVED) {
                return false;
            }
        }

        if (isUpdateAuthorized(booking, user)) {
            return false;
        }

        try {
            validateUpdateTiming(booking);
            return true;
        } catch (AppException e) {
            return false;
        }
    }

    @Override
    @Transactional
    public BookingResponse addParticipants(Long bookingRequestId, List<AddParticipantRequest> request) {
        User currentUser = securityUtil.getCurrentUser();

        BookingRequest booking = bookingRequestRepository.findById(bookingRequestId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getBookingType() != BookingType.THESIS) {
            throw new AppException(ErrorCode.ONLY_THESIS_CAN_ADD_PARTICIPANTS);
        }

        List<BookingParticipant> existingParticipants = bookingParticipantRepository
                .findByBookingRequest(booking);
        Set<String> existingUsernames = existingParticipants.stream()
                .map(p -> p.getUser().getUsername())
                .collect(Collectors.toSet());

        if (!securityUtil.isAdmin() && (!securityUtil.isLecturer() || !existingUsernames.contains(currentUser.getUsername()))) {
            throw new AppException(ErrorCode.NOT_A_PARTICIPANT);
        }

        List<BookingParticipant> newParticipants = new ArrayList<>();
        for (AddParticipantRequest participantInfo : request) {
            if (existingUsernames.contains(participantInfo.username())) {
                throw new AppException(ErrorCode.PARTICIPANT_ALREADY_EXISTS);
            }

            User user = userService.findEntityByUsername(participantInfo.username());

            BookingParticipant participant = BookingParticipant.builder()
                    .bookingRequest(booking)
                    .user(user)
                    .role(participantInfo.role())
                    .status(ParticipantStatus.CONFIRMED)
                    .build();
            newParticipants.add(participant);
        }

        bookingParticipantRepository.saveAll(newParticipants);

        if (booking.getStatus() == RequestStatus.APPROVED) {
            AttendanceSystemConfig attendanceSnapshot = bookingSlotAttendanceRepository
                    .findByBookingRequest_BookingRequestId(booking.getBookingRequestId())
                    .stream()
                    .findFirst()
                    .map(BookingSlotAttendance::getAttendanceSystemConfig)
                    .orElseGet(configService::createAttendanceSnapshot);

            List<BookingSlotAttendance> attendances = new ArrayList<>();
            for (BookingParticipant participant : newParticipants) {
                BookingSlotAttendance attendance = BookingSlotAttendance.builder()
                        .bookingRequest(booking)
                        .bookingParticipant(participant)
                        .attendanceSystemConfig(attendanceSnapshot)
                        .checkinStatus(CheckinStatus.NOT_CHECKED_IN)
                        .checkoutStatus(CheckoutStatus.NOT_CHECKED_OUT)
                        .build();
                attendances.add(attendance);
            }
            bookingSlotAttendanceRepository.saveAll(attendances);
            log.info("Created {} attendance records for new participants in booking {}",
                    attendances.size(), bookingRequestId);

            eventPublisher.publishEvent(new ThesisParticipantAddedEvent(
                    booking.getBookingRequestId(),
                    newParticipants.stream().map(BookingParticipant::getBookingParticipantId).toList(),
                    currentUser.getUserId()
            ));
        }

        return buildBookingResponse(booking, currentUser);
    }

    private void validateInventory(LabRoom labRoom, LocalDate date, List<Long> slotIds,
                                   List<DeviceQuantityRequest> devices, Long excludeId) {
        if (devices == null || devices.isEmpty())
            return;

        List<DeviceReservationDto> reservations = bookingDeviceRepository
                .findReservedQuantitiesByLabRoomAndDateAndSlots(labRoom.getLabRoomId(), date, slotIds, excludeId);

        Map<Long, Map<Long, Long>> reservedMap = reservations.stream()
                .collect(Collectors.groupingBy(DeviceReservationDto::deviceId,
                        Collectors.toMap(DeviceReservationDto::slotId, DeviceReservationDto::reservedQuantity)));

        Map<Long, Integer> roomCapacityMap = labRoom.getLabRoomDevices().stream()
                .collect(Collectors.toMap(lrd -> lrd.getDevice().getDeviceId(), LabRoomDevice::getQuantity));

        for (DeviceQuantityRequest req : devices) {
            int totalInRoom = roomCapacityMap.getOrDefault(req.deviceId(), 0);
            Map<Long, Long> slotResv = reservedMap.getOrDefault(req.deviceId(), Map.of());

            for (Long slotId : slotIds) {
                long alreadyReserved = slotResv.getOrDefault(slotId, 0L);
                if (alreadyReserved + req.quantity() > totalInRoom) {
                    throw new AppException(ErrorCode.INSUFFICIENT_DEVICE_QUANTITY,
                            String.format("Thiết bị ID %d không đủ tại ca %d", req.deviceId(), slotId));
                }
            }
        }
    }

    private void validateStatusIsPending(BookingRequest booking) {
        if (booking.getStatus() != RequestStatus.PENDING) {
            if (booking.getBookingType() == BookingType.THESIS && booking.getStatus() == RequestStatus.APPROVED) {
                return;
            }
            throw new AppException(ErrorCode.BOOKING_CANNOT_UPDATE);
        }
    }

    private boolean isUpdateAuthorized(BookingRequest booking, User user) {
        if (securityUtil.isAdmin())
            return false;
        if (booking.getRequester().getUserId().equals(user.getUserId()))
            return false;

        if (securityUtil.isLecturer()) {
            return !groupMembershipRepository.existsByResearchGroupInAndUser_UserId(
                    booking.getResearchGroup(), user.getUserId());
        }
        return true;
    }

    private void validateUpdateAuthorization(BookingRequest booking, User user) {
        if (isUpdateAuthorized(booking, user)) {
            throw new AppException(ErrorCode.BOOKING_NOT_ALLOWED);
        }
    }

    private void validateUpdateTiming(BookingRequest booking) {
        if (booking.getSlotBookings().isEmpty()) {
            return;
        }

        Slot firstSlot = booking.getSlotBookings().stream()
                .map(SlotBooking::getSlot)
                .min(Comparator.comparing(Slot::getStartTime))
                .orElseThrow();

        LocalDate bookingDate = booking.getSlotBookings().iterator().next().getBookingDate();
        LocalDateTime slotStart = LocalDateTime.of(bookingDate, firstSlot.getStartTime());
        if (LocalDateTime.now().isAfter(slotStart.minusMinutes(30))) {
            throw new AppException(ErrorCode.BOOKING_UPDATE_WINDOW_EXPIRED);
        }
    }

    private List<BookingParticipant> mapToParticipants(BookingRequest booking, List<AddParticipantRequest> requests) {
        return requests.stream().map(pr -> {
            User user = userService.findEntityByUsername(pr.username());
            return BookingParticipant.builder()
                    .bookingRequest(booking)
                    .user(user)
                    .role(pr.role())
                    .status(ParticipantStatus.CONFIRMED)
                    .build();
        }).toList();
    }

    private List<BookingDevice> mapToBookingDevices(BookingRequest booking, List<DeviceQuantityRequest> requests) {
        return requests.stream().map(deviceReq -> {
            Device device = deviceRepository.findById(deviceReq.deviceId())
                    .orElseThrow(() -> new AppException(ErrorCode.DEVICE_NOT_FOUND));
            return BookingDevice.builder()
                    .bookingRequest(booking)
                    .device(device)
                    .quantity(deviceReq.quantity())
                    .build();
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<List<SecureBookingResponse>> filterBookingRequestsAdmin(
            int page, int limit, String keyword, BookingType type, RequestStatus status, Long roomId) {

        page = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(page, limit);

        Page<BookingRequest> bookingPage = bookingRequestRepository.filterAdmin(
                keyword, type, status, roomId, pageable);

        return PageResponse.fromPage(bookingPage, b -> buildSecureBookingResponse(b, securityUtil.getCurrentUser()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PendingBookingResponse> findRecentPendingBookings(int limit) {
        List<BookingRequest> pendingBookings = bookingRequestRepository.findRecentPending(PageRequest.of(0, limit));
        return bookingMapper.toPendingBookingResponseList(pendingBookings);
    }

    @Override
    @Transactional(readOnly = true)
    public SlotBookingDetailResponse findSlotBookingDetail(
            Long labRoomId, Long slotId, LocalDate bookingDate) {

        LabRoom labRoom = labRoomRepository.findById(labRoomId)
                .orElseThrow(() -> new AppException(ErrorCode.LAB_ROOM_NOT_FOUND));

        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND));

        List<Long> bookingIds = slotBookingRepository.findBookingIdsBySlotAndDate(labRoomId, slotId, bookingDate);

        List<SlotBookingDetailItem> bookingItems;
        int totalApproved = 0;
        int totalPending = 0;
        int totalOccupants = 0;

        if (bookingIds.isEmpty()) {
            bookingItems = List.of();
        } else {
            List<BookingRequest> bookings = bookingRequestRepository.findByIdsWithParticipants(bookingIds);

            bookingItems = bookings.stream()
                    .map(b -> {
                        ResearchGroup firstGroup = b.getResearchGroup() != null && !b.getResearchGroup().isEmpty()
                                ? b.getResearchGroup().iterator().next()
                                : null;

                        User leader = null;
                        if (firstGroup != null && firstGroup.getMembers() != null) {
                            leader = firstGroup.getMembers().stream()
                                    .filter(m -> m.getRole() == MemberRole.LEADER)
                                    .map(GroupMembership::getUser)
                                    .findFirst()
                                    .orElse(null);
                        }

                        List<BookingDeviceResponse> deviceList = b.getBookingDevices() != null
                                ? b.getBookingDevices().stream()
                                .map(bd -> BookingDeviceResponse.builder()
                                        .deviceId(bd.getDevice().getDeviceId())
                                        .deviceName(bd.getDevice().getDeviceName())
                                        .deviceType(bd.getDevice().getDeviceType())
                                        .icon(bd.getDevice().getIcon())
                                        .quantity(bd.getQuantity())
                                        .build())
                                .toList()
                                : List.of();

                        return SlotBookingDetailItem.builder()
                                .bookingRequestId(b.getBookingRequestId())
                                .purpose(b.getPurpose())
                                .bookingType(b.getBookingType())
                                .status(b.getStatus())
                                .requesterId(b.getRequester().getUserId())
                                .requesterName(b.getRequester().getFullName())
                                .requesterUsername(b.getRequester().getUsername())
                                .groupName(firstGroup != null ? firstGroup.getGroupName() : null)
                                .leaderName(leader != null ? leader.getFullName() : null)
                                .leaderUsername(leader != null ? leader.getUsername() : null)
                                .participantCount(b.getParticipants() != null ? (int) b.getParticipants().stream()
                                        .filter(p -> BookingConflictQueryService.OCCUPYING_PARTICIPANT_STATUSES.contains(p.getStatus())).count() : 0)
                                .devices(deviceList)
                                .responseNote(b.getResponseNote())
                                .createdAt(b.getCreatedAt())
                                .build();
                    })
                    .toList();

            for (BookingRequest b : bookings) {
                int activeCount = b.getParticipants() != null
                        ? (int) b.getParticipants().stream()
                        .filter(p -> BookingConflictQueryService.OCCUPYING_PARTICIPANT_STATUSES.contains(p.getStatus())).count()
                        : 0;

                if (b.getStatus() == RequestStatus.APPROVED) {
                    totalApproved++;
                } else if (b.getStatus() == RequestStatus.PENDING) {
                    totalPending++;
                }

                if (BookingConflictQueryService.ACTIVE_BOOKING_STATUSES.contains(b.getStatus())) {
                    totalOccupants += activeCount;
                }
            }
        }

        int availableSeats = labRoom.getCapacity() - totalOccupants;

        return SlotBookingDetailResponse.builder()
                .labRoomId(labRoom.getLabRoomId())
                .roomName(labRoom.getRoomName())
                .building(labRoom.getBuilding())
                .roomCapacity(labRoom.getCapacity())
                .slotId(slot.getSlotId())
                .slotName(slot.getSlotName())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .bookingDate(bookingDate)
                .bookings(bookingItems)
                .totalApproved(totalApproved)
                .totalPending(totalPending)
                .totalOccupants(totalOccupants)
                .availableSeats(availableSeats)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlotBookingDetailParticipant> findBookingParticipantsForSlotDetail(
            Long bookingRequestId) {

        BookingRequest booking = bookingRequestRepository.findByBookingRequestId(bookingRequestId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        ResearchGroup group = (booking.getResearchGroup() != null && !booking.getResearchGroup().isEmpty())
                ? booking.getResearchGroup().iterator().next()
                : null;

        Map<Long, String> groupMemberRoles = new HashMap<>();
        if (group != null && group.getMembers() != null) {
            group.getMembers().forEach(m -> {
                if (m.getUser() != null) {
                    groupMemberRoles.put(m.getUser().getUserId(), m.getRole().name());
                }
            });
        }

        return booking.getParticipants().stream()
                .filter(p -> p.getStatus() == ParticipantStatus.CONFIRMED)
                .map(p -> SlotBookingDetailParticipant.builder()
                        .participantId(p.getBookingParticipantId())
                        .userId(p.getUser().getUserId())
                        .username(p.getUser().getUsername())
                        .fullName(p.getUser().getFullName())
                        .role(p.getRole())
                        .memberRole(groupMemberRoles.get(p.getUser().getUserId()))
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingStatusHistoryResponse> findBookingStatusHistory(Long bookingRequestId) {
        if (!bookingRequestRepository.existsById(bookingRequestId)) {
            throw new AppException(ErrorCode.BOOKING_NOT_FOUND);
        }

        List<BookingRequestStatusHistory> histories = bookingRequestStatusHistoryRepository
                .findByBookingRequestBookingRequestIdOrderByCreatedAtDesc(bookingRequestId);

        Set<String> usernames = histories.stream()
                .map(BookingRequestStatusHistory::getCreatedBy)
                .collect(Collectors.toSet());

        Map<String, UserSummaryResponse> userMap = userRepository.findAllByUsernameIn(usernames).stream()
                .collect(Collectors.toMap(
                        User::getUsername,
                        userMapper::toSummaryResponse
                ));

        return histories.stream()
                .map(history -> {
                    BookingStatusHistoryResponse response = bookingStatusHistoryMapper.toResponse(history);
                    return response.withCreatedBy(userMap.get(history.getCreatedBy()));
                })
                .toList();
    }

    private LocalDateTime getBookingStartTime(BookingRequest booking) {
        if (booking.getSlotBookings() == null || booking.getSlotBookings().isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        SlotBooking firstSlot = booking.getSlotBookings().stream()
                .min(Comparator.comparing(sb -> sb.getSlot().getStartTime()))
                .orElseThrow();

        return LocalDateTime.of(firstSlot.getBookingDate(), firstSlot.getStartTime());
    }

    private BookingCreationContext buildCreationContextFromBookingRequest(BookingRequest booking) {
        String purpose = booking.getPurpose();
        BookingType bookingType = booking.getBookingType();
        Long labRoomId = booking.getLabRoom() != null ? booking.getLabRoom().getLabRoomId() : null;
        Set<Long> researchGroupIds = booking.getResearchGroup() != null 
                ? booking.getResearchGroup().stream()
                        .map(ResearchGroup::getResearchGroupId)
                        .collect(Collectors.toSet()) 
                : Set.of();

        List<CreateBookingSlot> slots = booking.getSlotBookings().stream()
                .map(sb -> new CreateBookingSlot(sb.getSlot().getSlotId(), sb.getBookingDate()))
                .toList();

        List<CreateBookingParticipant> participants = booking.getParticipants().stream()
                .map(p -> new CreateBookingParticipant(p.getUser().getUserId(), p.getRole()))
                .toList();

        List<CreateBookingDevice> devices = booking.getBookingDevices().stream()
                .map(bd -> new CreateBookingDevice(bd.getDevice().getDeviceId(), bd.getQuantity()))
                .toList();

        CreateBookingRequest request = new CreateBookingRequest(
                purpose,
                bookingType,
                labRoomId,
                researchGroupIds,
                slots,
                participants,
                devices,
                false
        );

        return new BookingCreationContext(request, booking.getRequester().getUserId());
    }

    private void validateApprovalAuthority(BookingRequest booking, User approver) {
        if (!securityUtil.isAdmin()) {
            if (booking.getRequester().getUserId().equals(approver.getUserId())) {
                throw new AppException(ErrorCode.CANNOT_APPROVE_OWN_BOOKING);
            }
            if (securityUtil.isLecturer()) {
                if (booking.getBookingType() != BookingType.GROUP) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
                Set<ResearchGroup> groups = booking.getResearchGroup();
                if (groups == null || groups.isEmpty()) {
                    throw new AppException(ErrorCode.NOT_GROUP_LEADER);
                }
                boolean isLeaderOrCoLeader = false;
                for (ResearchGroup group : groups) {
                    boolean roleMatch = groupMembershipRepository.findByResearchGroup_ResearchGroupIdAndUser_UserId(
                            group.getResearchGroupId(), approver.getUserId())
                            .map(gm -> gm.getRole() == MemberRole.LEADER || gm.getRole() == MemberRole.CO_LEADER)
                            .orElse(false);
                    boolean isCreator = group.getCreator() != null && group.getCreator().getUserId().equals(approver.getUserId());
                    if (roleMatch || isCreator) {
                        isLeaderOrCoLeader = true;
                        break;
                    }
                }
                if (!isLeaderOrCoLeader) {
                    throw new AppException(ErrorCode.NOT_GROUP_LEADER);
                }
            } else {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }
    }

    private void validateResourcesForApproval(BookingRequest booking) {
        Long excludeId = booking.getBookingRequestId();
        Long labRoomId = booking.getLabRoom().getLabRoomId();
        java.util.Set<SlotBooking> slotBookings = booking.getSlotBookings();
        List<RequestStatus> activeStatuses = BookingConflictQueryService.ACTIVE_BOOKING_STATUSES;

        long requestedSeats = booking.getParticipants().stream()
                .filter(p -> p.getStatus() == ParticipantStatus.CONFIRMED 
                        || p.getStatus() == ParticipantStatus.PENDING_CONFLICT_RESOLUTION)
                .count();

        int capacity = booking.getLabRoom().getCapacity();
        for (SlotBooking sb : slotBookings) {
            long occupied = bookingParticipantRepository.countOccupiedSeatsExcludingBooking(
                    labRoomId,
                    sb.getBookingDate(),
                    sb.getSlot().getSlotId(),
                    activeStatuses,
                    BookingConflictQueryService.OCCUPYING_PARTICIPANT_STATUSES,
                    excludeId
            );
            if (occupied + requestedSeats > capacity) {
                throw new AppException(ErrorCode.BOOKING_EXCEEDS_CAPACITY, Map.of(
                        "slotName", sb.getSlot().getSlotName(),
                        "bookingDate", sb.getBookingDate().toString(),
                        "occupied", occupied,
                        "requested", requestedSeats,
                        "capacity", capacity
                ));
            }
        }

        // 2. Device availability check excluding this booking's devices
        for (BookingDevice bd : booking.getBookingDevices()) {
            Long deviceId = bd.getDevice().getDeviceId();
            int totalInRoom = labRoomDeviceRepository
                    .findByLabRoom_LabRoomIdAndDevice_DeviceId(labRoomId, deviceId)
                    .map(LabRoomDevice::getQuantity)
                    .orElse(0);

            for (SlotBooking sb : slotBookings) {
                long reserved = bookingDeviceRepository.countReservedQuantityExcludingBooking(
                        labRoomId,
                        deviceId,
                        sb.getBookingDate(),
                        sb.getSlot().getSlotId(),
                        activeStatuses,
                        excludeId
                );
                long available = totalInRoom - reserved;
                if (available < bd.getQuantity()) {
                    throw new AppException(ErrorCode.BOOKING_VALIDATION_FAILED, Map.of(
                            "deviceName", bd.getDevice().getDeviceName(),
                            "slotName", sb.getSlot().getSlotName(),
                            "bookingDate", sb.getBookingDate().toString(),
                            "available", available,
                            "requested", bd.getQuantity()
                    ));
                }
            }
        }

        // 3. Thesis conflict check excluding this booking
        if (!slotBookings.isEmpty()) {
            LocalDate date = slotBookings.iterator().next().getBookingDate();
            List<Long> slotIds = slotBookings.stream().map(sb -> sb.getSlot().getSlotId()).toList();
            
            List<BookingRequest> activeThesis = bookingRequestRepository.findActiveThesisByRoomDateSlotExcludingBooking(
                    labRoomId,
                    date,
                    slotIds,
                    activeStatuses,
                    excludeId
            );
            if (!activeThesis.isEmpty()) {
                throw new AppException(ErrorCode.ROOM_HAS_THESIS_BOOKING);
            }
        }
    }
}

