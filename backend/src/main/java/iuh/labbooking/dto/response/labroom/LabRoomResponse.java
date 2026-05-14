package iuh.labbooking.dto.response.labroom;

import java.util.List;

public record LabRoomResponse(
        Long labRoomId,
        String roomName,
        String building,
        Integer capacity,
        List<LabRoomDeviceResponse> devices
) {
}
