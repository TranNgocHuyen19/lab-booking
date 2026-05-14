package iuh.labbooking.dto.request.groupjoinrequest;

import jakarta.validation.constraints.Size;

public record UpdateJoinRequestStatusRequest(
        @Size(max = 500, message = "Response message must be less than 500 characters") String responseNote) {
}
