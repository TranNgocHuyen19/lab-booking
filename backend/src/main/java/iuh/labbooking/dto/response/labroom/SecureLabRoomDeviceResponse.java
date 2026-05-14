package iuh.labbooking.dto.response.labroom;

import iuh.labbooking.dto.response.device.SecureDeviceResponse;

public record SecureLabRoomDeviceResponse(
        SecureDeviceResponse device,
        Integer quantity
) {
}
