package iuh.labbooking.mapper;

import iuh.labbooking.dto.response.booking.*;
import iuh.labbooking.dto.response.slot.SlotResponse;
import iuh.labbooking.dto.response.user.UserSummaryResponse;
import iuh.labbooking.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring", uses = {
        ParticipantMapper.class, SlotMapper.class,
        BookingDeviceMapper.class }, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface BookingMapper {

    DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Mapping(target = "labRoomId", source = "booking.labRoom.labRoomId")
    @Mapping(target = "roomName", source = "booking.labRoom.roomName")
    @Mapping(target = "building", source = "booking.labRoom.building")
    @Mapping(target = "roomCapacity", source = "booking.labRoom.capacity")
    @Mapping(target = "requesterId", source = "booking.requester.userId")
    @Mapping(target = "requesterName", source = "booking.requester.fullName")
    @Mapping(target = "requesterUsername", source = "booking.requester.username")
    @Mapping(target = "bookingDate", expression = "java(extractBookingDate(slotBookings))")
    @Mapping(target = "isCreator", expression = "java(booking.getRequester().getUserId().equals(currentUser.getUserId()))")
    @Mapping(target = "slots", source = "slotBookings")
    @Mapping(target = "participantCount", expression = "java(participants != null ? participants.size() : 0)")
    @Mapping(target = "devices", source = "booking.bookingDevices")
    @Mapping(target = "researchGroupIds", source = "booking.researchGroup")
    @Mapping(target = "responseNote", source = "booking.responseNote")
    @Mapping(target = "responseDate", source = "booking.responseDate")
    @Mapping(target = "responseBy", source = "booking.responseBy")
    BookingResponse toResponse(
            BookingRequest booking,
            Collection<SlotBooking> slotBookings,
            Collection<BookingParticipant> participants,
            @org.mapstruct.Context User currentUser,
            Boolean isAllowedEditing);

    @Mapping(target = "labRoomId", source = "booking.labRoom.labRoomId")
    @Mapping(target = "roomName", source = "booking.labRoom.roomName")
    @Mapping(target = "building", source = "booking.labRoom.building")
    @Mapping(target = "roomCapacity", source = "booking.labRoom.capacity")
    @Mapping(target = "requesterId", source = "booking.requester.userId")
    @Mapping(target = "requesterName", source = "booking.requester.fullName")
    @Mapping(target = "requesterUsername", source = "booking.requester.username")
    @Mapping(target = "bookingDate", expression = "java(extractBookingDate(booking.getSlotBookings()))")
    @Mapping(target = "isCreator", expression = "java(booking.getRequester().getUserId().equals(currentUser.getUserId()))")
    @Mapping(target = "slots", source = "booking.slotBookings")
    @Mapping(target = "participantCount", expression = "java(booking.getParticipants() != null ? booking.getParticipants().size() : 0)")
    @Mapping(target = "devices", source = "booking.bookingDevices")
    @Mapping(target = "researchGroupIds", source = "booking.researchGroup")
    @Mapping(target = "isAllowedEditing", source = "isAllowedEditing")
    @Mapping(target = "responseNote", source = "booking.responseNote")
    @Mapping(target = "responseDate", source = "booking.responseDate")
    @Mapping(target = "responseBy", source = "booking.responseBy")
    SecureBookingResponse toSecureResponse(
            BookingRequest booking,
            @org.mapstruct.Context User currentUser,
            Boolean isAllowedEditing);

    default List<Long> mapResearchGroupsToIds(java.util.Set<ResearchGroup> groups) {
        if (groups == null || groups.isEmpty())
            return List.of();
        return groups.stream().map(ResearchGroup::getResearchGroupId).toList();
    }

    default LocalDate extractBookingDate(Collection<SlotBooking> slotBookings) {
        if (slotBookings == null || slotBookings.isEmpty())
            return null;
        return slotBookings.iterator().next().getBookingDate();
    }

    // ===================== Pending Booking Mapping =====================

    default UserSummaryResponse toUserSummaryResponse(User user) {
        if (user == null) return null;
        return UserSummaryResponse.builder()
                .id(user.getUserId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .build();
    }

    default PendingBookingResponse toPendingBookingResponse(BookingRequest booking) {
        if (booking == null) return null;

        SlotResponse slotResponse = null;
        LocalDate bookingDate = null;

        Set<SlotBooking> slotBookings = booking.getSlotBookings();
        if (slotBookings != null && org.hibernate.Hibernate.isInitialized(slotBookings) && !slotBookings.isEmpty()) {
            SlotBooking firstSlot = slotBookings.iterator().next();
            Slot slot = firstSlot.getSlot();
            if (slot != null) {
                slotResponse = new SlotResponse(
                        slot.getSlotId(),
                        slot.getSlotName(),
                        slot.getStartTime(),
                        slot.getEndTime(),
                        slot.getDescription()
                );
            }
            bookingDate = firstSlot.getBookingDate();
        }

        String groupName = null;
        // Safely handle lazy-loaded researchGroup
        Set<ResearchGroup> groups = booking.getResearchGroup();
        if (groups != null && org.hibernate.Hibernate.isInitialized(groups) && !groups.isEmpty()) {
            ResearchGroup firstGroup = groups.iterator().next();
            groupName = firstGroup.getGroupName();
        }

        return PendingBookingResponse.builder()
                .id(booking.getBookingRequestId())
                .room(booking.getLabRoom() != null ? booking.getLabRoom().getRoomName() : null)
                .slot(slotResponse)
                .bookingDate(bookingDate)
                .createdAt(booking.getCreatedAt())
                .type(booking.getBookingType())
                .groupName(groupName)
                .requester(toUserSummaryResponse(booking.getRequester()))
                .build();
    }

    default List<PendingBookingResponse> toPendingBookingResponseList(List<BookingRequest> bookings) {
        if (bookings == null) return List.of();
        return bookings.stream().map(this::toPendingBookingResponse).toList();
    }

    private String formatTime(LocalTime time) {
        return time != null ? time.format(TIME_FORMATTER) : "-";
    }
}
