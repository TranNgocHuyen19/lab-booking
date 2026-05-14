package iuh.labbooking.dto.response.bookingdevice;

import lombok.Builder;

@Builder
public record PublicBookingDeviceResponse(
                Long deviceId,
                String deviceName,
                String deviceType,
                String icon,
                Integer quantity) {
}
