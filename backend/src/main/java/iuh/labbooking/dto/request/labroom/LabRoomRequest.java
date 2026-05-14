package iuh.labbooking.dto.request.labroom;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record LabRoomRequest(
        @NotBlank(message = "Room name is required")
        String roomName,

        String building,

        @NotNull(message = "Capacity is required")
        @Positive(message = "Capacity must be positive")
        Integer capacity,

        double longitude,
        double latitude,

        List<LabRoomDeviceRequest> devices
) {}
