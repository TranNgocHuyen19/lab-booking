package iuh.labbooking.dto.request.researchgroup;

import iuh.labbooking.enums.MemberRole;
import jakarta.validation.constraints.NotNull;

public record UpdateMemberRoleRequest(
    @NotNull(message = "Username is required")
    String username,

    @NotNull(message = "Role is required")
    MemberRole role
) {}
