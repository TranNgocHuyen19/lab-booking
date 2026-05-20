package iuh.labbooking.service.booking;

import iuh.labbooking.dto.request.booking.CreateBookingDevice;
import iuh.labbooking.dto.request.booking.CreateBookingParticipant;
import iuh.labbooking.dto.request.booking.CreateBookingRequest;
import iuh.labbooking.dto.request.booking.CreateBookingSlot;
import iuh.labbooking.enums.BookingType;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
        if (request.devices() == null || request.devices().isEmpty()) {
            return List.of();
        }

        Map<Long, Integer> quantityByDeviceId = new LinkedHashMap<>();
        request.devices().forEach(device ->
                quantityByDeviceId.merge(device.deviceId(), device.quantity(), Integer::sum));

        return quantityByDeviceId.entrySet().stream()
                .map(entry -> new CreateBookingDevice(entry.getKey(), entry.getValue()))
                .toList();
    }

    public LocalDate primaryDate() {
        return slots().getFirst().bookingDate();
    }

    public List<Long> slotIds() {
        return slots().stream()
                .map(CreateBookingSlot::slotId)
                .distinct()
                .toList();
    }

    public boolean hasDuplicatedSlots() {
        return slots().size() != new java.util.HashSet<>(slotKeys()).size();
    }

    public boolean hasMultipleDates() {
        return slots().stream()
                .map(CreateBookingSlot::bookingDate)
                .distinct()
                .count() > 1;
    }

    public boolean forceSwitch() {
        return request.forceSwitch() != null && request.forceSwitch();
    }

    private List<String> slotKeys() {
        return slots().stream()
                .map(slot -> slot.bookingDate() + "#" + slot.slotId())
                .toList();
    }
}
