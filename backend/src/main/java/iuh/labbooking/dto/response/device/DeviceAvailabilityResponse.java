package iuh.labbooking.dto.response.device;

import lombok.Builder;

@Builder
public record DeviceAvailabilityResponse(
        Long deviceId,
        String deviceName,
        String deviceType,
        String icon,
        Integer totalQuantity,
        Integer availableQuantity) {
}
