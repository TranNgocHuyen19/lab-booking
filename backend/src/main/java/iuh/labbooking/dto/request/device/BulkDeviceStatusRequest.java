package iuh.labbooking.dto.request.device;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record BulkDeviceStatusRequest(
        @NotEmpty(message = "List of device IDs cannot be empty")
        List<Long> ids,

        @NotNull(message = "Active status must be provided")
        Boolean active
) {}
