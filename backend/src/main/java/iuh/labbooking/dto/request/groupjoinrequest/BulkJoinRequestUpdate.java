package iuh.labbooking.dto.request.groupjoinrequest;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record BulkJoinRequestUpdate(
        @NotEmpty(message = "Request IDs list cannot be empty")
        List<Long> requestIds,
        
        String responseNote
) {}
