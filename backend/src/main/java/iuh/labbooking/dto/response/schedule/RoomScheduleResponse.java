package iuh.labbooking.dto.response.schedule;

import iuh.labbooking.dto.response.labroom.LabRoomDeviceResponse;
import lombok.Builder;

import java.util.List;

@Builder
public record RoomScheduleResponse(
                Long labRoomId,
                String roomName,
                String building,
                Integer capacity,
                List<LabRoomDeviceResponse> devices,
                List<DayScheduleResponse> schedule) {
}
