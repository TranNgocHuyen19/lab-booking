package iuh.labbooking.dto.response.device;

public record DeviceResponse(
        Long deviceId,
        String deviceName,
        String deviceType,
        String icon
) {
}
