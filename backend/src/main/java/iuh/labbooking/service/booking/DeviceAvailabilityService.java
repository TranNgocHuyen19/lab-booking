package iuh.labbooking.service.booking;

import iuh.labbooking.dto.request.booking.CreateBookingDevice;
import iuh.labbooking.dto.request.booking.CreateBookingSlot;
import iuh.labbooking.model.LabRoomDevice;
import iuh.labbooking.repository.BookingDeviceRepository;
import iuh.labbooking.repository.LabRoomDeviceRepository;
import iuh.labbooking.service.booking.validation.DeviceAvailabilityResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceAvailabilityService {

    private final LabRoomDeviceRepository labRoomDeviceRepository;
    private final BookingDeviceRepository bookingDeviceRepository;

    public List<DeviceAvailabilityResult> checkAvailability(BookingCreationContext context) {
        List<DeviceAvailabilityResult> results = new ArrayList<>();

        for (CreateBookingDevice requestedDevice : context.devices()) {
            int totalInRoom = labRoomDeviceRepository
                    .findByLabRoom_LabRoomIdAndDevice_DeviceId(context.labRoomId(), requestedDevice.deviceId())
                    .map(LabRoomDevice::getQuantity)
                    .orElse(0);

            int minAvailable = totalInRoom;
            for (CreateBookingSlot slot : context.slots()) {
                long reserved = bookingDeviceRepository.countReservedQuantity(
                        context.labRoomId(),
                        requestedDevice.deviceId(),
                        slot.bookingDate(),
                        slot.slotId(),
                        BookingConflictQueryService.ACTIVE_BOOKING_STATUSES);
                minAvailable = Math.min(minAvailable, totalInRoom - (int) reserved);
            }

            if (minAvailable >= requestedDevice.quantity()) {
                results.add(DeviceAvailabilityResult.available(
                        requestedDevice.deviceId(),
                        requestedDevice.quantity(),
                        minAvailable));
            } else {
                results.add(DeviceAvailabilityResult.insufficient(
                        requestedDevice.deviceId(),
                        requestedDevice.quantity(),
                        Math.max(minAvailable, 0)));
            }
        }

        return results;
    }
}
