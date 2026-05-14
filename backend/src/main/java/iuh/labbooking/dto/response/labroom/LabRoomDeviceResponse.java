package iuh.labbooking.dto.response.labroom;

import iuh.labbooking.dto.response.device.DeviceResponse;

public record LabRoomDeviceResponse(
        DeviceResponse device,
        Integer quantity
) {}
