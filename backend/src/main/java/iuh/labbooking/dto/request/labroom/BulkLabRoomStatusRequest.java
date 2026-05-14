package iuh.labbooking.dto.request.labroom;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record BulkLabRoomStatusRequest(
        @NotNull(message = "Ids required")
        List<Long> ids,

        @NotNull(message = "Active status required")
        Boolean active
) {}
