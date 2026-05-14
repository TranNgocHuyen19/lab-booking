package iuh.labbooking.dto.request.device;

import jakarta.validation.constraints.NotBlank;

public record DeviceRequest(
        @NotBlank(message = "Device name is required")
        String deviceName,

        @NotBlank(message = "Device type is required")
        String deviceType,

        String icon,

        Boolean active
        
) {}
