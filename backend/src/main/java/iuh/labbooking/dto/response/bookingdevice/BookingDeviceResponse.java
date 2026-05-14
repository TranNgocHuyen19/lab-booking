package iuh.labbooking.dto.response.bookingdevice;

import lombok.Builder;

@Builder
public record BookingDeviceResponse(
        Long deviceId,
        String deviceName,
        String deviceType,
        String icon,
        Integer quantity) {
}
