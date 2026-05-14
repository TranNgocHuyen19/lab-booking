package iuh.labbooking.dto.request.researchgroup;

import iuh.labbooking.enums.MemberRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MemberInfoRequest(
        @NotBlank(message = "Username is required") String username,
        @NotNull(message = "Role is required") MemberRole role) {
}
