package iuh.labbooking.dto.response.labroom;

import java.time.LocalDateTime;
import java.util.List;

public record SecureLabRoomResponse(
        Long labRoomId,
        String roomName,
        String building,
        Integer capacity,
        double longitude,
        double latitude,
        List<SecureLabRoomDeviceResponse> devices,
        LocalDateTime createdAt,
        String createdBy,
        LocalDateTime modifiedAt,
        String modifiedBy,
        boolean active
) {
}
