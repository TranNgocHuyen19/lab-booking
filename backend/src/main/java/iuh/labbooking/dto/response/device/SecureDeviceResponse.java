package iuh.labbooking.dto.response.device;

import java.time.LocalDateTime;

public record SecureDeviceResponse(
        Long deviceId,
        String deviceName,
        String deviceType,
        String icon,
        LocalDateTime createdAt,
        String createdBy,
        LocalDateTime modifiedAt,
        String modifiedBy,
        boolean active,
        Integer totalQuantity,
        java.util.List<RoomAllocationResponse> roomAllocations
) {
}