package iuh.labbooking.service.booking;

import iuh.labbooking.dto.request.booking.CreateBookingDevice;
import iuh.labbooking.dto.request.booking.CreateBookingParticipant;
import iuh.labbooking.dto.request.booking.CreateBookingRequest;
import iuh.labbooking.dto.request.booking.CreateBookingSlot;
import iuh.labbooking.enums.BookingType;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public record BookingCreationContext(
        CreateBookingRequest request,
        Long requesterId
) {
    public String purpose() {
        return request.purpose();
    }

    public BookingType bookingType() {
        return request.bookingType();
    }

    public Long labRoomId() {
        return request.labRoomId();
    }

    public Set<Long> researchGroupIds() {
        return request.researchGroupIds() == null ? Set.of() : request.researchGroupIds();
    }

    public List<CreateBookingSlot> slots() {
        return request.slots();
    }

    public List<CreateBookingParticipant> participants() {
        return request.participants() == null ? List.of() : request.participants();
    }

    public List<CreateBookingDevice> devices() {
        return request.devices() == null ? List.of() : request.devices();
    }

    public LocalDate primaryDate() {
        return slots().getFirst().bookingDate();
    }

    public List<Long> slotIds() {
        return slots().stream()
                .map(CreateBookingSlot::slotId)
                .toList();
    }
}
