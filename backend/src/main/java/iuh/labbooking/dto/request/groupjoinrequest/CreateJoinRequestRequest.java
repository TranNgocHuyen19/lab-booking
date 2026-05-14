package iuh.labbooking.dto.request.groupjoinrequest;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateJoinRequestRequest(
        @NotNull(message = "Research group ID is required") Long researchGroupId,

        @Size(max = 500, message = "Message must be less than 500 characters") String message) {
}
