package iuh.labbooking.dto.response.researchgroup;

import iuh.labbooking.enums.MemberRole;
import lombok.Builder;

@Builder
public record MemberInfoResponse(
        Long userId,
        String username,
        String fullName,
        MemberRole role) {
}
