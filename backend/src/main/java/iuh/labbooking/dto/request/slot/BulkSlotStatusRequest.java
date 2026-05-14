package iuh.labbooking.dto.request.slot;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record BulkSlotStatusRequest(
        @NotEmpty(message = "List of slot IDs cannot be empty")
        List<Long> ids,

        @NotNull(message = "Active status must be provided")
        Boolean active
) {}
