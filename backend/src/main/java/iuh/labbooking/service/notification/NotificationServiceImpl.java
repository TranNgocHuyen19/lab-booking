package iuh.labbooking.service.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import iuh.labbooking.dto.response.base.PageResponse;
import iuh.labbooking.dto.response.notification.NotificationResponse;
import iuh.labbooking.dto.response.notification.UnreadNotificationCountResponse;
import iuh.labbooking.enums.BookingType;
import iuh.labbooking.enums.NotificationType;
import iuh.labbooking.enums.ParticipantStatus;
import iuh.labbooking.enums.RequestStatus;
import iuh.labbooking.exception.AppException;
import iuh.labbooking.exception.ErrorCode;
import iuh.labbooking.mapper.NotificationMapper;
import iuh.labbooking.model.*;
import iuh.labbooking.repository.BookingParticipantRepository;
import iuh.labbooking.repository.BookingRequestRepository;
import iuh.labbooking.repository.NotificationRepository;
import iuh.labbooking.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private enum NotificationEventKind {
        BOOKING_CREATED,
        BOOKING_APPROVED,
        BOOKING_REJECTED,
        BOOKING_CANCELED,
        BOOKING_SYSTEM_CANCELED,
        PARTICIPANT_CONFLICT_REQUIRED,
        BOOKING_CANCELLED_BY_THESIS,
        PARTICIPANT_CONFLICT_RESOLVED,
        THESIS_PARTICIPANT_ADDED
    }

    private record NotificationCommand(
            NotificationEventKind eventType,
            Long bookingRequestId,
            Long actorId,
            Long participantId,
            List<Long> relatedBookingRequestIds,
            List<Long> participantIds
    ) {
    }

    private final NotificationRepository notificationRepository;
    private final BookingRequestRepository bookingRequestRepository;
    private final BookingParticipantRepository bookingParticipantRepository;
    private final NotificationMapper notificationMapper;
    private final SecurityUtil securityUtil;
    private final ObjectMapper objectMapper;

    @Override
    public PageResponse<List<NotificationResponse>> getMyNotifications(int page, int limit) {
        Long currentUserId = securityUtil.getCurrentUserId();
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Notification> notificationPage = notificationRepository
                .findByRecipient_UserIdOrderByCreatedAtDesc(currentUserId, pageable);

        return PageResponse.fromPage(notificationPage, notificationMapper::toResponse);
    }

    @Override
    public UnreadNotificationCountResponse getMyUnreadCount() {
        Long currentUserId = securityUtil.getCurrentUserId();
        long unreadCount = notificationRepository.countByRecipient_UserIdAndReadAtIsNull(currentUserId);
        return new UnreadNotificationCountResponse(unreadCount);
    }

    @Transactional
    @Override
    public void markAsRead(Long notificationId) {
        Long currentUserId = securityUtil.getCurrentUserId();
        Notification notification = notificationRepository
                .findByNotificationIdAndRecipient_UserId(notificationId, currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Transactional
    @Override
    public void markAllAsRead() {
        Long currentUserId = securityUtil.getCurrentUserId();
        notificationRepository.markAllAsReadForUser(currentUserId, LocalDateTime.now());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void handleBookingCreated(Long bookingRequestId, Long actorId) {
        createNotifications(new NotificationCommand(
                NotificationEventKind.BOOKING_CREATED,
                bookingRequestId,
                actorId,
                null,
                null,
                null
        ));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void handleBookingStatusChanged(Long bookingRequestId, RequestStatus newStatus, Long actorId) {
        NotificationEventKind eventType = switch (newStatus) {
            case APPROVED -> NotificationEventKind.BOOKING_APPROVED;
            case REJECTED -> NotificationEventKind.BOOKING_REJECTED;
            case CANCELED -> NotificationEventKind.BOOKING_CANCELED;
            case SYSTEM_CANCELED -> NotificationEventKind.BOOKING_SYSTEM_CANCELED;
            default -> null;
        };

        if (eventType == null) {
            return;
        }

        createNotifications(new NotificationCommand(
                eventType,
                bookingRequestId,
                actorId,
                null,
                null,
                null
        ));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void handleParticipantConflictRequired(Long bookingRequestId, Long participantId, Long userId, Long actorId) {
        createNotifications(new NotificationCommand(
                NotificationEventKind.PARTICIPANT_CONFLICT_REQUIRED,
                bookingRequestId,
                actorId,
                participantId,
                null,
                null
        ));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void handleBookingCancelledByThesis(Long thesisBookingRequestId, List<Long> cancelledBookingRequestIds) {
        createNotifications(new NotificationCommand(
                NotificationEventKind.BOOKING_CANCELLED_BY_THESIS,
                thesisBookingRequestId,
                null,
                null,
                cancelledBookingRequestIds,
                null
        ));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void handleParticipantConflictResolved(Long bookingRequestId, Long participantId, Long userId) {
        createNotifications(new NotificationCommand(
                NotificationEventKind.PARTICIPANT_CONFLICT_RESOLVED,
                bookingRequestId,
                userId,
                participantId,
                null,
                null
        ));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void handleThesisParticipantAdded(Long bookingRequestId, Long actorId, List<Long> addedParticipantIds) {
        createNotifications(new NotificationCommand(
                NotificationEventKind.THESIS_PARTICIPANT_ADDED,
                bookingRequestId,
                actorId,
                null,
                null,
                addedParticipantIds
        ));
    }

    private void createNotifications(NotificationCommand message) {
        if (message == null || message.eventType() == null) {
            return;
        }

        log.info("Processing notification creation for eventType={}", message.eventType());

        switch (message.eventType()) {
            case BOOKING_CREATED -> handleBookingCreated(message);
            case BOOKING_APPROVED -> handleBookingStatusChanged(message, "APPROVED");
            case BOOKING_REJECTED -> handleBookingStatusChanged(message, "REJECTED");
            case BOOKING_CANCELED -> handleBookingStatusChanged(message, "CANCELED");
            case BOOKING_SYSTEM_CANCELED -> handleBookingStatusChanged(message, "SYSTEM_CANCELED");
            case PARTICIPANT_CONFLICT_REQUIRED -> handleParticipantConflictRequired(message);
            case BOOKING_CANCELLED_BY_THESIS -> handleBookingCancelledByThesis(message);
            case PARTICIPANT_CONFLICT_RESOLVED -> handleParticipantConflictResolved(message);
            case THESIS_PARTICIPANT_ADDED -> handleThesisParticipantAdded(message);
        }
    }

    private void handleBookingCreated(NotificationCommand message) {
        BookingRequest booking = bookingRequestRepository.findById(message.bookingRequestId())
                .orElse(null);
        if (booking == null) {
            log.warn("BookingRequest not found for id={}", message.bookingRequestId());
            return;
        }

        String metadataJson = buildMetadataJson(booking);
        User requester = booking.getRequester();
        BookingType bookingType = booking.getBookingType();

        if (bookingType == BookingType.PERSONAL) {
            saveNotification(
                    requester,
                    NotificationType.BOOKING_CREATED,
                    "Yêu cầu đặt phòng đã được tạo",
                    "Yêu cầu đặt phòng của bạn đã được tạo và đang chờ duyệt.",
                    booking.getBookingRequestId(),
                    null,
                    message.actorId(),
                    metadataJson,
                    "BOOKING_CREATED:" + booking.getBookingRequestId() + ":" + requester.getUserId()
            );
        } else if (bookingType == BookingType.GROUP) {
            // Notification to requester
            saveNotification(
                    requester,
                    NotificationType.BOOKING_CREATED,
                    "Yêu cầu đặt phòng nhóm đã được tạo",
                    "Yêu cầu đặt phòng nhóm của bạn đã được tạo và đang chờ duyệt.",
                    booking.getBookingRequestId(),
                    null,
                    message.actorId(),
                    metadataJson,
                    "BOOKING_CREATED:" + booking.getBookingRequestId() + ":" + requester.getUserId()
            );

            // Notifications to participants
            List<BookingParticipant> participants = bookingParticipantRepository.findByBookingRequest(booking);
            for (BookingParticipant participant : participants) {
                User participantUser = participant.getUser();
                if (participantUser.getUserId().equals(requester.getUserId())) {
                    continue; // Skip requester
                }

                if (participant.getStatus() == ParticipantStatus.CONFIRMED) {
                    saveNotification(
                            participantUser,
                            NotificationType.BOOKING_CREATED,
                            "Bạn được thêm vào booking nhóm",
                            "Bạn đã được thêm vào một booking nhóm.",
                            booking.getBookingRequestId(),
                            participant.getBookingParticipantId(),
                            message.actorId(),
                            metadataJson,
                            "BOOKING_CREATED:" + booking.getBookingRequestId() + ":" + participantUser.getUserId()
                    );
                }
            }
        } else if (bookingType == BookingType.THESIS) {
            // Thesis is auto-approved, so requester and members receive the confirmation
            saveNotification(
                    requester,
                    NotificationType.BOOKING_CREATED,
                    "Lịch khóa luận/seminar đã được tạo",
                    "Lịch khóa luận/seminar đã được tạo và tự động duyệt.",
                    booking.getBookingRequestId(),
                    null,
                    message.actorId(),
                    metadataJson,
                    "BOOKING_CREATED:" + booking.getBookingRequestId() + ":" + requester.getUserId()
            );

            List<BookingParticipant> participants = bookingParticipantRepository.findByBookingRequest(booking);
            for (BookingParticipant participant : participants) {
                User participantUser = participant.getUser();
                if (participantUser.getUserId().equals(requester.getUserId())) {
                    continue;
                }
                if (participant.getStatus() == ParticipantStatus.CONFIRMED) {
                    saveNotification(
                            participantUser,
                            NotificationType.BOOKING_CREATED,
                            "Lịch khóa luận/seminar đã được tạo",
                            "Lịch khóa luận/seminar đã được tạo và tự động duyệt.",
                            booking.getBookingRequestId(),
                            participant.getBookingParticipantId(),
                            message.actorId(),
                            metadataJson,
                            "BOOKING_CREATED:" + booking.getBookingRequestId() + ":" + participantUser.getUserId()
                    );
                }
            }
        }
    }

    private void handleParticipantConflictRequired(NotificationCommand message) {
        BookingRequest booking = bookingRequestRepository.findById(message.bookingRequestId())
                .orElse(null);
        if (booking == null) {
            log.warn("BookingRequest not found for id={}", message.bookingRequestId());
            return;
        }

        BookingParticipant participant = bookingParticipantRepository.findById(message.participantId())
                .orElse(null);
        if (participant == null) {
            log.warn("BookingParticipant not found for id={}", message.participantId());
            return;
        }

        if (participant.getStatus() != ParticipantStatus.PENDING_CONFLICT_RESOLUTION) {
            log.info("Skipping conflict-required notification because participant status changed: bookingRequestId={}, participantId={}, status={}",
                    booking.getBookingRequestId(), participant.getBookingParticipantId(), participant.getStatus());
            return;
        }

        User participantUser = participant.getUser();
        String metadataJson = buildMetadataJson(booking);
        saveNotification(
                participantUser,
                NotificationType.PARTICIPANT_CONFLICT_REQUIRED,
                "Trùng lịch đặt phòng",
                "Bạn được thêm vào một booking nhóm nhưng đang trùng lịch. Vui lòng xử lý xung đột.",
                booking.getBookingRequestId(),
                participant.getBookingParticipantId(),
                message.actorId(),
                metadataJson,
                "PARTICIPANT_CONFLICT_REQUIRED:" + booking.getBookingRequestId() + ":" + participantUser.getUserId() + ":" + participant.getBookingParticipantId()
        );
    }

    private void handleBookingStatusChanged(NotificationCommand message, String statusName) {
        BookingRequest booking = bookingRequestRepository.findById(message.bookingRequestId())
                .orElse(null);
        if (booking == null) {
            log.warn("BookingRequest not found for id={}", message.bookingRequestId());
            return;
        }

        String metadataJson = buildMetadataJson(booking);
        User requester = booking.getRequester();

        if ("APPROVED".equals(statusName)) {
            // Requester
            saveNotification(
                    requester,
                    NotificationType.BOOKING_APPROVED,
                    "Yêu cầu đặt phòng đã được duyệt",
                    "Booking của bạn đã được duyệt.",
                    booking.getBookingRequestId(),
                    null,
                    message.actorId(),
                    metadataJson,
                    "BOOKING_APPROVED:" + booking.getBookingRequestId() + ":" + requester.getUserId()
            );

            // Participants
            List<BookingParticipant> participants = bookingParticipantRepository.findByBookingRequest(booking);
            for (BookingParticipant participant : participants) {
                User participantUser = participant.getUser();
                if (participantUser.getUserId().equals(requester.getUserId())) {
                    continue;
                }

                if (participant.getStatus() == ParticipantStatus.CONFIRMED) {
                    saveNotification(
                            participantUser,
                            NotificationType.BOOKING_APPROVED,
                            "Yêu cầu đặt phòng đã được duyệt",
                            "Booking của bạn đã được duyệt.",
                            booking.getBookingRequestId(),
                            participant.getBookingParticipantId(),
                            message.actorId(),
                            metadataJson,
                            "BOOKING_APPROVED:" + booking.getBookingRequestId() + ":" + participantUser.getUserId()
                    );
                } else if (participant.getStatus() == ParticipantStatus.PENDING_CONFLICT_RESOLUTION) {
                    saveNotification(
                            participantUser,
                            NotificationType.PARTICIPANT_CONFLICT_REQUIRED,
                            "Booking nhóm đã được duyệt (Cần xử lý trùng lịch)",
                            "Booking nhóm đã được duyệt, nhưng bạn vẫn cần xử lý xung đột lịch trước khi tham gia.",
                            booking.getBookingRequestId(),
                            participant.getBookingParticipantId(),
                            message.actorId(),
                            metadataJson,
                            "BOOKING_APPROVED_CONFLICT:" + booking.getBookingRequestId() + ":" + participantUser.getUserId() + ":" + participant.getBookingParticipantId()
                    );
                }
            }
        } else if ("REJECTED".equals(statusName)) {
            // Requester
            saveNotification(
                    requester,
                    NotificationType.BOOKING_REJECTED,
                    "Yêu cầu đặt phòng bị từ chối",
                    "Yêu cầu đặt phòng của bạn đã bị từ chối.",
                    booking.getBookingRequestId(),
                    null,
                    message.actorId(),
                    metadataJson,
                    "BOOKING_REJECTED:" + booking.getBookingRequestId() + ":" + requester.getUserId()
            );

            // Participants
            List<BookingParticipant> participants = bookingParticipantRepository.findByBookingRequest(booking);
            for (BookingParticipant participant : participants) {
                User participantUser = participant.getUser();
                if (participantUser.getUserId().equals(requester.getUserId())) {
                    continue;
                }

                if (participant.getStatus() == ParticipantStatus.CONFIRMED || participant.getStatus() == ParticipantStatus.PENDING_CONFLICT_RESOLUTION) {
                    saveNotification(
                            participantUser,
                            NotificationType.BOOKING_REJECTED,
                            "Yêu cầu đặt phòng bị từ chối",
                            "Yêu cầu đặt phòng của bạn đã bị từ chối.",
                            booking.getBookingRequestId(),
                            participant.getBookingParticipantId(),
                            message.actorId(),
                            metadataJson,
                            "BOOKING_REJECTED:" + booking.getBookingRequestId() + ":" + participantUser.getUserId()
                    );
                }
            }
        } else if ("CANCELED".equals(statusName) || "SYSTEM_CANCELED".equals(statusName)) {
            // Requester
            saveNotification(
                    requester,
                    NotificationType.BOOKING_CANCELED,
                    "Booking đã bị hủy",
                    "Booking của bạn đã bị hủy.",
                    booking.getBookingRequestId(),
                    null,
                    message.actorId(),
                    metadataJson,
                    "BOOKING_CANCELED:" + booking.getBookingRequestId() + ":" + requester.getUserId()
            );

            // Participants
            List<BookingParticipant> participants = bookingParticipantRepository.findByBookingRequest(booking);
            for (BookingParticipant participant : participants) {
                User participantUser = participant.getUser();
                if (participantUser.getUserId().equals(requester.getUserId())) {
                    continue;
                }

                saveNotification(
                        participantUser,
                        NotificationType.BOOKING_CANCELED,
                        "Booking đã bị hủy",
                        "Booking của bạn đã bị hủy.",
                        booking.getBookingRequestId(),
                        participant.getBookingParticipantId(),
                        message.actorId(),
                        metadataJson,
                        "BOOKING_CANCELED:" + booking.getBookingRequestId() + ":" + participantUser.getUserId()
                );
            }
        }
    }

    private void handleBookingCancelledByThesis(NotificationCommand message) {
        if (message.relatedBookingRequestIds() == null) {
            return;
        }

        for (Long cancelledId : message.relatedBookingRequestIds()) {
            BookingRequest booking = bookingRequestRepository.findById(cancelledId)
                    .orElse(null);
            if (booking == null) {
                continue;
            }

            String metadataJson = buildMetadataJson(booking);
            User requester = booking.getRequester();

            // Requester
            saveNotification(
                    requester,
                    NotificationType.BOOKING_CANCELLED_BY_THESIS,
                    "Booking bị hủy do lịch ưu tiên",
                    "Booking của bạn đã bị hủy vì phòng được ưu tiên cho lịch khóa luận/seminar.",
                    booking.getBookingRequestId(),
                    null,
                    message.actorId(),
                    metadataJson,
                    "BOOKING_CANCELLED_BY_THESIS:" + booking.getBookingRequestId() + ":" + requester.getUserId()
            );

            // Participants
            List<BookingParticipant> participants = bookingParticipantRepository.findByBookingRequest(booking);
            for (BookingParticipant participant : participants) {
                User participantUser = participant.getUser();
                if (participantUser.getUserId().equals(requester.getUserId())) {
                    continue;
                }

                saveNotification(
                        participantUser,
                        NotificationType.BOOKING_CANCELLED_BY_THESIS,
                        "Booking bị hủy do lịch ưu tiên",
                        "Booking của bạn đã bị hủy vì phòng được ưu tiên cho lịch khóa luận/seminar.",
                        booking.getBookingRequestId(),
                        participant.getBookingParticipantId(),
                        message.actorId(),
                        metadataJson,
                        "BOOKING_CANCELLED_BY_THESIS:" + booking.getBookingRequestId() + ":" + participantUser.getUserId()
                );
            }
        }
    }

    private void handleParticipantConflictResolved(NotificationCommand message) {
        BookingParticipant participant = bookingParticipantRepository.findById(message.participantId())
                .orElse(null);
        if (participant == null) {
            log.warn("BookingParticipant not found for id={}", message.participantId());
            return;
        }

        BookingRequest groupBooking = participant.getBookingRequest();
        String metadataJson = buildMetadataJson(groupBooking);
        User resolvingUser = participant.getUser();
        User leader = groupBooking.getRequester();

        if (participant.getStatus() == ParticipantStatus.DECLINED) {
            // KEEP_EXISTING_BOOKING action was taken

            // Resolving user
            saveNotification(
                    resolvingUser,
                    NotificationType.PARTICIPANT_CONFLICT_RESOLVED,
                    "Đã giải quyết xung đột lịch",
                    "Bạn đã giữ lịch cũ và từ chối tham gia booking nhóm.",
                    groupBooking.getBookingRequestId(),
                    participant.getBookingParticipantId(),
                    message.actorId(),
                    metadataJson,
                    "CONFLICT_RESOLVED_KEEP:" + groupBooking.getBookingRequestId() + ":" + resolvingUser.getUserId()
            );

            // Leader
            saveNotification(
                    leader,
                    NotificationType.PARTICIPANT_CONFLICT_RESOLVED,
                    "Thành viên từ chối tham gia nhóm",
                    resolvingUser.getFullName() + " đã từ chối tham gia booking nhóm do giữ lịch cũ.",
                    groupBooking.getBookingRequestId(),
                    participant.getBookingParticipantId(),
                    message.actorId(),
                    metadataJson,
                    "CONFLICT_RESOLVED_KEEP_LEADER:" + groupBooking.getBookingRequestId() + ":" + leader.getUserId() + ":" + participant.getBookingParticipantId()
            );
        } else if (participant.getStatus() == ParticipantStatus.CONFIRMED) {
            // SWITCH_TO_NEW_BOOKING action was taken

            // Resolving user
            saveNotification(
                    resolvingUser,
                    NotificationType.PARTICIPANT_CONFLICT_RESOLVED,
                    "Đã giải quyết xung đột lịch",
                    "Bạn đã chuyển sang booking nhóm thành công.",
                    groupBooking.getBookingRequestId(),
                    participant.getBookingParticipantId(),
                    message.actorId(),
                    metadataJson,
                    "CONFLICT_RESOLVED_SWITCH:" + groupBooking.getBookingRequestId() + ":" + resolvingUser.getUserId()
            );

            // Leader
            saveNotification(
                    leader,
                    NotificationType.PARTICIPANT_CONFLICT_RESOLVED,
                    "Thành viên xác nhận tham gia nhóm",
                    resolvingUser.getFullName() + " đã xác nhận tham gia booking nhóm.",
                    groupBooking.getBookingRequestId(),
                    participant.getBookingParticipantId(),
                    message.actorId(),
                    metadataJson,
                    "CONFLICT_RESOLVED_SWITCH_LEADER:" + groupBooking.getBookingRequestId() + ":" + leader.getUserId() + ":" + participant.getBookingParticipantId()
            );
        }
    }

    private void handleThesisParticipantAdded(NotificationCommand message) {
        BookingRequest booking = bookingRequestRepository.findById(message.bookingRequestId())
                .orElse(null);
        if (booking == null) {
            log.warn("BookingRequest not found for id={}", message.bookingRequestId());
            return;
        }

        String metadataJson = buildMetadataJson(booking);

        if (message.participantIds() == null) {
            return;
        }

        for (Long participantId : message.participantIds()) {
            BookingParticipant participant = bookingParticipantRepository.findById(participantId)
                    .orElse(null);
            if (participant == null) {
                continue;
            }

            saveNotification(
                    participant.getUser(),
                    NotificationType.THESIS_PARTICIPANT_ADDED,
                    "Được thêm vào lịch khóa luận/seminar",
                    "Bạn đã được thêm vào lịch khóa luận/seminar.",
                    booking.getBookingRequestId(),
                    participant.getBookingParticipantId(),
                    message.actorId(),
                    metadataJson,
                    "THESIS_PART_ADDED:" + booking.getBookingRequestId() + ":" + participant.getUser().getUserId() + ":" + participantId
            );
        }
    }

    private void saveNotification(User recipient, NotificationType type, String title, String message,
                                  Long relatedBookingRequestId, Long relatedParticipantId, Long relatedUserId,
                                  String metadata, String eventKey) {
        if (eventKey != null && notificationRepository.existsByEventKey(eventKey)) {
            log.info("Duplicate notification prevented for eventKey={}", eventKey);
            return;
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .relatedBookingRequestId(relatedBookingRequestId)
                .relatedParticipantId(relatedParticipantId)
                .relatedUserId(relatedUserId)
                .metadata(metadata)
                .eventKey(eventKey)
                .build();

        notificationRepository.save(notification);
        log.info("Saved notification for recipient={}, type={}, title={}", recipient.getUsername(), type, title);
    }

    private String buildMetadataJson(BookingRequest booking) {
        if (booking == null) {
            return null;
        }
        try {
            String roomName = booking.getLabRoom() != null ? booking.getLabRoom().getRoomName() : null;
            String building = booking.getLabRoom() != null ? booking.getLabRoom().getBuilding() : null;
            String bookingDate = null;
            String slotName = null;
            String startTime = null;
            String endTime = null;

            if (booking.getSlotBookings() != null && !booking.getSlotBookings().isEmpty()) {
                List<SlotBooking> sorted = booking.getSlotBookings().stream()
                        .sorted(Comparator.comparing(sb -> sb.getSlot().getStartTime()))
                        .toList();
                SlotBooking first = sorted.get(0);
                SlotBooking last = sorted.get(sorted.size() - 1);
                bookingDate = first.getBookingDate() != null ? first.getBookingDate().toString() : null;
                slotName = sorted.stream()
                        .map(sb -> sb.getSlot().getSlotName())
                        .collect(Collectors.joining(", "));
                startTime = first.getStartTime() != null ? first.getStartTime().toString() :
                        (first.getSlot().getStartTime() != null ? first.getSlot().getStartTime().toString() : null);
                endTime = last.getEndTime() != null ? last.getEndTime().toString() :
                        (last.getSlot().getEndTime() != null ? last.getSlot().getEndTime().toString() : null);
            }

            Map<String, String> metaMap = new LinkedHashMap<>();
            metaMap.put("roomName", roomName);
            metaMap.put("building", building);
            metaMap.put("bookingDate", bookingDate);
            metaMap.put("slotName", slotName);
            metaMap.put("startTime", startTime);
            metaMap.put("endTime", endTime);
            metaMap.put("bookingType", booking.getBookingType() != null ? booking.getBookingType().name() : null);
            metaMap.put("bookingStatus", booking.getStatus() != null ? booking.getStatus().name() : null);

            return objectMapper.writeValueAsString(metaMap);
        } catch (Exception e) {
            log.error("Failed to build metadata JSON", e);
            return null;
        }
    }
}
