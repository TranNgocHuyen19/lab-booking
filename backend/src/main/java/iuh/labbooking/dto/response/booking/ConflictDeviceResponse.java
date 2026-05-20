package iuh.labbooking.dto.response.booking;

public record ConflictDeviceResponse(
        Long deviceId,
        String deviceName,
        String deviceType,
        Integer quantity
) {
}
